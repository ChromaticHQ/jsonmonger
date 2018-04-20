module.exports = map_object;

const map_key = require('./key');

/**
 * Process an object as a schema/subschema.
 * @private
 *
 * @todo Document this function.
 */
function map_object({ config, schema, parentKey, data, related, map }) {
  const result = {
    __virtuals: [],
  }

  // If type is not defined in the schema, use the JSON API object’s type.
  if (!schema.type && !parentKey) {
    result.type = data.type;
  }

  // Map all non-function values as best as possible, and set aside method keys
  // for later processing.
  Object.keys(schema).forEach(key => {
    if (typeof schema[key] === 'function') {
      result.__virtuals.push(key);
    } else {
      result[key] = map_key({ config, value: schema[key], key, data, related, map, schema });
    }
  });

  // Process all methods after object is as hydrated as possible.
  result.__virtuals.forEach(key => {
    const tmp_result = schema[key]({ result, data, related });

    if (typeof tmp_result === 'string') {
      result[key] = map_key({ config, value: tmp_result, key, data, related, map, schema });
    } else {
      result[key] = tmp_result;
    }
  });
  delete result.__virtuals;

  return result;
}
