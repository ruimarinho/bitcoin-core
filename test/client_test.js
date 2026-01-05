
/**
 * Module dependencies.
 */

const { generateWalletFunds, parse } = require('./utils/helper');
const _ = require('lodash');
const Client = require('../src/index');
const RpcError = require('../src/errors/rpc-error');
const config = require('./config');
const methods = require('../src/methods');

/**
 * Test `Client`.
 */

describe('Client', () => {
  let client;

  beforeAll(async () => {
    client = new Client(config.bitcoin);

    await generateWalletFunds(client, 'test');
  });

  describe('constructor', () => {
    it('should not have `agentOptions` set by default', () => {
      expect(new Client().agentOptions).toBeUndefined();
    });

    it('should have default host set to `localhost`', () => {
      expect(new Client().host).toEqual('http://localhost:8332');
    });

    it('should not have a password set by default', () => {
      expect(new Client().password).toBeUndefined();
    });

    it('should have default timeout of 30000ms', () => {
      expect(new Client().timeout).toEqual(30000);
    });

    it('should not have username/password authentication enabled by default', () => {
      expect(new Client().auth).toBeUndefined();
    });

    it('should have all the methods listed by `help`', async () => {
      const help = await client.help();

      expect(_.difference(_.without(parse(help), 'getaddressbyaccount'), _.invokeMap(Object.keys(methods), String.prototype.toLowerCase))).toHaveLength(0);
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
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e.code).toMatch(/(ETIMEDOUT|ESOCKETTIMEDOUT)/);
        }
      });

      it('should throw an error if version is invalid', async () => {
        try {
          await new Client({ version: '0.12' }).getHashesPerSec();
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e.message).toEqual('Invalid Version "0.12"');
        }
      });

      it('should throw an error if a connection cannot be established', async () => {
        try {
          await (new Client(_.defaults({ host: 'http://localhost:9897' }, config.bitcoin))).getDifficulty();
        } catch (e) {
          // TODO: why this returns AggregateError instead of Error?
          expect(e.name).toBe('AggregateError');
          expect(e.code).toEqual('ECONNREFUSED');
        }
      });
    });

    describe('authentication', () => {
      it('should throw an error if credentials are invalid', async () => {
        try {
          await new Client(_.defaults({ password: 'biz', username: 'foowrong' }, config.bitcoin)).getDifficulty();
        } catch (e) {
          expect(e).toBeInstanceOf(RpcError);
          expect(e.message).toEqual('Unauthorized');
          expect(e.body).toEqual('');
          expect(e.code).toEqual(401);
        }
      });
    });
  });
});
