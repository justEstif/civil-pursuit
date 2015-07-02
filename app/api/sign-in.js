! function () {

  'use strict';

  

  function signIn (credentials) {

    var socket = this;

    require('syn/lib/domain')(

      function (error) {
        socket.app.arte.emit('error', error);
      },

      function (domain) {
        require('syn/models/user')
          .identify(credentials.email, credentials.password,
            domain.intercept(function (user) {
              
              if ( user ) {
                socket.emit('identified', user);
              }

            }));
      }

    );

  }

  module.exports = signIn;

} ();
