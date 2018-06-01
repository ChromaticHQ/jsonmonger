const _ = require('lodash');

module.exports = get_prop_info;

function get_prop_info({ object, prop }) {
  const map = _.get(object, `__schema.${prop}`);

  let type = 'unmapped';
  if (typeof map === 'function') {
    type = 'function';
  } else if (map.match(/^attributes\./)) {
    type = 'attributes';
  } else if (map.match(/^relationships\./)) {
    type = 'relationships';
  }

  return { type, map };
}

