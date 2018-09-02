const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));
require('../fixtures/config')();

const Model = require('../../model');

describe('save() method', () => {
  let axios, base_url, date, Post, post, values;

  before(() => {
    date = new Date();

    axios = sinon.spy(request => {
      const data = _.cloneDeep(request.body);

      if (!data.data.id) {
        data.data.id = '1234';
      }

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
      sub_title: 'attributes.secondary_title',
      published: 'attributes.date.published',
      updated: 'attributes.date.last_updated',
    }, { axios });

    values = {
      title: 'The City & the City',
      published: date,
    }
  });

  afterEach(() => {
    axios.resetHistory();
  });

  it('should return a Promise', () => {
    post = new Post(values);
    expect(post.save()).to.be.instanceOf(Promise);
  });

  it('should request to save a new record', done => {
    new Post(values).save().then(post => {
      expect(post.saved).to.be.true;
      expect(post.id).to.equal('1234');
      expect(post.__new).to.be.false;
      expect(axios).to.be.calledOnce;
      expect(axios).to.be.calledWith({
        method: 'post',
        url: `${base_url}/posts`,
        body: {
          data: {
            attributes: {
              title: values.title,
              date: {
                published: values.published,
              },
            },
          },
        },
      });
    }).then(done).catch(done);
  });

  it('should request to update attributes on an existing record', done => {
    new Post(values).save().then(saved_post => {
      saved_post.title = 'Kraken';
      saved_post.sub_title = 'Or: a Much Darker Splash';

      return saved_post.save();
    }).then(saved_post => {
      expect(saved_post.saved).to.be.true;
      expect(saved_post.__previous_props).to.deep.equal({});

      // Axios should be called once for the original save, then a second
      // time for the update.
      expect(axios).to.be.calledTwice;
      expect(axios).to.be.calledWith({
        method: 'patch',
        url: `${base_url}/posts/1234`,
        body: {
          data: {
            attributes: {
              title: 'Kraken',
              secondary_title: 'Or: a Much Darker Splash',
            },
          },
        },
      });
    }).then(done).catch(done);
  });

  it('should request to update relationship references');
  it('should request to update attributes and relationships');
  it('should request to update attributes on a related record');
});

