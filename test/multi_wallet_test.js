
/**
 * Module dependencies.
 */

import { defaults } from 'lodash';
import Client from '../src/index';
import RpcError from '../src/errors/rpc-error';
import config from './config';

/**
 * Test instance.
 */

const client = new Client(defaults({ version: '0.15.0', wallet: 'wallet1' }, config.bitcoinMultiWallet));

/**
 * Test `Client`.
 */

describe('Multi Wallet', () => {
  before(async () => {
    const [tip] = await client.getChainTips();

    if (tip.height >= 200) {
      return null;
    }

    await client.generate(200);
  });

  describe('node-level requests', () => {
    describe('getDifficulty()', () => {
      it('should return the proof-of-work difficulty', async () => {
        const difficulty = await client.getDifficulty();

        difficulty.should.be.a.String();
      });
    });

    describe('getMemoryInfo()', () => {
      it('should return information about the node\'s memory usage', async () => {
        const info = await client.getMemoryInfo();

        info.should.have.keys('locked');
      });
    });

    describe('listWallets()', () => {
      it('should return a list of currently loaded wallets', async () => {
        const wallets = await client.listWallets();

        wallets.should.eql(['wallet1', 'wallet2']);
      });
    });
  });

  describe('wallet-level requests', () => {
    describe('getAccountAddress()', () => {
      it('should retrieve an account address', async () => {
        const address = await client.getAccountAddress('test');
        const account = await client.getAccount(address);

        account.should.equal('test');
      });
    });

    describe('getBalance()', () => {
      it('should return the total server\'s balance', async () => {
        const balance = await client.getBalance();

        balance.should.be.aboveOrEqual(0);
      });

      it('should support named parameters', async () => {
        const mainWalletBalance = await client.getBalance({ account: '*', minconf: 0 });
        const mainWalletBalanceWithoutParameters = await client.getBalance('*', 0);
        const testWalletBalance = await client.getBalance({ account: 'test', minconf: 0 });

        mainWalletBalance.should.not.equal(testWalletBalance);
        mainWalletBalanceWithoutParameters.should.equal(mainWalletBalance);
      });
    });

    describe('getNewAddress()', () => {
      it('should return a new bitcoin address', async () => {
        await client.getNewAddress('test');

        const addresses = await client.getAddressesByAccount('test');

        addresses.length.should.be.above(1);
      });
    });

    describe('listTransactions()', () => {
      it('should return the most recent list of transactions from all accounts using specific count', async () => {
        const address = await client.getNewAddress('test');

        // Generate 5 transactions.
        for (let i = 0; i < 5; i++) {
          await client.sendToAddress(address, 0.1);
        }

        const transactions = await client.listTransactions('test', 5);

        transactions.should.be.an.Array();
        transactions.should.matchEach(value => {
          // Only a small subset of transaction properties are being asserted here to make
          // sure we've received a transaction and not an empty object instead.
          value.should.have.keys(
            'account',
            'address',
            'amount',
            'category',
            'confirmations',
            'time',
            'txid',
            'vout'
          );
        });
        transactions.length.should.be.greaterThanOrEqual(5);
      });

      it('should return the most recent list of transactions from all accounts using default count', async () => {
        const address = await client.getNewAddress('test');

        // Generate 5 transactions.
        for (let i = 0; i < 5; i++) {
          await client.sendToAddress(address, 0.1);
        }

        const transactions = await client.listTransactions('test');

        transactions.should.be.an.Array();
        transactions.should.matchEach(value => {
          // Only a small subset of transaction properties are being asserted here to make
          // sure we've received a transaction and not an empty object instead.
          value.should.have.keys(
            'account',
            'address',
            'amount',
            'category',
            'confirmations',
            'time',
            'txid',
            'vout'
          );
        });
      });

      it('should support named parameters', async () => {
        const address = await client.getNewAddress('test');

        // Generate 5 transactions.
        for (let i = 0; i < 5; i++) {
          await client.sendToAddress(address, 0.1);
        }

        let transactions = await client.listTransactions({ account: 'test' });

        transactions.should.be.an.Array();
        transactions.length.should.be.greaterThanOrEqual(5);

        // Make sure `count` is read correctly.
        transactions = await client.listTransactions({ account: 'test', count: 1 });

        transactions.should.be.an.Array();
        transactions.should.have.length(1);
        transactions.should.matchEach(value => {
          // Only a small subset of transaction properties are being asserted here to make
          // sure we've received a transaction and not an empty object instead.
          value.should.have.keys(
            'account',
            'address',
            'amount',
            'category',
            'confirmations',
            'time',
            'txid',
            'vout'
          );
        });
      });
    });
  });

  describe('batched requests', () => {
    // Waiting for 0.15.x with a fix for batched requests in a multiwallet context.
    it.skip('should support batched requests', async () => {
      const batch = [
        { method: 'getbalance' },
        { method: 'listwallets' },
        { method: 'listwallets' }
      ];

      const response = await client.command(batch);

      response.should.eql([0, ['wallet1', 'wallet2'], ['wallet1', 'wallet2']]);
    });

    it('should return an error if one of the request fails', async () => {
      const batch = [{ method: 'validateaddress' }, { method: 'listwallets' }];

      const [validateAddressError, listWallets] = await client.command(batch);

      listWallets.should.eql(['wallet1', 'wallet2']);
      validateAddressError.should.be.an.instanceOf(RpcError);
      validateAddressError.code.should.equal(-1);
    });
  });
});
