import { assert, createFixture } from '@aurelia/testing';
import { isNode } from '../util.js';

describe('3-runtime-html/input.spec.ts', function () {
  const isTestingInNode = isNode();

  it('works: input[text] value.bind', function () {
    const { appHost, component, ctx } = createFixture(
      `<input value.bind="message">`,
      class App {
        public message = 'Hello';
      }
    );

    const input= appHost.querySelector('input');
    assert.strictEqual(input.value, 'Hello');

    input.value = 'world';
    input.dispatchEvent(new ctx.Event('change'));
    assert.strictEqual(component.message, 'world');

    component.message = 'hello world';
    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(input.value, 'hello world');
  });

  if (!isTestingInNode) {
    it('works: input[number] + value-as-number.bind', function () {
      const { appHost, component, ctx } = createFixture(
        `<input type=number value-as-number.bind="count">`,
        class App {
          public count = 0;
        }
      );

      const input= appHost.querySelector('input');
      assert.strictEqual(input.value, '0');
      assert.strictEqual(input.valueAsNumber, 0);

      input.value = '100';
      input.dispatchEvent(new ctx.Event('change'));
      assert.strictEqual(component.count, 100);
    });

    it('treats file input ".bind" to as ".from-view"', function () {
      const { component, ctx } = createFixture(
        `<input type=file files.bind="file">`,
        class App {
          public file = '';
        }
      );

      assert.doesNotThrow(() => {
        component.file = 'c:/my-file.txt';
        ctx.platform.domWriteQueue.flush();
      });
    });

    it('special property valueAsNumber on <input type=number> + bad value', function () {
      const { appHost: host, component: comp, ctx } = createFixture(
        `<input type=number value-as-number.bind="count">`,
        { count: 0 }
      );
      const input = host.querySelector('input');
      assert.strictEqual(input.valueAsNumber, 0);

      input.valueAsNumber = 5;
      input.dispatchEvent(new ctx.CustomEvent('change'));
      assert.strictEqual(comp.count, 5);

      input.valueAsNumber = NaN;
      input.dispatchEvent(new ctx.CustomEvent('change'));
      assert.strictEqual(comp.count, NaN);

      input.valueAsNumber = 'abc' as any;
      input.dispatchEvent(new ctx.CustomEvent('change'));
      assert.strictEqual(comp.count, NaN);

      // reset first
      input.valueAsNumber = 0;
      input.dispatchEvent(new ctx.CustomEvent('change'));
      assert.strictEqual(comp.count, 0);

      // then bogus value
      comp.count = 'abc' as any;
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(input.valueAsNumber, NaN);
      // input.valueAsNumber observer does not propagate the value back
      // this may result in some GH issues
      assert.strictEqual(comp.count, 'abc', 'comp.count === abc');

      input.value = '123';
      input.dispatchEvent(new ctx.CustomEvent('change'));
      assert.strictEqual(comp.count, 123);
    });

    it('special property valueAsNumber on <input type=date>', function () {
      const { appHost: host, component: comp, ctx } = createFixture(
        `<input type=date value-as-number.bind="count">`,
        { count: 0 }
      );
      const input = host.querySelector('input');
      assert.strictEqual(input.valueAsNumber, 0);

      // invalid, though not propagating change to view model just yet
      // because the value of the input hasn't actually been changed in the observer:
      // when adding the first subscriber, input valueAsNumber observer gets its initial value as 0
      // so now, it wouldn't detect any change -> comp.count === undefined
      input.valueAsNumber = 5;
      input.dispatchEvent(new ctx.CustomEvent('change'));
      assert.strictEqual(comp.count, undefined);

      const todayInMs = new Date(2021, 1, 14).getTime();
      // when entering a Date, its YYYY-MM-DD format is used to display
      // unfortunately, this creates a loss, as it's in UTC,
      // and when converting back to number of Ms, it's different with the input
      // so calculating the real value here using the string representation of the date in the <input/>
      // example:       for GMT+11
      // when enter:    input.valueAsNumber = new Date(2021, 01, 14)
      // will display:  13/02/2021
      input.valueAsNumber = todayInMs;
      const actualReturnedTimeInMs = new Date(input.valueAsDate).getTime();
      input.dispatchEvent(new ctx.CustomEvent('change'));
      assert.strictEqual(input.valueAsNumber, actualReturnedTimeInMs, 'input[type=date].valueAsNumber === today_in_ms');
      assert.strictEqual(comp.count, actualReturnedTimeInMs, 'vm.count === today_in_ms');

      input.valueAsNumber = 'abc' as any;
      input.dispatchEvent(new ctx.CustomEvent('change'));
      assert.strictEqual(comp.count, NaN, 'comp.count === NaN when input.valueAsNumber is bogus');

      // then bogus value
      comp.count = 'abc' as any;
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(input.valueAsNumber, NaN);
      // input.valueAsNumber observer does not propagate the value back
      // this may result in some GH issues
      assert.strictEqual(comp.count, 'abc', 'comp.count === abc');
    });
  }

  it('works: textarea + value.bind', function () {
    const { appHost, component, ctx } = createFixture(
      `<textarea value.bind="message">`,
      class App {
        public message = 'Hello';
      }
    );

    const input= appHost.querySelector('textarea');
    assert.strictEqual(input.value, 'Hello');

    input.value = 'world';
    input.dispatchEvent(new ctx.Event('change'));
    assert.strictEqual(component.message, 'world');

    component.message = 'hello world';
    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(input.value, 'hello world');
  });

  it('assigns removes attribute to "minLength", "maxLength" on null/undefined', function () {
    const { assertAttr } = createFixture
      .html`<input minlength.bind="null" maxlength.bind="undefined">`
      .build();

    assertAttr('input', 'minlength', null);
    assertAttr('input', 'maxlength', null);
  });

  it('removes "placeholder" attr on null/undefined', function () {
    const { assertAttr } = createFixture
      .html`<input placeholder.bind="null">`
      .build();

    assertAttr('input', 'placeholder', null);
  });

  it('assigns "size" attr correctly', function () {
    const { assertAttr } = createFixture
      .html`<input size.bind="1">`
      .build();

    assertAttr('input', 'size', '1');
  });

  it('removes "size" attr on null/undefined', function () {
    const { assertAttr } = createFixture
      .html`<input size.bind="null">`
      .build();

    assertAttr('input', 'size', null);
  });

  it('removes "pattern" attr on null/undefined', function () {
    const { assertAttr } = createFixture
      .html`<input pattern.bind="null">`
      .build();

    assertAttr('input', 'pattern', null);
  });

  it('removes "title" attr on null/undefined', function () {
    const { assertAttr } = createFixture
      .html`<input title.bind="null">`
      .build();

    assertAttr('input', 'title', null);
  });

  it('sets popover API attrs', function () {
    const { assertAttr } = createFixture
      .component({ target: 'a', toggle: 'auto' })
      // both button and input will be the same so it's fine
      .html`<input popover="null" popovertarget='\${target}' popovertargetaction=\${toggle}>`
      .build();

    assertAttr('input', 'popovertarget', 'a');
    assertAttr('input', 'popovertargetaction', 'auto');
  });
});
