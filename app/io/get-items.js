! function () {

  'use strict';

  var Item = require('syn/models/Item');  

  function getItems (event, panel, item) {

    var socket = this;

    function onDomainError (error) {
      socket.app.arte.emit('error', error);
    }

    function run (domain) {

      var id = 'panel-' + panel.type._id;
      var query = { type: panel.type._id };

      if ( panel.parent ) {
        id += '-' + panel.parent;
        query.parent = panel.parent;
      }

      Item

        .getPanelItems(query)

        .then(socket.ok.bind(socket, event, panel));
    }

    require('syn/lib/domain')(onDomainError, run);

  }

  module.exports = getItems;

} ();
