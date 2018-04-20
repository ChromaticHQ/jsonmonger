module.exports = Jsonapi;

const _ = require('lodash');

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
  this.config =_.cloneDeep(config);
}

[ 'get', 'map', 'qs' ].forEach(method => {
  Jsonapi.prototype[method] = function (args) {
    const config = this.config;
    return require(`./${method}`)(Object.assign({ config }, args ));
  }
});
