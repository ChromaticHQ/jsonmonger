module.exports = {
  type: 'person',
  id: '202',
  attributes: {
    name: 'Foto McFotoface',
    biography: 'It’s film gran all the way down, friend.',
    path: {
      alias: '/authors/foto-mcfotoface',
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
      },{
        type: 'rule',
        id: '402',
      }],
    },
  },
}
