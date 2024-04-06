let geoPos;
let socket;
let selectedTheme;
setUpSocket = function(token){
  socket = new WebSocket('ws://' + location.host + '/sessionValidation');
  socket.onopen = function(ev){
    console.log('#WS opened!');
    socket.send(token);
  }
  socket.onclose = function(ev){
    console.log('#WS closed!');
  }
  socket.onmessage = function(ev){
    console.log("#Message event occured: " + ev.data);
    logout();
  }
}

function getLocation(){
  // OBS! For this to work over HTTP following needs to be set in chrome based browsers
  // chrome://flags/#unsafely-treat-insecure-origin-as-secure
  // http://192.168.1.189:5000/
  let locationElement = document.getElementById("geolocation");
  console.log("Getting location");
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(savePosition);
  }
  else{
    locationElement.innerHTML = "Geolocation not supported."
  }
}

function savePosition(position){
  // let locationElement = document.getElementById("geolocation");
  geoPos = position.coords.latitude + ',' + position.coords.longitude;
  // locationElement.innerHTML = "Latitude: " + position.coords.latitude +
  // ", Longitude: " + position.coords.longitude;
}

// function showError(error) {
//   let locationElement = document.getElementById("geolocation");
//   switch(error.code) {
//     case error.PERMISSION_DENIED:
//       locationElement.innerHTML = "User denied the request for Geolocation."
//       break;
//     case error.POSITION_UNAVAILABLE:
//       locationElement.innerHTML = "Location information is unavailable."
//       break;
//     case error.TIMEOUT:
//       locationElement.innerHTML = "The request to get user location timed out."
//       break;
//     case error.UNKNOWN_ERROR:
//       locationElement.innerHTML = "An unknown error occurred."
//       break;
//   }
// }


onload = function(){
  selectedTheme = this.localStorage.getItem("theme");
  if((localStorage.getItem("token") == '') || (localStorage.getItem("token") == null)){
    navigateToView("welcomeview");
  }
  else {
    navigateToView("profileview");
    loaduserdata('');
    document.getElementById("homeTab").click();
    setUpSocket(localStorage.getItem("token"));
  }
}

onunload = function(){
  logout();
}

function changeTheme(event){
  let bodyElement = document.body.style;
  let flexboxes = document.getElementsByClassName("flexbox");
  let loginform = document.getElementsByClassName("loginform");
  let signupform = document.getElementsByClassName("signupform");
  let tabheader = document.getElementById('tabheader');
  let tabTitle = document.getElementById('tabTitle');

  if(event != true){
    if(event.target.innerHTML == "Dark"){     
      selectedTheme = "dark";
      console.log("Changed to dark theme");
    }
    else if(event.target.innerHTML == "Light"){
      selectedTheme = "light";
      console.log("Changed to light theme");
    }
    else if(event.target.innerHTML == "Spook"){
      selectedTheme = "spook";
      console.log("Changed to spook theme");
    }
    localStorage.setItem("theme", selectedTheme); 
  }

  if((localStorage.getItem("token") == '') || (localStorage.getItem("token") == null)){
    if(selectedTheme == "dark"){
      bodyElement.removeProperty("background-image");
      bodyElement.backgroundColor = "#212121";
      loginform[0].style.color = "white";
      loginform[0].style.backgroundColor = "#424242";
      signupform[0].style.color = "white";
      signupform[0].style.backgroundColor = "#424242";
    }
    else if(selectedTheme == "light"){
      bodyElement.removeProperty("background-image");
      bodyElement.backgroundColor = "lightblue";
      loginform[0].style.color = "black";
      loginform[0].style.backgroundColor = "white";
      signupform[0].style.color = "black";
      signupform[0].style.backgroundColor = "white";
    }
    else if(selectedTheme == "spook"){
      bodyElement.backgroundImage = "url(static/doot.gif)";
      loginform[0].style.color = "white";
      loginform[0].style.backgroundColor = "#424242";
      signupform[0].style.color = "white";
      signupform[0].style.backgroundColor = "#424242";
    }
  }
  else{
    if(selectedTheme == "dark"){
      bodyElement.removeProperty("background-image");
      bodyElement.backgroundColor = "#212121";
      tabheader.style.backgroundColor = "#424242";
      tabTitle.style.color = "white";
      for(i=0; i<flexboxes.length; i++){
        flexboxes[i].style.backgroundColor = "#424242";
        flexboxes[i].style.color = "white";
      }
    }
    else if(selectedTheme == "light"){
      bodyElement.removeProperty("background-image");
      bodyElement.backgroundColor = "lightblue";
      tabheader.style.backgroundColor = "#8FBAC8";
      tabTitle.style.color = "black";
      for(i=0; i<flexboxes.length; i++){
        flexboxes[i].style.backgroundColor = "#8FBAC8";
        flexboxes[i].style.color = "black";
      }
    }
    else if(selectedTheme == "spook"){
      bodyElement.backgroundImage = "url(static/doot.gif)";
      tabheader.style.backgroundColor = "#424242";
      tabTitle.style.color = "white";
      for(i=0; i<flexboxes.length; i++){
        flexboxes[i].style.backgroundColor = "#424242";
        flexboxes[i].style.color = "white";
      }
    }
  }
}

