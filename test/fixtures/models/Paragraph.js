const Model = require('../../../').Model;

module.exports = ({ axios } = {}) => new Model({
  type: 'paragraph',
  endpoint: '/paragraphs',
  text: 'attributes.text',
}, { axios });
