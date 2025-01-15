
/**
 * Module dependencies.
 */

const _ = require('lodash');
const Client = require('../src/index');
const RpcError = require('../src/errors/rpc-error');
const config = require('./config');
const nock = require('nock');
const should = require('should');

/**
 * Test `Parser`.
 */

afterEach(() => {
  if (nock.pendingMocks().length) {
    throw new Error('Unexpected pending mocks');
  }

  nock.cleanAll();
});

describe('Parser', () => {
  it('should throw an error with a generic message if one is not returned on the response', async () => {
    nock(config.bitcoin.host)
      .post('/')
      .reply(200, '{ "result": null, "error": { "code": -32601 }, "id": "69837016239933"}');

    try {
      await new Client(config.bitcoin).command('foobar');

      should.fail();
    } catch (e) {
      should(e).be.an.instanceOf(RpcError);
      should(e.message).equal('An error occurred while processing the RPC call to bitcoind');
      should(e.code).equal(-32601);
    }
  });

  it('should throw an error if the response does not include a `result`', async () => {
    nock(config.bitcoin.host)
      .post('/')
      .reply(200, '{ "error": null, "id": "69837016239933"}');

    try {
      await new Client(config.bitcoin).command('foobar2');

      should.fail();
    } catch (e) {
      should(e).be.an.instanceOf(RpcError);
      should(e.message).equal('Missing `result` on the RPC call result');
      should(e.code).equal(-32700);
    }
  });

  it('should throw an error if the response is not successful but is json-formatted', async () => {
    try {
      await new Client(_.defaults({ wallet: 'foobar' }, config.bitcoinMultiWallet)).getWalletInfo();

      should.fail();
    } catch (e) {
      should(e).be.an.instanceOf(RpcError);
      should(e.message).equal('Requested wallet does not exist or is not loaded');
      should(e.code).equal(-18);
    }
  });
});
