
/**
 * Module dependencies.
 */

const Client = require('../src/index');
const RpcError = require('../src/errors/rpc-error');
const config = require('./config');
const { generateWalletFunds } = require('./utils/helper');

/**
 * Test instance.
 */

const client = new Client(config.bitcoin);

/**
 * Test `Client`.
 */

describe('REST', () => {
  beforeAll(async () => {
    await generateWalletFunds(client, 'test');
  });

  describe('getTransactionByHash()', () => {
    it('should return a transaction json-encoded by default', async () => {
      const unspents = await client.listUnspent();
      const transaction = await client.getTransactionByHash(unspents[0].txid);

      const requiredProperties = ['blockhash', 'locktime', 'hash', 'size', 'txid', 'version', 'vin', 'vout', 'vsize'];

      requiredProperties.forEach(property => {
        expect(transaction).toHaveProperty(property);
      });
    });

    it('should return a transaction hex-encoded if extension is `hex`', async () => {
      const [{ txid }] = await client.listUnspent();
      const { hex: rawTransaction } = await client.getTransaction(txid);
      const hexTransaction = await client.getTransactionByHash(txid, { extension: 'hex' });

      expect(hexTransaction).toEqual(`${rawTransaction}\n`);
    });

    it('should return a transaction binary-encoded if extension is `bin`', async () => {
      const [{ txid }] = await client.listUnspent();
      const binaryTransaction = await client.getTransactionByHash(txid, { extension: 'bin' });
      const hexTransaction = await client.getTransactionByHash(txid, { extension: 'hex' });

      expect(binaryTransaction).toBeInstanceOf(Buffer);
      expect(hexTransaction).toEqual(`${binaryTransaction.toString('hex')}\n`);
    });

    it('should throw an error if a method contains invalid arguments', async () => {
      try {
        await new Client(config.bitcoin).getTransactionByHash('foobar');
      } catch (e) {
        expect(e).toBeInstanceOf(RpcError);
        expect(e.body).toEqual('Invalid hash: foobar\r\n');
        expect(e.message).toEqual('Invalid hash: foobar');
        expect(e.code).toEqual(400);
      }
    });

    it('should throw an error if a method in binary mode contains invalid arguments', async () => {
      try {
        await new Client(config.bitcoin).getTransactionByHash('foobar', { extension: 'bin' });
      } catch (e) {
        expect(e).toBeInstanceOf(RpcError);
        expect(e.body).toEqual('Invalid hash: foobar\r\n');
        expect(e.message).toEqual('Invalid hash: foobar');
        expect(e.code).toEqual(400);
      }
    });
  });

  describe('getBlockByHash()', () => {
    it('should return a block json-encoded by default', async () => {
      const block = await client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'json' });

      const requiredProperties = ['bits', 'chainwork', 'confirmations', 'difficulty', 'hash', 'height', 'mediantime', 'merkleroot', 'nonce', 'size', 'strippedsize', 'time', 'tx', 'version', 'versionHex', 'weight'];

      requiredProperties.forEach(property => {
        expect(block).toHaveProperty(property);
      });

      block.tx.forEach(value => {
        expect(typeof value).toBe('object');
      });
    });

    it('should return a block hex-encoded if extension is `hex`', async () => {
      const block = await client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'hex' });

      expect(block).toEqual('0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4adae5494dffff7f20020000000101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff4d04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73ffffffff0100f2052a01000000434104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac00000000\n');
    });

    it('should return a block binary-encoded if extension is `bin`', async () => {
      const block = await client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'bin' });

      expect(block).toBeInstanceOf(Buffer);
      expect(block.toString('hex')).toEqual('0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4adae5494dffff7f20020000000101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff4d04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73ffffffff0100f2052a01000000434104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac00000000');
    });

    it('should return a block summary json-encoded if `summary` is enabled', async () => {
      const block = await client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'json', summary: true });

      const requiredProperties = ['bits', 'chainwork', 'confirmations', 'difficulty', 'hash', 'height', 'mediantime', 'merkleroot', 'nonce', 'size', 'strippedsize', 'time', 'tx', 'version', 'versionHex', 'weight'];

      requiredProperties.forEach(property => {
        expect(block).toHaveProperty(property);
      });
      block.tx.forEach(value => {
        expect(typeof value).toBe('string');
      });
    });
  });

  describe('getBlockHeadersByHash()', () => {
    it('should return a block json-encoded by default', async () => {
      const headers = await client.getBlockHeadersByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', 1, { extension: 'json' });

      expect(headers).toHaveLength(1);
      const requiredProperties = ['bits', 'chainwork', 'confirmations', 'difficulty', 'hash', 'height', 'mediantime', 'merkleroot', 'nonce', 'time', 'version', 'versionHex'];

      requiredProperties.forEach(property => {
        expect(headers[0]).toHaveProperty(property);
      });
      expect(headers[0].hash).toEqual('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206');
    });

    it('should return block headers hex-encoded if extension is `hex`', async () => {
      const headers = await client.getBlockHeadersByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', 1, { extension: 'hex' });

      expect(headers).toEqual('0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4adae5494dffff7f2002000000\n');
    });

    it('should return block headers binary-encoded if extension is `bin`', async () => {
      const hash = '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206';
      const binaryHeaders = await client.getBlockHeadersByHash(hash, 1, { extension: 'bin' });
      const hexHeaders = await client.getBlockHeadersByHash(hash, 1, { extension: 'hex' });

      expect(binaryHeaders.toString('hex')).toEqual(`${hexHeaders.toString('hex').replace('\n', '')}`);
    });
  });

  describe('getBlockchainInformation()', () => {
    it('should return blockchain information json-encoded by default', async () => {
      const information = await new Client(config.bitcoin).getBlockchainInformation();

      const requiredProperties = ['bestblockhash', 'blocks', 'chain', 'chainwork', 'difficulty', 'headers', 'pruned', 'verificationprogress'];

      requiredProperties.forEach(property => {
        expect(information).toHaveProperty(property);
      });
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

      const requiredProperties = ['bitmap', 'chainHeight', 'chaintipHash', 'utxos'];

      requiredProperties.forEach(property => {
        expect(result).toHaveProperty(property);
      });
      expect(typeof result.chainHeight).toBe('number');
    });

    it('should return unspent transaction outputs hex-encoded if extension is `hex`', async () => {
      const result = await new Client(config.bitcoin).getUnspentTransactionOutputs([{
        id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
        index: 0
      }, {
        id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
        index: 1
      }], { extension: 'hex' });

      expect(result.endsWith('10000\n')).toBe(true);
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

      expect(binaryUnspents).toBeInstanceOf(Buffer);
      expect(hexUnspents).toEqual(`${binaryUnspents.toString('hex')}\n`);
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

      const transactions = await client.listTransactions();

      expect(Object.keys(content).length).not.toEqual(transactions.length);
    });
  });

  describe('getMemoryPoolInformation()', () => {
    it('should return memory pool information json-encoded by default', async () => {
      const information = await new Client(config.bitcoin).getMemoryPoolInformation();
      const requiredProperties = ['bytes', 'maxmempool', 'mempoolminfee', 'size', 'usage'];

      requiredProperties.forEach(property => {
        expect(information).toHaveProperty(property);
      });
      expect(typeof information.bytes).toBe('number');
      expect(typeof information.maxmempool).toBe('number');
      expect(typeof information.mempoolminfee).toBe('number');
      expect(typeof information.size).toBe('number');
      expect(typeof information.usage).toBe('number');
    });
  });
});
