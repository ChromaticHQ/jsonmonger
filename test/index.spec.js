require('should');
const config = require('./config');
const Jsonapi = require('../');

describe('Jsonapi', () => {
  let jsonapi;
  before(() => {
    jsonapi = new Jsonapi(config);
  });

  it('should return an instantiated Jsonapi object', () => {
    jsonapi.should.be.instanceOf(Jsonapi);
    jsonapi.config.should.deepEqual(config);
  });

  it('should have get, map, and qs methods', () => {
    jsonapi.map.should.be.instanceOf(Function);
    jsonapi.qs.should.be.instanceOf(Function);
  });
});
