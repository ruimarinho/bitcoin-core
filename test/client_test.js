
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
        error.should.be.an.instanceOf(Error);
        error.message.should.equal('Invalid network name "foo"');
      }
    });

    it('should not have `agentOptions` set by default', () => {
      should.not.exist(new Client().agentOptions);
    });

    it('should not return headers by default', () => {
      new Client().headers.should.be.false();
    });

    it('should have default host set to `localhost`', () => {
      new Client().host.should.equal('localhost');
    });

    it('should not have a password set by default', () => {
      should.not.exist(new Client().password);
    });

    it('should have default port set to `mainnet`\'s one', () => {
      new Client().port.should.equal(8332);
    });

    it('should set default to port `8332` if network is `mainnet`', () => {
      new Client({ network: 'mainnet' }).port.should.equal(8332);
    });

    it('should set default to port `18332` if network is `testnet`', () => {
      new Client({ network: 'testnet' }).port.should.equal(18332);
    });

    it('should set default to port `18332` if network is `regtest`', () => {
      new Client({ network: 'regtest' }).port.should.equal(18332);
    });

    it('should not have ssl enabled by default', () => {
      new Client().ssl.enabled.should.equal(false);
      new Client().ssl.strict.should.equal(false);
    });

    it('should have default timeout of 30000ms', () => {
      new Client().timeout.should.equal(30000);
    });

    it('should not have username/password authentication enabled by default', () => {
      should.not.exist(new Client().auth);
    });

    it('should have all the methods listed by `help`', async () => {
      const help = await new Client(config.bitcoin).help();

      _.difference(_.without(parse(help), 'getaddressbyaccount'), _.invokeMap(Object.keys(methods), String.prototype.toLowerCase)).should.be.empty();
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
          await new Client(_.defaults({ timeout: 0.1 }, config.bitcoin)).listAccounts();

          should.fail();
        } catch (e) {
          e.should.be.an.instanceOf(Error);
          e.code.should.match(/(ETIMEDOUT|ESOCKETTIMEDOUT)/);
        }
      });

      it('should throw an error if version is invalid', async () => {
        try {
          await new Client({ version: '0.12' }).getHashesPerSec();

          should.fail();
        } catch (e) {
          e.should.be.an.instanceOf(Error);
          e.message.should.equal('Invalid Version "0.12"');
        }
      });

      it('should throw an error if a connection cannot be established', async () => {
        try {
          await new Client(_.defaults({ port: 9897 }, config.bitcoin)).getDifficulty();

          should.fail();
        } catch (e) {
          e.should.be.an.instanceOf(Error);
          e.message.should.match(/connect ECONNREFUSED/);
          e.code.should.equal('ECONNREFUSED');
        }
      });
    });

    describe('ssl', () => {
      it('should use `ssl.strict` by default when `ssl` is enabled', () => {
        const sslClient = new Client(_.defaults({ host: config.bitcoinSsl.host, port: config.bitcoinSsl.port, ssl: true }, config.bitcoin));

        sslClient.ssl.strict.should.be.true();
      });

      it('should throw an error if certificate is self signed by default', async () => {
        const sslClient = new Client(_.defaults({ host: config.bitcoinSsl.host, port: config.bitcoinSsl.port, ssl: true }, config.bitcoin));

        sslClient.ssl.strict.should.be.true();

        try {
          await sslClient.getInfo();
        } catch (e) {
          e.should.be.an.instanceOf(Error);
          e.code.should.equal('DEPTH_ZERO_SELF_SIGNED_CERT');
          e.message.should.equal('self signed certificate');
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

        info.should.not.be.empty();
      });

      it('should establish a connection if certificate is self signed but `ssl.strict` is disabled', async () => {
        const sslClient = new Client(_.defaults({ host: config.bitcoinSsl.host, port: config.bitcoinSsl.port, ssl: { enabled: true, strict: false } }, config.bitcoin));
        const info = await sslClient.getInfo();

        info.should.not.be.empty();
      });
    });

    describe('authentication', () => {
      it('should throw an error if credentials are invalid', async () => {
        try {
          await new Client(_.defaults({ password: 'biz', username: 'foowrong' }, config.bitcoin)).getDifficulty();
        } catch (e) {
          e.should.be.an.instanceOf(RpcError);
          e.message.should.equal('Unauthorized');
          e.body.should.equal('');
          e.code.should.equal(401);
        }
      });

      it('should support username only authentication', async () => {
        const difficulty = await new Client(config.bitcoinUsernameOnly).getDifficulty();

        difficulty.should.equal(0);
      });
    });
  });
});
