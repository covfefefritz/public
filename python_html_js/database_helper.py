import sqlite3
from flask import g

DATABASE_URI = 'schema.db'

def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
    return db

def disconnect_db():
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()
        g.db = None

def close_db():
    get_db().close()

def tokenToEmail(token):
    try:
        cursor = get_db().execute("select email from loggedInUsers where token like ?", [token])
        row = cursor.fetchone()
        cursor.close()
        if row is not None:
            return row[0]
        else:
            return None
    except:
        return None

def getUser(email):
    c = get_db()
    cursor = c.execute("select firstname from users where email like ?", [email])
    rows = cursor.fetchone()
    cursor.close()
    if rows == None:
        return False
    else:
        return True

def addUser(json, pw_hash, salt):
    c = get_db()
    try:
        c.execute("insert into users (firstname, lastname, gender, city, country, email, password, hash, salt) values (?,?,?,?,?,?,?,?,?)", (json["firstname"],json["lastname"],json["gender"],json["city"],json["country"],json["email"], json["password"], pw_hash, salt))
        c.commit()
        return True
    except:
        return False


def getUserData(email):
    c = get_db().execute("select * from users where email like ?", [email])
    rows = c.fetchall()
    c.close()
    result = []
    for row in rows:
        result.append({"firstname": row[0], "lastname": row[1], "gender": row[2], "city": row[3], "country": row[4], "email": row[5]})
    return result

def addLoggedIn(email,token):
    c = get_db()
    try:
        c.execute("insert into loggedInUsers (email, token) values (?,?)", [email,token])
        c.commit()
        return True
    except:
        return False

def remLoggedIn(token):
    c = get_db()
    try:
        row = c.execute("select email from loggedInUsers where token is ?",[token]).fetchone()
        if row is not None:
            if row[0] is not None:
                c.execute("delete from loggedInUsers where token is ?", [token])
                c.commit()
                return True
        else:
            return False
    except:
        return False

def getPassword(email, password):
    cursor = get_db().execute("select password from users where email like ?", [email])
    row = cursor.fetchone()
    cursor.close()
    if row is not None:
        if row[0] == password:
            return True
        else:
            return False
    else:
        return False

def getHashData(email):
    cursor = get_db().execute("select hash,salt from users where email like ?", [email])
    row = cursor.fetchone()
    cursor.close()
    result = []
    for col in row:
        result.append(col)
    return result

def changePassword(email, newHash, newSalt):
    c = get_db()
    try:
        c.execute("update users set hash = ? where email like ?", [newHash, email])
        c.execute("update users set salt = ? where email like ?", [newSalt, email])
        c.commit()
        c.close()
        return True
    except:
        return False

def postMessage(fromEmail, toEmail, content, location):
    try:
        c = get_db()
        c.execute("insert into messages (sender_email, receiver_email, message, location) values (?,?,?,?)", [fromEmail, toEmail, content, location])
        c.commit()
        return True
    except:
        return False

def getUserMessagesByEmail(receiver):
    try:
        c = get_db().execute("select sender_email, message, location from messages where receiver_email like ?", [receiver])
        rows = c.fetchall()
        c.close()
        result = []
        for row in rows:
            result.append({"writer": row[0], "message": row[1], "location": row[2]})
        return result
    except:
        return None

def getTokens(email, token):
    try:
        c = get_db().execute("select token from loggedInUsers where email is ?", [email])
        rows = c.fetchall()
        c.close()
        result = []
        for row in rows:
            if row[0] != token:
                result.append(row[0])
        return result
    except:
        return None