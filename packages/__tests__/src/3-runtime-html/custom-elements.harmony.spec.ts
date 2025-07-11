import { delegateSyntax } from '@aurelia/compat-v1';
import {
  CustomAttribute,
  CustomElement,
  INode,
  Aurelia,
} from '@aurelia/runtime-html';
import { runTasks } from '@aurelia/runtime';
import {
  assert,
  createFixture,
  TestContext,
} from '@aurelia/testing';
import { isFirefox, isNode } from '../util.js';
import { resolve } from '@aurelia/kernel';

describe('3-runtime-html/custom-elements.harmony.spec.ts', function () {
  interface IHarmoniousCompilationTestCase {
    title: string;
    template: string | HTMLElement;
    resources?: any[];
    only?: boolean;
    browserOnly?: boolean;
    assertFn(ctx: TestContext, host: HTMLElement, comp: any): void | Promise<void>;
  }

  const testCases: IHarmoniousCompilationTestCase[] = [
    {
      title: 'basic surrogate working example with 1 pair of custom attr + event same name',
      template: '<template focus.bind="hasFocus" focus.trigger="focus = (focus || 0) + 1" tabindex=-1></template>',
      browserOnly: true,
      assertFn: (ctx, host, comp: { hasFocus: boolean; focus: number }) => {
        assert.equal(comp.hasFocus, undefined, 'comp.hasFocus === undefined');
        assert.equal(comp.focus, undefined);
        assert.equal(host.hasAttribute('tabindex'), true);

        host.focus();
        assert.equal(comp.hasFocus, true, 'comp.hasFocus === true');
        assert.equal(comp.focus, 1);

        host.blur();
        assert.equal(comp.hasFocus, false, 'comp.hasFocus === false');
        assert.equal(comp.focus, 1);
      }
    },
    {
      title: 'basic surrogate working example with 2 pairs of custom attr + event same names',
      template: `<template
        focus.bind="hasFocus"
        focus.trigger="focus = (focus || 0) + 1"
        blur.trigger="blur = (blur || 0) + 1"
        tabindex=-1>
        <div></div>
      </template>`,
      browserOnly: true,
      assertFn: (ctx, host, comp: { hasFocus: boolean; focus: number; blur: number }) => {
        assert.equal(comp.hasFocus, undefined, 'comp.hasFocus === undefined');
        assert.equal(comp.focus, undefined);
        assert.equal(comp.blur, undefined);
        assert.equal(host.hasAttribute('tabindex'), true);

        host.focus();
        assert.equal(comp.hasFocus, true, 'comp.hasFocus === true (1)');
        assert.equal(comp.focus, 1);
        assert.equal(comp.blur, undefined);

        host.blur();
        assert.equal(comp.hasFocus, false, 'comp.hasFocus === false (1)');
        assert.equal(comp.focus, 1);
        assert.equal(comp.blur, 1);

        comp.hasFocus = true;
        runTasks();
        assert.strictEqual(ctx.doc.activeElement, host);
        assert.equal(comp.focus, 2);
        const div = host.querySelector('div');
        div.click();
        assert.equal(comp.focus, 2);
        assert.equal(comp.blur, 1);
      }
    },
    {
      title: 'surrogate on custom element (non-root) with 1 pair of custom attr + event same names',
      template: '<c-e></c-e>',
      resources: [
        CustomElement.define(
          {
            name: 'c-e',
            template:
              `<template
                focus.bind="hasFocus"
                focus.trigger="focus = (focus || 0) + 1"
                tabindex="-1"></template>`
          },
          class CE {}
        )
      ],
      browserOnly: true,
      assertFn: (ctx, host) => {
        const ceEl: HTMLElement = host.querySelector('c-e');
        const $ceViewModel = CustomElement.for(ceEl).viewModel as { hasFocus: boolean; focus: number; blur: number };
        assert.equal($ceViewModel.hasFocus, undefined, 'comp.hasFocus === undefined');
        assert.equal($ceViewModel.focus, undefined);
        assert.equal(ceEl.hasAttribute('tabindex'), true, 'host.hasAttribute(tabindex)');

        ceEl.focus();
        assert.equal($ceViewModel.hasFocus, true, '$ceViewModel.hasFocus === true');
        assert.equal($ceViewModel.focus, 1);

        ceEl.blur();
        assert.equal($ceViewModel.hasFocus, false, '$ceViewModel.hasFocus === false');
        assert.equal($ceViewModel.focus, 1);
      }
    },
    ...Array.from({ length: 10 }, (_, idx) => {
      return {
        title: `surrogate on recursive c-e, level ${idx}`,
        template:
          `<c-e lvl.bind="${idx}">`,
        resources: [
          CustomElement.define(
            {
              name: 'c-e',
              template:
                // todo: interpolation on surrogate does not work
                // todo: attr command on surrogate does not work
                `<template
                  focus.to-view="lvl === ${idx}"
                  focus.trigger="focus = (focus || 0) + 1"
                  tabindex="-1">
                  <c-e if.bind="lvl < ${idx}" lvl.bind="lvl + 1" ></c-e>
                </template>`,
              bindables: ['lvl']
            },
            class Ce {
              public static inject = [INode];
              public lvl: number;
              private readonly el: HTMLElement;
              public constructor(el: INode) {
                this.el = el as HTMLElement;
              }

              public binding() {
                this.el.setAttribute('lvl', `lvl-${this.lvl}`);
              }
            }
          )
        ],
        assertFn: (ctx, host) => {
          // it should work
          // todo: self-recursive does not work
          // assert.equal(host.querySelectorAll('c-e').length, idx + 1);
          const leafCeHost: HTMLElement = host.querySelector(`[lvl=lvl-${idx}]`);
          const $leafCeVm = CustomElement.for(leafCeHost).viewModel as { focus: number };
          assert.strictEqual(ctx.doc.activeElement, leafCeHost, `activeElement === <c-e lvl=lvl-${idx}>`);
          assert.equal($leafCeVm.focus, 1);
        }
      };
    }) as IHarmoniousCompilationTestCase[],
    {
      title: 'basic custom attribute focus + focus trigger binding command',
      template: `<input focus.bind="hasFocus" focus.trigger="focusCount = (focusCount || 0) + 1" blur.trigger="blurCount = (blurCount || 0) + 1" >`,
      resources: [],
      browserOnly: true,
      assertFn: (ctx, host, comp: { hasFocus: boolean; focusCount: number; blurCount: number }) => {
        assert.equal(comp.hasFocus, undefined, 'should have worked and had focus===undefined initially');
        assert.equal(comp.focusCount, undefined);
        assert.equal(comp.blurCount, undefined);
        host.querySelector('input').focus();
        // await ctx.platform.yieldRenderTask();
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
          private readonly element: Element;
          public constructor(element: INode) {
            this.element = element as Element;
          }
          public binding(): void {
            this.valueChanged();
          }

          public valueChanged() {
            this.element.setAttribute('hello', this.value);
          }
        })
      ],
      browserOnly: true,
      assertFn: (ctx, host, comp: { hello: number }) => {
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
      assertFn: (ctx, host, comp: { hello: number }) => {
        const div = host.querySelector('div');
        assert.notStrictEqual(div, null);
        div.dispatchEvent(new ctx.CustomEvent('if'));
        assert.strictEqual(comp.hello, true);
        assert.strictEqual(host.querySelector('div'), null);
      }
    },
    {
      title: 'multiple elements using custom attr + event with same names at the same time',
      template: `
        <input focus.bind="hasFocus" focus.trigger="log = (log || 0) + 1" />
        <input focus.bind="hasFocus2" focus.trigger="log2 = (log2 || 0) + 1"/>
      `,
      browserOnly: true,
      assertFn: (ctx, host, comp: { hasFocus: boolean; hasFocus2: boolean; log: number; log2: number }) => {
        const [input1, input2] = Array.from(host.querySelectorAll('input'));

        assert.notEqual(ctx.doc.activeElement, input1);
        assert.notEqual(ctx.doc.activeElement, input2);
        assert.equal(comp.hasFocus, undefined);
        assert.equal(comp.log, undefined);
        assert.equal(comp.hasFocus2, undefined);
        assert.equal(comp.log2, undefined);

        input1.focus();
        assert.equal(comp.hasFocus, true, 'hasFocus === true when <input 1/> focused');
        assert.equal(comp.log, 1);
        assert.equal(comp.hasFocus2, undefined);
        assert.equal(comp.log2, undefined);

        input2.focus();
        assert.equal(comp.hasFocus, false);
        assert.equal(comp.log, 1);
        assert.equal(comp.hasFocus2, true, 'hasFocus2 === true when <input 2/> focused');
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
        delegateSyntax,
        CustomAttribute.define(
          { name: 'click', bindables: ['value'] },
          class Click {
            public static inject = [INode];
            public value: any;
            private readonly element: Element;
            public constructor(element: INode) {
              this.element = element as Element;
            }
            public binding(): void {
              this.valueChanged();
            }
            public valueChanged(): void {
              this.element.setAttribute('__click__', this.value);
            }
          }
        )
      ],
      assertFn: (ctx, host, comp: { hasFocus: number; hasFocus2: number; log: number; log2: number }) => {
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
    },
    {
      title: 'event name are not camelized',
      template: '<div a-b-c.trigger="count = (count || 0) + 1">',
      assertFn: (ctx, host, comp: { count: number }) => {
        const div = host.querySelector('div');
        assert.equal(comp.count, undefined);
        div.dispatchEvent(new ctx.CustomEvent('a-b-c'));
        assert.equal(comp.count, 1);
        div.dispatchEvent(new ctx.CustomEvent('aBC'));
        assert.equal(comp.count, 1);
      },
    },
  ];

  testCases.forEach((testCase, idx) => {
    const { title, template, resources = [], only, browserOnly, assertFn } = testCase;
    if (isNode() && browserOnly) {
      return;
    }
    if (isFirefox()) {
      console.log('Tests sensitive to timing issues are only run in Chrome');
      return;
    }
    const $it = only ? it.only : it;
    $it(`\n\t(${idx + 1}). ${title}\n\t`, async function () {
      this.retries(1).timeout(100);

      let host: HTMLElement;
      let body: HTMLElement;
      const ctx = TestContext.create();
      try {
        const comp = new (CustomElement.define(
          {
            name: 'app',
            template
          },
          class App {}
        ))();
        body = ctx.doc.body;

        host = ctx.doc.body.appendChild(ctx.createElement('app'));
        ctx.container.register(...resources);
        const au = new Aurelia(ctx.container);
        au.app({ host, component: comp });
        await au.start();

        await assertFn(ctx, host, comp);

        await au.stop();

        au.dispose();
      } finally {
        host?.remove();
        await new Promise(r => ctx.platform.requestAnimationFrame(r));
        await new Promise(r => ctx.platform.requestAnimationFrame(r));
        body?.focus();
      }
    });
  });

  it('gives priority to custom element bindable over custom attribute with the same name', function () {
    const { assertStyles } = createFixture(
      `<square size.bind="width"></square>`,
      { width: 10 },
      [
        CustomElement.define({ name: 'square', bindables: ['size'] }, class Square {
          host = resolve(INode) as HTMLElement;
          size: number;
          attached() {
            this.host.style.width = `${this.size}px`;
          }
        }),
        CustomAttribute.define('size', class Size  {
          value: any;
          host = resolve(INode) as Element;
          attached() {
            this.host.setAttribute('size', this.value);
          }
        })
      ]
    );

    assertStyles('square', { width: '10px' });
  });
});
