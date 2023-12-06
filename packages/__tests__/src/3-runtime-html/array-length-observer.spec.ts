import {
  ValueConverter,
} from '@aurelia/runtime-html';
import {
  assert,
  createFixture,
} from '@aurelia/testing';

describe('3-runtime-html/array-length-observer.spec.ts', function () {
  const NumberVc = ValueConverter.define('number', class NumberVc {
    public fromView(v: unknown) {
      return Number(v);
    }
  });

  it('works when bound with input number', function () {
    const { getBy, component, type, flush } = createFixture(
      `<input value.bind="items.length | number" input.trigger="logChange($event)" />`,
      class TestClass {
        items = Array.from({ length: 10 }, (_, idx) => {
          return { name: `i-${idx}`, value: idx + 1 };
        });

        logs: string[] = [];

        logChange(e: InputEvent) {
          this.logs.push((e.target as HTMLInputElement).value);
        }
      },
      [NumberVc]
    );

    const inputEl = getBy('input');
    assert.strictEqual(inputEl.value, '10');

    type('input', '00');

    assert.strictEqual(component.items.length, 0);
    assert.deepStrictEqual(component.logs, ['00']);
    assert.strictEqual(inputEl.value, '00');
    flush();
    assert.strictEqual(inputEl.value, '0');

    component.items.push({ name: 'i-0', value: 1 });
    assert.strictEqual(inputEl.value, '0');
    flush();
    assert.strictEqual(inputEl.value, '1');

    // todo: issues with not being able to catch error in chrome
    //       both local and CI, it's an invalid scenario so have it a todo first
    // type('input', 'aa');
    // assert.strictEqual(component.items.length, 1);
    // assert.deepStrictEqual(component.logs, ['00', 'aa']);
    // assert.strictEqual(inputEl.value, 'aa');
    // flush();
    // assert.strictEqual(inputEl.value, 'aa');
  });

  it('notifies subscribers of the owning array', function () {
    const { assertText, type } = createFixture(
      '<input value.bind="items.length | number"><div repeat.for="i of items">${i}',
      class {
        items = [1, 2, 3];
      },
      [NumberVc]
    );

    assertText('123');

    type('input', '2');
    assertText('12');

    type('input', '3');
    assertText('12');

    type('input', '1');
    assertText('1');
  });
});
