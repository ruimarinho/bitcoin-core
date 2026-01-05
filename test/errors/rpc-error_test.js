
/**
 * Module dependencies.
 */

const { STATUS_CODES } = require('http');
const RpcError = require('../../src/errors/rpc-error');

/**
 * Test `RpcError`.
 */

describe('RpcError', () => {
  it('should throw a `TypeError` if status code is not numeric', () => {
    expect(() => new RpcError('foo')).toThrow(new TypeError('Non-numeric HTTP code'));
  });

  it('should accept extra properties', () => {
    const error = new RpcError(-32601, { msg: 'Method not found' });

    expect(error.code).toEqual(-32601);
    expect(error.msg).toEqual('Method not found');
    expect(error.message).toBeUndefined();
  });

  it('should alias `status` to its status code', () => {
    expect(new RpcError(-32601, 'Method not found').status).toEqual(-32601);
  });

  it('should allow setting `status`', () => {
    const error = new RpcError(-32601, 'Method not found');

    error.status = -32700;
    expect(error.code).toEqual(-32601);
  });

  it('should return a well-formatted string representation', () => {
    expect(new RpcError(-32601, 'Method not found').toString()).toEqual('RpcError: -32601 Method not found');
  });

  it('should return the correct message by its http code', () => {
    for (const code in STATUS_CODES) {
      expect(new RpcError(Number(code)).toString()).toEqual(`RpcError: ${code} ${STATUS_CODES[code]}`);
    }
  });
});
