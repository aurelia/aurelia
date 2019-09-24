import { Constructable, IContainer, PLATFORM } from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  customElement,
  ICustomElementType,
  IDOM,
  ILifecycle,
  IObserverLocator,
  IRenderingEngine,
  ValueConverter,
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

describe('<compose.pass-through.spec.ts/>', function() {

  interface IComposePassThroughTestCase {
    title: string;
    template: string | HTMLElement;
    composeSubject: ICustomElementType;
    root?: Constructable;
    only?: boolean;
    resources?: any[];
    browserOnly?: boolean;
    testWillThrow?: boolean;
    assertFn(ctx: HTMLTestContext, host: HTMLElement, comp: any): void | Promise<void>;
    assertFn_AfterDestroy?(ctx: HTMLTestContext, host: HTMLElement, comp: any): void | Promise<void>;
  }

  const testCases: IComposePassThroughTestCase[] = [
    {
      title: 'Basic compose scenario',
      template: '<au-compose subject.bind=subject value.bind="value" name.bind="`testCompose`">',
      root: class App {
        public value: string = new Date().toLocaleDateString();
      },
      composeSubject: CustomElement.define(
        {
          name: 'c-e',
          bindables: ['value', 'name'],
          template: `<input value.bind=value name.bind=name />`
        }
      ),
      async assertFn(ctx, host, comp: { value: string }) {
        const inputEl = host.querySelector('input');
        assert.strictEqual(inputEl.value, new Date().toLocaleDateString());
        assert.strictEqual(inputEl.name, 'testCompose');

        // to-view binding assertion
        const newValue = Date.now().toString();
        comp.value = newValue;
        await waitForFrames(2);
        assert.strictEqual(inputEl.value, newValue);

        // from-view binding assertion
        const newInputValue = (Date.now() * 2).toString();
        inputEl.value = newInputValue;
        inputEl.dispatchEvent(new CustomEvent('input'));
        // since bind is not put straight on input
        // it has no info what to turn bind into
        // so it was converted to one way binding
        assert.notStrictEqual(comp.value, newInputValue);
      }
    },
    {
      title: 'Basic compose scenario - with input[value.two-way]',
      template: '<au-compose subject.bind=subject value.two-way="value" name.bind="`testCompose`">',
      root: class App {
        public value: string = new Date().toLocaleDateString();
      },
      composeSubject: CustomElement.define(
        {
          name: 'c-e',
          bindables: ['value', 'name'],
          template: `<input value.bind=value name.bind=name />`
        }
      ),
      async assertFn(ctx, host, comp: { value: string }) {
        const inputEl = host.querySelector('input');
        assert.strictEqual(inputEl.value, new Date().toLocaleDateString());
        assert.strictEqual(inputEl.name, 'testCompose');

        // to-view binding assertion
        const newValue = Date.now().toString();
        comp.value = newValue;
        await waitForFrames(2);
        assert.strictEqual(inputEl.value, newValue);

        // from-view binding assertion
        const newInputValue = (Date.now() * 2).toString();
        inputEl.value = newInputValue;
        inputEl.dispatchEvent(new CustomEvent('input'));
        // since bind is not put straight on input
        // it has no info what to turn bind into
        // so it was converted to one way binding
        assert.strictEqual(comp.value, newInputValue);
      }
    }
  ];

  for (const testCase of testCases) {
    const {
      title,
      template,
      composeSubject,
      root,
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

        const App = CustomElement.define({ name: 'app', template }, class extends root {
          public subject = composeSubject;
        });
        const au = new Aurelia(ctx.container);

        body = ctx.doc.body;
        host = body.appendChild(ctx.createElement('app'));

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
