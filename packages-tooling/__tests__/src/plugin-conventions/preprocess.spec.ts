import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { preprocess, preprocessAsync, IFileUnit, IFileUnitHost, IFileUnitHostAsync } from '@aurelia/plugin-conventions';
import { nodeFileUnitHost, nodeFileUnitHostAsync } from '@aurelia/plugin-conventions/node';
import { assert } from '@aurelia/testing';

function host(fileExists: IFileUnitHost['fileExists']): IFileUnitHost {
  return {
    fileExists,
    readFile: () => '',
  };
}

function hostAsync(fileExists: IFileUnitHostAsync['fileExists']): IFileUnitHostAsync {
  return {
    fileExists,
    readFile: async () => '',
  };
}

describe('preprocess', function () {
  it('produces the same output with in-memory and Node file hosts', function () {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'au-conventions-'));
    const source = 'export class UserCard {}';
    const template = '<template class="card">User</template>';
    const style = '.card { display: block; }';
    const memoryFiles = new Map([
      ['/src/user-card.ts', source],
      ['/src/user-card.html', template],
      ['/src/user-card.css', style],
    ]);
    const memoryHost: IFileUnitHost = {
      fileExists(unit, filePath) {
        return memoryFiles.has(resolveMemoryPath(unit, filePath));
      },
      readFile(unit, filePath) {
        return memoryFiles.get(resolveMemoryPath(unit, filePath))!;
      },
    };

    try {
      fs.writeFileSync(path.join(root, 'user-card.ts'), source);
      fs.writeFileSync(path.join(root, 'user-card.html'), template);
      fs.writeFileSync(path.join(root, 'user-card.css'), style);

      const options = { hmr: false };
      const memoryResult = preprocess({ path: '/src/user-card.ts', contents: source }, options, memoryHost)!;
      const nodeResult = preprocess({ path: path.join(root, 'user-card.ts'), contents: source }, options, nodeFileUnitHost)!;

      assert.equal(memoryResult.code, nodeResult.code);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('produces the same output with in-memory and Node async file hosts', async function () {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'au-conventions-'));
    const source = 'export class UserCard {}';
    const template = '<template class="card">User</template>';
    const style = '.card { display: block; }';
    const memoryFiles = new Map([
      ['/src/user-card.ts', source],
      ['/src/user-card.html', template],
      ['/src/user-card.css', style],
    ]);
    const memoryHost: IFileUnitHostAsync = {
      async fileExists(unit, filePath) {
        return memoryFiles.has(resolveMemoryPath(unit, filePath));
      },
      async readFile(unit, filePath) {
        return memoryFiles.get(resolveMemoryPath(unit, filePath))!;
      },
    };

    try {
      fs.writeFileSync(path.join(root, 'user-card.ts'), source);
      fs.writeFileSync(path.join(root, 'user-card.html'), template);
      fs.writeFileSync(path.join(root, 'user-card.css'), style);

      const options = { hmr: false };
      const memoryResult = await preprocessAsync({ path: '/src/user-card.ts', contents: source }, options, memoryHost);
      const nodeResult = await preprocessAsync({ path: path.join(root, 'user-card.ts'), contents: source }, options, nodeFileUnitHostAsync);

      if (memoryResult == null || nodeResult == null) {
        throw new Error('Expected preprocessAsync to produce a result.');
      }
      assert.equal(memoryResult.code, nodeResult.code);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('transforms html file', function () {
    const html = '<template></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [  ];
export const bindables = {};
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, bindables });
  }
  container.register(_e);
}
`;
    const result = preprocess({ path: path.join('src', 'foo-bar.html'), contents: html }, { hmr: false, enableConventions: true }, host(() => false))!;
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('transforms html file asynchronously', async function () {
    const html = '<template></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [  ];
export const bindables = {};
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, bindables });
  }
  container.register(_e);
}
`;
    const result = await preprocessAsync({ path: path.join('src', 'foo-bar.html'), contents: html }, { hmr: false, enableConventions: true }, hostAsync(async () => false));
    if (result == null) {
      throw new Error('Expected preprocessAsync to produce a result.');
    }
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
export const bindables = {};
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, bindables });
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
      host((unit: IFileUnit, filePath: string) => filePath === './foo-bar.less')
    )!;
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('transforms html file with paired css module file', function () {
    const html = '<template></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import { cssModules } from '@aurelia/runtime-html';
import d0 from "./foo-bar.module.css";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ cssModules(d0) ];
export const bindables = {};
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, bindables });
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
      host((unit: IFileUnit, filePath: string) => filePath === './foo-bar.module.less')
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
export const bindables = {};
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, shadowOptions, bindables });
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
      host(() => false)
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
export const bindables = {};
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, shadowOptions, bindables });
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
      host((unit: IFileUnit, filePath: string) => filePath === './foo.ts')
    )!;
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('does not touch js/ts file without html pair', function () {
    const js = `export class Foo {}\n`;
    const result = preprocess(
      { path: path.join('src', 'foo.js'), contents: js },
      { hmr: false },
      host(() => false)
    )!;
    assert.equal(result.code, js);
    assert.equal(result.map.version, 3);
  });

  it('does not touch js/ts file with html pair but wrong resource name', function () {
    const js = `export class Foo {}\n`;
    const result = preprocess(
      { path: path.join('src', 'bar.js'), contents: js },
      { hmr: false },
      host((unit: IFileUnit, filePath: string) => filePath === './bar.html')
    )!;
    assert.equal(result.code, js);
    assert.equal(result.map.version, 3);
  });

  it('injects customElement decorator', function () {
    const js = `export class FooBar {}\n`;
    const expected = `import { customElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './foo-bar.html';
@customElement(__au2ViewDef)
export class FooBar {}
`;
    const result = preprocess(
      {
        path: path.join('src', 'foo-bar.ts'),
        contents: js,
        base: 'base'
      },
      { hmr: false },
      host((unit: IFileUnit, filePath: string) => filePath === './foo-bar.html')
    )!;
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });

  it('injects customElement decorator with index file', function () {
    const js = `export class FooBar {}\n`;
    const expected = `import { customElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './index.html';
@customElement(__au2ViewDef)
export class FooBar {}
`;
    const result = preprocess(
      {
        path: path.join('src', 'foo-bar', 'index.ts'),
        contents: js,
        base: 'base'
      },
      { hmr: false },
      host((unit: IFileUnit, filePath: string) => filePath === './index.html')
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
import { valueConverter, other, customElement, customAttribute, bindingBehavior, bindingCommand } from '@aurelia/runtime-html';

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

@customElement({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, LoremCustomAttribute, ForOne, TheSecondValueConverter, SomeBindingBehavior, AbcBindingCommand ] })
export class FooBar {}`;
    const result = preprocess(
      {
        path: path.join('src', 'foo-bar.js'),
        contents: js
      },
      { hmr: false },
      host((unit: IFileUnit, filePath: string) => filePath === './foo-bar.html')
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
import { valueConverter, other, customElement, customAttribute, bindingBehavior, bindingCommand } from '@aurelia/runtime-html';

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

@customElement({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, LoremCustomAttribute, ForOne, TheSecondValueConverter, SomeBindingBehavior, AbcBindingCommand ] })
export class FooBar {}`;
    const result = preprocess(
      {
        path: path.join('src', 'foo-bar.js'),
        contents: js
      },
      { hmr: false },
      host((unit: IFileUnit, filePath: string) => filePath === './foo-bar.haml')
    )!;
    assert.equal(result.code, expected);
    assert.equal(result.map.version, 3);
  });
});

function resolveMemoryPath(unit: IFileUnit, filePath: string): string {
  return path.posix.resolve(path.posix.dirname(unit.path), filePath);
}
