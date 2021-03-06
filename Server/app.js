var express = require('express');
var path    = require('path');
var http    = require('http');
var https   = require('https');
var fs      = require('fs');
var favicon = require('serve-favicon');
var logger  = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
const formidable = require('express-formidable');
var jwt = require('jsonwebtoken');  
var expressJwt = require('express-jwt');

var index    = require('./routes/index');
var users    = require('./routes/userRouter.js');
var posts    = require('./routes/postRouter');
var comments = require('./routes/commentRouter');
var database = require('./config/config.js');

var app = express();

const whitelist = [ '/users/login', '/users/create' ];
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
var mySecret = 'Secret';
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {

    if (whitelist.indexOf(req.path) > -1) {
        console.log("ROUTE NOT PROTECTED, NEXT")
      next();
    } else {
    var auth = req.get("Authorization").substr(7);
    database('localhost', 'PLI', function(err, db) {
        if (err) throw err;
        db.models.tokens.find({token : auth},
            function(error, token) {
                if (error){
                    console.log('Erreur token', error.message)
                    res.status(500).send("Error token doesn't not exist")
                }
                else {
                  var date_now = new Date();
                  if (date_now <= token[0].expiration) {
                      console.log("LOGIN OK, NEXT")
                      next();
                  } else {
                    console.log("Your token as expire")
                    res.status(401).send({error: "Your token as expired"})
                  };
                }
            })
        });
    };
});

// app.use('/', index);
app.use(expressJwt({ secret: mySecret }).unless({ path: whitelist})); //Ne pas protéger le route /login
app.use('/posts', posts);
app.use('/users', users);
app.use('/comments', comments);

app.use(formidable({
    encoding: 'utf-8',
    uploadDir: './public/images'
}));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

//
// var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
// var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
//
// var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(app);
// var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080, function () {
    console.log('PLI listening on port 8080!');
});
//
// httpsServer.listen(8443, function () {
//     console.log('PLI listening on port 8443!');
// });

module.exports = app;
