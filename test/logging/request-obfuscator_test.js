
/**
 * Module dependencies.
 */

const { obfuscate } = require('../../src/logging/request-obfuscator');
const should = require('should');

/**
 * Test `RequestObfuscator`.
 */

describe('RequestObfuscator', () => {
  describe('obfuscate', () => {
    it('should not obfuscate `request.body.params` when `method` is not listed for obfuscation', () => {
      const request = { body: '{"id":"1485369469422","method":"foo","params":["foobar"]}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"foo","params":["foobar"]}');
    });

    it('should obfuscate the authorization header', () => {
      const request = { headers: { authorization: 'Basic ==foobar' }, type: 'request' };

      obfuscate(request);

      should(request.headers).eql({ authorization: 'Basic ******' });
    });

    it('should obfuscate all private keys from `request.body` when `method` is `importmulti`', () => {
      const request = { body: '{"id":"1485369469422","method":"importmulti","params":[[{"address":"foobar","keys":["myprivate1","myprivate2"]},{"address":"foobar2","keys":["myprivate1","myprivate2"]}]]}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"importmulti","params":[[{"address":"foobar","keys":["******","******"]},{"address":"foobar2","keys":["******","******"]}]]}');
    });

    it('should obfuscate the private key from `request.body` when `method` is `importprivkey`', () => {
      const request = { body: '{"id":"1485369469422","method":"importprivkey","params":["foobar"]}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"importprivkey","params":["******"]}');
    });

    it('should obfuscate the private key from `request.body` when `method` is `importprivkey` and RPC is called with named parameters', () => {
      const request = { body: '{"id":"1485369469422","method":"importprivkey","params":{"privkey":"foobar"}}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"importprivkey","params":{"privkey":"******"}}');
    });

    it('should obfuscate the private key from `request.body` when `method` is `signmessagewithprivkey`', () => {
      const request = { body: '{"id":"1485369469422","method":"signmessagewithprivkey","params":["foobar", "foobiz"]}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"signmessagewithprivkey","params":["******","foobiz"]}');
    });

    it('should obfuscate the private key from `request.body` when `method` is `signmessagewithprivkey` and RPC is called with named parameters', () => {
      const request = { body: '{"id":"1485369469422","method":"signmessagewithprivkey","params":{"privkey":"foobar","message":"foobiz"}}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"signmessagewithprivkey","params":{"privkey":"******","message":"foobiz"}}');
    });

    it('should obfuscate all private keys from `request.body` when `method` is `signrawtransaction`', () => {
      const request = { body: '{"id":"1485369469422","method":"signrawtransaction","params":["foo","bar",["biz", "boz"]]}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"signrawtransaction","params":["foo","bar",["******","******"]]}');
    });

    it('should obfuscate all private keys from `request.body` when `method` is `signrawtransaction` and RPC is called with named parameters', () => {
      const request = { body: `{"id":"1485369469422","method":"signrawtransaction","params":${JSON.stringify({
        hexstring: 'foo',
        prevtxs: [],
        privkeys: ['foo', 'bar'],
        sighashtype: 'bar'
      })}}`, type: 'request' };

      obfuscate(request);

      should(request.body).eql(`{"id":"1485369469422","method":"signrawtransaction","params":${JSON.stringify({
        hexstring: 'foo',
        prevtxs: [],
        privkeys: ['******', '******'],
        sighashtype: 'bar'
      })}}`);
    });

    it('should obfuscate all private keys from `request.body` when `method` is `signrawtransactionwithkey`', () => {
      const request = { body: '{"id":"1485369469422","method":"signrawtransactionwithkey","params":["foo",["biz", "boz"], "bar"]}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"signrawtransactionwithkey","params":["foo",["******","******"],"bar"]}');
    });

    it('should obfuscate all private keys from `request.body` when `method` is `signrawtransactionwithkey` and RPC is called with named parameters', () => {
      const request = { body: `{"id":"1485369469422","method":"signrawtransactionwithkey","params":${JSON.stringify({
        hexstring: 'foo',
        prevtxs: [],
        privkeys: ['foo', 'bar'],
        sighashtype: 'bar'
      })}}`, type: 'request' };

      obfuscate(request);

      should(request.body).eql(`{"id":"1485369469422","method":"signrawtransactionwithkey","params":${JSON.stringify({
        hexstring: 'foo',
        prevtxs: [],
        privkeys: ['******', '******'],
        sighashtype: 'bar'
      })}}`);
    });

    it('should obfuscate the passphrase from `request.body` when `method` is `encryptwallet`', () => {
      const request = { body: '{"id":"1485369469422","method":"encryptwallet","params":["foobar"]}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"encryptwallet","params":["******"]}');
    });

    it('should obfuscate the passphrase from `request.body` when `method` is `encryptwallet` and RPC is called with named parameters', () => {
      const request = { body: '{"id":"1485369469422","method":"encryptwallet","params":{"passphrase":"foobar"}}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"encryptwallet","params":{"passphrase":"******"}}');
    });

    it('should obfuscate the passphrase from `request.body` when `method` is `walletpassphrase`', () => {
      const request = { body: '{"id":"1485369469422","method":"walletpassphrase","params":["foobar"]}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"walletpassphrase","params":["******"]}');
    });

    it('should obfuscate the passphrase from `request.body` when `method` is `walletpassphrase` and RPC is called with named parameters', () => {
      const request = { body: '{"id":"1485369469422","method":"walletpassphrase","params":{"passphrase":"foobar"}}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"walletpassphrase","params":{"passphrase":"******"}}');
    });

    it('should obfuscate the oldpassphrase and newpassphrase from `request.body` when `method` is `walletpassphrasechange`', () => {
      const request = { body: '{"id":"1485369469422","method":"walletpassphrasechange","params":["foobar", "foobiz"]}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"walletpassphrasechange","params":["******","******"]}');
    });

    it('should obfuscate the oldpassphrase and newpassphrase from `request.body` when `method` is `walletpassphrasechange` and RPC is called with named parameters', () => {
      const request = { body: '{"id":"1485369469422","method":"walletpassphrasechange","params":{"oldpassphrase":"foobar","newpassphrase":"foobar"}}', type: 'request' };

      obfuscate(request);

      should(request.body).eql('{"id":"1485369469422","method":"walletpassphrasechange","params":{"oldpassphrase":"******","newpassphrase":"******"}}');
    });

    it('should obfuscate the `request.body` of a batch request', () => {
      const request = { body: '[{"id":"1485369469422","method":"walletpassphrase","params":["foobar"]},{"id":"1485369469423","method":"walletpassphrase","params":["foobar"]}]', type: 'request' };

      obfuscate(request);

      should(request.body).eql('[{"id":"1485369469422","method":"walletpassphrase","params":["******"]},{"id":"1485369469423","method":"walletpassphrase","params":["******"]}]');
    });

    it('should obfuscate the private key from `body` when `method` is `dumpprivkey`', () => {
      const request = { body: '{"id":"1485369469422-0","result":"foobiz"}', type: 'response' };

      obfuscate(request, { body: '{"id":"1485369469422","method":"dumpprivkey","params":["foobar"]}' });

      should(JSON.parse(request.body)).eql({ id: '1485369469422-0', result: '******' });
    });

    it('should obfuscate the `body` when `headers.content-type` is `application/octet-stream`', () => {
      const request = { body: new Buffer('foobar'), headers: { 'content-type': 'application/octet-stream' }, type: 'response' };

      obfuscate(request, { uri: 'foobar.bin' });

      should(request).eql({ body: '******', headers: { 'content-type': 'application/octet-stream' }, type: 'response' });
    });

    it('should obfuscate the `request.body` of a batch request', () => {
      const request = {
        body: JSON.stringify([
          { id: '1485369469422-0', result: 'foobar' },
          { id: '1485369469422-2', result: 'foobiz' },
          { id: '1485369469422-1', result: 'foo' }
        ]),
        type: 'response'
      };

      obfuscate(request, { body: '[{"id":"1485369469422-0","method":"dumpprivkey","params":["foobar"]},{"id":"1485369469422-2","method":"getnewaddress","params":["foobiz"]},{"id":"1485369469422-1","method":"dumpprivkey","params":["foobiz"]}]' });

      should(JSON.parse(request.body)).eql([
        { id: '1485369469422-0', result: '******' },
        { id: '1485369469422-2', result: 'foobiz' },
        { id: '1485369469422-1', result: '******' }
      ]);
    });

    it('should not throw an error with a non-JSON body', () => {
      const request = { body: 'Work queue depth exceeded', type: 'response' };

      should(() => {
        obfuscate(request, { body: '{"id":"1485369469422","method":"dumpprivkey","params":["foobar"]}' });
      }).not.throw();

      should(request.body).eql('Work queue depth exceeded');
    });
  });
});
