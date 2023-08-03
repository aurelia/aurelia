import { resourceName } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';

describe('resourceName', function () {
  it('returns resource name based on file name', function () {
    assert.equal(resourceName('foo.js'), 'foo');
    assert.equal(resourceName('Foo.js'), 'foo');
    assert.equal(resourceName('foo-bar.js'), 'foo-bar');
    assert.equal(resourceName('fooBar.js'), 'foo-bar');
    assert.equal(resourceName('FooBar.ts'), 'foo-bar');
    assert.equal(resourceName('foo_bar.ts'), 'foo-bar');
    assert.equal(resourceName('a/b/foo.html'), 'foo');
    assert.equal(resourceName('a/b/Foo.html'), 'foo');
    assert.equal(resourceName('a/b/foo-bar.html'), 'foo-bar');
    assert.equal(resourceName('a/b/fooBar.html'), 'foo-bar');
    assert.equal(resourceName('a/b/FooBar.md'), 'foo-bar');
    assert.equal(resourceName('a/b/foo_bar.md'), 'foo-bar');
  });

  it('supports Nodejs index file', function () {
    assert.equal(resourceName('foo/index.js'), 'foo');
    assert.equal(resourceName('Foo/index.js'), 'foo');
    assert.equal(resourceName('foo-bar/index.js'), 'foo-bar');
    assert.equal(resourceName('fooBar/index.js'), 'foo-bar');
    assert.equal(resourceName('FooBar/index.ts'), 'foo-bar');
    assert.equal(resourceName('foo_bar/index.ts'), 'foo-bar');
    assert.equal(resourceName('a/b/foo/index.html'), 'foo');
    assert.equal(resourceName('a/b/Foo/index.html'), 'foo');
    assert.equal(resourceName('a/b/foo-bar/index.html'), 'foo-bar');
    assert.equal(resourceName('a/b/fooBar/index.html'), 'foo-bar');
    assert.equal(resourceName('a/b/FooBar/index.md'), 'foo-bar');
    assert.equal(resourceName('a/b/foo_bar/index.md'), 'foo-bar');
  });
});
