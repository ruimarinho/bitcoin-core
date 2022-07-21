
/**
 * Module dependencies.
 */

const { STATUS_CODES } = require('http');
const RpcError = require('../../src/errors/rpc-error');
const should = require('should');

/**
 * Test `RpcError`.
 */

describe('RpcError', () => {
  it('should throw a `TypeError` if status code is not numeric', () => {
    try {
      /* eslint-disable */
      new RpcError('foo');
      /* eslint-enable */

      should.fail();
    } catch (e) {
      should(e).be.an.instanceOf(TypeError);
      should(e.message).equal('Non-numeric HTTP code');
    }
  });

  it('should accept extra properties', () => {
    const error = new RpcError(-32601, { msg: 'Method not found' });

    should(error.code).equal(-32601);
    should(error.msg).equal('Method not found');
    should(error.message).be.undefined();
  });

  it('should alias `status` to its status code', () => {
    should(new RpcError(-32601, 'Method not found').status).equal(-32601);
  });

  it('should allow setting `status`', () => {
    const error = new RpcError(-32601, 'Method not found');

    error.status = -32700;
    should(error.code).equal(-32601);
  });

  it('should return a well-formatted string representation', () => {
    should(new RpcError(-32601, 'Method not found').toString()).equal('RpcError: -32601 Method not found');
  });

  it('should return the correct message by its http code', () => {
    for (const code in STATUS_CODES) {
      should(new RpcError(Number(code)).toString()).equal(`RpcError: ${code} ${STATUS_CODES[code]}`);
    }
  });
});
