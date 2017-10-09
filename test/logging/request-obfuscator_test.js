
/**
 * Module dependencies.
 */

import { obfuscate } from '../../src/logging/request-obfuscator';

/**
 * Test `RequestObfuscator`.
 */

describe('RequestObfuscator', () => {
  describe('obfuscate', () => {
    it('should not obfuscate `request.body.params` when `method` is not listed for obfuscation', () => {
      const request = { body: '{"id":"1485369469422","method":"foo","params":["foobar"]}' };

      obfuscate(request);

      request.should.eql({ body: '{"id":"1485369469422","method":"foo","params":["foobar"]}' });
    });

    it('should obfuscate the authorization header', () => {
      const request = { headers: { authorization: 'Basic ==foobar' } };

      obfuscate(request);

      request.should.eql({ headers: { authorization: 'Basic ******' } });
    });

    it('should obfuscate all private keys from `request.body` when `method` is `importmulti`', () => {
      const request = { body: '{"id":"1485369469422","method":"importmulti","params":[[{"address":"foobar","keys":["myprivate1","myprivate2"]},{"address":"foobar2","keys":["myprivate1","myprivate2"]}]]}' };

      obfuscate(request);

      request.should.eql({ body: '{"id":"1485369469422","method":"importmulti","params":[[{"address":"foobar","keys":["******","******"]},{"address":"foobar2","keys":["******","******"]}]]}' });
    });

    it('should obfuscate the private key from `request.body` when `method` is `importprivkey`', () => {
      const request = { body: '{"id":"1485369469422","method":"importprivkey","params":["foobar"]}' };

      obfuscate(request);

      request.should.eql({ body: '{"id":"1485369469422","method":"importprivkey","params":["******"]}' });
    });

    it('should obfuscate the private key from `request.body` when `method` is `signmessagewithprivkey`', () => {
      const request = { body: '{"id":"1485369469422","method":"signmessagewithprivkey","params":["foobar", "foobiz"]}' };

      obfuscate(request);

      request.should.eql({ body: '{"id":"1485369469422","method":"signmessagewithprivkey","params":["******","foobiz"]}' });
    });

    it('should obfuscate all private keys from `request.body` when `method` is `signrawtransaction`', () => {
      const request = { body: '{"id":"1485369469422","method":"signrawtransaction","params":["foo","bar",["biz", "boz"]]}' };

      obfuscate(request);

      request.should.eql({ body: '{"id":"1485369469422","method":"signrawtransaction","params":["foo","bar",["******","******"]]}' });
    });

    it('should obfuscate the passphrase from `request.body` when `method` is `encryptwallet`', () => {
      const request = { body: '{"id":"1485369469422","method":"encryptwallet","params":["foobar"]}' };

      obfuscate(request);

      request.should.eql({ body: '{"id":"1485369469422","method":"encryptwallet","params":["******"]}' });
    });

    it('should obfuscate the passphrase from `request.body` when `method` is `walletpassphrase`', () => {
      const request = { body: '{"id":"1485369469422","method":"walletpassphrase","params":["foobar"]}' };

      obfuscate(request);

      request.should.eql({ body: '{"id":"1485369469422","method":"walletpassphrase","params":["******"]}' });
    });

    it('should obfuscate the `request.body` of a batch request', () => {
      const request = { body: '[{"id":"1485369469422","method":"walletpassphrase","params":["foobar"]},{"id":"1485369469423","method":"walletpassphrase","params":["foobar"]}]' };

      obfuscate(request);

      request.should.eql({ body: '[{"id":"1485369469422","method":"walletpassphrase","params":["******"]},{"id":"1485369469423","method":"walletpassphrase","params":["******"]}]' });
    });

    it('should obfuscate the private key from `response.body` when `method` is `dumpprivkey`', () => {
      const request = { response: { body: { id: '1485369469422-0', result: 'foobiz' } } };

      obfuscate(request, { body: '{"id":"1485369469422","method":"dumpprivkey","params":["foobar"]}' });

      request.should.eql({ response: { body: { id: '1485369469422-0', result: '******' } } });
    });

    it('should obfuscate the `response.body` when `headers.content-type` is `application/octet-stream`', () => {
      const request = { response: { body: new Buffer('foobar'), headers: { 'content-type': 'application/octet-stream' } } };

      obfuscate(request, { uri: 'foobar.bin' });

      request.should.eql({ response: { body: '******', headers: { 'content-type': 'application/octet-stream' } } });
    });

    it('should obfuscate the `request.response.body` of a batch request', () => {
      const request = {
        response: {
          body: [
            { id: '1485369469422-0', result: 'foobar' },
            { id: '1485369469422-2', result: 'foobiz' },
            { id: '1485369469422-1', result: 'foo' }
          ]
        }
      };

      obfuscate(request, { body: '[{"id":"1485369469422-0","method":"dumpprivkey","params":["foobar"]},{"id":"1485369469422-2","method":"getnewaddress","params":["foobiz"]},{"id":"1485369469422-1","method":"dumpprivkey","params":["foobiz"]}]' });

      request.should.eql({
        response: {
          body: [
            { id: '1485369469422-0', result: '******' },
            { id: '1485369469422-2', result: 'foobiz' },
            { id: '1485369469422-1', result: '******' }
          ]
        }
      });
    });
  });
});
