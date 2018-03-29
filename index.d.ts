// Type definitions for bitcoin-core 2.0.0
// Project: https://github.com/ruimarinho/bitcoin-core
// Definitions by: Joe Miyamoto <joemphilps@gmail.com>

declare module 'bitcoin-core' {
  import * as request from 'request';

  interface ClientConstructorOption {
    agentOptions?: request.Options,
    headers?: boolean,
    host?: string,
    logger?: Function,
    network?: 'mainnet' | "regtest" | "testnet",
    password?: string,
    port?: string | number,
    ssl?: any,
    timeout?: number,
    username?: string,
    version?: string,
  }

  interface Requester {
    unsupported?: any[],
    version?: any,
  }

  interface Parser {
    headers: any;
  }

  type ChainInfo = {
    chain: string,
    blocks: number,
    headers: number,
    bestblockchash: number,
    difficulty: number,
    mediantime: number,
    verificationprogress: number,
    initialblockdownload: boolean,
    chainwork: string,
    size_on_disk: number,
    pruned: boolean,
    pruneheight: number,
    automatic_pruning: boolean,
    prune_target_size: number,
    softforks: {id: string, version: number, reject: {status: boolean}}[],
    bip9_softforks: {
      [key: string]: {
        status: "defined" | "started" | "locked_in" | "active" | "failed"
      }
    }[]
    warnings: string
  }
  type Outpoint = {id: string, index: number}
  type UTXO = {
    height: number,
    value: number,
    scriptPubkey: {
      asm: string,
      hex: string,
      reqSigs: number,
      type: string,
      addresses: string[]
    },
  }
  type MempoolContent = {
    [key: string]: {
      size: number,
      fee: number,
      modifiedfee: number,
      time: number,
      height: number,
      descendantcount: number,
      descendantsize: number,
      descendantfees: number,
      ancestorcount: number,
      ancestorsize: number,
      wtxid: string,
      depends: string[]
    }
  }
  type MempoolInfo = {
    size: number,
    bytes: number,
    usage: number,
    maxmempol: number,
    mempoolminfee: number,
    minrelaytxfee: number
  }
  type BlockHeader = {
    hash: string,
    confirmations: number,
    height: number,
    version: number,
    versionHex: string,
    merkleroot: string,
    time: number,
    mediantime: number,
    nonce: number,
    bits: string,
    difficulty: number,
    chainwork: string,
    previoutsblockchash: string
  }
  type Block = {
    hash: string,
    confirmations: number,
    strippedsize: number,
    size: number,
    weight: number,
    height: number,
    version: number,
    verxionHex: string,
    merkleroot: string,
    tx: Transaction[],
    hex: string,
    time: number,
    mediantime: number,
    nonce: number,
    bits: string,
    difficulty: number,
    chainwork: string,
    previousblockhash: string,
    nextblockchash: string
  }
  type Transaction = {
    txid: string,
    hash: string,
    version: number,
    size: number,
    vsize: number,
    locktime: number,
    vin: TxIn[],
    vout: TxOut[]
  }

  type TxIn = {
    txid: string,
    vout: number,
    scriptSig: {
      asm: string,
      hex: string
    },
    sequence: number
  }

  type TxOut = {
    value: number,
    n: number,
    scriptPubKey: {
      asm: string,
      hex: string,
      reqSigs: number,
      type: scriptPubkeyType,
      addresses: string[]
    }
  }

  type scriptPubkeyType = "pubkey" |
    "pubkeyhash" |
    "scripthash" |
    "witnesspubkeyhash" |
    "witnessscripthash" |
    "witnesscommitment" |
    "nonstandard"

  type RestExtension = "json" | "bin" | "hex"

  export class Client {
    private readonly request: any;
    private readonly requests: Requester;
    private readonly parser: Parser;

    constructor(clientOption: ClientConstructorOption);

    abandonTransaction(...args: any[]): void;

    abortRescan(...args: any[]): void;

    addMultiSigAddress(...args: any[]): void;

    addNode(...args: any[]): void;

    addWitnessAddress(...args: any[]): void;

    backupWallet(...args: any[]): void;

    bumpFee(...args: any[]): void;

    clearBanned(...args: any[]): void;

    combineRawTransaction(...args: any[]): void;

    command(...args: any[]): void;

    createMultiSig(...args: any[]): void;

    createRawTransaction(...args: any[]): void;

    createWitnessAddress(...args: any[]): void;

    decodeRawTransaction(...args: any[]): void;

    decodeScript(...args: any[]): void;

    disconnectNode(...args: any[]): void;

    dumpPrivKey(...args: any[]): void;

    dumpWallet(...args: any[]): void;

    encryptWallet(...args: any[]): void;

    estimateFee(...args: any[]): void;

    estimatePriority(...args: any[]): void;

    estimateSmartFee(...args: any[]): void;

    estimateSmartPriority(...args: any[]): void;

