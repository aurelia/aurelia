import { customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { createFixture } from './_shared/create-fixture.js';
import { IHIAConfig } from './_shared/hook-invocation-tracker.js';

describe('router/external.spec.ts', function () {
  for (const attr of ['external', 'data-external']) {
    it(`recognizes "${attr}" attribute`, async function () {
      @customElement({
        name: 'root1',
        template: `<a href.bind="compLink"></a><a href.bind="httpLink" external></a><span href="a12"></span>${vp(1)}`
      })
      class Root1 {
        public httpLink = 'https://google.com';
        public compLink = 'a11';
      }
      @customElement({ name: 'a11', template: `a11${vp(1)}` })
      class A11 {}
      @customElement({ name: 'a12', template: `a12${vp(1)}` })
      class A12 {}

      const { router, host, tearDown } = await createFixture(Root1, [A11, A12], getDefaultHIAConfig, () => ({}));

      const anchors = Array.from(host.querySelectorAll('a'));

      const loadArgs: unknown[][] = [];
      router.load = (fn => function (...args: unknown[]) {
        loadArgs.push(args);
        return fn.apply(router, args);
      })(router.load);

      const [internalLink, externalLink] = anchors;
      const spanWithHref = host.querySelector('span');

      let externalLinkClick = 0;
      host.addEventListener('click', function (e) {
        const target = e.target as Element;
        if (target.hasAttribute('external') || target.hasAttribute('data-external')) {
          // prevent browser navigate
          e.preventDefault();
          externalLinkClick++;
        }
      });

      assert.strictEqual(host.textContent, '');
      internalLink.click();
      await router['currentTr'];

      assert.strictEqual(loadArgs.length, 1);
      assert.strictEqual(host.textContent, 'a11');

      externalLink.click();
      assert.strictEqual(loadArgs.length, 1);
      assert.strictEqual(externalLinkClick, 1);
      assert.strictEqual(host.textContent, 'a11');
      await router['currentTr'];

      assert.strictEqual(loadArgs.length, 1);
      assert.strictEqual(externalLinkClick, 1);
      assert.strictEqual(host.textContent, 'a11');

      spanWithHref.click();
      assert.strictEqual(loadArgs.length, 1);

      await tearDown();
    });
  }
});

function vp(count: number): string {
  return '<au-viewport></au-viewport>'.repeat(count);
}

function getDefaultHIAConfig(): IHIAConfig {
  return {
    resolveTimeoutMs: 100,
    resolveLabels: [],
  };
}
