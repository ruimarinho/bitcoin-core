
/**
 * Module dependencies.
 */

import JSONBigInt from 'json-bigint';
import RpcError from './errors/rpc-error';
import _ from 'lodash';

/**
 * JSONBigInt parser.
 */

const { parse } = JSONBigInt({ storeAsString: true, strict: true }); // eslint-disable-line new-cap

/**
 * Get RPC response body result.
 */

function getRpcResult(body, { headers = false, response } = {}) {
  if (body.error !== null) {
    throw new RpcError(
      _.get(body, 'error.code', -32603),
      _.get(body, 'error.message', 'An error occurred while processing the RPC call to bitcoind')
    );
  }

  // Defensive measure. This should not happen on a RPC call.
  if (!_.has(body, 'result')) {
    throw new RpcError(-32700, 'Missing `result` on the RPC call result');
  }

  if (headers) {
    return [body.result, response.headers];
  }

  return body.result;
}

/**
 * Export Parser class.
 */

export default class Parser {
  constructor({ headers } = {}) {
    this.headers = headers;
  }

  /**
   * Parse rpc response.
   */

  rpc([response, body]) {
    // The RPC api returns a `text/html; charset=ISO-8859-1` encoded response with an empty string as the body
    // when an error occurs.
    if (typeof body === 'string' && response.headers['content-type'] !== 'application/json' && response.statusCode !== 200) {
      throw new RpcError(response.statusCode, response.statusMessage, { body });
    }

    // Parsing the body with custom parser to support BigNumbers.
    body = parse(body);

    if (!Array.isArray(body)) {
      return getRpcResult(body, { headers: this.headers, response });
    }

    // Batch response parsing where each response may or may not be successful.
    const batch = body.map(response => {
      try {
        return getRpcResult(response, { headers: false, response });
      } catch (e) {
        return e;
      }
    });

    if (this.headers) {
      return [batch, response.headers];
    }

    return batch;
  }

  rest(extension, [response, body]) {
    // The REST api returns a `text/plain` encoded response with the error line and the control
    // characters \r\n. For readability and debuggability, the error message is set to this content.
    // When requesting a binary response, the body will be returned as a Buffer representation of
    // this error string.
    if (response.headers['content-type'] !== 'application/json' && response.statusCode !== 200) {
      if (body instanceof Buffer) {
        body = body.toString('utf-8');
      }

      throw new RpcError(response.statusCode, body.replace('\r\n', ''), { body });
    }

    // Parsing the body with custom parser to support BigNumbers.
    if (extension === 'json') {
      body = parse(body);
    }

    if (this.headers) {
      return [body, response.headers];
    }

    return body;
  }
}
