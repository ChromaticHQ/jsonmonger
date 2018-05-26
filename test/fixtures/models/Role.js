const Model = require('../../../').Model;

module.exports = ({ axios } = {}) => new Model({
  type: 'role',
  endpoint: '/roles',
  name: 'attributes.name',
  url: 'attributes.path.alias',
});
