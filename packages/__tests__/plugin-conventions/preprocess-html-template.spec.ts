import { preprocessHtmlTemplate } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';

describe('preprocessHtmlTemplate', function () {
  it('processes template with no dependencies', function () {
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
    const result = preprocessHtmlTemplate('lo/foo-bar.html', html);
    assert.equal(result.code, expected);
  });

  it('processes template with dependencies', function () {
    const html = '<import from="./hello-world.html" /><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime';
import * as h0 from "./hello-world.html";
const d0 = h0.getHTMLOnlyElement();
import * as d1 from "foo";
import { Registration } from '@aurelia/kernel';
import d2 from "./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1, Registration.defer('.css', d2) ];
let _e;
export function getHTMLOnlyElement() {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  return _e;
}
`;
    const result = preprocessHtmlTemplate('lo\\FooBar.html', html);
    assert.equal(result.code, expected);
  });

  it('processes template with dependencies, wrap css module id', function () {
    const html = '<import from="./hello-world.html" /><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime';
import * as h0 from "./hello-world.html";
const d0 = h0.getHTMLOnlyElement();
import * as d1 from "foo";
import { Registration } from '@aurelia/kernel';
import d2 from "./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1, Registration.defer('.css', d2) ];
let _e;
export function getHTMLOnlyElement() {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  return _e;
}
`;
    const result = preprocessHtmlTemplate('lo\\FooBar.html', html, undefined, id => `raw-loader!${id}`);
    assert.equal(result.code, expected);
  });

  it('processes template with css dependencies in shadowDOM mode', function () {
    const html = '<import from="./hello-world.html" /><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime';
import * as h0 from "./hello-world.html";
const d0 = h0.getHTMLOnlyElement();
import * as d1 from "foo";
import { Registration } from '@aurelia/kernel';
import d2 from "./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1, Registration.defer('.css', d2) ];
export const shadowOptions = { mode: 'open' };
let _e;
export function getHTMLOnlyElement() {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, shadowOptions });
  }
  return _e;
}
`;
    const result = preprocessHtmlTemplate('lo\\FooBar.html', html, { mode: 'open' });
    assert.equal(result.code, expected);
  });

  it('processes template with css dependencies in shadowDOM mode with string module wrap', function () {
    const html = '<import from="./hello-world.html" /><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime';
import * as h0 from "./hello-world.html";
const d0 = h0.getHTMLOnlyElement();
import * as d1 from "foo";
import { Registration } from '@aurelia/kernel';
import d2 from "raw-loader!./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1, Registration.defer('.css', d2) ];
export const shadowOptions = { mode: 'closed' };
let _e;
export function getHTMLOnlyElement() {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, shadowOptions });
  }
  return _e;
}
`;
    const result = preprocessHtmlTemplate('lo\\FooBar.html', html, { mode: 'closed' }, id => `raw-loader!${id}`);
    assert.equal(result.code, expected);
  });

  it('processes template with css dependencies in shadowDOM mode with string module wrap and explicit shadow mode', function () {
    const html = '<import from="./hello-world.html"><use-shadow-dom><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime';
import * as h0 from "./hello-world.html";
const d0 = h0.getHTMLOnlyElement();
import * as d1 from "foo";
import { Registration } from '@aurelia/kernel';
import d2 from "raw-loader!./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1, Registration.defer('.css', d2) ];
export const shadowOptions = { mode: 'open' };
let _e;
export function getHTMLOnlyElement() {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, shadowOptions });
  }
  return _e;
}
`;
    const result = preprocessHtmlTemplate('lo\\FooBar.html', html, { mode: 'closed' }, id => `raw-loader!${id}`);
    assert.equal(result.code, expected);
  });

  it('processes template with css dependencies in per-file shadowDOM mode with string module wrap and explicit shadow mode', function () {
    const html = '<import from="./hello-world.html"><use-shadow-dom><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime';
import * as h0 from "./hello-world.html";
const d0 = h0.getHTMLOnlyElement();
import * as d1 from "foo";
import { Registration } from '@aurelia/kernel';
import d2 from "raw-loader!./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1, Registration.defer('.css', d2) ];
export const shadowOptions = { mode: 'open' };
let _e;
export function getHTMLOnlyElement() {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, shadowOptions });
  }
  return _e;
}
`;
    const result = preprocessHtmlTemplate('lo\\FooBar.html', html, undefined, id => `raw-loader!${id}`);
    assert.equal(result.code, expected);
  });

  it('turn off shadowDOM mode for one word element', function () {
    const html = '<import from="./hello-world.html"><use-shadow-dom><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime';
console.warn("WARN: ShadowDOM is disabled for lo\\\\foo.html. ShadowDOM requires element name to contain a dash (-), you have to refactor <foo> to something like <lorem-foo>.");
import * as h0 from "./hello-world.html";
const d0 = h0.getHTMLOnlyElement();
import * as d1 from "foo";
import { Registration } from '@aurelia/kernel';
import d2 from "./foo-bar.scss";
export const name = "foo";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1, Registration.defer('.css', d2) ];
let _e;
export function getHTMLOnlyElement() {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  return _e;
}
`;
    const result = preprocessHtmlTemplate('lo\\foo.html', html, { mode: 'closed' }, id => `raw-loader!${id}`);
    assert.equal(result.code, expected);
  });

  it('processes template with containerless and bindables', function() {
    const html = '<bindable name="age" mode="one-way"><containerless><template bindable="firstName, lastName"></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime';
export const name = "foo";
export const template = "<template ></template>";
export default template;
export const dependencies = [  ];
export const containerless = true;
export const bindables = {"age":{"mode":2},"firstName":{},"lastName":{}};
let _e;
export function getHTMLOnlyElement() {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, containerless, bindables });
  }
  return _e;
}
`;
    const result = preprocessHtmlTemplate('lo\\foo.html', html, null, id => `raw-loader!${id}`);
    assert.equal(result.code, expected);
  })
});
