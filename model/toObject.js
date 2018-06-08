module.exports = to_object;

function to_object() {
  const object = this;
  const result = populate_values({ object });

  return result;
}

function populate_values({ object, result = {} }) {
  const maps = object.__maps || object;
  Object.keys(maps).forEach(key => {
    const value = object[key];
    result[key] = get_value(value);
    return result;
  });

  return result;
}

function get_value(value) {
  let result;
  switch (typeof value) {
    case 'string':
      result = value;
      break;
    case 'object':
      if (value === null) {
        result = value;
      } else if (Array.isArray(value)) {
        result = value.map(get_value);
      } else {
        result = populate_values({ object: value });
      }
      break;
  }

  return result;
}
