const _ = require('lodash');
const chai = require('chai');
const sinon = require('sinon');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const Model = require('../../model');
const api = require('jsonapilite')(`${__dirname}/../fixtures/data`);
require('../fixtures/config')();

describe('destroy() method', () => {
  let axios, base_url, raw_data, Thing, thing;

  before(() => {
    axios = sinon.spy(request => {
      if (request.method === 'get') {
        return api(request).then(result => {
          return {
            status: 200,
            data: JSON.parse(result),
          }
        });
      } else {
        return Promise.resolve({
          status: 204,
        });
      }
    });

    base_url = global[Symbol.for('Jsonmonger.config')].base_url;

    Thing = new Model({
      type: 'post',
      endpoint: '/posts',
      name: 'attributes.title',
    }, { axios });

    return api({ url: '/posts/1' }).then(data => {
      raw_data = JSON.parse(data);
    }).then(() => {
      return new Thing({ id: '1' }).fetch()
    }).then(result => {
      thing = result;
      return thing.destroy();
    });
  });

  it('should request to destroy an existing record', () => {
    expect(axios).to.be.calledTwice;
    expect(axios.getCalls()[1].args).to.deep.equal([{
      method: 'delete',
      url: `${base_url}/posts/1`,
    }]);
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
