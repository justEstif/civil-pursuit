! function () {
  
  'use strict';


  var string = require('string');

  function find (name, more) {

    var comp = this;

    switch ( name ) {

      case 'item subject':        return this.template.find('.subject.' + more +'-item h4');

      case 'item description':    return this.template.find('.description.' + more +'-item');;

      case 'cursor':                  return this.template.find('.cursor');

      case 'limit':                   return this.template.find('.limit');

      case 'side by side':            return this.template.find('.items-side-by-side');

      case 'finish button':           return this.template.find('.finish');

      case 'sliders':                 return this.find('side by side').find('.sliders.' + more + '-item');

      case 'item image':              return this.find('side by side').find('.image.' + more + '-item');

      case 'item persona':            return this.find('side by side').find('.persona.' + more + '-item');

      case 'item references':         return this.find('side by side').find('.references.' + more + '-item a');

      case 'item persona image':      return this.find('item persona', more).find('img');

      case 'item persona name':       return this.find('item persona', more).find('.user-full-name');

      case 'item feedback':           return this.find('side by side').find('.' + more + '-item.feedback .feedback-entry');

      case 'promote button':          return this.find('side by side').find('.' + more + '-item .promote');

      case 'promote label':           return this.find('side by side').find('.promote-label');

      case 'edit and go again button':  return this.find('side by side').find('.' + more + '-item .edit-and-go-again-toggle');
    }
  }

  module.exports = find;

} ();
