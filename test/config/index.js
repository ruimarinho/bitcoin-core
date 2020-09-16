
/**
 * Default config for Docker-based test suite.
 */

/**
 * Services config.
 */

const config = {
  bitcoin: {
    host: 'localhost',
    password: 'bar',
    port: 18443,
    username: 'foo'
  },
  bitcoinMultiWallet: {
    host: 'localhost',
    password: 'bar',
    port: 18453,
    username: 'foo'
  },
  bitcoinSsl: {
    host: 'localhost',
    password: 'bar',
    port: 18463,
    username: 'foo'
  },
  bitcoinUsernameOnly: {
    host: 'localhost',
    port: 18473,
    username: 'foo'
  }
};

/**
 * Export `config`.
 */

export default config;
