import {
  assert,
  createFixture,
  eachCartesianJoin,
  TestContext,
} from '@aurelia/testing';
import {
  Constructable,
} from '@aurelia/kernel';
import {
  ValueConverter,
} from '@aurelia/runtime-html';

describe('3-runtime-html/array-length-observer.spec.ts', function () {

  interface IArrayLengthTestCase<T extends IApp = IApp> {
    title: string;
    template: string;
    only?: boolean;
    vm?: Constructable<T>;
    assertFn: AssertionFn;
    afterAssertFn?: AssertionFn;
  }

  interface AssertionFn<T extends IApp = IApp> {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    (ctx: TestContext, testHost: HTMLElement, component: T): void | Promise<void>;
  }

  interface IApp {
    [key: string]: any;
    items: IAppItem[];
    logs: string[];
  }

  interface IAppItem {
    name: string;
    value: number;
    isDone?: boolean;
  }

  class TestClass implements IApp {
    public items: IAppItem[] = Array.from({ length: 10 }, (_, idx) => {
      return { name: `i-${idx}`, value: idx + 1 };
    });

    public logs: string[] = [];

    public logChange(e: InputEvent) {
      this.logs.push((e.target as HTMLInputElement).value);
    }
  }

  const collectionLengthBindingTestCases: IArrayLengthTestCase[] = [
    {
      title: 'works in basic scenario',
      template: `<input value.bind="items.length | number" input.trigger="logChange($event)" />`,
      vm: TestClass,
      assertFn: (ctx, host, component) => {
        const inputEl = host.querySelector('input');
        assert.strictEqual(inputEl.value, '10');

        inputEl.value = '00';
        inputEl.dispatchEvent(new ctx.CustomEvent('input'));

        assert.strictEqual(component.items.length, 0);
        assert.deepStrictEqual(component.logs, ['00']);
        assert.strictEqual(inputEl.value, '00');
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(inputEl.value, '0');

        component.items.push({ name: 'i-0', value: 1 });
        assert.strictEqual(inputEl.value, '0');
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(inputEl.value, '1');

        inputEl.value = 'aa';
        inputEl.dispatchEvent(new ctx.CustomEvent('input'));
        assert.strictEqual(component.items.length, 1);
        assert.deepStrictEqual(component.logs, ['00', 'aa']);
        assert.strictEqual(inputEl.value, 'aa');
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(inputEl.value, 'aa');
      },
    },
  ];

  eachCartesianJoin(
    [collectionLengthBindingTestCases],
    ({ only, title, template, vm, assertFn }: IArrayLengthTestCase) => {
      // eslint-disable-next-line mocha/no-exclusive-tests
      const $it = (title_: string, fn: Mocha.Func) => only ? it.only(title_, fn) : it(title_, fn);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      $it(title, async function () {
        const { ctx, component, appHost, startPromise, tearDown } = createFixture<any>(
          template,
          vm,
          [
            ValueConverter.define('number', class NumberVc {
              public fromView(v: unknown) {
                return Number(v);
              }
            }),
          ],
        );
        await startPromise;
        await assertFn(ctx, appHost, component);
        // test cases could be sharing the same context document
        // so wait a bit before running the next test
        await tearDown();
      });
    }
  );
});
