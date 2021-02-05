/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {
  assert,
  createContainer,
  createFixture,
  createObserverLocator,
  createScopeForTest,
} from '@aurelia/testing';
import {
  CustomElement,
  InterpolationBinding,
  Interpolation,
  ConditionalExpression,
  AccessScopeExpression,
  BindingMode,
  LifecycleFlags,
  SVGAnalyzerRegistration,
  IPlatform,
  ValueConverter,
} from '@aurelia/runtime-html';

type CaseType = {
  expected: number | string;
  expectedStrictMode?: number | string;
  expectedValueAfterChange?: number | string;
  changeFnc?: (val: any, platform: IPlatform) => any;
  app: any;
  interpolation: string;
  it: string;
  only?: boolean;
};

const testDateString = new Date('Sat Feb 02 2002 00:00:00 GMT+0000 (Coordinated Universal Time)').toString();
const ThreeHoursAheadDateString = new Date('Sat Feb 02 2002 03:00:00 GMT+0000 (Coordinated Universal Time)').toString();
const ThreeDaysDateString = new Date('Sat Feb 03 2002 00:00:00 GMT+0000 (Coordinated Universal Time)').toString();
describe('3-runtime/interpolation.spec.ts -- [UNIT]interpolation', function () {
  const cases: CaseType[] = [
    {
      expected: 'wOOt', expectedStrictMode: 'wOOt', app: class { public value?: string | number = 'wOOt'; public value1?: string | number; }, interpolation: `$\{value}`, it: 'Renders expected text'
    },
    {
      expected: '', expectedStrictMode: 'undefined', app: class { public value = undefined; }, interpolation: `$\{value}`, it: 'Undefined value renders nothing'
    },
    {
      expected: 5, expectedStrictMode: 'NaN', app: class { public value1 = undefined; public value = 5; }, interpolation: `$\{value1 + value}`, it: 'Two values one undefined sum correctly'
    },
    {
      expected: -5, expectedStrictMode: 'NaN', app: class { public value = undefined; public value1 = 5; }, interpolation: `$\{value - value1}`, it: 'Two values one undefined minus correctly'
    },
    {
      expected: '', expectedStrictMode: 'null', app: class { isStrictMode = true; public value = null; }, interpolation: `$\{value}`, it: 'Null value renders nothing'
    },
    {
      expected: 5, expectedStrictMode: '5', app: class { public value1 = null; public value = 5; }, interpolation: `$\{value1 + value}`, it: 'Two values one Null sum correctly'
    },
    {
      expected: -5, expectedStrictMode: '-5', app: class { public value = null; public value1 = 5; }, interpolation: `$\{value - value1}`, it: 'Two values one Null minus correctly'
    },
    {
      expected: 'Infinity', expectedStrictMode: 'NaN', expectedValueAfterChange: 5, app: class { public value = undefined; public value1 = 5; }, interpolation: `$\{value1/value}`, it: 'Number divided by undefined is Infinity'
    },
    {
      expected: 1, expectedStrictMode: 1, expectedValueAfterChange: 0.8333333333333334, app: class { public value = 5; public value1 = 5; }, interpolation: `$\{value1/value}`, it: 'Number divided by number works as planned'
    },
    {
      expected: 1, expectedStrictMode: 1, app: class { Math = Math; public value = 1.2; public value1 = 5; }, interpolation: `$\{Math.round(value)}`, it: 'Global Aliasing works'
    },
    {
      expected: 2, expectedStrictMode: 2, app: class { Math = Math; public value = 1.5; public value1 = 5; }, interpolation: `$\{Math.round(value)}`, it: 'Global Aliasing works #2'
    },
    {
      expected: 'true', expectedValueAfterChange: 'false', changeFnc: (val) => !val, app: class { public value = true; }, interpolation: `$\{value}`, it: 'Boolean prints true'
    },
    {
      expected: 'false', expectedValueAfterChange: 'true', changeFnc: (val) => !val, app: class { public value = false; }, interpolation: `$\{value}`, it: 'Boolean prints false'
    },
    {
      expected: 'false', expectedValueAfterChange: 'false', changeFnc: (val) => !val, app: class { public value = false; }, interpolation: `$\{value && false}`, it: 'Boolean prints false with && no matter what'
    },
    {
      expected: 'test',
      app: class { public value = 'test'; },
      interpolation: `$\{true && value}`,
      it: 'Coalesce works properly'
    },
    {
      expected: testDateString,
      expectedValueAfterChange: ThreeDaysDateString,
      changeFnc: (val: Date) => {
        return new Date(ThreeDaysDateString);
      }, app: class { public value = new Date('Sat Feb 02 2002 00:00:00 GMT+0000 (Coordinated Universal Time)'); },
      interpolation: `$\{value}`, it: 'Date works and setDate triggers change properly'
    },
    {
      expected: testDateString,
      expectedStrictMode: `undefined${testDateString}`,
      expectedValueAfterChange: ThreeDaysDateString,
      changeFnc: (val: Date) => {
        return new Date(ThreeDaysDateString);
      }, app: class { public value = new Date('Sat Feb 02 2002 00:00:00 GMT+0000 (Coordinated Universal Time)'); },
      interpolation: `$\{undefined + value}`, it: 'Date works with undefined expression and setDate triggers change properly'
    },
    {
      expected: testDateString,
      expectedStrictMode: `null${testDateString}`,
      expectedValueAfterChange: ThreeDaysDateString,
      changeFnc: (val: Date) => {
        return new Date(ThreeDaysDateString);
      }, app: class { public value = new Date('Sat Feb 02 2002 00:00:00 GMT+0000 (Coordinated Universal Time)'); },
      interpolation: `$\{null + value}`, it: 'Date works with null expression and setDate triggers change properly'
    },
    {
      expected: testDateString,
      expectedValueAfterChange: ThreeHoursAheadDateString,
      changeFnc: (val: Date) => {
        return new Date(ThreeHoursAheadDateString);
      }, app: class { public value = new Date('Sat Feb 02 2002 00:00:00 GMT+0000 (Coordinated Universal Time)'); },
      interpolation: `$\{value}`, it: 'Date works and setHours triggers change properly'
    },
    {
      expected: { foo: 'foo', bar: 'bar' }.toString(),
      expectedValueAfterChange: { foo: 'foo', bar: 'bar', wat: 'wat' }.toString(),
      changeFnc: (val) => {
        val.wat = 'wat';
        return val;
      }, app: class { public value = { foo: 'foo', bar: 'bar', wat: 'wat' }; }, interpolation: `$\{value}`, it: 'Object binding works'
    },
    {
      expected: [0, 1, 2].toString(),
      expectedValueAfterChange: [0, 1, 2, 3].toString(),

      changeFnc: (val) => {
        val.push(3);
        return val;  // Array observation no worky
      }, app: class { public value = [0, 1, 2]; },
      interpolation: `$\{value}`,
      it: 'Array prints comma delimited values and observes push correctly'
    },
    {
      expected: [0, 1, 2].toString(),
      expectedValueAfterChange: [0, 1].toString(),

      changeFnc: (val) => {
        val.pop();
        return val;  // Array observation no worky
      }, app: class { public value = [0, 1, 2]; },
      interpolation: `$\{value}`,
      it: 'Array prints comma delimited values and observes pop correctly'
    },

    {
      expected: [0, 1, 2].toString(),
      expectedValueAfterChange: [0, 2].toString(),

      changeFnc: (val) => {
        val.splice(1, 1);
        return val;  // Array observation no worky
      }, app: class { public value = [0, 1, 2]; },
      interpolation: `$\{value}`,
      it: 'Array prints comma delimited values and observes splice correctly'
    },
    {
      expected: [0, 1, 2].toString(),
      expectedValueAfterChange: [5, 6].toString(),

      changeFnc: () => {
        return [5, 6];
      }, app: class { public value = [0, 1, 2]; },
      interpolation: `$\{value}`,
      it: 'Array prints comma delimited values and observes new array correctly'
    },
    {
      expected: 'test foo out bar',
      expectedValueAfterChange: 'test foo woot out bar',
      changeFnc: (val) => {
        return `${val} woot`;
      }, app: class { public value = 'foo'; public value2 = 'bar'; },
      interpolation: `test $\{value} out $\{value2}`,
      it: 'Multiple statements work in interpolation'
    },
    {
      expected: 'test foo out foo',
      expectedValueAfterChange: 'test foo woot out foo woot',
      changeFnc: (val) => {
        return `${val} woot`;
      }, app: class { public value = 'foo'; },
      interpolation: `test $\{value} out $\{value}`,
      it: 'Multiple SAME statements work in interpolation'
    },
    {
      expected: 'test  out ',
      expectedValueAfterChange: 'test foo out foo',
      changeFnc: () => {
        return 'foo';
      }, app: class { public value: any; },
      interpolation: `test $\{value} out $\{value}`,
      it: 'Multiple SAME statements work in interpolation with undefined'
    },
    {
      expected: 'test  out ',
      expectedValueAfterChange: 'test foo-node out ',
      changeFnc: (_, platform) => {
        const span = platform.document.createElement('span');
        span.appendChild(platform.document.createTextNode('foo-node'));
        return span;
      }, app: class { public value: any; },
      interpolation: `test $\{value} out `,
      it: 'works with HTML Element'
    },
    {
      expected: 'test  out ',
      // special edcase, same node is appended in multiple positions
      // resulting in the last place that uses it wins
      expectedValueAfterChange: 'test  out foo-node',
      changeFnc: (_, platform) => {
        return platform.document.createTextNode('foo-node');
      }, app: class { public value: any; },
      interpolation: `test $\{value} out $\{value}`,
      it: 'Multiple SAME statements work in interpolation with HTML Text'
    },
    {
      expected: 'test 1,2,3 out',
      expectedValueAfterChange: 'test foo-node out',
      changeFnc: (_, platform) => {
        return platform.document.createTextNode('foo-node');
      },
      app: class { public value: any = [1, 2, 3]; },
      interpolation: `test $\{value} out`,
      it: 'changes from array to node',
    },
    {
      expected: 'test foo-node out',
      expectedValueAfterChange: 'test 1,2,3 out',
      changeFnc: (_, platform) => {
        return [1, 2, 3];
      },
      app: class {
        public static get inject() { return [IPlatform]; }
        public value: any;
        public constructor(
          p: IPlatform,
        ) {
          this.value = p.document.createTextNode('foo-node');
        }
      },
      interpolation: `test $\{value} out`,
      it: 'changes from node array',
    }
  ];

  cases.forEach((x) => {
    const $it = x.only ? it.only : it;
    $it(x.it, async function () {
      const { tearDown, appHost } = createFixture(`<template>${x.interpolation}</template>`, x.app);
      assert.strictEqual(appHost.textContent, x.expected.toString(), `host.textContent`);
      await tearDown();
    });
    $it(`${x.it} change tests work`, async function () {
      const { tearDown, appHost, platform, component } = createFixture(`<template>${x.interpolation}</template>`, x.app);
      if (x.changeFnc !== undefined) {
        const val = x.changeFnc(component.value, platform);
        if (val != null) {
          component.value = val;
        }
      } else if (typeof x.expected === 'string' && x.expected !== 'Infinity') {
        component.value = `${component.value || ``}1`;

      } else {
        component.value = (component.value as number || 0) + 1;
      }
      platform.domWriteQueue.flush();
      assert.strictEqual(appHost.textContent, (x.expectedValueAfterChange && x.expectedValueAfterChange.toString()) || (x.expected as number + 1).toString(), `host.textContent`);
      await tearDown();
    });
    if (x.expectedStrictMode) {
      $it(`${x.it} STRICT MODE `, async function () {
        const strict = CustomElement.define({ name: 'strict', template: `${x.interpolation}`, isStrictBinding: true }, x.app);
        const { tearDown, appHost } = createFixture(`<template><strict></strict></template>`, class { }, [strict]);
        assert.strictEqual(appHost.textContent, x.expectedStrictMode.toString(), `host.textContent`);
        await tearDown();
      });
    }
  });

  describe('volatile expressions', function () {
    it('handles single', function () {
      const container = createContainer();
      const observerLocator = createObserverLocator(container);
      const interpolation = new Interpolation(
        ['', ''],
        [new ConditionalExpression(
          new AccessScopeExpression('checked'),
          new AccessScopeExpression('yesMsg'),
          new AccessScopeExpression('noMsg'),
        )]
      );
      const target = { value: '' };
      const binding = new InterpolationBinding(
        observerLocator,
        interpolation,
        target,
        'value',
        BindingMode.toView,
        container,
        {} as any,
      );
      const source = { checked: false, yesMsg: 'yes', noMsg: 'no' };

      let handleChangeCallCount = 0;
      let updateTargetCallCount = 0;

      binding.updateTarget = (updateTarget => {
        return function (...args: unknown[]) {
          updateTargetCallCount++;
          return updateTarget.apply(this, args);
        };
      })(binding.updateTarget);
      binding.partBindings[0].handleChange = (handleChange => {
        return function (...args: unknown[]) {
          handleChangeCallCount++;
          return handleChange.apply(this, args);
        };
      })(binding.partBindings[0].handleChange);
      binding.$bind(LifecycleFlags.fromBind, createScopeForTest(source), null);

      assert.strictEqual(target.value, 'no');
      assert.deepStrictEqual(
        [handleChangeCallCount, updateTargetCallCount],
        [0, 1],
      );

      // inactive branch of conditional shouldn't call handleChange
      source.yesMsg = 'hello';
      assert.deepStrictEqual(
        [handleChangeCallCount, updateTargetCallCount],
        [0, 1],
      );

      source.noMsg = 'hello';
      assert.strictEqual(target.value, 'hello');
      assert.deepStrictEqual(
        [handleChangeCallCount, updateTargetCallCount],
        [1, 2],
      );

      source.yesMsg = 'yes';
      source.checked = true;
      assert.strictEqual(target.value, 'yes');
      assert.deepStrictEqual(
        [handleChangeCallCount, updateTargetCallCount],
        [2, 3],
      );

      source.noMsg = 'no1111';
      assert.strictEqual(target.value, 'yes');
      assert.deepStrictEqual(
        [handleChangeCallCount, updateTargetCallCount],
        [2, 3],
      );
    });

    it('handles multiple', function () {
      const container = createContainer();
      const observerLocator = createObserverLocator(container);
      const interpolation = new Interpolation(
        ['', '--', ''],
        [
          new ConditionalExpression(
            new AccessScopeExpression('checked1'),
            new AccessScopeExpression('yes1'),
            new AccessScopeExpression('no1'),
          ),
          new ConditionalExpression(
            new AccessScopeExpression('checked2'),
            new AccessScopeExpression('yes2'),
            new AccessScopeExpression('no2'),
          )
        ]
      );
      const target = { value: '' };
      const binding = new InterpolationBinding(
        observerLocator,
        interpolation,
        target,
        'value',
        BindingMode.toView,
        container,
        {} as any,
      );
      const source = {
        checked1: false,
        yes1: 'yes1',
        no1: 'no1',
        checked2: false,
        yes2: 'yes2',
        no2: 'no2'
      };

      let handleChange1CallCount = 0;
      let handleChange2CallCount = 0;
      let updateTargetCallCount = 0;

      binding.updateTarget = (updateTarget => {
        return function (...args: unknown[]) {
          updateTargetCallCount++;
          return updateTarget.apply(this, args);
        };
      })(binding.updateTarget);
      binding.partBindings[0].handleChange = (handleChange => {
        return function (...args: unknown[]) {
          handleChange1CallCount++;
          return handleChange.apply(this, args);
        };
      })(binding.partBindings[0].handleChange);
      binding.partBindings[1].handleChange = (handleChange => {
        return function (...args: unknown[]) {
          handleChange2CallCount++;
          return handleChange.apply(this, args);
        };
      })(binding.partBindings[1].handleChange);
      binding.$bind(LifecycleFlags.fromBind, createScopeForTest(source), null);

      assert.strictEqual(target.value, 'no1--no2');
      assert.deepStrictEqual(
        [handleChange1CallCount, handleChange2CallCount, updateTargetCallCount],
        [0, 0, 1],
      );

      // inactive branch of conditional shouldn't call handleChange
      source.yes2 = 'yes22';
      assert.strictEqual(target.value, 'no1--no2');
      assert.deepStrictEqual(
        [handleChange1CallCount, handleChange2CallCount, updateTargetCallCount],
        [0, 0, 1],
      );
      source.yes1 = 'yes11';
      assert.deepStrictEqual(
        [handleChange1CallCount, handleChange2CallCount, updateTargetCallCount],
        [0, 0, 1],
      );

      // reset for next assertion
      source.yes2 = 'yes2';
      source.yes1 = 'yes1';

      source.checked2 = true;
      assert.strictEqual(target.value, 'no1--yes2');
      assert.deepStrictEqual(
        [handleChange1CallCount, handleChange2CallCount, updateTargetCallCount],
        [0, 1, 2],
      );

      source.checked1 = true;
      assert.strictEqual(target.value, 'yes1--yes2');
      assert.deepStrictEqual(
        [handleChange1CallCount, handleChange2CallCount, updateTargetCallCount],
        [1, 1, 3],
      );

      source.no1 = source.no2 = 'hello';
      assert.strictEqual(target.value, 'yes1--yes2');
      assert.deepStrictEqual(
        [handleChange1CallCount, handleChange2CallCount, updateTargetCallCount],
        [1, 1, 3],
      );
    });
  });
});

