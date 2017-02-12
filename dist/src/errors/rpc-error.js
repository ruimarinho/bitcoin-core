'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _http = require('http');

var _standardError = require('./standard-error');

var _standardError2 = _interopRequireDefault(_standardError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Export `RpcError` class.
 */

/**
 * Module dependencies.
 */

class RpcError extends _standardError2.default {
  constructor(code, msg, props) {
    if (typeof code != 'number') {
      throw new TypeError(`Non-numeric HTTP code`);
    }

    if (typeof msg == 'object' && msg !== null) {
      props = msg;
      msg = null;
    }

    super(msg || _http.STATUS_CODES[code], props);

    this.code = code;
  }

  get status() {
    return this.code;
  }

  set status(value) {
    Object.defineProperty(this, 'status', {
      configurable: true,
      enumerable: true,
      value: value,
      writable: true
    });
  }

  toString() {
    return `${this.name}: ${this.code} ${this.message}`;
  }
}
exports.default = RpcError;
module.exports = exports['default'];