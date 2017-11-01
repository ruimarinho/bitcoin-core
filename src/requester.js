
/**
 * Module dependencies.
 */

import { get } from 'lodash';

/**
 * Export Requester class.
 */

export default class Requester {
  constructor({ methods = {}, version } = {}) {
    this.methods = methods;
    this.version = version;
  }

  /**
  * Prepare rpc request.
  */

  prepare({ method, parameters = [], suffix }) {
    method = method.toLowerCase();

    if (this.version && !get(this.methods[method], 'supported', false)) {
      throw new Error(`Method "${method}" is not supported by version "${this.version}"`);
    }

    return {
      id: `${Date.now()}${suffix !== undefined ? `-${suffix}` : ''}`,
      method,
      params: parameters
    };
  }
}
