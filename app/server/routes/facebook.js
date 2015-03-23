module.exports = (function () {

  'use strict';

  var src = require(require('path').join(process.cwd(), 'src'));

  /**  Facebook
   *
   *  @function
   *  @description Route to handle Facebook login
   *  @return {Function} middleware
   *  @arg {Object} app - Express app 
   *  @arg {Object} synapp - Configuration
   *  @arg {Passport} passport
   */

  return (function facebookPassport (synapp, passport) {

    var app = this;

    var callback_url = synapp.facebook['callback url'];

    var User = src('models/User');

    var synappUser;
    
    function strategyMiddleware (req, res, next) {

      function onAccessToken (accessToken, refreshToken, profile, done) {

        function associateUser (error, user) {

          if ( error ) {
            return done(error);
          }

          else if ( user ) {
            synappUser = user;

            done(null, user);
          }

          else {
            User.create({ email: email, password: profile.id + Date.now() }, createUser);
          }
        }

        function createUser (error, user) {
          if ( error ) {
            if ( error.message && /duplicate/.test(error.message) ) {
              return done(new Error('Duplicate user'));
            }
            
            return next(error);
          }

          synappUser = user;
          
          done(null, user);
        }

        var email = profile.id + '@facebook.com';

        User.findOne({ email: email }, associateUser);

      }

      if ( ! app.locals.FacebookStrategy ) {
        app.locals.FacebookStrategy = require('passport-facebook').Strategy;

        var callback;

        if ( req.hostname === 'localhost' ) {
          callback = require('util').format("http://%s:%d%s",
            req.hostname, app.get('port'), synapp.facebook['callback url']);
        }

        else {
          callback = require('util').format("http://%s%s",
            req.hostname, synapp.facebook['callback url'])
        }

        passport.use(
          new app.locals.FacebookStrategy({
            clientID:       synapp.facebook['app id'],
            clientSecret:   synapp.facebook['app secret'],
            callbackURL:    synapp.facebook['callback url']
          },
          
          onAccessToken
        ));
      }

      next();
    }

    function callbackMiddleware (req, res, next) {

      function redirect (error, user, info) {
        if ( error ) {
          return next(error);
        }
        res.redirect('/sign/facebook/ok');
      }

      passport.authenticate('facebook', redirect)(req, res, next);
    }

    function okMiddleware (req, res, next) {
      res.cookie('synuser', {
          email: synappUser.email,
          id: synappUser.id
        }, synapp.cookie);

      res.redirect('/');
    }

    app.get(synapp.public.routes['sign in with Facebook'],
      strategyMiddleware,
      passport.authenticate('facebook'));

    app.get(callback_url, callbackMiddleware);

    app.get(synapp.public.routes['sign in with Facebook OK'], okMiddleware);
  });

})();
