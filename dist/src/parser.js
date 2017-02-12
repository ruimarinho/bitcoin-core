'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
/**
 * Module dependencies.
 */

var _rpcError = require('./errors/rpc-error');

var _rpcError2 = _interopRequireDefault(_rpcError);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get response result and errors.
 */

function get(body) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$headers = _ref.headers;

  let headers = _ref$headers === undefined ? false : _ref$headers,
      response = _ref.response;

  if (!body) {
    throw new _rpcError2.default(response.statusCode, response.statusMessage);
  }

  if (body.error !== null) {
    throw new _rpcError2.default(_lodash2.default.get(body, 'error.code', -32603), _lodash2.default.get(body, 'error.message', 'An error occurred while processing the RPC call to bitcoind'));
  }

  if (!_lodash2.default.has(body, 'result')) {
    throw new _rpcError2.default(-32700, 'Missing `result` on the RPC call result');
  }

  if (headers) {
    return [body.result, response.headers];
  }

  return body.result;
}

/**
 * Export Parser class.
 */

class Parser {
  constructor() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    let headers = _ref2.headers;

    this.headers = headers;
  }

  /**
   * Parse rpc response.
   */

  rpc(_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2);

    let response = _ref4[0],
        body = _ref4[1];

    // Body contains HTML (e.g. 401 Unauthorized).
    if (typeof body === 'string' && response.statusCode !== 200) {
      throw new _rpcError2.default(response.statusCode);
    }

    if (!Array.isArray(body)) {
      return get(body, { headers: this.headers, response: response });
    }

    // Batch response parsing where each response may or may not be successful.
    const batch = body.map(response => {
      try {
        return get(response, { headers: false, response: response });
      } catch (e) {
        return e;
      }
    });

    if (this.headers) {
      return [batch, response.headers];
    }

    return batch;
  }

  rest(_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2);

    let response = _ref6[0],
        body = _ref6[1];

    if (body.error) {
      throw new _rpcError2.default(body.error.code, body.error.message);
    }

    if (this.headers) {
      return [body, response.headers];
    }

    return body;
  }
}
exports.default = Parser;
module.exports = exports['default'];