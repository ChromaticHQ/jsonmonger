const _ = require('lodash');
const destroy = require('./destroy');
// TIL there is a Fetch API, so it might make sense to rename this method.
// Ref: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
const fetch = require('./fetch');
const get = require('./get');
const hydrate = require('./hydrate');
const save = require('./save');
const set = require('./set');
const validate = require('./validate');
const MODELS = Symbol.for('Jsonmonger.models');

module.exports = Model;

function Model(maps, { axios } = {}) {
  validate(maps);

  const props = _.cloneDeep(maps);
  const { endpoint, type } = props;
  delete props.endpoint;
  delete props.type;

  // Register model in global space.
  if (Object.getOwnPropertySymbols(global).indexOf(MODELS) === -1) {
    global[MODELS] = {};
  }
  global[MODELS][type] = JsonmongerModel;

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
        value: axios || require('axios'),
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
      __data: {
        value: {},
        enumerable: false,
        writable: true,
        configurable: false,
      },
      __maps: {
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
      enumerable: false,
      writable: false,
      configurable: false,
    },
    type: {
      value: type,
      enumerable: false,
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
