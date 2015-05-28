! function () {
  
  'use strict';

  /**
   *  @function
   *  @return
   *  @arg
   */

  function exportsLocals (server, req, res) {
    var locals      =   {
      settings      :   server.app.locals.settings,
      req           :   {
        path        :   req.path,
        url         :   req.url,
        params      :   req.params
      },
      user          :   req.user,
      page          :   req.page || req.params.page || 'Home',
      component     :   req.component,
      components    :   req.components,
      payload       :   req.body,
      TOS           :   res.locals.TOS,
      title         :   res.locals.title
    };

    if ( res.locals.item ) {
      locals.item   =   res.locals.item;
      locals.panel  =   {
        type        :   res.locals.item.type
      };
    }

    locals.config   =   require('syn/config').public;

    return locals;
  }

  module.exports = exportsLocals;

} ();
