"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _parser = _interopRequireDefault(require("./parser"));

var _bluebird = _interopRequireDefault(require("bluebird"));

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
 * Source arguments to find out if a callback has been passed.
 */
function source(...args) {
  const last = _lodash.default.last(args);

  let callback;

  if (_lodash.default.isFunction(last)) {
    callback = last;
    args = _lodash.default.dropRight(args);
  }

  return [args, callback];
}
/**
 * List of networks and their default port mapping.
 */


const networks = {
  mainnet: 8332,
  regtest: 18332,
  testnet: 18332
};
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
    version
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
    this.timeout = timeout;
    this.ssl = {
      enabled: _lodash.default.get(ssl, 'enabled', ssl),
      strict: _lodash.default.get(ssl, 'strict', _lodash.default.get(ssl, 'enabled', ssl))
    }; // Find unsupported methods according to version.

    let unsupported = [];

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
      unsupported = _lodash.default.chain(_methods.default).pickBy(method => !_semver.default.satisfies(version, method.version)).keys().invokeMap(String.prototype.toLowerCase).value();
    }

    const request = (0, _requestLogger.default)(logger);
    this.request = _bluebird.default.promisifyAll(request.defaults({
      agentOptions: this.agentOptions,
      baseUrl: `${this.ssl.enabled ? 'https' : 'http'}://${this.host}:${this.port}`,
      strictSSL: this.ssl.strict,
      timeout: this.timeout
    }), {
      multiArgs: true
    });
    this.requester = new _requester.default({
      unsupported,
      version
    });
    this.parser = new _parser.default({
      headers: this.headers
    });
  }
  /**
   * Execute `rpc` command.
   */


  command(...args) {
    let body;
    let callback;

    let parameters = _lodash.default.tail(args);

    const input = _lodash.default.head(args);

    const lastArg = _lodash.default.last(args);

    if (_lodash.default.isFunction(lastArg)) {
      callback = lastArg;
      parameters = _lodash.default.dropRight(parameters);
    }

    if (this.hasNamedParametersSupport && parameters.length === 1 && _lodash.default.isPlainObject(parameters[0])) {
      parameters = parameters[0];
    }

    return _bluebird.default.try(() => {
      if (Array.isArray(input)) {
        body = input.map((method, index) => this.requester.prepare({
          method: method.method,
          parameters: method.parameters,
          suffix: index
        }));
      } else {
        body = this.requester.prepare({
          method: input,
          parameters
        });
      }

      return this.request.postAsync({
        auth: _lodash.default.pickBy(this.auth, _lodash.default.identity),
        body: JSON.stringify(body),
        uri: '/'
      }).bind(this).then(this.parser.rpc);
    }).asCallback(callback);
  }
  /**
   * Given a transaction hash, returns a transaction in binary, hex-encoded binary, or JSON formats.
   */


  getTransactionByHash(...args) {
    const [[hash, {
      extension = 'json'
    } = {}], callback] = source(...args);
    return _bluebird.default.try(() => {
      return this.request.getAsync({
        encoding: extension === 'bin' ? null : undefined,
        url: `/rest/tx/${hash}.${extension}`
      }).bind(this).then(_lodash.default.partial(this.parser.rest, extension));
    }).asCallback(callback);
  }
  /**
   * Given a block hash, returns a block, in binary, hex-encoded binary or JSON formats.
   * With `summary` set to `false`, the JSON response will only contain the transaction
   * hash instead of the complete transaction details. The option only affects the JSON response.
   */


  getBlockByHash(...args) {
    const [[hash, {
      summary = false,
      extension = 'json'
    } = {}], callback] = source(...args);
    return _bluebird.default.try(() => {
      return this.request.getAsync({
        encoding: extension === 'bin' ? null : undefined,
        url: `/rest/block${summary ? '/notxdetails/' : '/'}${hash}.${extension}`
      }).bind(this).then(_lodash.default.partial(this.parser.rest, extension));
    }).asCallback(callback);
  }
  /**
   * Given a block hash, returns amount of blockheaders in upward direction.
   */


  getBlockHeadersByHash(...args) {
    const [[hash, count, {
      extension = 'json'
    } = {}], callback] = source(...args);
    return _bluebird.default.try(() => {
      if (!_lodash.default.includes(['bin', 'hex'], extension)) {
        throw new Error(`Extension "${extension}" is not supported`);
      }

      return this.request.getAsync({
        encoding: extension === 'bin' ? null : undefined,
        url: `/rest/headers/${count}/${hash}.${extension}`
      }).bind(this).then(_lodash.default.partial(this.parser.rest, extension));
    }).asCallback(callback);
  }
  /**
   * Returns various state info regarding block chain processing.
   * Only supports JSON as output format.
   */


  getBlockchainInformation(...args) {
    const [, callback] = source(...args);
    return this.request.getAsync(`/rest/chaininfo.json`).bind(this).then(_lodash.default.partial(this.parser.rest, 'json')).asCallback(callback);
  }
  /**
   * Query unspent transaction outputs for a given set of outpoints.
   * See BIP64 for input and output serialisation:
   * 	 - https://github.com/bitcoin/bips/blob/master/bip-0064.mediawiki
   */


  getUnspentTransactionOutputs(...args) {
    const [[outpoints, {
      extension = 'json'
    } = {}], callback] = source(...args);

    const sets = _lodash.default.flatten([outpoints]).map(outpoint => {
      return `${outpoint.id}-${outpoint.index}`;
    }).join('/');

    return this.request.getAsync({
      encoding: extension === 'bin' ? null : undefined,
      url: `/rest/getutxos/checkmempool/${sets}.${extension}`
    }).bind(this).then(_lodash.default.partial(this.parser.rest, extension)).asCallback(callback);
  }
  /**
   * Returns transactions in the transaction memory pool.
   * Only supports JSON as output format.
   */


  getMemoryPoolContent(...args) {
    const [, callback] = source(...args);
    return this.request.getAsync('/rest/mempool/contents.json').bind(this).then(_lodash.default.partial(this.parser.rest, 'json')).asCallback(callback);
  }
  /**
   * Returns various information about the transaction memory pool.
   * Only supports JSON as output format.
   *
   *   - size: the number of transactions in the transaction memory pool.
   *   - bytes: size of the transaction memory pool in bytes.
   *   - usage: total transaction memory pool memory usage.
   */


  getMemoryPoolInformation(...args) {
    const [, callback] = source(...args);
    return this.request.getAsync('/rest/mempool/info.json').bind(this).then(_lodash.default.partial(this.parser.rest, 'json')).asCallback(callback);
  }

}
/**
 * Add all known RPC methods.
 */


_lodash.default.forOwn(_methods.default, (range, method) => {
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