import json
from flask import Flask, make_response, request
import http.client, urllib.parse
from flask_sock import Sock
from flask_mail import Mail, Message
from flask_bcrypt import Bcrypt
import database_helper as db_helper;
import string, secrets, random

app = Flask(__name__)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'twidder.dev.2@gmail.com'
app.config['MAIL_PASSWORD'] = 'wrRd7GvWcfTag^a*'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_DEFAULT_SENDER'] = 'twidder.dev.2@gmail.com'

bcrypt = Bcrypt(app)
mail = Mail(app)
socket = Sock(app)

ws_dict = {}

if(__name__ == '__main__'):
    app.run(host="0.0.0.0")


@app.route('/users/forgotpassword', methods=['POST'])
def reset_password():
    json = request.get_json()
    newpass = ''.join(random.choice(string.ascii_letters) for i in range(8))
    if db_helper.getUser(json['email']):
        send_email("Twidder: Password Reset", "New password: " + newpass, json['email'])
        ##
        salt = ''.join(secrets.choice(string.ascii_letters) for i in range(32)) #CSPRNG creation of random salt with secrets
        pwHash = bcrypt.generate_password_hash(newpass + salt)
        db_helper.changePassword(json['email'], pwHash, salt)
        ##
        return {'success': True, 'message': "New password sent"}, 200
    else:
        return {'success': False, 'message': "No such user"}, 401

def send_email(subject, body, recipient_email, html=None):
    """
    Send an email with given subject and body to given recipient.
    """
    if html is None:
        html = body
    with app.app_context():
        mail_default_sender = app.config["MAIL_DEFAULT_SENDER"]
        message = Message(
            sender="Twidder <%s>" % mail_default_sender,
            body=body,
            html=html,
            subject=subject,
            recipients=[recipient_email]
        )
        mail.send(message)

@socket.route('/sessionValidation')
def sessionValidation(ws):
    # ws_dict grows forever, might need to fix
    while True:
        token = ws.receive()
        ws_dict[token] = ws
        token_email = db_helper.tokenToEmail(token)
        result = db_helper.getTokens(token_email, token)
        for token in result:
            try:
                ws_dict[token].send("Session Invalidated")
            except:
                ws.send("Key error")

@app.teardown_request
def after_request(exception):
    db_helper.disconnect_db()

@app.route('/', methods = ['GET'])
def root():
    return app.send_static_file("client.html")

# @app.route("/users/geolocateAPI", methods=['POST'])
def geolocateAPI(position):
    conn = http.client.HTTPConnection('geocode.xyz')
    params = urllib.parse.urlencode({
        'auth': '1391680644199759912x8511',
        'locate': position,
        'region': 'Europe,Oceania,Asia,US,CA,MX',
        'json': 1,
        })
    conn.request('GET', '/?{}'.format(params))
    res = conn.getresponse()
    data = res.read()
    response = json.loads(data.decode('utf-8'))
    return response


@app.route("/users/signin", methods=['POST'])
def sign_in(): # DONE
    json = request.get_json()
    ##
    if db_helper.getUser(json["email"]):
        hashData = db_helper.getHashData(json["email"])
        if bcrypt.check_password_hash(hashData[0], json["password"] + hashData[1]):
            token = ''.join(random.choice(string.ascii_letters) for i in range(32))
            if db_helper.addLoggedIn(json["email"], token):
                obj = {'success': True, 'message': 'Successfully signed in.'}
                response = make_response(obj)
                response.headers['Authorization'] = token
                return response, 201
            else:
                return {'success':False, 'message':'Unable to sign in, user already signed in'}, 409
        else:
            return {'success':False, 'message':'Wrong username or password'}, 400
    else:
        return {'success':False, 'message':'No such user'}, 400

@app.route("/users/signup", methods=['PUT'])
def sign_up(): #DONE
    json = request.get_json()
    if 'email' in json and 'password' in json and 'firstname' in json and 'lastname' in json and 'city' in json and 'country' in json and 'gender' in json:
        if len(json['email'])>3 and len(json['password'])>4:
            salt = ''.join(secrets.choice(string.ascii_letters) for i in range(32)) #CSPRNG creation of random salt with secrets
            pwHash = bcrypt.generate_password_hash(json['password'] + salt) 
            if db_helper.addUser(json, pwHash, salt):
                return {'success': True, 'message': 'Successfully created a new user.'}, 201
            else:
                return {'success':False, 'message':'User already exists.'}, 409
        else:
            return {'success':False, 'message':'Email or password too short.'}, 400
    else:
        return {'success':False, 'message':'Form data missing or incorrect type.'}, 400

