require('should');
const config = require('./config');
const qs = require('../qs');

describe('qs', () => {
  let result;
  before(() => {
    result = qs({ config, type: 'post' });
  });

  it('should return a string with query parameters', () => {
    result.should.equal('?field[post]=title,sub_title&include=body');
  });

  it('should include virtual key paths, if provided', () => {
    config.schema.post.contrived_virtual = function contrived_virtual() {}
    config.schema.post.contrived_virtual.__qs = [
      'attributes.contrived_attribute',
      'relationships.contrived_relationship',
    ];

    const contrived_result = qs({ config, type: 'post' });
    contrived_result.should.equal('?field[post]=title,sub_title,contrived_attribute&include=body,contrived_relationship');
  });
});
