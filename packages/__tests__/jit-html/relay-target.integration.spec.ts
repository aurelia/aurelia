import { Constructable, PLATFORM } from '@aurelia/kernel';
import { Aurelia, CustomElement } from '@aurelia/runtime';
import { HTMLTestContext, TestContext } from '@aurelia/testing';

describe('relay-target.integration.spec.ts', function() {

  interface IRelayInstructionTestCase {
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

  const testCases: IRelayInstructionTestCase[] = [
    {
      title: 'Relay basic',
      template: `<c-e value.two-way=value></c-e>`,
      root: class {
        public value = new Date().toLocaleDateString();
      },
      resources: [
        CustomElement.define(
          {
            name: 'c-e',
            transferBindings: true,
            template: `<input relay-target >`
          },
          class {}
        )
      ],
      assertFn: (ctx, host, comp) => {
        debugger;
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
      testWillThrow,
      assertFn,
      assertFn_AfterDestroy = PLATFORM.noop
    } = testCase;

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
        let component: typeof root;
        try {
          au.app({ host, component: App });
          await au.start().wait();
          component = au.root.viewModel as unknown as typeof root;
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
        await waitForFrames(3);

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
