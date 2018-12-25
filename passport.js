const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require("../models/user.js");

passport.use('local.register', new LocalStrategy({
  usernameField: "username",
  passwordField: "password",
  passReqToCallback: true
}, function (username, password, done) {
  User.findOne({
    username: username
  }, function (err, user) {
    if (err) {
      return done(err);
    }

    if (user) {
      return done(null, false, {
        message: '用户名重复'
      });
    }

    const newUser = new User({
      username: username,
      password: password
    });
    newUser.save(function (err, result) {
      if (err) {
        return done(err);
      }
      return done(null, newUser);
    });
  });
}));

passport.use('local.login', new LocalStrategy({
  usernameField: "username",
  passwordField: "password",
  passReqToCallback: true
}, function (username, password, done) {
  User.findOne({
    username: username
  }, function (err, user) {
    if (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false, {
        message: "Unkown User"
      });
    }

    if (!user.authenticate(password)) {
      return done(null, false, {
        message: 'Invalid Password'
      });
    }
    return done(null, user);
  });
}));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findbyId(id, function (err, user) {
    done(err, user);
  });
});