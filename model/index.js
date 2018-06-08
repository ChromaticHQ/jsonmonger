const _ = require('lodash');
const destroy = require('./destroy');
// TIL there is a Fetch API, so it might make sense to rename this method.
// Ref: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
const fetch = require('./fetch');
const get = require('./lib/get');
const hydrate = require('./hydrate');
const save = require('./save');
const set = require('./lib/set');
const validate = require('./lib/validate');
const MODELS = Symbol.for('Jsonmonger.models');
const CONFIG = Symbol.for('Jsonmonger.config');

module.exports = Model;

/**
 * A `DocumentObject` interface represents a single record from the JSON API.
 * Every time you interact with a record from a json:api server, it will be
 * through an object that subscribes to this interface.
 *
 * Given the following `CustomModel`:
 * ```javascript
 * const Author = new Model({
 *   firstName: 'attributes.field_first_name',
 *   lastName: 'attributes.field_last_name',
 * });
 * ```
 *
 * We get a `DocumentObject` by calling this model like so:
 * ```javascript
 * // Create a new DocumentObject for a brand new author.
 * const myAuthor = new Author({
 *   firstName: 'Arturo',
 *   lastName: 'Pérez-Reverte',
 * });
 *
 * // Create a new DocumentObject for an existing author record whose ID we know.
 * const myAuthor = new Author({ id: 'some_id' });
 * ```
 *
 * Every `DocumentObject` includes `fetch()`, `save()`, and `destroy()` methods
 * that submit requests to the JSON API acting on a single record.
 *
 * @interface DocumentObject
 */

/**
 * The `Model` constructor returns a custom Jsonmonger Model with the
 * properties passed in the passed in `schema` object.
 *
 * @constructor Model
 *
 * @param {Object} schema
 *   An object detailing the new `CustomModel`’s properties and how they map to
 *   the raw JSON API payload data.
 * @param {string} schema.type
 *   The type of the JSON API records for which the new `CustomModel` should be
 *   used.
 * @param {string} schema.endpoint
 *   The URL path in the JSON API server at which records of this
 *   `CustomModel`’s type can be accessed/manipulated.
 *
 * @return {CustomModel}
 *   A unique `CustomModel` constructor with which to create `DocumentObject`s
 *   for a given type.
 */
function Model(schema, config = {}) {
  validate(schema);

  const props = _.cloneDeep(schema);
  const { endpoint, type } = props;
  delete props.endpoint;
  delete props.type;

  // Register model in global space.
  if (Object.getOwnPropertySymbols(global).indexOf(MODELS) === -1) {
    global[MODELS] = {};
  }
  global[MODELS][type] = JsonmongerModel;

  /**
   * Create a new DocumentObject.
   *
   * The Model constructor returns a DocumentObject object that represents a
   * single record.
   *
   * @constructor CustomModel
   * @implements DocumentObject
   *
   * @param {Object} [values]
   *   An object with initial values to assign to the new Record.
   *
   * @return {DocumentObject}
   *   A Jsonmonger Record object which is an instance of the Custom Model.
   */
  function JsonmongerModel(values) {
    Object.defineProperties(this, {
      id: {
        enumerable: true,
        configurable: false,
        get: function () {
          return _.get(this, '__data.id');
        },
        set: function (id) {
          return _.set(this, '__data.id', id);
        },
      },
      saved: {
        enumerable: true,
        configurable: false,
        get: function () {
          return this.__saved;
        },
        set: function (val) {
          throw new Error('Jsonmonger: `saved` property is read-only.');
        },
      },
      constructor: {
        value: JsonmongerModel,
        enumerable: false,
        writable: true,
        configurable: false,
      },
      __axios: {
        value: config.axios || require('axios'),
        enumerable: false,
        writable: false,
        configurable: false,
      },
      __changed_props: {
        value: {},
        enumerable: false,
        writable: true,
        configurable: false,
      },
      __config: {
        value: _.merge({}, global[CONFIG], config),
        enumerable: false,
        writable: true,
        configurable: false,
      },
      __data: {
        value: {},
        enumerable: false,
        writable: true,
        configurable: false,
      },
      __schema: {
        value: props,
        enumerable: false,
        writable: true,
        configurable: false,
      },
      __new: {
        value: true,
        enumerable: false,
        writable: true,
        configurable: false,
      },
      __previous_props: {
        value: {},
        enumerable: false,
        writable: true,
        configurable: false,
      },
      __related: {
        value: {},
        enumerable: false,
        writable: true,
        configurable: false,
      },
      __relationships: {
        value: {},
        enumerable: false,
        writable: true,
        configurable: false,
      },
      __saved: {
        value: false,
        enumerable: false,
        writable: true,
        configurable: false,
      },
    });

    for (const key in values) {
      this[key] = values[key];
    }
  }

  Object.defineProperties(JsonmongerModel.prototype, {
    endpoint: {
      value: endpoint,
      enumerable: true,
      writable: false,
      configurable: false,
    },
    type: {
      value: type,
      enumerable: true,
      writable: false,
      configurable: false,
    },
  });

  for (const prop in props) {
    if (typeof props[prop] === 'function') {
      Object.defineProperty(JsonmongerModel.prototype, prop, {
        enumerable: true,
        configurable: false,
        get: function () {
          return props[prop].call(this);
        },
        set: function (value) {
          this.__saved = false;
          return props[prop].call(this, value);
        },
      });
    } else {
      Object.defineProperty(JsonmongerModel.prototype, prop, {
        enumerable: true,
        configurable: false,
        get: function getData() {
          return get({ object: this, prop });
        },
        set: function setData(value) {
          this.__saved = false;
          return set({ object: this, prop, value });
        },
      });
    }
  }

  JsonmongerModel.prototype.destroy = destroy;
  JsonmongerModel.prototype.fetch = fetch;
  JsonmongerModel.prototype.hydrate = hydrate;
  JsonmongerModel.prototype.save = save;

  return JsonmongerModel;
}
