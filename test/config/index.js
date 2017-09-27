
/**
 * Default config for Docker-based test suite.
 */

/**
 * Get Docker host.
 */

function getHost(name) {
  return process.env.CI === 'true' ? name : '127.0.0.1';
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
  }
};

/**
 * Export `config`.
 */

export default config;
