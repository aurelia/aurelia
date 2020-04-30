import { Aurelia, CustomElement, customElement } from '@aurelia/runtime';
import { RouterConfiguration, IHTMLRouter } from '@aurelia/router-html';
import { TestContext, assert } from '@aurelia/testing';

function createFixture() {
  const ctx = TestContext.createHTMLTestContext();
  const au = new Aurelia(ctx.container);
  const host = ctx.createElement('div');
  return { ctx, au, host };
}

async function verify(
  au: Aurelia,
  host: HTMLDivElement,
  expected: string,
) {
  const root = au.root;

  await au.start().wait();
  const outerHtmlAfterStart1 = host.outerHTML;
  assert.visibleTextEqual(root, expected, 'after start #1');

  await au.stop().wait();
  const outerHtmlAfterStop1 = host.outerHTML;
  assert.visibleTextEqual(root, '', 'after stop #1');

  await au.start().wait();
  const outerHtmlAfterStart2 = host.outerHTML;
  assert.visibleTextEqual(root, expected, 'after start #2');

  await au.stop().wait();
  const outerHtmlAfterStop2 = host.outerHTML;
  assert.visibleTextEqual(root, '', 'after stop #2');

  assert.strictEqual(outerHtmlAfterStart1, outerHtmlAfterStart2, 'outerHTML after start #1 / #2');
  assert.strictEqual(outerHtmlAfterStop1, outerHtmlAfterStop2, 'outerHTML after stop #1 / #2');
}

describe('router', function () {
  it('can load a single component in a single viewport', function () {
    const { ctx, au, host } = createFixture();

    @customElement({ name: 'root', template: '<au-viewport></au-viewport>' })
    class Root {

    }

    @customElement({ name: 'a', template: 'a' })
    class A {

    }
  });
});
