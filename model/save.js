const _ = require('lodash');

module.exports = save;

/**
 * **Save the data for a `DocumentObject` to the API.** The `.save()` method
 * updates the `DocumentObject` in place. It also returns the object.
 *
 * Consider the following scenario:
 *
 * ```javascript
 * const myAuthor = await new Author({ id: 'some_id' }).fetch();
 *
 * // Update the author’s first name.
 * myAuthor.firstName = 'Laura';
 *
 * console.log(myAuthor.saved); // false
 * ```
 *
 * Given the need to save the changes made to the `myAuthor` `DocumentObject`,
 * both of the following uses are valid:
 * ```javascript
 * // Using async/await.
 * await myAuthor.save();
 *
 * // Using the returned promise.
 * myAuthor.save().then(updatedAuthor => {
 *   console.log(updatedAuthor === myAuthor); // true
 * });
 * ```
 *
 * @memberof DocumentObject
 * @method DocumentObject#save
 *
 * @return {Promise<DocumentObject|Error>}
 *   A promise which resolves when the API responds.
 */
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
