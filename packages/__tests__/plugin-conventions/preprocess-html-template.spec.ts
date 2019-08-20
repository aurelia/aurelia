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
import "./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ d0, d1 ];
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
});
