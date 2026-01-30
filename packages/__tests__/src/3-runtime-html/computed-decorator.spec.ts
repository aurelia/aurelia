import { computed, ICoercionConfiguration, runTasks } from '@aurelia/runtime';
import { AppTask, bindable } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/computed-decorator.spec.ts', function () {
  describe('async', function () {
    it('works with normal property dependency', async function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          message = 'Hello Aurelia 2!';
          @computed('message')
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);
    });

    it('works with [multiple] normal property dependency', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          m1 = 'Hello';
          m2 = 'Aurelia 2!';

          @computed('m1', 'm2')
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);
    });

    it('works with symbol property dependency', function () {
      let i = 0;
      const sym1 = Symbol('sym1');
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          [sym1] = 'Hello Aurelia 2!';

          @computed(sym1)
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);
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

          @computed('message')
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);
    });

    it('works with deep property dependency', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };

          @computed('obj.message')
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);
    });

    it('works with deep property dependency where intermediate object is replaced', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };
          @computed('obj.message')
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);
    });

    it('does not observe old dependencies when dependencies change', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };

          @computed('obj.message')
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);

      obj1.message = 'Hola';
      assert.strictEqual(i, 2);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 2, `should not have called getter again`);
    });

    it('stops observing when unbound', function () {
      let i = 0;
      const { component, assertText, stop } = createFixture(
        '${computedMessage}',
        class App {
          message = 'Hello Aurelia 2!';
          @computed('message')
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);

      void stop();

      component.message = 'Hola';
      runTasks();
      assertText('');
      assert.strictEqual(i, 2, `should not have called getter again`);
    });

    it('works with deep option', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { lv1: { message: 'Hello Aurelia 2!' } };

          @computed({
            deps: ['obj'],
            deep: true
          })
          get computedMessage() {
            i++;
            return `${i}!!!`;
          }
        },
      );
      assertText('1!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.obj.lv1.message = 'Hey';
      assert.strictEqual(i, 1);
      runTasks();
      assertText('2!!!');
      assert.strictEqual(i, 2, `2 calls`);

      component.obj.lv1 = { message: 'Hola' };
      assert.strictEqual(i, 2);
      runTasks();
      assertText('3!!!');
      assert.strictEqual(i, 3, `3 calls`);

      component.obj = { lv1: { message: 'Bonjour' } };
      assert.strictEqual(i, 3);
      runTasks();
      assertText('4!!!');
      assert.strictEqual(i, 4, `4 calls`);

      component.obj.lv1.message = 'Ciao';
      assert.strictEqual(i, 4);
      runTasks();
      assertText('5!!!');
      assert.strictEqual(i, 5, `5 calls`);
    });

    it('does not observe properties read in getter', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };
          notObserved = 1;

          @computed('obj')
          get computedMessage() {
            i++;
            return `${this.obj.message} ${this.notObserved}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2! 1!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.notObserved = 2;
      assert.strictEqual(i, 1);
      runTasks();
      assertText('Hello Aurelia 2! 1!!!');
      assert.strictEqual(i, 1, `should not have called getter again`);

      component.obj = { message: 'Hey' };
      assert.strictEqual(i, 1);
      runTasks();
      assertText('Hey 2!!!');
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);
    });

    it('works with @bindable', async function () {
      let i = 0;
      const changeLog: string[][] = [];
      const { component, assertText } = createFixture(
        '<my-app computed-message.bind="message"></my-app>',
        class App {
          message = 'Hello Aurelia 2!';
        },
        [
          class MyApp {
            static $au = {
              name: 'my-app',
              type: 'custom-element',
              template: '<div>${computedMessage}</div>',
            };

            _m = '';
            @bindable()
            @computed('_m')
            get computedMessage() {
              i++;
              return `${this._m}!!!`;
            }

            set computedMessage(v: string) {
              this._m = v;
            }

            computedMessageChanged(newValue: string, oldValue: string) {
              changeLog.push([newValue, oldValue]);
            }
          },
        ],
      );

      assert.strictEqual(i, 1, `should have called getter exactly once`);
      assertText('Hello Aurelia 2!!!!');
      assert.deepStrictEqual(changeLog, []);

      component.message = 'Hey';
      assert.strictEqual(i, 1);
      await Promise.resolve();
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);
      assertText('Hey!!!');
      assert.deepStrictEqual(changeLog, [['Hey!!!', 'Hello Aurelia 2!!!!']]);
    });

    it('works with @bindable and coercion', async function () {
      let i = 0;
      const changeLog: string[][] = [];
      const { component, assertText } = createFixture(
        '<my-app computed-message.bind="message"></my-app>',
        class App {
          message = 'Hello Aurelia 2!';
        },
        [
          AppTask.creating(ICoercionConfiguration, c => {
            c.enableCoercion = true;
          }),
          class MyApp {
            static $au = {
              name: 'my-app',
              type: 'custom-element',
              template: '<div>${computedMessage}</div>',
            };

            _m = '';
            @bindable({ type: class {
              static coerce(value: unknown): string {
                return `${String(value)}$$`;
              }
            } })
            @computed('_m')
            get computedMessage() {
              i++;
              return `${this._m}!!!`;
            }
            set computedMessage(v: string) {
              this._m = v;
            }
            computedMessageChanged(newValue: string, oldValue: string) {
              changeLog.push([newValue, oldValue]);
            }
          },
        ],
      );
      assert.strictEqual(i, 1, `should have called getter exactly once`);
      assertText('Hello Aurelia 2!$$!!!');
      assert.deepStrictEqual(changeLog, []);

      component.message = 'Hey';
      assert.strictEqual(i, 1);
      await Promise.resolve();
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);
      assertText('Hey$$!!!');
      assert.deepStrictEqual(changeLog, [['Hey$$!!!', 'Hello Aurelia 2!$$!!!']]);
    });

    it('automatic getter does not observe dependencies declared in another getter', async function () {
      let computedCallCount = 0;
      let computedCallCount2 = 0;
      const { component } = createFixture(`\${moreText}`, class App {
        prop = 'prop';
        prop1 = ' prop1';

        @computed('prop')
        get text() {
          computedCallCount++;
          return this.prop + this.prop1;
        }

        get moreText() {
          computedCallCount2++;
          return this.text;
        }
      });

      assert.strictEqual(component.moreText, 'prop prop1');
      assert.strictEqual(computedCallCount, 1);
      assert.strictEqual(computedCallCount2, 1);

      component.prop1 = ' new value';
      await Promise.resolve();
      assert.strictEqual(component.moreText, 'prop prop1');
      assert.strictEqual(computedCallCount, 1);
      assert.strictEqual(computedCallCount2, 1);
    });

    it('shouldnt observe anything when deps is intentionally empty', async function () {
      let computedCallCount = 0;
      const { component, assertText } = createFixture(`\${text}`, class App {
        prop = 'prop';
        prop1 = ' prop1';

        @computed({ deps: [] })
        get text() {
          computedCallCount++;
          return this.prop + this.prop1;
        }
      });

      assertText('prop prop1');
      assert.strictEqual(computedCallCount, 1);

      component.prop = 'new prop';
      await Promise.resolve();
      assertText('prop prop1');
      assert.strictEqual(computedCallCount, 1);
      assert.strictEqual(component.text, 'prop prop1');

      component.prop1 = ' new value';
      await Promise.resolve();
      assert.strictEqual(component.text, 'prop prop1');
      assert.strictEqual(computedCallCount, 1);
    });
  });

  describe('sync', function () {
    it('works with normal property dependency', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          message = 'Hello Aurelia 2!';
          @computed({
            deps: ['message'],
            flush: 'sync'
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);
    });

    it('works with [multiple] normal property dependency', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          m1 = 'Hello';
          m2 = 'Aurelia 2!';

          @computed({
            deps: ['m1', 'm2'],
            flush: 'sync'
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
      assert.strictEqual(i, 3, `1 initial + 2nd when m1 changes + 3rd when m2 changes + reuse when binding evaluates`);
    });

    it('works with symbol property dependency', function () {
      let i = 0;
      const sym1 = Symbol('sym1');
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          [sym1] = 'Hello Aurelia 2!';

          @computed({
            deps: [sym1],
            flush: 'sync'
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);
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

          @computed({
            deps: ['message'],
            flush: 'sync'
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
      assert.strictEqual(i, 2);
    });

    it('works with deep property dependency', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };

          @computed({
            deps: ['obj.message'],
            flush: 'sync'
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);
    });

    it('works with deep property dependency where intermediate object is replaced', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };
          @computed({
            deps: ['obj.message'],
            flush: 'sync'
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);
    });

    it('does not observe old dependencies when dependencies change', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };

          @computed({
            deps: ['obj.message'],
            flush: 'sync'
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);

      obj1.message = 'Hola';
      assert.strictEqual(i, 2);
      runTasks();
      assertText('Hey!!!');
      assert.strictEqual(i, 2, `should not have called getter again`);
    });

    it('stops observing when unbound', function () {
      let i = 0;
      const { component, assertText, stop } = createFixture(
        '${computedMessage}',
        class App {
          message = 'Hello Aurelia 2!';
          @computed({
            deps: ['message'],
            flush: 'sync'
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
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + 3rd when binding evaluates`);

      void stop();

      component.message = 'Hola';
      runTasks();
      assertText('');
      assert.strictEqual(i, 2, `should not have called getter again`);
    });

    it('works with deep option', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { lv1: { message: 'Hello Aurelia 2!' } };

          @computed({
            deps: ['obj'],
            deep: true,
            flush: 'sync'
          })
          get computedMessage() {
            i++;
            return `${i}!!!`;
          }
        },
      );
      assertText('1!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.obj.lv1.message = 'Hey';
      assert.strictEqual(i, 2, `1 initial + 2nd when obj.lv1.message changes`);
      runTasks();
      assertText('2!!!');
      assert.strictEqual(i, 2, `1 initial + 2nd when obj.lv1.message changes + reuse when binding evaluates`);

      component.obj.lv1 = { message: 'Hola' };
      assert.strictEqual(i, 3, `1 initial + 2nd when obj.lv1.message changes + 3rd when obj.lv1 changes`);
      runTasks();
      assertText('3!!!');
      assert.strictEqual(i, 3, `1 initial + 2nd when obj.lv1.message changes + 3rd when obj.lv1 changes + reuse when binding evaluates`);

      component.obj = { lv1: { message: 'Bonjour' } };
      assert.strictEqual(i, 4, `1 initial + 2nd when obj.lv1.message changes + 3rd when obj.lv1 changes + 4th when obj changes`);
      runTasks();
      assertText('4!!!');
      assert.strictEqual(i, 4, `1 initial + 2nd when obj.lv1.message changes + 3rd when obj.lv1 changes + 4th when obj changes + reuse when binding evaluates`);

      component.obj.lv1.message = 'Ciao';
      assert.strictEqual(i, 5, `1 initial + 2nd when obj.lv1.message changes + 3rd when obj.lv1 changes + 4th when obj changes + 5th when obj.lv1.message changes`);
      runTasks();
      assertText('5!!!');
      assert.strictEqual(i, 5, `1 initial + 2nd when obj.lv1.message changes + 3rd when obj.lv1 changes + 4th when obj changes + 5th when obj.lv1.message changes + reuse when binding evaluates`);
    });

    it('does not observe properties read in getter', function () {
      let i = 0;
      const { component, assertText } = createFixture(
        '${computedMessage}',
        class App {
          obj = { message: 'Hello Aurelia 2!' };
          notObserved = 1;

          @computed({
            deps: ['obj'],
            flush: 'sync'
          })
          get computedMessage() {
            i++;
            return `${this.obj.message} ${this.notObserved}!!!`;
          }
        },
      );

      assertText('Hello Aurelia 2! 1!!!');
      assert.strictEqual(i, 1, `should have called getter exactly once`);

      component.notObserved = 2;
      assert.strictEqual(i, 1);
      runTasks();
      assertText('Hello Aurelia 2! 1!!!');
      assert.strictEqual(i, 1, `should not have called getter again`);

      component.obj = { message: 'Hey' };
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes`);
      runTasks();
      assertText('Hey 2!!!');
      assert.strictEqual(i, 2, `1 initial + 2nd when computed observer changes + reuse when binding evaluates`);
    });
  });
});
