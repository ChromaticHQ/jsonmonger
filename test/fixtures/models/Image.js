const Model = require('../../../').Model;
const Person = require('./Person');

module.exports = ({ axios } = {}) => new Model({
  type: 'image',
  endpoint: '/images',
  url: 'attributes.src',
  alt: 'attributes.alt',
  credit: 'relationships.author',
}, {
  axios,
  related: [ Person ],
});
