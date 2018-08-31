const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

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

    Post = require('../fixtures/models/Post')({ axios });
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

  it('should update the current object with the data it fetches', () => {
    post = new Post({ id });

    post.fetch().then(new_post => {
      // While the promise does return the object itself, we want to be sure
      // that the original `post` object is also updated.
      expect(post).to.deep.equal(new_post);
      expect(post.__data).to.deep.equal(require('../fixtures/post.json').data);
    });
  });

  it('should make a request without relationship parameters', () => {
    return new Post({ id }).fetch({ related: null }).then(() => {
      expect(axios).to.be.calledOnce;
      expect(axios).to.be.calledWith({
        method: 'get',
        url: 'https://some.contrived.url/posts/1234',
      });
    });
  });

  it('should request to include one relationship', () => {
    return new Post({ id }).fetch({ related: 'author' }).then(() => {
      expect(axios).to.be.calledOnce;
      expect(axios).to.be.calledWith({
        method: 'get',
        url: 'https://some.contrived.url/posts/1234?include=author',
      });
    });
  });

  it('should request to include multiple relationships', () => {
    return new Post({ id }).fetch({ related: [ 'author', 'body' ] })
      .then(() => {
        expect(axios).to.be.calledOnce;
        expect(axios).to.be.calledWith({
          method: 'get',
          url: 'https://some.contrived.url/posts/1234?include=author,body',
        });
      });
  });

  it('should request to include all relationships', () => {
    return new Post({ id }).fetch({ related: true }).then(() => {
      expect(axios).to.be.calledOnce;
      expect(axios).to.be.calledWith({
        method: 'get',
        url: 'https://some.contrived.url/posts/1234?include=author,body,category',
      });
    });
  });

  it('should optionally make relationship requests in parallel', () => {
    return new Post({ id }).fetch({ related: true, parallel_relationships: true }).then(post => {
      expect(axios).to.have.callCount(7);
      expect(axios).to.be.calledWith({
        method: 'get',
        url: 'https://some.contrived.url/posts/1234',
      });
      expect(axios).to.be.calledWith({
        method: 'get',
        url: 'https://some.contrived.url/posts/1234/author',
      });
      expect(axios).to.be.calledWith({
        method: 'get',
        url: 'https://some.contrived.url/posts/1234/relationships/author',
      });
      expect(axios).to.be.calledWith({
        method: 'get',
        url: 'https://some.contrived.url/posts/1234/body',
      });
      expect(axios).to.be.calledWith({
        method: 'get',
        url: 'https://some.contrived.url/posts/1234/relationships/body',
      });
      expect(axios).to.be.calledWith({
        method: 'get',
        url: 'https://some.contrived.url/posts/1234/category',
      });
      expect(axios).to.be.calledWith({
        method: 'get',
        url: 'https://some.contrived.url/posts/1234/relationships/category',
      });
    });
  });

  it('should properly populate relationships requested in parallel');

  it('should use the model’s default if set', () => {
    const PostWithRelated = require('../fixtures/models/Post')({
      axios,
      related: [ 'author', 'topics' ],
    });

    return new PostWithRelated({ id }).fetch().then(() => {
      expect(axios).to.be.calledOnce;
      expect(axios).to.be.calledWith({
        method: 'get',
        url: 'https://some.contrived.url/posts/1234?include=author,category',
      });
    });
  });
})
