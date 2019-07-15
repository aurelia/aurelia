import { nameConvention } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';

describe('nameConvention', function () {
  it('complains about empty input', function() {
    assert.throws(() => nameConvention(''));
  });

  it('gets custom element like resource', function() {
    assert.deepEqual(nameConvention('FooBar'), {
      name: 'foo-bar',
      type: 'customElement'
    });

    assert.deepEqual(nameConvention('FooBar123'), {
      name: 'foo-bar123',
      type: 'customElement'
    });
  });

  it('gets custom attribute like resource', function() {
    assert.deepEqual(nameConvention('FooBarCustomAttribute'), {
      name: 'foo-bar',
      type: 'customAttribute'
    });

    assert.deepEqual(nameConvention('Foo1BarCustomAttribute'), {
      name: 'foo1-bar',
      type: 'customAttribute'
    });
  });

  it('gets value converter like resource', function() {
    assert.deepEqual(nameConvention('FooBarValueConverter'), {
      name: 'fooBar',
      type: 'valueConverter'
    });

    assert.deepEqual(nameConvention('Foo1Bar23ValueConverter'), {
      name: 'foo1Bar23',
      type: 'valueConverter'
    });
  });

  it('gets binding behavior like resource', function() {
    assert.deepEqual(nameConvention('FooBarBindingBehavior'), {
      name: 'fooBar',
      type: 'bindingBehavior'
    });
  });

  it('gets binding command like resource', function() {
    assert.deepEqual(nameConvention('FooBarBindingCommand'), {
      name: 'foo-bar',
      type: 'bindingCommand'
    });
  });
});
