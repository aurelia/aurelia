import { assert, createFixture, PLATFORM } from '@aurelia/testing';

describe('3-runtime-html/input.spec.ts', function () {
  const isTestingInNode = PLATFORM.navigator.userAgent.includes('jsdom');

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
});
