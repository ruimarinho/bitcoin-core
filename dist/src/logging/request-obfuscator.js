"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.obfuscate = obfuscate;

var _lodash = require("lodash");

var _methods = _interopRequireDefault(require("../methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Module dependencies.
 */

/**
 * Map all methods to lowercase.
 */
const lowercaseMethods = (0, _lodash.mapKeys)(_methods.default, (value, key) => key.toLowerCase());
/**
 * Obfuscate the response body.
 */

function obfuscateResponseBody(body, method) {
  const fn = (0, _lodash.get)(lowercaseMethods[method], 'obfuscate.response');

  if (!fn || (0, _lodash.isEmpty)(body.result)) {
    return body;
  }

  return (0, _lodash.defaults)({
    result: fn(body.result)
  }, body);
}
/**
 * Obfuscate the response.
 */


function obfuscateResponse(request, instance) {
  if (request.type !== 'response') {
    return;
  }

  if (!request.body) {
    return;
  }

  if ((0, _lodash.get)(request, `headers['content-type']`) === 'application/octet-stream') {
    request.body = '******';
    return;
  }

  if (!instance.body) {
    return;
  }

  request.body = JSON.parse(request.body);
  const requestBody = JSON.parse(instance.body);

  if ((0, _lodash.isArray)(request.body)) {
    const methodsById = (0, _lodash.mapKeys)(requestBody, method => method.id);
    request.body = (0, _lodash.map)(request.body, request => obfuscateResponseBody(request, methodsById[request.id].method));
  } else {
    request.body = obfuscateResponseBody(request.body, requestBody.method);
  }

  request.body = JSON.stringify(request.body);
}
/**
 * Obfuscate the request body.
 */


function obfuscateRequestBody(body) {
  const method = (0, _lodash.get)(lowercaseMethods[body.method], 'obfuscate.request');

  if (!method) {
    return body;
  }

  if ((0, _lodash.isPlainObject)(body.params)) {
    return (0, _lodash.assign)(body, {
      params: method.named(body.params)
    });
  }

  return (0, _lodash.assign)(body, {
    params: method.default(body.params)
  });
}
/**
 * Obfuscate the request.
 */


function obfuscateRequest(request) {
  if (request.type !== 'request') {
    return;
  }

  if (!(0, _lodash.isString)(request.body)) {
    return;
  }

  request.body = JSON.parse(request.body);

  if ((0, _lodash.isArray)(request.body)) {
    request.body = (0, _lodash.map)(request.body, obfuscateRequestBody);
  } else {
    request.body = obfuscateRequestBody(request.body);
  }

  request.body = JSON.stringify(request.body);
}
/**
 * Obfuscate headers.
 */


function obfuscateHeaders(request) {
  if (request.type !== 'request') {
    return;
  }

  if (!(0, _lodash.has)(request, 'headers.authorization')) {
    return;
  }

  request.headers.authorization = request.headers.authorization.replace(/(Basic )(.*)/, `$1******`);
}
/**
 * Export `RequestObfuscator`.
 */


function obfuscate(request, instance) {
  obfuscateHeaders(request);
  obfuscateRequest(request);
  obfuscateResponse(request, instance);
}