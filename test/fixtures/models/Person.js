const Model = require('../../../').Model;

module.exports = config => new Model({
  type: 'person',
  endpoint: '/people',
  fullName: 'attributes.name',
  firstName: function (value) {
    if (value) {
      const names = (this.fullName || '').split(' ');
      names[0] = value;
      this.fullName = names.join(' ');
      return value;
    } else {
      return (this.fullName || '').split(' ')[0] || null;
    }
  },
  lastName: function (value) {
    if (value) {
      const names = (this.fullName || '').split(' ');
      const lastName = value.split(' ');
      names.splice(1, lastName.length, ...lastName);
      this.fullName = names.join(' ');
      return value;
    } else {
      return (this.fullName || '').split(' ').slice(1).join(' ') || null;
    }
  },
  bio: 'attributes.biography',
  alias: 'attributes.path.alias',
  roles: 'relationships.roles',
}, config);
