const _ = require('lodash');
const get_prop_info = require('./get_prop_info');
const SYMBOL = Symbol.for('Jsonmonger.models');

module.exports = get;

function get({ object, prop }) {
  // Get the value and what type of value it is.
  const { map, type } = get_prop_info({ object, prop });
  let result;

  switch (type) {
    case 'attributes':
      result = _.get(object, `__data.${map}`);
      break;
    case 'relationships': {
      const reference = _.get(object, `__data.${map}.data`);
      const related = _.get(object, '__related');
      if (Array.isArray(reference)) {
        result = reference.map(ref => get_related({ parent: object, reference: ref, related }));
      } else {
        result = get_related({ parent: object, reference, related });
      }
      break;
    }
    case 'unmapped':
      result = map;
  }

  return result;
}

function get_related({ parent, reference, related }) {
  const id = _.get(reference, 'id');
  const raw_related = _.get(related, id, reference);
  const type = raw_related.type;
  const Model = global[SYMBOL][type];

  if (Model) {
    return new Model().hydrate({ data: raw_related, parent, related });
  } else {
    return raw_related;
  }
}
