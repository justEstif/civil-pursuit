'use strict';

import fixtures from '../../../../fixtures/criteria/1.json';
import Mungo from 'mungo';

const collection = 'criterias';

class V2 {
  static schema () {
    return {
      "name"          : 	{
        type          :   String,
        required      :   true
      },
      "description"   : 	{
        type          :   String,
        required      :   true
      }
    };
  }
  
  static do () {
    return new Promise((ok, ko) => {
      try {
        this.find({ __V : 2 }, { limit : false })
          .then(
            documents => {
              try {
                if ( documents.length ) {
                  return ok();
                }
                this
                  .create(fixtures)
                  .then(
                    created => {
                      try {
                        Mungo.Migration
                          .create({
                            collection,
                            version : 2,
                            created : created.map(doc => doc._id)
                          })
                          .then(ok, ko);
                      }
                      catch ( error ) {
                        ko(error);
                      }
                    },
                    ko
                  );
              }
              catch ( error ) {
                ko(error);
              }
            },
            ko
          );
      }
      catch ( error ) {
        ko(error);
      }
    });
  }

  static undo () {
    return Mungo.Migration.undo(this, 2, collection);
  }
}

export default V2;