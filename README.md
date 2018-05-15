# jsonmonger

`jsonmonger` is an abstraction layer between your application and your
[json:api](http://jsonapi.org)-compliant server. Think of it like an ORM for
your `json:api`-compliant back-end.

## Introduction
`json:api` is fantastic, but working with it from application code can be a bit
challenging:
- it’s got a rigid and deep data structure over which you probably have very
  little control, if any
- navigating related data can be involved
- building requests to manipulate data on the server can be very verbose

`jsonmonger` abstracts all of this complexity away, allowing you to write
expressive code that focuses on business logic, not API transactions.

## Usage
Install `jsonmonger` with npm or yarn:
```
npm install --save jsonmonger

    // or…

yarn add jsonmonger
```

### Models
`jsonmonger` exposes a Model constructor. With this, you can define an object
with which to manage all records of a specific type. Let’s say our application
catalogues science fiction novels and their authors; you might write an
`Author` model like this:

```javascript
// my_app/models/Author.js

const Model = require('jsonmonger').Model;
const Author = new Model({
  // Tell Jsonmonger which json:api object type should be
  // handled with this model and where to make requests for it.
  type: 'user',
  endpoint: '/users',

  // Map json:api attributes quite simply.
  firstName: 'attributes.first_name',
  lastName: 'attributes.last_name',
  dateOfBirth: 'attributes.date_of_birth',

  // Functions work as both getter and setter functions.
  fullName: value => {
    if (value) {
      const splitName = value.split(' ', 2);
      this.firstName = split[0];
      this.lastName = split[1];
      return fullName;
    } else {
      return `${this.firstName} ${this.lastName}`;
    }
  },

  // Relationships are mapped just like attributes.
  books: 'relationships.books_authored',
});
```

We can now use that model to manage records in our json:api-compliant server.
Say we want to create a record for [China
Miéville](https://www.goodreads.com/author/show/33918.China_Mi_ville), we might
have a `create_author` controller with the following code:

```javascript
// my_app/controllers/create_author.js

const Author = require('../models/Author');

// Create a new record for an author.
const china = new Author({
  fullName: 'China Miéville',
});

// Saving the record makes a request to the json:api server,
// returning a JavaScript Promise. In this case, Jsonmonger
// can tell this is a new record, so it makes a POST request.
china.save();
```

Chances are we’re going to need to edit China’s record at some point, so let’s
say we have an `edit_author` controller in our application with the following
code:

```javascript
// my_app/controllers/edit_author.js

// Make changes to your record the way you would any JS object
// and Jsonmonger will store it in the appropriate location.
china.dateOfBirth = new Date('September 6, 1972');

// Jsonmonger knows this is an existing record, so it makes a
// PATCH request, as per json:api spec.
china.save();
```

But what about relationships? `jsonmonger` makes it straightforward:

```javascript
// my_app/controllers/edit_author.js

const Author = require('../models/Author');
const Book = require('../models/Book');

// Fetch an existing record for Kraken.
const kraken = await new Book({
  id: 'kraken_id', // presuming we know this
}).fetch();

// Create a new record for The City & the City.
const theCity = await new Book({
  title: 'The City & the City',
  yearPublished: '2009',
}).save();

// Fetch China’s record and add books to it.
const china = await new Author({
  id: 'china_id', // presuming we know this
}).fetch();

china.books = [ kraken, theCity ];

// A PATCH request is made updating the relationship.
china.save();
```

We can also update related records, if needed. Say a user needs to update _This
Census-Taker_’s record to correctly categorize it as a novella, not a novel.
Since `jsonmonger` loads relationships with their respective Models (if one is
available for that type), you can edit the book in place and save it.

```javascript
// my_app/controllers/edit_author.js

const Author = require('../models/Author');

const china = await new Author({
  id: 'china_id', // presuming we know this
}).fetch();

const censusTaker = china.books.find(book => book.title === 'This Census-Taker');

censusTaker.category = 'novella';

censusTaker.save();
```

And, finally, you can delete records from your `json:api` server like so:
```javascript
new Author({ id: 'china_id' }).destroy();
```
