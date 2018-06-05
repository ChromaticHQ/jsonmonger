const Model = require('../../../').Model;

module.exports = (config = {}) => new Model({
  type: 'post',
  endpoint: '/posts',
  title: 'attributes.title',
  subtitle: 'attributes.sub_title',
  author: 'relationships.author',
  body: 'relationships.body',
  topics: 'relationships.category',
}, config);
