const _ = require('lodash');

module.exports = destroy;

function destroy() {
  const object = this;
  const axios = object.__axios;
  const request = {
    method: 'delete',
    url: `${object.__config.base_url}${object.endpoint}/${object.id}`,
  }

  return axios(request).then(result => {
    _.unset(object, '__data.id');
    object.__saved = false;
    object.__new = true;
    return object;
  });
}
