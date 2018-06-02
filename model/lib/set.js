const _ = require('lodash');
const get_prop_info = require('./get_prop_info');

module.exports = set;

function set({ object, prop, value }) {
  const { type, map } = get_prop_info({ object, prop });
  switch (type) {
    case 'function':
      return map(value);
    case 'attributes':
      return set_mapped_attr({ map, object, prop, type, value });
    case 'relationships':
      return set_mapped_relationship();
    case 'unmapped':
      return this[prop] = value;
  }
}

function set_mapped_attr({ map, object, prop, type, value }) {
  const previous = object.__previous_props;
  const changed = object.__changed_props;

  // Handle a previously unchanged value.
  if (!_.has(changed, prop) && _.get(object, `__data.${map}`) !== value) {
    changed[prop] = true;
    previous[prop] = _.get(object, `__data.${map}`);

  // Handle a previously changed value that is now set back to original value.
  } else if (previous[prop] === value) {
    delete changed[prop];
    delete previous[prop];
  }

  // Set new current value in JSON data object.
  _.set(object, `__data.${map}`, value);

  return value;
}

function set_mapped_relationship({ map, object, prop, type, value }) {
  validate_relationship(value);
}

function validate_relationship(value) {
  let message = null;
  if (typeof value !== 'object') {
    message = 'Relationships can only be set to objects or arrays.';
  } else if (Array.isArray(value) && value.some(item => (!item.id || !item.type))) {
    message = 'Items in an array of relationships must have an id and a type.';
  } else if (!value.id || !value.type) {
    message = 'Relationship objects must have an id and a type.';
  }

  if (message) {
    throw new Error(`Jsonmonger Error: ${message}`);
  }
}
