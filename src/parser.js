
/**
 * Module dependencies.
 */

import _ from 'lodash';
import RpcError from './errors/rpc-error';

/**
 * Get response result and errors.
 */

function get(body, { headers = false, response } = {}) {
  if (!body) {
    throw new RpcError(response.statusCode, response.statusMessage);
  }

  if (body.error !== null) {
    throw new RpcError(
      _.get(body, 'error.code', -32603),
      _.get(body, 'error.message', 'An error occurred while processing the RPC call to bitcoind')
    );
  }

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
    // Body contains HTML (e.g. 401 Unauthorized).
    if (typeof body === 'string' && response.statusCode !== 200) {
      throw new RpcError(response.statusCode);
    }

    if (!Array.isArray(body)) {
      return get(body, { headers: this.headers, response });
    }

    // Batch response parsing where each response may or may not be successful.
    const batch = body.map((response) => {
      try {
        return get(response, { headers: false, response });
      } catch (e) {
        return e;
      }
    });

    if (this.headers) {
      return [batch, response.headers];
    }

    return batch;
  }

  rest([response, body]) {
    if (body.error) {
      throw new RpcError(body.error.code, body.error.message);
    }

    if (this.headers) {
      return [body, response.headers];
    }

    return body;
  }
}
