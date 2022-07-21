
/**
 * Module dependencies.
 */

const _ = require('lodash');
const Client = require('../src/index');
const config = require('./config');
const should = require('should');

/**
 * Test `Requester`.
 */

describe('Requester', () => {
  it('should throw an error if version does not support a given method', async () => {
    try {
      await new Client(_.defaults({ version: '0.12.0' }, config.bitcoin)).getHashesPerSec();

      should.fail();
    } catch (e) {
      should(e).be.an.instanceOf(Error);
      should(e.message).equal('Method "gethashespersec" is not supported by version "0.12.0"');
    }
  });
});
