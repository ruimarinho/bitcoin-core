
/**
 * Module dependencies.
 */

import _ from 'lodash';
import Client from '../src/index';
import RpcError from '../src/errors/rpc-error';
import config from './config';
import fs from 'fs';
import methods from '../src/methods';
import nock from 'nock';
import parse from './utils/help-parser-util';
import path from 'path';
import should from 'should';

/**
 * Test `Client`.
 */

describe('Client', () => {
  const client = new Client(config.bitcoind);

  describe('constructor', () => {
    it('should throw an error if network is invalid', () => {
      try {
        /*eslint-disable*/
        new Client(_.defaults({ network: 'foo' }, config.bitcoind));
        /*eslint-enable*/

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
  });

  describe('authentication', () => {
    it('should throw an error if credentials are invalid', () => {
      return new Client(_.defaults({ password: 'biz', username: 'foo' }, config.bitcoind)).getDifficulty()
        .then(should.fail)
        .catch((error) => {
          error.should.be.an.instanceOf(RpcError);
          error.message.should.equal('Unauthorized');
          error.code.should.equal(401);
          error.status.should.equal(401);
        });
    });

    it('should support username only authentication', () => {
      return new Client(config.bitcoindUsernameOnly).getDifficulty().then((difficulty) => difficulty.should.equal(0));
    });
  });

  describe('batching', () => {
    it('should support batched requests', () => {
      const batch = [];

      _.times(5, batch.push({ method: 'getnewaddress' }));

      return new Client(config.bitcoind).command(batch).then((addresses) => addresses.should.have.length(batch.length));
    });

    it('should support batch request parameters', () => {
      const batch = [{ method: 'getnewaddress' }, { method: 'validateaddress', parameters: ['mkteeBFmGkraJaWN5WzqHCjmbQWVrPo5X3'] }];

      return new Client(config.bitcoind).command(batch).then(([newAddress, addressValidation]) => {
        addressValidation.should.have.properties('address', 'isvalid', 'ismine', 'scriptPubKey');
        newAddress.should.be.a.String();
      });
    });
  });

  describe('headers', () => {
    it('should return the response headers if `headers` is enabled', () => {
      return new Client(_.defaults({ headers: true }, config.bitcoind)).getInfo()
        .then(([info, headers]) => {
          info.should.be.an.Object();

          headers.should.have.keys('date', 'connection', 'content-length', 'content-type');
        });
    });

    it('should return the response headers if `headers` is enabled using callbacks', (done) => {
      new Client(_.defaults({ headers: true }, config.bitcoind)).getInfo((err, [info, headers]) => {
        should.not.exist(err);

        info.should.be.an.Object();

        headers.should.have.keys('date', 'connection', 'content-length', 'content-type');

        done();
      });
    });

    it('should return the response headers if `headers` is enabled and batching is used', () => {
      const batch = [];

      _.times(5, () => batch.push({ method: 'getnewaddress' }));

      return new Client(_.defaults({ headers: true }, config.bitcoind)).command(batch)
        .then(([addresses, headers]) => {
          addresses.should.have.length(batch.length);

          headers.should.have.keys('date', 'connection', 'content-length', 'content-type');
        });
    });

    it('should return the response headers if `headers` is enabled and batching is used with callbacks', (done) => {
      const batch = [];

      _.times(5, () => batch.push({ method: 'getnewaddress' }));

      return new Client(_.defaults({ headers: true }, config.bitcoind)).command(batch, (err, [addresses, headers]) => {
        should.not.exist(err);

        addresses.should.have.length(batch.length);

        headers.should.have.keys('date', 'connection', 'content-length', 'content-type');

        done();
      });
    });
  });

  describe('methods', () => {
    describe('getAccountAddress()', () => {
      it('should retrieve an account address', () => {
        return client.getAccountAddress('test')
          .then(client.getAccount)
          .then((account) => account.should.equal('test'));
      });
    });

    describe('getBalance()', () => {
      it('should return the total server\'s balance', () => {
        return new Client(config.bitcoind).getBalance().then((balance) => balance.should.be.a.number);
      });
    });

    describe('getDifficulty()', () => {
      it('should return the proof-of-work difficulty', () => {
        return new Client(config.bitcoind).getDifficulty().then((difficulty) => difficulty.should.be.a.number);
      });
    });

    describe('getInfo()', () => {
      it('should return information about the node and the network', () => {
        return new Client(config.bitcoind).getInfo().then((info) => {
          info.should.not.be.empty();
          info.errors.should.be.a.String();
        });
      });
    });

    describe('getNewAddress()', () => {
      it('should return a new bitcoin address', () => {
        return client.getNewAddress('test')
        .then(() => client.getAddressesByAccount('test'))
        .then((addresses) => addresses.length.should.be.above(1));
      });
    });

    describe('help()', () => {
      it('should return help', () => {
        return new Client(config.bitcoind).help().then((help) => help.should.not.be.empty());
      });
    });

    describe('listTransactions()', () => {
      it('should return the most recent list of transactions from all accounts using specific count', () => {
        return new Client(config.bitcoind).listTransactions('test', 15).then((transactions) => {
          transactions.should.be.an.Array().and.empty();
        });
      });

      it('should return the most recent list of transactions from all accounts using default count', () => {
        return new Client(config.bitcoind).listTransactions('test').then((transactions) => {
          transactions.should.be.an.Array().and.empty();
        });
      });
    });
  });

  describe('ssl', () => {
    it('should use `ssl.strict` by default when `ssl` is enabled', () => {
      const sslClient = new Client(_.defaults({ host: config.bitcoindSsl.host, port: config.bitcoindSsl.port, ssl: true }, config.bitcoind));

      sslClient.ssl.strict.should.be.true();
    });

    it('should throw an error if certificate is self signed by default', () => {
      const sslClient = new Client(_.defaults({ host: config.bitcoindSsl.host, port: config.bitcoindSsl.port, ssl: true }, config.bitcoind));

      sslClient.ssl.strict.should.be.true();

      return sslClient.getInfo()
        .then(should.fail)
        .catch((error) => {
          error.should.be.an.instanceOf(Error);
          error.code.should.equal('DEPTH_ZERO_SELF_SIGNED_CERT');
          error.message.should.equal('self signed certificate');
        });
    });

    it('should establish a connection if certificate is self signed but `ca` agent option is passed', () => {
      const sslClient = new Client(_.defaults({
        agentOptions: {
          /*eslint-disable no-sync */
          ca: fs.readFileSync(path.join(__dirname, '/config/ssl/cert.pem')),
          checkServerIdentity() {
            // Skip server identity checks otherwise the certificate would be immediately rejected
            // as connecting to an IP not listed in the `altname` fails.
            return;
          }
        },
        host: config.bitcoindSsl.host,
        port: config.bitcoindSsl.port,
        ssl: true
      }, config.bitcoind));

      return sslClient.getInfo().then((info) => info.should.not.be.empty());
    });

    it('should establish a connection if certificate is self signed but `ssl.strict` is disabled', () => {
      const sslClient = new Client(_.defaults({ host: config.bitcoindSsl.host, port: config.bitcoindSsl.port, ssl: { enabled: true, strict: false } }, config.bitcoind));

      return sslClient.getInfo().then((info) => info.should.not.be.empty());
    });
  });

  it('should have all the methods listed by `help`', () => {
    return new Client(config.bitcoind).help()
      .then((help) => {
        _.difference(parse(help), _.invokeMap(Object.keys(methods), String.prototype.toLowerCase)).should.be.empty();
      }
    );
  });

  it('should support callbacks', (done) => {
    return new Client(config.bitcoind).help((err, help) => {
      should.not.exist(err);

      help.should.not.be.empty();

      done();
    });
  });

  it('should throw an error if timeout is reached', () => {
    return new Client(_.defaults({ timeout: 0.1 }, config.bitcoind)).listAccounts()
      .then(should.fail)
      .catch((error) => {
        error.should.be.an.instanceOf(Error);
        error.code.should.match(/(ETIMEDOUT|ESOCKETTIMEDOUT)/);
      });
  });

  it('should throw an error if version does not support a given method', () => {
    return new Client({ version: '0.12.0' }).getHashesPerSec()
      .then(should.fail)
      .catch((error) => {
        error.should.be.an.instanceOf(Error);
        error.message.should.equal('Method "gethashespersec" is not supported by version "0.12.0"');
      });
  });

  it('should throw an error with a generic message if one is not returned on the response', () => {
    nock(`http://${config.bitcoind.host}:${config.bitcoind.port}/`)
      .post('/')
      .reply(200, '{ "result": null, "error": { "code": -32601 }, "id": "69837016239933"}');

    return new Client(config.bitcoind).command('foobar')
      .then(should.fail)
      .catch((error) => {
        error.should.be.an.instanceOf(RpcError);
        error.message.should.equal('An error occurred while processing the RPC call to bitcoind');
        error.code.should.equal(-32601);
      })
      .finally(() => nock.cleanAll());
  });

  it('should throw an error if the response does not include a `result`', () => {
    nock(`http://${config.bitcoind.host}:${config.bitcoind.port}/`)
      .post('/')
      .reply(200, '{ "error": null, "id": "69837016239933"}');

    return new Client(config.bitcoind).command('foobar2')
      .then(should.fail)
      .catch((error) => {
        error.should.be.an.instanceOf(RpcError);
        error.message.should.equal('Missing `result` on the RPC call result');
        error.code.should.equal(-32700);
      })
      .finally(() => nock.cleanAll());
  });

  it('should throw an error if a connection cannot be established', () => {
    return new Client(_.defaults({ port: 9897 }, config.bitcoind)).getDifficulty()
      .then(should.fail)
      .catch((error) => {
        error.should.be.an.instanceOf(Error);
        error.message.should.match(/connect ECONNREFUSED/);
        error.code.should.equal('ECONNREFUSED');
      });
  });

  describe('rest', () => {
    before(() => {
      return client.getChainTips().then(([tip]) => {
        if (tip.height === 200) {
          return null;
        }

        return client.generate(200);
      });
    });

    describe('getTransactionByHash()', () => {
      it('should return a transaction binary-encoded if extension is `bin`', () => {
        return client.getTransactionByHash('b4dd08f32be15d96b7166fd77afd18aece7480f72af6c9c7f9c5cbeb01e686fe', { extension: 'bin' })
          .then((transaction) => new Buffer(transaction, 'binary').toString('hex').should.endWith('206e6f7420666f756e640d0a'));
      });

      it('should return a transaction hex-encoded if extension is `hex`', () => {
        return client.listUnspent()
          .then(([transaction]) => client.getTransactionByHash(transaction.txid, { extension: 'hex' }))
          .then((transaction) => transaction.should.endWith('ac00000000\n'));
      });

      it('should return a transaction json-encoded by default', () => {
        return client.listUnspent()
          .then(([transaction]) => client.getTransactionByHash(transaction.txid))
          .then((transaction) => transaction.should.have.keys('blockhash', 'blocktime', 'confirmations', 'locktime', 'size', 'time', 'txid', 'version', 'vin', 'vout'));
      });
    });

    describe('getBlockByHash()', () => {
      it('should return a block binary-encoded if extension is `bin`', () => {
        return client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'bin' })
          .then((block) => new Buffer(block, 'binary').toString('hex').should.equal('0100000000000000000000000000000000000000000000000000000000000000000000003bfdfdfd7a7b12fd7afd2c3e6776fd617ffd1bc8fd51323afdfdfd4b1e5e4afdfd494dfdfd7f20020000000101000000010000000000000000000000000000000000000000000000000000000000000000fdfdfdfd4d04fdfd001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73fdfdfdfd0100fd052a0100000043410467fdfdfdfd5548271967fdfd7130fd105ca828fd3909fd7962fdfd1f61b649fdfd3f4cfd38fdfd5504fd1efd12fd5c384dfdfd0bfd57fd4c702b6bfd1d5ffd00000000'));
      });

      it('should return a block hex-encoded if extension is `hex`', () => {
        return client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'hex' })
          .then((block) => block.should.equal('0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4adae5494dffff7f20020000000101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff4d04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73ffffffff0100f2052a01000000434104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac00000000\n'));
      });

      it('should return a block json-encoded by default', () => {
        return client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'json' })
          .then((block) => {
            block.should.have.keys('bits', 'chainwork', 'confirmations', 'difficulty', 'hash', 'height', 'mediantime', 'merkleroot', 'nextblockhash', 'nonce', 'size', 'time', 'tx', 'version');
            block.tx.should.matchEach((value) => value.should.be.an.Object());
          });
      });

      it('should return a block summary json-encoded if `summary` is enabled', () => {
        return client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'json', summary: true })
          .then((block) => {
            block.should.have.keys('bits', 'chainwork', 'confirmations', 'difficulty', 'hash', 'height', 'mediantime', 'merkleroot', 'nextblockhash', 'nonce', 'size', 'time', 'tx', 'version');
            block.tx.should.matchEach((value) => value.should.be.a.String());
          });
      });
    });

    describe('getBlockHeadersByHash()', () => {
      it('should return block headers binary-encoded if extension is `bin`', () => {
        return client.getBlockHeadersByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', 1, { extension: 'bin' })
          .then((headers) => new Buffer(headers, 'binary').toString('hex').should.equal('0100000000000000000000000000000000000000000000000000000000000000000000003bfdfdfd7a7b12fd7afd2c3e6776fd617ffd1bc8fd51323afdfdfd4b1e5e4afdfd494dfdfd7f2002000000'));
      });

      it('should return block headers hex-encoded if extension is `hex`', () => {
        return client.getBlockHeadersByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', 1, { extension: 'hex' })
          .then((headers) => headers.should.equal('0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4adae5494dffff7f2002000000\n'));
      });

      it('should return a block json-encoded by default', () => {
        return client.getBlockHeadersByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', 1, { extension: 'json' })
          .then(should.fail)
          .catch((e) => {
            e.should.be.an.instanceOf(Error);
            e.message.should.equal('Extension "json" is not supported');
          });
      });
    });

    describe('getBlockchainInformation()', () => {
      it('should return blockchain information json-encoded by default', () => {
        return new Client(config.bitcoind).getBlockchainInformation()
          .then((information) => information.should.have.properties('bestblockhash', 'blocks', 'chain', 'chainwork', 'difficulty', 'headers', 'pruned', 'verificationprogress'));
      });
    });

    describe('getUnspentTransactionOutputs()', () => {
      it('should return unspent transaction outputs hex-encoded if extension is `bin`', () => {
        return new Client(config.bitcoind).getUnspentTransactionOutputs([{
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 0
        }, {
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 1
        }], { extension: 'bin' }).then((result) => new Buffer(result, 'binary').toString('hex').should.endWith('010000'));
      });

      it('should return unspent transaction outputs hex-encoded if extension is `hex`', () => {
        return new Client(config.bitcoind).getUnspentTransactionOutputs([{
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 0
        }, {
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 1
        }], { extension: 'hex' }).then((result) => result.should.endWith('010000\n'));
      });

      it('should return unspent transaction outputs json-encoded by default', () => {
        return new Client(config.bitcoind).getUnspentTransactionOutputs([{
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 0
        }, {
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 1
        }]).then((result) => {
          result.should.have.keys('bitmap', 'chainHeight', 'chaintipHash', 'utxos');
          result.chainHeight.should.equal(200);
        });
      });
    });

    describe('getMemoryPoolContent()', () => {
      it('should return memory pool content json-encoded by default', () => {
        return new Client(config.bitcoind).getMemoryPoolContent()
          .then((content) => content.should.eql({}));
      });
    });

    describe('getMemoryPoolInformation()', () => {
      it('should return memory pool information json-encoded by default', () => {
        return new Client(config.bitcoind).getMemoryPoolContent()
          .then((information) => information.should.eql({}));
      });
    });
  });
});
