import {
  Constructable,
  noop,
} from '@aurelia/kernel';
import {
  Controller,
  CustomAttribute,
  CustomElement,
  INode,
  Aurelia,
} from '@aurelia/runtime-html';
import {
  assert,
  TestContext,
} from '@aurelia/testing';

describe('3-runtime-html/templating-compiler.ref.spec.ts', function () {
  interface IRefIntegrationTestCase {
    title: string;
    template: string | HTMLElement;
    root?: Constructable;
    only?: boolean;
    resources?: any[];
    browserOnly?: boolean;
    testWillThrow?: boolean;
    assertFn(ctx: TestContext, host: HTMLElement, comp: any): void | Promise<void>;
    assertFnAfterDestroy?(ctx: TestContext, host: HTMLElement, comp: any): void | Promise<void>;
  }

  const testCases: IRefIntegrationTestCase[] = [
    {
      title: 'basic ref usage without any target',
      template:
        `<div ref=hello>`,
      assertFn: (ctx, host, comp) => {
        assert.notStrictEqual(comp.hello, undefined);
        assert.strictEqual(host.querySelector('div'), comp.hello);
      },
      assertFnAfterDestroy: (ctx, host, comp) => {
        assert.strictEqual(comp.hello, null);
      }
    },
    {
      title: 'basic ref usage with [element.ref]',
      template:
        `<div element.ref=hello>`,
      assertFn: (ctx, host, comp) => {
        assert.notEqual(comp.hello, undefined);
        assert.strictEqual(host.querySelector('div'), comp.hello);
      },
      assertFnAfterDestroy: (ctx, host, comp) => {
        assert.strictEqual(comp.hello, null);
      }
    },
    {
      title: 'basic ref usage within [REPEAT] template controller, ref BEFORE template controller',
      template: `<div repeat.for="i of 10" ref=hello>`,
      root: class App {
        // to assert scope assignment of ref
        public hello = undefined;
      },
      assertFn: (ctx, host, comp) => {
        assert.notStrictEqual(comp.hello, undefined);
        assert.equal(host.querySelectorAll('div').length, 10);
        assert.strictEqual(comp.hello, host.querySelectorAll('div')[9]);
      }
    },
    {
      title: 'basic ref usage within [REPEAT] template controller, ref AFTER template controller',
      template: `<div repeat.for="i of 10" ref=hello>`,
      root: class App {
        // to assert scope assignment of ref
        public hello = undefined;
      },
      assertFn: (ctx, host, comp) => {
        assert.notStrictEqual(comp.hello, undefined);
        assert.equal(host.querySelectorAll('div').length, 10);
        assert.strictEqual(comp.hello, host.querySelectorAll('div')[9]);
      }
    },
    {
      title: 'basic ref usage with a custom element view model [view-model.ref]',
      template: `<c-e view-model.ref=ce>`,
      resources: [
        CustomElement.define({ name: 'c-e' })
      ],
      assertFn: (ctx, host, comp) => {
        assert.notStrictEqual(comp.ce, undefined);
        assert.equal(comp.ce.$controller instanceof Controller, true);
      }
    },
    ...Array
      .from({ length: 10 })
      .map((_, idx, arr) => {
        const Attrs = Array.from({ length: arr.length }).map((__, idx1) => CustomAttribute.define(
          { name: `c-a-${idx1}` },
          class Ca {}
        ));
        const attrString = Array.from({ length: arr.length }, (__, idx1) => `c-a-${idx1}="a"`).join(' ');
        const attrRefString = Array.from({ length: arr.length }, (__, idx1) => `c-a-${idx1}.ref="ca${idx1}"`).join(' ');
        return [
          {
            title: 'ref usage with multiple custom attributes on a normal element, syntax: [xxx.ref]',
            template: `<div ${attrString} ${attrRefString}>`,
            resources: Attrs,
            assertFn: (ctx, host, comp) => {
              const div = host.querySelector('div') as INode;
              for (let i = 0, ii = arr.length; ii > i; ++i) {
                assert.strictEqual(CustomAttribute.for(div, `c-a-${i}`).viewModel, comp[`ca${i}`]);
              }
            }
          },
          {
            title: 'ref usage with multiple custom attributes on a normal element, syntax: [xxx.ref], ref before attr declaration',
            template: `<div ${attrRefString} ${attrString}>`,
            resources: Attrs,
            assertFn: (ctx, host, comp) => {
              const div = host.querySelector('div') as INode;
              for (let i = 0, ii = arr.length; ii > i; ++i) {
                assert.strictEqual(CustomAttribute.for(div, `c-a-${i}`).viewModel, comp[`ca${i}`]);
              }
            }
          },
          {
            title: '[Surrogate - ROOT] ref usage with multiple custom attributes on a normal element, syntax: [xxx.ref]',
            template: `<template ${attrString} ${attrRefString}>`,
            resources: Attrs,
            assertFn: (ctx, host: INode, comp) => {
              for (let i = 0, ii = arr.length; ii > i; ++i) {
                assert.strictEqual(CustomAttribute.for(host, `c-a-${i}`).viewModel, comp[`ca${i}`]);
              }
            }
          },
          {
            title: '[Surrogate - Custom-Element ROOT] ref usage with multiple custom attributes on a normal element, syntax: [xxx.ref]',
            template: `<c-e>`,
            resources: [
              ...Attrs,
              CustomElement.define(
                { name: 'c-e', template: `<template ${attrString} ${attrRefString}>` }
              )
            ],
            assertFn: (ctx, host) => {
              const ceEl = host.querySelector('c-e') as HTMLElement;
              const $celVm = CustomElement.for(ceEl).viewModel as object;
              for (let i = 0, ii = arr.length; ii > i; ++i) {
                assert.strictEqual(CustomAttribute.for(ceEl, `c-a-${i}`).viewModel, $celVm[`ca${i}`]);
              }
            }
          }
        ] as IRefIntegrationTestCase[];
      })
      .reduce((arr, cases) => arr.concat(cases), []),
    {
      title: 'leaves the reference intact if changed',
      template: '<div ref=div>',
      assertFn: (ctx, host, comp) => {
        comp.div = Symbol.for('???');
      },
      assertFnAfterDestroy: (ctx, host, comp) => {
        assert.strictEqual(comp.div, Symbol.for('???'));
      }
    },
    {
      title: `works properly with lifecycle`,
      template: '<div ref=div>',
      root: class App {
        public static inject = [INode];
        public div: HTMLElement;
        public bindingCalls = 0;
        public boundCalls = 0;
        public attachingCalls = 0;
        public attachedCalls = 0;
        public detachingCalls = 0;
        public unbindingCalls = 0;

        private readonly el: Element;
        public constructor(el: INode) {
          this.el = el as Element;
        }

        public binding(): void {
          this.bindingCalls++;
          assert.strictEqual(this.div, undefined, '[binding] div !== undefined');
          assert.notContains(this.el, this.div, '[binding] this.el.contains(this.div) === false');
        }

        public bound(): void {
          this.boundCalls++;
          assert.notStrictEqual(this.div, undefined, '[bound] div !== undefined');
          assert.notContains(this.el, this.div, '[bound] this.el.contains(this.div) === false');
        }

        public attaching(): void {
          this.attachingCalls++;
          assert.notStrictEqual(this.div, undefined);
          assert.contains(this.el, this.div, '[attaching] this.el.contains(this.div)');
        }

        public attached(): void {
          this.attachedCalls++;
          assert.notStrictEqual(this.div, undefined);
          assert.contains(this.el, this.div, '[attached] this.el.contains(this.div)');
        }

        public detaching(): void {
          this.detachingCalls++;
          assert.notStrictEqual(this.div, undefined);
          assert.contains(this.el, this.div, '[detaching] this.el.contains(this.div)');
        }

        public unbinding(): void {
          this.unbindingCalls++;
          assert.notStrictEqual(this.div, undefined);
          assert.notContains(this.el, this.div, '[unbinding] this.el.contains(this.div)');
        }
      },
      assertFn: (
        ctx,
        host,
        comp: {
          bindingCalls: number;
          boundCalls: number;
          attachingCalls: number;
          attachedCalls: number;
          detachingCalls: number;
          unbindingCalls: number;
        }
      ) => {
        assert.equal(comp.bindingCalls, 1, '[binding]');
        assert.equal(comp.boundCalls, 1, '[bound]');
        assert.equal(comp.attachingCalls, 1, '[attaching]');
        assert.equal(comp.attachedCalls, 1, '[attached]');
        assert.equal(comp.detachingCalls, 0, '[detaching]');
        assert.equal(comp.unbindingCalls, 0, '[unbinding]');
      },
      assertFnAfterDestroy: (
        ctx,
        host,
        comp: {
          bindingCalls: number;
          boundCalls: number;
          attachingCalls: number;
          attachedCalls: number;
          detachingCalls: number;
          unbindingCalls: number;
        }
      ) => {
        assert.equal(comp.bindingCalls, 1, '[binding]');
        assert.equal(comp.boundCalls, 1, '[bound]');
        assert.equal(comp.attachingCalls, 1, '[attaching]');
        assert.equal(comp.attachedCalls, 1, '[attached]');
        assert.equal(comp.detachingCalls, 1, '[detaching]');
        assert.equal(comp.unbindingCalls, 1, '[unbinding]');
      }
    },
    ...Array
      .from({ length: 10 })
      .map((_, idx, arr) => {
        const dotNotationExpressions = Array(arr.length).fill(`div${idx}`); // div1.div1.div1.div1
        const CustomElementTestClass = CustomElement.define('c-e', class {});
        return [
          {
            title: 'it works with complex expression',
            template: `<div ref="${dotNotationExpressions.join('.')}">`,
            assertFn: (ctx, host, comp) => {
              const accessPath = dotNotationExpressions.slice(0);
              let value;
              while (accessPath.length > 0) {
                value = (value || comp)[accessPath.shift()];
              }
              assert.equal(value, host.querySelector('div'));
            },
            assertFnAfterDestroy: (ctx, host, comp) => {
              const accessPath = dotNotationExpressions.slice(0);
              let value;
              while (accessPath.length > 0) {
                value = (value || comp)[accessPath.shift()];
              }
              assert.strictEqual(value, null);
            }
          },
          {
            title: 'it works with complex expression for view-model.ref',
            template: `<c-e view-model.ref="${dotNotationExpressions.join('.')}">`,
            resources: [
              CustomElementTestClass
            ],
            assertFn: (ctx, host, comp) => {
              const accessPath = dotNotationExpressions.slice(0);
              let value;
              while (accessPath.length > 0) {
                value = (value || comp)[accessPath.shift()];
              }
              assert.instanceOf(value, CustomElementTestClass);
            },
            assertFnAfterDestroy: (ctx, host, comp) => {
              const accessPath = dotNotationExpressions.slice(0);
              let value;
              while (accessPath.length > 0) {
                value = (value || comp)[accessPath.shift()];
              }
              assert.strictEqual(value, null);
            }
          }
        ] as IRefIntegrationTestCase[];
      })
      .reduce((arr, cases) => arr.concat(cases), []),
    // #region ref-binding order
    {
      title: 'works regardless of declaration order',
      template: '<input value.to-view="div.toString()"><div ref="div"></div>',
      assertFn: (ctx, host) => {
        assert.strictEqual(host.querySelector('input').value, ctx.createElement('div').toString());
      }
    },
    {
      title: 'works regardless of declaration order, and template controller in path',
      template: '<input value.to-view="div.toString()"><div if.bind="true" ref="div"></div>',
      assertFn: (ctx, host) => {
        assert.strictEqual(host.querySelector('input').value, ctx.createElement('div').toString());
      }
    },
    {
      title: 'works regardless of declaration order, and template controller in path with delayed composition',
      template: '<input value.to-view="div.toString()"><div if.bind="renderDiv" ref="div"></div>',
      assertFn: (ctx, host, comp: { renderDiv: boolean }) => {
        assert.strictEqual(host.querySelector('input').value, '', 'should have been empty initially');
        comp.renderDiv = true;
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(host.querySelector('input').value, ctx.createElement('div').toString());
      }
    },
    {
      title: 'works with setter',
      root: class App {
        public divSetterCount: number = 0;
        public divGetterCount: number = 0;
        public _div: HTMLDivElement;
        public get div(): HTMLDivElement {
          this.divGetterCount++;
          return this._div;
        }
        public set div(val: HTMLDivElement) {
          this.divSetterCount++;
          this._div = val;
        }
      },
      template: '<div repeat.for="i of 10" ref=div></div>',
      assertFn: (ctx, host, comp: { div: HTMLDivElement; divSetterCount: number; divGetterCount: number }) => {
        assert.strictEqual(comp.divGetterCount, 0, 'shoulda called getter 0 times');
        assert.strictEqual(comp.divSetterCount, 10, 'shoulda called setter 10 times');
      },
      assertFnAfterDestroy: (
        ctx,
        host,
        comp: { div: HTMLDivElement; divSetterCount: number; divGetterCount: number }
      ) => {
        assert.strictEqual(comp.divGetterCount, 10, 'shoulda called getter 10 times');
        assert.strictEqual(comp.divSetterCount, 11, 'shoulda called setter 11 times' /* 1 comes from $unbind */);
      }
    },
    {
      title: 'works with setter and @bindable',
      root: class App {

        public static bindables: string[] = ['div'];

        public divSetterCount: number = 0;
        public div: HTMLDivElement;

        public divChanged(): void {
          this.divSetterCount++;
        }
      },
      template: '<div if.bind="shouldRenderRepeat"><div repeat.for="i of 10" ref=div></div></div>',
      assertFn: (ctx, host, comp: { div: HTMLDivElement; shouldRenderRepeat: boolean; divSetterCount: number }) => {
        assert.strictEqual(comp.divSetterCount, 0, 'shoulda called setter 0 times');
        comp.shouldRenderRepeat = true;
        assert.strictEqual(comp.divSetterCount, 10, 'shoulda called setter 10 times');
      },
      assertFnAfterDestroy: (
        ctx,
        host,
        comp: { div: HTMLDivElement; divSetterCount: number; divGetterCount: number }
      ) => {
        assert.strictEqual(comp.divSetterCount, 11, 'shoulda called setter 11 times' /* 1 comes from $unbind */);
      }
    },
    // #endregion ref-binding order

    // #region wrong usage
    // bellow are non-happy-path scenarios
    // just to complete the assertion
    ...[
      'view',
      // 'controller', // why would this be invalid? @bigopon
      'view-model',
      'rando'
    ].map(refTarget => {
      return [
        {
          title: `basic WRONG ref usage with [${refTarget}.ref]`,
          testWillThrow: true,
          template: `<div ${refTarget}.ref=hello>`
        },
        {
          title: `basic WRONG ref usage with [ref.${refTarget}]`,
          testWillThrow: true,
          template: `<div ref.${refTarget}=hello>`
        },
      ] as IRefIntegrationTestCase[];
    }).reduce((arr, cases) => arr.concat(cases)),
    {
      title: `basic WRONG ref usage with [repeat.ref] as cannot reference template controller`,
      testWillThrow: true,
      template: `<div repeat.for="i of 1" repeat.ref=hello>`,
      assertFn: noop
    },
    // #endregion wrong usage
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
      assertFnAfterDestroy = noop,
      testWillThrow
    } = testCase;
    // if (!PLATFORM.isBrowserLike && browserOnly) {
    //   continue;
    // }
    const suit = (_title: string, fn: any) => only
      ? it.only(_title, fn)
      : it(_title, fn);

    suit(title, async function () {
      let body: HTMLElement;
      let host: HTMLElement;
      try {
        const ctx = TestContext.create();

        const App = CustomElement.define({ name: 'app', template }, root);
        const au = new Aurelia(ctx.container);

        body = ctx.doc.body;
        host = body.appendChild(ctx.createElement('app'));
        ctx.container.register(...resources);

        let component: any;
        try {
          au.app({ host, component: App });
          await au.start();
          component = au.root.controller.viewModel;
        } catch (ex) {
          if (testWillThrow) {
            // dont try to assert anything on throw
            // just bails
            try {
              await au.stop();
            } catch {/* and ignore all errors trying to stop */}
            return;
          }
          throw ex;
        }

        if (testWillThrow) {
          throw new Error('Expected test to throw, but did NOT');
        }

        await assertFn(ctx, host, component);

        await au.stop();
        await assertFnAfterDestroy(ctx, host, component);
        au.dispose();
      } finally {
        host?.remove();
        body?.focus();
      }
    });
  }
});
