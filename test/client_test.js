
/**
 * Module dependencies.
 */

const { generateWalletFunds, parse } = require('./utils/helper');
const _ = require('lodash');
const Client = require('../src/index');
const RpcError = require('../src/errors/rpc-error');
const config = require('./config');
const methods = require('../src/methods');
const should = require('should');

/**
 * Test `Client`.
 */

describe('Client', () => {
  let client;

  before(async () => {
    client = new Client(config.bitcoin);

    await generateWalletFunds(client, 'test');
  });

  describe('constructor', () => {
    it('should not have `agentOptions` set by default', () => {
      should.not.exist(new Client().agentOptions);
    });

    it('should have default host set to `localhost`', () => {
      should(new Client().host).equal('http://localhost:8332');
    });

    it('should not have a password set by default', () => {
      should.not.exist(new Client().password);
    });

    it('should have default timeout of 30000ms', () => {
      should(new Client().timeout).equal(30000);
    });

    it('should not have username/password authentication enabled by default', () => {
      should.not.exist(new Client().auth);
    });

    it('should have all the methods listed by `help`', async () => {
      const help = await client.help();

      should(_.difference(_.without(parse(help), 'getaddressbyaccount'), _.invokeMap(Object.keys(methods), String.prototype.toLowerCase))).be.empty();
    });

    it('should accept valid versions', async () => {
      await new Client(_.defaults({ version: '0.15.0.1' }, config.bitcoin)).getNetworkInfo();
      await new Client(_.defaults({ version: '0.15.0' }, config.bitcoin)).getNetworkInfo();
      await new Client(_.defaults({ version: '0.17.0' }, config.bitcoin)).getNetworkInfo();
    });
  });

  describe('connections', () => {
    describe('general', () => {
      it('should throw an error if timeout is reached', async () => {
        try {
          await new Client(_.defaults({ timeout: 1 }, config.bitcoin)).listUnspent();

          should.fail();
        } catch (e) {
          should(e).be.an.instanceOf(Error);
          should(e.code).match(/(ETIMEDOUT|ESOCKETTIMEDOUT)/);
        }
      });

      it('should throw an error if version is invalid', async () => {
        try {
          await new Client({ version: '0.12' }).getHashesPerSec();

          should.fail();
        } catch (e) {
          should(e).be.an.instanceOf(Error);
          should(e.message).equal('Invalid Version "0.12"');
        }
      });

      it('should throw an error if a connection cannot be established', async () => {
        try {
          await (new Client(_.defaults({ host: 'http://localhost:9897' }, config.bitcoin))).getDifficulty();

          should.fail();
        } catch (e) {
          should(e).be.an.instanceOf(Error);
          should(e.code).equal('ECONNREFUSED');
        }
      });
    });

    describe('authentication', () => {
      it('should throw an error if credentials are invalid', async () => {
        try {
          await new Client(_.defaults({ password: 'biz', username: 'foowrong' }, config.bitcoin)).getDifficulty();
        } catch (e) {
          should(e).be.an.instanceOf(RpcError);
          should(e.message).equal('Unauthorized');
          should(e.body).equal('');
          should(e.code).equal(401);
        }
      });
    });
  });
});
