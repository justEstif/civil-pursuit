'use strict';

import UserModel from 'syn/models/user';

function signIn (req, res, next) {

  try {

    let { email, password } = req.body;

    UserModel
      .identify(email, password)
      .then(
        user => {
          req.user = user;
          next();
        },
        error => {
          if ( /^User not found/.test(error.message) ) {
            res.statusCode = 404;
            res.json({ 'user not found': email });
          }
          else if ( /^Wrong password/.test(error.message) ) {
            res.statusCode = 401;
            res.json({ 'user not found': email });
          }
          else {
            next(error);
          }
        }
      );
  }

  catch ( error ) {
    next(error);
  }
}

export default signIn;
