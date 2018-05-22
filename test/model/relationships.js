const _ = require('lodash');
const expect = require('chai').expect;
const Model = require('../../model');
const raw_json = require('../fixtures/post.json');

describe('relationships', () => {
  let Image, Paragraph, Person, Post, post;
  before(done => {
    const axios = request => {
      const data = _.cloneDeep(raw_json);

      return Promise.resolve({
        status: 200,
        data,
      });
    }

    Image = new Model({
      type: 'image',
      endpoint: '/images',
      url: 'attributes.src',
      alt: 'attributes.alt',
    }, { axios });
    Paragraph = new Model({
      type: 'paragraph',
      endpoint: '/paragraphs',
      text: 'attributes.text',
    }, { axios });
    Person = new Model({
      type: 'person',
      endpoint: '/people',
      fullName: 'attributes.name',
      firstName: function (value) {
        if (value) {
          const names = this.fullName.split(' ');
          names[0] = value;
          this.fullName = names.join(' ');
          return value;
        } else {
          return this.fullName.split(' ')[0];
        }
      },
      lastName: function (value) {
        if (value) {
          const names = this.fullName.split(' ');
          const lastName = value.split(' ');
          names.splice(1, lastName.length, ...lastName);
          this.fullName = names.join(' ');
          return value;
        } else {
          return this.fullName.split(' ').slice(1).join(' ');
        }
      },
      bio: 'attributes.biography',
      alias: 'attributes.path.alias',
    }, { axios });
    Post = new Model({
      type: 'post',
      endpoint: '/posts',
      title: 'attributes.title',
      subtitle: 'attributes.sub_title',
      author: 'relationships.author',
      body: 'relationships.body',
    }, { axios });

    new Post({ id: 1 }).fetch().then(result => {
      post = result;
      done();
    });
  });

  it('should load relationships as models', () => {
    expect(post.author).to.be.instanceOf(Person);
    expect(post.body).to.be.instanceOf(Array);
    post.body.forEach(block => {
      let expectedModel;
      if (block.type === 'paragraph') {
        expectedModel = Paragraph;
      } else if (block.type === 'image') {
        expectedModel = Image;
      } else if (block.type === 'blockquote') {
        // We’re not defining a dedicated Blockquote model.
        expectedModel = Object;
      }

      expect(block).to.be.instanceOf(expectedModel);
    });
  });

  it('should store a reference to the related record’s immediate parent in the tree', () => {
    expect(post.author.__parent).to.deep.equal(post);
  });

  it('should load raw related data when a model is not available', () => {
    const blockquote = post.body.find(block => block.type === 'blockquote');
    const raw_blockquote = raw_json.included.find(block => block.type === 'blockquote');

    expect(blockquote).to.deep.equal(raw_blockquote);
  });
});
