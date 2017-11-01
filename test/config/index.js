
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
  bitcoin: {
    host: getHost('bitcoin-core'),
    password: 'bar',
    port: 18443,
    username: 'foo'
  },
  bitcoinMultiWallet: {
    host: getHost('bitcoin-core-multi-wallet'),
    password: 'bar',
    port: 18453,
    username: 'foo'
  },
  bitcoinSsl: {
    host: getHost('bitcoin-core-ssl'),
    password: 'bar',
    port: 18463,
    username: 'foo'
  },
  bitcoinUsernameOnly: {
    host: getHost('bitcoin-core-username-only'),
    port: 18473,
    username: 'foo'
  }
};

/**
 * Export `config`.
 */

export default config;
