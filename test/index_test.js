
/**
 * Module dependencies.
 */

import Client from '../src/index';
import RpcError from '../src/errors/rpc-error';
import _ from 'lodash';
import config from './config';
import methods from '../src/methods';
import nock from 'nock';
import parse from './utils/help-parser-util';
import should from 'should';

/**
 * Test `Client`.
 */

afterEach(() => {
  if (nock.pendingMocks().length) {
    throw new Error('Unexpected pending mocks');
  }

  nock.cleanAll();
});

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

    it('should have default timeout of 30000ms', () => {
      new Client().timeout.should.equal(30000);
    });

    it('should not have username/password authentication enabled by default', () => {
      should.not.exist(new Client().auth);
    });
  });

  describe('authentication', () => {
    it('should throw an error if credentials are invalid', async () => {
      try {
        await new Client(_.defaults({ password: 'biz', username: 'foo' }, config.bitcoind)).getDifficulty();
      } catch (e) {
        e.should.be.an.instanceOf(RpcError);
        e.message.should.equal('Unauthorized');
        e.code.should.equal(401);
        e.status.should.equal(401);
      }
    });
  });

  describe('batching', () => {
    it('should support batched requests', async () => {
      const batch = [];

      _.times(5, batch.push({ method: 'getnewaddress' }));

      const addresses = await new Client(config.bitcoind).command(batch);

      addresses.should.have.length(batch.length);
    });

    it('should support batch request parameters', async () => {
      const batch = [{ method: 'getnewaddress' }, { method: 'validateaddress', parameters: ['mkteeBFmGkraJaWN5WzqHCjmbQWVrPo5X3'] }];

      const [newAddress, addressValidation] = await new Client(config.bitcoind).command(batch);

      addressValidation.should.have.properties('address', 'isvalid', 'ismine', 'scriptPubKey');
      newAddress.should.be.a.String();
    });
  });

  describe('headers', () => {
    it('should return the response headers if `headers` is enabled', async () => {
      const [info, headers] = await new Client(_.defaults({ headers: true }, config.bitcoind)).getInfo();

      info.should.be.an.Object();
      headers.should.have.keys('date', 'connection', 'content-length', 'content-type');
    });

    it('should return the response headers if `headers` is enabled using callbacks', done => {
      new Client(_.defaults({ headers: true }, config.bitcoind)).getInfo((err, [info, headers]) => {
        should.not.exist(err);

        info.should.be.an.Object();

        headers.should.have.keys('date', 'connection', 'content-length', 'content-type');

        done();
      });
    });

    it('should return the response headers if `headers` is enabled and batching is used', async () => {
      const batch = [];

      _.times(5, () => batch.push({ method: 'getnewaddress' }));

      const [addresses, headers] = await new Client(_.defaults({ headers: true }, config.bitcoind)).command(batch);

      addresses.should.have.length(batch.length);
      headers.should.have.keys('date', 'connection', 'content-length', 'content-type');
    });

    it('should return the response headers if `headers` is enabled and batching is used with callbacks', done => {
      const batch = [];

      _.times(5, () => batch.push({ method: 'getnewaddress' }));

      new Client(_.defaults({ headers: true }, config.bitcoind)).command(batch, (err, [addresses, headers]) => {
        should.not.exist(err);

        addresses.should.have.length(batch.length);

        headers.should.have.keys('date', 'connection', 'content-length', 'content-type');

        done();
      });
    });
  });

  describe('methods', () => {
    describe('getAccountAddress()', () => {
      it('should retrieve an account address', async () => {
        const address = await client.getAccountAddress('test');
        const account = await client.getAccount(address);

        account.should.equal('test');
      });
    });

    describe('getBalance()', () => {
      it('should return the total server\'s balance', async () => {
        const balance = await new Client(config.bitcoind).getBalance();

        balance.should.be.a.Number();
      });
    });

    describe('getDifficulty()', () => {
      it('should return the proof-of-work difficulty', async () => {
        const difficulty = await new Client(config.bitcoind).getDifficulty();

        difficulty.should.be.a.String();
      });
    });

    describe('getInfo()', () => {
      it('should return information about the node and the network', async () => {
        const info = await new Client(config.bitcoind).getInfo();

        info.should.not.be.empty();
        info.errors.should.be.a.String();
      });
    });

    describe('getNewAddress()', () => {
      it('should return a new bitcoin address', async () => {
        await client.getNewAddress('test');

        const addresses = await client.getAddressesByAccount('test');

        addresses.length.should.be.above(1);
      });
    });

    describe('help()', () => {
      it('should return help', async () => {
        const help = await new Client(config.bitcoind).help();

        help.should.not.be.empty();
      });
    });

    describe('listTransactions()', () => {
      it('should return the most recent list of transactions from all accounts using specific count', async () => {
        const transactions = await new Client(config.bitcoind).listTransactions('test', 15);

        transactions.should.be.an.Array().and.empty();
      });

      it('should return the most recent list of transactions from all accounts using default count', async () => {
        const transactions = await new Client(config.bitcoind).listTransactions('test');

        transactions.should.be.an.Array().and.empty();
      });
    });
  });

  it('should have all the methods listed by `help`', async () => {
    const help = await new Client(config.bitcoind).help();

    _.difference(parse(help), _.invokeMap(Object.keys(methods), String.prototype.toLowerCase)).should.be.empty();
  });

  it('should support callbacks', done => {
    new Client(config.bitcoind).help((err, help) => {
      should.not.exist(err);

      help.should.not.be.empty();

      done();
    });
  });

  it('should throw an error if timeout is reached', async () => {
    try {
      await new Client(_.defaults({ timeout: 0.1 }, config.bitcoind)).listAccounts();

      should.fail();
    } catch (e) {
      e.should.be.an.instanceOf(Error);
      e.code.should.match(/(ETIMEDOUT|ESOCKETTIMEDOUT)/);
    }
  });

  it('should throw an error if version does not support a given method', async () => {
    try {
      await new Client({ version: '0.12.0' }).getHashesPerSec();

      should.fail();
    } catch (e) {
      e.should.be.an.instanceOf(Error);
      e.message.should.equal('Method "gethashespersec" is not supported by version "0.12.0"');
    }
  });

  it('should throw an error with a generic message if one is not returned on the response', async () => {
    nock(`http://${config.bitcoind.host}:${config.bitcoind.port}/`)
      .post('/')
      .reply(200, '{ "result": null, "error": { "code": -32601 }, "id": "69837016239933"}');

    try {
      await new Client(config.bitcoind).command('foobar');

      should.fail();
    } catch (e) {
      e.should.be.an.instanceOf(RpcError);
      e.message.should.equal('An error occurred while processing the RPC call to bitcoind');
      e.code.should.equal(-32601);
    }
  });

  it('should throw an error if the response does not include a `result`', async () => {
    nock(`http://${config.bitcoind.host}:${config.bitcoind.port}/`)
      .post('/')
      .reply(200, '{ "error": null, "id": "69837016239933"}');

    try {
      await new Client(config.bitcoind).command('foobar2');

      should.fail();
    } catch (e) {
      e.should.be.an.instanceOf(RpcError);
      e.message.should.equal('Missing `result` on the RPC call result');
      e.code.should.equal(-32700);
    }
  });

  it('should throw an error if a connection cannot be established', async () => {
    try {
      await new Client(_.defaults({ port: 9897 }, config.bitcoind)).getDifficulty();

      should.fail();
    } catch (e) {
      e.should.be.an.instanceOf(Error);
      e.message.should.match(/connect ECONNREFUSED/);
      e.code.should.equal('ECONNREFUSED');
    }
  });

  describe('rest', () => {
    before(async () => {
      const [tip] = await client.getChainTips();

      if (tip.height === 200) {
        return null;
      }

      await client.generate(200);
    });

    describe('getTransactionByHash()', () => {
      it('should return a transaction binary-encoded if extension is `bin`', async () => {
        const transaction = await client.getTransactionByHash('b4dd08f32be15d96b7166fd77afd18aece7480f72af6c9c7f9c5cbeb01e686fe', { extension: 'bin' });

        new Buffer(transaction, 'binary').toString('hex').should.endWith('206e6f7420666f756e640d0a');
      });

      it('should return a transaction hex-encoded if extension is `hex`', async () => {
        const [transaction] = await client.listUnspent();
        const hex = await client.getTransactionByHash(transaction.txid, { extension: 'hex' });

        hex.should.endWith('cf900000000\n');
      });

      it('should return a transaction json-encoded by default', async () => {
        const [transaction] = await client.listUnspent();
        const hex = await client.getTransactionByHash(transaction.txid);

        hex.should.have.keys('blockhash', 'locktime', 'hash', 'size', 'txid', 'version', 'vin', 'vout', 'vsize');
      });
    });

    describe('getBlockByHash()', () => {
      it('should return a block binary-encoded if extension is `bin`', async () => {
        const block = await client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'bin' });

        new Buffer(block, 'binary').toString('hex').should.equal('0100000000000000000000000000000000000000000000000000000000000000000000003bfdfdfd7a7b12fd7afd2c3e6776fd617ffd1bc8fd51323afdfdfd4b1e5e4afdfd494dfdfd7f20020000000101000000010000000000000000000000000000000000000000000000000000000000000000fdfdfdfd4d04fdfd001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73fdfdfdfd0100fd052a0100000043410467fdfdfdfd5548271967fdfd7130fd105ca828fd3909fd7962fdfd1f61b649fdfd3f4cfd38fdfd5504fd1efd12fd5c384dfdfd0bfd57fd4c702b6bfd1d5ffd00000000');
      });

      it('should return a block hex-encoded if extension is `hex`', async () => {
        const block = await client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'hex' });

        block.should.equal('0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4adae5494dffff7f20020000000101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff4d04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73ffffffff0100f2052a01000000434104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac00000000\n');
      });

      it('should return a block json-encoded by default', async () => {
        const block = await client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'json' });

        block.should.have.keys('bits', 'chainwork', 'confirmations', 'difficulty', 'hash', 'height', 'mediantime', 'merkleroot', 'nextblockhash', 'nonce', 'size', 'strippedsize', 'time', 'tx', 'version', 'versionHex', 'weight');
        block.tx.should.matchEach(value => value.should.be.an.Object());
      });

      it('should return a block summary json-encoded if `summary` is enabled', async () => {
        const block = await client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'json', summary: true });

        block.should.have.keys('bits', 'chainwork', 'confirmations', 'difficulty', 'hash', 'height', 'mediantime', 'merkleroot', 'nextblockhash', 'nonce', 'size', 'strippedsize', 'time', 'tx', 'version', 'versionHex', 'weight');
        block.tx.should.matchEach(value => value.should.be.a.String());
      });
    });

    describe('getBlockHeadersByHash()', () => {
      it('should return block headers binary-encoded if extension is `bin`', async () => {
        const headers = await client.getBlockHeadersByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', 1, { extension: 'bin' });

        new Buffer(headers, 'binary').toString('hex').should.equal('0100000000000000000000000000000000000000000000000000000000000000000000003bfdfdfd7a7b12fd7afd2c3e6776fd617ffd1bc8fd51323afdfdfd4b1e5e4afdfd494dfdfd7f2002000000');
      });

      it('should return block headers hex-encoded if extension is `hex`', async () => {
        const headers = await client.getBlockHeadersByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', 1, { extension: 'hex' });

        headers.should.equal('0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4adae5494dffff7f2002000000\n');
      });

      it('should return a block json-encoded by default', async () => {
        try {
          await client.getBlockHeadersByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', 1, { extension: 'json' });

          should.fail();
        } catch (e) {
          e.should.be.an.instanceOf(Error);
          e.message.should.equal('Extension "json" is not supported');
        }
      });
    });

    describe('getBlockchainInformation()', () => {
      it('should return blockchain information json-encoded by default', async () => {
        const information = await new Client(config.bitcoind).getBlockchainInformation();

        information.should.have.properties('bestblockhash', 'blocks', 'chain', 'chainwork', 'difficulty', 'headers', 'pruned', 'verificationprogress');
      });
    });

    describe('getUnspentTransactionOutputs()', () => {
      it('should return unspent transaction outputs hex-encoded if extension is `bin`', async () => {
        const result = await new Client(config.bitcoind).getUnspentTransactionOutputs([{
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 0
        }, {
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 1
        }], { extension: 'bin' });

        new Buffer(result, 'binary').toString('hex').should.endWith('010000');
      });

      it('should return unspent transaction outputs hex-encoded if extension is `hex`', async () => {
        const result = await new Client(config.bitcoind).getUnspentTransactionOutputs([{
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 0
        }, {
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 1
        }], { extension: 'hex' });

        result.should.endWith('010000\n');
      });

      it('should return unspent transaction outputs json-encoded by default', async () => {
        const result = await new Client(config.bitcoind).getUnspentTransactionOutputs([{
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 0
        }, {
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 1
        }]);

        result.should.have.keys('bitmap', 'chainHeight', 'chaintipHash', 'utxos');
        result.chainHeight.should.be.a.Number();
      });
    });

    describe('getMemoryPoolContent()', () => {
      it('should return memory pool content json-encoded by default', async () => {
        const content = await new Client(config.bitcoind).getMemoryPoolContent();

        content.should.eql({});
      });
    });

    describe('getMemoryPoolInformation()', () => {
      it('should return memory pool information json-encoded by default', async () => {
        const information = await new Client(config.bitcoind).getMemoryPoolInformation();

        information.should.eql({
          bytes: 0,
          maxmempool: 300000000,
          mempoolminfee: 0,
          size: 0,
          usage: 0
        });
      });
    });
  });
});
