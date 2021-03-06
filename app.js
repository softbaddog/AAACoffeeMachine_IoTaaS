const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require("./models/user");

const adminRouter = require('./routes/admin');
const productsRouter = require('./routes/products');
const devicesRouter = require('./routes/devices');

const cfg = require('./iotplatform/config');
const auth = require('./iotplatform/auth');
const sub = require('./iotplatform/sub');
const dis = require('./iotplatform/dis');

const app = express();

mongoose.connect('mongodb://localhost/AAA', {
  useNewUrlParser: true,
  useCreateIndex: true
});

mongoose.connection.once('open', () => {
  console.log("MongoDB connected success.");
  if (cfg.mode == 'hub') {
    dis.load();
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.locals.moment = require('moment');

app.use('/', adminRouter);
app.use('/product', productsRouter);
app.use('/device', devicesRouter);

auth.fetchAccessToken().then((loginInfo) => {
  if (cfg.mode == 'platform') {
    console.log("subscribe is coming...");
    sub.cleanAllSub(loginInfo).then(
      () => {
        for (const item of sub.notifyTypeList) {
          if (item.enabled) {
            sub.subscribe(loginInfo, item.notifyType);
          }
        }
      }
    );
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;