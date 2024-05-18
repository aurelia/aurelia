import { DI, IContainer, last, Registration } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';

describe('1-kernel/di.last.spec.ts', function () {
  let container: IContainer;

  beforeEach(function () {
    container = DI.createContainer();
  });

  it('should return the last registered instance of a key', function () {
    container.register(Registration.instance('key', 'value1'));
    container.register(Registration.instance('key', 'value2'));
    container.register(Registration.instance('key', 'value3'));
    const result = container.get(last('key'));
    assert.equal(result, 'value3');
  });

  it('should return the last registered instance in a child container', function () {
    const child = container.createChild();
    child.register(Registration.instance('key', 'childValue1'));
    child.register(Registration.instance('key', 'childValue2'));
    const result = child.get(last('key'));
    assert.equal(result, 'childValue2');
  });

  it('should return the last registered instance in both parent and child containers', function () {
    container.register(Registration.instance('key', 'parentValue1'));
    const child = container.createChild();
    child.register(Registration.instance('key', 'childValue1'));
    const result = child.get(last('key'));
    assert.equal(result, 'childValue1');
  });

  it('should handle different types of registrations', function () {
    const instance1 = { name: 'instance1' };
    const instance2 = { name: 'instance2' };
    container.register(Registration.instance('key', instance1));
    container.register(Registration.singleton('key', class { name = 'instance3'; }));
    container.register(Registration.instance('key', instance2));
    const result = container.get(last('key'));
    assert.deepEqual(result, instance2);
  });

  it('should return undefined if the key is not registered', function () {
    const result = container.get(last('key'));
    assert.strictEqual(result, undefined);
  });
});
