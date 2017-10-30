
/**
 * Module dependencies.
 */

import Client from '../src/index';
import RpcError from '../src/errors/rpc-error';
import _ from 'lodash';
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

before(async () => {
  const client = new Client(config.bitcoind);
  const [tip] = await client.getChainTips();

  if (tip.height === 200) {
    return null;
  }

  await client.generate(200);
});

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
        new Client(_.defaults({ network: 'foo' }, config.bitcoind)); // eslint-disable-line no-new

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
    it('should throw an error if credentials are invalid', async () => {
      try {
        await new Client(_.defaults({ password: 'biz', username: 'foo' }, config.bitcoind)).getDifficulty();
      } catch (e) {
        e.should.be.an.instanceOf(RpcError);
        e.message.should.equal('Unauthorized');
        e.body.should.equal('');
        e.code.should.equal(401);
      }
    });

    it('should support username only authentication', async () => {
      const difficulty = await new Client(config.bitcoindUsernameOnly).getDifficulty();

      difficulty.should.equal(0);
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

      addressValidation.should.have.properties('address', 'ismine', 'isvalid', 'scriptPubKey');
      newAddress.should.be.a.String();
    });

    it('should return an error if one of the request fails', async () => {
      const batch = [{ method: 'foobar' }, { method: 'validateaddress', parameters: ['mkteeBFmGkraJaWN5WzqHCjmbQWVrPo5X3'] }];

      const [newAddressError, addressValidation] = await new Client(config.bitcoind).command(batch);

      addressValidation.should.have.properties('address', 'ismine', 'isvalid', 'scriptPubKey');
      newAddressError.should.be.an.instanceOf(RpcError);
      newAddressError.message.should.equal('Method not found');
      newAddressError.code.should.equal(-32601);
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

      it('should support named parameters', async () => {
        const client = new Client(_.defaults({ version: '0.15.0' }, config.bitcoind));

        // Make sure that the balance on the main wallet is always higher than the one on the test wallet.
        await client.generate(51);

        const mainWalletBalance = await client.getBalance({ account: '*', minconf: 0 });
        const mainWalletBalanceWithoutParameters = await client.getBalance('*', 0);
        const testWalletBalance = await client.getBalance({ account: 'test', minconf: 0 });

        mainWalletBalance.should.not.equal(testWalletBalance);
        mainWalletBalanceWithoutParameters.should.equal(mainWalletBalance);
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
        const address = await client.getNewAddress('test');

        // Generate 5 transactions.
        for (let i = 0; i < 5; i++) {
          await client.sendToAddress(address, 0.1);
        }

        const transactions = await new Client(config.bitcoind).listTransactions('test', 5);

        transactions.should.be.an.Array();
        transactions.length.should.be.greaterThanOrEqual(5);
      });

      it('should return the most recent list of transactions from all accounts using default count', async () => {
        const transactions = await new Client(config.bitcoind).listTransactions('test');

        transactions.should.be.an.Array();
        transactions.should.matchEach(value => {
          value.should.have.keys(
            'account',
            'address',
            'amount',
            'bip125-replaceable',
            'category',
            'confirmations',
            'label',
            'time',
            'timereceived',
            'trusted',
            'txid',
            'vout',
            'walletconflicts'
          );
        });
      });

      it('should support named parameters', async () => {
        const address = await client.getNewAddress('test');

        // Generate 5 transactions.
        for (let i = 0; i < 5; i++) {
          await client.sendToAddress(address, 0.1);
        }

        let transactions = await new Client(_.defaults({ version: '0.15.0' }, config.bitcoind)).listTransactions({ account: 'test' });

        transactions.should.be.an.Array();
        transactions.length.should.be.greaterThanOrEqual(5);

        // Make sure `count` is read correctly.
        transactions = await new Client(_.defaults({ version: '0.15.0' }, config.bitcoind)).listTransactions({ account: 'test', count: 1 });

        transactions.should.be.an.Array();
        transactions.should.have.length(1);
      });
    });
  });

  describe('ssl', () => {
    it('should use `ssl.strict` by default when `ssl` is enabled', () => {
      const sslClient = new Client(_.defaults({ host: config.bitcoindSsl.host, port: config.bitcoindSsl.port, ssl: true }, config.bitcoind));

      sslClient.ssl.strict.should.be.true();
    });

    it('should throw an error if certificate is self signed by default', async () => {
      const sslClient = new Client(_.defaults({ host: config.bitcoindSsl.host, port: config.bitcoindSsl.port, ssl: true }, config.bitcoind));

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
        host: config.bitcoindSsl.host,
        port: config.bitcoindSsl.port,
        ssl: true
      }, config.bitcoind));

      const info = await sslClient.getInfo();

      info.should.not.be.empty();
    });

    it('should establish a connection if certificate is self signed but `ssl.strict` is disabled', async () => {
      const sslClient = new Client(_.defaults({ host: config.bitcoindSsl.host, port: config.bitcoindSsl.port, ssl: { enabled: true, strict: false } }, config.bitcoind));
      const info = await sslClient.getInfo();

      info.should.not.be.empty();
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

  it('should throw an error if version is invalid', async () => {
    try {
      await new Client({ version: '0.12' }).getHashesPerSec();

      should.fail();
    } catch (e) {
      e.should.be.an.instanceOf(Error);
      e.message.should.equal('Invalid Version "0.12"');
    }
  });

  it('should accept valid versions', async () => {
    await new Client(_.defaults({ version: '0.15.0.1' }, config.bitcoind)).getInfo();
    await new Client(_.defaults({ version: '0.15.0' }, config.bitcoind)).getInfo();
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
    describe('getTransactionByHash()', () => {
      it('should return a transaction json-encoded by default', async () => {
        const [{ txid }] = await client.listUnspent();
        const transaction = await client.getTransactionByHash(txid);

        transaction.should.have.keys('blockhash', 'locktime', 'hash', 'size', 'txid', 'version', 'vin', 'vout', 'vsize');
      });

      it('should return a transaction hex-encoded if extension is `hex`', async () => {
        const [{ txid }] = await client.listUnspent();
        const { hex: rawTransaction } = await client.getTransaction(txid);
        const hexTransaction = await client.getTransactionByHash(txid, { extension: 'hex' });

        hexTransaction.should.equal(`${rawTransaction}\n`);
      });

      it('should return a transaction binary-encoded if extension is `bin`', async () => {
        const [{ txid }] = await client.listUnspent();
        const binaryTransaction = await client.getTransactionByHash(txid, { extension: 'bin' });
        const hexTransaction = await client.getTransactionByHash(txid, { extension: 'hex' });

        binaryTransaction.should.be.instanceOf(Buffer);
        hexTransaction.should.equal(`${binaryTransaction.toString('hex')}\n`);
      });
    });

    describe('getBlockByHash()', () => {
      it('should return a block json-encoded by default', async () => {
        const block = await client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'json' });

        block.should.have.keys('bits', 'chainwork', 'confirmations', 'difficulty', 'hash', 'height', 'mediantime', 'merkleroot', 'nextblockhash', 'nonce', 'size', 'strippedsize', 'time', 'tx', 'version', 'versionHex', 'weight');
        block.tx.should.matchEach(value => value.should.be.an.Object());
      });

      it('should return a block hex-encoded if extension is `hex`', async () => {
        const block = await client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'hex' });

        block.should.equal('0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4adae5494dffff7f20020000000101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff4d04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73ffffffff0100f2052a01000000434104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac00000000\n');
      });

      it('should return a block binary-encoded if extension is `bin`', async () => {
        const block = await client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'bin' });

        block.should.be.instanceOf(Buffer);
        block.toString('hex').should.equal('0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4adae5494dffff7f20020000000101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff4d04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73ffffffff0100f2052a01000000434104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac00000000');
      });

      it('should return a block summary json-encoded if `summary` is enabled', async () => {
        const block = await client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'json', summary: true });

        block.should.have.keys('bits', 'chainwork', 'confirmations', 'difficulty', 'hash', 'height', 'mediantime', 'merkleroot', 'nextblockhash', 'nonce', 'size', 'strippedsize', 'time', 'tx', 'version', 'versionHex', 'weight');
        block.tx.should.matchEach(value => value.should.be.a.String());
      });
    });

    describe('getBlockHeadersByHash()', () => {
      it('should return a block json-encoded by default', async () => {
        try {
          await client.getBlockHeadersByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', 1, { extension: 'json' });

          should.fail();
        } catch (e) {
          e.should.be.an.instanceOf(Error);
          e.message.should.equal('Extension "json" is not supported');
        }
      });

      it('should return block headers hex-encoded if extension is `hex`', async () => {
        const headers = await client.getBlockHeadersByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', 1, { extension: 'hex' });

        headers.should.equal('0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4adae5494dffff7f2002000000\n');
      });

      it('should return block headers binary-encoded if extension is `bin`', async () => {
        const hash = '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206';
        const binaryHeaders = await client.getBlockHeadersByHash(hash, 1, { extension: 'bin' });
        const hexHeaders = await client.getBlockHeadersByHash(hash, 1, { extension: 'hex' });

        binaryHeaders.toString('hex').should.equal(`${hexHeaders.toString('hex').replace('\n', '')}`);
      });
    });

    describe('getBlockchainInformation()', () => {
      it('should return blockchain information json-encoded by default', async () => {
        const information = await new Client(config.bitcoind).getBlockchainInformation();

        information.should.have.properties('bestblockhash', 'blocks', 'chain', 'chainwork', 'difficulty', 'headers', 'pruned', 'verificationprogress');
      });
    });

    describe('getUnspentTransactionOutputs()', () => {
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

      it('should return unspent transaction outputs hex-encoded if extension is `hex`', async () => {
        const result = await new Client(config.bitcoind).getUnspentTransactionOutputs([{
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 0
        }, {
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 1
        }], { extension: 'hex' });

        result.should.endWith('10000\n');
      });

      it('should return unspent transaction outputs binary-encoded if extension is `bin`', async () => {
        const outputs = [{
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 0
        }, {
          id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
          index: 1
        }];
        const binaryUnspents = await new Client(config.bitcoind).getUnspentTransactionOutputs(outputs, { extension: 'bin' });
        const hexUnspents = await new Client(config.bitcoind).getUnspentTransactionOutputs(outputs, { extension: 'hex' });

        binaryUnspents.should.be.instanceOf(Buffer);
        hexUnspents.should.equal(`${binaryUnspents.toString('hex')}\n`);
      });
    });

    describe('getMemoryPoolContent()', () => {
      it('should return memory pool content json-encoded by default', async () => {
        const content = await new Client(config.bitcoind).getMemoryPoolContent();
        const transactions = await new Client(config.bitcoind).listTransactions('test');

        Object.keys(content).length.should.be.greaterThanOrEqual(transactions.length);
      });
    });

    describe('getMemoryPoolInformation()', () => {
      it('should return memory pool information json-encoded by default', async () => {
        const information = await new Client(config.bitcoind).getMemoryPoolInformation();

        information.should.have.keys('bytes', 'maxmempool', 'mempoolminfee', 'size', 'usage');
        information.bytes.should.be.a.Number();
        information.maxmempool.should.be.a.Number();
        information.mempoolminfee.should.be.a.Number();
        information.size.should.be.a.Number();
        information.usage.should.be.a.Number();
      });
    });

    it('should throw an error if a method contains invalid arguments', async () => {
      try {
        await new Client(config.bitcoind).getTransactionByHash('foobar');

        should.fail();
      } catch (e) {
        e.should.be.an.instanceOf(RpcError);
        e.body.should.equal('Invalid hash: foobar\r\n');
        e.message.should.equal('Invalid hash: foobar');
        e.code.should.equal(400);
      }
    });

    it('should throw an error if a method in binary mode contains invalid arguments', async () => {
      try {
        await new Client(config.bitcoind).getTransactionByHash('foobar', { extension: 'bin' });

        should.fail();
      } catch (e) {
        e.should.be.an.instanceOf(RpcError);
        e.body.should.equal('Invalid hash: foobar\r\n');
        e.message.should.equal('Invalid hash: foobar');
        e.code.should.equal(400);
      }
    });
  });
});
