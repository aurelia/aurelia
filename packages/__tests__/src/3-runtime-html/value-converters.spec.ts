import {
  alias,
  valueConverter,
  bindable,
  customAttribute,
  INode,
  customElement,
  ICallerContextResolver
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
    it('provides caller context through ICallerContextResolver', async function () {
      @valueConverter('callerAware')
      class CallerAwareConverter {
        private readonly callerContextResolver = resolve(ICallerContextResolver);

        public toView(value: any) {
          const callerContext = this.callerContextResolver.resolve();
          return callerContext && callerContext.target ? `${value}-called` : value;
        }

        public fromView(value: any) {
          const callerContext = this.callerContextResolver.resolve();
          return callerContext && callerContext.target ? `${value}-from` : value;
        }
      }

      const resources: any[] = [CallerAwareConverter];
      const app = class { public value = 'foo'; };
      const options = createFixture('<template> <div>${value | callerAware}</div> </template>', app, resources);
      assert.html.textContent(options.appHost, 'foo-called');
      await options.stop(true);
    });
  });

  describe('03. Caller Context – property & attribute bindings', function () {
    it('provides caller.target for property binding and caller.component for component context', async function () {
      let capturedTarget: any = null;
      let capturedComponent: any = null;

      @valueConverter('propCaller')
      class PropCallerConverter {
        private readonly callerContextResolver = resolve(ICallerContextResolver);

        public toView(v: any) {
          const caller = this.callerContextResolver.resolve();
          capturedTarget = caller?.target;
          capturedComponent = caller?.component;
          // For property binding, caller.target is the input element, caller.component is the component
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

      const input = options.appHost.querySelector('input');
      assert.instanceOf(capturedTarget, options.appHost.ownerDocument.defaultView.HTMLInputElement);
      assert.instanceOf(capturedComponent, MyButton);
      assert.strictEqual(input.value, 'hello');

      await options.stop(true);
    });

    it('provides caller.target for custom attribute binding', async function () {
      let capturedTarget: any = null;

      @valueConverter('attrCaller')
      class AttrCallerConverter {
        private readonly callerContextResolver = resolve(ICallerContextResolver);

        public toView(v: any) {
          const caller = this.callerContextResolver.resolve();
          capturedTarget = caller?.target;
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
      assert.instanceOf(capturedTarget, DummyAttr);

      await options.stop(true);
    });
  });

  // 04. Caller Context – component resolution via interpolation
  describe('04. Caller Context – component resolution via interpolation', function () {
    it('captures the element and component via caller context when using interpolation in a custom element', async function () {
      let capturedTarget: any = null;
      let capturedComponent: any = null;

      @valueConverter('vmCaller')
      class VmCallerConverter {
        private readonly callerContextResolver = resolve(ICallerContextResolver);

        public toView(v: any) {
          const caller = this.callerContextResolver.resolve();
          capturedTarget = caller?.target;
          capturedComponent = caller?.component;
          // For interpolation, caller.target is a Text node, caller.component is the component
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

      const btn = options.appHost.querySelector('button');
      assert.notEqual(capturedTarget.nodeType, undefined, 'target should have nodeType');
      assert.instanceOf(capturedComponent, MyButton);
      assert.strictEqual(btn.textContent.trim(), 'Press');

      await options.stop(true);
    });
  });

  describe('05. Enhanced Caller Context Properties', function () {
    it('provides all context properties in interpolation binding', async function () {
      let contextFromResolver: any = null;

      @valueConverter('contextCapture')
      class ContextCaptureConverter {
        private readonly callerContextResolver = resolve(ICallerContextResolver);

        public toView(value: any) {
          contextFromResolver = this.callerContextResolver.resolve();
          return value;
        }
      }

      const resources = [ContextCaptureConverter];
      const app = class {
        message = "Hello World";
      };

      const options = createFixture('<template><div>${message | contextCapture}</div></template>', app, resources);

      assert.notEqual(contextFromResolver, null, 'Context should not be null');
      assert.notEqual(contextFromResolver.target, null, 'target should always be set');
      assert.notEqual(contextFromResolver.binding, null, 'binding should always be set');

      // Check for target type
      assert.equal(contextFromResolver.target.nodeType, 3, 'target should be a text node for interpolation');

      await options.stop(true);
    });

    it('provides all context properties in property binding', async function () {
      let contextFromResolver: any = null;

      @valueConverter('attrContextCapture')
      class AttrContextCaptureConverter {
        private readonly callerContextResolver = resolve(ICallerContextResolver);

        public toView(value: any) {
          contextFromResolver = this.callerContextResolver.resolve();
          return value;
        }

        public fromView(value: any) {
          // We can't check the context here as direction is gone from context
          return value;
        }
      }

      @customAttribute('test-attr')
      class TestAttr {
        @bindable({ primary: true }) value: string = '';
      }

      const resources = [AttrContextCaptureConverter, TestAttr];
      const app = class {
        message = "Test Message";

        constructor() {
          setTimeout(() => { this.message = "Changed"; }, 10);
        }
      };

      const options = createFixture('<template><div test-attr.bind="message | attrContextCapture"></div></template>', app, resources);

      assert.notEqual(contextFromResolver, null, 'Context should not be null');
      assert.notEqual(contextFromResolver.target, null, 'target should always be set');
      assert.notEqual(contextFromResolver.binding, null, 'binding should always be set');

      assert.instanceOf(contextFromResolver.target, TestAttr, 'target should be the attribute instance');

      await options.stop(true);
    });

    it('provides component and controller in custom element context', async function () {
      let capturedContext: any = null;

      @valueConverter('componentContext')
      class ComponentContextConverter {
        private readonly callerContextResolver = resolve(ICallerContextResolver);

        public toView(value: any) {
          capturedContext = this.callerContextResolver.resolve();
          return value;
        }
      }

      @customElement({
        name: 'test-component',
        template: '<div>${title | componentContext}</div>',
        dependencies: [ComponentContextConverter]
      })
      class TestComponent {
        @bindable title: string = 'Component Title';
      }

      const options = createFixture('<template><test-component></test-component></template>', class {}, [TestComponent]);
      await options.startPromise;

      // Verify component-specific properties
      assert.notEqual(capturedContext, null, 'Context should not be null');
      assert.instanceOf(capturedContext.component, TestComponent, 'component should be the component instance');
      assert.equal(capturedContext.component.title, 'Component Title', 'component should have the right properties');

      await options.stop(true);
    });

    it('provides binding instance with access to scope in context', async function () {
      let capturedContext: any = null;

      @valueConverter('bindingContext')
      class BindingContextConverter {
        private readonly callerContextResolver = resolve(ICallerContextResolver);

        public toView(value: any) {
          capturedContext = this.callerContextResolver.resolve();
          return value;
        }
      }

      const app = class {
        items = ['one', 'two', 'three'];
      };

      const options = createFixture('<template><div repeat.for="item of items">${item | bindingContext}</div></template>', app, [BindingContextConverter]);

      assert.notEqual(capturedContext, null, 'Context should not be null');
      assert.notEqual(capturedContext.binding, null, 'binding should be set');
      assert.strictEqual(typeof capturedContext.binding, 'object', 'binding should be an object');

      assert.ok('isBound' in capturedContext.binding ||
                'bind' in capturedContext.binding ||
                'unbind' in capturedContext.binding,
                'binding should have binding-like properties');

      await options.stop(true);
    });

    it('verifies that primary context properties are always available', async function () {
      let contextFromResolver: any = null;

      @valueConverter('minimalContext')
      class MinimalContextConverter {
        private readonly callerContextResolver = resolve(ICallerContextResolver);

        public toView(value: any) {
          contextFromResolver = this.callerContextResolver.resolve();
          return value;
        }
      }

      const app = class {
        message = "Hello";
      };

      const options = createFixture('<template>${message | minimalContext}</template>', app, [MinimalContextConverter]);

      assert.notEqual(contextFromResolver, null, 'Context should not be null');
      assert.notEqual(contextFromResolver.target, null, 'target should always be set');
      assert.notEqual(contextFromResolver.binding, null, 'binding should always be set');

      // Component may be undefined in some edge cases
      if (contextFromResolver.component) {
        assert.strictEqual(typeof contextFromResolver.component, 'object', 'component should be an object when available');
      }

      await options.stop(true);
    });
  });

});
