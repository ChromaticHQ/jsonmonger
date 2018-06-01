'use strict';

const expect = require('chai').expect;
const config = require('../config');

describe('config() method', () => {
  let config_object, options, symbol;

  before(() => {
    options = {
      base_url: 'https://some.contrived.url',
    }

    config_object = config(options);

    symbol = Symbol.for('Jsonmonger.config');
  });

  it('should create a global symbol', () => {
    expect(config_object).to.deep.equal(options);
    expect(config_object).to.deep.equal(global[symbol]);
  });

  it('should return an inmutable config object', () => {
    try {
      config_object.thing = 'some new value';
    } catch (error) {
      expect(error.toString()).to.contain('object is not extensible');
      return;
    }

    throw new Error('Expected a TypeError to be thrown.');
  });

  it('should throw an error on additional attempts to set config', () => {
    try {
      config(options);
    } catch (error) {
      expect(error.message).to.equal('Jsonmonger Error: Global configuration cannot be set more than once.');
      return;
    }

    throw new Error('Expected an error to be thrown.');
  });
});
