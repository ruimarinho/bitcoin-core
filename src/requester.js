
/**
 * Module dependencies.
 */

import { includes } from 'lodash';

/**
 * Export Requester class.
 */

export default class Requester {
  constructor({ unsupported = [], version } = {}) {
    this.unsupported = unsupported;
    this.version = version;
  }

  /**
  * Prepare rpc request.
  */

  prepare({ method, parameters = [], suffix }) {
    method = method.toLowerCase();

    if (this.version && includes(this.unsupported, method)) {
      throw new Error(`Method "${method}" is not supported by version "${this.version}"`);
    }

    return {
      id: `${Date.now()}${suffix !== undefined ? `-${suffix}` : ''}`,
      method,
      params: parameters
    };
  }
}
