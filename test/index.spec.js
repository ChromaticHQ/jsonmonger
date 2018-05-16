const expect = require('chai').expect;
const Jsonmonger = require('../');

describe('Jsonmonger', () => {
  it('should return an object', () => {
    expect(Jsonmonger).to.be.instanceOf(Object);
  });

  it('should have map, Model, and qs methods', () => {
    expect(Jsonmonger.map).to.be.instanceOf(Function);
    expect(Jsonmonger.Model).to.be.instanceOf(Function);
    expect(Jsonmonger.qs).to.be.instanceOf(Function);
  });
});
