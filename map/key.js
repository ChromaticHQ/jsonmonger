module.exports = map_key;

const _ = require('lodash');
const map_object = require('./object');
const string_pattern = /(?:attributes|links|meta|relationships)\..+/i;

/**
 * Map a single key according to its value.
 * @private
 *
 * @todo Document this method.
 */
function map_key({ config, key, value, data, related, map, schema }) {
  let result;

  // Depending on the value provided…
  switch (typeof value) {
    // Strings matching a JSON API pattern are mapped. All others are
    // returned literally.
    case 'string':
      result = value.match(string_pattern) ? _.get(data, value) : value;
      break;

    // Other primitives are returned literally.
    case 'boolean':
    case 'number':
      result = value;
      break;

    // Arrays are iterated on and treated individually. Objects are mapped
    // as-is.
    case 'object':
      result = resolve_object({ config, data, key, map, related, result, value });
      break;

    // Functions are invoked and the returned value is interpreted according to
    // its type.
    case 'function':
      result = value;
      break;
  }

  // If the result looks like a relationship, try to map it.
  result = attempt_to_map({ config, data, key, map, related, result, schema });

  return result;
}

function resolve_object({ config, data, key, map, related, result, value }) {
  if (Array.isArray(value)) {
    // Treat each item in the array as a key/value pair.
    return value.map((item, i) => {
      return map_key({ config, value: item, key: i, data, related, map });
    });
  } else {
    // Treat literal objects as objects.
    return map_object({ config, data, map, parentKey: key, schema: value, related });
  }
}

/* eslint-disable complexity */
function attempt_to_map({ config, key, map, related, result, schema }) {
  // Use an alternate schema if provided.
  const alt_schema_name = _.get(schema, `__${key}_schema`);

  if (result && result.data && Array.isArray(result.data)) {
    return result.data.map(item => {
      if (item.id && item.type && related[`${item.type}::${item.id}`]) {
        return map({ config, data: related[`${item.type}::${item.id}`], related, alt_schema_name, meta: result.meta, map });
      } else {
        return item;
      }
    });
  } else if (result && result.data && result.data.id && result.data.type
    && related[`${result.data.type}::${result.data.id}`]) {
    return map({ config, data: related[`${result.data.type}::${result.data.id}`], related, alt_schema_name, meta: result.meta, map });
  } else {
    return result;
  }
}
/* eslint-enable complexity */
