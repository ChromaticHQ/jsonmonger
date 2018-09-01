const _ = require('lodash');
const chai = require('chai');
const sinon = require('sinon');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const Model = require('../../model');
const raw_data = require('../fixtures/data/post.json');

describe('destroy() method', () => {
  let axios, base_url, Thing, thing;

  before(() => {
    axios = sinon.spy(request => {
      if (request.method === 'get') {
        const data = _.cloneDeep(raw_data);

        return Promise.resolve({
          status: 200,
          data,
        });
      } else {
        return Promise.resolve({
          status: 204,
        });
      }
    });

    base_url = global[Symbol.for('Jsonmonger.config')].base_url;

    Thing = new Model({
      type: 'thing',
      endpoint: '/things',
      name: 'attributes.title',
    }, { axios });

    return new Thing({ id: '1' }).fetch().then(result => {
      thing = result;
      return thing.destroy();
    });
  });

  it('should request to destroy an existing record', () => {
    expect(axios).to.be.calledTwice;
    expect(axios).to.be.calledWith({
      method: 'delete',
      url: `${base_url}/things/1`,
    });
  });

  it('should reset the model as new', () => {
    expect(thing.__new).to.be.true;
    expect(thing.__saved).to.be.false;
    expect(thing.id).to.be.undefined;
  });

  it('should keep the raw data', () => {
    const new_data = _.cloneDeep(raw_data);
    delete new_data.data.id;
    expect(thing.__data).to.deep.equal(new_data.data);
  });
});
