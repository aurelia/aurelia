import { expect } from 'chai';
import { buildQueryString, join, parseQueryString, relativeToFile } from '../src/index';

describe('relativeToFile', function() {
  it('can make a dot path relative to a simple file', function() {
    const file = 'some/file.html';
    const path = './other/module';

    expect(relativeToFile(path, file)).to.equal('some/other/module');
  });

  it('can make a dot path relative to an absolute file', function() {
    const file = 'http://aurelia.io/some/file.html';
    const path = './other/module';

    expect(relativeToFile(path, file)).to.equal('http://aurelia.io/some/other/module');
  });

  it('can make a double dot path relative to an absolute file', function() {
    const file = 'http://aurelia.io/some/file.html';
    const path = '../other/module';

    expect(relativeToFile(path, file)).to.equal('http://aurelia.io/other/module');
  });

  it('returns path if null file provided', function() {
    const file = null;
    const path = 'module';

    expect(relativeToFile(path, file)).to.equal('module');
  });

  it('returns path if empty file provided', function() {
    const file = '';
    const path = 'module';

    expect(relativeToFile(path, file)).to.equal('module');
  });
});

describe('join', function() {
  it('can combine two simple paths', function() {
    const path1 = 'one';
    const path2 = 'two';

    expect(join(path1, path2)).to.equal('one/two');
  });

  it('can combine an absolute path and a simple path', function() {
    const path1 = '/one';
    const path2 = 'two';

    expect(join(path1, path2)).to.equal('/one/two');
  });

  it('can combine an absolute path and a simple path with slash', function() {
    const path1 = '/one';
    const path2 = '/two';

    expect(join(path1, path2)).to.equal('/one/two');
  });

  it('can combine a single slash and a simple path', function() {
    const path1 = '/';
    const path2 = 'two';

    expect(join(path1, path2)).to.equal('/two');
  });

  it('can combine a single slash and a simple path with slash', function() {
    const path1 = '/';
    const path2 = '/two';

    expect(join(path1, path2)).to.equal('/two');
  });

  it('can combine an absolute path with protocol and a simple path', function() {
    const path1 = 'http://aurelia.io';
    const path2 = 'two';

    expect(join(path1, path2)).to.equal('http://aurelia.io/two');
  });

  it('can combine an absolute path with protocol and a simple path with slash', function() {
    const path1 = 'http://aurelia.io';
    const path2 = '/two';

    expect(join(path1, path2)).to.equal('http://aurelia.io/two');
  });

  it('can combine an absolute path and a simple path with a dot', function() {
    const path1 = 'http://aurelia.io';
    const path2 = './two';

    expect(join(path1, path2)).to.equal('http://aurelia.io/two');
  });

  it('can combine a simple path and a relative path', function() {
    const path1 = 'one';
    const path2 = '../two';

    expect(join(path1, path2)).to.equal('two');
  });

  it('can combine an absolute path and a relative path', function() {
    const path1 = 'http://aurelia.io/somewhere';
    const path2 = '../two';

    expect(join(path1, path2)).to.equal('http://aurelia.io/two');
  });

  it('can combine a protocol independent path and a simple path', function() {
    const path1 = '//aurelia.io';
    const path2 = 'two';

    expect(join(path1, path2)).to.equal('//aurelia.io/two');
  });

  it('can combine a protocol independent path and a simple path with slash', function() {
    const path1 = '//aurelia.io';
    const path2 = '/two';

    expect(join(path1, path2)).to.equal('//aurelia.io/two');
  });

  it('can combine a protocol independent path and a simple path with a dot', function() {
    const path1 = '//aurelia.io';
    const path2 = './two';

    expect(join(path1, path2)).to.equal('//aurelia.io/two');
  });

  it('can combine a protocol independent path and a relative path', function() {
    const path1 = '//aurelia.io/somewhere';
    const path2 = '../two';

    expect(join(path1, path2)).to.equal('//aurelia.io/two');
  });

  it('can combine a complex path and a relative path', function() {
    const path1 = 'one/three';
    const path2 = '../two';

    expect(join(path1, path2)).to.equal('one/two');
  });

  it('returns path2 if path1 null', function() {
    const path1 = null;
    const path2 = 'two';

    expect(join(path1, path2)).to.equal('two');
  });

  it('returns path2 if path1 empty', function() {
    const path1 = '';
    const path2 = 'two';

    expect(join(path1, path2)).to.equal('two');
  });

  it('returns path1 if path2 null', function() {
    const path1 = 'one';
    const path2 = null;

    expect(join(path1, path2)).to.equal('one');
  });

  it('returns path1 if path2 empty', function() {
    const path1 = 'one';
    const path2 = '';

    expect(join(path1, path2)).to.equal('one');
  });

  it('should respect a trailing slash', function() {
    const path1 = 'one/';
    const path2 = 'two/';

    expect(join(path1, path2)).to.equal('one/two/');
  });

  it('should respect file:/// protocol with three slashes (empty host)', function() {
    const path1 = 'file:///one';
    const path2 = '/two';

    expect(join(path1, path2)).to.equal('file:///one/two');
  });

  it('should respect file:// protocol with two slashes (host given)', function() {
    const path1 = 'file://localhost:8080';
    const path2 = '/two';

    expect(join(path1, path2)).to.equal('file://localhost:8080/two');
  });

  it('should allow scheme-relative URL that uses colons in the path', function() {
    const path1 = '//localhost/one:/';
    const path2 = '/two';

    expect(join(path1, path2)).to.equal('//localhost/one:/two');
  });

  it('should not add more than two leading slashes to http:// protocol', function() {
    const path1 = 'http:///';
    const path2 = '/two';

    expect(join(path1, path2)).to.equal('http://two');
  });
});

