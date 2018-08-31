const _ = require('lodash');

module.exports = fetch;

function fetch(options) {
  const object = this;
  const config = _.merge({}, object.__config, options);
  const axios = object.__axios;
  const main_request = axios(build_request_options({ config, object }))
    .then(res => res.data);
  let requests = [ main_request ];

  if (config.parallel_relationships) {
    // Concatenate related requests.
    requests = requests.concat(build_related_requests({ axios, config, object }));
  }

  return Promise.all(requests).then(responses => {
    const main = responses.shift();
    const data = main.data;
    const related = {}

    if (config.parallel_relationships) {
      responses.forEach(response => {
        if (response.__relationship) {
          data.relationships[response.__relationship] = response.data.data;
        } else if (response.__related_object) {
          const item = response.data.data;
          related[item.id] = item;
        }
      });
    } else {
      main.included.forEach(item => {
        related[item.id] = item;
      });
    }

    object.hydrate({ data, related });
    object.__saved = true;
    object.__new = false;

    return object;
  });
}

function build_request_options({ config, object }) {
  const request = {
    method: 'get',
    url: `${config.base_url}${object.endpoint}/${object.id}`,
  }

  // If relationships are not being fetched in parallel, try to include them
  // via query string param.
  if (!config.parallel_relationships) {
    const include_param = get_related_fields({ object, related: config.related }).join(',');

    if (include_param) {
      request.url += `?include=${include_param}`;
    }
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

/**
 * Construct an array of parallel requests to fetch related objects and the
 * relationships themselves.
 *
 * @return Array - An array of promises.
 */
function build_related_requests({ axios, config, object }) {
  return get_related_fields({ object, related: config.related })

    // Reduce the array of related fields into an array of requests;
    // two requests per related field:
    //   - fetching the related object
    //   - fetching the relationship itself (sometimes this includes metadata
    //     about the relationship)
    .reduce((arr, item) => {

      // Request relationship data.
      const rel_req = build_request_options({ config, object });
      rel_req.url += `/relationships/${item}`;
      arr.push(axios(rel_req).then(response => {
        response.__relationship = item;
        return response;
      }));

      // Request related object data.
      const obj_req = build_request_options({ config, object });
      obj_req.url += `/${item}`;
      arr.push(axios(obj_req).then(response => {
        response.__related_object = item;
        return response;
      }));

      return arr;
    }, []);
}
