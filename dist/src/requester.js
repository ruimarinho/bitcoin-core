'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

/**
 * Export Requester class.
 */

class Requester {
  constructor() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$unsupported = _ref.unsupported;

    let unsupported = _ref$unsupported === undefined ? [] : _ref$unsupported,
        version = _ref.version;

    this.unsupported = unsupported;
    this.version = version;
  }

  /**
  * Prepare rpc request.
  */

  prepare(_ref2) {
    let method = _ref2.method;
    var _ref2$parameters = _ref2.parameters;
    let parameters = _ref2$parameters === undefined ? [] : _ref2$parameters,
        suffix = _ref2.suffix;

    method = method.toLowerCase();

    if (this.version && (0, _lodash.includes)(this.unsupported, method)) {
      throw new Error(`Method "${method}" is not supported by version "${this.version}"`);
    }

    return {
      id: `${Date.now()}${suffix !== undefined ? `-${suffix}` : ''}`,
      method: method,
      params: parameters
    };
  }
}
exports.default = Requester;
/**
 * Module dependencies.
 */

module.exports = exports['default'];