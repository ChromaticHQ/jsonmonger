module.exports = Jsonapi;

/**
 * Construct Jsonapi utility object.
 * @constructor
 *
 * @param {Object} config - A configuration object.
 *
 * @todo Document the config properties.
 */
function Jsonapi(config) {
  // @todo Do some config validation, probably.
  return {
    __config: config,

    // Create setter function that throws an error when attempting to set a new
    // Jsonapi config.
    set config(param) {
      throw new Error('Mapper: cannot set config after construction.');
    },

    // Create getter function that returns the Jsonapi config.
    get config() {
      return this.__config;
    },
  }
}

[ 'get', 'map', 'qs' ].forEach(method => {
  Jsonapi.prototype[method] = function (args) {
    const config = this.config;
    return require(`./${method}`)(Object.assign({ config }, args ));
  }
});
