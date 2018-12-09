
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

const client = new Client(defaults({ version: '0.17.0', wallet: 'wallet1' }, config.bitcoinMultiWallet));

/**
 * Test `Client`.
 */

describe('Multi Wallet', () => {
  before(async () => {
    const [tip] = await client.getChainTips();

    if (tip.height >= 432) {
      return null;
    }

    await client.generate(432);
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
    describe('getNewAddressesWithLabel()', () => {
      it('should retrieve an address with a set label', async () => {
        await client.getNewAddress('testlabelmulti');

        const labelList = await client.listLabels();

        labelList.should.be.an.Array();
        labelList.should.containEql('testlabelmulti');
      });
    });

    describe('getBalance()', () => {
      it('should return the total server\'s balance', async () => {
        const balance = await client.getBalance();

        balance.should.be.aboveOrEqual(0);
      });

      it('should support named parameters', async () => {
        const mainWalletBalance = await client.getBalance({ dummy: '*', minconf: 0 });
        const mainWalletBalanceWithoutNamedParameters = await client.getBalance('*', 0);

        mainWalletBalance.should.equal(mainWalletBalanceWithoutNamedParameters);
      });
    });

    describe('getNewAddress()', () => {
      it('should return a new bitcoin address', async () => {
        const address = await client.getNewAddress('test', 'legacy');
        const amount = await client.getReceivedByAddress({ address, minconf: 0 });

        amount.should.equal(0);
      });
    });

    describe('createPsbt()', () => {
      it('should create a Psbt', async () => {
        const inputs = [{ txid: '4fcfa1a5c6864c9783d9474566488cf3d0ae43087ae66618715f10a0dd7997e9', vout: 0 }];
        const dest = [{ mkteeBFmGkraJaWN5WzqHCjmbQWVrPo5X3: 1000 }];
        const pbst = await client.createPsbt(inputs, dest);

        pbst.should.be.a.String();
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

        transactions.should.be.an.Array();
        transactions.should.matchEach(value => {
          value.label.should.equal('listspecificcount');
          // Only a small subset of transaction properties are being asserted here to make
          // sure we've received a transaction and not an empty object instead.
          value.should.have.keys(
            'label',
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

      it('should return the most recent list of transactions using default count', async () => {
        const address = await client.getNewAddress('listdefaultcount');

        // Generate 5 transactions.
        for (let i = 0; i < 5; i++) {
          await client.sendToAddress(address, 0.1);
        }

        const transactions = await client.listTransactions();

        transactions.should.be.an.Array();
        transactions.should.matchEach(value => {
          value.label.should.equal('listdefaultcount');

          // Only a small subset of transaction properties are being asserted here to make
          // sure we've received a transaction and not an empty object instead.
          value.should.have.keys(
            'label',
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
        const address = await client.getNewAddress('testlistwithparams');

        // Generate 5 transactions.
        for (let i = 0; i < 5; i++) {
          await client.sendToAddress(address, 0.1);
        }

        let transactions = await client.listTransactions();

        transactions.should.be.an.Array();
        transactions.length.should.be.greaterThanOrEqual(5);

        // Make sure `count` is read correctly.
        transactions = await client.listTransactions({ count: 1 });

        transactions.should.be.an.Array();
        transactions.should.have.length(1);
        transactions.should.matchEach(value => {
          value.label.should.equal('testlistwithparams');
          // Only a small subset of transaction properties are being asserted here to make
          // sure we've received a transaction and not an empty object instead.
          value.should.have.keys(
            'label',
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

    describe('signRawTransactionWithWallet()', () => {
      it('should sign a funded raw transaction and return the hex', async () => {
        const address = await client.getNewAddress('test', 'legacy');
        const rawTransaction = await client.createRawTransaction([], [{ [address]: 1 }]);
        const fundedTransaction = await client.fundRawTransaction(rawTransaction);
        const signedTransaction = await client.signRawTransactionWithWallet(fundedTransaction.hex);

        signedTransaction.should.have.keys('hex');
        signedTransaction.hex.should.be.a.String();
      });

      it('should support named parameters', async () => {
        const address = await client.getNewAddress('test', 'legacy');
        const rawTransaction = await client.createRawTransaction([], [{ [address]: 1 }]);
        const fundedTransaction = await client.fundRawTransaction(rawTransaction);
        const signedTransaction = await client.signRawTransactionWithWallet({ hexstring: fundedTransaction.hex });

        signedTransaction.should.have.keys('hex');
        signedTransaction.hex.should.be.a.String();
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
