'use strict';

import {EventEmitter}     from 'events';
import fs                 from 'fs';
import path               from 'path';
import SocketIO           from 'socket.io';
import S                  from 'string';
import cookieParser       from 'cookie-parser';
import ss                 from 'socket.io-stream';
import sequencer          from 'promise-sequencer';
import emitter            from './lib/app/emitter';
import Item               from './models/item';

class API extends EventEmitter {

  constructor (server) {
    super();

    if ( server ) {
      process.nextTick(() => {
        try {
          this.server = server;
          this.users = [];
          this.handlers = {};
          this.sockets = [];

          this.listenToDB();

          this.fetchHandlers()
            .then(
              () => this.start(),
              this.emit.bind(this, 'error')
            );
        }
        catch ( error ) {
          this.emit('error', error);
        }
      });
    }
  }

  disconnect () {
    return new Promise((ok, ko) => {

      this.unlistenToDB();

      if ( ! this.sockets.length ) {
        return ok();
      }

      const promises = this.sockets.map(socket => new Promise((ok, ko) => {
        if ( ! socket.connected ) {
          return ok();
        }

        socket
          .on('disconnect',ok)
          .disconnect(true);
      }));

      Promise.all(promises).then(
        results => {
          // this.io.close(closed => console.log('{ closed }'));
          ok();
        },
        ko
      );
    });
  }

  listenToDBUpdates (collection, document) {
    if ( collection == 'items') {
      this.sockets.forEach(socket => {
        document.toPanelItem(socket.synuser ? socket.synuser.id : null ).then(
          item => {
            socket.emit('item changed', item);
            this.handlers['get item details'].apply(socket, [item]);
          }
        );
      });  
    }
  }

  listenToDBInserts (collection, document) {

    if ( collection === 'votes' || collection === 'feedback' ) {
      Item
        .getDetails(document.item)
        .then(details => {
          this.sockets.forEach(socket => {
            socket.emit('OK get item details', details)
          });
        })
        .catch(error => this.emit('error', error));
    }
  }


  listenToDB () {
    emitter.on('create', this.listenToDBInserts.bind(this));
    emitter.on('update', this.listenToDBUpdates.bind(this));
  }

  unlistenToDB () {
    emitter.removeListener('create', this.listenToDBInserts.bind(this));
    emitter.removeListener('update', this.listenToDBUpdates.bind(this));
  }

  fetchHandlers () {
    return sequencer(

      () => sequencer.promisify(fs.readdir, [path.join(__dirname, 'api')]),

      files => Promise.all(files.map(file => new Promise((ok, ko) => {
        const name      =   S(file.replace(/\.js$/, ''))
          .humanize()
          .s
          .toLowerCase();

        const handler   =   require('./api/' + file).default;

        if ( typeof handler !== 'function' ) {
          throw new Error(`API handler ${name} (${file}) is not a function`);
        }

        this.handlers[name] = handler;

        this.handlers[name].slugName = file.replace(/\.js$/, '');

        ok();
      })))

    );
  }

  start () {
    try {
      this.io = SocketIO.listen(this.server.server);
      logger.info('socketIO listening');
      this.io
        .use(this.identify.bind(this))
        .on('connection', this.connected.bind(this))
        .on('connect_error', (error)=>{logger.error("socket io connection_error",error,this)})
        .on('connect_timeout', (error)=>{logger.error("socket io connection_timeout",error,this)} );
    }
    catch ( error ) {
      this.emit('error', error);
    }
  }

  /** Find user by id in [User]
   *  @arg      {String} id
  */

  findUserById (id) {
    return this.users.reduce((found, user) => {
      if ( user.id === id ) {
        found = user;
      }
      return found;
    }, null);
  }

  /** Identify client
   *  @arg      {Socket} socket
   *  @arg      {Function} next
  */

  identify (socket, next) {
    try {
      const req = {
        "headers"     :   {
          "cookie"    :   socket.request.headers.cookie
        }
      };

      cookieParser()(req, null, () => {});

      let cookie = req.cookies.synuser;

      if ( cookie ) {

        if ( typeof cookie === 'string' ) {
          cookie = JSON.parse(cookie);
        }

        if ( ! this.findUserById(cookie.id) ) {
          this.pushUser(cookie);
        }

        socket.synuser = cookie;
      }

      next();
    }
    catch ( error ) {
      this.emit('error', error);
    }
  }

  /** New user
   *  @arg      {User} user
  */

  pushUser (user) {
    this.users.push(user);
  }

  /** On every client's connection
   *  @arg      {Socket} socket
  */

  connected (socket) {
    try {


      this.sockets.push(socket);

      socket.on('error', error => this.emit('error', error));
      socket.on('connect_timeout', error=>logger.error('socket connected timeout', error));
      socket.on('connect_error', error=>logger.error('socket connect_error', error));

      socket.on('disconnect', () => {
      });

      socket.emit('welcome', socket.synuser);

      socket.broadcast.emit('online users', this.users.length);
      socket.emit('online users', this.users.length);
      logger.trace('socket connected', { id : socket.id, synuser : socket.synuser, onlineUsers: this.users.length });

      socket.ok = (event, ...responses) => {
        const formatted = responses.map(res => {
          let stringified = JSON.stringify(res);

          if ( typeof stringified === 'undefined' ) {
            return 'undefined'.magenta;
          }

          return stringified.magenta;
        });

        // this.emit('message', '>>>'.green.bold, event.green.bold, ...formatted);
        logger.trace("api: connected: socket.ok ", event, ...responses);
        socket.emit('OK ' + event, ...responses);
      };

      socket.error = error => {
        this.emit('error', error);
      };

      for ( let handler in this.handlers ) {
        socket.on(handler, this.handlers[handler].bind(socket));
      }

      this.stream(socket);
    }
    catch ( error ) {
      this.emit('error', error);
    }
  }

  stream (socket) {
    try {
      ss(socket).on('upload image', (stream, data) => {
        const filename = '/tmp/' + data.name;
        logger.info('upload image', {stream}, {data}, {filename});
        stream.pipe(fs.createWriteStream(filename))
        .on('error', (err)=>logger.error("Error uploading file:",filename,err));
      });
    }
    catch ( error ) {
      this.emit('error', error);
    }
  }

}

export default API;
