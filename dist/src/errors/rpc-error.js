"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _http = require("http");

var _standardError = _interopRequireDefault(require("./standard-error"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Module dependencies.
 */

/**
 * Export `RpcError` class.
 */
class RpcError extends _standardError.default {
  constructor(code, msg, props = {}) {
    if (typeof code != 'number') {
      throw new TypeError(`Non-numeric HTTP code`);
    }

    if (typeof msg == 'object' && msg !== null) {
      props = msg;
      msg = null;
    }

    props.code = code;
    super(msg || _http.STATUS_CODES[code], props);
  }

  get status() {
    return this.code;
  }

  set status(value) {
    Object.defineProperty(this, 'status', {
      configurable: true,
      enumerable: true,
      value,
      writable: true
    });
  }

  toString() {
    return `${this.name}: ${this.code} ${this.message}`;
  }

}

exports.default = RpcError;