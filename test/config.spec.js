'use strict';

const expect = require('chai').expect;
const config = require('../config');
const config_object = require('./fixtures/config')();
const options = require('./fixtures/config/options');
const symbol = Symbol.for('Jsonmonger.config');

describe('config() method', () => {
  it('should create a global symbol', () => {
    expect(config_object).to.deep.equal(options);
    expect(config_object).to.deep.equal(global[symbol]);
  });

  it('should return an inmutable config object', () => {
    try {
      config_object.thing = 'some new value';
    } catch (error) {
      expect(error.toString()).to.match(/TypeError: (?:Can't|Cannot) add property thing, object is not extensible/);
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
