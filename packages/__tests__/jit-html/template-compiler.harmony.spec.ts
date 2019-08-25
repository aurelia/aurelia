import {
  PLATFORM, RuntimeCompilationResources
} from '@aurelia/kernel';
import {
  Aurelia,
  BindingMode,
  CustomAttribute,
  CustomElement,
  ITemplateCompiler,
  TargetedInstructionType as TT,
  IViewFactory,
  IRenderLocation,
  IController,
  LifecycleFlags,
  INode
} from '@aurelia/runtime';
import {
  assert,
  HTMLTestContext,
  TestContext
} from '@aurelia/testing';

describe('harmoninous combination', function () {

  interface IHarmoniousCompilationTestCase {
    title: string;
    template: string | HTMLElement;
    resources?: any[];
    browserOnly?: boolean;
    assertFn(ctx: HTMLTestContext, host: HTMLElement, comp: any): void | Promise<void>;
  }

  before(async function() {
    await new Promise(PLATFORM.requestAnimationFrame);
  });
  after(async function() {
    await new Promise(PLATFORM.requestAnimationFrame);
  });

  const testCases: IHarmoniousCompilationTestCase[] = [
    {
      title: 'basic custom attr + event binding command',
      template: `<input blur.bind="hasFocus" blur.trigger="hasFocus = true">`,
      resources: [],
      browserOnly: true,
      assertFn: async (ctx, host, comp: { hasFocus: boolean }) => {
        assert.equal(comp.hasFocus, undefined, 'should have worked and had focus===undefined initially');
        host.querySelector('input').focus();
        await waitForFrames(1);
        assert.equal(comp.hasFocus, undefined, 'focusing input should not have changed "hasFocus"');
        host.querySelector('input').blur();
        await waitForFrames(1);
        assert.equal(comp.hasFocus, true, 'should have worked and had focus===true after blurred');
      }
    },
    {
      title: 'basic custom attribute focus + focus trigger binding command',
      template: `<input focus.bind="hasFocus" focus.trigger="focusCount = (focusCount || 0) + 1" blur.trigger="blurCount = (blurCount || 0) + 1" >`,
      resources: [],
      browserOnly: true,
      assertFn: async (ctx, host, comp: { hasFocus: boolean; focusCount: number; blurCount: number }) => {
        assert.equal(comp.hasFocus, undefined, 'should have worked and had focus===undefined initially');
        assert.equal(comp.focusCount, undefined);
        assert.equal(comp.blurCount, undefined);
        host.querySelector('input').focus();
        await waitForFrames(1);
        assert.equal(comp.hasFocus, true, 'focusing input should have changed "hasFocus"');
        assert.equal(comp.focusCount, 1);
        assert.equal(comp.blurCount, undefined);
        host.querySelector('input').blur();
        assert.equal(comp.hasFocus, false, 'blurring input should have changed "hasFocus"');
        assert.equal(comp.focusCount, 1);
        assert.equal(comp.blurCount, 1);
      }
    },
    {
      title: 'random custom attr + listening to event with the same name',
      template: '<div aaabbb.bind="hello" aaabbb.trigger="hello = 555"></div>',
      resources: [
        CustomAttribute.define({ name: 'aaabbb', bindables: ['value'] }, class AB {
          public static inject = [INode];

          public value: any;
          constructor(private element: HTMLElement) {}
          public binding(): void {
            this.valueChanged();
          }

          public valueChanged() {
            this.element.setAttribute('hello', this.value);
          }
        })
      ],
      browserOnly: true,
      assertFn: async (ctx, host, comp: { hello: number }) => {
        const div = host.querySelector('div');
        assert.equal(comp.hello, undefined);
        assert.equal(div.getAttribute('hello'), 'undefined');
        div.dispatchEvent(new ctx.CustomEvent('aaabbb'));
        assert.equal(div.getAttribute('hello'), '555');
      }
    },
    {
      title: 'random template controller attr + listening to event with the same name',
      template: '<div if.bind="!hello" if.trigger="hello = true"></div>',
      resources: [],
      assertFn: async (ctx, host, comp: { hello: number }) => {
        const div = host.querySelector('div');
        assert.notStrictEqual(div, null);
        div.dispatchEvent(new ctx.CustomEvent('if'));
        assert.strictEqual(comp.hello, true);
        await waitForFrames(1);
        assert.strictEqual(host.querySelector('div'), null);
      }
    },
    {
      title: 'multiple elements using custom attr + event with same names at the same time',
      template: `
        <input focus.bind="hasFocus" focus.trigger="log = (log || 0) + 1" />
        <input focus.bind="hasFocus2" focus.trigger="log2 = (log2 || 0) + 1"/>
      `,
      assertFn: async (ctx, host, comp: { hasFocus: boolean; hasFocus2: boolean; log: number; log2: number }) => {
        const [input1, input2] = Array.from(host.querySelectorAll('input'));

        assert.notEqual(ctx.doc.activeElement, input1);
        assert.notEqual(ctx.doc.activeElement, input2);
        assert.equal(comp.hasFocus, undefined);
        assert.equal(comp.log, undefined);
        assert.equal(comp.hasFocus2, undefined);
        assert.equal(comp.log2, undefined);

        input1.focus();
        assert.equal(comp.hasFocus, true);
        assert.equal(comp.log, 1);
        assert.equal(comp.hasFocus2, undefined);
        assert.equal(comp.log2, undefined);

        input2.focus();
        assert.equal(comp.hasFocus, false);
        assert.equal(comp.log, 1);
        assert.equal(comp.hasFocus2, true);
        assert.equal(comp.log2, 1);
      }
    },
    {
      title: 'delegates and capture work fine',
      template: `
        <div click.bind="hasFocus" click.delegate="(log = (log || 0) + 1) && (hasFocus = log)" ></div>
        <div click.bind="hasFocus2" click.capture="(log2 = (log2 || 0) + 1) && (hasFocus2 = log2)"></div>
      `,
      resources: [
        CustomAttribute.define(
          { name: 'click', bindables: ['value'] },
          class Click {
            public static inject = [INode];
            public value: any;
            constructor(private readonly element: HTMLElement) {}
            public binding(): void {
              this.valueChanged();
            }
            public valueChanged(): void {
              this.element.setAttribute('__click__', this.value);
            }
          }
        )
      ],
      assertFn: async (ctx, host, comp: { hasFocus: number; hasFocus2: number; log: number; log2: number }) => {
        const [div1, div2] = Array.from(host.querySelectorAll('div'));
        assert.equal(div1.getAttribute('__click__'), 'undefined');
        assert.equal(div2.getAttribute('__click__'), 'undefined');

        div1.click();
        assert.equal(comp.log, 1);
        assert.equal(comp.hasFocus, 1);
        assert.equal(div1.getAttribute('__click__'), '1');
        assert.equal(div2.getAttribute('__click__'), 'undefined');

        div2.click();
        assert.equal(comp.log, 1);
        assert.equal(comp.hasFocus, 1);
        assert.equal(comp.log2, 1);
        assert.equal(comp.hasFocus2, 1);
        assert.equal(div1.getAttribute('__click__'), '1');
        assert.equal(div1.getAttribute('__click__'), '1');
      }
    }
  ];

  testCases.forEach((testCase, idx) => {
    const { title, template, resources = [], browserOnly, assertFn } = testCase;
    if (!PLATFORM.isBrowserLike && browserOnly) {
      return;
    }
    it(`(${idx + 1}). ${title}`, async function() {
      let host: HTMLElement;
      try {
        const ctx = TestContext.createHTMLTestContext();
        const comp = new (CustomElement.define(
          {
            name: 'app',
            template
          },
          class App {}
        ))();

        host = ctx.doc.body.appendChild(ctx.createElement('app'));
        ctx.container.register(...resources);
        const au = new Aurelia(ctx.container);
        au.app({ host, component: comp });
        await waitForFrames(1);
        await au.start().wait();

        await assertFn(ctx, host, comp);

        await au.stop().wait();
      } finally {
        if (host) {
          host.remove();
        }
      }
    });
  });
});

