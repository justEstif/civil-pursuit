'use strict';

import { EventEmitter } from 'events';
import mongodb from 'mongodb';

class Mung {

  static validate (value, type, convert = false ) {
    try {
      if ( Array.isArray(type) ) {
        if ( ! Array.isArray(value) ) {
          return false;
        }

        if ( type.length === 1 ) {
          return value
            .map(value => this.validate(value, type[0], convert))
            .every(value => value);
        }

        else if ( value.length !== type.length ) {
          return false;
        }

        else {
          return value
            .map((value, index) => this.validate(value, type[index], convert))
            .every(value => value);
        }
      }

      if ( type === String ) {
        type = _String;
      }

      else if ( type === Number ) {
        type = _Number;
      }

      else if ( type === Boolean ) {
        type = _Boolean;
      }

      else if ( type === Object ) {
        type = _Object;
      }

      else if ( type === Date ) {
        type = _Date;
      }

      if ( ! type ) {
        throw new Error('Type not found');
      }

      if ( convert && type.convert ) {
        value = type.convert(value);
      }

      if ( typeof type.validate !== 'function' ) {
        throw new Error(`Missing type validation for type ${type}`);
      }

      return type.validate(value);
    }
    catch ( error ) {
      return false;
    }
  }

  static convert (value, type) {

    // console.log('------------------')
    // console.log('converting', value, type);
    // console.log('------------------')

    if ( Array.isArray(type) ) {
      if ( ! Array.isArray(value) ) {
        throw new MungError('Can not convert a non-array to an array of types', { value, type });
      }

      if ( type.length === 1 ) {
        return value
          .map(value => this.convert(value, type[0]));
      }

      else {
        return value
          .filter((value, index) => type[index])
          .map((value, index) => this.convert(value, type[index]));
      }
    }

    if ( type === String ) {
      type = _String;
    }

    else if ( type === Number ) {
      type = _Number;
    }

    else if ( type === Boolean ) {
      type = _Boolean;
    }

    else if ( type === Object ) {
      type = _Object;
    }

    else if ( type === Date ) {
      type = _Date;
    }

    if ( ! type.convert ) {
      return value;
    }

    return type.convert(value);
  }

  static set (document, key, value, type) {
    let doc = document;

    key.split(/\./).reduce((doc, bit, i, bits) => {
      if ( bits[i+1] ) {
        doc[bit] = doc[bit] || {};
        if ( ! /^\d+$/.test(bit) ) {
          type = type[bit];
        }
        else {
          type = type[0];
        }
      }
      else {
        type = type[bit];
        let casted = cast(value, type);
        if ( typeof casted !== 'undefined' ) {
          doc[bit] = casted;
        }
      }
      return doc[bit];
    }, doc);

    return document;
  }

  static pluralize (name) {
    return name + 's';
  }

  static embed (document) {
    return { type : document };
  }

  static runSequence (pipeline = [], locals = {}) {
    return new Promise((ok, ko) => {
      try {
        let cursor = 0;

        let run = () => {
          try {
            if ( pipeline[cursor] ) {
              pipeline[cursor](locals).then(
                () => {
                  try {
                    cursor ++;
                    run();
                  }
                  catch ( error ) {
                    ko(error);
                  }
                },
                ko
              );
            }
            else {
              ok();
            }
          }
          catch ( error ) {
            ko(error);
          }
        };

        run();
      }
      catch ( error ) {
        ko(error);
      }
    });
  }

  static parse (query, schema) {
    let parsed = {};

    if ( Array.isArray(query) ) {
      return this.parse({ $or : query }, schema);
    }

    for ( let field in query ) {

      // field has dot notation

      if ( /\./.test(field) ) {
        const primaryField = field.split(/\./)[0];

        const type = schema[primaryField];

        if ( Array.isArray(type) ) {
          parsed[field] = Mung.convert([query[field]], type)[0];
        }
      }

      // If operator to an array ($or, $and, etc.)

      else if ( [ '$or', '$and' ].indexOf(field) > -1 ) {
        parsed[field] = query[field].map(value => this.parse(value, schema));
      }

      // query[field] is an object

      else if ( typeof query[field] === 'object' && schema[field] !== Object ) {

        // query[field].$in

        if ( '$in' in query[field] ) {
          parsed[field] = {
            $in : query[field].$in.map(value =>
              Mung.convert(value, schema[field])
            )
          };
        }

        // query[field].$exists

        else if ( '$exists' in query[field] ) {
          parsed[field] = {
            $exists : query[field].$exists
          };
        }

        // query[field].$size

        else if ( '$size' in query[field] ) {
          parsed[field] = {
            $size : query[field].$size
          };
        }

        // query[field].$lt

        else if ( '$lt' in query[field] ) {
          parsed[field] = {
            $lt : Mung.convert(query[field].$lt, schema[field])
          };
        }

        // query[field].$not

        else if ( '$not' in query[field] ) {
          parsed[field] = {
            $not : this.parse({ [field] : query[field].$not }, schema[field])[field]
          };
        }

        else if ( ! Array.isArray(schema[field]) ) {
          parsed[field] = Mung.convert(query[field], schema[field]);
        }
      }

      else if ( Array.isArray(schema[field]) ) {
        parsed[field] = Mung.convert(query[field], schema[field][0]);
      }

      else {
        parsed[field] = Mung.convert(query[field], schema[field]);
      }
    }

    return parsed;
  }

