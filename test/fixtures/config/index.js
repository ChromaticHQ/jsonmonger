const config = require('../../../config');
const options = require('./options');

module.exports = () => {
  try {
    return config(options);
  } catch (e) {
    console.log(e.message);
    if (e.message !== 'Jsonmonger Error: Global configuration cannot be set more than once.') {
      throw e;
    } else {
      return options;
    }
  }
}
