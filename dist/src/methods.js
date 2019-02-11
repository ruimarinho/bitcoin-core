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
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.12.0'
  },
  abortRescan: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.15.0'
  },
  addMultiSigAddress: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.1.0'
  },
  addNode: {
    category: 'network',
    version: '>=0.8.0'
  },
  addWitnessAddress: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.13.0'
  },
  backupWallet: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.3.12'
  },
  bumpFee: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.14.0'
  },
  clearBanned: {
    category: 'network',
    version: '>=0.12.0'
  },
  combineRawTransaction: {
    category: 'rawtransactions',
    version: '>=0.15.0'
  },
  createMultiSig: {
    category: 'util',
    version: '>=0.1.0'
  },
  createRawTransaction: {
    category: 'rawtransactions',
    version: '>=0.7.0'
  },
  createWitnessAddress: {
    category: 'wallet',
    version: '=0.13.0'
  },
  decodeRawTransaction: {
    category: 'rawtransactions',
    version: '>=0.7.0'
  },
  decodeScript: {
    category: 'rawtransactions',
    version: '>=0.9.0'
  },
  disconnectNode: {
    category: 'network',
    version: '>=0.12.0'
  },
  dumpPrivKey: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    obfuscate: {
      response: () => '******'
    },
    version: '>=0.6.0'
  },
  dumpWallet: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.9.0'
  },
  encryptWallet: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    obfuscate: {
      request: {
        default: params => (0, _lodash.set)([...params], '[0]', '******'),
        named: params => (0, _lodash.set)(params, 'passphrase', '******')
      }
    },
    version: '>=0.1.0'
  },
  estimateFee: {
    category: 'util',
    version: '>=0.10.0'
  },
  estimatePriority: {
    category: 'util',
    version: '>=0.10.0 <0.15.0'
  },
  estimateSmartFee: {
    category: 'util',
    version: '>=0.12.0'
  },
  estimateSmartPriority: {
    category: 'util',
    version: '>=0.12.0 <0.15.0'
  },
  fundRawTransaction: {
    category: 'rawtransactions',
    version: '>=0.12.0'
  },
  generate: {
    category: 'generating',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.11.0'
  },
  generateToAddress: {
    category: 'generating',
    version: '>=0.13.0'
  },
  getAccount: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.1.0'
  },
  getAccountAddress: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.3.18'
  },
  getAddedNodeInfo: {
    category: 'network',
    version: '>=0.8.0'
  },
  getAddressesByAccount: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.1.0'
  },
  getBalance: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.3.18'
  },
  getBestBlockHash: {
    category: 'blockchain',
    version: '>=0.9.0'
  },
  getBlock: {
    category: 'blockchain',
    version: '>=0.6.0'
  },
  getBlockCount: {
    category: 'blockchain',
    version: '>=0.1.0'
  },
  getBlockHash: {
    category: 'blockchain',
    version: '>=0.6.0'
  },
  getBlockHeader: {
    category: 'blockchain',
    version: '>=0.12.0'
  },
  getBlockTemplate: {
    category: 'mining',
    version: '>=0.7.0'
  },
  getBlockchainInfo: {
    category: 'blockchain',
    version: '>=0.9.2'
  },
  getChainTips: {
    category: 'blockchain',
    version: '>=0.10.0'
  },
  getChainTxStats: {
    category: 'blockchain',
    version: '>=0.15.0'
  },
  getConnectionCount: {
    category: 'network',
    version: '>=0.1.0'
  },
  getDifficulty: {
    category: 'blockchain',
    version: '>=0.1.0'
  },
  getGenerate: {
    category: 'generating',
    version: '<0.13.0'
  },
  getHashesPerSec: {
    category: 'blockchain',
    version: '<0.10.0'
  },
  getInfo: {
    category: 'control',
    version: '>=0.1.0'
  },
  getMemoryInfo: {
    category: 'control',
    version: '>=0.14.0'
  },
  getMempoolAncestors: {
    category: 'blockchain',
    version: '>=0.13.0'
  },
  getMempoolDescendants: {
    category: 'blockchain',
    version: '>=0.13.0'
  },
  getMempoolEntry: {
    category: 'blockchain',
    version: '>=0.13.0'
  },
  getMempoolInfo: {
    category: 'blockchain',
    version: '>=0.10.0'
  },
  getMiningInfo: {
    category: 'mining',
    version: '>=0.6.0'
  },
  getNetTotals: {
    category: 'network',
    version: '>=0.1.0'
  },
  getNetworkHashPs: {
    category: 'mining',
    version: '>=0.9.0'
  },
  getNetworkInfo: {
    category: 'network',
    version: '>=0.9.2'
  },
  getNewAddress: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.1.0'
  },
  getPeerInfo: {
    category: 'network',
    version: '>=0.7.0'
  },
  getRawChangeAddress: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.9.0'
  },
  getRawMempool: {
    category: 'blockchain',
    version: '>=0.7.0'
  },
  getRawTransaction: {
    category: 'rawtransactions',
    version: '>=0.7.0'
  },
  getReceivedByAccount: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.1.0'
  },
  getReceivedByAddress: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.1.0'
  },
  getTransaction: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.1.0'
  },
  getTxOut: {
    category: 'blockchain',
    version: '>=0.7.0'
  },
  getTxOutProof: {
    category: 'blockchain',
    version: '>=0.11.0'
  },
  getTxOutSetInfo: {
    category: 'blockchain',
    version: '>=0.7.0'
  },
  getUnconfirmedBalance: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.9.0'
  },
  getWalletInfo: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.9.2'
  },
  getWork: {
    category: 'blockchain',
    version: '<0.10.0'
  },
  help: {
    category: 'control',
    version: '>=0.1.0'
  },
  importAddress: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.10.0'
  },
  importMulti: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    obfuscate: {
      request: {
        default: params => (0, _lodash.set)(params, '[0]', (0, _lodash.map)(params[0], request => (0, _lodash.set)(request, 'keys', (0, _lodash.map)(request.keys, () => '******')))),
        named: params => (0, _lodash.set)(params, 'requests', (0, _lodash.map)(params.requests, request => (0, _lodash.set)(request, 'keys', (0, _lodash.map)(request.keys, () => '******'))))
      }
    },
    version: '>=0.14.0'
  },
  importPrivKey: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    obfuscate: {
      request: {
        default: () => ['******'],
        named: params => (0, _lodash.set)(params, 'privkey', '******')
      }
    },
    version: '>=0.6.0'
  },
  importPrunedFunds: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.13.0'
  },
  importPubKey: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.12.0'
  },
  importWallet: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.9.0'
  },
  keypoolRefill: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.1.0'
  },
  listAccounts: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.1.0'
  },
  listAddressGroupings: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.7.0'
  },
  listBanned: {
    category: 'network',
    version: '>=0.12.0'
  },
  listLockUnspent: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.8.0'
  },
  listReceivedByAccount: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.1.0'
  },
  listReceivedByAddress: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.1.0'
  },
  listSinceBlock: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.5.0'
  },
  listTransactions: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.3.18'
  },
  listUnspent: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.7.0'
  },
  listWallets: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.15.0'
  },
  lockUnspent: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.8.0'
  },
  move: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.3.18'
  },
  ping: {
    category: 'network',
    version: '>=0.9.0'
  },
  preciousBlock: {
    category: 'blockchain',
    version: '>=0.14.0'
  },
  prioritiseTransaction: {
    category: 'mining',
    version: '>=0.10.0'
  },
  pruneBlockchain: {
    category: 'blockchain',
    version: '>=0.14.0'
  },
  removePrunedFunds: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.13.0'
  },
  sendFrom: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.3.18'
  },
  sendMany: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.3.21'
  },
  sendRawTransaction: {
    category: 'rawtransactions',
    version: '>=0.7.0'
  },
  sendToAddress: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.1.0'
  },
  setAccount: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.1.0'
  },
  setBan: {
    category: 'network',
    version: '>=0.12.0'
  },
  setGenerate: {
    category: 'generating',
    version: '<0.13.0'
  },
  setNetworkActive: {
    category: 'network',
    version: '>=0.14.0'
  },
  setTxFee: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.3.22'
  },
  signMessage: {
    category: 'wallet',
    features: {
      multiwallet: '>=0.15.0'
    },
    version: '>=0.5.0'
  },
  signMessageWithPrivKey: {
    category: 'util',
    obfuscate: {
      request: {
        default: params => (0, _lodash.set)([...params], '[0]', '******'),
        named: params => (0, _lodash.set)(params, 'privkey', '******')
      }
    },
    version: '>=0.13.0'
  },
  signRawTransaction: {
    category: 'rawtransactions',
    obfuscate: {
      request: {
        default: params => (0, _lodash.set)([...params], '[2]', (0, _lodash.map)(params[2], () => '******')),
        named: params => (0, _lodash.set)(params, 'privkeys', (0, _lodash.map)(params.privkeys || [], () => '******'))
      }
    },
    version: '>=0.7.0'
  },
  stop: {
    category: 'control',
    version: '>=0.1.0'
  },
  submitBlock: {
    category: 'mining',
    version: '>=0.7.0'
  },
  upTime: {
    category: 'control',
    version: '>=0.15.0'
  },
  validateAddress: {
    category: 'util',
    version: '>=0.3.14'
  },
  verifyChain: {
    category: 'blockchain',
    version: '>=0.9.0'
  },
  verifyMessage: {
    category: 'util',
    version: '>=0.5.0'
  },
  verifyTxOutProof: {
    category: 'blockchain',
    version: '>0.11.0'
  },
  walletLock: {
    category: 'wallet',
    version: '>=0.1.0'
  },
  walletPassphrase: {
    category: 'wallet',
    obfuscate: {
      request: {
        default: params => (0, _lodash.set)([...params], '[0]', '******'),
        named: params => (0, _lodash.set)(params, 'passphrase', '******')
      }
    },
    version: '>=0.1.0'
  },
  walletPassphraseChange: {
    category: 'wallet',
    obfuscate: {
      request: {
        default: params => (0, _lodash.set)((0, _lodash.set)([...params], '[0]', '******'), '[1]', '******'),
        named: params => (0, _lodash.set)((0, _lodash.set)(params, 'oldpassphrase', '******'), 'newpassphrase', '******')
      }
    },
    version: '>=0.1.0'
  }
};
exports.default = _default;