    fundRawTransaction(...args: any[]): void;

    generate(...args: any[]): void;

    generateToAddress(...args: any[]): void;

    getAccount(...args: any[]): void;

    getAccountAddress(...args: any[]): void;

    getAddedNodeInfo(...args: any[]): void;

    getAddressesByAccount(...args: any[]): void;

    getBalance(...args: any[]): void;

    getBestBlockHash(...args: any[]): void;

    getBlock(...args: any[]): void;

    getBlockByHash(hash: string, extension: RestExtension): Promise<Block>;

    getBlockCount(...args: any[]): void;

    getBlockHash(...args: any[]): void;

    getBlockHeader(...args: any[]): void;

    getBlockHeadersByHash(hash: string, extension: RestExtension): Promise<BlockHeader[]>;

    getBlockTemplate(...args: any[]): void;

    getBlockchainInfo(...args: any[]): void;

    getBlockchainInformation(): Promise<ChainInfo>;

    getChainTips(...args: any[]): void;

    getChainTxStats(...args: any[]): void;

    getConnectionCount(...args: any[]): void;

    getDifficulty(...args: any[]): void;

    getGenerate(...args: any[]): void;

    getHashesPerSec(...args: any[]): void;

    getInfo(...args: any[]): void;

    getMemoryInfo(...args: any[]): void;

    getMemoryPoolContent(): Promise<MempoolContent>;

    getMemoryPoolInformation(): Promise<MempoolInfo>;

    getMempoolAncestors(...args: any[]): void;

    getMempoolDescendants(...args: any[]): void;

    getMempoolEntry(...args: any[]): void;

    getMempoolInfo(...args: any[]): void;

    getMiningInfo(...args: any[]): void;

    getNetTotals(...args: any[]): void;

    getNetworkHashPs(...args: any[]): void;

    getNetworkInfo(): Promise<NetworkInfo>;

    getNewAddress(...args: any[]): void;

    getPeerInfo(): Promise<PeerInfo>;

    getRawChangeAddress(...args: any[]): void;

    getRawMempool(...args: any[]): void;

    getRawTransaction(...args: any[]): void;

    getReceivedByAccount(...args: any[]): void;

    getReceivedByAddress(...args: any[]): void;

    getTransaction(...args: any[]): void;

    getTransactionByHash(hash: string, extension?: RestExtension): Promise<string>;

    getTxOut(...args: any[]): void;

    getTxOutProof(...args: any[]): void;

    getTxOutSetInfo(...args: any[]): void;

    getUnconfirmedBalance(...args: any[]): void;

    getUnspentTransactionOutputs(outpoints: Outpoint[]):
      Promise<{chainHeight: number, chaintipHash: string, bipmap: string, utxos: UTXO[]}>;

    getWalletInfo(...args: any[]): void;

    getWork(...args: any[]): void;

    help(...args: any[]): void;

    importAddress(...args: any[]): void;

    importMulti(...args: any[]): void;

    importPrivKey(...args: any[]): void;

    importPrunedFunds(...args: any[]): void;

    importPubKey(...args: any[]): void;

    importWallet(...args: any[]): void;

    keypoolRefill(...args: any[]): void;

    listAccounts(...args: any[]): void;

    listAddressGroupings(...args: any[]): void;

    listBanned(): Promise<any>;

    listLockUnspent(...args: any[]): void;

    listReceivedByAccount(...args: any[]): void;

    listReceivedByAddress(...args: any[]): void;

    listSinceBlock(...args: any[]): void;

    listTransactions(...args: any[]): void;

    listUnspent(...args: any[]): void;

    listWallets(...args: any[]): void;

    lockUnspent(...args: any[]): void;

    move(...args: any[]): void;

    ping(): Promise<void>;

    preciousBlock(...args: any[]): void;

    prioritiseTransaction(...args: any[]): void;

    pruneBlockchain(...args: any[]): void;

    removePrunedFunds(...args: any[]): void;

    sendFrom(...args: any[]): void;

    sendMany(...args: any[]): void;

    sendRawTransaction(...args: any[]): void;

    sendToAddress(...args: any[]): void;

    setAccount(...args: any[]): void;

    setBan(...args: any[]): void;

    setGenerate(...args: any[]): void;

    setNetworkActive(...args: any[]): void;

    setTxFee(...args: any[]): void;

    signMessage(...args: any[]): void;

    signMessageWithPrivKey(...args: any[]): void;

    signRawTransaction(...args: any[]): void;

    stop(...args: any[]): void;

    submitBlock(...args: any[]): void;

    upTime(...args: any[]): void;

    validateAddress(...args: any[]): void;

    verifyChain(...args: any[]): void;

    verifyMessage(...args: any[]): void;

    verifyTxOutProof(...args: any[]): void;

    walletLock(...args: any[]): void;

    walletPassphrase(...args: any[]): void;

    walletPassphraseChange(...args: any[]): void;
  }
}
