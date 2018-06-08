const _ = require('lodash');

module.exports = config;

/**
 * Set Jsonmonger configuration globally for all `CustomModel`s to inherit.
 *
 * @memberof Jsonmonger
 * @method Jsonmonger#config
 *
 * @param {Object} [options]
 *   An optional configuration object. If no configuration is provided, this
 *   function just returns the existing configuration (if it exists).
 * @param {string} options.base_url
 *   The base URL to which all JSON API requests should be made.
 *
 * @return {Object}
 *   The configuration as it was stored globally.
 */
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
