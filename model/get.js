const _ = require('lodash');
const get_prop_info = require('./lib/get_prop_info');

module.exports = get;

function get({ object, prop }) {
  // Get the value and what type of value it is.
  const { map, type } = get_prop_info({ object, prop });

  switch (type) {
    case 'function':
      return _.get(object, `__virtuals_cache${prop}`, map(object));
    case 'attributes':
      return _.get(object, `__data.${map}`);
    case 'relationships': {
      const reference = _.get(object, `__data.relationships.${map}.data`);
      return get_related({ reference, related: _.get(object, '__related') });
    }
    case 'unmapped':
      return map;
  }
}

function get_related({ reference, related }) {
  if (Array.isArray(reference)) {
    return reference.map(ref => {
      const id = _.get(ref, 'id');
      return _.get(related, id, ref);
    });
  } else {
    const id = _.get(reference, 'id');
    return _.get(related, id, reference);
  }
}
