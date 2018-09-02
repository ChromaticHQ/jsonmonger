module.exports = {
  type: 'image',
  id: '102',
  attributes: {
    src: '/path/to/image.jpg',
    alt: 'You do provide ALT values, right?',
  },
  relationships: {
    author: {
      data: {
        type: 'person',
        id: '202',
      },
    },
  },
}
