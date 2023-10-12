import { Aurelia, bindable, BindingMode, customElement, CustomElement, IAurelia, ValueConverter } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';
import { delegateSyntax } from '@aurelia/compat-v1';
import { resolve } from '@aurelia/kernel';

describe('3-runtime-html/custom-elements.spec.ts', function () {
  it('injects right aurelia instance', function () {
    const { component: { au, au1 } } = createFixture(``, class { au = resolve(Aurelia); au1 = resolve(IAurelia); });
    assert.strictEqual(au, au1);
  });

  it('works with multiple layers of change propagation & <input/>', function () {
    const { ctx, appHost } = createFixture(
      `<input value.bind="first_name | properCase">
      <form-input value.two-way="first_name | properCase"></form-input>`,
      class App {
        public message = 'Hello Aurelia 2!';
        public first_name = '';
      },
      [
        CustomElement.define({
          name: 'form-input',
          template: '<input value.bind="value">',
          bindables: {
            value: { mode: BindingMode.twoWay }
          }
        }, class FormInput { }),
        ValueConverter.define('properCase', class ProperCase {
          public toView(value: unknown): unknown {
            if (typeof value == 'string' && value) {
              return value
                .split(' ')
                .map(m => m[0].toUpperCase() + m.substring(1).toLowerCase())
                .join(' ');
            }
            return value;
          }
        }),
      ],
    );

    const [, nestedInputEl] = Array.from(appHost.querySelectorAll('input'));
    nestedInputEl.value = 'aa bb';
    nestedInputEl.dispatchEvent(new ctx.CustomEvent('input', { bubbles: true }));

    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(nestedInputEl.value, 'Aa Bb');
  });

  it('renders containerless per element via "containerless" attribute', function () {
    const { appHost } = createFixture(
      `<my-el containerless message="hello world">`,
      class App {},
      [CustomElement.define({
        name: 'my-el',
        template: '${message}',
        bindables: ['message']
      })]
    );

    assert.visibleTextEqual(appHost, 'hello world');
  });

  it('renders element with @customElement({ containerness: true })', function () {
    const { assertText } = createFixture(
      `<my-el message="hello world">`,
      class App {},
      [CustomElement.define({
        name: 'my-el',
        template: '${message}',
        bindables: ['message'],
        containerless: true
      })
    ]);

    assertText('hello world');
  });

  it('renders elements with both "containerless" attribute and @customElement({ containerless: true })', function () {
    const { assertText } = createFixture(
      `<my-el containerless message="hello world">`,
      class App {},
      [CustomElement.define({
        name: 'my-el',
        template: '${message}',
        bindables: ['message'],
        containerless: true,
      })]
    );

    assertText('hello world');
  });

  it('renders elements with template controller and containerless attribute on it', function () {
    const { assertText } = createFixture(
      `<my-el if.bind="true" containerless message="hello world">`,
      class App {},
      [CustomElement.define({
        name: 'my-el',
        template: '${message}',
        bindables: ['message']
      })]
    );

    assertText('hello world');
  });

  it('works with multi layer reactive changes', function () {
    @customElement({
      name: 'text-toggler',
      template: '<textarea value.bind="value">',
      bindables: ['range']
    })
    class TextToggler {
      rangeStart = 0;
      rangeEnd = 0;
      range: [number, number] = [0, 0];

      rangeChanged(v: [number, number]) {
        this.rangeStart = v[0];
        this.rangeEnd = v[1];
      }
    }

    const { trigger } = createFixture(
      '<button click.trigger="random()">rando</button> <text-toggler range.bind="range">',
      class {
        range = [0, 0];
        random() {
          this.range = [Math.round(Math.random() * 10), 10 + Math.round(Math.random() * 20)];
        }
      },
      [TextToggler]
    );

    trigger('button', 'click');
  });

  it('works with multi dot event name for trigger', function () {
    let clicked = 0;
    const { trigger } = createFixture(
      '<button bs.open-modal.trigger="clicked()"></button>',
      { clicked: () => clicked = 1 }
    );
    trigger('button', 'bs.open-modal');
    assert.strictEqual(clicked, 1);
  });

  it('works with multi dot event name for delegate', function () {
    let clicked = 0;
    const { trigger } = createFixture(
      '<button bs.open-modal.delegate="clicked()"></button>',
      { clicked: () => clicked = 1 },
      [delegateSyntax]
    );
    trigger('button', 'bs.open-modal', { bubbles: true });
    assert.strictEqual(clicked, 1);
  });

  it('works with multi dot event name for capture', function () {
    let clicked = 0;
    const { trigger } = createFixture(
      '<button bs.open-modal.capture="clicked()"></button>',
      { clicked: () => clicked = 1 }
    );
    trigger('button', 'bs.open-modal');
    assert.strictEqual(clicked, 1);
  });

  describe('resolve', function () {
    afterEach(function () {
      assert.throws(() => resolve(class Abc {}));
    });

    it('works basic', function () {
      const { au, component } = createFixture(
        '',
        class App { au = resolve(IAurelia); }
      );
      assert.strictEqual(au, component.au);
    });

    it('works with inheritance', function () {
      class Base { au = resolve(IAurelia); }
      @customElement('el')
      class El extends Base {}

      const { au, component } = createFixture('<el component.ref="el">', class App {
        el: El;
      }, [El]);

      assert.strictEqual(au, component.el.au);
    });
  });

  describe('getter bindable', function () {
    it('works in basic scenario', function () {
      const { assertText, flush, trigger } = createFixture(
        `<my-el component.ref=el message="hello world">`,
        class App {},
        [CustomElement.define({
          name: 'my-el',
          template: '<button click.trigger="_m = 1"></button>${message}',
          bindables: ['message']
        }, class {
          _m = 'hey';
          get message() {
            return this._m;
          }

          set message(v) {
            this._m = v;
          }
        })]
      );

      assertText('hello world');
      trigger.click('button');
      flush();
      assertText('1');
    });

    it('works with readonly bindable', function () {
      const { assertText, flush, trigger } = createFixture(
        `<my-el component.ref=el message.from-view="message">`,
        class App {
          message = 'hello-world';
        },
        [CustomElement.define({
          name: 'my-el',
          template: '<button click.trigger="_m = 1"></button>${message}',
          bindables: ['message']
        }, class {
          _m = 'hey';
          get message() {
            return this._m;
          }
        })]
      );

      assertText('hey');
      trigger.click('button');
      flush();
      assertText('1');
    });

    it('works with coercer bindable', function () {
      let setCount = 0;
      const values = [];
      @customElement('my-el')
      class MyEl {
        _m: string = '';
        @bindable({ set: v => {
          setCount++;
          v = Number(v);
          values.push(v);
          return v;
        } })
        get message() {
          return this._m;
        }
        set message(v: string) {
          this._m = v;
        }
      }

      const { component } = createFixture(
        `<my-el message.bind="value">`,
        { value: '1' },
        [MyEl]
      );

      assert.strictEqual(setCount, 1);
      assert.deepStrictEqual(values, [1]);
      component.value = '2';
      assert.strictEqual(setCount, 2);
      assert.deepStrictEqual(values, [1, 2]);
    });

    it('works with array based computed bindable', function () {
      const { component, assertText, flush, trigger } = createFixture(
        `<my-el component.ref=el message.from-view="message">`,
        class App {
          message = '';
        },
        [CustomElement.define({
          name: 'my-el',
          template: '<button click.trigger="_m[0].v = `hey`"></button>${message}',
          bindables: ['message']
        }, class {
          _m = [{ v: 'hello' }, { v: 'world' }];
          get message() {
            return this._m.map(v => v.v).join(' ');
          }
        })]
      );

      assertText('hello world');
      assert.strictEqual(component.message, 'hello world');
      trigger.click('button');
      flush();
      assertText('hey world');
      assert.strictEqual(component.message, 'hey world');
    });

    it('works with change handler', function () {
      let count = 0;
      @customElement({ name: 'my-el', template: '' })
      class MyEl {
        _m: string = '';
        @bindable
        get message() {
          return this._m;
        }

        set message(v: string) {
          this._m = v;
        }

        messageChanged() {
          count = 1;
        }
      }

      const { component } = createFixture(
        `<my-el message.bind="value">`,
        { value: 'hey' },
        [MyEl]
      );

      assert.strictEqual(count, 0);
      component.value = 'helo';
      assert.strictEqual(count, 1);
    });

    it('works with all change handler', function () {
      const calls: any[][] = [];
      @customElement({ name: 'my-el', template: '' })
      class MyEl {
        _m: string = '';
        @bindable
        get message() {
          return this._m;
        }

        set message(v: string) {
          this._m = v;
        }

        @bindable get m() {
          return this._m;
        }
        set m(v: string) {
          this._m = v;
        }

        propertyChanged(...args: any[]) {
          calls.push(args);
        }
      }

      const { component } = createFixture(
        `<my-el message.bind="value" m.bind="v">`,
        { value: 'hey', v: 'hey' },
        [MyEl]
      );

      component.value = 'helo';
      assert.deepStrictEqual(calls, [['message', 'helo', 'hey']]);

      component.v = 'hi';

      assert.deepStrictEqual(calls, [
        ['message', 'helo', 'hey'],
        // this last argument is wrong, it should be hello
        // but because it doesn't eagerly observe the getter
        // so the computed observer of `m` still has the original value assigned during binding phase
        // leaving this like this for now, since it doesnt need to commit to observation early, also for the old value
        ['m', 'hi', 'hey']
      ]);
    });
  });
});