interface IExpectedInstruction {
  toVerify: string[];
  [prop: string]: any;
}

async function waitForFrames(frameCount: number): Promise<void> {
  while (frameCount-- > 0) {
    await new Promise(PLATFORM.requestAnimationFrame);
  }
}

function verifyInstructions(actual: any[], expectation: IExpectedInstruction[], type?: string) {
  assert.strictEqual(actual.length, expectation.length, `Expected to have ${expectation.length} ${type ? type : ''} instructions. Received: ${actual.length}`);
  for (let i = 0, ii = actual.length; i < ii; ++i) {
    const actualInst = actual[i];
    const expectedInst = expectation[i];
    const ofType = type ? `of ${type}` : '';
    for (const prop of expectedInst.toVerify) {
      // tslint:disable-next-line:no-all-duplicated-branches
      if (expectedInst[prop] instanceof Object) {
        assert.deepStrictEqual(
          actualInst[prop],
          expectedInst[prop],
          `Expected actual instruction ${ofType} to have "${prop}": ${expectedInst[prop]}. Received: ${actualInst[prop]} (on index: ${i})`
        );
        // tslint:disable-next-line:no-duplicated-branches
      } else {
        assert.deepStrictEqual(
          actualInst[prop],
          expectedInst[prop],
          `Expected actual instruction ${ofType} to have "${prop}": ${expectedInst[prop]}. Received: ${actualInst[prop]} (on index: ${i})`
        );
      }
    }
  }
}
