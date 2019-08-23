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

  it('processes template with no dependencies in ts mode', function () {
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
    const result = preprocessHtmlTemplate('lo/foo-bar.html', html, true);
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

  it('processes template with dependencies in ts mode', function () {
    const html = '<import from="./hello-world.html" /><template><import from="foo"><require from="./foo-bar.scss"></require></template>';
    const expected = `import { CustomElement } from '@aurelia/runtime';
import * as h0 from "./hello-world.html";
const d0 = h0.getHTMLOnlyElement();
import * as d1 from "foo";
import "./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies: any[] = [ d0, d1 ];
let _e: any;
export function getHTMLOnlyElement(): any {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  return _e;
}
`;
    const result = preprocessHtmlTemplate('lo\\FooBar.html', html, true);
    assert.equal(result.code, expected);
  });

});
