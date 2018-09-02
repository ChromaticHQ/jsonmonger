const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));
const api = require('../fixtures/api');
require('../fixtures/config')();

/* eslint-disable no-unused-vars */
describe('to_object() method', () => {
  let axios, Image, Paragraph, Person, Post, post, raw_json, Role;
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
            id: '401',
            type: 'role',
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
            fullName: null,
            firstName: null,
            lastName: null,
            bio: null,
            alias: null,
            roles: null,
            /* roles: [
             *   {
             *     name: 'Writer',
             *     url: '/writers',
             *   },
             *   {
             *     name: 'Photographer',
             *     url: '/photographers',
             *   },
             * ], */
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
