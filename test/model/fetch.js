const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const Model = require('../../model');

describe('fetch() method', () => {
  let axios, base_url, Post, post, id;

  before(() => {
    id = '1234';

    axios = sinon.spy(request => {
      const data = _.cloneDeep(require('../fixtures/post.json'));

      return Promise.resolve({
        status: 200,
        data,
      });
    });

    base_url = global[Symbol.for('Jsonmonger.config')].base_url;

    Post = new Model({
      type: 'post',
      endpoint: '/posts',
      title: 'attributes.title',
      sub_title: 'attributes.sub_title',
    }, { axios });
  });

  afterEach(() => {
    axios.resetHistory();
  });

  it('should return a Promise', () => {
    post = new Post({ id });
    expect(post.fetch()).to.be.instanceOf(Promise);
  });

  it('should request a specific record', done => {
    new Post({ id }).fetch().then(post => {
      expect(axios).to.be.calledOnce;
      expect(axios).to.be.calledWith({
        method: 'get',
        url: `${base_url}/posts/1234`,
      });
    }).then(done).catch(done);
  });

  it('should update the current object with it fetches', () => {
    post = new Post({ id });

    post.fetch().then(new_post => {
      // While the promise does return the object itself, we want to be sure
      // that the original `post` object is also updated.
      expect(post).to.deep.equal(new_post);
      expect(post.__data).to.deep.equal(require('../fixtures/post.json').data);
    });
  });
})
