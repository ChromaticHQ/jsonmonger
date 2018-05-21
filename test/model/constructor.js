const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));
const Model = require('../../model');

describe('constructor', () => {
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

  it('should store a global reference for the model', () => {
    const Keyboard = new Model({
      type: 'keyboard',
      endpoint: '/keyboards',
    });

    const symbol = Symbol.for('Jsonmonger.models');
    expect(global[symbol].keyboard).to.deep.equal(Keyboard);
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
});
