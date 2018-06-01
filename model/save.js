const _ = require('lodash');

module.exports = save;

function save() {
  const object = this;
  const request = build_request({ object });
  const axios = object.__axios;

  if (object.__saved) {
    return Promise.resolve(object);
  }

  return axios(request).then(response => {
    object.__data = response.data.data;
    object.__changed_props = {};
    object.__previous_props = {};
    object.__saved = true;
    object.__new = false;

    return object;
  });
}

/* function build_requests(object) {
  const requests = [];
  const changed_props = object.__changed_props;

  for (const prop in changed_props) {
    requests.push(build_request({ object, prop }));
  }

  return requests;
} */

function build_request({ object }) {
  return {
    method: object.__new ? 'post' : 'patch',
    url: `${object.__config.base_url}${object.endpoint}${object.id && !object.__new ? '/' + object.id : ''}`,
    body: (function (object) {
      const changed_prop_keys = Object.keys(object.__changed_props);
      return changed_prop_keys.reduce((result, key) => {
        const map = _.get(object, `__schema.${key}`);
        _.set(result, `data.${map}`, _.get(object, `__data.${map}`));
        return result;
      }, { data: {} });
    })(object),
  }
}
