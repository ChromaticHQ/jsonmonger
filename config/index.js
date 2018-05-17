const _ = require('lodash');

module.exports = config;

function config(options) {
  const CONFIG = Symbol.for('Jsonmonger.config');

  if (options) {
    const global_symbols = Object.getOwnPropertySymbols(global);
    const symbol_exists = global_symbols.indexOf(CONFIG) > -1;

    if (!symbol_exists) {
      // This really needs validation.
      global[CONFIG] = options;
    } else {
      throw new Error('Jsonmonger Error: Global configuration cannot be set more than once.');
    }
  }

  const config = _.cloneDeep(global[CONFIG]);

  Object.freeze(config);

  return config;
}
