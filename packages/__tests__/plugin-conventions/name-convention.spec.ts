import { nameConvention } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';

describe('nameConvention', function () {
  it('complains about empty input', function () {
    assert.throws(() => nameConvention(''));
  });

  it('gets custom element like resource', function () {
    assert.deepEqual(nameConvention('FooBar'), {
      name: 'foo-bar',
      type: 'customElement'
    });

    assert.deepEqual(nameConvention('UAFoo'), {
      name: 'ua-foo',
      type: 'customElement'
    });

    assert.deepEqual(nameConvention('PREFIXFooBar'), {
      name: 'prefix-foo-bar',
      type: 'customElement'
    });
  });

  it('gets custom attribute like resource', function () {
    assert.deepEqual(nameConvention('FooBarCustomAttribute'), {
      name: 'foo-bar',
      type: 'customAttribute'
    });

    assert.deepEqual(nameConvention('FOOBarCustomAttribute'), {
      name: 'foo-bar',
      type: 'customAttribute'
    });
  });

  it('gets value converter like resource', function () {
    assert.deepEqual(nameConvention('FooBarValueConverter'), {
      name: 'fooBar',
      type: 'valueConverter'
    });

    assert.deepEqual(nameConvention('FOOBarValueConverter'), {
      name: 'fooBar',
      type: 'valueConverter'
    });
  });

  it('gets binding behavior like resource', function () {
    assert.deepEqual(nameConvention('FooBarBindingBehavior'), {
      name: 'fooBar',
      type: 'bindingBehavior'
    });
  });

  it('gets binding command like resource', function () {
    assert.deepEqual(nameConvention('FooBarBindingCommand'), {
      name: 'foo-bar',
      type: 'bindingCommand'
    });
  });

  it('gets template controller like resource', function () {
    assert.deepEqual(nameConvention('FooBarTemplateController'), {
      name: 'foo-bar',
      type: 'templateController'
    });

    assert.deepEqual(nameConvention('FOOBarTemplateController'), {
      name: 'foo-bar',
      type: 'templateController'
    });
  });
});
