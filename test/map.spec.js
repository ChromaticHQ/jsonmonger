require('should');
const config = require('./config');
const raw_post = require('./fixtures/post');
const map = require('../map');
const _ = require('lodash');

describe('Jsonmonger#map', () => {
  let result;

  before(() => {
    result = map(Object.assign({ config }, raw_post));
  });

  it('should map an object according to its schema', () => {
    result.type.should.equal('post');
    result.title.should.equal(raw_post.data.attributes.title);
    result.meta.subtitle.should.equal(raw_post.data.attributes.sub_title);
    result.body.should.have.length(4);
    result.author.should.be.instanceOf(Object);
  });

  it('should use schemas to map related objects', () => {
    const body = result.body;
    const included = raw_post.included;

    body.should.be.instanceOf(Array);
    body.should.deepEqual([{
      type: 'text',
      value: included[0].attributes.text,
    },{
      type: 'image',
      src: included[1].attributes.src,
      alt: included[1].attributes.alt,
    },{
      type: 'text',
      value: included[2].attributes.text,
    },{
      type: 'quotation',
      value: included[3].attributes.text,
      citation: {
        name: included[3].attributes.source.name,
        link: {
          url: included[3].attributes.source.url,
          title: 'A fallback link title.',
        },
      },
    }]);

    const author = result.author;

    author.should.be.instanceOf(Object);
    author.should.deepEqual({
      type: 'person',
      name: included[4].attributes.name,
      bio: included[4].attributes.biography,
      url: included[4].attributes.path.alias,
      topics: [{
        type: 'topic',
        label: included[5].attributes.name,
        url: included[5].attributes.path.alias,
      }],
    });
  });

  it('should use related objects as-is when no schema is available for them', () => {
    const amended_post = _.cloneDeep(raw_post);

    // Add a body object with a video reference.
    amended_post.data.relationships.body.data.push({
      type: 'video',
      id: '105',
    });

    // Add a video objet tothe included array.
    amended_post.included.push({
      type: 'video',
      id: '105',
      attributes: {
        url: 'https://www.somevideoservice.com/contrived/path.mp4',
        closed_captions: 'https://www.somevideoservice.com/contrived/path.txt',
        thumbnail: 'https://www.somevideoservice.com/contrived/path.jpg',
      },
    });

    const amended_result = map(Object.assign({ config }, amended_post));
    const body = amended_result.body;
    const included = amended_post.included;

    body[4].should.deepEqual(included[included.length - 1]);
  });

  it('should use an alternate schema, if provided', () => {
    const alt_config = _.cloneDeep(config);
    _.set(alt_config, 'schema.post.__author_schema', 'person_sparse');
    const alt_result = map(Object.assign({ config: alt_config }, raw_post));

    alt_result.author.should.deepEqual({
      type: 'person',
      name: raw_post.included[4].attributes.name,
      url: raw_post.included[4].attributes.path.alias,
    });
  });

  it('should attempt to fetch missing related objects');
});