describe('3-runtime/interpolation.spec.ts', function () {
  it('[Repeat] interpolates expression with value converter that returns HTML nodes', async function () {
    const { tearDown, appHost, ctx, component, startPromise } = createFixture(
      `<template><div repeat.for="item of items">\${item.value | $}</div></template>`,
      class App {
        public items = Array.from({ length: 10 }, (_, idx) => {
          return { value: idx + 1 };
        });
      },
      [
        ValueConverter.define('$', class MoneyValueConverter {
          public static get inject() {
            return [IPlatform];
          }

          public constructor(private readonly p: IPlatform) {}

          public toView(val: string) {
            let num = Number(val);
            num = isNaN(num) ? 0 : num;
            return this.toNode(`<span>$<b>${num}</b></span>`);
          }

          private toNode(html: string) {
            const parser = this.p.document.createElement('div');
            parser.innerHTML = html;
            return parser.firstChild;
          }
        })
      ]
    );
    await startPromise;

    let divs = Array.from(appHost.querySelectorAll('div'));
    assert.strictEqual(divs.length, 10);

    divs.forEach((div, idx) => {
      assert.strictEqual(div.textContent, `$${idx + 1}`);
      const b = div.querySelector('b');
      assert.strictEqual(b.textContent, String(idx + 1));
    });

    component.items = Array.from({ length: 10 }, (_, idx) => {
      return { value: idx + 11 };
    });

    divs = Array.from(appHost.querySelectorAll('div'));
    assert.strictEqual(divs.length, 10);
    divs.forEach((div, idx) => {
      assert.strictEqual(div.textContent, `$${idx + 11}`);
      const b = div.querySelector('b');
      assert.strictEqual(b.textContent, String(idx + 11));
    });
    ctx.platform.domWriteQueue.flush();

    divs.forEach((div, idx) => {
      assert.strictEqual(div.textContent, `$${idx + 11}`);
      const b = div.querySelector('b');
      assert.strictEqual(b.textContent, String(idx + 11));
    });
    assert.strictEqual(appHost.textContent, component.items.map(item => `$${item.value}`).join(''));

    component.items = [];
    divs = Array.from(appHost.querySelectorAll('div'));
    assert.strictEqual(divs.length, 0);
    assert.strictEqual(appHost.textContent, '');

    await tearDown();
    assert.strictEqual(appHost.textContent, '');
  });

  it('[IF/Else] interpolates expression with value converter that returns HTML nodes in <template/>', async function () {
    const { tearDown, appHost, component, startPromise } = createFixture(
      `<template if.bind="show">\${message | $:'if'}</template><template else>\${message | $:'else'}</template>`,
      class App {
        public show = true;
        public message = 'foo';
      },
      [
        ValueConverter.define('$', class MoneyValueConverter {
          public static get inject() {
            return [IPlatform];
          }

          public constructor(private readonly p: IPlatform) {}

          public toView(val: string, prefix: string) {
            return this.toNode(`<${prefix}>${prefix} ${val}</${prefix}>`);
          }

          private toNode(html: string) {
            const parser = this.p.document.createElement('div');
            parser.innerHTML = html;
            return parser.firstChild;
          }
        })
      ]
    );
    await startPromise;
    assert.strictEqual(appHost.textContent, 'if foo');

    component.show = false;

    assert.strictEqual(appHost.textContent, 'else foo');

    await tearDown();
    // when a <template else/> is removed, it doesn't leave any nodes in the appended target
    // so the app host text content is turned back to empty
    assert.strictEqual(appHost.textContent, '');
  });
});

