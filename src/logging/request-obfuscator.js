
/**
 * Module dependencies.
 */

import { assign, defaults, get, has, isArray, isEmpty, isPlainObject, isString, map, mapKeys } from 'lodash';
import methods from '../methods';

/**
 * Map all methods to lowercase.
 */

const lowercaseMethods = mapKeys(methods, (value, key) => key.toLowerCase());

/**
 * Obfuscate the response body.
 */

function obfuscateResponseBody(body, method) {
  const fn = get(lowercaseMethods[method], 'obfuscate.response');

  if (!fn || isEmpty(body.result)) {
    return body;
  }

  return defaults({ result: fn(body.result) }, body);
}

/**
 * Obfuscate the response.
 */

function obfuscateResponse(request, instance) {
  if (request.type !== 'response') {
    return;
  }

  if (!get(request, 'response.body')) {
    return;
  }

  if (get(request, `response.headers['content-type']`) === 'application/octet-stream') {
    request.response.body = '******';

    return;
  }

  if (!instance.body) {
    return;
  }

  const requestBody = JSON.parse(instance.body);

  if (isArray(request.response.body)) {
    const methodsById = mapKeys(requestBody, method => method.id);

    request.response.body = map(request.response.body, request => obfuscateResponseBody(request, methodsById[request.id].method));

    return;
  }

  request.response.body = obfuscateResponseBody(request.response.body, requestBody.method);
}

/**
 * Obfuscate the request body.
 */

function obfuscateRequestBody(body) {
  const method = get(lowercaseMethods[body.method], 'obfuscate.request');

  if (!method) {
    return body;
  }

  if (isPlainObject(body.params)) {
    return assign(body, { params: method.named(body.params) });
  }

  return assign(body, { params: method.default(body.params) });
}

/**
 * Obfuscate the request.
 */

function obfuscateRequest(request) {
  if (request.type !== 'request') {
    return;
  }

  if (!isString(request.body)) {
    return;
  }

  request.body = JSON.parse(request.body);

  if (isArray(request.body)) {
    request.body = map(request.body, obfuscateRequestBody);
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

  if (!has(request, 'headers.authorization')) {
    return;
  }

  request.headers.authorization = request.headers.authorization.replace(/(Basic )(.*)/, `$1******`);
}

/**
 * Export `RequestObfuscator`.
 */

export function obfuscate(request, instance) {
  obfuscateHeaders(request);
  obfuscateRequest(request);
  obfuscateResponse(request, instance);
}
