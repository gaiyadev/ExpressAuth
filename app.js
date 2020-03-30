let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let ExpressSession = require('express-session');
let expressValidator = require('express-validator');
let messages = require('express-messages');
let flash = require('connect-flash');
let hbs = require('express-handlebars');
let multer = require('multer');
let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let expressFlash = require('express-flash');
let flash = require('express-flash-messages')
// var passport = require('passport');
// var localStrategy = require('passport-local').Strategy;
// var bodyParser= require('body-parser');
// var passportHttp = require('passport-http');
var nodemailer = require('nodemailer');


var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();

//app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/' }));
app.engine( 'hbs', hbs( { 
  extname: 'hbs', 
  defaultLayout: 'layout', 
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));


// SET STORAGE
var storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
 
app.use(flash())

const upload = multer({ 
  storage: storage
 }).single('profileImage');
//app.use(multer({dest: './uploads'}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(ExpressSession({
  secret: 'max', 
  saveUninitialized: false, 
  resave: false
 }));

// app.use(passport.initialize());
// app.use(passport.session());

app.use(expressFlash()); //flash message
 app.use(flash());

 // Custom flash middleware -- from Ethan Brown's book, 'Web Development with Node & Express'
app.use(function(req, res, next){
    // if there's a flash message in the session request, make it available in the response, then delete it
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});



//app.use(validator());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
   next();
});

//  app.use(expressValidator({
//   errorFormatter: function(param, msg, value) {
//     var namespace = param.split('.'),
//     root = namespace.shift(),
//     formParam = root;

//     while(namespace.length) {
//       formParam += '['+ namespace.shift() + ']';
//     }
//     return {
//       param:formParam,
//       msg:msg,
//       value:value
//     };
//   }
 
//  }));

app.use('/', indexRouter);
//app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
