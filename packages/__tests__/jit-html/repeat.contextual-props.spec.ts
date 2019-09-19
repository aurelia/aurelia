import { Constructable, IContainer, PLATFORM } from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  customElement,
  IDOM,
  ILifecycle,
  IObserverLocator,
  IRenderingEngine,
  view,
} from '@aurelia/runtime';
import { RenderPlan } from '@aurelia/runtime-html';
import {
  assert,
  eachCartesianJoin,
  HTMLTestContext,
  TestContext,
  trimFull
} from '@aurelia/testing';

describe('[repeat.contextual-prop.spec.ts]', function () {

  interface IComposeIntegrationTestCase {
    title: string;
    template: string | HTMLElement;
    root?: Constructable;
    only?: boolean;
    resources?: any[];
    browserOnly?: boolean;
    testWillThrow?: boolean;
    assertFn(ctx: HTMLTestContext, host: HTMLElement, comp: any): void | Promise<void>;
    assertFn_AfterDestroy?(ctx: HTMLTestContext, host: HTMLElement, comp: any): void | Promise<void>;
  }

  const testCases: IComposeIntegrationTestCase[] = [
    {
      title: 'it works in basic scenario (1 number)',
      template:
        `<div repeat.for="i of 1">\${$index} -- \${$even}</div>`,
      assertFn: (ctx, host, comp) => {
        assert.strictEqual(host.textContent, '0 -- true');
      }
    },
    {
      title: 'it works in basic scenario (10 numbers)',
      template:
        `<div repeat.for="i of 10">\${$index} -- \${$even}</div>`,
      assertFn: (ctx, host, comp) => {
        let text = '';
        for (let i = 0; 10 > i; ++i) {
          text += `${i} -- ${i % 2 === 0}`;
        }
        assert.strictEqual(host.textContent, text);
      }
    },
    // {
    //   title: 'it works in basic scenario (10 numbers -> 20 numbers)',
    //   template: `<div repeat.for="i of itemCount">\${$index} -- \${$even}</div>`,
    //   root: class App {
    //     public itemCount: number = 10;
    //   },
    //   assertFn: async (ctx, host, comp: { itemCount: number }) => {
    //     let text = '';
    //     for (let i = 0; 10 > i; ++i) {
    //       text += `${i} -- ${i % 2 === 0}`;
    //     }
    //     assert.strictEqual(host.textContent, text);

    //     await waitForFrames(2);
    //     comp.itemCount = 5;
    //     for (let i = 0; 5 > i; ++i) {
    //       text += `${i} -- ${i % 2 === 0}`;
    //     }
    //     assert.strictEqual(host.textContent, text);
    //   }
    // }
    {
      title: 'it works in basic scenario (10 objects)',
      template:
        `<div repeat.for="item of items">\${$index} -- \${$even}</div>`,
      root: class App {
        public items = Array.from({ length: 10 }).map((_, idx) => {
          return { name: 'item - ' + idx, value: idx };
        })
      },
      assertFn: (ctx, host, comp) => {
        let text = '';
        for (let i = 0; 10 > i; ++i) {
          text += `${i} -- ${i % 2 === 0}`;
        }
        assert.strictEqual(host.textContent, text);
      }
    }
  ];

  for (const testCase of testCases) {
    const {
      title,
      template,
      root,
      resources = [],
      only,
      browserOnly,
      assertFn,
      assertFn_AfterDestroy = PLATFORM.noop,
      testWillThrow
    } = testCase;
    if (!PLATFORM.isBrowserLike && browserOnly) {
      continue;
    }
    const suit = (_title: string, fn: any) => only
      ? it.only(_title, fn)
      : it(_title, fn);

    suit(title, async function() {
      let body: HTMLElement;
      let host: HTMLElement;
      try {
        const ctx = TestContext.createHTMLTestContext();

        const App = CustomElement.define({ name: 'app', template }, root);
        const au = new Aurelia(ctx.container);

        body = ctx.doc.body;
        host = body.appendChild(ctx.createElement('app'));
        ctx.container.register(...resources);

        let didThrow = false;
        let component: any;
        try {
          au.app({ host, component: App });
          await au.start().wait();
          component = au.root.viewModel;
        } catch (ex) {
          didThrow = true;
          if (testWillThrow) {
            // dont try to assert anything on throw
            // just bails
            try {
              await au.stop().wait();
            } catch {/* and ignore all errors trying to stop */}
            return;
          }
          throw ex;
        }

        if (testWillThrow && !didThrow) {
          throw new Error('Expected test to throw, but did NOT');
        }

        await assertFn(ctx, host, component);

        await au.stop().wait();
        await assertFn_AfterDestroy(ctx, host, component);
      } finally {
        if (host) {
          host.remove();
        }
        if (body) {
          body.focus();
        }
        await waitForFrames(2);
      }
    });
  }
});

async function waitForFrames(frameCount: number): Promise<void> {
  while (frameCount-- > 0) {
    await new Promise(PLATFORM.requestAnimationFrame);
  }
}
