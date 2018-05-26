const Model = require('../../../').Model;
const Image = require('./Image');
const Paragraph = require('./Paragraph');
const Person = require('./Person');

module.exports = ({ axios } = {}) => new Model({
  type: 'post',
  endpoint: '/posts',
  title: 'attributes.title',
  subtitle: 'attributes.sub_title',
  author: 'relationships.author',
  body: 'relationships.body',
  topics: 'relationships.category',
}, {
  axios,
  related: [ Image, Paragraph, Person ],
});
