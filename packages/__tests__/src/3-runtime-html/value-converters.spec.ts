import {
  alias,
  valueConverter,
  bindable,
  customAttribute,
  INode,
  customElement,
  PropertyBinding,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';
import { resolve } from '@aurelia/kernel';

// TemplateCompiler - value converter integration
describe('3-runtime-html/value-converters.spec.ts', function () {
  // custom elements
  describe('01. Aliases', function () {

    @valueConverter({ name: 'woot1', aliases: ['woot13'] })
    @alias(...['woot11', 'woot12'])
    class WootConverter {
      public toView() {
        return 'wOOt1';
      }
    }

    @valueConverter({ name: 'woot2', aliases: ['woot23'] })
    @alias('woot21', 'woot22')
    class WootConverter2 {
      public toView() {
        return 'wOOt1';
      }
    }

    @customAttribute({ name: 'foo5', aliases: ['foo53'] })
    @alias(...['foo51', 'foo52'])
    class FooAttribute {
      @bindable({ primary: true })
      public value: any;
      private readonly element: INode<Element> = resolve(INode) as INode<Element>;

      public bound() {
        this.element.setAttribute('test', this.value);
      }
    }

    @customAttribute({ name: 'foo4', aliases: ['foo43'] })
    @alias('foo41', 'foo42')
    class FooAttribute2 {
      @bindable({ primary: true })
      public value: any;
      private readonly element: INode<Element> = resolve(INode) as INode<Element>;

      public bound() {
        this.element.setAttribute('test', this.value);
      }
    }

    const resources: any[] = [WootConverter, WootConverter2, FooAttribute2, FooAttribute];
    const app = class { public value = 'wOOt'; };

    it('Simple spread Alias doesn\'t break def alias works on value converter', async function () {
      const options = createFixture('<template> <div foo53.bind="value | woot13"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.stop(true);
    });

    it('Simple spread Alias (1st position) works on value converter', async function () {
      const options = createFixture('<template> <div foo51.bind="value | woot11"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.stop(true);
    });

    it('Simple spread Alias (2nd position) works on value converter', async function () {
      const options = createFixture('<template> <div foo52.bind="value | woot12"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.stop(true);
    });

    it('Simple spread Alias doesn\'t break original value converter', async function () {
      const options = createFixture('<template> <div foo5.bind="value | woot2"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.stop(true);
    });

    it('Simple Alias doesn\'t break def alias works on value converter', async function () {
      const options = createFixture('<template> <div foo43.bind="value | woot23"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.stop(true);
    });

    it('Simple Alias (1st position) works on value converter', async function () {
      const options = createFixture('<template> <div foo41.bind="value | woot21"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.stop(true);
    });

    it('Simple Alias (2nd position) works on value converter', async function () {
      const options = createFixture('<template> <div foo42.bind="value | woot22"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.stop(true);
    });

    it('Simple Alias doesn\'t break original value converter', async function () {
      const options = createFixture('<template> <div foo4.bind="value | woot2"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.stop(true);
    });

  });

  describe('02. Caller Context', function () {
    it('passes the binding as the second argument if contextual is true', async function () {
      @valueConverter({ name: 'callerAware', contextual: true })
      class CallerAwareConverter {
        public toView(value: any, caller: { source?: unknown, binding: unknown }) {
          return caller && caller.binding ? `${value}-called` : value;
        }
        public fromView(value: any, caller: { source?: unknown, binding: unknown }) {
          return caller && caller.binding ? `${value}-from` : value;
        }
      }
      const resources: any[] = [CallerAwareConverter];
      const app = class { public value = 'foo'; };
      const options = createFixture('<template> <div>${value | callerAware}</div> </template>', app, resources);
      assert.html.textContent(options.appHost, 'foo-called');
      await options.stop(true);
    });

    it('does not pass the binding as the second argument if contextual is not set', async function () {
      @valueConverter('noCaller')
      class NoCallerConverter {
        public toView(value: any, ...params: any[]) {
          // Should not receive a PropertyBinding as second arg
          return params.length > 0 && typeof params[0]?.updateTarget === 'function' ? 'fail' : `${value}-plain`;
        }
      }
      const resources: any[] = [NoCallerConverter];
      const app = class { public value = 'bar'; };
      const options = createFixture('<template> <div>${value | noCaller}</div> </template>', app, resources);
      assert.html.textContent(options.appHost, 'bar-plain');
      await options.stop(true);
    });
  });

  describe('03. Caller Context – property & attribute bindings', function () {
    it('provides caller.source for property binding and caller.binding for binding context', async function () {
      let capturedSource: any = null;
      let capturedBinding: any = null;
      @valueConverter({ name: 'propCaller', contextual: true })
      class PropCallerConverter {
        public toView(v: any, caller: { source?: unknown, binding: unknown }) {
          capturedSource = caller.source;
          capturedBinding = caller.binding;
          return v;
        }
      }
      @customElement({
        name: 'my-button',
        template: '<input value.bind="value | propCaller">',
        dependencies: [PropCallerConverter]
      })
      class MyButton {
        public value = 'hello';
      }
      const options = createFixture('<template><my-button></my-button></template>', class {}, [MyButton]);
      await options.startPromise;
      assert.instanceOf(capturedBinding, PropertyBinding);
      assert.instanceOf(capturedSource, MyButton);
      await options.stop(true);
    });

    it('provides caller.source for custom attribute binding', async function () {
      let capturedSource: any = null;
      let capturedBinding: any = null;
      @valueConverter({ name: 'attrCaller', contextual: true })
      class AttrCallerConverter {
        public toView(v: any, caller: { source?: unknown, binding: unknown }) {
          capturedSource = caller.source;
          capturedBinding = caller.binding;
          return v;
        }
      }
      @customAttribute('dummy')
      class DummyAttr {
        @bindable({ primary: true }) public value!: string;
      }
      const resources: any[] = [AttrCallerConverter, DummyAttr];
      const app = class { public value = 'hi'; };
      const options = createFixture('<template><div dummy.bind="value | attrCaller"></div></template>', app, resources);
      assert.instanceOf(capturedBinding, PropertyBinding);
      // source is the component view-model, which is the app instance in this case
      assert.instanceOf(capturedSource, app);
      await options.stop(true);
    });
  });

  // 04. Caller Context – component resolution via interpolation
  describe('04. Caller Context – component resolution via interpolation', function () {
    it('captures the component via caller.source and binding via caller.binding when using interpolation in a custom element', async function () {
      let capturedSource: any = null;
      let capturedBinding: any = null;
      @valueConverter({ name: 'vmCaller', contextual: true })
      class VmCallerConverter {
        public toView(v: any, caller: { source?: unknown, binding: unknown }) {
          capturedSource = caller.source;
          capturedBinding = caller.binding;
          return v;
        }
      }
      @customElement({
        name: 'my-button',
        template: '<button>${label | vmCaller}</button>',
        dependencies: [VmCallerConverter]
      })
      class MyButton {
        public label = 'Press';
      }
      const options = createFixture('<template><my-button></my-button></template>', class {}, [MyButton]);
      await options.startPromise;
      assert.instanceOf(capturedBinding, Object); // _ContentBinding or similar
      assert.instanceOf(capturedSource, MyButton);
      await options.stop(true);
    });
  });

});
