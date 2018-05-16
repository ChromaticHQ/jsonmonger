const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const Model = require('../model');

describe('Jsonmonger#Model', () => {
  it('should return an extended Model constructor', () => {
    const contrived_method = sinon.spy(() => 'contrived result');

    const Thing = new Model({
      type: 'thingamajig',
      endpoint: '/things',
      contrived: 'value',
      method: contrived_method,
    });

    const thing = new Thing();

    expect(Thing).to.be.instanceOf(Function);
    expect(thing.constructor).to.equal(Thing);
    expect(thing.type).to.equal('thingamajig');
    expect(thing.endpoint).to.equal('/things');
    expect(thing.method).to.equal('contrived result');
    expect(contrived_method).to.be.calledOnce;
  });

  it('should set changed props when appropriate', () => {
    const Person = new Model({
      type: 'person',
      endpoint: '/people',
      first_name: 'attributes.first_name',
      last_name: 'attributes.last_name',
      full_name: function (value) {
        if (value) {
          const split = value.split(' ');

          this.first_name = split[0];
          this.last_name = split[1];
        } else {
          return `${this.first_name} ${this.last_name}`;
        }
      },
    });

    const person = new Person({
      first_name: 'Testy',
      last_name: 'McTestface',
    });

    expect(person.saved).to.be.false;
    expect(person.first_name).to.equal('Testy');
    expect(person.last_name).to.equal('McTestface');
    expect(person.full_name).to.equal('Testy McTestface');

    expect(person.__changed_props).to.deep.equal({
      first_name: true,
      last_name: true,
    });

    expect(person.__previous_props).to.have.keys(['first_name', 'last_name']);
    expect(person.__previous_props).to.deep.equal({
      first_name: undefined,
      last_name: undefined,
    });

    expect(person.__data).to.deep.equal({
      attributes: {
        first_name: 'Testy',
        last_name: 'McTestface',
      },
    });

    person.full_name = 'Tester McToastface';

    expect(person.first_name).to.equal('Tester');
    expect(person.last_name).to.equal('McToastface');

    expect(person.__previous_props).to.have.keys(['first_name', 'last_name']);
    expect(person.__previous_props).to.deep.equal({
      first_name: undefined,
      last_name: undefined,
    });

    expect(person.__data).to.deep.equal({
      attributes: {
        first_name: 'Tester',
        last_name: 'McToastface',
      },
    });
  });

  describe('fetch() method', () => {
    let axios, Post, post, id;

    before(() => {
      id = '1234';

      axios = sinon.spy(request => {
        const data = _.cloneDeep(require('./fixtures/post.json'));

        return Promise.resolve({
          status: 200,
          data,
        });
      });

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
          url: '/posts/1234',
        });
      }).then(done).catch(done);
    });

    it('should update the current object with it fetches', () => {
      post = new Post({ id });

      post.fetch().then(new_post => {
        // While the promise does return the object itself, we want to be sure
        // that the original `post` object is also updated.
        expect(post).to.deep.equal(new_post);
        expect(post.__data).to.deep.equal(require('./fixtures/post.json').data);
      });
    });
  });

  describe('save() method', () => {
    let axios, date, Post, post, values;

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
          url: '/posts',
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
          url: '/posts/1234',
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
});
