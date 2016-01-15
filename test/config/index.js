
/**
 * Default config for docker-based test suite.
 */

/* eslint-disable no-process-env, no-sync */
const exec = require('child_process').execFileSync;

/**
 * Get [docker] host.
 */

function getHost(name) {
  return process.env.DOCKER_HOST ? 'dev.shared' : name;
}

/**
 * Get [docker] port.
 */

function getPort(name) {
  return process.env.DOCKER_HOST ? Number(exec('docker-compose', ['port', name, '18332']).toString().split(':')[1]) : 18332;
}

/* eslint-disable no-process-env */
const config = {
  bitcoind: {
    host: getHost('bitcoind'),
    password: 'bar',
    port: getPort('bitcoind'),
    username: 'foo'
  },
  bitcoindSsl: {
    host: getHost('bitcoind-ssl'),
    password: 'bar',
    port: getPort('bitcoind-ssl'),
    username: 'foo'
  },
  bitcoindUsernameOnly: {
    host: getHost('bitcoind-username-only'),
    port: getPort('bitcoind-username-only'),
    username: 'foo'
  }
};

/**
 * Export `config`.
 */

export default config;
