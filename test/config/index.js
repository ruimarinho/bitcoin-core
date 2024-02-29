
/**
 * Default config for Docker-based test suite.
 */

/**
 * Export services config.
 */

module.exports = {
  bitcoin: {
    host: 'http://localhost:18443',
    password: 'bar',
    username: 'foo'
  },
  bitcoinMultiWallet: {
    host: 'http://localhost:18453',
    password: 'bar',
    username: 'foo'
  },
  bitcoinNoAuth: {
    host: 'http://localhost:18483'
  },
  bitcoinUsernameOnly: {
    host: 'http://localhost:18473',
    username: 'foo'
  }
};
