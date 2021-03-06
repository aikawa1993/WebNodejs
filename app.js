var express = require("express");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var path = require("path");
var passport = require("passport");
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var morgan = require('morgan');
var connection   = require('./lib/dbconn');
var LocalStrategy = require('passport-local').Strategy;
var apiController = require("./controller/apiController");
var homeController = require("./controller/homeController");

var app = express();
app.use(cookieParser());
var port = 3000;
// app.use(session({secret: 'ssshhhhh'}));
app.set("view engine", "ejs");
app.use(express({secret:'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(session({ 
    secret : "secret",
    saveUninitialized: true,
    resave: true })); // session secret
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(passport.initialize()); // persistent login sessions
app.use(passport.session()); // use connect-flash for flash messages stored in session

// allow use css & bootstrap
app.use("/assets",express.static(__dirname + "/public"));
app.use("/allow",express.static(__dirname + "/css"));
app.use("/bs",express.static(__dirname + "/bootstrap/css"));
app.use("/jq",express.static(__dirname + "/Jquery"));
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine","ejs");
  
apiController(app);
homeController(app);
require('./routes.js')(app, passport, connection);

app.listen(port, function(){
    console.log("Sever is listening on PORT", port);
});