  static process(query, schema) {


    for ( let field in query ) {

      if ( query[field] instanceof RegExp ) {
      }

      else if ( field === '$or' || field === '$and' ) {
        query[field] = query[field].map(value => parse(value, schema));
      }

      else if ( field === '$size'  || field === '$exists' ) {
      }

      else if ( field === '$push' ) {
        query[field] = parse(query.$push, schema);
      }

      else if ( /\./.test(field) ) {
        schema = field.split(/\./).reduce((schema, bit, i, bits) => {
          schema = schema[bit];

          if ( Array.isArray(schema) ) {
            schema = schema[0];
          }
          return schema
        }, schema);

        query[field] = cast(query[field], schema);
      }

      else if ( Array.isArray(schema[field]) && ! Array.isArray(query[field]) ) {
        if ( query[field] instanceof RegExp ) {

        }
        else if ( typeof query[field] === 'object' && query[field].constructor === Object ) {
          if ( '$ne' in query[field] ) {
            query[field].$ne = parse(query[field].$ne, schema[field]);
          }
          else {
            query[field] = parse(query[field], schema[field][0]);
          }
        }
        else {
          query[field] = cast([query[field]], schema[field])[0];
        }
      }

      else if ( query[field] instanceof RegExp ) {
      }

      else if ( typeof query[field] === 'object' ) {
        if ( '$in' in query[field] ) {
          query[field].$in = query[field].$in.map(value => cast(value, schema[field]));
        }
        else if ( '$lt' in query[field] ) {
          query[field].$lt = cast(query[field].$lt, schema[field]);
        }
        else if ( '$lte' in query[field] ) {
          query[field].$lte = cast(query[field].$lte, schema[field]);
        }
        else if ( '$gt' in query[field] ) {
          query[field].$gt = cast(query[field].$gt, schema[field]);
        }
        else if ( '$gte' in query[field] ) {
          query[field].$gte = cast(query[field].$gte, schema[field]);
        }
        else if ( '$exists' in query[field] ) {
          // query[field].$exists
        }

        else if ( '$ne' in query[field] ) {

        }

        else {
          query[field] = cast(query[field], schema[field]);
        }
      }
      else {
        query[field] = cast(query[field], schema[field]);
      }
    }
    return query;
  }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Mung.events = new EventEmitter();

Mung.ObjectID = mongodb.ObjectID;

Mung.ObjectID.convert = function (id) {
  if ( typeof id === 'string' ) {
    return mongodb.ObjectID(id);
  }

  if ( id instanceof mongodb.ObjectID ) {
    return id;
  }

  if ( id && typeof id === 'object' ) {
    if ( id.$in ) {
      return { $in : id.$in.map(id => Mung.ObjectID.convert(id)) };
    }

    if ( id._id ) {
      return mongodb.ObjectID(id._id);
    }
  }
}

Mung.ObjectID.equal = function (a, b) {
  return a.equals(b);
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



class _String {
  static validate (value) {
    return typeof value === 'string';
  }

  static convert (value) {
    return String(value);
  }
}

Mung.String = _String;

class _Number {
  static validate (value) {
    return value.constructor === Number && isFinite(value);
  }

  static convert (value) {
    const converted = +value;

    if ( ! this.validate(converted) ) {
      throw new (Mung.Error)('Can not convert value to Number', { value });
    }

    return converted;
  }
}

Mung.Number = _Number;

class _Boolean {
  static validate (value) {
    return typeof value === 'boolean';
  }

  static convert (value) {
    return !!value;
  }
}

Mung.Boolean = _Boolean;

class _Object {
  static validate (value) {
    return typeof value === 'object' && value !== null && ! Array.isArray(value);
  }
}

Mung.Object = _Object;

class _Mixed {
  static validate (value) {
    return true;
  }
}

Mung.Mixed = _Mixed;

class _Date {
  static validate (value) {
    return value instanceof Date;
  }

  static convert (value) {
    const converted = new Date(value);

    if ( ! this.validate(converted) ) {
      throw new (Mung.Error)('Can not convert value to Date', { value });
    }

    return converted;
  }
}

Mung.Date = _Date;

class _Geo {
  static validate (value) {

  }
}

Mung.Geo = _Geo;

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor.name)
  }
}

class MungError extends ExtendableError {
  constructor (message, options = {}) {
    let msg;

    try {
      msg = JSON.stringify({ message , options }, null, 2);
    } catch (e) {
      msg = message;
    } finally {
      super(msg);
    }

    this.originalMessage = message;

    if ( 'code' in options ) {
      this.code = options.code;
    }

    this.options = options;
  }
}

Mung.Error = MungError;

MungError.MISSING_REQUIRED_FIELD = 1;
MungError.DISTINCT_ARRAY_CONSTRAINT = 2;

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export default Mung;

// Mung.Model = function () {
//
// }
//
// class Message extends Mung.Model {}
// class Room extends Mung.Model {}
// class User extends Mung.Model {}
//
//
// parse(
//
//   { foo : { $lt : require('moment')().subtract(2, 'minutes').toISOString() } },
//
//   {
//     foo : Date
//   }
//
// )
//
// ,
// { depth: 15 }));
