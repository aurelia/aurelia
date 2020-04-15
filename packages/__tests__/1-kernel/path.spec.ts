import { join, relativeToFile } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';

describe('relativeToFile', function () {
  it('can make a dot path relative to a simple file', function () {
    const file = 'some/file.html';
    const path = './other/module';

    assert.strictEqual(relativeToFile(path, file), 'some/other/module', `relativeToFile(path, file)`);
  });

  it('can make a dot path relative to an absolute file', function () {
    const file = 'http://aurelia.io/some/file.html';
    const path = './other/module';

    assert.strictEqual(relativeToFile(path, file), 'http://aurelia.io/some/other/module', `relativeToFile(path, file)`);
  });

  it('can make a double dot path relative to an absolute file', function () {
    const file = 'http://aurelia.io/some/file.html';
    const path = '../other/module';

    assert.strictEqual(relativeToFile(path, file), 'http://aurelia.io/other/module', `relativeToFile(path, file)`);
  });

  it('returns path if null file provided', function () {
    const file = null;
    const path = 'module';

    assert.strictEqual(relativeToFile(path, file), 'module', `relativeToFile(path, file)`);
  });

  it('returns path if empty file provided', function () {
    const file = '';
    const path = 'module';

    assert.strictEqual(relativeToFile(path, file), 'module', `relativeToFile(path, file)`);
  });
});

describe('join', function () {
  it('can combine two simple paths', function () {
    const path1 = 'one';
    const path2 = 'two';

    assert.strictEqual(join(path1, path2), 'one/two', `join(path1, path2)`);
  });

  it('can combine an absolute path and a simple path', function () {
    const path1 = '/one';
    const path2 = 'two';

    assert.strictEqual(join(path1, path2), '/one/two', `join(path1, path2)`);
  });

  it('can combine an absolute path and a simple path with slash', function () {
    const path1 = '/one';
    const path2 = '/two';

    assert.strictEqual(join(path1, path2), '/one/two', `join(path1, path2)`);
  });

  it('can combine a single slash and a simple path', function () {
    const path1 = '/';
    const path2 = 'two';

    assert.strictEqual(join(path1, path2), '/two', `join(path1, path2)`);
  });

  it('can combine a single slash and a simple path with slash', function () {
    const path1 = '/';
    const path2 = '/two';

    assert.strictEqual(join(path1, path2), '/two', `join(path1, path2)`);
  });

  it('can combine an absolute path with protocol and a simple path', function () {
    const path1 = 'http://aurelia.io';
    const path2 = 'two';

    assert.strictEqual(join(path1, path2), 'http://aurelia.io/two', `join(path1, path2)`);
  });

  it('can combine an absolute path with protocol and a simple path with slash', function () {
    const path1 = 'http://aurelia.io';
    const path2 = '/two';

    assert.strictEqual(join(path1, path2), 'http://aurelia.io/two', `join(path1, path2)`);
  });

  it('can combine an absolute path and a simple path with a dot', function () {
    const path1 = 'http://aurelia.io';
    const path2 = './two';

    assert.strictEqual(join(path1, path2), 'http://aurelia.io/two', `join(path1, path2)`);
  });

  it('can combine a simple path and a relative path', function () {
    const path1 = 'one';
    const path2 = '../two';

    assert.strictEqual(join(path1, path2), 'two', `join(path1, path2)`);
  });

  it('can combine an absolute path and a relative path', function () {
    const path1 = 'http://aurelia.io/somewhere';
    const path2 = '../two';

    assert.strictEqual(join(path1, path2), 'http://aurelia.io/two', `join(path1, path2)`);
  });

  it('can combine a protocol independent path and a simple path', function () {
    const path1 = '//aurelia.io';
    const path2 = 'two';

    assert.strictEqual(join(path1, path2), '//aurelia.io/two', `join(path1, path2)`);
  });

  it('can combine a protocol independent path and a simple path with slash', function () {
    const path1 = '//aurelia.io';
    const path2 = '/two';

    assert.strictEqual(join(path1, path2), '//aurelia.io/two', `join(path1, path2)`);
  });

  it('can combine a protocol independent path and a simple path with a dot', function () {
    const path1 = '//aurelia.io';
    const path2 = './two';

    assert.strictEqual(join(path1, path2), '//aurelia.io/two', `join(path1, path2)`);
  });

  it('can combine a protocol independent path and a relative path', function () {
    const path1 = '//aurelia.io/somewhere';
    const path2 = '../two';

    assert.strictEqual(join(path1, path2), '//aurelia.io/two', `join(path1, path2)`);
  });

  it('can combine a complex path and a relative path', function () {
    const path1 = 'one/three';
    const path2 = '../two';

    assert.strictEqual(join(path1, path2), 'one/two', `join(path1, path2)`);
  });

  it('returns path2 if path1 null', function () {
    const path1 = null;
    const path2 = 'two';

    assert.strictEqual(join(path1, path2), 'two', `join(path1, path2)`);
  });

  it('returns path2 if path1 empty', function () {
    const path1 = '';
    const path2 = 'two';

    assert.strictEqual(join(path1, path2), 'two', `join(path1, path2)`);
  });

  it('returns path1 if path2 null', function () {
    const path1 = 'one';
    const path2 = null;

    assert.strictEqual(join(path1, path2), 'one', `join(path1, path2)`);
  });

  it('returns path1 if path2 empty', function () {
    const path1 = 'one';
    const path2 = '';

    assert.strictEqual(join(path1, path2), 'one', `join(path1, path2)`);
  });

  it('should respect a trailing slash', function () {
    const path1 = 'one/';
    const path2 = 'two/';

    assert.strictEqual(join(path1, path2), 'one/two/', `join(path1, path2)`);
  });

  it('should respect file:/// protocol with three slashes (empty host)', function () {
    const path1 = 'file:///one';
    const path2 = '/two';

    assert.strictEqual(join(path1, path2), 'file:///one/two', `join(path1, path2)`);
  });

  it('should respect file:// protocol with two slashes (host given)', function () {
    const path1 = 'file://localhost:8080';
    const path2 = '/two';

    assert.strictEqual(join(path1, path2), 'file://localhost:8080/two', `join(path1, path2)`);
  });

  it('should allow scheme-relative URL that uses colons in the path', function () {
    const path1 = '//localhost/one:/';
    const path2 = '/two';

    assert.strictEqual(join(path1, path2), '//localhost/one:/two', `join(path1, path2)`);
  });

  it('should not add more than two leading slashes to http:// protocol', function () {
    const path1 = 'http:///';
    const path2 = '/two';

    assert.strictEqual(join(path1, path2), 'http://two', `join(path1, path2)`);
  });
});
