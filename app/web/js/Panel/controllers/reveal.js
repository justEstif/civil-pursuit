! function () {

  'use strict';

  function _reveal (elem, poa, cb) {
    var app = this;

    elem.removeClass('is-hidden').addClass('is-showing');

    app.controller('scroll to point of attention')(poa, function () {
      app.controller('show')(elem, cb);
    });
  }

  function reveal (elem, poa, cb) {
    console.info('revealing', elem.attr('id'), elem.attr('class'))

    var app = this;

    if ( ! elem.hasClass('is-toggable') ) {
      elem.addClass('is-toggable');
    }

    // Don't animate if something else is animating

    if ( $('.is-showing').length || $('.is-hiding').length ) {
      return false;
    }

    // Eventual element to hide first

    var hider;

    // Find elem's panel

    var $panel = elem.closest('.panel');

    // Find elem's item if any

    var $item = elem.closest('.item');

    // Hide Creators if any

    if ( ! elem.hasClass('.creator') &&
      $panel.find('>.panel-body >.creator.is-shown').length ) {
      hider = $panel.find('>.panel-body >.creator.is-shown');
    }

    // Hide other shown elements that share same item's level

    if ( $item.length && $item.find('.is-shown').not('.children').length ) {
      hider = $item.find('.is-shown').not('.children');
    }

    // If hiders

    if (  hider ) {
      app.controller('hide')(hider, function () {
        _reveal.apply(app, [elem, poa, cb]);
      });
    }

    else {
      _reveal.apply(app, [elem, poa, cb]);
    }
  }

  module.exports = reveal;

} ();
