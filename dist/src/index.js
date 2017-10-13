'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
/**
 * Module dependencies.
 */

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _requester = require('./requester');

var _requester2 = _interopRequireDefault(_requester);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _debugnyan = require('debugnyan');

var _debugnyan2 = _interopRequireDefault(_debugnyan);

var _methods = require('./methods');

var _methods2 = _interopRequireDefault(_methods);

var _requestLogger = require('./logging/request-logger');

var _requestLogger2 = _interopRequireDefault(_requestLogger);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Source arguments to find out if a callback has been passed.
 */

function source() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  const last = _lodash2.default.last(args);

  let callback;

  if (_lodash2.default.isFunction(last)) {
    callback = last;
    args = _lodash2.default.dropRight(args);
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
  constructor() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    let agentOptions = _ref.agentOptions;
    var _ref$headers = _ref.headers;
    let headers = _ref$headers === undefined ? false : _ref$headers;
    var _ref$host = _ref.host;
    let host = _ref$host === undefined ? 'localhost' : _ref$host;
    var _ref$logger = _ref.logger;
    let logger = _ref$logger === undefined ? (0, _debugnyan2.default)('bitcoin-core') : _ref$logger;
    var _ref$network = _ref.network;
    let network = _ref$network === undefined ? 'mainnet' : _ref$network,
        password = _ref.password,
        port = _ref.port;
    var _ref$ssl = _ref.ssl;
    let ssl = _ref$ssl === undefined ? false : _ref$ssl;
    var _ref$timeout = _ref.timeout;
    let timeout = _ref$timeout === undefined ? 30000 : _ref$timeout,
        username = _ref.username,
        version = _ref.version;

    if (!_lodash2.default.has(networks, network)) {
      throw new Error(`Invalid network name "${network}"`, { network: network });
    }

    this.agentOptions = agentOptions;
    this.auth = (password || username) && { pass: password, user: username };
    this.headers = headers;
    this.host = host;
    this.password = password;
    this.port = port || networks[network];
    this.timeout = timeout;
    this.ssl = {
      enabled: _lodash2.default.get(ssl, 'enabled', ssl),
      strict: _lodash2.default.get(ssl, 'strict', _lodash2.default.get(ssl, 'enabled', ssl))
    };

    // Find unsupported methods according to version.
    let unsupported = [];

    if (version) {
      unsupported = _lodash2.default.chain(_methods2.default).pickBy(method => !_semver2.default.satisfies(version, method.version)).keys().invokeMap(String.prototype.toLowerCase).value();
    }

    const request = (0, _requestLogger2.default)(logger);

    this.request = _bluebird2.default.promisifyAll(request.defaults({
      agentOptions: this.agentOptions,
      baseUrl: `${this.ssl.enabled ? 'https' : 'http'}://${this.host}:${this.port}`,
      json: true,
      strictSSL: this.ssl.strict,
      timeout: this.timeout
    }), { multiArgs: true });
    this.requester = new _requester2.default({ unsupported: unsupported, version: version });
    this.parser = new _parser2.default({ headers: this.headers });
  }

  /**
   * Execute `rpc` command.
   */

  command() {
    let body;
    let callback;

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    let parameters = _lodash2.default.tail(args);
    const input = _lodash2.default.head(args);
    const lastArg = _lodash2.default.last(args);

    if (_lodash2.default.isFunction(lastArg)) {
      callback = lastArg;
      parameters = _lodash2.default.dropRight(parameters);
    }

    return _bluebird2.default.try(() => {
      if (Array.isArray(input)) {
        body = input.map((method, index) => this.requester.prepare({ method: method.method, parameters: method.parameters, suffix: index }));
      } else {
        body = this.requester.prepare({ method: input, parameters: parameters });
      }

      return this.request.postAsync({
        auth: _lodash2.default.pickBy(this.auth, _lodash2.default.identity),
        body: body,
        uri: '/'
      }).bind(this).then(this.parser.rpc);
    }).asCallback(callback);
  }

  /**
   * Given a transaction hash, returns a transaction in binary, hex-encoded binary, or JSON formats.
   */

  getTransactionByHash() {
    var _source = source.apply(undefined, arguments),
        _source2 = _slicedToArray(_source, 2),
        _source2$ = _slicedToArray(_source2[0], 2);

    const hash = _source2$[0];
    var _source2$$ = _source2$[1];
    _source2$$ = _source2$$ === undefined ? {} : _source2$$;
    var _source2$$$extension = _source2$$.extension;
    const extension = _source2$$$extension === undefined ? 'json' : _source2$$$extension,
          callback = _source2[1];


    return _bluebird2.default.try(() => {
      return this.request.getAsync(`/rest/tx/${hash}.${extension}`).bind(this).then(this.parser.rest);
    }).asCallback(callback);
  }

  /**
   * Given a block hash, returns a block, in binary, hex-encoded binary or JSON formats.
   * With `summary` set to `false`, the JSON response will only contain the transaction
   * hash instead of the complete transaction details. The option only affects the JSON response.
   */

  getBlockByHash() {
    var _source3 = source.apply(undefined, arguments),
        _source4 = _slicedToArray(_source3, 2),
        _source4$ = _slicedToArray(_source4[0], 2);

    const hash = _source4$[0];
    var _source4$$ = _source4$[1];
    _source4$$ = _source4$$ === undefined ? {} : _source4$$;
    var _source4$$$summary = _source4$$.summary;
    const summary = _source4$$$summary === undefined ? false : _source4$$$summary;
    var _source4$$$extension = _source4$$.extension;
    const extension = _source4$$$extension === undefined ? 'json' : _source4$$$extension,
          callback = _source4[1];


    return _bluebird2.default.try(() => {
      return this.request.getAsync(`/rest/block${summary ? '/notxdetails/' : '/'}${hash}.${extension}`).bind(this).then(this.parser.rest);
    }).asCallback(callback);
  }

  /**
   * Given a block hash, returns amount of blockheaders in upward direction.
   */

  getBlockHeadersByHash() {
    var _source5 = source.apply(undefined, arguments),
        _source6 = _slicedToArray(_source5, 2),
        _source6$ = _slicedToArray(_source6[0], 3);

    const hash = _source6$[0],
          count = _source6$[1];
    var _source6$$ = _source6$[2];
    _source6$$ = _source6$$ === undefined ? {} : _source6$$;
    var _source6$$$extension = _source6$$.extension;
    const extension = _source6$$$extension === undefined ? 'json' : _source6$$$extension,
          callback = _source6[1];


    return _bluebird2.default.try(() => {
      if (!_lodash2.default.includes(['bin', 'hex'], extension)) {
        throw new Error(`Extension "${extension}" is not supported`);
      }

      return this.request.getAsync(`/rest/headers/${count}/${hash}.${extension}`).bind(this).then(this.parser.rest);
    }).asCallback(callback);
  }

  /**
   * Returns various state info regarding block chain processing.
   * Only supports JSON as output format.
   */

  getBlockchainInformation() {
    var _source7 = source.apply(undefined, arguments),
        _source8 = _slicedToArray(_source7, 2);

    const callback = _source8[1];


    return this.request.getAsync(`/rest/chaininfo.json`).bind(this).then(this.parser.rest).asCallback(callback);
  }

  /**
   * Query unspent transaction outputs for a given set of outpoints.
   * See BIP64 for input and output serialisation:
   * 	 - https://github.com/bitcoin/bips/blob/master/bip-0064.mediawiki
   */

  getUnspentTransactionOutputs() {
    var _source9 = source.apply(undefined, arguments),
        _source10 = _slicedToArray(_source9, 2),
        _source10$ = _slicedToArray(_source10[0], 2);

    const outpoints = _source10$[0];
    var _source10$$ = _source10$[1];
    _source10$$ = _source10$$ === undefined ? {} : _source10$$;
    var _source10$$$extension = _source10$$.extension;
    const extension = _source10$$$extension === undefined ? 'json' : _source10$$$extension,
          callback = _source10[1];


    const sets = _lodash2.default.flatten([outpoints]).map(outpoint => {
      return `${outpoint.id}-${outpoint.index}`;
    }).join('/');

    return this.request.getAsync(`/rest/getutxos/checkmempool/${sets}.${extension}`).bind(this).then(this.parser.rest).asCallback(callback);
  }

  /**
   * Returns transactions in the transaction memory pool.
   * Only supports JSON as output format.
   */

  getMemoryPoolContent() {
    var _source11 = source.apply(undefined, arguments),
        _source12 = _slicedToArray(_source11, 2);

    const callback = _source12[1];


    return this.request.getAsync('/rest/mempool/contents.json').bind(this).then(this.parser.rest).asCallback(callback);
  }

  /**
   * Returns various information about the transaction memory pool.
   * Only supports JSON as output format.
   *
   *   - size: the number of transactions in the transaction memory pool.
   *   - bytes: size of the transaction memory pool in bytes.
   *   - usage: total transaction memory pool memory usage.
   */

  getMemoryPoolInformation() {
    var _source13 = source.apply(undefined, arguments),
        _source14 = _slicedToArray(_source13, 2);

    const callback = _source14[1];


    return this.request.getAsync('/rest/mempool/info.json').bind(this).then(this.parser.rest).asCallback(callback);
  }
}

/**
 * Add all known RPC methods.
 */

_lodash2.default.forOwn(_methods2.default, (range, method) => {
  Client.prototype[method] = _lodash2.default.partial(Client.prototype.command, method.toLowerCase());
});

/**
 * Export Client class.
 */

exports.default = Client;
module.exports = exports['default'];