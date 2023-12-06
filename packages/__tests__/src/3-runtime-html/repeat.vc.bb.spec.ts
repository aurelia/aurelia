import { IContainer } from '@aurelia/kernel';
import { valueConverter, bindingBehavior, Aurelia, CustomElement, ICustomElementController, IPlatform } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext, TestFunction } from '../util.js';

describe('3-runtime-html/repeat.vc.bb.spec.ts', function () {
  interface TestSetupContext {
    template: string;
    registrations: any[];
  }
  class RepeaterTestExecutionContext implements TestExecutionContext<any> {
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
    testFunction: TestFunction<RepeaterTestExecutionContext>,
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
          MapOddEvenValueConverter,
        )
        .app({
          host,
          component: CustomElement.define({ name: 'app', template }, App)
        })
        .start();
      app = au.root.controller.viewModel as App;
    } catch (e) {
      error = e;
    }

    assert.strictEqual(error, null);

    await testFunction(new RepeaterTestExecutionContext(ctx, au, container, host, app, error));

    if (error === null) {
      await au.stop();
    }
    ctx.doc.body.removeChild(host);
  }
  const $it = createSpecFunction(testRepeaterVC);

  class App {
    public arr: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
    public set: Set<number> = new Set(this.arr);
    public mapSimple: Map<string, number> = new Map<string, number>([['a', 1], ['b', 2], ['c', 3], ['d', 4]]);
    public mapComplex: Map<string, number[]> = new Map<string, number[]>([['a', [11, 12, 13, 14]], ['b', [21, 22, 23, 24]]]);
    public readonly $controller!: ICustomElementController<this>;
    public getArr(): number[] { return this.arr; }
  }

  @valueConverter('identity')
  class IdentityValueConverter {
    public toView(value: unknown[]) {
      return value;
    }
  }

  @valueConverter('oddEven')
  class OddEvenValueConverter {
    public toView(value: number[] | Set<number>, even: boolean) {
      return (value instanceof Set ? Array.from(value) : value).filter((v) => v % 2 === (even ? 0 : 1));
    }
  }

  @valueConverter('mapOddEven')
  class MapOddEvenValueConverter {
    public toView(value: Map<string, number>, even: boolean) {
      const map = new Map<string, number>();
      for (const [k, v] of value) {
        if (v % 2 === (even ? 0 : 1)) {
          map.set(k, v);
        }
      }
      return map;
    }
  }

  @valueConverter('multipleOf')
  class MultipleOfValueConverter {
    public toView(value: number[], n: number) {
      return value.filter((v) => v % n === 0);
    }
  }

  @bindingBehavior('noop')
  class NoopBindingBehavior { }

  const identityExpected = Array.from({ length: 10 }, (_, i) => `<span>${i + 1}</span>`).join('');
  const oddExpected = Array.from({ length: 10 }, (_, i) => i % 2 === 0 ? `<span>${i + 1}</span>` : '').join('');
  const evenExpected = Array.from({ length: 10 }, (_, i) => i % 2 === 1 ? `<span>${i + 1}</span>` : '').join('');

  type Change = [change: (ctx: RepeaterTestExecutionContext) => void | Promise<void>, expected: string];

  class TestData {
    public readonly changes: Change[];
    public readonly name: string;
    public readonly only: boolean = false;
    public constructor(
      arg: string | [name: string, only: boolean],
      public readonly template: string,
      public readonly expectedInitial: string,
      ...changes: Change[]
    ) {
      if (typeof arg === 'string') {
        this.name = arg;
      } else {
        [this.name, this.only] = arg;
      }
      this.changes = changes;
    }
  }

  function* getTestData() {
    const identityArrTmplt = `<span repeat.for="item of arr | identity">\${item}</span>`;
    yield new TestData(
      'array mutation - identity VC',
      identityArrTmplt,
      identityExpected,
      [(ctx) => { ctx.app.arr.push(11); }, `${identityExpected}<span>11</span>`],
      [(ctx) => { ctx.app.arr.unshift(12); }, `<span>12</span>${identityExpected}<span>11</span>`],
      [(ctx) => { ctx.app.arr.pop(); }, `<span>12</span>${identityExpected}`],
      [(ctx) => { ctx.app.arr.shift(); }, identityExpected],
    );
    yield new TestData(
      'array instance change - identity VC',
      identityArrTmplt,
      identityExpected,
      [
        (ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5); },
        `<span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>`
      ],
    );
    yield new TestData(
      'array instance change -> array mutation - identity VC',
      identityArrTmplt,
      identityExpected,
      [
        (ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5); },
        `<span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>`
      ],
      [
        (ctx) => { ctx.app.arr.push(25, 30); },
        `<span>0</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>`
      ],
    );

    const oeVcTrueTmplt = `<span repeat.for="item of arr | oddEven:true">\${item}</span>`;
    yield new TestData(
      'array mutation - oddEven VC',
      oeVcTrueTmplt,
      evenExpected,
      [(ctx) => { ctx.app.arr.push(11, 12); }, `${evenExpected}<span>12</span>`],
      [(ctx) => { ctx.app.arr.unshift(14, 13); }, `<span>14</span>${evenExpected}<span>12</span>`],
      [(ctx) => { ctx.app.arr.pop(); }, `<span>14</span>${evenExpected}`],
      [(ctx) => { ctx.app.arr.shift(); }, evenExpected],
    );

    yield new TestData(
      'array instance change - oddEven VC',
      oeVcTrueTmplt,
      evenExpected,
      [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5); }, `<span>0</span><span>10</span><span>20</span>`],
      [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 7); }, `<span>0</span><span>14</span><span>28</span>`],
    );

    yield new TestData(
      'change to VC arg - oddEven VC',
      `<let even.bind="true"></let><span repeat.for="item of arr | oddEven:even">\${item}</span>`,
      evenExpected,
      [(ctx) => { ctx.app.$controller.scope.overrideContext.even = false; }, oddExpected,],
    );

    const twoVcTmplt = `<span repeat.for="item of arr | oddEven:true | multipleOf:3">\${item}</span>`;
    yield new TestData(
      'array mutation - oddEven VC - multipleOf VC',
      twoVcTmplt,
      '<span>6</span>',
      [(ctx) => { ctx.app.arr.push(11, 12); }, '<span>6</span><span>12</span>',],
      [(ctx) => { ctx.app.arr.unshift(18, 19, 13, 14); }, '<span>18</span><span>6</span><span>12</span>',],
      [(ctx) => { ctx.app.arr.pop(); }, '<span>18</span><span>6</span>',],
      [(ctx) => { ctx.app.arr.shift(); }, '<span>6</span>',],
    );

    yield new TestData(
      'array instance change - oddEven VC - multipleOf VC',
      twoVcTmplt,
      '<span>6</span>',
      [(ctx) => { ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 11); }, '<span>12</span><span>18</span>',],
      [(ctx) => { ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 21); }, '<span>24</span><span>30</span>',],
    );

    yield new TestData(
      'change to VC arg - oddEven VC - multipleOf VC',
      `<let even.bind="false" n.bind="3"></let><span repeat.for="item of arr | oddEven:even | multipleOf:n">\${item}</span>`,
      '<span>3</span><span>9</span>',
      [
        (ctx) => {
          const oc = ctx.app.$controller.scope.overrideContext;
          oc.even = true;
          oc.n = 4;
        },
        '<span>4</span><span>8</span>',
      ],
    );

    const noopBBTmplt = `<span repeat.for="item of arr & noop">\${item}</span>`;
    yield new TestData(
      'array mutation - noop BB',
      noopBBTmplt,
      identityExpected,
      [(ctx) => { ctx.app.arr.push(11); }, `${identityExpected}<span>11</span>`,],
    );
    yield new TestData(
      'array instance change - noop BB',
      noopBBTmplt,
      identityExpected,
      [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5); }, `<span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>`,],
    );

    const twoVcBBTmplt = `<span repeat.for="item of arr | oddEven:true | multipleOf:3 & noop">\${item}</span>`;
    yield new TestData(
      'array mutation - oddEven VC - multipleOf VC - noop BB',
      twoVcBBTmplt,
      '<span>6</span>',
      [(ctx) => { ctx.app.arr.push(11, 12); }, '<span>6</span><span>12</span>',],
      [(ctx) => { ctx.app.arr.push(13, 14, 18, 19); }, '<span>6</span><span>12</span><span>18</span>',],
    );
    yield new TestData(
      'array instance change - oddEven VC - multipleOf VC - noop BB',
      twoVcBBTmplt,
      '<span>6</span>',
      [(ctx) => { ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 11); }, '<span>12</span><span>18</span>',],
      [(ctx) => { ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 21); }, '<span>24</span><span>30</span>',],
    );

    yield new TestData(
      'change to VC arg - oddEven VC - multipleOf VC - noop BB',
      `<let even.bind="false" n.bind="3"></let><span repeat.for="item of arr | oddEven:even | multipleOf:n & noop">\${item}</span>`,
      '<span>3</span><span>9</span>',
      [
        (ctx) => {
          const oc = ctx.app.$controller.scope.overrideContext;
          oc.even = true;
          oc.n = 4;
        },
        '<span>4</span><span>8</span>',
      ],
    );

    yield new TestData(
      'array instance change - array reverse - oddEven VC',
      `<span repeat.for="item of arr.reverse() | oddEven:true">\${item}</span>`,
      '<span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>',
      [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5); }, `<span>20</span><span>10</span><span>0</span>`,],
      [(ctx) => { ctx.app.arr = [...ctx.app.arr, 42]; }, `<span>42</span><span>20</span><span>10</span><span>0</span>`,],
      [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 7); }, `<span>28</span><span>14</span><span>0</span>`,],
    );

    yield new TestData(
      'array instance change - array slice - oddEven VC',
      `<let end.bind="4"></let><span repeat.for="item of arr.slice(0, end) | oddEven:true">\${item}</span>`,
      '<span>2</span><span>4</span>',
      [(ctx) => { ctx.app.$controller.scope.overrideContext.end = 6; }, '<span>2</span><span>4</span><span>6</span>',],
      [(ctx) => { ctx.app.$controller.scope.overrideContext.end = 4; }, '<span>2</span><span>4</span>',],
      [(ctx) => { ctx.app.arr = Array.from({ length: 6 }, (_, i) => i * 5); }, `<span>0</span><span>10</span>`,],
      [(ctx) => { ctx.app.arr = [42, 43, ...ctx.app.arr]; }, `<span>42</span><span>0</span>`,],
      [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 7); }, `<span>0</span><span>14</span>`,],
    );

    yield new TestData(
      'array mutation - array reverse - oddEven VC',
      `<span repeat.for="item of arr.reverse() | oddEven:true">\${item}</span>`,
      '<span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>',
      [(ctx) => { ctx.app.arr.push(42); }, `<span>42</span><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>`,],
      [(ctx) => { ctx.app.arr.push(48); }, `<span>48</span><span>42</span><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>`,],
      [(ctx) => { ctx.app.arr.pop(); }, `<span>42</span><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>`,],
      [(ctx) => { ctx.app.arr.pop(); }, `<span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>`,],
    );

    yield new TestData(
      'array mutation + instance change - array reverse - oddEven VC',
      `<span repeat.for="item of arr.reverse() | oddEven:true">\${item}</span>`,
      '<span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>',
      [(ctx) => { ctx.app.arr.push(42); }, `<span>42</span><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>`,],
      [(ctx) => { ctx.app.arr = [...ctx.app.arr, 48]; }, `<span>48</span><span>42</span><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>`,],
      [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 7); }, `<span>28</span><span>14</span><span>0</span>`,],
      [(ctx) => { ctx.app.arr.push(42); }, `<span>42</span><span>28</span><span>14</span><span>0</span>`,],
      [(ctx) => { ctx.app.arr.splice(ctx.app.arr.length - 1, 1, 44); }, `<span>44</span><span>28</span><span>14</span><span>0</span>`,],
    );

    yield new TestData(
      'array mutation + instance change - array sort - oddEven VC',
      `<let fn.bind="undefined"></let><span repeat.for="item of arr.sort(fn) | oddEven:true">\${item}</span>`,
      // Because: The default sort order is ascending, built upon converting the elements into strings, then comparing their sequences of UTF-16 code units values (refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).
      '<span>10</span><span>2</span><span>4</span><span>6</span><span>8</span>',
      [(ctx) => { ctx.app.$controller.scope.overrideContext.fn = (a: number, b: number) => b - a; }, '<span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>',],
      [(ctx) => { ctx.app.arr.push(42, 48); }, '<span>48</span><span>42</span><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>',],
      [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 7); }, '<span>28</span><span>14</span><span>0</span>',],
      [(ctx) => { ctx.app.$controller.scope.overrideContext.fn = (a: number, b: number) => a - b; }, '<span>0</span><span>14</span><span>28</span>',],
      [(ctx) => { ctx.app.arr.push(24); }, '<span>0</span><span>14</span><span>24</span><span>28</span>',],
    );

    yield new TestData(
      'set mutation + instance change - oddEven VC',
      `<span repeat.for="item of set | oddEven:true">\${item}</span>`,
      evenExpected,
      [(ctx) => { const set = ctx.app.set; set.add(10); set.add(11); set.add(12); }, `${evenExpected}<span>12</span>`,],
      [(ctx) => { const set = ctx.app.set; set.delete(2); set.delete(4); }, '<span>6</span><span>8</span><span>10</span><span>12</span>',],
      [(ctx) => { ctx.app.set = new Set(Array.from({ length: 5 }, (_, i) => i * 7)); }, '<span>0</span><span>14</span><span>28</span>',],
      [(ctx) => { const set = ctx.app.set; set.add(28); set.add(10); set.add(12); }, '<span>0</span><span>14</span><span>28</span><span>10</span><span>12</span>',],
      [(ctx) => { const set = ctx.app.set; set.delete(14); set.delete(28); }, '<span>0</span><span>10</span><span>12</span>',],
    );

    yield new TestData(
      'mapSimple mutation + instance change - oddEven VC',
      `<span repeat.for="item of mapSimple | mapOddEven:true">\${item[0]}:\${item[1]}</span>`,
      '<span>b:2</span><span>d:4</span>',
      [(ctx) => { const map = ctx.app.mapSimple; map.set('e', 6); map.set('f', 5); }, '<span>b:2</span><span>d:4</span><span>e:6</span>',],
      [(ctx) => { const map = ctx.app.mapSimple; map.set('a', 12); map.delete('b'); }, '<span>a:12</span><span>d:4</span><span>e:6</span>',],
      [(ctx) => { ctx.app.mapSimple = new Map<string, number>([['a', 12], ['b', 13], ['c', 14], ['d', 15]]); }, '<span>a:12</span><span>c:14</span>',],
      [(ctx) => { const map = ctx.app.mapSimple; map.set('e', 6); map.set('f', 5); }, '<span>a:12</span><span>c:14</span><span>e:6</span>',],
      [(ctx) => { const map = ctx.app.mapSimple; map.set('a', 42); map.delete('c'); }, '<span>a:42</span><span>e:6</span>',],
    );

    yield new TestData(
      'mapComplex - oddEven VC',
      `<span repeat.for="item of mapComplex">\${item[0]}: <template repeat.for="i of item[1] | oddEven:$index % 2===0">\${i} </template></span>`,
      '<span>a: 12 14 </span><span>b: 21 23 </span>',
      [
        (ctx) => { const map = ctx.app.mapComplex; map.set('d', [31, 32, 33, 34]); map.get('a').push(15, 16); },
        '<span>a: 12 14 16 </span><span>b: 21 23 </span><span>d: 32 34 </span>',
      ],
      [
        (ctx) => { const map = ctx.app.mapComplex; map.delete('b'); map.get('d').splice(3, 1, 35, 36); },
        '<span>a: 12 14 16 </span><span>d: 31 33 35 </span>',
      ],
    );

    yield new TestData(
      'method call - reference - array mutation - oddEven VC',
      `<span repeat.for="item of getArr() | oddEven:true">\${item}</span>`,
      evenExpected,
      [(ctx) => { ctx.app.arr.push(42); }, `${evenExpected}<span>42</span>`,],
      [(ctx) => { ctx.app.arr.pop(); }, evenExpected,],
      [(ctx) => { ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 11); }, evenExpected,], // because method calla are pure
    );

    yield new TestData(
      'method call + length hack - reference - array mutation - oddEven VC',
      `<span repeat.for="item of getArr() | oddEven:true:arr.length">\${item}</span>`,
      evenExpected,
      [(ctx) => { ctx.app.arr.push(42); }, `${evenExpected}<span>42</span>`,],
      [(ctx) => { ctx.app.arr.pop(); }, evenExpected,],
      [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i + 11); }, '<span>12</span><span>14</span>' ,],
    );
  }

  for (const { name, only, template, expectedInitial, changes } of getTestData()) {
    (only ? $it.only : $it)(name, async function (ctx) {
      const host = ctx.host;
      assert.html.innerEqual(host, expectedInitial, 'initial');
      let i = 1;
      for (const [change, expected] of changes) {
        await change(ctx);
        await ctx.platform.domWriteQueue.yield();
        assert.html.innerEqual(host, expected, `post-mutation#${i++}`);
      }
    }, { template });
  }
});