function navigateToView(name){
  let thediv = document.getElementById("welcome");
  thediv.innerHTML = document.getElementById(name).textContent;
  if(name == "profileview"){
    loaduserdata('');
    getLocation();
    document.getElementById("homeTab").click();
  }
  changeTheme(true);
}

checkpw = function(firstID, secondID){
  let first = document.getElementById(firstID);
  let second = document.getElementById(secondID);
  // console.log(first.value);
  // console.log(second.value);

  if((first.value == '') || (second.value == '')){
    return {"success": false, "message": "Password field empty."};
  }
  else if((first.value == '') && (second.value == '')){
    return {"success": false, "message": "Password field empty."};
  }
  else if(first.value != second.value){
    return {"success": false, "message": "Passwords must be matching."};
  }
  else{
    return {"success": true, "message": ""};
  }
}

function resetValidity(caller){
  let classes = caller.className.split(" ");
  for(i=0;i<classes.length;i++){
    if(classes[i] == "loginform"){
      let emailField = document.getElementById("login_email");
      emailField.setCustomValidity('');
    }
    else if(classes[i] == "signupform"){
      let pwdField = document.getElementById("password2");
      pwdField.setCustomValidity('');
    }
    else if(classes[i] == "changepwform"){
      let pwdNew = document.getElementById("newpw2");
      pwdNew.setCustomValidity('');
    }
  }
}

openTab = function(evt, tab){
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  let tabs = document.getElementsByClassName("tab");
  for (i = 0; i < tabs.length; i++) {
    tabs[i].className = tabs[i].className.replace(" active", "");
  }

  document.getElementById("tabTitle").innerHTML = "Twidder: " + tab;
  document.getElementById(tab).style.display = "flex";
  evt.currentTarget.className += " active";
}

function forgotPass(){
  let email = document.getElementById("login_email");
  if(email.value == '' || typeof email == "undefined"){
    email.setCustomValidity("Enter email address");
    email.reportValidity();
  }
  else{
    let request = new XMLHttpRequest();
    request.open("POST","/users/forgotpassword",true);
    request.setRequestHeader("Content-Type","application/json;charset=UTF-8");
    request.onreadystatechange = function(){
      if(request.readyState == 4){
        let result = JSON.parse(request.responseText);
        email.setCustomValidity(result.message);
        email.reportValidity();
      }
    }
    request.send(JSON.stringify({"email":email.value}));
  }
}

function signInClient(ret){  
  let formobj = document.getElementsByClassName("loginform")[0];
  let emailField = document.getElementById("login_email");
  let request = new XMLHttpRequest();
  let token = "";
  request.open("POST","/users/signin",true);
  request.setRequestHeader("Content-Type","application/json;charset=UTF-8");
  request.onreadystatechange = function(){
    if(request.readyState == 4){
      result = JSON.parse(request.responseText)
      if(result.success){
        token = request.getResponseHeader('Authorization');
        localStorage.setItem("token", token);
        setUpSocket(token);
        navigateToView("profileview");
      }
      else if(typeof ret == 'undefined'){
        emailField.setCustomValidity(result.message);
        emailField.reportValidity();
      }
      console.log(result.message);
    }
  }
  let dataobj = {
    email: formobj.login_email.value,
    password: formobj.password.value
  };
  if(typeof ret !== 'undefined'){
    let singupform = document.getElementsByClassName("signupform")[0];
    dataobj = {
      email: singupform.signup_email.value,
      password: singupform.password1.value
    }
  }
  request.send(JSON.stringify(dataobj));
  return token;
}

function signUpClient(){
  console.log("running signUpClient");
  let passcheck = checkpw("password1", "password2");
  let pwdField = document.getElementById("password2");
  let request = new XMLHttpRequest();
  if (passcheck.success){
    let formobj = document.getElementsByClassName("signupform")[0];
    let dataobj = {
      email: formobj.signup_email.value,
      password: formobj.password2.value,
      firstname: formobj.firstname.value,
      lastname: formobj.lastname.value,
      gender: formobj.gender.value,
      city: formobj.city.value,
      country: formobj.country.value
    }

    request.open("PUT", "/users/signup", true);
    request.setRequestHeader("Content-Type","application/json;charset=UTF-8");
    request.onreadystatechange = function(){
      if(request.readyState == 4){
        result = JSON.parse(request.responseText)
        if(result.success){
          let signinResult = signInClient("return");
          localStorage.setItem("token", signinResult);
          navigateToView("profileview");
        }
        else{
          pwdField.setCustomValidity(result.message);
          pwdField.reportValidity();
        }
        console.log(result.message);
      }
    }
    request.send(JSON.stringify(dataobj));
  }
  else
  {
    pwdField.setCustomValidity(passcheck.message);
    pwdField.reportValidity();
    console.log(passcheck.message);
  }
}

