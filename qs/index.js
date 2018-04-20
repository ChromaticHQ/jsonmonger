const attrs_pattern = /^attributes\./i;
const rels_pattern = /^relationships\./i;

module.exports = qs;

/**
 * Produce a JSON API request query string for a given schema.
 * @public
 *
 * @todo Document this mess.
 */
function qs({ config, schema = null, type }) {
  schema = schema || config.schema[type];

  if (!schema) {
    throw new Error(`No custom schema provided and no default schema available for type "${type}".`);
  }

  const { attributes, relationships } = get_paths(schema);

  const parameters = [];

  if (attributes.length) {
    parameters.push(`field[${type}]=${attributes.join(',')}`);
  }

  if (relationships) {
    parameters.push(`include=${relationships.join(',')}`);
  }

  const query_string = parameters.length ? `?${parameters.join('&')}` : '';

  return query_string;
}

function get_paths(schema) {
  const paths = {
    attributes: [],
    relationships: [],
  }

  Object.keys(schema).forEach(key => {
    switch (typeof schema[key]) {
      case 'string':
        if (schema[key].match(attrs_pattern)) {
          paths.attributes.push(schema[key].replace(/^attributes\./i, ''));
        } else if (schema[key].match(rels_pattern)) {
          paths.relationships.push(schema[key].replace(/^relationships\./i, ''));
        }
        break;
      case 'object': {
        const { attributes, relationships } = get_paths(schema[key]);
        paths.attributes.push(...attributes);
        paths.relationships.push(...relationships);
        break;
      }
      case 'function': {
        const { attributes, relationships } = get_paths(schema[key].__qs);
        paths.attributes.push(...attributes);
        paths.relationships.push(...relationships);
        break;
      }
    }
  });

  return paths;
}
