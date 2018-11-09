const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));
const api = require('../fixtures/api');
require('../fixtures/config')();

describe('relationships', () => {
  let axios, Image, Paragraph, Person, Post, post, raw_json; //, Role;
  before(() => {
    axios = sinon.spy(request => {
      return api(request).then(result => {
        return {
          status: 200,
          data: JSON.parse(result),
        }
      });
    });

    Image = require('../fixtures/models/Image')({ axios });
    Paragraph = require('../fixtures/models/Paragraph')({ axios });
    Person = require('../fixtures/models/Person')({ axios });
    Post = require('../fixtures/models/Post')({ axios });
    // Role = require('../fixtures/models/Role')({ axios });

    return api({ url: '/posts/1?include=author,body' }).then(data => {
      raw_json = JSON.parse(data);
    }).then(() => {
      return new Post({ id: 1 }).fetch({ related: true });
    }).then(result => {
      post = result;
    });
  });

  afterEach(() => axios.resetHistory());

  it('should load relationships as models', () => {
    expect(post.author).to.be.instanceOf(Person);

    // Nested relationships can be checked when the new test api and .fetch()
    // support them.
    // expect(post.author.roles).to.be.instanceOf(Array);
    // post.author.roles.forEach(role => {
    //   expect(role).to.be.instanceOf(Role);
    // });

    expect(post.body).to.be.instanceOf(Array);
    post.body.forEach(block => {
      let expectedModel;
      if (block.type === 'paragraph') {
        expectedModel = Paragraph;
      } else if (block.type === 'image') {
        expectedModel = Image;
        // Nested relationships can be checked when the new test api and
        // .fetch() support them.
        // expect(block.credit).to.be.instanceOf(Person);
      } else if (block.type === 'blockquote') {
        // We’re not defining a dedicated Blockquote model, so we expect it
        // to return the raw data.
        expectedModel = Object;
      }

      expect(block).to.be.instanceOf(expectedModel);
    });
  });

  it('should store a reference to the related record’s immediate parent in the tree', () => {
    expect(post.author.__parent).to.deep.equal(post);
    // Nested relationships can be checked when the new test api and .fetch()
    // support them.
    // post.author.roles.forEach(role => {
    //   expect(role.__parent).to.deep.equal(post.author);
    // });
  });

  it('should load raw related data when a model is not available', () => {
    const blockquote = post.body.find(block => block.type === 'blockquote');
    const raw_blockquote = raw_json.included.find(block => block.type === 'blockquote');

    expect(blockquote).to.deep.equal(raw_blockquote);
  });
});
