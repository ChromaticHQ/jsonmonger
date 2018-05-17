const _ = require('lodash');

module.exports = {
  type: 'quotation',
  value: 'attributes.text',
  citation: {
    name: 'attributes.source.name',
    link: {
      url: 'attributes.source.url',
      title: ({ object }) => {
        return _.get(object, 'attributes.source.description') || 'A fallback link title.';
      },
    },
  },
}
