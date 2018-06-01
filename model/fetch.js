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

function build_request({ config, object }) {
  const request = {
    method: 'get',
    url: `${config.base_url}${object.endpoint}/${object.id}`,
  }
  const include_param = get_include_param({ object, related: config.related });

  if (include_param) {
    request.url += `?include=${include_param}`;
  }

  return request;
}

function get_include_param({ object, related }) {
  let include_param = '';

  if (!related) {
    return include_param;
  }

  switch (typeof related) {
    case 'string':
      include_param += calculate_related_paths({ object, prop: related });
      break;

    case 'object':
      if (Array.isArray(related)) {
        include_param += related
          .map(item => get_include_param({ object, related: item }))
          .filter(item => item)
          .join(',');
      }
      // @TODO: Support non-iterable objects (for nested relationships?)
      break;

    case 'boolean':
      if (related) {
        include_param += Object.keys(object.__schema)
          .map(item => get_include_param({ object, related: item }))
          .filter(item => item)
          .join(',');
      }
      break;
  }

  return include_param;
}

function calculate_related_paths({ object, prop }) {
  const directive = object.__schema[prop];

  if (typeof directive !== 'string' || !directive.match(/^relationships\./)) {
    // @TODO: Probably good to console.warn() here.
    return '';
  }

  return directive.replace(/^relationships\./, '');
}
