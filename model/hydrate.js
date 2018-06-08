module.exports = hydrate;

/**
 * Load JSON API data into an existing `DocumentObject`. This method is called
 * internally every time data for a record is loaded from the JSON API. It is
 * available as a method for convenience, but it’s unlikely you’ll need to use
 * it directly.
 *
 * @memberof DocumentObject
 * @method DocumentObject#hydrate
 *
 * @param {Object} payload
 *   The body of a JSON API server response.
 * @param {Object} payload.data
 *   The JSON API payload’s data object.
 * @param {Object[]} [payload.included]
 *   The JSON API payload’s included array.
 * @param {Object} [payload.parent]
 *   The parent `DocumentObject`, in the case that this `DocumentObject` is for
 *   a related record.
 * @param {Object} [payload.related]
 *   An object with all related records keyed by their type and ID.
 *
 * @return {DocumentObject}
 */
function hydrate({ data, parent, related }) {
  this.__changed_props = {};
  this.__data = data;
  this.__related = related;
  this.__parent = parent || null;
  this.__previous_props = {};

  return this;
}
