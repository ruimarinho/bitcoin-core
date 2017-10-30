# bitcoin-core
A modern Bitcoin Core REST and RPC client to execute administrative tasks, wallet operations and queries about network and the blockchain.

## Status
[![npm version][npm-image]][npm-url] [![build status][travis-image]][travis-url]

## Installation
Install the package via `npm`:

```sh
npm install bitcoin-core --save
```

## Usage
### Client(...args)
#### Arguments
1. `[agentOptions]` _(Object)_: Optional `agent` [options](https://github.com/request/request#using-optionsagentoptions) to configure SSL/TLS.
2. `[headers=false]` _(boolean)_: Whether to return the response headers.
3. `[host=localhost]` _(string)_: The host to connect to.
4. `[logger=debugnyan('bitcoin-core')]` _(Function)_: Custom logger (by default, `debugnyan`).
5. `[network=mainnet]` _(string)_: The network
6. `[password]` _(string)_: The RPC server user password.
7. `[port=[network]]` _(string)_: The RPC server port.
8. `[ssl]` _(boolean|Object)_: Whether to use SSL/TLS with strict checking (_boolean_) or an expanded config (_Object_).
9. `[ssl.enabled]` _(boolean)_: Whether to use SSL/TLS.
10. `[ssl.strict]` _(boolean)_: Whether to do strict SSL/TLS checking (certificate must match host).
11. `[timeout=30000]` _(number)_: How long until the request times out (ms).
12. `[username]` _(number)_: The RPC server user name.
13. `[version]` _(string)_: Which version to check methods for ([read more](#versionchecking)).

### Examples
#### Using network mode
The `network` will automatically determine the port to connect to, just like the `bitcoind` and `bitcoin-cli` commands.

```js
const Client = require('bitcoin-core');
const client = new Client({ network: 'regtest' });
```

##### Setting a custom port

```js
const client = new Client({ port: 28332 });
```

#### Connecting to an SSL/TLS server with strict checking enabled
By default, when `ssl` is enabled, strict checking is implicitly enabled.

```js
const fs = require('fs');
const client = new Client({
  agentOptions: {
    ca: fs.readFileSync('/etc/ssl/bitcoind/cert.pem')
  },
  ssl: true
});
```

#### Connecting to an SSL/TLS server without strict checking enabled

```js
const client = new Client({
  ssl: {
    enabled: true,
    strict: false
  }
});
```

#### Using promises to process the response

```js
client.getInfo().then((help) => console.log(help));
```

#### Using callbacks to process the response

```js
client.getInfo((error, help) => console.log(help));
```

#### Returning headers in the response
For compatibility with other Bitcoin Core clients.

```js
const client = new Client({ headers: true });

// Promise style with headers enabled:
client.getInfo().then(([body, headers]) => console.log(body, headers));

// Await style based on promises with headers enabled:
const [body, headers] = await client.getInfo();
```

## Named parameters

Since version v0.14.0, it is possible to send commands via the JSON-RPC interface using named parameters instead of positional ones. This comes with the advantage of making the order of arguments irrelevant. It also helps improving the readability of certain function calls when leaving out arguments for their default value.

For instance, take the `getBalance()` call written using positional arguments:

```js
const balance = await new Client().getBalance('*', 0);
```

It is functionally equivalent to using the named arguments `account` and `minconf`, leaving out `include_watchonly` (defaults to `false`):

```js
const balance = await new Client().getBalance({
  account: '*',
  minconf: 0
});
```

This feature is available to all JSON-RPC methods that accept arguments.

### Floating point number precision in JavaScript

Due to [JavaScript's limited floating point precision](http://floating-point-gui.de/), all big numbers (numbers with more than 15 significant digits) are returned as strings to prevent precision loss. This includes both the RPC and REST APIs.

### Version Checking
By default, all methods are exposed on the client independently of the version it is connecting to. This is the most flexible option as defining methods for unavailable RPC calls does not cause any harm and the library is capable of handling a `Method not found` response error correctly.

```js
const client = new Client();

client.command('foobar');
// => RpcError: -32601 Method not found
```

However, if you prefer to be on the safe side, you can enable strict version checking. This will validate all method calls before executing the actual RPC request:

```js
const client = new Client({ version: '0.12.0' });

client.getHashesPerSec();
// => Method "gethashespersec" is not supported by version "0.12.0"
```

If you want to enable strict version checking for the bleeding edge version, you may set a very high version number to exclude recently deprecated calls:

```js
const client = new Client({ version: `${Number.MAX_SAFE_INTEGER}.0.0` });

client.getWork();
// => Throws 'Method "getwork" is not supported by version "9007199254740991.0.0"'.
```

To avoid potential issues with prototype references, all methods are still enumerable on the library client prototype.

### RPC
Start the `bitcoind` with the RPC server enabled and optionally configure a username and password:

```sh
docker run --rm -it ruimarinho/bitcoin-core:0.12-alpine -printtoconsole -rpcuser=foo -rpcpassword=bar -server
```

These configuration values may also be set on the `bitcoin.conf` file of your platform installation.

By default, port `8332` is used to listen for requests in `mainnet` mode, or `18332` in `testnet` or `regtest` modes. Use the `network` property to initialize the client on the desired mode and automatically set the respective default port. You can optionally set a custom port of your choice too.

The RPC services binds to the localhost loopback network interface, so use `rpcbind` to change where to bind to and `rpcallowip` to whitelist source IP access.

#### Methods
All RPC [methods](src/methods.js) are exposed on the client interface as a camelcase'd version of those available on `bitcoind`.

For a more complete reference about which methods are available, check the [RPC documentation](https://bitcoin.org/en/developer-reference#remote-procedure-calls-rpcs) on the [Bitcoin Core Developer Reference website](https://bitcoin.org/en/developer-reference).

##### Examples

```js
client.createRawTransaction([{ txid: '1eb590cd06127f78bf38ab4140c4cdce56ad9eb8886999eb898ddf4d3b28a91d', vout: 0 }], { 'mgnucj8nYqdrPFh2JfZSB1NmUThUGnmsqe': 0.13 });
client.sendMany('test1', { mjSk1Ny9spzU2fouzYgLqGUD8U41iR35QN: 0.1, mgnucj8nYqdrPFh2JfZSB1NmUThUGnmsqe: 0.2 }, 6, 'Example Transaction');
client.sendToAddress('mmXgiR6KAhZCyQ8ndr2BCfEq1wNG2UnyG6', 0.1,  'sendtoaddress example', 'Nemo From Example.com');
```

#### Batch requests
Batched requests are support by passing an array to the `command` method with a `method` and optionally, `parameters`. The return value will be an array with all the responses.

```js
const batch = [
  { method: 'getnewaddress', parameters: [] },
  { method: 'getnewaddress', parameters: [] }
]

new Client().command(batch).then((responses) => console.log(responses)));

// Or, using ES2015 destructuring.
new Client().command(batch).then(([firstAddress, secondAddress]) => console.log(firstAddress, secondAddress)));
```

Note that batched requests will only throw an error if the batch request itself cannot be processed. However, each individual response may contain an error akin to an individual request.

```js
const batch = [
  { method: 'foobar', params: [] },
  { method: 'getnewaddress', params: [] }
]

new Client().command(batch).then(([address, error]) => console.log(address, error)));
// => `mkteeBFmGkraJaWN5WzqHCjmbQWVrPo5X3, { [RpcError: Method not found] message: 'Method not found', name: 'RpcError', code: -32601 }`.
```

### REST
Support for the REST interface is still **experimental** and the API is still subject to change. These endpoints are also **unauthenticated** so [there are certain risks which you should be aware](https://github.com/bitcoin/bitcoin/blob/master/doc/REST-interface.md#risks), specifically of leaking sensitive data of the node if not correctly protected.

Error handling is still fragile so avoid passing user input.

Start the `bitcoind` with the REST server enabled:

```sh
docker run --rm -it ruimarinho/bitcoin-core:0.12-alpine -printtoconsole -server -rest
```

These configuration values may also be set on the `bitcoin.conf` file of your platform installation. Use `txindex=1` if you'd like to enable full transaction query support (note: this will take a considerable amount of time on the first run).

### Methods
#### getBlockByHash(hash, [options], [callback])
Given a block hash, returns a block, in binary, hex-encoded binary or JSON formats.

##### Arguments
1. `hash` _(string)_: The block hash.
2. `[options]` _(Object)_: The options object.
3. `[options.extension=json]` _(string)_: Return in binary (`bin`), hex-encoded binary (`hex`) or JSON (`json`) format.
4. `[callback]` _(Function)_: An optional callback, otherwise a Promise is returned.

##### Example

```js
client.getBlockByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', { extension: 'json' });
```

#### getBlockHeadersByHash(hash, count, [options][, callback])
Given a block hash, returns amount of block headers in upward direction.

##### Arguments
1. `hash` _(string)_: The block hash.
2. `count` _(number)_: The number of blocks to count in upward direction.
3. `[options]` _(Object)_: The options object.
4. `[options.extension=json]` _(string)_: Return in binary (`bin`), hex-encoded binary (`hex`) or JSON (`json`) format.
5. `[callback]` _(Function)_: An optional callback, otherwise a Promise is returned.

##### Example

```js
client.getBlockHeadersByHash('0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206', 1, { extension: 'json' });
```

#### getBlockchainInformation([callback])
Returns various state info regarding block chain processing.

#### Arguments
1. `[callback]` _(Function)_: An optional callback, otherwise a Promise is returned.

##### Example

```js
client.getBlockchainInformation([callback]);
```

#### getMemoryPoolContent()
Returns transactions in the transaction memory pool.

#### Arguments
1. `[callback]` _(Function)_: An optional callback, otherwise a Promise is returned.

##### Example

```js
client.getMemoryPoolContent();
```

#### getMemoryPoolInformation([callback])
Returns various information about the transaction memory pool. Only supports JSON as output format.
- size: the number of transactions in the transaction memory pool.
- bytes: size of the transaction memory pool in bytes.
- usage: total transaction memory pool memory usage.

#### Arguments
1. `[callback]` _(Function)_: An optional callback, otherwise a Promise is returned.

##### Example

```js
client.getMemoryPoolInformation();
```

#### getTransactionByHash(hash, [options], [callback])
Given a transaction hash, returns a transaction in binary, hex-encoded binary, or JSON formats.

#### Arguments
1. `hash` _(string)_: The transaction hash.
2. `[options]` _(Object)_: The options object.
3. `[options.summary=false]` _(boolean)_: Whether to return just the transaction hash, thus saving memory.
4. `[options.extension=json]` _(string)_: Return in binary (`bin`), hex-encoded binary (`hex`) or JSON (`json`) format.
5. `[callback]` _(Function)_: An optional callback, otherwise a Promise is returned.

##### Example

```js
client.getTransactionByHash('b4dd08f32be15d96b7166fd77afd18aece7480f72af6c9c7f9c5cbeb01e686fe', { extension: 'json', summary: false });
```

### getUnspentTransactionOutputs(outpoints, [options], [callback])
Query unspent transaction outputs (UTXO) for a given set of outpoints. See [BIP64](https://github.com/bitcoin/bips/blob/master/bip-0064.mediawiki) for input and output serialisation.

#### Arguments
1. `outpoints` _(array\<Object\>|Object)_: The outpoint to query in the format `{ id: '<txid>', index: '<index>' }`.
2. `[options]` _(Object)_: The options object.
3. `[options.extension=json]` _(string)_: Return in binary (`bin`), hex-encoded binary (`hex`) or JSON (`json`) format.
4. `[callback]` _(Function)_: An optional callback, otherwise a Promise is returned.

##### Example

```js
client.getUnspentTransactionOutputs([{
  id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
  index: 0
}, {
  id: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
  index: 1
}], { extension: 'json' }, [callback])
```

### SSL
This client supports SSL out of the box. Simply pass the SSL public certificate to the client and optionally disable strict SSL checking which will bypass SSL validation (the connection is still encrypted but the server it is connecting to may not be trusted). This is, of course, discouraged unless for testing purposes when using something like self-signed certificates.

#### Generating a self-signed certificates for testing purposes
Please note that the following procedure should only be used for testing purposes.

Generate an self-signed certificate together with an unprotected private key:

```sh
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 3650 -nodes
```

#### Connecting via SSL
On Bitcoin Core <0.12, you can start the `bitcoind` RPC server directly with SSL:

```sh
docker run --rm -it -v $(PWD)/ssl:/etc/ssl ruimarinho/bitcoin-core:0.11-alpine -printtoconsole -rpcuser=foo -rpcpassword=bar -rpcssl -rpcsslcertificatechainfile=/etc/ssl/bitcoind/cert.pem -rpcsslprivatekeyfile=/etc/ssl/bitcoind/key.pem -server
```

On Bitcoin Core >0.12, use must use `stunnel` (`brew install stunnel` or `sudo apt-get install stunnel4`) or an HTTPS reverse proxy to configure SSL since the built-in support for SSL has been removed. The trade off with `stunnel` is performance and simplicity versus features, as it lacks more powerful capacities such as Basic Authentication and caching which are standard in reverse proxies.

You can use `stunnel` by configuring `stunnel.conf` with the following service requirements:

```
[bitcoin]
accept = 28332
connect = 18332
cert = /etc/ssl/bitcoind/cert.pem
key = /etc/ssl/bitcoind/key.pem
```

The `key` option may be omitted if you concatenating your private and public certificates into a single `stunnel.pem` file.

On some versions of `stunnel` it is also possible to start a service using command line arguments. The equivalent would be:

```sh
stunnel -d 28332 -r 127.0.0.1:18332 -p stunnel.pem -P ''
```

Then pass the public certificate to the client:

```js
const Client = require('bitcoin-core');
const fs = require('fs');
const client = new Client({
  agentOptions: {
    ca: fs.readFileSync('/etc/ssl/bitcoind/cert.pem')
  },
  port: 28332,
  ssl: true
});
```

## Logging

By default, all requests made with `bitcoin-core` are logged using [uphold/debugnyan](https://github.com/uphold/debugnyan) with `bitcoin-core` as the logging namespace.

Please note that all sensitive data is obfuscated before calling the logger.

#### Example

Example output defining the environment variable `DEBUG=bitcoin-core`:

```javascript
const client = new Client();

client.getTransactionByHash('b4dd08f32be15d96b7166fd77afd18aece7480f72af6c9c7f9c5cbeb01e686fe');

// {
//   "name": "bitcoin-core",
//   "hostname": "localhost",
//   "pid": 57908,
//   "level": 20,
//   "request": {
//     "headers": {
//       "host": "localhost:8332",
//       "accept": "application/json"
//     },
//     "id": "82cea4e5-2c85-4284-b9ec-e5876c84e67c",
//     "method": "GET",
//     "type": "request",
//     "uri": "http://localhost:8332/rest/tx/b4dd08f32be15d96b7166fd77afd18aece7480f72af6c9c7f9c5cbeb01e686fe.json"
//   },
//   "msg": "Making request 82cea4e5-2c85-4284-b9ec-e5876c84e67c to GET http://localhost:8332/rest/tx/b4dd08f32be15d96b7166fd77afd18aece7480f72af6c9c7f9c5cbeb01e686fe.json",
//   "time": "2017-02-07T14:40:35.020Z",
//   "v": 0
// }
```

### Custom logger

A custom logger can be passed via the `logger` option and it should implement [bunyan's log levels](https://github.com/trentm/node-bunyan#levels).

## Tests
Currently the test suite is tailored for Docker (including `docker-compose`) due to the multitude of different `bitcoind` configurations that are required in order to get the test suite passing.

To test using a local installation of `node.js` but with dependencies (e.g. `bitcoind`) running inside Docker:

```sh
npm run dependencies
npm test
```

To test using Docker exclusively (similarly to what is done in Travis CI):

```sh
npm run testdocker
```

## Release

```sh
npm version [<newversion> | major | minor | patch] -m "Release %s"
```

## License
MIT

[npm-image]: https://img.shields.io/npm/v/bitcoin-core.svg?style=flat-square
[npm-url]: https://npmjs.org/package/bitcoin-core
[travis-image]: https://img.shields.io/travis/ruimarinho/bitcoin-core.svg?style=flat-square
[travis-url]: https://travis-ci.org/ruimarinho/bitcoin-core
