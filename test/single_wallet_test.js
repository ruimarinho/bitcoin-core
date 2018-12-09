
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

const client = new Client(config.bitcoin);

/**
 * Test `Client`.
 */

describe('Single Wallet', () => {
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
        const client = new Client(config.bitcoin);
        const wallets = await client.listWallets();

        // wallet is shown as '' unless -wallet set in config
        wallets.should.eql(['']);
      });
    });
  });

  describe('wallet-level requests', () => {
    describe('getNewAddressesWithLabel()', () => {
      it('should retrieve an address with a set label', async () => {
        const address = await client.getNewAddress('testlabelsingle');
        const labelList = await client.listLabels();

        labelList.should.be.an.Array();
        labelList.should.containEql('testlabelsingle');
        address.should.be.a.String();
      });
    });

    describe('getBalance()', () => {
      it('should return the total server\'s balance', async () => {
        const balance = await client.getBalance();

        balance.should.be.aboveOrEqual(0);
      });

      it('should support named parameters', async () => {
        const client = new Client(defaults({ version: '0.17.0' }, config.bitcoin));

        const mainWalletBalance = await client.getBalance({ dummy: '*', minconf: 0 });
        const mainWalletBalanceWithoutNamedParameters = await client.getBalance('*', 0);

        mainWalletBalance.should.equal(mainWalletBalanceWithoutNamedParameters);
      });
    });

    describe('getNewAddress()', () => {
      it('should return a new bitcoin address', async () => {
        const address = await client.getNewAddress('test');

        address.should.be.a.String();
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

        transactions.should.be.an.Array();
        transactions.length.should.be.greaterThanOrEqual(5);
      });

      it('should return the most recent list of transactions using default count', async () => {
        const transactions = await client.listTransactions();

        transactions.should.be.an.Array();
        transactions.should.matchEach(value => {
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

        let transactions = await new Client(defaults({ version: '0.17.0' }, config.bitcoin)).listTransactions();

        transactions.should.be.an.Array();
        transactions.length.should.be.greaterThanOrEqual(5);

        // Make sure `count` is read correctly.
        transactions = await new Client(defaults({ version: '0.17.0' }, config.bitcoin)).listTransactions({ count: 1 });

        transactions.should.be.an.Array();
        transactions.should.have.length(1);
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
      response.should.eql([[''], [''], ['']]);
    });

    it('should support request parameters in batched requests', async () => {
      const batch = [{ method: 'getnewaddress' }, { method: 'validateaddress', parameters: ['mkteeBFmGkraJaWN5WzqHCjmbQWVrPo5X3'] }];

      const [newAddress, addressValidation] = await client.command(batch);

      addressValidation.should.have.properties('address', 'isvalid', 'scriptPubKey', 'isscript', 'iswitness');
      newAddress.should.be.a.String();
    });

    it('should return an error if one of the request fails', async () => {
      const batch = [{ method: 'validateaddress' }, { method: 'validateaddress', parameters: ['mkteeBFmGkraJaWN5WzqHCjmbQWVrPo5X3'] }];

      const [validateAddressError, validateAddress] = await client.command(batch);

      validateAddress.should.have.properties('address', 'isvalid', 'scriptPubKey');
      validateAddressError.should.be.an.instanceOf(RpcError);
      validateAddressError.code.should.equal(-1);
    });
  });
});