logout = function(){
  let request = new XMLHttpRequest(); 
  request.open("POST", "/users/signout", true);
  let token = localStorage.getItem("token");
  request.setRequestHeader("Authorization", token);
  request.onreadystatechange = function(){
    if(request.readyState == 4){
      result = JSON.parse(request.responseText)
      console.log(result.message);
      localStorage.setItem("token", "");
      if(typeof socket != "undefined"){
        socket.close()
      }
      navigateToView("welcomeview");
    }
  }
  request.send(null);
}

changePasswordClient = function(){
  let request = new XMLHttpRequest;
  let passres = checkpw("newpw1", "newpw2");
  let pwdNew = document.getElementById("newpw2");
  let pwdOld = document.getElementById("changepw");

  console.log(passres.success, passres.message);
  if(passres.success){
    let token = localStorage.getItem("token");
    let dataobj = {
      oldPassword: pwdOld.value,
      newPassword: pwdNew.value
    };
    request.open("POST", "/users/change_password", true);
    request.setRequestHeader("Authorization", token);
    request.setRequestHeader("Content-Type","application/json;charset=UTF-8");
    request.onreadystatechange = function(){
      if(request.readyState == 4){
        result = JSON.parse(request.responseText);
        if(result.success){
          pwdNew.setCustomValidity(result.message);
          pwdNew.reportValidity();
          console.log(result.message);
        }
      }
    }
    request.send(JSON.stringify(dataobj));
  }
  else{
    pwdNew.setCustomValidity(passres.message);
    pwdNew.reportValidity();
    console.log(passres.message);
  }
}

loaduserdata = function(email){
  let request = new XMLHttpRequest(); 
  let target;
  let token = localStorage.getItem("token");
  let data = [];
  if(email == ''){
    request.open("GET", "/users/get_data_by_token", true);
    target = document.getElementById("personalinfo");
  }
  else{
    document.getElementById('browsePost').placeholder = "Post something to " + document.getElementById('usr').value;
    request.open("GET", "/users/get_data_by_email/"+email, true);
    target = document.getElementById("searchRes");
  
    document.getElementById("newpostBrowse").style.display = "block";
    document.getElementById("browseWall").style.display = "block";
    document.getElementById("browseWallRefresh").style.display = "block";
  }
  request.setRequestHeader("Authorization", token);
  request.onreadystatechange = function(){
    if(request.readyState == 4){
      result = JSON.parse(request.responseText);
      if(result.success){
        data = result.data;
        target.innerHTML = "<h3>Personal details</h3>" +
                          "<p><strong>Email:</strong> " + data['email'] + "</p>" +
                          "<p><strong>First name:</strong> " + data['firstname'] + "</p>" +
                          "<p><strong>Last name:</strong> " + data['lastname'] + "</p>" +
                          "<p><strong>Gender:</strong> " + data['gender'] + "</p>" +
                          "<p><strong>City:</strong> " + data['city'] + "</p>" +
                          "<p><strong>Country:</strong> " + data['country'] + "</p>";
      } 
    }
  }
  request.send(null);
  printwall(token, email);
}

printwall = function(token, email){
  let target;
  let data;
  let request = new XMLHttpRequest();
  if(email == '' || email == null){
    request.open("GET", "/users/get_msg_by_token", true);
    target = document.getElementById("wall");
  }
  else{
    request.open("GET", "/users/get_msg_by_email/"+email, true);
    target = document.getElementById("browseWall");
  }
  request.setRequestHeader("Authorization", token);
  request.onreadystatechange = function(){
    if(request.readyState == 4){
      target.innerHTML = '';
      // console.log("printwall");
      result = JSON.parse(request.responseText);
      if(result.success){
        data = result.data;
        console.log(data);
        for(c of data){
          target.innerHTML += "<em>"+c.location+"</em><br>" +
                              "<p>" +
                              "<strong> " + c.writer + ": </strong>" + 
                              c.message + 
                              "</p>";
        }
      }
      console.log(result.message);
    }
  }
  request.send(null);
}

posttowall = function(post, email){
  let request = new XMLHttpRequest();
  let token = localStorage.getItem("token");
  // console.log("Location: " + geoPos);
  let dataobj = {
    toEmail: email,
    location: geoPos,
    message: post
  };
  request.open("POST", "/users/post", false); //kolla om den får vara sync
  request.setRequestHeader("Authorization", token);
  request.setRequestHeader("Content-Type","application/json;charset=UTF-8");
  request.onreadystatechange = function(){
    if(request.readyState == 4){
      result = JSON.parse(request.responseText);
      console.log(result.message);
    }
  }
  request.send(JSON.stringify(dataobj));
  printwall(token, email);
}