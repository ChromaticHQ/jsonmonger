require('should');
const config = require('./config');
const raw_post = require('./fixtures/post');
const map = require('../map');
const _ = require('lodash');

describe('map', () => {
  let result;

  before(() => {
    result = map(Object.assign({ config }, raw_post));
  });

  it('should map an object according to its schema', () => {
    result.type.should.equal('post');
    result.title.should.equal(raw_post.data.attributes.title);
    result.meta.subtitle.should.equal(raw_post.data.attributes.sub_title);
    result.body.should.have.length(4);
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

    body[4].should.deepEqual(amended_post.included[4]);
  });

  it('should attempt to fetch missing related objects');
});
