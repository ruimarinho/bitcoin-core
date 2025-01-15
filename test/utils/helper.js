
/**
 * Module dependencies.
 */

const _ = require('lodash');

/**
 * Parse `help` from bitcoin output.
 */

module.exports.parse = help => _.chain(help.split('\n'))
  .reject(line => line.startsWith('==') || !_.identity(line))
  .map(line => (/^([a-z]+)/).exec(line)[1])
  .value();

/**
 * Generate wallet funds.
 */

module.exports.generateWalletFunds = async (client, walletName) => {
  const [tip] = await client.getChainTips();

  if (tip.height >= 432) {
    return null;
  }

  try {
    await client.createWallet(walletName);
  } catch (e) {
    if (!/Database already exists/.test(e.message)) {
      throw e;
    }

    try {
      await client.loadWallet(walletName);
    } catch (e) {
      if (!/Unable to obtain an exclusive lock on the database/.test(e.message)) {
        throw e;
      }
    }
  }

  const address = await client.getNewAddress();

  await client.generateToAddress(432, address);
};
