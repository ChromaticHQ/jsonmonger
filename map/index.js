module.exports = map;

const map_object = require('./object');

/**
 * Map JSON API data according to a schema.
 * @method map
 * @public
 *
 * @todo Document this method.
 */
function map({ config, data, included, related, links, meta }) {
  let schema = config.schema[data.type];
  if (!schema) {
    return data;
  }

  // Build related object out of included array for more efficient lookups.
  if (!related) {
    var related = !included.length ? {} : included.reduce((obj, item) => {
      obj[`${item.type}::${item.id}`] = item;
      return obj;
    }, {});
  }

  return map_object({ config, schema, parentKey: undefined, data, related, map });
}
