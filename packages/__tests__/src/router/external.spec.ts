import { route } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { createFixture } from './_shared/create-fixture.js';
import { IHIAConfig } from './_shared/hook-invocation-tracker.js';

describe('router/external.spec.ts', function () {

  for (const useEagerLoading of [true, false]) {
    describe(`${useEagerLoading ? 'eager' : 'lazy'} loading`, function () {
      for (const useUrlFragmentHash of [true, false]) {
        for (const attr of ['external', 'data-external']) {
          it(`recognizes "${attr}" attribute - useUrlFragmentHash: ${useUrlFragmentHash}`, async function () {
            @customElement({ name: 'a11', template: `a11${vp(1)}` })
            class A11 { }
            @customElement({ name: 'a12', template: `a12${vp(1)}` })
            class A12 { }
            @route({
              routes: [
                {
                  path: 'a11',
                  component: A11,
                },
                {
                  path: 'a12',
                  component: A12,
                },
              ]
            })
            @customElement({
              name: 'root1',
              template: `<a href.bind="compLink"></a><a href.bind="httpLink" external></a><span href="a12"></span>${vp(1)}`
            })
            class Root1 {
              public httpLink = 'https://google.com';
              public compLink = 'a11';
            }

            const { router, host, tearDown } = await createFixture(Root1, [A11, A12], getDefaultHIAConfig, () => ({ useUrlFragmentHash, useEagerLoading }));

            const anchors = Array.from(host.querySelectorAll('a'));

            const loadArgs: unknown[][] = [];
            router.load = (fn => function (...args: unknown[]) {
              loadArgs.push(args);
              return fn.apply(router, args);
            })(router.load);

            const [internalLink, externalLink] = anchors;
            if (useUrlFragmentHash) {
              assert.match(internalLink.href, /#/);
            } else {
              assert.notMatch(internalLink.href, /#/);
            }
            assert.notMatch(externalLink.href, /#/);

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
            await router['currentTr'].promise;

            assert.strictEqual(loadArgs.length, 1);
            assert.strictEqual(host.textContent, 'a11');

            externalLink.click();
            assert.strictEqual(loadArgs.length, 1);
            assert.strictEqual(externalLinkClick, 1);
            assert.strictEqual(host.textContent, 'a11');
            await router['currentTr'].promise;

            assert.strictEqual(loadArgs.length, 1);
            assert.strictEqual(externalLinkClick, 1);
            assert.strictEqual(host.textContent, 'a11');

            spanWithHref.click();
            assert.strictEqual(loadArgs.length, 1);

            await tearDown();
          });
        }

        it(`auto-detects external href values without explicit attribute - useUrlFragmentHash: ${useUrlFragmentHash}`, async function () {
          @customElement({ name: 'a21', template: `a21${vp(1)}` })
          class A21 { }
          @customElement({ name: 'a22', template: `a22${vp(1)}` })
          class A22 { }
          @route({
            routes: [
              {
                path: 'a21',
                component: A21,
              },
              {
                path: 'a22',
                component: A22,
              },
            ]
          })
          @customElement({
            name: 'root2',
            template: `<a href.bind="compLink"></a><a href.bind="httpLink"></a><a href.bind="mailtoLink"></a><a href.bind="protocolRelativeLink"></a>${vp(1)}`
          })
          class Root2 {
            public compLink = 'a21';
            public httpLink = 'https://example.com/path';
            public mailtoLink = 'mailto:test@example.com';
            public protocolRelativeLink = '//cdn.example.com/app.js';
          }

          const { router, host, tearDown } = await createFixture(Root2, [A21, A22], getDefaultHIAConfig, () => ({ useUrlFragmentHash, useEagerLoading }));

          const anchors = Array.from(host.querySelectorAll('a'));
          assert.strictEqual(anchors.length, 4);

          const loadArgs: unknown[][] = [];
          router.load = (fn => function (...args: unknown[]) {
            loadArgs.push(args);
            return fn.apply(router, args);
          })(router.load);

          const [internalLink, httpLink, mailtoLink, protocolRelativeLink] = anchors as HTMLAnchorElement[];

          if (useUrlFragmentHash) {
            assert.match(internalLink.href, /#/);
          } else {
            assert.notMatch(internalLink.href, /#/);
          }

          assert.strictEqual(httpLink.getAttribute('href'), 'https://example.com/path');
          assert.strictEqual(mailtoLink.getAttribute('href'), 'mailto:test@example.com');
          assert.strictEqual(protocolRelativeLink.getAttribute('href'), '//cdn.example.com/app.js');

          for (const externalAnchor of [httpLink, mailtoLink, protocolRelativeLink]) {
            externalAnchor.addEventListener('click', e => e.preventDefault());
          }

          internalLink.click();
          await router['currentTr'].promise;
          assert.strictEqual(loadArgs.length, 1);

          httpLink.click();
          mailtoLink.click();
          protocolRelativeLink.click();

          assert.strictEqual(loadArgs.length, 1);

          await tearDown();
        });

        it(`treats custom schemes as external when parseable by URL - useUrlFragmentHash: ${useUrlFragmentHash}`, async function () {
          @customElement({ name: 'a31', template: `a31${vp(1)}` })
          class A31 { }
          const customScheme = 'myapp';
          @route({
            routes: [
              {
                path: 'a31',
                component: A31,
              },
            ]
          })
          @customElement({
            name: 'root3',
            template: `<a href.bind="compLink"></a><a href.bind="deepLink"></a><a href.bind="httpLink"></a>${vp(1)}`
          })
          class Root3 {
            public compLink = 'a31';
            public deepLink = `${customScheme}:open/settings`;
            public httpLink = 'https://example.com/keep-defaults';
          }

          const { router, host, tearDown } = await createFixture(Root3, [A31], getDefaultHIAConfig, () => ({ useUrlFragmentHash, useEagerLoading }));

          const [internalLink, deepLink, httpLink] = host.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;

          const loadArgs: unknown[][] = [];
          router.load = (fn => function (...args: unknown[]) {
            loadArgs.push(args);
            return fn.apply(router, args);
          })(router.load);

          for (const externalAnchor of [deepLink, httpLink]) {
            externalAnchor.addEventListener('click', e => e.preventDefault());
          }

          internalLink.click();
          await router['currentTr'].promise;
          assert.strictEqual(loadArgs.length, 1);

          deepLink.click();
          assert.strictEqual(loadArgs.length, 1);
          assert.strictEqual(deepLink.getAttribute('href'), `${customScheme}:open/settings`);
          assert.strictEqual(httpLink.getAttribute('href'), 'https://example.com/keep-defaults');

          httpLink.click();
          assert.strictEqual(loadArgs.length, 1);

          await tearDown();
        });
      }
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
