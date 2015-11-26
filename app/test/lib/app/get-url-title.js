'use strict';

import should               from 'should';
import describe             from '../../../lib/util/describe';
import getUrlTitle          from '../../../lib/app/get-url-title';

function test () {

  const locals = {};

  return describe ( 'Lib / App / Get URL Title' , [

    {
      'should get title' : (ok, ko) => {

        getUrlTitle('http://example.com')
          .then(
            res => {
              locals.title = res;
              ok();
            },
            ko
          );

      }
    },

    {
      'should be the right title' : (ok, ko) => {

        try {
          locals.title.should.be.exactly('Example Domain');
          ok();
        }
        catch ( error ) {
          ko(error);
        }

      }
    }

  ] );

}

export default test;
