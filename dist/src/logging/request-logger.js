'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _requestObfuscator = require('./request-obfuscator');

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _requestLogger = require('@uphold/request-logger');

var _requestLogger2 = _interopRequireDefault(_requestLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Exports.
 */

exports.default = logger => (0, _requestLogger2.default)(_request2.default, (request, instance) => {
  (0, _requestObfuscator.obfuscate)(request, instance);

  if (request.type === 'response') {
    return logger.debug({ request: request }, `Received response for request ${request.id}`);
  }

  return logger.debug({ request: request }, `Making request ${request.id} to ${request.method} ${request.uri}`);
});
/**
 * Module dependencies.
 */

module.exports = exports['default'];