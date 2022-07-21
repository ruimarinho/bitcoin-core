
/**
 * Module dependencies.
 */

const _ = require('lodash');

/**
 * Parse `help` from bitcoin output.
 */

module.exports = help => _.chain(help.split('\n'))
  .reject(line => line.startsWith('==') || !_.identity(line))
  .map(line => (/^([a-z]+)/).exec(line)[1])
  .value();
