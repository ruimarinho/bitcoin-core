
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

const client = new Client(config.bitcoin);

/**
 * Test `Client`.
 */

describe('Single Wallet', () => {
  beforeAll(async () => {
    await generateWalletFunds(client, 'test');
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
        const client = new Client(config.bitcoin);
        const wallets = await client.listWallets();

        // wallet is shown as '' unless -wallet set in config
        expect(wallets).toEqual(['test']);
      });
    });
  });

  describe('wallet-level requests', () => {
    describe('getNewAddressesWithLabel()', () => {
      it('should retrieve an address with a set label', async () => {
        const address = await client.getNewAddress('testlabelsingle');
        const labelList = await client.listLabels();

        expect(labelList).toBeInstanceOf(Array);
        expect(labelList.includes('testlabelsingle')).toBe(true);
        expect(typeof address).toBe('string');
      });
    });

    describe('getBalance()', () => {
      it('should return the total server\'s balance', async () => {
        const balance = await client.getBalance();

        expect(balance).toBeGreaterThanOrEqual(0);
      });

      it('should support named parameters', async () => {
        const client = new Client(_.defaults({ version: '0.17.0' }, config.bitcoin));

        const mainWalletBalance = await client.getBalance({ dummy: '*', minconf: 0 });
        const mainWalletBalanceWithoutNamedParameters = await client.getBalance('*', 0);

        expect(mainWalletBalance).toEqual(mainWalletBalanceWithoutNamedParameters);
      });
    });

    describe('getNewAddress()', () => {
      it('should return a new bitcoin address', async () => {
        const address = await client.getNewAddress('test');

        expect(typeof address).toBe('string');
      });
    });

    describe('listTransactions()', () => {
      it('should return the most recent list of transactions using specific count', async () => {
        const address = await client.getNewAddress('listspecificcount');

        // Generate 5 transactions.
        for (let i = 0; i < 5; i++) {
          await client.sendToAddress(address, 0.1);
        }

        const transactions = await client.listTransactions('*', 5);

        expect(transactions).toBeInstanceOf(Array);
        expect(transactions.length).toBeGreaterThanOrEqual(5);
      });

      it('should return the most recent list of transactions using default count', async () => {
        const transactions = await client.listTransactions();

        expect(transactions).toBeInstanceOf(Array);
        transactions.forEach(value => {
          // Only a small subset of transaction properties are being asserted here to make
          // sure we've received a transaction and not an empty object instead.
          const requiredProperties = ['label',
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

        let transactions = await new Client(_.defaults({ version: '0.17.0' }, config.bitcoin)).listTransactions();

        expect(transactions).toBeInstanceOf(Array);
        expect(transactions.length).toBeGreaterThanOrEqual(5);

        // Make sure `count` is read correctly.
        transactions = await new Client(_.defaults({ version: '0.17.0' }, config.bitcoin)).listTransactions({ count: 1 });

        expect(transactions).toBeInstanceOf(Array);
        expect(transactions).toHaveLength(1);
      });
    });
  });

  describe('batched requests', () => {
    it('should support batched requests', async () => {
      const batch = [
        { method: 'listwallets' },
        { method: 'listwallets' },
        { method: 'listwallets' }
      ];
      const response = await client.command(batch);

      // 0.17 for some reason has wallets shown as ''
      // I'm guessing if you load a wallet specifically it will show it
      expect(response).toEqual([['test'], ['test'], ['test']]);
    });

    it('should support request parameters in batched requests', async () => {
      const batch = [{ method: 'getnewaddress' }, { method: 'validateaddress', parameters: ['mkteeBFmGkraJaWN5WzqHCjmbQWVrPo5X3'] }];

      const [newAddress, addressValidation] = await client.command(batch);

      const requiredProperties = ['address', 'isvalid', 'scriptPubKey', 'isscript', 'iswitness'];

      requiredProperties.forEach(property => {
        expect(addressValidation).toHaveProperty(property);
      });
      expect(typeof newAddress).toBe('string');
    });

    it('should return an error if one of the request fails', async () => {
      const batch = [{ method: 'validateaddress' }, { method: 'validateaddress', parameters: ['mkteeBFmGkraJaWN5WzqHCjmbQWVrPo5X3'] }];

      const [validateAddressError, validateAddress] = await client.command(batch);

      const requiredProperties = ['address', 'isvalid', 'scriptPubKey'];

      requiredProperties.forEach(property => {
        expect(validateAddress).toHaveProperty(property);
      });
      expect(validateAddressError).toBeInstanceOf(RpcError);
      expect(validateAddressError.code).toEqual(-1);
    });
  });
});
