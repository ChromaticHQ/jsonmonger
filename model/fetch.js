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
  const include_param = get_related_fields({ object, related: config.related }).join(',');

  if (include_param) {
    request.url += `?include=${include_param}`;
  }

  return request;
}

function get_related_fields({ object, related }) {
  let related_fields = [];

  if (!related) {
    return related_fields;
  }

  switch (typeof related) {
    case 'string':
      related_fields.push(calculate_related_paths({ object, prop: related }));
      break;

    case 'object':
      if (Array.isArray(related)) {
        related_fields = related_fields.concat(related
          .map(item => get_related_fields({ object, related: item }))
          .map(item => item[0])
          .filter(item => item)
        )
      }
      // @TODO: Support non-iterable objects (for nested relationships?)
      break;

    case 'boolean':
      related_fields = related_fields.concat(Object.keys(object.__maps)
        .map(item => get_related_fields({ object, related: item }))
        .map(item => item[0])
        .filter(item => item)
      )
      break;
  }

  return related_fields;
}

function calculate_related_paths({ object, prop }) {
  const directive = object.__maps[prop];

  if (typeof directive !== 'string' || !directive.match(/^relationships\./)) {
    // @TODO: Probably good to console.warn() here.
    return '';
  }

  return directive.replace(/^relationships\./, '');
}
