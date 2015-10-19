'use strict';

import { Domain }           from 'domain';
import UserModel            from '../models/user';
import DiscussionModel      from '../models/discussion';

function signUp (req, res, next) {

  try {

    const { email, password } = req.body;

    let cb = (error, user) => {
      if ( error ) {
        if ( /duplicate key/.test(error.message) ) {
          res.statusCode = 401;
          res.json({ error: 'username exists' });
        }
        else {
          next(error);
        }
      }

      else {
        req.user = user;

        next();
      }
    }

    UserModel
      .create({ email, password })
      .then(
        user => {
          DiscussionModel
            .findOne()
            .then(
              discussion => {
                try {
                  discussion.registered.push(user._id);
                  discussion.save(error => {
                    if ( error ) {
                      cb(error);
                    }
                    cb(null, user);
                  });
                }
                catch ( error ) {
                  cb(error);
                }
              },
              cb
            );
        },
        cb
      );
  }

  catch ( error ) {
    next(error);
  }

}

export default signUp;
