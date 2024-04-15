import * as path from 'path';
import { preprocess, IFileUnit } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';

describe('preprocess', function () {
  it('transforms html file', function () {
    const html = '<template></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [  ];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  container.register(_e);
}
`;
    const result = preprocess({ path: path.join('src', 'foo-bar.html'), contents: html }, { hmr: false, enableConventions: true }, () => false)!;
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('transforms html file with paired css file', function () {
    const html = '<template></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import "./foo-bar.css";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [  ];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  container.register(_e);
}
`;
    const result = preprocess(
      {
        path: path.join('src', 'foo-bar.html'),
        contents: html
      },
      {
        useProcessedFilePairFilename: true,
        hmr: false,
        enableConventions: true
      },
      (unit: IFileUnit, filePath: string) => filePath === './foo-bar.less'
    )!;
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('transforms html file with shadowOptions', function () {
    const html = '<import from="./hello-world.html" /><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import { shadowCSS } from '@aurelia/runtime-html';
import * as d0 from "./hello-world.html";
import * as d1 from "foo";
import d2 from "!!raw-loader!./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1, shadowCSS(d2) ];
export const shadowOptions = { mode: 'open' };
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, shadowOptions });
  }
  container.register(_e);
}
`;
    const result = preprocess(
      { path: path.join('src', 'foo-bar.html'), contents: html },
      {
        defaultShadowOptions: { mode: 'open' },
        stringModuleWrap: (id: string) => `!!raw-loader!${id}`,
        hmr: false,
        enableConventions: true
      },
      () => false
    )!;
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('transforms html file with explicit file extension on dep', function () {
    const html = '<import from="./hello-world.html" /><template><import from="./foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import { shadowCSS } from '@aurelia/runtime-html';
import * as d0 from "./hello-world.html";
import * as d1 from "./foo.ts";
import d2 from "!!raw-loader!./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1, shadowCSS(d2) ];
export const shadowOptions = { mode: 'open' };
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, shadowOptions });
  }
  container.register(_e);
}
`;
    const result = preprocess(
      { path: path.join('src', 'foo-bar.html'), contents: html },
      {
        defaultShadowOptions: { mode: 'open' },
        stringModuleWrap: (id: string) => `!!raw-loader!${id}`,
        hmr: false,
        enableConventions: true
      },
      (unit: IFileUnit, filePath: string) => filePath === './foo.ts'
    )!;
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('does not touch js/ts file without html pair', function () {
    const js = `export class Foo {}\n`;
    const result = preprocess(
      { path: path.join('src', 'foo.js'), contents: js },
      { hmr: false },
      () => false
    )!;
    assert.equal(result.code, js);
    assert.equal(result.map.version, 3);
  });

  it('does not touch js/ts file with html pair but wrong resource name', function () {
    const js = `export class Foo {}\n`;
    const result = preprocess(
      { path: path.join('src', 'bar.js'), contents: js },
      { hmr: false },
      (unit: IFileUnit, filePath: string) => filePath === './bar.html'
    )!;
    assert.equal(result.code, js);
    assert.equal(result.map.version, 3);
  });

  it('injects customElement decorator', function () {
    const js = `export class FooBar {}\n`;
    const expected = `import { defineElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './foo-bar.html';
export class FooBar {}
defineElement(__au2ViewDef, FooBar);

`;
    const result = preprocess(
      {
        path: path.join('src', 'foo-bar.ts'),
        contents: js,
        base: 'base'
      },
      { hmr: false },
      (unit: IFileUnit, filePath: string) => filePath === './foo-bar.html'
    )!;
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('injects customElement decorator with index file', function () {
    const js = `export class FooBar {}\n`;
    const expected = `import { defineElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './index.html';
export class FooBar {}
defineElement(__au2ViewDef, FooBar);

`;
    const result = preprocess(
      {
        path: path.join('src', 'foo-bar', 'index.ts'),
        contents: js,
        base: 'base'
      },
      { hmr: false },
      (unit: IFileUnit, filePath: string) => filePath === './index.html'
    )!;
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('injects various decorators when there is implicit custom element', function () {
    const js = `import {Foo} from './foo.js';
import { valueConverter, other } from '@aurelia/runtime-html';

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
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import {Foo} from './foo.js';
import { valueConverter, other, defineElement, defineAttribute, ValueConverter, BindingBehavior, BindingCommand } from '@aurelia/runtime-html';

export class LeaveMeAlone {}



export class LoremCustomAttribute {

}
defineAttribute('lorem', LoremCustomAttribute);


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
ValueConverter.define('theSecond', TheSecondValueConverter);


export class SomeBindingBehavior {

}
BindingBehavior.define('some', SomeBindingBehavior);


export class AbcBindingCommand {

}
BindingCommand.define('abc', AbcBindingCommand);


export class FooBar {}
defineElement({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, LoremCustomAttribute, ForOne, TheSecondValueConverter, SomeBindingBehavior, AbcBindingCommand ] }, FooBar);
`;
    const result = preprocess(
      {
        path: path.join('src', 'foo-bar.js'),
        contents: js
      },
      { hmr: false },
      (unit: IFileUnit, filePath: string) => filePath === './foo-bar.html'
    )!;
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('injects various decorators when there is implicit custom element, for alternative template', function () {
    const js = `import {Foo} from './foo.js';
import { valueConverter, other } from '@aurelia/runtime-html';

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
    const expected = `import * as __au2ViewDef from './foo-bar.haml';
import {Foo} from './foo.js';
import { valueConverter, other, defineElement, defineAttribute, ValueConverter, BindingBehavior, BindingCommand } from '@aurelia/runtime-html';

export class LeaveMeAlone {}



export class LoremCustomAttribute {

}
defineAttribute('lorem', LoremCustomAttribute);


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
ValueConverter.define('theSecond', TheSecondValueConverter);


export class SomeBindingBehavior {

}
BindingBehavior.define('some', SomeBindingBehavior);


export class AbcBindingCommand {

}
BindingCommand.define('abc', AbcBindingCommand);


export class FooBar {}
defineElement({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, LoremCustomAttribute, ForOne, TheSecondValueConverter, SomeBindingBehavior, AbcBindingCommand ] }, FooBar);
`;
    const result = preprocess(
      {
        path: path.join('src', 'foo-bar.js'),
        contents: js
      },
      { hmr: false },
      (unit: IFileUnit, filePath: string) => filePath === './foo-bar.haml'
    )!;
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });
});
