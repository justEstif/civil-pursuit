'use strict';

import bcrypt from 'bcrypt';

function isPasswordValid (requestPassword, realPassword) {
  return new Promise((ok, ko) => {
    bcrypt.compare(requestPassword, realPassword, (error, isValid) => {
      if ( error ) {
        return ko(error);
      }
      ok(isValid);
    });
  });
}

export default isPasswordValid;