@app.route('/users/signout', methods = ['POST'])
def sign_out(): #DONE
    if 'Authorization' in request.headers:
        token = request.headers['Authorization']
        # ws_dict.pop(token)

        if db_helper.remLoggedIn(token):
            return {'success':True, 'message':'Successfully signed out.'}, 200
        else:
            return {'success': False, 'message': 'You are not signed in.'}, 401
    else:
        return {'success': False, 'message': 'Token not specified'}, 401

@app.route('/users/change_password', methods = ['POST'])
def change_password():
    if 'Authorization' in request.headers:
        token = request.headers['Authorization']
    else:
        return {'success': False, 'message': 'Token not specified'}, 401
    json = request.get_json()
    email = db_helper.tokenToEmail(token)
    if email is not None:
        if (json['oldPassword'] != None) and (len(json['newPassword'])>3):
            hashData = db_helper.getHashData(email)
            if bcrypt.check_password_hash(hashData[0], json["oldPassword"] + hashData[1]):
                
                newSalt = ''.join(secrets.choice(string.ascii_letters) for i in range(32))
                newpwHash = bcrypt.generate_password_hash(json['newPassword'] + newSalt)
                
                if db_helper.changePassword(email, newpwHash, newSalt):
                    return {'success': True, 'message': "Password changed."}, 200
                else:
                    return {'success': False, 'message': "Failed to change password"}, 500
            else:
                return {'success': False, 'message': "Wrong password."}, 400
        else:
            return {'success': False, 'message': 'Password is too short'}, 400
    else:
        return {'success': False, 'message': 'You are not logged in.'}, 401

@app.route('/users/get_data_by_email/<email>', methods = ['GET'])
def get_user_data_by_email(email):
    if 'Authorization' in request.headers:
        token = request.headers['Authorization']
    else:
        return {'success': False, 'message': 'Token not specified'}, 401
    if db_helper.tokenToEmail(token) is not None:
        if db_helper.getUser(email):
            json_data = db_helper.getUserData(email)
            return {"success": True, "message": "User data retrieved", "data": json_data[0]}, 200
        else:
            return {"success": False, "message": "No such user."}, 400
    else:
        return {"success": False, "message": "You are not signed in."}, 401

@app.route('/users/get_data_by_token', methods = ['GET'])
def get_user_data_by_token():
    if 'Authorization' in request.headers:
        token = request.headers['Authorization']
    else:
        return {'success': False, 'message': 'Token not specified'}, 401
    if token is not None:
        email = db_helper.tokenToEmail(token)
        return get_user_data_by_email(email)

@app.route('/users/get_msg_by_email/<email>', methods = ['GET'])
def get_user_messages_by_email(email):
    if 'Authorization' in request.headers:
        token = request.headers['Authorization']
    else:
        return {'success': False, 'message': 'Token not specified'}, 401
    if db_helper.tokenToEmail(token) is not None:
        if db_helper.getUser(email):
            messages = db_helper.getUserMessagesByEmail(email)
            return {"success": True, "message": "User data retrieved", "data": messages}, 200
        return {"success": False, "message": "No such user."}, 400
    else:
        return {"success": False, "message": "You are not signed in."}, 401

@app.route('/users/get_msg_by_token', methods = ['GET'])
def get_user_messages_by_token():
    if 'Authorization' in request.headers:
        token = request.headers['Authorization']
    else:
        return {'success': False, 'message': 'Token not specified'}, 401
    if token is not None:
        receiver = db_helper.tokenToEmail(token)
        return get_user_messages_by_email(receiver)

@app.route('/users/post', methods = ['POST'])
def post_message():
    json = request.get_json()
    locationData = geolocateAPI(json["location"])
    location = locationData['city'] + ", " + locationData['prov']
    if 'Authorization' in request.headers:
        token = request.headers['Authorization']
    else:
        return {'success': False, 'message': 'Token not specified'}, 401
    fromEmail = db_helper.tokenToEmail(token)
    if json['toEmail'] != "":
        toEmail = json['toEmail']
    else:
        toEmail = fromEmail
    if fromEmail != None:
        if db_helper.getUser(toEmail):
            if db_helper.postMessage(fromEmail, toEmail, json['message'], location):
                return {"success": True, "message":"Message posted"}, 201
        else:
            return {"success": False, "message":"No such user."}, 400
    else:
        return {"success": False, "message":"You are not signed in."}, 401
