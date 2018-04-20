const attrs_pattern = new RegExp('^attributes\..+');
const rels_pattern = new RegExp('^relationships\..+');

module.exports = qs;

/**
 * Produce a JSON API request query string for a given schema.
 * @public
 *
 * @todo Finish this mess.
 */
function qs({ config, schema = null, type }) {
  schema = schema || config.schema[type];

  if (!schema) {
    throw new Error(`No custom schema provided and no default schema available for type "${type}".`);
  }

  const { attributes, relationships } = get_paths(schema);

  const parameters = [];

  if (attributes.length) {
    parameters += `field[${type}]=${attributes.join(',')}`;
  }

  if (relationships) {
    parameters += `include=${relationships.join(',')}`;
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
          paths.attributes.push(schema[key].replace('^attributes\.', ''));
        } else if (schema[key].match(rels_pattern)) {
          paths.relationships.push(schema[key].replace('^relationships\.', ''));
        }
        break;
      case 'object':
        const { attributes, relationships } = get_paths(schema[key]);
        paths.attributes.concat(attributes);
        paths.relationships.concat(relationships);
        break;
    }
  });

  return paths;
}
