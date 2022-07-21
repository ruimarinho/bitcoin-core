
/**
 * Module dependencies.
 */

import Client from '../src/index';
import RpcError from '../src/errors/rpc-error';
import _ from 'lodash';
import config from './config';
import fs from 'fs';
import methods from '../src/methods';
import parse from './utils/help-parser-util';
import path from 'path';
import should from 'should';

/**
 * Test `Client`.
 */

describe('Client', () => {
  before(async () => {
    const client = new Client(config.bitcoin);
    const [tip] = await client.getChainTips();

    if (tip.height >= 200) {
      return null;
    }

    await client.generate(200);
  });

  describe('constructor', () => {
    it('should throw an error if network is invalid', () => {
      try {
        new Client(_.defaults({ network: 'foo' }, config.bitcoin)); // eslint-disable-line no-new

        should.fail();
      } catch (error) {
        should(error).be.an.instanceOf(Error);
        should(error.message).equal('Invalid network name "foo"');
      }
    });

    it('should not have `agentOptions` set by default', () => {
      should.not.exist(new Client().agentOptions);
    });

    it('should not return headers by default', () => {
      should(new Client().headers).be.false();
    });

    it('should have default host set to `localhost`', () => {
      should(new Client().host).equal('localhost');
    });

    it('should not have a password set by default', () => {
      should.not.exist(new Client().password);
    });

    it('should have default port set to `mainnet`\'s one', () => {
      should(new Client().port).equal(8332);
    });

    it('should set default to port `8332` if network is `mainnet`', () => {
      should(new Client({ network: 'mainnet' }).port).equal(8332);
    });

    it('should set default to port `18332` if network is `testnet`', () => {
      should(new Client({ network: 'testnet' }).port).equal(18332);
    });

    it('should set default to port `18332` if network is `regtest`', () => {
      should(new Client({ network: 'regtest' }).port).equal(18332);
    });

    it('should not have ssl enabled by default', () => {
      should(new Client().ssl.enabled).equal(false);
      should(new Client().ssl.strict).equal(false);
    });

    it('should have default timeout of 30000ms', () => {
      should(new Client().timeout).equal(30000);
    });

    it('should not have username/password authentication enabled by default', () => {
      should.not.exist(new Client().auth);
    });

    it('should have all the methods listed by `help`', async () => {
      const help = await new Client(config.bitcoin).help();

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
      it.skip('should throw an error if timeout is reached', async () => {
        try {
          await new Client(_.defaults({ timeout: 1 }, config.bitcoin)).listAccounts();

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
          await new Client(_.defaults({ port: 9897 }, config.bitcoin)).getDifficulty();

          should.fail();
        } catch (e) {
          should(e).be.an.instanceOf(Error);
          should(e.message).match(/connect ECONNREFUSED/);
          should(e.code).equal('ECONNREFUSED');
        }
      });
    });

    describe('ssl', () => {
      it('should use `ssl.strict` by default when `ssl` is enabled', () => {
        const sslClient = new Client(_.defaults({ host: config.bitcoinSsl.host, port: config.bitcoinSsl.port, ssl: true }, config.bitcoin));

        should(sslClient.ssl.strict).be.true();
      });

      it('should throw an error if certificate is self signed by default', async () => {
        const sslClient = new Client(_.defaults({ host: config.bitcoinSsl.host, port: config.bitcoinSsl.port, ssl: true }, config.bitcoin));

        should(sslClient.ssl.strict).be.true();

        try {
          await sslClient.getInfo();
        } catch (e) {
          should(e).be.an.instanceOf(Error);
          should(e.code).equal('DEPTH_ZERO_SELF_SIGNED_CERT');
          should(e.message).match(/self[ -]signed certificate/);
        }
      });

      it('should establish a connection if certificate is self signed but `ca` agent option is passed', async () => {
        const sslClient = new Client(_.defaults({
          agentOptions: {
            /* eslint-disable no-sync */
            ca: fs.readFileSync(path.join(__dirname, '/config/ssl/cert.pem')),
            checkServerIdentity() {
              // Skip server identity checks otherwise the certificate would be immediately rejected
              // as connecting to an IP not listed in the `altname` fails.
              return;
            }
          },
          host: config.bitcoinSsl.host,
          port: config.bitcoinSsl.port,
          ssl: true
        }, config.bitcoin));

        const info = await sslClient.getInfo();

        should(info).not.be.empty();
      });

      it('should establish a connection if certificate is self signed but `ssl.strict` is disabled', async () => {
        const sslClient = new Client(_.defaults({ host: config.bitcoinSsl.host, port: config.bitcoinSsl.port, ssl: { enabled: true, strict: false } }, config.bitcoin));
        const info = await sslClient.getInfo();

        should(info).not.be.empty();
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

      it('should support username only authentication', async () => {
        const difficulty = await new Client(config.bitcoinUsernameOnly).getDifficulty();

        should(difficulty).equal(0);
      });
    });
  });
});
