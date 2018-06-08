const _ = require('lodash');

module.exports = fetch;

/**
 * **Get the data for a Jsonmonger DocumentObject from the API.** The
 * `.fetch()` method hydrates the Jsonmonger DocumentObject in place. It also
 * returns the object, so both of the following uses are valid:
 *
 * ```javascript
 * // Using async/await.
 * const myAuthor = await new Author({ id: '1' }).fetch();
 *
 * // Using the returned promise.
 * const myAuthor = new Author({ id: '1' });
 *
 * myAuthor.fetch().then(result => {
 *   console.log(result === myObject); // true
 * });
 *
 * ```
 *
 * @memberof DocumentObject
 * @method DocumentObject#fetch
 *
 * @param {Object} [options]
 *   An object with overrides for this particular GET request.
 * @param {(boolean|string|string[])} [options.related]
 *   Indicates whether to include related records. If `true`, requests includes
 *   all related records.
 *
 *   Alternatively, select model properties can be requested by providing a
 *   string or array of strings for which related records should be included.
 *
 * @return {Promise<DocumentObject|Error>}
 *   A promise which resolves when the API responds and the object has been
 *   hydrated.
 */
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

/**
 * Build a request object that can be passed to axios.
 * @private
 *
 * @param {Object} data
 *
 * @param {Object} data.config
 *   A fetch method configuration object.
 *
 * @param {Object} data.object
 *   The current jsonmonger object being fetched.
 *
 * @return {Object}
 *   An object with a `method` and `url` properties.
 */
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

/**
 * Get the string to be appended to the `include` query string parameter for a
 * particular relationship.
 * @private
 *
 * @param {Object} data
 *
 * @param {Object} data.object
 *   The current jsonmonger object being fetched.
 *
 * @param {boolean|string|string[]|object} data.related
 *
 * @return something
 */
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
