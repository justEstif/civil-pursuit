"use strict";


// on the broswer, console.log displays objects in a way that is compact and lets you expand them through the UI.
// so this default layout will preserve the objects and pass them to console.log
function socketloggerAppender (layout, timezoneOffset) {
  layout = layout || function(e,t){
    var d=e.startTime.toString().split(' '); 
    return [d[3]+d[1]+d[2]+' '+d[4],
     e.categoryName, ...e.data]
  }
  return function(loggingEvent) {
    window.socket.emit('logger',...layout(loggingEvent, timezoneOffset));
  };
}

function configure(config) {
  var layout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }
  return socketloggerAppender(layout, config.timezoneOffset);
}

exports.appender = socketloggerAppender;
exports.configure = configure;
