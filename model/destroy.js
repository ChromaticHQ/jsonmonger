const _ = require('lodash');

module.exports = destroy;

/**
 * Delete a record from the JSON API. The `.destroy()` method makes a `DELETE`
 * request to the `DocumentObject`’s endpoint and returns the `DocumentObject`
 * fully hydrated, but without an ID (as if it was a brand new record).
 *
 * @memberof DocumentObject
 * @method DocumentObject#destroy
 *
 * @return {Promise<DocumentObject|Error>}
 *   The same document object on which
 */
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
