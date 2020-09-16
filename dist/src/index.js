"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _parser = _interopRequireDefault(require("./parser"));

var _requester = _interopRequireDefault(require("./requester"));

var _lodash = _interopRequireDefault(require("lodash"));

var _debugnyan = _interopRequireDefault(require("debugnyan"));

var _methods = _interopRequireDefault(require("./methods"));

var _requestLogger = _interopRequireDefault(require("./logging/request-logger"));

var _semver = _interopRequireDefault(require("semver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Module dependencies.
 */

/**
 * List of networks and their default port mapping.
 */
const networks = {
  mainnet: 8332,
  regtest: 18332,
  testnet: 18332
};
/**
 * Promisify helper.
 */

const promisify = fn => (...args) => new Promise((resolve, reject) => {
  fn(...args, (error, value) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(value);
  });
});
/**
 * Constructor.
 */


class Client {
  constructor({
    agentOptions,
    headers = false,
    host = 'localhost',
    logger = (0, _debugnyan.default)('bitcoin-core'),
    network = 'mainnet',
    password,
    port,
    ssl = false,
    timeout = 30000,
    username,
    version,
    wallet
  } = {}) {
    if (!_lodash.default.has(networks, network)) {
      throw new Error(`Invalid network name "${network}"`, {
        network
      });
    }

    this.agentOptions = agentOptions;
    this.auth = (password || username) && {
      pass: password,
      user: username
    };
    this.hasNamedParametersSupport = false;
    this.headers = headers;
    this.host = host;
    this.password = password;
    this.port = port || networks[network];
    this.ssl = {
      enabled: _lodash.default.get(ssl, 'enabled', ssl),
      strict: _lodash.default.get(ssl, 'strict', _lodash.default.get(ssl, 'enabled', ssl))
    };
    this.timeout = timeout;
    this.wallet = wallet; // Version handling.

    if (version) {
      // Capture X.Y.Z when X.Y.Z.A is passed to support oddly formatted Bitcoin Core
      // versions such as 0.15.0.1.
      const result = /[0-9]+\.[0-9]+\.[0-9]+/.exec(version);

      if (!result) {
        throw new Error(`Invalid Version "${version}"`, {
          version
        });
      }

      [version] = result;
      this.hasNamedParametersSupport = _semver.default.satisfies(version, '>=0.14.0');
    }

    this.version = version;
    this.methods = _lodash.default.transform(_methods.default, (result, method, name) => {
      result[_lodash.default.toLower(name)] = {
        features: _lodash.default.transform(method.features, (result, constraint, name) => {
          result[name] = {
            supported: version ? _semver.default.satisfies(version, constraint) : true
          };
        }, {}),
        supported: version ? _semver.default.satisfies(version, method.version) : true
      };
    }, {});
    const request = (0, _requestLogger.default)(logger);
    this.request = request.defaults({
      agentOptions: this.agentOptions,
      baseUrl: `${this.ssl.enabled ? 'https' : 'http'}://${this.host}:${this.port}`,
      strictSSL: this.ssl.strict,
      timeout: this.timeout
    });
    this.request.getAsync = promisify(this.request.get);
    this.request.postAsync = promisify(this.request.post);
    this.requester = new _requester.default({
      methods: this.methods,
      version
    });
    this.parser = new _parser.default({
      headers: this.headers
    });
  }
  /**
   * Execute `rpc` command.
   */


  async command(...args) {
    let body;
    let multiwallet;
    let [input, ...parameters] = args; // eslint-disable-line prefer-const

    const isBatch = Array.isArray(input);

    if (isBatch) {
      multiwallet = _lodash.default.some(input, command => {
        return _lodash.default.get(this.methods[command.method], 'features.multiwallet.supported', false) === true;
      });
      body = input.map((method, index) => this.requester.prepare({
        method: method.method,
        parameters: method.parameters,
        suffix: index
      }));
    } else {
      if (this.hasNamedParametersSupport && parameters.length === 1 && _lodash.default.isPlainObject(parameters[0])) {
        parameters = parameters[0];
      }

      multiwallet = _lodash.default.get(this.methods[input], 'features.multiwallet.supported', false) === true;
      body = this.requester.prepare({
        method: input,
        parameters
      });
    }

    return this.parser.rpc((await this.request.postAsync({
      auth: _lodash.default.pickBy(this.auth, _lodash.default.identity),
      body: JSON.stringify(body),
      uri: `${multiwallet && this.wallet ? `/wallet/${this.wallet}` : '/'}`
    })));
  }
  /**
   * Given a transaction hash, returns a transaction in binary, hex-encoded binary, or JSON formats.
   */


  async getTransactionByHash(hash, {
    extension = 'json'
  } = {}) {
    return this.parser.rest(extension, (await this.request.getAsync({
      encoding: extension === 'bin' ? null : undefined,
      url: `/rest/tx/${hash}.${extension}`
    })));
  }
  /**
   * Given a block hash, returns a block, in binary, hex-encoded binary or JSON formats.
   * With `summary` set to `false`, the JSON response will only contain the transaction
   * hash instead of the complete transaction details. The option only affects the JSON response.
   */


  async getBlockByHash(hash, {
    summary = false,
    extension = 'json'
  } = {}) {
    const encoding = extension === 'bin' ? null : undefined;
    const url = `/rest/block${summary ? '/notxdetails/' : '/'}${hash}.${extension}`;
    return this.parser.rest(extension, (await this.request.getAsync({
      encoding,
      url
    })));
  }
  /**
   * Given a block hash, returns amount of blockheaders in upward direction.
   */


  async getBlockHeadersByHash(hash, count, {
    extension = 'json'
  } = {}) {
    const encoding = extension === 'bin' ? null : undefined;
    const url = `/rest/headers/${count}/${hash}.${extension}`;
    return this.parser.rest(extension, (await this.request.getAsync({
      encoding,
      url
    })));
  }
  /**
   * Returns various state info regarding block chain processing.
   * Only supports JSON as output format.
   */


  async getBlockchainInformation() {
    return this.parser.rest('json', (await this.request.getAsync(`/rest/chaininfo.json`)));
  }
  /**
   * Query unspent transaction outputs for a given set of outpoints.
   * See BIP64 for input and output serialisation:
   * 	 - https://github.com/bitcoin/bips/blob/master/bip-0064.mediawiki
   */


  async getUnspentTransactionOutputs(outpoints, {
    extension = 'json'
  } = {}) {
    const encoding = extension === 'bin' ? null : undefined;

    const sets = _lodash.default.flatten([outpoints]).map(outpoint => {
      return `${outpoint.id}-${outpoint.index}`;
    }).join('/');

    const url = `/rest/getutxos/checkmempool/${sets}.${extension}`;
    return this.parser.rest(extension, (await this.request.getAsync({
      encoding,
      url
    })));
  }
  /**
   * Returns transactions in the transaction memory pool.
   * Only supports JSON as output format.
   */


  async getMemoryPoolContent() {
    return this.parser.rest('json', (await this.request.getAsync('/rest/mempool/contents.json')));
  }
  /**
   * Returns various information about the transaction memory pool.
   * Only supports JSON as output format.
   *
   *   - size: the number of transactions in the transaction memory pool.
   *   - bytes: size of the transaction memory pool in bytes.
   *   - usage: total transaction memory pool memory usage.
   */


  async getMemoryPoolInformation() {
    return this.parser.rest('json', (await this.request.getAsync('/rest/mempool/info.json')));
  }

}
/**
 * Add all known RPC methods.
 */


_lodash.default.forOwn(_methods.default, (options, method) => {
  Client.prototype[method] = _lodash.default.partial(Client.prototype.command, method.toLowerCase());
});
/**
 * Export Client class (ESM).
 */


var _default = Client;
/**
 * Export Client class (CJS) for compatibility with require('bitcoin-core').
 */

exports.default = _default;
module.exports = Client;