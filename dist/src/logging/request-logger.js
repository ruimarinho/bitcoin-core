"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _requestObfuscator = require("./request-obfuscator");

var _request = _interopRequireDefault(require("request"));

var _requestLogger = _interopRequireDefault(require("@uphold/request-logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Module dependencies.
 */

/**
 * Exports.
 */
var _default = logger => (0, _requestLogger.default)(_request.default, (request, instance) => {
  (0, _requestObfuscator.obfuscate)(request, instance);

  if (request.type === 'response') {
    return logger.debug({
      request
    }, `Received response for request ${request.id}`);
  }

  return logger.debug({
    request
  }, `Making request ${request.id} to ${request.method} ${request.uri}`);
});

exports.default = _default;