describe('query strings', function() {
  it('should build query strings', function() {
    const gen = buildQueryString;

    expect(gen()).to.equal('');
    expect(gen(null)).to.equal('');
    expect(gen({})).to.equal('');
    expect(gen({ a: null })).to.equal('');

    expect(gen({ '': 'a' })).to.equal('=a');
    expect(gen({ a: 'b' })).to.equal('a=b');
    expect(gen({ a: 'b', c: 'd' })).to.equal('a=b&c=d');
    expect(gen({ a: 'b', c: 'd' }, true)).to.equal('a=b&c=d');
    expect(gen({ a: 'b', c: null })).to.equal('a=b');
    expect(gen({ a: 'b', c: null }, true)).to.equal('a=b');

    expect(gen({ a: ['b', 'c'] })).to.equal('a%5B%5D=b&a%5B%5D=c');
    expect(gen({ a: ['b', 'c'] }, true)).to.equal('a=b&a=c');
    expect(gen({ '&': ['b', 'c'] })).to.equal('%26%5B%5D=b&%26%5B%5D=c');
    expect(gen({ '&': ['b', 'c'] }, true)).to.equal('%26=b&%26=c');

    expect(gen({ a: '&' })).to.equal('a=%26');
    expect(gen({ '&': 'a' })).to.equal('%26=a');
    expect(gen({ a: true })).to.equal('a=true');
    expect(gen({ '$test': true })).to.equal('$test=true');

    expect(gen({ obj: { a: 5, b: 'str', c: false } })).to.equal('obj%5Ba%5D=5&obj%5Bb%5D=str&obj%5Bc%5D=false');
    expect(gen({ obj: { a: 5, b: 'str', c: false } }, true)).to.equal('obj=%5Bobject%20Object%5D');
    expect(gen({ obj: { a: 5, b: undefined}})).to.equal('obj%5Ba%5D=5');

    expect(gen({a: {b: ['c', 'd', ['f', 'g']]}})).to.equal('a%5Bb%5D%5B%5D=c&a%5Bb%5D%5B%5D=d&a%5Bb%5D%5B2%5D%5B%5D=f&a%5Bb%5D%5B2%5D%5B%5D=g');
    expect(gen({a: {b: ['c', 'd', ['f', 'g']]}}, true)).to.equal('a=%5Bobject%20Object%5D');
    expect(gen({a: ['c', 'd', ['f', 'g']]}, true)).to.equal('a=c&a=d&a=f%2Cg');
    expect(gen({a: ['c', 'd', {f: 'g'}]}, true)).to.equal('a=c&a=d&a=%5Bobject%20Object%5D');
  });

  it('should parse query strings', function() {
    const parse = parseQueryString;

    expect(parse('')).to.deep.equal({});
    expect(parse('=')).to.deep.equal({});
    expect(parse('&')).to.deep.equal({});
    expect(parse('?')).to.deep.equal({});

    expect(parse('a')).to.deep.equal({ a: true });
    expect(parse('a&b')).to.deep.equal({ a: true, b: true });
    expect(parse('a=')).to.deep.equal({ a: '' });
    expect(parse('a=&b=')).to.deep.equal({ a: '', b: '' });

    expect(parse('a=b')).to.deep.equal({ a: 'b' });
    expect(parse('a=b&c=d')).to.deep.equal({ a: 'b', c: 'd' });
    expect(parse('a=b&&c=d')).to.deep.equal({ a: 'b', c: 'd' });
    expect(parse('a=b&a=c')).to.deep.equal({ a: ['b', 'c'] });

    expect(parse('a=b&c=d=')).to.deep.equal({ a: 'b', c: 'd' });
    expect(parse('a=b&c=d==')).to.deep.equal({ a: 'b', c: 'd' });

    expect(parse('a=%26')).to.deep.equal({ a: '&' });
    expect(parse('%26=a')).to.deep.equal({ '&': 'a' });
    expect(parse('%26[]=b&%26[]=c')).to.deep.equal({ '&': ['b', 'c'] });

    expect(parse('a[b]=c&a[d]=e')).to.deep.equal({a: {b: 'c', d: 'e'}});
    expect(parse('a[b][c][d]=e')).to.deep.equal({a: {b: {c: {d: 'e'}}}});
    expect(parse('a[b][]=c&a[b][]=d&a[b][2][]=f&a[b][2][]=g')).to.deep.equal({a: {b: ['c', 'd', ['f', 'g']]}});
    expect(parse('a[0]=b')).to.deep.equal({a: ['b']});
  });
});
