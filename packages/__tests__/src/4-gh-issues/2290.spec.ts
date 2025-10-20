import { tasksSettled } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';

describe('4-gh-issues/2290.spec.ts', function () {
  it('does not react to property change when owning binding is in deactivation', async function () {
    const { component, assertText } = createFixture(
      '<el if.bind="show">',
      class App {
        show = true;
      },
      [class El {
        static $au = {
          type: 'custom-element',
          name: 'el',
          template: '<div>${text}</div>'
        };
        text = 'hello';

        detaching() {
          this.text = 'goodbye';
        }
      }]
    );

    assertText('hello');

    component.show = false;
    const hadTasksPromise = await tasksSettled();
    assert.strictEqual(hadTasksPromise, false);
  });

  it('does not process queued [change handler] if owner controller is being deactivated', async function () {
    const logs = [];
    const { component, assertText, getBy, stop } = createFixture(
      '<div>${text}</div>',
      class App {
        text = 'hello';

        async detaching() {
          await Promise.resolve();
        }
      },
    );

    const textNode = getBy('div').firstChild as Text;
    const originalTextContent = Object.getOwnPropertyDescriptor(Text.prototype, 'textContent');
    Object.defineProperty(textNode, 'textContent', {
      get() {
        return originalTextContent!.get!.call(this);
      },
      set(value) {
        logs.push('set text');
        originalTextContent!.set!.call(this, value);
      },
      configurable: true,
      enumerable: true,
    });
    assertText('hello');
    logs.length = 0;

    // stop in the next tick to ensure sure a task is queued from changing .text
    // and also app is stopped before the queued task is run
    // the queue callback still runs but it won't do anything
    // this needs to combine with the detaching promise above to ensure binding is not yet unbound, only controller is deactivating
    void Promise.resolve().then(() => {
      void stop();
    });
    component.text = 'hi';
    await Promise.resolve();
    assert.deepEqual(logs, []);
  });

  it('does not react to collection change when owning binding is in deactivation', async function () {
    const { assertText, stop } = createFixture(
      '<div>${text}</div>',
      class App {
        text = ['hello'];

        detaching() {
          this.text.push('goodbye');
        }
      },
    );

    assertText('hello');

    void stop();
    const hadTasksPromise = await tasksSettled();
    assert.strictEqual(hadTasksPromise, false);
  });

  it('does not process queued [collection change handler] if owner controller is being deactivated', async function () {
    const logs = [];
    const { component, assertText, getBy, stop } = createFixture(
      '<div>${text}</div>',
      class App {
        text = ['hello'];

        async detaching() {
          await Promise.resolve();
        }
      },
    );

    const textNode = getBy('div').firstChild as Text;
    const originalTextContent = Object.getOwnPropertyDescriptor(Text.prototype, 'textContent');
    Object.defineProperty(textNode, 'textContent', {
      get() {
        return originalTextContent!.get!.call(this);
      },
      set(value) {
        logs.push('set text');
        originalTextContent!.set!.call(this, value);
      },
      configurable: true,
      enumerable: true,
    });
    assertText('hello');
    logs.length = 0;

    // stop in the next tick to ensure sure a task is queued from changing .text
    // and also app is stopped before the queued task is run
    // the queue callback still runs but it won't do anything
    // this needs to combine with the detaching promise above to ensure binding is not yet unbound, only controller is deactivating
    void Promise.resolve().then(() => {
      void stop();
    });
    component.text.push('hi');
    await Promise.resolve();
    assert.deepEqual(logs, []);
  });
});
