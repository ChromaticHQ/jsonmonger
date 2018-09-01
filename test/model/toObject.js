const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const raw_json = require('../fixtures/data/post.json');

/* eslint-disable no-unused-vars */
describe('to_object() method', () => {
  let axios, Image, Paragraph, Person, Post, post, Role;
  before(done => {
    axios = sinon.spy(request => {
      const data = _.cloneDeep(raw_json);

      return Promise.resolve({
        status: 200,
        data,
      });
    });

    Image = require('../fixtures/models/Image')({ axios });
    Paragraph = require('../fixtures/models/Paragraph')({ axios });
    Person = require('../fixtures/models/Person')({ axios });
    Post = require('../fixtures/models/Post')({ axios });
    Role = require('../fixtures/models/Role')({ axios });

    new Post({ id: 1 }).fetch({ related: true }).then(result => {
      post = result;
    }).then(done).catch(done);
  });

  afterEach(() => axios.resetHistory());

  it('should return an object', () => {
    expect(post.toObject()).to.be.instanceOf(Object);
    expect(post.toObject()).to.deep.equal({
      title: 'Your run of the mill post.',
      subtitle: 'Or: That time I couldn’t decide between two titles.',
      author: {
        fullName: 'Testy McTestface',
        firstName: 'Testy',
        lastName: 'McTestface',
        bio: 'It’s turtles all the way down, man.',
        alias: '/authors/testy-mctestface',
        roles: [
          {
            name: 'Writer',
            url: '/writers',
          },
        ],
      },
      body: [
        {
          text: 'Et id animi optio voluptatem sunt voluptas dolorem. Et neque quasi aliquid quia soluta enim quia deserunt. Eum fugit est non accusamus ut nisi recusandae veniam. Quia vero excepturi minima. Et reiciendis voluptas error vel rerum omnis ipsum quia.',
        },
        {
          url: '/path/to/image.jpg',
          alt: 'You do provide ALT values, right?',
          credit: {
            fullName: 'Foto McFotoface',
            firstName: 'Foto',
            lastName: 'McFotoface',
            bio: 'It’s film gran all the way down, friend.',
            alias: '/authors/foto-mcfotoface',
            roles: [
              {
                name: 'Writer',
                url: '/writers',
              },
              {
                name: 'Photographer',
                url: '/photographers',
              },
            ],
          },
        },
        {
          text: 'Quia sed repellat id cum. Aperiam reprehenderit amet minima ut dolorem non nostrum placeat. Culpa esse id dolorum ducimus. Est quae nemo et rerum sapiente nam inventore.',
        },
        {
          type: 'blockquote',
          id: '104',
          attributes: {
            text: 'It matters not how strait the gate, how charged with punishments the scroll, I am the master of my fate, I am the captain of my soul.',
            source: {
              name: 'William Ernest Henley',
              url: 'https://www.poetryfoundation.org/poems/51642/invictus',
              description: null,
            },
          },
        },
      ],
      topics: [
        {
          type: 'taxonomy',
          id: '301',
          attributes: {
            name: 'Test-driven Development',
            path: {
              alias: '/topics/test-driven-development',
            },
          },
        },
      ],
    });
  });
})
/* eslint-enable no-unused-vars */
