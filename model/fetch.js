module.exports = fetch;

function fetch() {
  const object = this;
  const request = build_request({ object });
  const axios = object.__axios;

  return axios(request).then(response => {
    object.__data = response.data.data;
    object.__related = (response.data.included || []).reduce((result, item) => {
      result[item.id] = item;
      return result;
    }, {});
    object.__changed_props = {};
    object.__previous_props = {};
    object.__saved = true;
    object.__new = false;

    return object;
  });
}

function build_request({ object }) {
  return {
    method: 'get',
    url: `${object.endpoint}/${object.id}`,
  }
}
