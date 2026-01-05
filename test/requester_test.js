
/**
 * Module dependencies.
 */

const _ = require('lodash');
const Client = require('../src/index');
const config = require('./config');

/**
 * Test `Requester`.
 */

describe('Requester', () => {
  it('should throw an error if version does not support a given method', async () => {
    try {
      await new Client(_.defaults({ version: '0.12.0' }, config.bitcoin)).getHashesPerSec();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toEqual('Method "gethashespersec" is not supported by version "0.12.0"');
    }
  });
});
