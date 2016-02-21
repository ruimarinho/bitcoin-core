
/**
 * Default config for Docker-based test suite.
 */

/**
 * Get Docker host.
 */

function getHost(name) {
  return process.env.CI === 'true' ? name : `bitcoincore_${name}_1.bitcoind.docker`;
}

/**
 * Services config.
 */

const config = {
  bitcoind: {
    host: getHost('bitcoind'),
    password: 'bar',
    port: 18332,
    username: 'foo'
  },
  bitcoindSsl: {
    host: getHost('bitcoind-ssl'),
    password: 'bar',
    port: 18332,
    username: 'foo'
  },
  bitcoindUsernameOnly: {
    host: getHost('bitcoind-username-only'),
    port: 18332,
    username: 'foo'
  }
};

/**
 * Export `config`.
 */

export default config;
