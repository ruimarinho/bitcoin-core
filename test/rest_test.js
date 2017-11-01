
/**
 * Module dependencies.
 */

import Client from '../src/index';
import RpcError from '../src/errors/rpc-error';
import config from './config';
import should from 'should';

/**
 * Test instance.
 */

const client = new Client(config.bitcoin);

/**
 * Test `Client`.
 */

describe('REST', () => {
  before(async () => {
    const [tip] = await client.getChainTips();


    if (tip.height >= 200) {
      return null;
    }

    await client.generate(200);
  });

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

    it('should throw an error if a method contains invalid arguments', async () => {
      try {
        await new Client(config.bitcoin).getTransactionByHash('foobar');

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
        await new Client(config.bitcoin).getTransactionByHash('foobar', { extension: 'bin' });

        should.fail();
      } catch (e) {
        e.should.be.an.instanceOf(RpcError);
        e.body.should.equal('Invalid hash: foobar\r\n');
        e.message.should.equal('Invalid hash: foobar');
        e.code.should.equal(400);
      }
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
      const information = await new Client(config.bitcoin).getBlockchainInformation();

      information.should.have.properties('bestblockhash', 'blocks', 'chain', 'chainwork', 'difficulty', 'headers', 'pruned', 'verificationprogress');
    });
  });

  describe('getUnspentTransactionOutputs()', () => {
    it('should return unspent transaction outputs json-encoded by default', async () => {
      const result = await new Client(config.bitcoin).getUnspentTransactionOutputs([{
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
      const result = await new Client(config.bitcoin).getUnspentTransactionOutputs([{
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
      const binaryUnspents = await new Client(config.bitcoin).getUnspentTransactionOutputs(outputs, { extension: 'bin' });
      const hexUnspents = await new Client(config.bitcoin).getUnspentTransactionOutputs(outputs, { extension: 'hex' });

      binaryUnspents.should.be.instanceOf(Buffer);
      hexUnspents.should.equal(`${binaryUnspents.toString('hex')}\n`);
    });
  });

  describe('getMemoryPoolContent()', () => {
    it('should return memory pool content json-encoded by default', async () => {
      const address = await client.getNewAddress('test');
      const content = await client.getMemoryPoolContent();

      // Generate 5 transactions.
      for (let i = 0; i < 5; i++) {
        await client.sendToAddress(address, 0.1);
      }

      const transactions = await client.listTransactions('test');

      Object.keys(content).length.should.not.equal(transactions.length);
    });
  });

  describe('getMemoryPoolInformation()', () => {
    it('should return memory pool information json-encoded by default', async () => {
      const information = await new Client(config.bitcoin).getMemoryPoolInformation();

      information.should.have.keys('bytes', 'maxmempool', 'mempoolminfee', 'size', 'usage');
      information.bytes.should.be.a.Number();
      information.maxmempool.should.be.a.Number();
      information.mempoolminfee.should.be.a.Number();
      information.size.should.be.a.Number();
      information.usage.should.be.a.Number();
    });
  });
});
