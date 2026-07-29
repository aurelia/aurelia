import { computed, ICoercionConfiguration, ISubscriberCollection, ProxyObservable, runTasks } from '@aurelia/runtime';
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

    it('should not observe a getter read inside a computed getter when not declared as a dependency', async function () {
      let computedCallCount = 0;
      let computedCallCount2 = 0;
      let privateCount = 0;
      const { component } = createFixture(`\${moreText}`, class App {
        prop = 'prop';
        prop1 = ' prop1';

        privateProp = 'value';

        get privateText() {
          privateCount++;
          return this.privateProp;
        }

        @computed('prop')
        get text() {
          computedCallCount++;
          return `${this.prop + this.prop1} ${this.privateText}`;
        }

        get moreText() {
          computedCallCount2++;
          return this.text;
        }
      });

      assert.strictEqual(component.moreText, 'prop prop1 value');
      assert.strictEqual(computedCallCount, 1);
      assert.strictEqual(computedCallCount2, 1);
      assert.strictEqual(privateCount, 1);

      component.privateProp = 'value1';
      await Promise.resolve();
      assert.strictEqual(component.moreText, 'prop prop1 value');
      assert.strictEqual(computedCallCount, 1);
      assert.strictEqual(computedCallCount2, 1);
      assert.strictEqual(privateCount, 1);
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

  describe('deep cyclic dependencies', function () {
    type Leaf = { value: number };
    type CyclicGraph = { root: object; leaf: Leaf };

    function createDeepFixture<TRoot extends object>(
      root: TRoot,
      read: (root: TRoot) => number,
      flush: 'async' | 'sync' = 'async',
    ) {
      let evaluations = 0;
      const fixture = createFixture(
        '${value}',
        class App {
          public graph = root;

          @computed({ deps: ['graph'], deep: true, flush })
          public get value(): number {
            evaluations++;
            return read(this.graph);
          }
        },
      );
      return { fixture, getEvaluationCount: () => evaluations };
    }

    const graphCases: readonly [name: string, create: () => CyclicGraph][] = [
      ['a self-referential object', () => {
        const leaf = { value: 0 };
        const root: { leaf: Leaf; self?: object } = { leaf };
        root.self = root;
        return { root, leaf };
      }],
      ['two mutually-referential class instances', () => {
        class Node {
          public next!: Node;
          public constructor(public leaf: Leaf) {}
        }
        const leaf = { value: 0 };
        const root = new Node(leaf);
        const child = new Node(leaf);
        root.next = child;
        child.next = root;
        return { root, leaf };
      }],
      ['a self-containing array', () => {
        const leaf = { value: 0 };
        const root: unknown[] = [];
        root.push(root, leaf);
        return { root, leaf };
      }],
      ['a map containing itself as both a key and value', () => {
        const leaf = { value: 0 };
        const root = new Map<unknown, unknown>();
        root.set(root, root);
        root.set('leaf', leaf);
        return { root, leaf };
      }],
      ['a self-containing set', () => {
        const leaf = { value: 0 };
        const root = new Set<unknown>();
        root.add(root);
        root.add(leaf);
        return { root, leaf };
      }],
    ];

    for (const [name, createGraph] of graphCases) {
      it(`observes ${name}`, function () {
        const { root, leaf } = createGraph();
        const { fixture, getEvaluationCount } = createDeepFixture(root, () => leaf.value);

        // A reachable mutation proves that traversal did not merely stop at the
        // cycle: it retained the property subscriptions found elsewhere in the graph.
        fixture.assertText('0');
        assert.strictEqual(getEvaluationCount(), 1, 'initial evaluation');

        leaf.value = 1;
        assert.strictEqual(getEvaluationCount(), 1, 'async change remains queued');
        runTasks();
        fixture.assertText('1');
        assert.strictEqual(getEvaluationCount(), 2, 'one evaluation for mutation');
      });
    }

    it('observes a cyclic object with sync flushing', function () {
      const { root, leaf } = graphCases[0][1]();
      const { fixture, getEvaluationCount } = createDeepFixture(root, () => leaf.value, 'sync');

      fixture.assertText('0');
      leaf.value = 1;
      assert.strictEqual(getEvaluationCount(), 2, 'sync change evaluates immediately');
      runTasks();
      fixture.assertText('1');
      assert.strictEqual(getEvaluationCount(), 2, 'binding reuses the computed value');
    });

    type CyclicCollectionGraph = {
      root: object;
      leaves: Leaf[];
      add(leaf: Leaf): void;
    };

    const collectionCases: readonly [name: string, create: () => CyclicCollectionGraph][] = [
      ['array', () => {
        const leaves = [{ value: 1 }];
        const root: unknown[] = [];
        root.push(root, leaves[0]);
        return {
          root,
          leaves,
          add(leaf) {
            leaves.push(leaf);
            root.push(leaf);
          },
        };
      }],
      ['map', () => {
        const leaves = [{ value: 1 }];
        const root = new Map<unknown, unknown>();
        root.set(root, root);
        root.set('leaf-0', leaves[0]);
        return {
          root,
          leaves,
          add(leaf) {
            leaves.push(leaf);
            root.set(`leaf-${leaves.length - 1}`, leaf);
          },
        };
      }],
      ['set', () => {
        const leaves = [{ value: 1 }];
        const root = new Set<unknown>([leaves[0]]);
        root.add(root);
        return {
          root,
          leaves,
          add(leaf) {
            leaves.push(leaf);
            root.add(leaf);
          },
        };
      }],
    ];

    for (const [name, createGraph] of collectionCases) {
      it(`discovers new members of a cyclic ${name}`, function () {
        const graph = createGraph();
        const { fixture, getEvaluationCount } = createDeepFixture(
          graph.root,
          () => graph.leaves.reduce((total, leaf) => total + leaf.value, 0),
        );

        fixture.assertText('1');
        const addedLeaf = { value: 2 };
        graph.add(addedLeaf);
        assert.strictEqual(getEvaluationCount(), 1, 'collection mutation remains queued');
        runTasks();
        fixture.assertText('3');
        assert.strictEqual(getEvaluationCount(), 2, 'collection mutation triggers one evaluation');

        // The collection change forces a fresh traversal. The newly reachable
        // object's property must therefore participate in subsequent updates.
        addedLeaf.value = 3;
        runTasks();
        fixture.assertText('4');
        assert.strictEqual(getEvaluationCount(), 3, 'new member mutation triggers one evaluation');
      });
    }

    it('normalizes raw and observation-proxy aliases to one reachable object', function () {
      const leaf = { value: 0 };
      let traversalCount = 0;
      const target: { leaf: Leaf; parent?: object } = { leaf };
      const raw = new Proxy(target, {
        ownKeys(target) {
          traversalCount++;
          return Reflect.ownKeys(target);
        },
      });
      const root: { raw: object; proxy: object; self?: object } = {
        raw,
        proxy: ProxyObservable.wrap(raw),
      };
      root.self = root;
      target.parent = root;
      const { fixture, getEvaluationCount } = createDeepFixture(root, () => leaf.value);
      const { assertText, observerLocator } = fixture;
      const leafObserver = observerLocator.getObserver(leaf, 'value') as unknown as ISubscriberCollection;

      assert.strictEqual(traversalCount, 1, 'raw/proxy aliases are visited once in the initial pass');
      assert.strictEqual(leafObserver.subs.count, 1, 'shared leaf has one deep observer');
      traversalCount = 0;
      leaf.value = 1;
      runTasks();

      assertText('1');
      assert.strictEqual(getEvaluationCount(), 2, 'shared leaf triggers one evaluation');
      assert.ok(traversalCount > 0, 'invalidation traverses with a fresh identity set');
      assert.strictEqual(leafObserver.subs.count, 1, 'shared leaf remains singly observed after rebuilding');
    });

    it('does not reattach a queued deep observer after unbinding', function () {
      const leaf = { value: 0 };
      const root: { leaf: Leaf; self?: object } = { leaf };
      root.self = root;
      const { fixture, getEvaluationCount } = createDeepFixture(root, () => leaf.value);
      const { observerLocator, stop } = fixture;
      const leafObserver = observerLocator.getObserver(leaf, 'value') as unknown as ISubscriberCollection;

      assert.strictEqual(leafObserver.subs.count, 1, 'deep observer is attached');
      leaf.value = 1;
      void stop();
      assert.strictEqual(leafObserver.subs.count, 0, 'unbind detaches the queued deep observer');

      // The already queued deep walker still completes, preserving the normal
      // ComputedObserver ordering, but must release everything it recollects.
      runTasks();
      assert.strictEqual(getEvaluationCount(), 1, 'detached user getter does not evaluate');
      assert.strictEqual(leafObserver.subs.count, 0, 'queued work does not reattach the deep observer');
    });

    it('does not reattach an obsolete deep observer after replacing its root', function () {
      const createGraph = (value: number) => {
        const leaf = { value };
        const root: { leaf: Leaf; self?: object } = { leaf };
        root.self = root;
        return { root, leaf };
      };
      const oldGraph = createGraph(1);
      const newGraph = createGraph(2);
      const { fixture, getEvaluationCount } = createDeepFixture(
        oldGraph.root,
        graph => graph.leaf.value,
      );
      const { component, assertText, observerLocator } = fixture;
      const oldLeafObserver = observerLocator.getObserver(oldGraph.leaf, 'value') as unknown as ISubscriberCollection;
      const newLeafObserver = observerLocator.getObserver(newGraph.leaf, 'value') as unknown as ISubscriberCollection;

      assertText('1');
      component.graph = newGraph.root;
      oldGraph.leaf.value = 10;

      // Root replacement is queued first. The old graph's nested change is
      // queued second and becomes obsolete when replacement detaches its walker.
      runTasks();
      assertText('2');
      assert.strictEqual(getEvaluationCount(), 2, 'root replacement triggers one evaluation');
      assert.strictEqual(oldLeafObserver.subs.count, 0, 'old graph remains detached');
      assert.strictEqual(newLeafObserver.subs.count, 1, 'new graph is observed');

      oldGraph.leaf.value = 11;
      runTasks();
      assert.strictEqual(getEvaluationCount(), 2, 'old graph no longer triggers evaluation');

      newGraph.leaf.value = 3;
      runTasks();
      assertText('3');
      assert.strictEqual(getEvaluationCount(), 3, 'new graph remains observable');
    });
  });
});
