import { nameConvention, ResourceType } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';

describe('nameConvention', function () {
  it('complains about empty input', function() {
    assert.throws(() => nameConvention(''));
  });

  it('gets custom element like resource', function() {
    const result = nameConvention('FooBar');
    assert.deepEqual(result, {name: 'foo-bar', type: 'customElement'});
  });

  it('gets custom attribute like resource', function() {
    const result = nameConvention('FooBarCustomAttribute');
    assert.deepEqual(result, {name: 'foo-bar', type: 'customAttribute'});
  });

  it('gets value converter like resource', function() {
    const result = nameConvention('FooBarValueConverter');
    assert.deepEqual(result, {name: 'foo-bar', type: 'valueConverter'});
  });

  it('gets binding behavior like resource', function() {
    const result = nameConvention('FooBarBindingBehavior');
    assert.deepEqual(result, {name: 'foo-bar', type: 'bindingBehavior'});
  });

  it('gets binding command like resource', function() {
    const result = nameConvention('FooBarBindingCommand');
    assert.deepEqual(result, {name: 'foo-bar', type: 'bindingCommand'});
  });
});
