import { Aurelia, CustomElementResource, IViewModel, customElement } from '@aurelia/runtime';
import { TestContext, HTMLTestContext, hJsx, assert, eachCartesianJoinAsync, eachCartesianJoin } from '@aurelia/testing';
import { childrenQuerySelector, childrenQuerySelectorAll } from './html-extensions';
import { Constructable } from '@aurelia/kernel';

describe('portal.spec.tsx 🚪-🔁-🚪', function () {

  describe('basic', function() {

    const basicTestCases: IPortalTestCase<IPortalTestRootVm>[] = [
      {
        title: 'basic usage',
        rootVm: CustomElementResource.define(
          {
            name: 'app',
            template: <template><div portal class="portaled"></div></template>
          },
          class App {
            message = 'Aurelia';
            items: any[];
          }
        ),
        assertionFn: (ctx, host, component) => {    
          assert.equal(host.childElementCount, 0, 'It should have been empty.');
          assert.notEqual(
            childrenQuerySelector(ctx.doc.body, '.portaled'),
            null,
            '<div".portaled"/> should have been portaled'
          );
        }
      },
      {
        title: 'Portal custom elements',
        rootVm: CustomElementResource.define(
          {
            name: 'app',
            template: <template><c-e portal></c-e></template>,
            dependencies: [
              CustomElementResource.define(
                {
                  name: 'c-e',
                  template: <template>C-E</template>
                }
              )
            ]
          },
          class App {
            message = 'Aurelia';
            items: any[];
          }
        ),
        assertionFn: (ctx, host, comp) => {

          assert.equal(host.childElementCount, 0, 'It should have been empty.');
          assert.notEqual(
            childrenQuerySelector(ctx.doc.body, 'c-e'),
            null,
            '<c-e/> should have been portaled'
          );
        },
      },
      {
        title: 'portals nested template controller',
        rootVm: CustomElementResource.define(
          {
            name: 'app',
            template: <template><div portal if$="showCe" class="divdiv">{"${message}"}</div></template>
          },
          class App {
            message = 'Aurelia';
            showCe = true;
            items: any[];
          }
        ),
        assertionFn: (ctx, host, comp) => {
          assert.equal(host.childElementCount, 0, 'It should have been empty.');
          assert.notEqual(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            null,
            '<div.divdiv> should have been portaled'
          );
          assert.equal(
            ctx.doc.body.querySelector('.divdiv').textContent,
            'Aurelia',
            'It shoulda rendered ${message}'
          );
        }
      },
      {
        title: 'portals when nested inside template controller',
        rootVm: CustomElementResource.define(
          {
            name: 'app',
            template: <template><div if$="showCe" portal class="divdiv">{"${message}"}</div></template>
          },
          class App {
            message = 'Aurelia';
            showCe = true;
            items: any[];
          }
        ),
        assertionFn: (ctx, host, comp) => {
          assert.equal(host.childElementCount, 0, 'It should have been empty.');
          assert.notEqual(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            null,
            /* message when failed */'<div.divdiv> should have been portaled'
          );
          assert.equal(
            childrenQuerySelector(ctx.doc.body, '.divdiv').textContent,
            'Aurelia',
            'It shoulda rendered ${message}'
          )
        }
      },
      {
        title: 'works with repeat',
        rootVm: CustomElementResource.define(
          {
            name: 'app',
            template: <template><div portal repeat$for="item of items" class="divdiv">{"${message}"}</div></template>
          },
          class App {
            message = 'Aurelia';
            showCe = true;
            items = Array.from({ length: 5 }, (_, idx) => ({ idx }));
          }
        ),
        assertionFn: async (ctx, host) => {
          assert.equal(host.childElementCount, 0, 'It should have been empty.');
          assert.equal(
            childrenQuerySelectorAll(ctx.doc.body, '.divdiv').length,
            5,
            'There shoulda been 5 of <div.divdiv>'
          );
          assert.equal(
            ctx.doc.body.textContent.includes('Aurelia'.repeat(5)),
            true,
            'It shoulda rendered ${message}'
          );
        }
      },
      {
        title: 'removes portaled target after torndown',
        rootVm: CustomElementResource.define(
          {
            name: 'app',
            template: <div portal class="divdiv">{"${message}"}</div>
          },
          class App { items: any[] }
        ),
        assertionFn: async (ctx, host) => {
          assert.equal(host.childElementCount, 0, 'It should have been empty.');
          assert.notEqual(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            null,
            'There shoulda been 1 <div.divdiv>'
          );
        },
        postTeardownAssertionFn: async (ctx, host) => {
          assert.equal(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            null,
            'There shoulda been no <div.divdiv>'
          );
        }
      },
      // {
      //   title: 'it understand render context 1 (render context available before binding)',
      //   rootVm: CustomElementResource.define(
      //     {
      //       name: 'app',
      //       template: <template>
      //         <div ref="localDiv"></div>
      //         <div portal="render-context.bind=localDiv" class="divdiv">{"${message}"}</div>
      //       </template>
      //     },
      //     class App {
      //       localDiv: HTMLElement;
      //       items: any[];
      //     }
      //   ),
      //   assertionFn: (ctx, host, comp) => {
      //     // should work, or should work after a small waiting time for binding to update
      //     assert.equal(host.querySelector('.localDiv'), comp.localDiv);
      //     assert.notEqual(comp.localDiv!.querySelector('.divdiv'), null);
      //   }
      // },
      // {
      //   title: 'it understand render context 2 (render context available after binding)',
      //   rootVm: CustomElementResource.define(
      //     {
      //       name: 'app',
      //       template: <template>
      //         <div portal="render-context.bind=localDiv" class="divdiv">{"${message}"}</div>
      //         <div ref="localDiv"></div>
      //       </template>
      //     },
      //     class App {
      //       localDiv: HTMLElement;
      //       items: any[];
      //     }
      //   ),
      //   assertionFn: (ctx, host, comp) => {
      //     // should work, or should work after a small waiting time for binding to update
      //     assert.equal(host.querySelector('.localDiv'), comp.localDiv);
      //     assert.notEqual(comp.localDiv!.querySelector('.divdiv'), null);
      //   }
      // }
    ];

    eachCartesianJoin(
      [basicTestCases],
      (testCase) => {
        const {
          title,
          rootVm,
          assertionFn,
          postTeardownAssertionFn
        } = testCase;

        it(typeof title=== 'string' ? title : title(), async function() {

          const ctx = TestContext.createHTMLTestContext();
          const au = new Aurelia(ctx.container);
    
          const host = ctx.doc.body.appendChild(ctx.createElement('div'));
          const component = new rootVm();
    
          au.app({ host, component });
          au.start();

          await assertionFn(ctx, host, component);

          tearDown(au);

          if (postTeardownAssertionFn) {
            await postTeardownAssertionFn(ctx, host, component);
          }
        });
      }
    );
  });

  interface IPortalTestCase<K> {
    title: string | (() => string);
    rootVm: Constructable<K>;
    deps?: any[];
    assertionFn: (ctx: HTMLTestContext, host: HTMLElement, component: K) => void | Promise<void>;
    postTeardownAssertionFn?: (ctx: HTMLTestContext, host: HTMLElement, component: K) => void | Promise<void>;
  }

  interface IPortalTestRootVm {
    items?: any[];
    localDiv?: HTMLElement;
  }

  function tearDown(au: Aurelia) {
    au.stop();
    (au.root.host as Element).remove();
  }

  function createItems(count: number, baseName: string = 'item') {
    return Array.from({ length: count }, (_, idx) => {
      return { idx, name: `${baseName}-${idx}` }
    });
  }
});
