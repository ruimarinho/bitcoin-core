"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = require("lodash");

/* eslint-disable no-inline-comments */

/**
 * Module dependencies.
 */

/**
 * Export available rpc methods.
 */
var _default = {
  abandonTransaction: {
    version: '>=0.12.0'
  },
  abortRescan: {
    version: '>=0.15.0'
  },
  addMultiSigAddress: {
    version: '>=0.1.0'
  },
  addNode: {
    version: '>=0.8.0'
  },
  addWitnessAddress: {
    version: '>=0.13.0'
  },
  backupWallet: {
    version: '>=0.3.12'
  },
  bumpFee: {
    version: '>=0.14.0'
  },
  clearBanned: {
    version: '>=0.12.0'
  },
  combineRawTransaction: {
    version: '>=0.15.0'
  },
  createMultiSig: {
    version: '>=0.1.0'
  },
  createRawTransaction: {
    version: '>=0.7.0'
  },
  createWitnessAddress: {
    version: '=0.13.0'
  },
  decodeRawTransaction: {
    version: '>=0.7.0'
  },
  decodeScript: {
    version: '>=0.9.0'
  },
  disconnectNode: {
    version: '>=0.12.0'
  },
  dumpPrivKey: {
    obfuscate: {
      response: () => '******'
    },
    version: '>=0.6.0'
  },
  dumpWallet: {
    version: '>=0.9.0'
  },
  encryptWallet: {
    obfuscate: {
      request: params => (0, _lodash.set)([...params], '[0]', '******')
    },
    version: '>=0.1.0'
  },
  estimateFee: {
    version: '>=0.10.0'
  },
  estimatePriority: {
    version: '>=0.10.0 <0.15.0'
  },
  estimateSmartFee: {
    version: '>=0.12.0'
  },
  estimateSmartPriority: {
    version: '>=0.12.0 <0.15.0'
  },
  fundRawTransaction: {
    version: '>=0.12.0'
  },
  generate: {
    version: '>=0.11.0'
  },
  generateToAddress: {
    version: '>=0.13.0'
  },
  getAccount: {
    version: '>=0.1.0'
  },
  getAccountAddress: {
    version: '>=0.3.18'
  },
  getAddedNodeInfo: {
    version: '>=0.8.0'
  },
  getAddressesByAccount: {
    version: '>=0.1.0'
  },
  getBalance: {
    version: '>=0.3.18'
  },
  getBestBlockHash: {
    version: '>=0.9.0'
  },
  getBlock: {
    version: '>=0.6.0'
  },
  getBlockCount: {
    version: '>=0.1.0'
  },
  getBlockHash: {
    version: '>=0.6.0'
  },
  getBlockHeader: {
    version: '>=0.12.0'
  },
  getBlockTemplate: {
    version: '>=0.7.0'
  },
  getBlockchainInfo: {
    version: '>=0.9.2'
  },
  getChainTips: {
    version: '>=0.10.0'
  },
  getChainTxStats: {
    version: '>=0.15.0'
  },
  getConnectionCount: {
    version: '>=0.1.0'
  },
  getDifficulty: {
    version: '>=0.1.0'
  },
  getGenerate: {
    version: '<0.13.0'
  },
  getHashesPerSec: {
    version: '<0.10.0'
  },
  getInfo: {
    version: '>=0.1.0'
  },
  getMemoryInfo: {
    version: '>=0.14.0'
  },
  getMempoolAncestors: {
    version: '>=0.13.0'
  },
  getMempoolDescendants: {
    version: '>=0.13.0'
  },
  getMempoolEntry: {
    version: '>=0.13.0'
  },
  getMempoolInfo: {
    version: '>=0.10.0'
  },
  getMiningInfo: {
    version: '>=0.6.0'
  },
  getNetTotals: {
    version: '>=0.1.0'
  },
  getNetworkHashPs: {
    version: '>=0.9.0'
  },
  getNetworkInfo: {
    version: '>=0.9.2'
  },
  getNewAddress: {
    version: '>=0.1.0'
  },
  getPeerInfo: {
    version: '>=0.7.0'
  },
  getRawChangeAddress: {
    version: '>=0.9.0'
  },
  getRawMempool: {
    version: '>=0.7.0'
  },
  getRawTransaction: {
    version: '>=0.7.0'
  },
  getReceivedByAccount: {
    version: '>=0.1.0'
  },
  getReceivedByAddress: {
    version: '>=0.1.0'
  },
  getTransaction: {
    version: '>=0.1.0'
  },
  getTxOut: {
    version: '>=0.7.0'
  },
  getTxOutProof: {
    version: '>=0.11.0'
  },
  getTxOutSetInfo: {
    version: '>=0.7.0'
  },
  getUnconfirmedBalance: {
    version: '>=0.9.0'
  },
  getWalletInfo: {
    version: '>=0.9.2'
  },
  getWork: {
    version: '<0.10.0'
  },
  help: {
    version: '>=0.1.0'
  },
  importAddress: {
    version: '>=0.10.0'
  },
  importMulti: {
    obfuscate: {
      request: params => (0, _lodash.set)(params, '[0]', (0, _lodash.map)(params[0], request => (0, _lodash.set)(request, 'keys', (0, _lodash.map)(request.keys, () => '******'))))
    },
    version: '>=0.14.0'
  },
  importPrivKey: {
    obfuscate: {
      request: () => ['******']
    },
    version: '>=0.6.0'
  },
  importPrunedFunds: {
    version: '>=0.13.0'
  },
  importPubKey: {
    version: '>=0.12.0'
  },
  importWallet: {
    version: '>=0.9.0'
  },
  keypoolRefill: {
    version: '>=0.1.0'
  },
  listAccounts: {
    version: '>=0.1.0'
  },
  listAddressGroupings: {
    version: '>=0.7.0'
  },
  listBanned: {
    version: '>=0.12.0'
  },
  listLockUnspent: {
    version: '>=0.8.0'
  },
  listReceivedByAccount: {
    version: '>=0.1.0'
  },
  listReceivedByAddress: {
    version: '>=0.1.0'
  },
  listSinceBlock: {
    version: '>=0.5.0'
  },
  listTransactions: {
    version: '>=0.3.18'
  },
  listUnspent: {
    version: '>=0.7.0'
  },
  listWallets: {
    version: '>=0.15.0'
  },
  lockUnspent: {
    version: '>=0.8.0'
  },
  move: {
    version: '>=0.3.18'
  },
  ping: {
    version: '>=0.9.0'
  },
  preciousBlock: {
    version: '>=0.14.0'
  },
  prioritiseTransaction: {
    version: '>=0.10.0'
  },
  pruneBlockchain: {
    version: '>=0.14.0'
  },
  removePrunedFunds: {
    version: '>=0.13.0'
  },
  sendFrom: {
    version: '>=0.3.18'
  },
  sendMany: {
    version: '>=0.3.21'
  },
  sendRawTransaction: {
    version: '>=0.7.0'
  },
  sendToAddress: {
    version: '>=0.1.0'
  },
  setAccount: {
    version: '>=0.1.0'
  },
  setBan: {
    version: '>=0.12.0'
  },
  setGenerate: {
    version: '<0.13.0'
  },
  setNetworkActive: {
    version: '>=0.14.0'
  },
  setTxFee: {
    version: '>=0.3.22'
  },
  signMessage: {
    version: '>=0.5.0'
  },
  signMessageWithPrivKey: {
    obfuscate: {
      request: params => (0, _lodash.set)([...params], '[0]', '******')
    },
    version: '>=0.13.0'
  },
  signRawTransaction: {
    obfuscate: {
      request: params => (0, _lodash.set)([...params], '[2]', (0, _lodash.map)(params[2], () => '******'))
    },
    version: '>=0.7.0'
  },
  stop: {
    version: '>=0.1.0'
  },
  submitBlock: {
    version: '>=0.7.0'
  },
  upTime: {
    version: '>=0.15.0'
  },
  validateAddress: {
    version: '>=0.3.14'
  },
  verifyChain: {
    version: '>=0.9.0'
  },
  verifyMessage: {
    version: '>=0.5.0'
  },
  verifyTxOutProof: {
    version: '>0.11.0'
  },
  walletLock: {
    version: '>=0.1.0'
  },
  walletPassphrase: {
    obfuscate: {
      request: params => (0, _lodash.set)([...params], '[0]', '******')
    },
    version: '>=0.1.0'
  },
  walletPassphraseChange: {
    version: '>=0.1.0'
  }
};
exports.default = _default;