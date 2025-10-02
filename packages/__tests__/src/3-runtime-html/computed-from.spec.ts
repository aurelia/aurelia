import { computedFrom, runTasks } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/computed-from.spec.ts', function () {
  describe('async', function () {
    it('works with normal property dependency', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          message = 'Hello Aurelia 2!';
          @computedFrom('message')
          get computedMessage() {
            i++;
            return `${this.message}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.message = 'Hey';
      assert.strictEqual(i, 1);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 3, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);
    });

    it('works with [multiple] normal property dependency', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          m1 = 'Hello';
          m2 = 'Aurelia 2!';

          @computedFrom('m1', 'm2')
          get computedMessage() {
            i++;
            return `${this.m1} ${this.m2}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.m1 = 'Hey';
      component.m2 = 'there';
      assert.strictEqual(i, 1);
      runTasks();
      assertText('Hey there!!!');
      assert.strictEqual(i, 3, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);
    });

    it('works with symbol property dependency', function () {
      let i = 0;
      const sym1 = Symbol('sym1');
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          [sym1] = 'Hello Aurelia 2!';

          @computedFrom(sym1)
          get computedMessage() {
            i++;
            return `${this[sym1]}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component[sym1] = 'Hey';
      assert.strictEqual(i, 1);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 3, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);
    });

    it('works with getter dependency', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          value = 1;
          get message() {
            return `Hello Aurelia ${this.value}!`;
          }

          @computedFrom('message')
          get computedMessage() {
            i++;
            return `${this.message}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 1!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.value = 2;
      assert.strictEqual(i, 1);
      runTasks();
      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 3, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);
    });

    it('works with deep property dependency', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };

          @computedFrom('obj.message')
          get computedMessage() {
            i++;
            return `${this.obj.message}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.obj.message = 'Hey';
      assert.strictEqual(i, 1);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 3, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);
    });

    it('works with deep property dependency where intermediate object is replaced', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };
          @computedFrom('obj.message')
          get computedMessage() {
            i++;
            return `${this.obj.message}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.obj = { message: 'Hey' };
      assert.strictEqual(i, 1);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 3, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);
    });

    it('does not observe old dependencies when dependencies change', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };

          @computedFrom('obj.message')
          get computedMessage() {
            i++;
            return `${this.obj.message}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      const obj1 = component.obj;
      component.obj = { message: 'Hey' };
      assert.strictEqual(i, 1);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 3, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);

      obj1.message = 'Hola';
      assert.strictEqual(i, 3);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 3, `should not have called getter again`);
    });
  });

  describe('sync', function () {
    it('works with normal property dependency', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          message = 'Hello Aurelia 2!';
          @computedFrom({
            dependencies: ['message'],
            options: { flush: 'sync' }
          })
          get computedMessage() {
            i++;
            return `${this.message}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.message = 'Hey';
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes`);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 3, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);
    });

    it('works with [multiple] normal property dependency', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          m1 = 'Hello';
          m2 = 'Aurelia 2!';

          @computedFrom({
            dependencies: ['m1', 'm2'],
            options: { flush: 'sync' }
          })
          get computedMessage() {
            i++;
            return `${this.m1} ${this.m2}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.m1 = 'Hey';
      component.m2 = 'there';
      assert.strictEqual(i, 3, `1 initial + 2nd when m1 changes + 3rd when m2 changes`);
      runTasks();
      assertText('Hey there!!!');
      assert.strictEqual(i, 4, `1 initial + 2nd when m1 changes + 3rd when m2 changes + 4th when binding evaluates`);
    });

    it('works with symbol property dependency', function () {
      let i = 0;
      const sym1 = Symbol('sym1');
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          [sym1] = 'Hello Aurelia 2!';

          @computedFrom({
            dependencies: [sym1],
            options: { flush: 'sync' }
          })
          get computedMessage() {
            i++;
            return `${this[sym1]}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component[sym1] = 'Hey';
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes`);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 3, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);
    });

    it('works with getter dependency', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          value = 1;
          get message() {
            return `Hello Aurelia ${this.value}!`;
          }

          @computedFrom({
            dependencies: ['message'],
            options: { flush: 'sync' }
          })
          get computedMessage() {
            i++;
            return `${this.message}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 1!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.value = 2;
      // getter doesn't announce change immediately by default
      assert.strictEqual(i, 1);
      runTasks();
      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 3);
    });

    it('works with deep property dependency', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };

          @computedFrom({
            dependencies: ['obj.message'],
            options: { flush: 'sync' }
          })
          get computedMessage() {
            i++;
            return `${this.obj.message}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.obj.message = 'Hey';
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes`);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 3, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);
    });

    it('works with deep property dependency where intermediate object is replaced', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };
          @computedFrom({
            dependencies: ['obj.message'],
            options: { flush: 'sync' }
          })
          get computedMessage() {
            i++;
            return `${this.obj.message}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.obj = { message: 'Hey' };
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes`);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 3, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);
    });

    it('does not observe old dependencies when dependencies change', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };

          @computedFrom({
            dependencies: ['obj.message'],
            options: { flush: 'sync' }
          })
          get computedMessage() {
            i++;
            return `${this.obj.message}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2!!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      const obj1 = component.obj;
      component.obj = { message: 'Hey' };
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes`);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 3, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);

      obj1.message = 'Hola';
      assert.strictEqual(i, 3);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 3, `should not have called getter again`);
    });
  });
});
