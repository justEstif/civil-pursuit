'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _cincoDist = require('cinco/dist');

var _panelView = require('../panel/view');

var _panelView2 = _interopRequireDefault(_panelView);

var CountDownView = (function (_Element) {
  function CountDownView(props) {
    _classCallCheck(this, CountDownView);

    _get(Object.getPrototypeOf(CountDownView.prototype), 'constructor', this).call(this, '#countdown');

    this.add(function () {
      var panel = new _panelView2['default']({ creator: false, title: 'Countdown' });

      panel.find('.items').get(0).add(new _cincoDist.Element('#countdown-panel').add(new _cincoDist.Element('header').add(new _cincoDist.Element('h2').text('Countdown to discussion'), new _cincoDist.Element('h1').text('Aug. 12, 2015 4:00 pm Pacific Standard Time'), new _cincoDist.Element('h2.dynamic-countdown').add(new _cincoDist.Element('span.countdown-days').text('0'), new _cincoDist.Element('span.countdown-days-label').text(' days T '), new _cincoDist.Element('span.countdown-hours').text('0'), new _cincoDist.Element('span').text(':'), new _cincoDist.Element('span.countdown-minutes').text('0'), new _cincoDist.Element('span').text(':'), new _cincoDist.Element('span.countdown-seconds').text('0')), new _cincoDist.Element('.row').add(new _cincoDist.Element('.phone-30.phone-push-20').add(new _cincoDist.Element('h4').text('Registered participants')), new _cincoDist.Element('.phone-30').add(new _cincoDist.Element('h4').text('Goal'))), new _cincoDist.Element('.row').add(new _cincoDist.Element('.phone-30.phone-push-20').add(new _cincoDist.Element('h2.discussion-registered').text('0')), new _cincoDist.Element('.phone-30').add(new _cincoDist.Element('h2.discussion-goal').text('0')))), new _cincoDist.Element('.row').add(new _cincoDist.Element('.phone-60.phone-push-20').add(new _cincoDist.Element('.gutter').add(new _cincoDist.Element('button.large.block.primary.radius.discussion-register_button').text('Register'), new _cincoDist.Element('h4.text-center.success.discussion-is_registered.hide').text('Thank you for registering!'))))));

      return panel;
    });
  }

  _inherits(CountDownView, _Element);

  return CountDownView;
})(_cincoDist.Element);

exports['default'] = CountDownView;
module.exports = exports['default'];