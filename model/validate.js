module.exports = validate;

/* eslint-disable complexity */
function validate(props) {
  if (typeof props !== 'object') {
    error('An props object is required.');
  }

  if (typeof props.type !== 'string' || !props.type.length) {
    error('The props object requires a `type` property.');
  }

  if (typeof props.endpoint !== 'string' || !props.endpoint.length) {
    error('The props object requires an `endpoint` property.');
  }

  return true;
}
/* eslint-enable complexity */

function error(message) {
  throw new Error(`Jsonmonger: ${message}`);
}
