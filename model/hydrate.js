module.exports = hydrate;

function hydrate({ data, parent, related }) {
  this.__changed_props = {};
  this.__data = data;
  this.__related = related;
  this.__parent = parent || null;
  this.__previous_props = {};

  return this;
}
