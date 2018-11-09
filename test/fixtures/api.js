const _ = require('lodash');
const pluralize = require('pluralize');
const url = require('url');
const base = './data';

module.exports = req => {
  return new Promise((resolve, reject) => {
    const request_url = url.parse(req.url, true, true);
    const { type, id, relationship, field } = parse_path(request_url.pathname);
    const main_data = require(`${base}/${type}/${id}`);
    let data;
    let included = [];

    if (relationship && field) {
      data = _.get(main_data, `relationships.${field}`, {}).data || null;
    } else if (field) {
      data = get_path_relationship({ field, main_data });
    } else {
      data = main_data;
      included = get_query_param_relationships({ data, included, request_url });
    }

    if (data instanceof Error) {
      return reject(data);
    }

    return resolve(JSON.stringify({ data, included }));
  })
}

function parse_path(path) {
  // Make array of path segments, filtering out empty segments.
  const segments = path.split('/').filter(seg => seg);
  const relationship = segments[2] === 'relationships' && segments[3];

  return {
    type: segments[0],
    id: segments[1],
    relationship,
    field: relationship ? segments[3] : segments[2],
  }
}

function get_relationships({ data, key }) {
  return _.get(data, `relationships.${key}`);
}

function get_query_param_relationships({ data, included, request_url }) {
  if (_.get(request_url, 'query.include')) {
    const query_fields = request_url.query.include.split(',');
    return _.flattenDeep(included.concat(query_fields
      .map(key => get_relationships({ data, key }))
      .filter(relationship => relationship)
      .map(relationship => {
        if (Array.isArray(relationship.data)) {
          return relationship.data.map(item => {
            try {
              return require(`${base}/${pluralize.plural(item.type)}/${item.id}`);
            } catch (e) {
              console.error(e.message);
              return null;
            }
          }).filter(item => item);
        } else {
          try {
            return require(`${base}/${pluralize.plural(relationship.data.type)}/${relationship.data.id}`);
          } catch (e) {
            console.error(e.message);
            return null;
          }
        }
      }).filter(item => item)
    ));
  }
}

function get_path_relationship({ field, main_data }) {
  const relationship = _.get(main_data, `relationships.${field}`);
  if (Array.isArray(relationship.data)) {
    return relationship.data.map(item => {
      try {
        return require(`${base}/${pluralize.plural(item.type)}/${item.id}`);
      } catch (e) {
        console.error(e.message);
        return null;
      }
    }).filter(item => item);
  } else {
    try {
      return require(`${base}/${pluralize.plural(relationship.data.type)}/${relationship.data.id}`);
    } catch (e) {
      console.error(e.message);
      return null;
    }
  }
}