describe('3-runtime/interpolation.spec.ts -- interpolation -- attributes', function () {
  it('interpolates on value attr of <progress/>', async function () {
    const { ctx, component, appHost, startPromise, tearDown } = createFixture(
      `<progress value="\${progress}">`,
      class App {
        public progress = 0;
      },
    );

    await startPromise;
    const progress = appHost.querySelector('progress');
    assert.strictEqual(progress.value, 0);

    component.progress = 1;
    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(progress.value, 1);

    await tearDown();
  });

  it('interpolates value attr of <input />', async function () {
    const { ctx, component, appHost, startPromise, tearDown } = createFixture(
      `<input value="\${progress}">`,
      class App {
        public progress = 0;
      },
    );

    await startPromise;
    const input = appHost.querySelector('input');
    assert.strictEqual(input.value, '0');

    component.progress = 1;
    assert.strictEqual(input.value, '0');
    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(input.value, '1');

    await tearDown();
  });

  it('interpolates value attr of <textarea />', async function () {
    const { ctx, component, appHost, startPromise, tearDown } = createFixture(
      `<textarea value="\${progress}">`,
      class App {
        public progress = 0;
      },
    );

    await startPromise;
    const textArea = appHost.querySelector('textarea');
    assert.strictEqual(textArea.value, '0');

    component.progress = 1;
    assert.strictEqual(textArea.value, '0');
    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(textArea.value, '1');

    await tearDown();
  });

  it('interpolates the xlint:href attr of <use />', async function () {
    const { ctx, component, appHost, startPromise, tearDown } = createFixture(
      `<svg>
        <circle id="blue" cx="5" cy="5" r="40" stroke="blue"/>
        <circle id="red" cx="5" cy="5" r="40" stroke="red"/>
        <use href="#\${progress > 0 ? 'blue' : 'red'}" x="10" fill="blue" />
      `,
      class App {
        public progress = 0;
      },
      [SVGAnalyzerRegistration],
    );

    await startPromise;
    const textArea = appHost.querySelector('use');
    assert.strictEqual(textArea.getAttribute('href'), '#red');

    component.progress = 1;
    assert.strictEqual(textArea.getAttribute('href'), '#red');
    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(textArea.getAttribute('href'), '#blue');

    await tearDown();
  });
});
