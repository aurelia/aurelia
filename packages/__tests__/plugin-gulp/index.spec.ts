import { Readable, Writable } from 'stream';
import { IFileUnit, IOptionalPreprocessOptions } from '@aurelia/plugin-conventions';
import { plugin } from '@aurelia/plugin-gulp';
import { assert } from '@aurelia/testing';
import * as v from 'vinyl';

const Vinyl = ((v as any).default || v) as typeof import('vinyl');
type Vinyl = typeof Vinyl.prototype;

function preprocess(unit: IFileUnit, options: IOptionalPreprocessOptions) {
  if (unit.path.endsWith('.css')) return;
  const { defaultShadowOptions, stringModuleWrap } = options;
  const shadowOptionsString = defaultShadowOptions ? (`${JSON.stringify(defaultShadowOptions)} `) : '';
  const stringModuleWrapString = defaultShadowOptions && stringModuleWrap ? stringModuleWrap(unit.path) : unit.path;
  return {
    code: `processed ${shadowOptionsString}${stringModuleWrapString} ${unit.contents}`,
    map: { version: 3 }
  };
}

describe('plugin-gulp', function () {
  it('complains about stream mode', function (done) {
    const files: Vinyl[] = [];
    const t = plugin.call(undefined, {}, preprocess);
    t.pipe(new Writable({
      objectMode: true,
      write(file: Vinyl, enc, cb) {
        files.push(file);
        cb();
      }
    }));
    t.on('error', (error: Error) => {
      assert.equal(files.length, 0);
      assert.includes(error.message, '@aurelia/plugin-gulp: Streaming is not supported');
      done();
    });

    t.end(new Vinyl({
      path: 'test/foo-bar.html',
      contents: new Readable()
    }));
  });

  it('bypass other file', function (done) {
    const css = '.a { color: red; }';
    const files: Vinyl[] = [];
    const t = plugin.call(undefined, {}, preprocess);
    t.pipe(new Writable({
      objectMode: true,
      write(file: Vinyl, enc, cb) {
        files.push(file);
        cb();
      }
    }));
    t.on('error', done);
    t.on('end', () => {
      assert.equal(files.length, 1);
      assert.equal(files[0].relative, 'test/foo.css');
      assert.equal(files[0].contents.toString(), css);
      assert.equal(files[0].sourceMap, undefined);
      done();
    });

    t.end(new Vinyl({
      path: 'test/foo.css',
      contents: Buffer.from(css)
    }));
  });

  it('transforms html file', function(done) {
    const content = 'content';
    const expected = 'processed src/foo-bar.html content';

    const files: Vinyl[] = [];
    const t = plugin.call(undefined, {}, preprocess);
    t.pipe(new Writable({
      objectMode: true,
      write(file: Vinyl, enc, cb) {
        files.push(file);
        cb();
      }
    }));
    t.on('error', done);
    t.on('end', () => {
      assert.equal(files.length, 1);
      assert.equal(files[0].relative, 'src/foo-bar.html.js');
      assert.equal(files[0].contents.toString(), expected);
      assert.equal(files[0].sourceMap, undefined);
      done();
    });

    t.end(new Vinyl({
      path: 'src/foo-bar.html',
      contents: Buffer.from(content)
    }));
  });

  it('transforms html file in shadowDOM mode', function(done) {
    const content = 'content';
    const expected = 'processed {"mode":"open"} text!src/foo-bar.html content';

    const files: Vinyl[] = [];
    const t = plugin.call(undefined,
      {
        defaultShadowOptions: { mode: 'open' },
        stringModuleWrap: (id: string) => `text!${id}`
      },
      preprocess
    );
    t.pipe(new Writable({
      objectMode: true,
      write(file: Vinyl, enc, cb) {
        files.push(file);
        cb();
      }
    }));
    t.on('error', done);
    t.on('end', () => {
      assert.equal(files.length, 1);
      assert.equal(files[0].relative, 'src/foo-bar.html.js');
      assert.equal(files[0].contents.toString(), expected);
      assert.equal(files[0].sourceMap.version, 3);
      done();
    });

    t.end(new Vinyl({
      path: 'src/foo-bar.html',
      contents: Buffer.from(content),
      sourceMap: {}
    }));
  });

  it('transforms html file in CSSModule mode', function(done) {
    const content = 'content';
    const expected = 'processed src/foo-bar.html content';

    const files: Vinyl[] = [];
    const t = plugin.call(undefined, { useCSSModule: true }, preprocess);
    t.pipe(new Writable({
      objectMode: true,
      write(file: Vinyl, enc, cb) {
        files.push(file);
        cb();
      }
    }));
    t.on('error', done);
    t.on('end', () => {
      assert.equal(files.length, 1);
      assert.equal(files[0].relative, 'src/foo-bar.html.js');
      assert.equal(files[0].contents.toString(), expected);
      assert.equal(files[0].sourceMap.version, 3);
      done();
    });

    t.end(new Vinyl({
      path: 'src/foo-bar.html',
      contents: Buffer.from(content),
      sourceMap: {}
    }));
  });

  it('transforms html file in shadowDOM mode + CSSModule mode', function(done) {
    const content = 'content';
    const expected = 'processed {"mode":"open"} src/foo-bar.html content';

    const files: Vinyl[] = [];
    const t = plugin.call(undefined,
      {
        defaultShadowOptions: { mode: 'open' },
        stringModuleWrap: (id: string) => `text!${id}`,
        useCSSModule: true
      },
      preprocess
    );
    t.pipe(new Writable({
      objectMode: true,
      write(file: Vinyl, enc, cb) {
        files.push(file);
        cb();
      }
    }));
    t.on('error', done);
    t.on('end', () => {
      assert.equal(files.length, 1);
      assert.equal(files[0].relative, 'src/foo-bar.html.js');
      assert.equal(files[0].contents.toString(), expected);
      assert.equal(files[0].sourceMap.version, 3);
      done();
    });

    t.end(new Vinyl({
      path: 'src/foo-bar.html',
      contents: Buffer.from(content),
      sourceMap: {}
    }));
  });

  it('transforms js file', function(done) {
    const content = 'content';
    const expected = 'processed src/foo-bar.js content';

    const files: Vinyl[] = [];
    const t = plugin.call(undefined, {}, preprocess);
    t.pipe(new Writable({
      objectMode: true,
      write(file: Vinyl, enc, cb) {
        files.push(file);
        cb();
      }
    }));
    t.on('error', done);
    t.on('end', () => {
      assert.equal(files.length, 1);
      assert.equal(files[0].relative, 'src/foo-bar.js');
      assert.equal(files[0].contents.toString(), expected);
      assert.equal(files[0].sourceMap, undefined);
      done();
    });

    t.end(new Vinyl({
      path: 'src/foo-bar.js',
      contents: Buffer.from(content)
    }));
  });

  it('transforms ts file', function(done) {
    const content = 'content';
    const expected = 'processed src/foo-bar.ts content';

    const files: Vinyl[] = [];
    const t = plugin.call(undefined, {}, preprocess);
    t.pipe(new Writable({
      objectMode: true,
      write(file: Vinyl, enc, cb) {
        files.push(file);
        cb();
      }
    }));
    t.on('error', done);
    t.on('end', () => {
      assert.equal(files.length, 1);
      assert.equal(files[0].relative, 'src/foo-bar.ts');
      assert.equal(files[0].contents.toString(), expected);
      assert.equal(files[0].sourceMap, undefined);
      done();
    });

    t.end(new Vinyl({
      path: 'src/foo-bar.ts',
      contents: Buffer.from(content)
    }));
  });
});

