const _ = require('lodash');

module.exports = fetch;

function fetch(options) {
  const object = this;
  const config = _.merge({}, object.__config, options);
  const request = build_request({ config, object });
  const axios = object.__axios;

  return axios(request).then(response => {
    const related = (response.data.included || []).reduce((result, item) => {
      result[item.id] = item;
      return result;
    }, {});

    object.hydrate({ data: response.data.data, related });
    object.__saved = true;
    object.__new = false;

    return object;
  });
}

function build_request({ object }) {
  return {
    method: 'get',
    url: `${object.__config.base_url}${object.endpoint}/${object.id}`,
  }
}
