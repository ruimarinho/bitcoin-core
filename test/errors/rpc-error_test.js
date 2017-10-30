
/**
 * Module dependencies.
 */

import { STATUS_CODES } from 'http';
import RpcError from '../../src/errors/rpc-error';
import should from 'should';

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
      e.should.be.an.instanceOf(TypeError);
      e.message.should.equal('Non-numeric HTTP code');
    }
  });

  it('should accept extra properties', () => {
    const error = new RpcError(-32601, { msg: 'Method not found' });

    error.code.should.equal(-32601);
    error.msg.should.equal('Method not found');

    (error.message === undefined).should.be.true();
  });

  it('should alias `status` to its status code', () => {
    new RpcError(-32601, 'Method not found').status.should.equal(-32601);
  });

  it('should allow setting `status`', () => {
    const error = new RpcError(-32601, 'Method not found');

    error.status = -32700;
    error.code.should.equal(-32601);
  });

  it('should return a well-formatted string representation', () => {
    new RpcError(-32601, 'Method not found').toString().should.equal('RpcError: -32601 Method not found');
  });

  it('should return the correct message by its http code', () => {
    for (const code in STATUS_CODES) {
      new RpcError(Number(code)).toString().should.equal(`RpcError: ${code} ${STATUS_CODES[code]}`);
    }
  });
});
