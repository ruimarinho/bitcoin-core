
/**
 * Module dependencies.
 */

import { obfuscate } from './request-obfuscator';
import request from 'request';
import requestLogger from '@uphold/request-logger';

/**
 * Exports.
 */

export default logger => requestLogger(request, (request, instance) => {
  obfuscate(request, instance);

  if (request.type === 'response') {
    return logger.debug({ request }, `Received response for request ${request.id}`);
  }

  return logger.debug({ request }, `Making request ${request.id} to ${request.method} ${request.uri}`);
});
