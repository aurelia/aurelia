import { Readable, Writable } from 'stream';
import { plugin } from '@aurelia/plugin-gulp';
import { assert } from '@aurelia/testing';
import * as v from 'vinyl';
const Vinyl = ((v as any).default || v) as typeof import('vinyl');
type Vinyl = typeof Vinyl.prototype;

describe('plugin-gulp', function () {
  it('complains about stream mode', function (done) {
    const files: Vinyl[] = [];
    const t = plugin();
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

  it('ignores non js/ts/html file', function (done) {
    const css = '.a { color: red; }';
    const files: Vinyl[] = [];
    const t = plugin();
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
    const html = '<template></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime';
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [  ];
let _e;
export function getHTMLOnlyElement() {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  return _e;
}
`;

    const files: Vinyl[] = [];
    const t = plugin();
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
      assert.equal(files[0].relative, 'test/foo-bar.html.js');
      assert.equal(files[0].contents.toString(), expected);
      assert.equal(files[0].sourceMap, undefined);
      done();
    });

    t.end(new Vinyl({
      path: 'test/foo-bar.html',
      contents: Buffer.from(html)
    }));
  });

  it('transforms html file in ts mode', function(done) {
    const html = '<template></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime';
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies: any[] = [  ];
let _e: any;
export function getHTMLOnlyElement(): any {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  return _e;
}
`;

    const files: Vinyl[] = [];
    const t = plugin(true);
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
      assert.equal(files[0].relative, 'test/foo-bar.html.js');
      assert.equal(files[0].contents.toString(), expected);
      assert.equal(files[0].sourceMap.version, 3);
      done();
    });

    t.end(new Vinyl({
      path: 'test/foo-bar.html',
      contents: Buffer.from(html),
      sourceMap: {}
    }));
  });

  it('does not touch js/ts file without html pair', function(done) {
    const js = `export class Foo {}\n`;
    const files: Vinyl[] = [];
    const t = plugin(false, () => false);
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
      assert.equal(files[0].relative, 'test/foo.js');
      assert.equal(files[0].contents.toString(), js);
      assert.equal(files[0].sourceMap, undefined);
      done();
    });

    t.end(new Vinyl({
      path: 'test/foo.js',
      contents: Buffer.from(js)
    }));
  });

  it('does not touch js/ts file with html pair but wrong resource name', function(done) {
    const js = `export class Foo {}\n`;
    const files: Vinyl[] = [];
    const t = plugin(true, () => true);
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
      assert.equal(files[0].relative, 'test/foo-bar.js');
      assert.equal(files[0].contents.toString(), js);
      assert.equal(files[0].sourceMap, undefined);
      done();
    });

    t.end(new Vinyl({
      path: 'test/foo-bar.js',
      contents: Buffer.from(js)
    }));
  });

  it('injects customElement decorator', function(done) {
    const js = `export class FooBar {}\n`;
    const expected = `import * as __fooBarViewDef from './foo-bar.html';
import { customElement } from '@aurelia/runtime';
@customElement(__fooBarViewDef)
export class FooBar {}
`;
    const files: Vinyl[] = [];
    const t = plugin(false, () => true);
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
      assert.equal(files[0].relative, 'test/foo-bar.js');
      assert.equal(files[0].contents.toString(), expected);
      assert.equal(files[0].sourceMap, undefined);
      done();
    });

    t.end(new Vinyl({
      path: 'test/foo-bar.js',
      contents: Buffer.from(js)
    }));
  });

  it('injects various decorators when there is implicit custom element', function (done) {
    const js = `import {Foo} from './foo';
import { valueConverter } from '@aurelia/runtime';
import { other } from '@aurelia/jit';

export class LeaveMeAlone {}

export class FooBar {}

export class LoremCustomAttribute {

}

@valueConverter('one')
export class ForOne {
  toView(value: number): string {
    return '' + value;
  }
}

export class TheSecondValueConverter {
  toView(value: string): string {
    return value;
  }
}

export class SomeBindingBehavior {

}

export class AbcBindingCommand {

}
`;
    const expected = `import * as __fooBarViewDef from './foo-bar.html';
import {Foo} from './foo';
import { valueConverter, customElement, customAttribute, bindingBehavior } from '@aurelia/runtime';
import { other, bindingCommand } from '@aurelia/jit';

export class LeaveMeAlone {}



@customAttribute('lorem')
export class LoremCustomAttribute {

}

@valueConverter('one')
export class ForOne {
  toView(value: number): string {
    return '' + value;
  }
}

@valueConverter('theSecond')
export class TheSecondValueConverter {
  toView(value: string): string {
    return value;
  }
}

@bindingBehavior('some')
export class SomeBindingBehavior {

}

@bindingCommand('abc')
export class AbcBindingCommand {

}

@customElement({ ...__fooBarViewDef, dependencies: [ ...__fooBarViewDef.dependencies, LoremCustomAttribute, ForOne, TheSecondValueConverter, SomeBindingBehavior, AbcBindingCommand ] })
export class FooBar {}
`;
    const files: Vinyl[] = [];
    const t = plugin(false, () => true);
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
      assert.equal(files[0].relative, 'test/foo-bar.ts');
      assert.equal(files[0].contents.toString(), expected);
      assert.equal(files[0].sourceMap.version, 3);
      done();
    });

    t.end(new Vinyl({
      path: 'test/foo-bar.ts',
      contents: Buffer.from(js),
      sourceMap: {}
    }));
  });
});

