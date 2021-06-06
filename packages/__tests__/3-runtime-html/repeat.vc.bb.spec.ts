import { IContainer } from '@aurelia/kernel';
import { Aurelia, CustomElement, ICustomElementController, IPlatform, valueConverter } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext, TestFunction } from '../util.js';

describe.only('repeat value-converter integration', function () {
  interface TestSetupContext {
    template: string;
    registrations: any[];
  }
  class AuSlotTestExecutionContext implements TestExecutionContext<any> {
    private _scheduler: IPlatform;
    public constructor(
      public ctx: TestContext,
      public au: Aurelia,
      public container: IContainer,
      public host: HTMLElement,
      public app: App | null,
      public error: Error | null,
    ) { }
    public get platform(): IPlatform { return this._scheduler ?? (this._scheduler = this.container.get(IPlatform)); }
  }

  async function testRepeaterVC(
    testFunction: TestFunction<AuSlotTestExecutionContext>,
    { template, registrations = [] }: Partial<TestSetupContext> = {}
  ) {
    const ctx = TestContext.create();

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const container = ctx.container;
    const au = new Aurelia(container);
    let error: Error | null = null;
    let app: App | null = null;
    try {
      await au
        .register(
          ...registrations,
          IdentityValueConverter,
          OddEvenValueConverter,
          MultipleOfValueConverter,
          NoopBindingBehavior,
        )
        .app({
          host,
          component: CustomElement.define({ name: 'app', isStrictBinding: true, template }, App)
        })
        .start();
      app = au.root.controller.viewModel as App;
    } catch (e) {
      error = e;
    }

    assert.strictEqual(error, null);

    await testFunction(new AuSlotTestExecutionContext(ctx, au, container, host, app, error));

    if (error === null) {
      await au.stop();
    }
    ctx.doc.body.removeChild(host);
  }
  const $it = createSpecFunction(testRepeaterVC);

  class App {
    public arr: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
    public readonly $controller!: ICustomElementController<this>;
  }

  @valueConverter('identity')
  class IdentityValueConverter {
    public toView(value: unknown[]) {
      return value;
    }
  }

  @valueConverter('oddEven')
  class OddEvenValueConverter {
    public toView(value: number[], even: boolean) {
      return value.filter((v) => v % 2 === (even ? 0 : 1));
    }
  }

  @valueConverter('multipleOf')
  class MultipleOfValueConverter {
    public toView(value: number[], n: number) {
      return value.filter((v) => v % n === 0);
    }
  }

  @valueConverter('noop')
  class NoopBindingBehavior { }

  const identityExpected = Array.from({ length: 10 }, (_, i) => `<span>${i + 1}</span>`).join('');
  const oddExpected = Array.from({ length: 10 }, (_, i) => i % 2 === 0 ? `<span>${i + 1}</span>` : '').join('');
  const evenExpected = Array.from({ length: 10 }, (_, i) => i % 2 === 1 ? `<span>${i + 1}</span>` : '').join('');

  $it('change to inner array - identity VC',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, identityExpected, 'initial');
      ctx.app.arr.push(11);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `${identityExpected}<span>11</span>`, 'after mutation');
    },
    {
      template: `<span repeat.for="item of arr | identity">\${item}</span>`
    });

  $it('inner array instance change - identity VC',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, identityExpected, 'initial');
      ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `<span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>`, 'after change');
    },
    {
      template: `<span repeat.for="item of arr | identity">\${item}</span>`
    });

  $it('inner array instance change followed by array mutation - identity VC',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, identityExpected, 'initial');
      ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `<span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>`, 'after change');
      ctx.app.arr.push(25, 30);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `<span>0</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>`, 'after change');
    },
    {
      template: `<span repeat.for="item of arr | identity">\${item}</span>`
    });

  $it('change to inner array - oddEven VC',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, evenExpected, 'initial');
      ctx.app.arr.push(11, 12);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `${evenExpected}<span>12</span>`, 'after mutation #1');
      ctx.app.arr.push(13, 14);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `${evenExpected}<span>12</span><span>14</span>`, 'after mutation #2');
    },
    {
      template: `<span repeat.for="item of arr | oddEven:true">\${item}</span>`
    });

  $it('inner array instance change - oddEven VC',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, evenExpected, 'initial');
      ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `<span>0</span><span>10</span><span>20</span>`, 'after change');
      ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 7);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `<span>0</span><span>14</span><span>28</span>`, 'after change');
    },
    {
      template: `<span repeat.for="item of arr | oddEven:true">\${item}</span>`
    });

  $it('change to VC arg - oddEven VC',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, evenExpected, 'initial');
      ctx.app.$controller.scope.overrideContext.even = false;
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, oddExpected, 'after change in VC arg');
    },
    {
      template: `<let even.bind="true"></let><span repeat.for="item of arr | oddEven:even">\${item}</span>`
    });

  $it('change to inner array - oddEven VC - multipleOf VC',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, '<span>6</span>', 'initial');
      ctx.app.arr.push(11, 12);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, '<span>6</span><span>12</span>', 'after mutation #1');
      ctx.app.arr.push(13, 14, 18, 19);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, '<span>6</span><span>12</span><span>18</span>', 'after mutation #2');
    },
    {
      template: `<span repeat.for="item of arr | oddEven:true | multipleOf:3">\${item}</span>`
    });

  $it('inner array instance change - oddEven VC - multipleOf VC',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, '<span>6</span>', 'initial');
      ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 11);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, '<span>12</span><span>18</span>', 'after change');
      ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 21);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, '<span>24</span><span>30</span>', 'after change');
    },
    {
      template: `<span repeat.for="item of arr | oddEven:true | multipleOf:3">\${item}</span>`
    });

  $it('change to VC arg - oddEven VC - multipleOf VC',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, '<span>3</span><span>9</span>', 'initial');
      const oc = ctx.app.$controller.scope.overrideContext;
      oc.even = true;
      oc.n = 4;
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, '<span>4</span><span>8</span>', 'after change in VC arg');
    },
    {
      template: `<let even.bind="false" n.bind="3"></let><span repeat.for="item of arr | oddEven:even | multipleOf:n">\${item}</span>`
    });

  $it('change to inner array - noop BB',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, identityExpected, 'initial');
      ctx.app.arr.push(11);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `${identityExpected}<span>11</span>`, 'after mutation');
    },
    {
      template: `<span repeat.for="item of arr | noop">\${item}</span>`
    });

  $it('inner array instance change - noop BB',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, identityExpected, 'initial');
      ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `<span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>`, 'after change');
    },
    {
      template: `<span repeat.for="item of arr | noop">\${item}</span>`
    });

  $it('change to inner array - oddEven VC - multipleOf VC - noop BB',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, '<span>6</span>', 'initial');
      ctx.app.arr.push(11, 12);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, '<span>6</span><span>12</span>', 'after mutation #1');
      ctx.app.arr.push(13, 14, 18, 19);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, '<span>6</span><span>12</span><span>18</span>', 'after mutation #2');
    },
    {
      template: `<span repeat.for="item of arr | oddEven:true | multipleOf:3 & noop">\${item}</span>`
    });

  $it('inner array instance change - oddEven VC - multipleOf VC - noop BB',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, '<span>6</span>', 'initial');
      ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 11);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, '<span>12</span><span>18</span>', 'after change');
      ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 21);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, '<span>24</span><span>30</span>', 'after change');
    },
    {
      template: `<span repeat.for="item of arr | oddEven:true | multipleOf:3 & noop">\${item}</span>`
    });

  $it('change to VC arg - oddEven VC - multipleOf VC - noop BB',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, '<span>3</span><span>9</span>', 'initial');
      const oc = ctx.app.$controller.scope.overrideContext;
      oc.even = true;
      oc.n = 4;
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, '<span>4</span><span>8</span>', 'after change in VC arg');
    },
    {
      template: `<let even.bind="false" n.bind="3"></let><span repeat.for="item of arr | oddEven:even | multipleOf:n & noop">\${item}</span>`
    });

  $it('inner array instance change - array reverse - oddEven VC',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, '<span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>', 'initial');
      ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `<span>20</span><span>10</span><span>0</span>`, 'after change');
      ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 7);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `<span>28</span><span>14</span><span>0</span>`, 'after change');
    },
    {
      template: `<span repeat.for="item of arr.reverse() | oddEven:true">\${item}</span>`
    });

  $it('inner array instance change - array slice - oddEven VC',
    async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, '<span>2</span><span>4</span>', 'initial');
      ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `<span>0</span><span>10</span>`, 'after change');
      ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 7);
      await ctx.platform.domWriteQueue.yield();
      assert.html.innerEqual(host, `<span>0</span><span>14</span>`, 'after change');
    },
    {
      template: `<span repeat.for="item of arr.slice(0, 4) | oddEven:true">\${item}</span>`
    });
});
