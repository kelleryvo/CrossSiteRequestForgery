var express = require('express');
var app = express();

app.set('view engine', 'ejs')

//Cookie Parser
var cookieParser = require('cookie-parser')
app.use(cookieParser());

//Initialize
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var session = require('express-session');
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

//Session Function
app.use(session({
  secret: 'some kind of secret key',
  cookie: { maxAge: 24*60*60*1000 }
}));

//Function to Check if User is logged in
function isLoggedIn(req, res, next) {
  if (req.session.authenticated === true) {
      next();
  } else {
      res.redirect('/login');
  }
}

//DB Connection
var db = require('./db');
var con = db.con;

//Manage Requested Static Files
app.use('/assets', express.static('assets'));
app.use('/data', express.static('data'));

//Manage Routes
app.get('/', isLoggedIn, function(req, res){
  var sess = req.session;
  res.render('index', {session: sess});
});

//### Encryption
var bcrypt = require('bcrypt');

app.get('/register', function(req, res){
  res.render('register', {errors: ''});
});

app.post('/register', urlencodedParser, function(req, res){
  var msg = '';
  var state = true;
  var password, username;

  if(req.body.username && req.body.password){
    //VARS
    username = querystring.escape(req.body.username);
    password = querystring.escape(req.body.password);
    var password_repeat = querystring.escape(req.body.password_repeat);

    //Username Check
    if(username.length >= 3){
    } else {
      msg += "- The username needs to be at least 3 characters long!"
      state = false;
    }

    //Password Check
    if(password.length >= 4){
      if(password_repeat == password){
        //Everthing OK
      } else {
        msg += "- The passwords don't match!"
        state = false;
      }
    } else {
      msg += "- The password has to be at least 4 characters long!"
      state = false;
    }
  } else {
    msg += "- Some fields are empty!"
    state = false;
  }

  //Encrypt Password
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);

  //Wenn Status = True
  if(state == true){
    //Try to Register User
    var sql_query = 'INSERT INTO tbl_user(username, password) VALUES("' + username + '","' + hash + '")';
    db.executeRead(sql_query, function(val){
      msg += 'Successfully registered! You can now log in.';
      var feedback = '<p class="label label-success error">' + msg + '<p>';

      if(msg = ''){
        feedback = '';
      }

      console.log('Msg: ' + msg);
      res.render('register', {errors: feedback});
    });
  } else {
    var feedback = '<p class="label label-danger error">' + msg + '<p>';

    if(msg = ''){
      feedback = '';
    }
    console.log('Msg: ' + msg)
    res.render('register', {errors: feedback});
  }
});

app.get('/login', function(req, res){
  res.render('login', {errors: ''});
});

app.post('/login', urlencodedParser, function(req, res){
  var sess = req.session
  sess.authenticated = false;

  if(req.body.username && req.body.password){
    //VARS
    var username = querystring.escape(req.body.username);
    var password = querystring.escape(req.body.password);

    console.log('SQL INJ: ' + username);

    var sql_query = 'SELECT * FROM tbl_user WHERE username = "' + username + '"';
    db.executeRead(sql_query, function(val){

      if(val.length === 0){
        //No Result
        console.log('Account doenst exist.');
        res.render('login', {errors: '<p class="label label-danger error">This account doesnt exist!</p>'});
      } else {
        //Account found
        var hash = val[0].password;
        if(bcrypt.compareSync(password, hash)){
          sess.authenticated = true;

          sess.username = val[0].username;
          sess.userid = val[0].id;

          //Create Cookie for later Access
          res.cookie('user', sess.username, {
            maxAge: 900000,
            httpOnly: true
          });

          console.log('User signed in.' + sess.authenticated);
          res.redirect('/');
        } else {
          res.render('login', {errors: '<p class="label label-danger error">Wrong password!</p>'});
        }
      }
    });
  } else {
    //Not all Parameters Given / False
    res.render('login', {errors: '<p class="label label-danger error">Invalid login credentials!</p>'});
  }
});

app.get('/change_password', function(req, res){
  res.render('change_password', {errors: ''});
});

app.post('/change_password', urlencodedParser, function(req, res){
  var sess = req.session

  if(req.body.password && req.body.password_repeat){
    //VARS
    var password = querystring.escape(req.body.password);
    var password_repeat = querystring.escape(req.body.password_repeat);

    console.log('CSRF: Request to change password to ' + password + ' / ' + password_repeat);

    res.render('change_password', {errors: '<div class="well">CSRF: Request to change password to ' + password + ' / ' + password_repeat + '</div>'});
  } else {
    //Not all Parameters Given / False
    res.render('change_password', {errors: '<span class="label label-default">Invalid login credentials!</span>'});
  }
});

app.get('/logout', function(req, res){
  var sess = req.session

  sess.authenticated = false;
  sess.username = null;
  sess.userid = null;

  console.log('After Logout: ' + req.session.authenticated);
  res.redirect('/login');
});

app.get('/csrf', function(req, res){
  res.sendFile('/Users/yvokeller/Development/CSRF/index.html');
});

//The 404 Route
app.get('*', function(req, res){
  res.status(404);
  res.render('404');
});

//WEBSOCKET
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
//var sio = require('socket.io')(server);
var users;
users = [];
var connections
connections = [];

server.listen(process.env.PORT || 8888);
console.log('Server started. Listening on Port 8888')

//Web Sockets
io.sockets.on('connection', function(socket){
  //Add to Connections
  connections.push(socket);
  console.log('Connected: %s sockets.', connections.length);

  //Emit Welcome Message
  socket.emit('new message', {username: 'StreamDream', msg: 'Welcome to the chat room!'});

  //Disconnect
  socket.on('disconnect', function(data){
    connections.splice(connections.indexOf(socket),  1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });

  //SendMessage
  socket.on('send message', function(data){
      if(data == ''){
        //Empty Message
      } else {
        io.sockets.emit('new message', {username: data.username, msg: data.msg});
      }
  });
});
