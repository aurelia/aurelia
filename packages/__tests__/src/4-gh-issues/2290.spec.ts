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
    Object.defineProperty(textNode, 'textContent', {
      get() {
        return this.value;
      },
      set(value) {
        logs.push('set text');
        this.value = value;
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
    Object.defineProperty(textNode, 'textContent', {
      get() {
        return this.value;
      },
      set(value) {
        logs.push('set text');
        this.value = value;
      },
      configurable: true,
      enumerable: true,
    });
    assertText('hello');
    assert.deepEqual(logs, []);

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
    assertText('hello');
  });

  it('interpolation binding does not update when its controller is deactivating', async function () {
    const { component, assertText } = createFixture(
      '<el if.bind="show"></el>',
      class App {
        message = 'hi';
        show = true;
      },
      [class El {
        static $au = {
          type: 'custom-element',
          name: 'el',
          template: '<div textcontent="my ${prop}"></div>',
        };
        prop = 'hello';

        detaching() {
          this.prop = 'goodbye';
        }
      }]
    );

    assertText('my hello');

    component.show = false;
    const hadTasksPromise = await tasksSettled();
    assert.strictEqual(hadTasksPromise, false);
  });

  it('interpolation binding does not process queued update if its controller is deactivating', async function () {
    const logs = [];
    const { component, assertText, stop } = createFixture(
      '<div ref="div" prop="my ${message}"></div>',
      class App {
        message = '';
        div!: HTMLDivElement;

        bound() {
          // simulate attribute binding
          Object.defineProperty(this.div, 'prop', {
            set: (value) => {
              logs.push('set text');
              this.div.textContent = value;
            },
            configurable: true,
            enumerable: true,
          });
        }

        // need this to delay the deactivation
        detaching() {
          return Promise.resolve();
        }
      },
    );

    component.message = 'hi';
    await Promise.resolve();

    assertText('my hi');
    assert.deepEqual(logs, ['set text']);
    logs.length = 0;

    // stop in the next tick to ensure sure a task is queued from changing .prop
    // and also app is stopped before the queued task is run
    // the queue callback still runs but it won't do anything
    // this needs to combine with the detaching promise above to ensure binding is not yet unbound, only controller is deactivating
    void Promise.resolve().then(() => {
      void stop();
    });
    component.message = 'ho';
    await Promise.resolve();
    assert.deepEqual(logs, []);
  });

  it('let binding does not update when its controller is deactivating', async function () {
    const logs = [];
    const { component } = createFixture(
      '<el if.bind="show"></el>',
      class App {
        show = true;
      },
      [class El {
        static $au = {
          type: 'custom-element',
          name: 'el',
          template: '<let prop.bind="m1 + m2" to-binding-context></let>',
        };

        m1 = 'h1';
        m2 = 'h2';

        set prop(v) {
          logs.push('set prop');
        }

        // need this to delay the deactivation
        detaching() {
          this.m1 = 'h11';
        }
      }]
    );

    assert.deepEqual(logs, ['set prop']);

    component.show = false;

    const hadTasksPromise = await tasksSettled();
    assert.strictEqual(hadTasksPromise, false);
    assert.deepEqual(logs, ['set prop']);
  });
});
