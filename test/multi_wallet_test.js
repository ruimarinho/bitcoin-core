
/**
 * Module dependencies.
 */

const _ = require('lodash');
const Client = require('../src/index');
const RpcError = require('../src/errors/rpc-error');
const config = require('./config');
const { generateWalletFunds } = require('./utils/helper');

/**
 * Test instance.
 */

const client = new Client(_.defaults({ version: '24.0.1', wallet: 'wallet1' }, config.bitcoinMultiWallet));

/**
 * Test `Client`.
 */

describe('Multi Wallet', () => {
  beforeAll(async () => {
    await generateWalletFunds(client, client.wallet);
  });

  describe('node-level requests', () => {
    describe('getDifficulty()', () => {
      it('should return the proof-of-work difficulty', async () => {
        const difficulty = await client.getDifficulty();

        expect(typeof difficulty).toBe('string');
      });
    });

    describe('getMemoryInfo()', () => {
      it('should return information about the node\'s memory usage', async () => {
        const info = await client.getMemoryInfo();

        expect(info).toHaveProperty('locked');
      });
    });

    describe('listWallets()', () => {
      it('should return a list of currently loaded wallets', async () => {
        const wallets = await client.listWallets();

        expect(wallets).toEqual(['wallet1']);
      });
    });
  });

  describe('wallet-level requests', () => {
    describe('getNewAddressesWithLabel()', () => {
      it('should retrieve an address with a set label', async () => {
        await client.getNewAddress('testlabelmulti');

        const labelList = await client.listLabels();

        expect(labelList).toBeInstanceOf(Array);
        expect(labelList).toContain('testlabelmulti');
      });
    });

    describe('getBalance()', () => {
      it('should return the total server\'s balance', async () => {
        const balance = await client.getBalance();

        expect(balance).toBeGreaterThanOrEqual(0);
      });

      it('should support named parameters', async () => {
        const mainWalletBalance = await client.getBalance({ dummy: '*', minconf: 0 });
        const mainWalletBalanceWithoutNamedParameters = await client.getBalance('*', 0);

        expect(mainWalletBalance).toEqual(mainWalletBalanceWithoutNamedParameters);
      });
    });

    describe('getNewAddress()', () => {
      it('should return a new bitcoin address', async () => {
        const address = await client.getNewAddress('test', 'legacy');
        const amount = await client.getReceivedByAddress({ address, minconf: 0 });

        expect(amount).toEqual(0);
      });
    });

    describe('createPsbt()', () => {
      it('should create a Psbt', async () => {
        const inputs = [{ txid: '4fcfa1a5c6864c9783d9474566488cf3d0ae43087ae66618715f10a0dd7997e9', vout: 0 }];
        const dest = [{ mkteeBFmGkraJaWN5WzqHCjmbQWVrPo5X3: 1000 }];
        const pbst = await client.createPsbt(inputs, dest);

        expect(typeof pbst).toBe('string');
      });
    });

    describe('listTransactions()', () => {
      it('should return the most recent list of transactions using specific count', async () => {
        const address = await client.getNewAddress('listspecificcount');

        // Generate 5 transactions.
        for (let i = 0; i < 5; i++) {
          await client.sendToAddress(address, 0.1);
        }

        const transactions = await client.listTransactions({ count: 5 });

        expect(transactions).toBeInstanceOf(Array);
        transactions.forEach(value => {
          expect(value.label).toEqual('listspecificcount');
          // Only a small subset of transaction properties are being asserted here to make
          // sure we've received a transaction and not an empty object instead.
          const requiredProperties = [
            'label',
            'address',
            'amount',
            'category',
            'confirmations',
            'time',
            'txid',
            'vout'];

          requiredProperties.forEach(property => {
            expect(value).toHaveProperty(property);
          });
        });
        expect(transactions.length).toBeGreaterThanOrEqual(5);
      });

      it('should return the most recent list of transactions using default count', async () => {
        const address = await client.getNewAddress('listdefaultcount');

        // Generate 5 transactions.
        for (let i = 0; i < 5; i++) {
          await client.sendToAddress(address, 0.1);
        }

        const transactions = await client.listTransactions();

        expect(transactions).toBeInstanceOf(Array);
        transactions.forEach(value => {
          expect(value.label).toEqual('listdefaultcount');

          // Only a small subset of transaction properties are being asserted here to make
          // sure we've received a transaction and not an empty object instead.
          const requiredProperties = [
            'label',
            'address',
            'amount',
            'category',
            'confirmations',
            'time',
            'txid',
            'vout'];

          requiredProperties.forEach(property => {
            expect(value).toHaveProperty(property);
          });
        });
      });

      it('should support named parameters', async () => {
        const address = await client.getNewAddress('testlistwithparams');

        // Generate 5 transactions.
        for (let i = 0; i < 5; i++) {
          await client.sendToAddress(address, 0.1);
        }

        let transactions = await client.listTransactions();

        expect(transactions).toBeInstanceOf(Array);
        expect(transactions.length).toBeGreaterThanOrEqual(5);

        // Make sure `count` is read correctly.
        transactions = await client.listTransactions({ count: 1 });

        expect(transactions).toBeInstanceOf(Array);
        expect(transactions).toHaveLength(1);
        transactions.forEach(value => {
          expect(value.label).toEqual('testlistwithparams');
          // Only a small subset of transaction properties are being asserted here to make
          // sure we've received a transaction and not an empty object instead.

          const requiredProperties = [
            'label',
            'address',
            'amount',
            'category',
            'confirmations',
            'time',
            'txid',
            'vout'];

          requiredProperties.forEach(property => {
            expect(value).toHaveProperty(property);
          });
        });
      });
    });

    describe('signRawTransactionWithWallet()', () => {
      it('should sign a funded raw transaction and return the hex', async () => {
        const address = await client.getNewAddress('test', 'legacy');
        const rawTransaction = await client.createRawTransaction([], [{ [address]: 1 }]);
        const fundedTransaction = await client.fundRawTransaction(rawTransaction);
        const signedTransaction = await client.signRawTransactionWithWallet(fundedTransaction.hex);

        expect(signedTransaction).toHaveProperty('hex');
        expect(typeof signedTransaction.hex).toBe('string');
      });

      it('should support named parameters', async () => {
        const address = await client.getNewAddress('test', 'legacy');
        const rawTransaction = await client.createRawTransaction([], [{ [address]: 1 }]);
        const fundedTransaction = await client.fundRawTransaction(rawTransaction);
        const signedTransaction = await client.signRawTransactionWithWallet({ hexstring: fundedTransaction.hex });

        expect(signedTransaction).toHaveProperty('hex');
        expect(typeof signedTransaction.hex).toBe('string');
      });
    });
  });

  describe('batched requests', () => {
    it('should support batched requests', async () => {
      const batch = [
        { method: 'getbalance' },
        { method: 'listwallets' },
        { method: 'listwallets' }
      ];

      const response = await client.command(batch);

      expect(response).toHaveLength(3);
      expect(typeof response[0]).toBe('number');
      expect(response[1]).toEqual(['wallet1']);
      expect(response[2]).toEqual(['wallet1']);
    });

    it('should return an error if one of the request fails', async () => {
      const batch = [{ method: 'validateaddress' }, { method: 'listwallets' }];

      const [validateAddressError, listWallets] = await client.command(batch);

      expect(listWallets).toEqual(['wallet1']);
      expect(validateAddressError).toBeInstanceOf(RpcError);
      expect(validateAddressError.code).toEqual(-1);
    });
  });
});
