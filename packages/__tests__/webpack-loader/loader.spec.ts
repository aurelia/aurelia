import { loader } from '@aurelia/webpack-loader';
import { assert } from '@aurelia/testing';

describe('webpack-loader', function () {
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
    const context = {
      async: () => function(err, code, map) {
        if (err) {
          done(err);
          return;
        }
        assert.equal(code, expected);
        assert.equal(map.version, 3);
        done();
      },
      resourcePath: 'src/foo-bar.html'
    };

    loader.call(context, html);
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
    const context = {
      async: () => function(err, code, map) {
        if (err) {
          done(err);
          return;
        }
        assert.equal(code, expected);
        assert.equal(map.version, 3);
        done();
      },
      query: { ts: true },
      resourcePath: 'src/foo-bar.html'
    };

    loader.call(context, html);
  });

  it('does not touch js/ts file without html pair', function(done) {
    const js = `export class Foo {}\n`;
    const context = {
      async: () => function(err, code, map) {
        if (err) {
          done(err);
          return;
        }
        assert.equal(code, js);
        assert.equal(map.version, 3);
        done();
      },
      resourcePath: 'src/foo.js'
    };

    loader.call(context, js, () => false);
  });

  it('does not touch js/ts file with html pair but wrong resource name', function(done) {
    const js = `export class Foo {}\n`;
    const context = {
      async: () => function(err, code, map) {
        if (err) {
          done(err);
          return;
        }
        assert.equal(code, js);
        assert.equal(map.version, 3);
        done();
      },
      resourcePath: 'src/bar.js'
    };

    loader.call(context, js, () => true);
  });

  it('injects customElement decorator', function(done) {
    const js = `export class FooBar {}\n`;
    const expected = `import * as __fooBarViewDef from './foo-bar.html';
import { customElement } from '@aurelia/runtime';
@customElement(__fooBarViewDef)
export class FooBar {}
`;
    const context = {
      async: () => function(err, code, map) {
        if (err) {
          done(err);
          return;
        }
        assert.equal(code, expected);
        assert.equal(map.version, 3);
        done();
      },
      resourcePath: 'src/foo-bar.ts'
    };

    loader.call(context, js, () => true);
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
    const context = {
      async: () => function(err, code, map) {
        if (err) {
          done(err);
          return;
        }
        assert.equal(code, expected);
        assert.equal(map.version, 3);
        done();
      },
      resourcePath: 'src/foo-bar.js'
    };

    loader.call(context, js, () => true);
  });
});

