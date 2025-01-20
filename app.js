var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mustacheExpress = require('mustache-express');
const sessions = require("express-session");
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });
const bcrypt = require("bcrypt");
const mariadb = require("mariadb");
const pg = require("pg");
require('dotenv').config()

const meinprojekt_pool = new pg.Pool({
    host: process.env.PG_DB_HOST,
    user: process.env.PG_DB_USER,
    password: process.env.PG_DB_PASSWORD,
    database: process.env.PG_DB_DATABASE,
    port: 5432,
    ssl: true
});


const pool = mariadb.createPool({
  host: process.env.MA_DB_HOST,
  user: process.env.MA_DB_USER,
  password: process.env.MA_DB_PASSWORD,
  database: process.env.MA_DB_DATABASE,
  connectionLimit: 5
});

const pool2 = pg.Pool;


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
const {Login} = require("./model/login");

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));  // Ordner für Views
app.set('view engine', 'mustache');  // Setze Mustache als Template-Engine
app.engine('mustache', mustacheExpress());  // Verwende mustache-express als Engine

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(
    sessions({
        secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
        saveUninitialized: true,
        cookie: { maxAge: 86400000, secure: false },
        resave: false
    })
);

app.use((req, res, next) => {
  req.pool = pool; // Der Pool wird der Anforderung hinzugefügt
  req.meinprojekt_pool = meinprojekt_pool;
  req.login = new Login(
      "users",
      ["email", "passwort"],
      pool
  );
    res.locals.search = req.query.search || ""; // Default to an empty string if no search query is provided
    req.upload = upload;
  next();
});

app.use('/', loginRouter);
app.use('/dashboard', indexRouter);
app.use('/users', usersRouter);


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
