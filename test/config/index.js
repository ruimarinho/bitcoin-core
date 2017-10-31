
/**
 * Default config for Docker-based test suite.
 */

/**
 * Get Docker host.
 */

function getHost(name) {
  return process.env.CI === 'true' ? name : '127.0.0.1'; // eslint-disable-line no-process-env
}

/**
 * Services config.
 */

const config = {
  bitcoind: {
    host: getHost('bitcoind'),
    password: 'bar',
    port: 18333,
    username: 'foo'
  },
  bitcoindSsl: {
    host: getHost('bitcoind-ssl'),
    password: 'bar',
    port: 18334,
    username: 'foo'
  },
  bitcoindUsernameOnly: {
    host: getHost('bitcoind-username-only'),
    port: 18335,
    username: 'foo'
  }
};

/**
 * Export `config`.
 */

export default config;
