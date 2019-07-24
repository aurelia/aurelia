import { preprocess } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';

describe('preprocess', function () {
  it('transforms html file', function () {
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
    const result = preprocess('src/foo-bar.html', html);
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('transforms html file in ts mode', function () {
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
    const result = preprocess('src/foo-bar.html', html, true);
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('does not touch js/ts file without html pair', function () {
    const js = 'export class Foo {}\n';
    const result = preprocess('src/foo.js', js, false, () => false);
    assert.equal(result.code, js);
    assert.equal(result.map.version, 3);
  });

  it('does not touch js/ts file with html pair but wrong resource name', function () {
    const js = 'export class Foo {}\n';
    const result = preprocess('src/bar.js', js, false, () => true);
    assert.equal(result.code, js);
    assert.equal(result.map.version, 3);
  });

  it('injects customElement decorator', function () {
    const js = 'export class FooBar {}\n';
    const expected = `import * as __fooBarViewDef from './foo-bar.html';
import { customElement } from '@aurelia/runtime';
@customElement(__fooBarViewDef)
export class FooBar {}
`;
    const result = preprocess('src/foo-bar.ts', js, false, () => true);
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('injects various decorators when there is implicit custom element', function () {
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
    const result = preprocess('src/foo-bar.js', js, true, () => true);
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });
});
