import * as path from 'path';
import { preprocessHtmlTemplate, preprocessOptions } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';

describe('preprocessHtmlTemplate', function () {
  it('processes template with no dependencies', function () {
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
    const result = preprocessHtmlTemplate({ path: path.join('lo', 'foo-bar.html'), contents: html }, preprocessOptions());
    assert.equal(result.code, expected);
  });

  it('processes template with file name not in kebab case', function () {
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
    const result = preprocessHtmlTemplate({ path: path.join('lo', 'FooBar.html'), contents: html }, preprocessOptions());
    assert.equal(result.code, expected);
  });

  it('processes template with css pair', function () {
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
    const result = preprocessHtmlTemplate({ path: path.join('lo', 'foo-bar.html'), contents: html, filePair: 'foo-bar.css' }, preprocessOptions());
    assert.equal(result.code, expected);
  });

  it('processes template with multiple css', function () {
    const html = '<require from="./lo.css"></require><template></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import "./foo-bar.css";
import "./lo.css";
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
    const result = preprocessHtmlTemplate({ path: path.join('lo', 'foo-bar.html'), contents: html, filePair: 'foo-bar.css' }, preprocessOptions());
    assert.equal(result.code, expected);
  });

  it('do not import css pair if a pair is imported', function () {
    const html = '<import from="./foo-bar.less"></import><template></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import "./foo-bar.less";
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
    const result = preprocessHtmlTemplate({ path: path.join('lo', 'foo-bar.html'), contents: html, filePair: 'foo-bar.css' }, preprocessOptions());
    assert.equal(result.code, expected);
  });

  it('processes template with dependencies', function () {
    const html = '<import from="./hello-world.html" /><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import * as d0 from "./hello-world.html";
import * as d1 from "foo";
import "./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1 ];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate({ path: path.join('lo', 'FooBar.html'), contents: html }, preprocessOptions());
    assert.equal(result.code, expected);
  });

  it('supports HTML-only dependency not in html format', function () {
    const html = '<import from="./hello-world.md" /><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import * as d0 from "./hello-world.md";
import * as d1 from "foo";
import "./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1 ];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate({ path: path.join('lo', 'FooBar.html'), contents: html }, preprocessOptions());
    assert.equal(result.code, expected);
  });

  it('processes template with dependencies, ignore wrapping css module id in non-shadow mode', function () {
    const html = '<import from="./hello-world.html" /><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import * as d0 from "./hello-world.html";
import * as d1 from "foo";
import "./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1 ];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'FooBar.html'), contents: html },
      preprocessOptions({ stringModuleWrap: (id: string) => `text!${id}` })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with css dependencies in shadowDOM mode', function () {
    const html = '<import from="./hello-world.html" /><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import { shadowCSS } from '@aurelia/runtime-html';
import * as d0 from "./hello-world.html";
import * as d1 from "foo";
import d2 from "text!./foo-bar.scss";
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
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'FooBar.html'), contents: html },
      preprocessOptions({
        defaultShadowOptions: { mode: 'open' },
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with multiple css dependencies in shadowDOM mode', function () {
    const html = '<import from="./hello-world.html" /><template><import from="foo"><require from="./foo-bar.scss"><require from="./foo-bar2.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import { shadowCSS } from '@aurelia/runtime-html';
import * as d0 from "./hello-world.html";
import * as d1 from "foo";
import d2 from "./foo-bar.scss";
import d3 from "./foo-bar2.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1, shadowCSS(d2, d3) ];
export const shadowOptions = { mode: 'open' };
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, shadowOptions });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'FooBar.html'), contents: html },
      preprocessOptions({
        defaultShadowOptions: { mode: 'open' }
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with css dependencies in shadowDOM mode with string module wrap', function () {
    const html = '<import from="./hello-world.html" /><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import { shadowCSS } from '@aurelia/runtime-html';
import * as d0 from "./hello-world.html";
import * as d1 from "foo";
import d2 from "text!./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1, shadowCSS(d2) ];
export const shadowOptions = { mode: 'closed' };
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, shadowOptions });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'FooBar.html'), contents: html },
      preprocessOptions({
        defaultShadowOptions: { mode: 'closed' },
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with css dependencies in shadowDOM mode with string module wrap and explicit shadow mode', function () {
    const html = '<import from="./hello-world.html"><use-shadow-dom><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import { shadowCSS } from '@aurelia/runtime-html';
import * as d0 from "./hello-world.html";
import * as d1 from "foo";
import d2 from "text!./foo-bar.scss";
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
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'FooBar.html'), contents: html },
      preprocessOptions({
        defaultShadowOptions: { mode: 'closed' },
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with css dependencies in per-file shadowDOM mode with string module wrap and explicit shadow mode', function () {
    const html = '<import from="./hello-world.html"><use-shadow-dom><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import { shadowCSS } from '@aurelia/runtime-html';
import * as d0 from "./hello-world.html";
import * as d1 from "foo";
import d2 from "text!./foo-bar.scss";
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
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'FooBar.html'), contents: html },
      preprocessOptions({
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('turn off shadowDOM mode for one word element', function () {
    const html = '<import from="./hello-world.html"><use-shadow-dom><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
console.warn("WARN: ShadowDOM is disabled for ${path.join('lo', 'foo.html')}. ShadowDOM requires element name to contain at least one dash (-), you have to refactor <foo> to something like <lorem-foo>.");
import * as d0 from "./hello-world.html";
import * as d1 from "foo";
import "./foo-bar.scss";
export const name = "foo";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1 ];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'foo.html'), contents: html },
      preprocessOptions({
        defaultShadowOptions: { mode: 'closed' },
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with containerless and bindables', function () {
    const html = '<bindable name="age" mode="one-way"><containerless><template bindable="firstName, lastName"></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo";
export const template = "<template ></template>";
export default template;
export const dependencies = [  ];
export const containerless = true;
export const bindables = {"age":{"mode":2},"firstName":{},"lastName":{}};
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, containerless, bindables });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'foo.html'), contents: html },
      preprocessOptions({
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with containerless and bindables on template', function () {
    const html = '<bindable name="age" mode="one-way"><template containerless bindable="firstName, lastName"></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo";
export const template = "<template  ></template>";
export default template;
export const dependencies = [  ];
export const containerless = true;
export const bindables = {"age":{"mode":2},"firstName":{},"lastName":{}};
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, containerless, bindables });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'foo.html'), contents: html },
      preprocessOptions({
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with containerless, bindables, and aliases', function () {
    const html = '<bindable name="age" mode="one-way"><containerless><template alias="test, test2" bindable="firstName, lastName"></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo";
export const template = "<template  ></template>";
export default template;
export const dependencies = [  ];
export const containerless = true;
export const bindables = {"age":{"mode":2},"firstName":{},"lastName":{}};
export const aliases = ["test","test2"];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, containerless, bindables, aliases });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'foo.html'), contents: html },
      preprocessOptions({
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with containerless, bindables, and aliases (node)', function () {
    const html = '<alias name="test, test2"><bindable name="age" mode="one-way"><containerless><template bindable="firstName, lastName"></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo";
export const template = "<template ></template>";
export default template;
export const dependencies = [  ];
export const containerless = true;
export const bindables = {"age":{"mode":2},"firstName":{},"lastName":{}};
export const aliases = ["test","test2"];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, containerless, bindables, aliases });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'foo.html'), contents: html },
      preprocessOptions({
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with containerless, bindables, and aliases (noth)', function () {
    const html = '<alias name="test, test2"><bindable name="age" mode="one-way"><containerless><template alias="test3, test4" bindable="firstName, lastName"></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo";
export const template = "<template  ></template>";
export default template;
export const dependencies = [  ];
export const containerless = true;
export const bindables = {"age":{"mode":2},"firstName":{},"lastName":{}};
export const aliases = ["test","test2","test3","test4"];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, containerless, bindables, aliases });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'foo.html'), contents: html },
      preprocessOptions({
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with containerless, bindables, and aliases (empty node) (noth)', function () {
    const html = '<alias><bindable name="age" mode="one-way"><containerless><template alias="test3, test4" bindable="firstName, lastName"></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo";
export const template = "<template  ></template>";
export default template;
export const dependencies = [  ];
export const containerless = true;
export const bindables = {"age":{"mode":2},"firstName":{},"lastName":{}};
export const aliases = ["test3","test4"];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, containerless, bindables, aliases });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'foo.html'), contents: html },
      preprocessOptions({
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with containerless, bindables, and aliases (empty attr) (noth)', function () {
    const html = '<alias name="test, test2"><bindable name="age" mode="one-way"><containerless><template alias="" bindable="firstName, lastName"></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo";
export const template = "<template  ></template>";
export default template;
export const dependencies = [  ];
export const containerless = true;
export const bindables = {"age":{"mode":2},"firstName":{},"lastName":{}};
export const aliases = ["test","test2"];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, containerless, bindables, aliases });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'foo.html'), contents: html },
      preprocessOptions({
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with containerless, bindables, and aliases (empty attr+node) (noth)', function () {
    const html = '<alias><bindable name="age" mode="one-way"><containerless><template alias="" bindable="firstName, lastName"></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo";
export const template = "<template  ></template>";
export default template;
export const dependencies = [  ];
export const containerless = true;
export const bindables = {"age":{"mode":2},"firstName":{},"lastName":{}};
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, containerless, bindables });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'foo.html'), contents: html },
      preprocessOptions({
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with containerless, bindables, and aliases (empty node) MAINTAIN EXISTING ATTRIBUTES', function () {
    const html = '<alias><bindable name="age" mode="one-way"><containerless><template id="my-template" alias="test3, test4" bindable="firstName, lastName"></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo";
export const template = "<template id=\\"my-template\\"  ></template>";
export default template;
export const dependencies = [  ];
export const containerless = true;
export const bindables = {"age":{"mode":2},"firstName":{},"lastName":{}};
export const aliases = ["test3","test4"];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, containerless, bindables, aliases });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'foo.html'), contents: html },
      preprocessOptions({
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with containerless, bindables, and aliases (empty node) MAINTAIN EXISTING ATTRIBUTE RAN TOGETHER', function () {
    const html = '<alias><bindable name="age" mode="one-way"><containerless><template id="my-template"alias="test3, test4" bindable="firstName, lastName"></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo";
export const template = "<template id=\\"my-template\\" ></template>";
export default template;
export const dependencies = [  ];
export const containerless = true;
export const bindables = {"age":{"mode":2},"firstName":{},"lastName":{}};
export const aliases = ["test3","test4"];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, containerless, bindables, aliases });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'foo.html'), contents: html },
      preprocessOptions({
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with css dependencies in cssModule mode', function () {
    const html = '<import from="./hello-world.html" /><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import { cssModules } from '@aurelia/runtime-html';
import * as d0 from "./hello-world.html";
import * as d1 from "foo";
import d2 from "./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1, cssModules(d2) ];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'FooBar.html'), contents: html },
      preprocessOptions({
        useCSSModule: true,
        stringModuleWrap: (id: string) => `text!${id}`
      })
    );
    assert.equal(result.code, expected);
  });

  it('processes template with multiple css dependencies in cssModule mode', function () {
    const html = '<import from="./hello-world.html" /><template><import from="foo"><require from="./foo-bar.scss"><require from="./foo-bar2.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import { cssModules } from '@aurelia/runtime-html';
import * as d0 from "./hello-world.html";
import * as d1 from "foo";
import d2 from "./foo-bar.scss";
import d3 from "./foo-bar2.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1, cssModules(d2, d3) ];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'FooBar.html'), contents: html },
      preprocessOptions({
        useCSSModule: true
      })
    );
    assert.equal(result.code, expected);
  });

  it('rejects <slot> usage in non-ShadowDOM mode', function () {
    const html = '<slot></slot>';

    assert.throws(() => {
      preprocessHtmlTemplate(
        { path: path.join('lo', 'FooBar.html'), contents: html },
        preprocessOptions()
      );
    });
  });

  it('does not reject <slot> usage in ShadowDOM mode', function () {
    const html = '<slot></slot>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo-bar";
export const template = "<slot></slot>";
export default template;
export const dependencies = [  ];
export const shadowOptions = { mode: 'open' };
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, shadowOptions });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'FooBar.html'), contents: html },
      preprocessOptions({
        defaultShadowOptions: { mode: 'open' }
      })
    );
    assert.equal(result.code, expected);
  });

  it('does not reject <slot> usage in local ShadowDOM mode', function () {
    const html = '<use-shadow-dom><slot></slot>';
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo-bar";
export const template = "<slot></slot>";
export default template;
export const dependencies = [  ];
export const shadowOptions = { mode: 'open' };
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, shadowOptions });
  }
  container.register(_e);
}
`;
    const result = preprocessHtmlTemplate(
      { path: path.join('lo', 'FooBar.html'), contents: html },
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });

  it('processes template with index file', function () {
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
      const result = preprocessHtmlTemplate({ path: path.join('lo', 'foo-bar', 'index.html'), contents: html }, preprocessOptions());
      assert.equal(result.code, expected);
    });

    it('processes template with index file and file path not in kebab case', function () {
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
      const result = preprocessHtmlTemplate({ path: path.join('lo', 'FooBar', 'index.html'), contents: html }, preprocessOptions());
      assert.equal(result.code, expected);
    });

    it('processes template with css pair in index file', function () {
      const html = '<template></template>';
      const expected = `import { CustomElement } from '@aurelia/runtime-html';
import "./index.css";
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
      const result = preprocessHtmlTemplate({ path: path.join('lo', 'foo-bar', 'index.html'), contents: html, filePair: 'index.css' }, preprocessOptions());
      assert.equal(result.code, expected);
    });
});
