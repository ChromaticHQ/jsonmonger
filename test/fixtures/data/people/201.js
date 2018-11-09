module.exports = {
  type: 'person',
  id: '201',
  attributes: {
    name: 'Testy McTestface',
    biography: 'It’s turtles all the way down, man.',
    path: {
      alias: '/authors/testy-mctestface',
    },
  },
  relationships: {
    topics: {
      data: [{
        type: 'taxonomy',
        id: '301',
      }],
    },
    roles: {
      data: [{
        type: 'role',
        id: '401',
      }],
    },
  },
}
