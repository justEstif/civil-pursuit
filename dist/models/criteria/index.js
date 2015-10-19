'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _libMung = require('../../lib/mung');

var _libMung2 = _interopRequireDefault(_libMung);

var _migrations1 = require('./migrations/1');

var _migrations12 = _interopRequireDefault(_migrations1);

var Criteria = (function (_Mung$Model) {
  function Criteria() {
    _classCallCheck(this, Criteria);

    if (_Mung$Model != null) {
      _Mung$Model.apply(this, arguments);
    }
  }

  _inherits(Criteria, _Mung$Model);

  _createClass(Criteria, null, [{
    key: 'schema',
    value: function schema() {
      return {
        'name': {
          type: String,
          required: true
        },
        'description': {
          type: String,
          required: true
        }
      };
    }
  }]);

  return Criteria;
})(_libMung2['default'].Model);

Criteria.migrations = {
  1: _migrations12['default']
};

Criteria.version = 2;

exports['default'] = Criteria;
module.exports = exports['default'];