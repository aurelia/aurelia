import { AppTask, Aurelia, bindable, BindingMode, customElement, CustomElement, IAppRoot, IAurelia, IKeyMapping, ShortHandBindingSyntax, ValueConverter } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';
import { delegateSyntax } from '@aurelia/compat-v1';
import { resolve } from '@aurelia/kernel';
import { IObserverLocator, observable } from '@aurelia/runtime';

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

    ctx.platform.domQueue.flush();
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

  it('handles recursive changes with the right order', function () {

    @customElement('')
    class MyApp {
      public message = 'Hello Aurelia 2!';

      public logs = [];

      @bindable
      public count: number = 0;

      public obsLoc = resolve(IObserverLocator);

      public created() {
        this.obsLoc.getObserver(this, 'count').subscribe({
          handleChange: (value: number, oldValue: number) => {
            if (value > 0 && value < 3) {
              this.log('S.1. handleChange()', value, oldValue);
              if (value > oldValue) {
                this.count++;
              } else {
                this.count--;
              }
            }
          }
        });
      }

      public countChanged(value: number) {
        this.log('P.1. countChanged()', value);
      }

      public incr() {
        if (this.count < 10) {
          this.count++;
          this.log('After incr()', this.count);
          // console.assert(this.count, 9);
        }
      }

      public decr() {
        if (this.count > 0) {
          this.count--;
          this.log('After decr()', this.count);
          // console.assert(this.count, 1);
        }
      }

      public log(...msgs: unknown[]) {
        this.logs.push(msgs);
      }
    }

    const { component, getAllBy, stop } = createFixture(`
      <button click.trigger="incr()">Incr()</button>
      <button click.trigger="decr()">Decr()</button>
      <div id="logs"><div repeat.for="log of logs">\${log}</div></div>
    `, MyApp);

    assert.deepStrictEqual(component.logs, []);
    const [incrButton, decrButton] = getAllBy('button');

    // when clicking on increment, increase count all the way to 3 by 1 at a time
    incrButton.click();
    assert.deepStrictEqual(
      component.logs,
      [
        ['S.1. handleChange()', 1, 0],
        ['S.1. handleChange()', 2, 1],
        ['P.1. countChanged()', 3],
        ['After incr()', 3]
      ]
    );

    // when clicking on decrement, decrease count all the way to 0 by 1 at a time
    decrButton.click();
    assert.deepStrictEqual(
      component.logs,
      [
        ['S.1. handleChange()', 1, 0],
        ['S.1. handleChange()', 2, 1],
        ['P.1. countChanged()', 3],
        ['After incr()', 3],
        ['S.1. handleChange()', 2, 3],
        ['S.1. handleChange()', 1, 2],
        ['P.1. countChanged()', 0],
        ['After decr()', 0]
      ]
    );

    void stop(true);
  });

  // https://github.com/aurelia/aurelia/issues/2022
  it('calls change handler callback after propagating changes with @bindable', function () {
    const logs = [];
    @customElement('outer-component')
    class OuterComponent {
      static template = '<inner-component prop1.bind="prop1" prop2.bind="prop2"/>';

      @bindable
      prop1 = 1;

      prop2 = 1;

      attached() {
        this.prop1 = 2;
      }

      prop1Changed() {
        this.prop2 = 2;
      }
    }

    @customElement('inner-component')
    class InnerComponent {
      @bindable
      prop1;

      @bindable
      prop2;

      prop2Changed() {
        logs.push(`prop1: ${this.prop1}`);
      }
    }

    createFixture(
      '<outer-component>',
      class {
        outer: OuterComponent;
      },
      [OuterComponent, InnerComponent]
    );

    assert.deepStrictEqual(logs, ['prop1: 2']);
  });

  // https://github.com/aurelia/aurelia/issues/2022
  it('calls [propertyChanged] callback after propagating changes with @bindable', function () {
    const logs = [];
    @customElement('outer-component')
    class OuterComponent {
      static template = '<inner-component prop1.bind="prop1" prop2.bind="prop2"/>';

      @bindable
      prop1 = 1;

      prop2 = 1;

      attached() {
        this.prop1 = 2;
      }

      prop1Changed() {
        this.prop2 = 2;
      }
    }

    @customElement('inner-component')
    class InnerComponent {
      @bindable
      prop1;

      @bindable
      prop2;

      propertyChanged(name: string) {
        if (name === 'prop2') {
          logs.push(`prop1: ${this.prop1}`);
        }
      }
    }

    createFixture(
      '<outer-component>',
      class {
        outer: OuterComponent;
      },
      [OuterComponent, InnerComponent]
    );

    assert.deepStrictEqual(logs, ['prop1: 2']);
  });

  describe('event', function () {
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

    it('works with mouse event modifier + middle click', function () {
      let clicked = 0;
      const { trigger } = createFixture(
        '<button click.trigger:middle="clicked()"></button>',
        { clicked: () => clicked = 1 }
      );
      trigger('button', 'click', { button: 0 });
      assert.strictEqual(clicked, 0);
      trigger('button', 'click', { button: 1 });
      assert.strictEqual(clicked, 1);
    });

    it('works with capture event + modifier', function () {
      let clicked = 0;
      const { trigger } = createFixture(
        '<button click.capture:middle="clicked()"></button>',
        { clicked: () => clicked = 1 }
      );
      trigger('button', 'click', { button: 0 });
      assert.strictEqual(clicked, 0);
      trigger('button', 'click', { button: 1 });
      assert.strictEqual(clicked, 1);
    });

    it('works with mouse event modifier + right click', function () {
      let clicked = 0;
      const { trigger } = createFixture(
        '<button click.trigger:right="clicked()"></button>',
        { clicked: () => clicked = 1 }
      );
      trigger('button', 'click', { button: 0 });
      assert.strictEqual(clicked, 0);
      trigger('button', 'click', { button: 2 });
      assert.strictEqual(clicked, 1);
    });

    it('works with mouse event modifier + prevent + stop', function () {
      let clicked = 0;
      let prevented = false;
      let stopped = false;
      const { trigger } = createFixture(
        '<button click.trigger:right+prevent+stop="clicked()" click.capture=capture></button>',
        { clicked: () => clicked = 1,
          capture: (e: Event) => {
            Object.defineProperty(e, 'preventDefault', { value: () => prevented = true });
            Object.defineProperty(e, 'stopPropagation', { value: () => stopped = true });
          }
        }
      );
      trigger('button', 'click', { button: 0 });
      assert.strictEqual(clicked, 0);
      assert.strictEqual(prevented, false);
      assert.strictEqual(stopped, false);
      trigger('button', 'click', { button: 2 });
      assert.strictEqual(clicked, 1);
      assert.strictEqual(prevented, true);
      assert.strictEqual(stopped, true);
    });

    it('works with multiple event modifiers', function () {
      let clicked = 0;
      const { trigger } = createFixture(
        '<button click.trigger:right+ctrl="clicked()"></button>',
        { clicked: () => clicked = 1 }
      );
      trigger('button', 'click', { button: 2 });
      assert.strictEqual(clicked, 0);
      trigger('button', 'click', { button: 2, ctrlKey: true });
      assert.strictEqual(clicked, 1);
    });

    it('calls preventDefault() when event modifier "prevent" is used', function () {
      let clicked = 0;
      let prevented = false;

      const { trigger } = createFixture(
        '<button click.trigger:prevent="clicked()", click.capture="capture"></button>',
        {
          clicked: () => clicked = 1,
          capture: (e: Event) => {
            Object.defineProperty(e, 'preventDefault', { value: () => prevented = true });
          }
        }
      );
      trigger('button', 'click');
      assert.strictEqual(clicked, 1);
      assert.strictEqual(prevented, true);
    });

    it('calls stopPropagation() when event modifier "stop" is used', function () {
      let clicked = 0;
      let stopped = false;

      const { trigger } = createFixture(
        '<button click.trigger:stop="clicked()", click.capture="capture"></button>',
        {
          clicked: () => clicked = 1,
          capture: (e: Event) => {
            Object.defineProperty(e, 'stopPropagation', { value: () => stopped = true });
          }
        }
      );
      trigger('button', 'click');
      assert.strictEqual(clicked, 1);
      assert.strictEqual(stopped, true);
    });

    it('works with keyboard modifier', function () {
      let entered = 0;
      const { trigger } = createFixture(
        '<button keydown.trigger:enter="enter()"></button>',
        { enter: () => entered = 1 }
      );
      trigger('button', 'keydown', { key: 'a' });
      assert.strictEqual(entered, 0);
      trigger('button', 'keydown', { key: 'Enter' });
      assert.strictEqual(entered, 1);
    });

    it('works with multiple keyboard modifiers', function () {
      let entered = 0;
      const { trigger } = createFixture(
        '<button keydown.trigger:enter+ctrl+shift="enter()"></button>',
        { enter: () => entered = 1 }
      );
      trigger('button', 'keydown', { key: 'Enter', ctrlKey: true });
      assert.strictEqual(entered, 0);
      trigger('button', 'keydown', { key: 'Enter', ctrlKey: true, shiftKey: true });
      assert.strictEqual(entered, 1);
    });

    it('works with shorthand event syntax', function () {
      let clicked = 0;
      const { trigger } = createFixture(
        '<button @click:right="clicked()"></button>',
        { clicked: () => clicked = 1 },
        [ShortHandBindingSyntax]
      );
      trigger('button', 'click', { button: 0 });
      assert.strictEqual(clicked, 0);
      trigger('button', 'click', { button: 2 });
      assert.strictEqual(clicked, 1);
    });

    it('works with shorthand keyboard event + multiple modifiers', function () {
      let entered = 0;
      const { trigger } = createFixture(
        '<button @keydown:enter+ctrl+shift="enter()"></button>',
        { enter: () => entered = 1 },
        [ShortHandBindingSyntax]
      );
      trigger('button', 'keydown', { key: 'Enter', ctrlKey: true });
      assert.strictEqual(entered, 0);
      trigger('button', 'keydown', { key: 'Enter', ctrlKey: true, shiftKey: true });
      assert.strictEqual(entered, 1);
    });

    it('works with keycode for upper key by default', function () {
      let entered = 0;
      const { trigger } = createFixture(
        '<button keydown.trigger:ctrl+107="enter()"></button>',
        { enter: () => entered = 1 },
      );
      trigger('button', 'keydown', { key: 'k', ctrlKey: true });
      assert.strictEqual(entered, 1);
    });

    it('works with custom keyboard mapping', function () {
      let entered = 0;
      const { trigger } = createFixture(
        '<button keydown.trigger:ctrl+upperK="enter()"></button>',
        { enter: () => entered = 1 },
        [AppTask.creating(IKeyMapping, mapping => {
          mapping.keys.upperk = 'K';
        })]
      );
      trigger('button', 'keydown', { key: 'K' });
      assert.strictEqual(entered, 0);
      trigger('button', 'keydown', { key: 'K', ctrlKey: true });
      assert.strictEqual(entered, 1);
    });

    it('does not work without keyboard mapping for custom modifier', function () {
      let entered = 0;
      const { trigger } = createFixture(
        '<button keydown.trigger:ctrl+super_k="enter()"></button>',
        { enter: () => entered = 1 },
        [AppTask.creating(IKeyMapping, mapping => {
          mapping.keys.upper_k = 'K';
        })]
      );
      trigger('button', 'keydown', { key: 'K', ctrlKey: true });
      assert.strictEqual(entered, 0);
    });

    it('works with prevent and stop together with other combo', function () {
      let entered = 0;
      let prevented = false;
      let stopped = false;

      const { trigger } = createFixture(
        '<button keydown.trigger:ctrl+shift+enter+stop+prevent="enter()", keydown.capture="capture"></button>',
        {
          enter: () => entered = 1,
          capture: (e: Event) => {
            Object.defineProperty(e, 'preventDefault', { value: () => prevented = true });
            Object.defineProperty(e, 'stopPropagation', { value: () => stopped = true });
          }
        }
      );
      trigger('button', 'keydown', { key: 'Enter', ctrlKey: true });
      assert.strictEqual(entered, 0);
      assert.strictEqual(prevented, false);
      assert.strictEqual(stopped, false);
      trigger('button', 'keydown', { key: 'Enter', ctrlKey: true, shiftKey: true });
      assert.strictEqual(entered, 1);
      assert.strictEqual(prevented, true);
      assert.strictEqual(stopped, true);
    });

    it('allows prevent modifier on events that are not mouse or key', function () {
      let prevented = false;
      let stopped = false;
      const { trigger } = createFixture(
        '<form submit.capture="modifyEvent($event)" submit.trigger:prevent+stop="">',
        {
          modifyEvent: (e: SubmitEvent) => {
            Object.defineProperty(e, 'preventDefault', { value: () => prevented = true });
            Object.defineProperty(e, 'stopPropagation', { value: () => stopped = true });
          }
        },
        [AppTask.creating(IAppRoot, root => root.config.allowActionlessForm = true)]
      );

      trigger('form', 'submit');
      assert.strictEqual(prevented, true);
      assert.strictEqual(stopped, true);
    });

    it('does not alter dispatchEvent working', function () {
      const { ctx, getBy } = createFixture(
        '<div some-event.trigger="handleEvent($event)"><center>',
        {
          handleEvent: (e: Event) => {
            e.preventDefault();
          }
        },
      );
      const center = getBy('center');
      const event = new ctx.CustomEvent('some-event', { bubbles: true, cancelable: true });
      // when there's nothing cancelling the event behavior, it's considered proceeded
      // so name it something close to make the behavior easier to understand
      const isProceeded = center.dispatchEvent(event);
      assert.strictEqual(isProceeded, false);

      const event2 = new ctx.CustomEvent('some-event', { bubbles: true, cancelable: false });
      const isProceeded2 = center.dispatchEvent(event2);
      assert.strictEqual(isProceeded2, true);
    });

    it('does not calls prevent default on actionless form submission', function () {
      let e: SubmitEvent;
      const { trigger } = createFixture('<div submit.trigger="onSubmit($event)"><form><button>', {
        onSubmit: (_e: SubmitEvent) => {
          e = _e;
        }
      });

      trigger.click('button');
      // cannot use a variable inside `onSubmit` handler above
      // as the prevent default submission happens at the application root element level
      assert.strictEqual(e?.defaultPrevented, true);
    });

    it('allows actionless form submission when allowActionlessForm is set to true', function () {
      let e: SubmitEvent;
      const { testHost, trigger } = createFixture(
        '<div submit.trigger="onSubmit($event)"><form><button>',
        {
          onSubmit: (_e: SubmitEvent) => {
            e = _e;
          },
        },
        [AppTask.creating(IAppRoot, root => root.config.allowActionlessForm = true)]
      );

      let e2: SubmitEvent;
      let isPrevented = false;
      testHost.addEventListener('submit', e => {
        e2 = e;
        isPrevented = e.defaultPrevented;
        e.preventDefault();
      });
      trigger.click('button');
      assert.strictEqual(isPrevented, false);
      assert.strictEqual(e, e2);
    });
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

  describe('bindable inheritance', function () {
    it('works for array', async function () {
      @customElement({
        name: 'c-1',
        template: '${p1} ${p21} ${p22}',
        bindables: ['p21', { name: 'p22'} ]
      })
      class CeOne {
        @bindable p1: string;
      }

      @customElement({
        name: 'c-2',
        template: '${p3} ${p1} ${p21} ${p22}',
      })
      class CeTwo extends CeOne {
        @bindable p3: string;
      }

      const { appHost } = createFixture(
        '<c-1 p1="c1-p1" p21="c1-p21" p22="c1-p22"></c-1> <c-2 p1="c2-p1" p21="c2-p21" p22="c2-p22" p3="c2-p3"></c-2>',
        { },
        [CeOne, CeTwo]
      );

      assert.html.textContent(appHost, 'c1-p1 c1-p21 c1-p22 c2-p3 c2-p1 c2-p21 c2-p22');
    });

    it('works for object', async function () {
      @customElement({
        name: 'c-1',
        template: '${p1} ${p2}',
        bindables: { p2: {} }
      })
      class CeOne {
        @bindable p1: string;
      }

      @customElement({
        name: 'c-2',
        template: '${p3} ${p1} ${p2}',
      })
      class CeTwo extends CeOne {
        @bindable p3: string;
      }

      const { appHost } = createFixture(
        '<c-1 p1="c1-p1" p2="c1-p2"></c-1> <c-2 p1="c2-p1" p2="c2-p2" p3="c2-p3"></c-2>',
        { },
        [CeOne, CeTwo]
      );

      assert.html.textContent(appHost, 'c1-p1 c1-p2 c2-p3 c2-p1 c2-p2');
    });
  });

  describe('aggregated callback', function () {
    it('calls aggregated callback', async function () {
      let changes = void 0;
      const { component } = createFixture(``, class App {
        @bindable
        a = 1;

        propertiesChanged($changes: Record<string, { newValue: unknown; oldValue: unknown }>) {
          changes = $changes;
        }
      });

      assert.strictEqual(changes, void 0);
      component.a = 2;
      assert.strictEqual(changes, void 0);

      await Promise.resolve();
      assert.deepStrictEqual(changes, { a: { newValue: 2, oldValue: 1 } });
    });

    it('calls aggregated callback only once for 2 changes', async function () {
      let changes = void 0;
      const { component } = createFixture(``, class App {
        @bindable
        a = 1;

        propertiesChanged($changes: Record<string, { newValue: unknown; oldValue: unknown }>) {
          changes = $changes;
        }
      });

      assert.strictEqual(changes, void 0);
      component.a = 2;
      component.a = 3;
      assert.strictEqual(changes, void 0);

      await Promise.resolve();
      assert.deepStrictEqual(changes, { a: { newValue: 3, oldValue: 2 } });
    });

    it('does not call aggregated callback again after first call if theres no new change', async function () {
      let changes = void 0;
      const { component } = createFixture(``, class App {
        @bindable
        a = 1;

        propertiesChanged($changes: Record<string, { newValue: unknown; oldValue: unknown }>) {
          changes = $changes;
        }
      });

      assert.strictEqual(changes, void 0);
      component.a = 2;
      assert.strictEqual(changes, void 0);

      await Promise.resolve();
      assert.deepStrictEqual(changes, { a: { newValue: 2, oldValue: 1 } });

      changes = void 0;
      await Promise.resolve();
      assert.strictEqual(changes, void 0);
    });

    it('calls aggregated callback again after first call if there are new changes', async function  () {
      let changes = void 0;
      const { component } = createFixture(``, class App {
        @bindable
        a = 1;

        propertiesChanged($changes: Record<string, { newValue: unknown; oldValue: unknown }>) {
          changes = $changes;
          if (this.a === 2) {
            this.a = 3;
          }
        }
      });

      assert.strictEqual(changes, void 0);
      component.a = 2;
      assert.strictEqual(changes, void 0);
      await Promise.resolve();
      assert.deepStrictEqual(changes, { a: { newValue: 2, oldValue: 1 } });

      changes = void 0;
      await Promise.resolve();
      assert.deepStrictEqual(changes, { a: { newValue: 3, oldValue: 2 } });
    });

    it('does not call aggregated callback if component is unbound before next tick', async function () {
      let changes = void 0;
      const { component, stop } = createFixture(``, class App {
        @bindable
        a = 1;

        propertiesChanged($changes: Record<string, { newValue: unknown; oldValue: unknown }>) {
          changes = $changes;
        }
      });

      assert.strictEqual(changes, void 0);
      component.a = 2;
      assert.strictEqual(changes, void 0);
      void stop(true);

      await Promise.resolve();
      assert.deepStrictEqual(changes, void 0);
    });

    it('does not call aggregated callback after unbind', async function () {
      let changes = void 0;
      const { component, stop } = createFixture(``, class App {
        @bindable
        a = 1;

        propertiesChanged($changes: Record<string, { newValue: unknown; oldValue: unknown }>) {
          changes = $changes;
        }
      });

      assert.strictEqual(changes, void 0);
      component.a = 2;
      assert.strictEqual(changes, void 0);

      await Promise.resolve();
      assert.deepStrictEqual(changes, { a: { newValue: 2, oldValue: 1 } });

      changes = void 0;
      void stop(true);
      component.a = 3;
      assert.strictEqual(changes, void 0);
      await Promise.resolve();
      assert.strictEqual(changes, void 0);
    });

    it('does not call aggregated callback for @observable', async function () {
      let changes = void 0;
      const { component } = createFixture(``, class App {
        @observable
        a = 1;

        propertiesChanged($changes: Record<string, { newValue: unknown; oldValue: unknown }>) {
          changes = $changes;
        }
      });

      assert.strictEqual(changes, void 0);
      component.a = 2;
      assert.strictEqual(changes, void 0);
      await Promise.resolve();
      assert.strictEqual(changes, void 0);
    });

    it('calls both change handler and aggregated callback', async function () {
      let changes = void 0;
      let aChanges = void 0;
      const { component } = createFixture(``, class App {
        @bindable
        a = 1;

        aChanged($newValue: unknown, $oldValue: unknown) {
          aChanges = { newValue: $newValue, oldValue: $oldValue };
        }

        propertiesChanged($changes: Record<string, { newValue: unknown; oldValue: unknown }>) {
          changes = $changes;
        }
      });

      assert.strictEqual(changes, void 0);
      assert.strictEqual(aChanges, void 0);
      component.a = 2;
      assert.strictEqual(changes, void 0);
      assert.deepStrictEqual(aChanges, { newValue: 2, oldValue: 1 });

      await Promise.resolve();
      assert.deepStrictEqual(changes, { a: { newValue: 2, oldValue: 1 } });
    });

    it('calls change handler, propertyChanged and aggregated callback', async function () {
      let propertiesChanges = void 0;
      let propertyChanges = void 0;
      let aChanges = void 0;
      const { component } = createFixture(``, class App {
        @bindable
        a = 1;

        aChanged($newValue: unknown, $oldValue: unknown) {
          aChanges = { newValue: $newValue, oldValue: $oldValue };
        }

        propertyChanged(key: string, newValue: unknown, oldValue: unknown) {
          propertyChanges = { key, newValue, oldValue };
        }

        propertiesChanged($changes: Record<string, { newValue: unknown; oldValue: unknown }>) {
          propertiesChanges = $changes;
        }
      });

      assert.strictEqual(propertiesChanges, void 0);
      assert.strictEqual(propertyChanges, void 0);
      assert.strictEqual(aChanges, void 0);
      component.a = 2;
      assert.strictEqual(propertiesChanges, void 0);
      assert.deepStrictEqual(propertyChanges, { key: 'a', newValue: 2, oldValue: 1 });
      assert.deepStrictEqual(aChanges, { newValue: 2, oldValue: 1 });

      await Promise.resolve();
      assert.deepStrictEqual(propertiesChanges, { a: { newValue: 2, oldValue: 1 } });
      assert.deepStrictEqual(propertyChanges, { key: 'a', newValue: 2, oldValue: 1 });
      assert.deepStrictEqual(aChanges, { newValue: 2, oldValue: 1 });
    });

    it('aggregates changes for multiple properties', async function () {
      let changes = void 0;
      const { component } = createFixture(``, class App {
        @bindable
        a = 1;

        @bindable
        b = 2;

        propertiesChanged($changes: Record<string, { newValue: unknown; oldValue: unknown }>) {
          changes = $changes;
        }
      });

      assert.strictEqual(changes, void 0);
      component.a = 3;
      component.b = 4;
      assert.strictEqual(changes, void 0);

      await Promise.resolve();
      assert.deepStrictEqual(
        changes,
        {
          a: { newValue: 3, oldValue: 1 },
          b: { newValue: 4, oldValue: 2 }
        });
    });

    it('calls aggregated callback for multiple properties with the right key', async function () {
      let changes = void 0;
      const { component } = createFixture(``, class App {
        @bindable
        a = 1;

        // symbol is not allowed so we use a number
        @bindable
        5 = 2;

        propertiesChanged($changes: Record<string, { newValue: unknown; oldValue: unknown }>) {
          changes = $changes;
        }
      });

      assert.strictEqual(changes, void 0);
      component.a = 3;
      component[5] = 4;
      assert.strictEqual(changes, void 0);

      await Promise.resolve();
      assert.deepStrictEqual(
        changes,
        {
          a: { newValue: 3, oldValue: 1 },
          5: { newValue: 4, oldValue: 2 }
        });
    });
  });
});
