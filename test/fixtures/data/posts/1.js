module.exports = {
  type: 'post',
  id: '1',
  attributes: {
    title: 'Your run of the mill post.',
    sub_title: 'Or: That time I couldn’t decide between two titles.',
  },
  relationships: {
    author: {
      data: {
        type: 'person',
        id: '201',
      },
    },
    body: {
      data: [{
        type: 'paragraph',
        id: '101',
      },{
        type: 'image',
        id: '102',
      },{
        type: 'paragraph',
        id: '103',
      },{
        type: 'blockquote',
        id: '104',
      }],
    },
    category: {
      data: [{
        type: 'taxonomy',
        id: '301',
      }],
    },
  },
}
