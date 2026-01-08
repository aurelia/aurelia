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
import type { ICallerContext } from '@aurelia/runtime-html';

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

    @customAttribute({ name: 'foo5', aliases: ['foo53'], defaultProperty: 'value' })
    @alias(...['foo51', 'foo52'])
    class FooAttribute {
      @bindable()
      public value: any;
      private readonly element: INode<Element> = resolve(INode) as INode<Element>;

      public bound() {
        this.element.setAttribute('test', this.value);
      }
    }

    @customAttribute({ name: 'foo4', aliases: ['foo43'], defaultProperty: 'value' })
    @alias('foo41', 'foo42')
    class FooAttribute2 {
      @bindable()
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
    it('passes the binding as the second argument if withContext is true', async function () {
      @valueConverter({ name: 'callerAware' })
      class CallerAwareConverter {
        public readonly withContext = true;
        public toView(value: any, caller: ICallerContext) {
          return caller?.binding ? `${value}-called` : value;
        }
        public fromView(value: any, caller: ICallerContext) {
          return caller?.binding ? `${value}-from` : value;
        }
      }
      const resources: any[] = [CallerAwareConverter];
      const app = class { public value = 'foo'; };
      const fixture = createFixture('<template> <input value.bind="value | callerAware"></template>', app, resources);
      // toView assertion
      fixture.assertValue('input', 'foo-called');

      fixture.type('input', 'bar');

      assert.strictEqual(fixture.component.value, 'bar-from');
    });

    it('does not pass the binding as the second argument if withContext is not set', async function () {
      @valueConverter('noCaller')
      class NoCallerConverter {
        public toView(value: any, ...params: any[]) {
          // Should not receive a PropertyBinding as second arg
          return params.length > 0 && typeof params[0]?.updateTarget === 'function' ? 'fail' : `${value}-plain`;
        }
      }
      const resources: any[] = [NoCallerConverter];
      const app = class { public value = 'bar'; };
      const fixture = createFixture('<template> <div>${value | noCaller}</div> </template>', app, resources);
      fixture.assertText('div', 'bar-plain');
    });

    it('passes both the context and additional arguments to a withContext value converter', async function () {
      let receivedContext: ICallerContext;
      let receivedArg1: any, receivedArg2: any;

      @valueConverter({ name: 'contextAndArgs' })
      class ContextAndArgsConverter {
        public readonly withContext = true;
        public toView(value: any, context: ICallerContext, arg1: any, arg2: any) {
          receivedContext = context;
          receivedArg1 = arg1;
          receivedArg2 = arg2;
          return `${value}-${arg1}-${arg2}`;
        }
      }

      const resources: any[] = [ContextAndArgsConverter];
      const app = class { public value = 'foo'; public arg1 = 'bar'; public arg2 = 42; };
      const fixture = createFixture(
        '<template> <div>${value | contextAndArgs:arg1:arg2}</div> </template>',
        app,
        resources
      );
      fixture.assertText('div', 'foo-bar-42');
      assert.strictEqual(typeof receivedContext, 'object');
      assert.notStrictEqual(receivedContext, null);
      assert.strictEqual(receivedArg1, 'bar');
      assert.strictEqual(receivedArg2, 42);
    });
  });

  describe('03. Caller Context – property & attribute bindings', function () {
    it('provides caller.source for property binding and caller.binding for binding context', async function () {
      let capturedSource: any = null;
      let capturedBinding: any = null;
      @valueConverter({ name: 'propCaller' })
      class PropCallerConverter {
        public readonly withContext = true;
        public toView(v: any, caller: ICallerContext) {
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
      const fixture = createFixture('<template><my-button></my-button></template>', class {}, [MyButton]);
      await fixture.startPromise;
      assert.instanceOf(capturedBinding, PropertyBinding);
      assert.instanceOf(capturedSource, MyButton);
      await fixture.stop(true);
    });

    it('provides caller.source for custom attribute binding', async function () {
      let capturedSource: any = null;
      let capturedBinding: any = null;
      @valueConverter({ name: 'attrCaller' })
      class AttrCallerConverter {
        public readonly withContext = true;
        public toView(v: any, caller: ICallerContext) {
          capturedSource = caller.source;
          capturedBinding = caller.binding;
          return v;
        }
      }
      @customAttribute({ name: 'dummy', defaultProperty: 'value' })
      class DummyAttr {
        @bindable() public value!: string;
      }
      const resources: any[] = [AttrCallerConverter, DummyAttr];
      const app = class { public value = 'hi'; };
      const fixture = createFixture('<template><div dummy.bind="value | attrCaller"></div></template>', app, resources);
      assert.instanceOf(capturedBinding, PropertyBinding);
      // source is the component view-model, which is the app instance in this case
      assert.instanceOf(capturedSource, app);
    });
  });

  // 04. Caller Context – component resolution via interpolation
  describe('04. Caller Context - component resolution via interpolation', function () {
    it('captures the component via caller.source and binding via caller.binding when using interpolation in a custom element', async function () {
      let capturedSource: any = null;
      let capturedBinding: any = null;
      @valueConverter({ name: 'vmCaller' })
      class VmCallerConverter {
        public readonly withContext = true;
        public toView(v: any, caller: ICallerContext) {
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
      const fixture = createFixture('<template><my-button></my-button></template>', class {}, [MyButton]);

      assert.instanceOf(capturedBinding, Object); // _ContentBinding or similar
      assert.instanceOf(capturedSource, MyButton);
    });
  });

  // 05. Caller Context – au-slot
  describe('05. Caller Context - au-slot', function () {
    it('provides correct caller.source and caller.binding when VC with context is used in projected content', async function () {
      let capturedSource: any = null;
      let capturedBinding: any = null;

      @valueConverter({ name: 'slotContextVc' })
      class SlotContextVc {
        public readonly withContext = true;
        public toView(v: any, caller: ICallerContext) {
          capturedSource = caller.source;
          capturedBinding = caller.binding;
          return v;
        }
      }

      @customElement({
        name: 'child-el',
        template: '<au-slot></au-slot>',
      })
      class ChildEl {}

      @customElement({
        name: 'parent-el',
        template: '<child-el>${message | slotContextVc}</child-el>',
        dependencies: [ChildEl, SlotContextVc],
      })
      class ParentEl {
        public message = 'hello from slot';
      }

      const fixture = createFixture('<parent-el></parent-el>', class {}, [ParentEl]);
      await fixture.startPromise;

      assert.instanceOf(capturedBinding, Object, 'capturedBinding should be an object'); // Binding instance
      assert.instanceOf(capturedSource, ParentEl, 'capturedSource should be ParentEl instance');
      assert.strictEqual(capturedSource.message, 'hello from slot');
    });

    it('provides correct caller.source and caller.binding when VC with context is used in projected content with explicit slot name', async function () {
      let capturedSource: any = null;
      let capturedBinding: any = null;

      @valueConverter({ name: 'slotContextNamedVc' })
      class SlotContextNamedVc {
        public readonly withContext = true;
        public toView(v: any, caller: ICallerContext) {
          capturedSource = caller.source;
          capturedBinding = caller.binding;
          return v;
        }
      }

      @customElement({
        name: 'child-el-named',
        template: '<au-slot name="s1"></au-slot>',
      })
      class ChildElNamed {}

      @customElement({
        name: 'parent-el-named',
        template: '<child-el-named><div au-slot="s1">${message | slotContextNamedVc}</div></child-el-named>',
        dependencies: [ChildElNamed, SlotContextNamedVc],
      })
      class ParentElNamed {
        public message = 'hello from named slot';
      }

      const fixture = createFixture('<parent-el-named></parent-el-named>', class {}, [ParentElNamed]);
      await fixture.startPromise;

      assert.instanceOf(capturedBinding, Object, 'capturedBinding should be an object for named slot'); // Binding instance
      assert.instanceOf(capturedSource, ParentElNamed, 'capturedSource should be ParentElNamed instance for named slot');
      assert.strictEqual(capturedSource.message, 'hello from named slot');
    });

    it('provides correct caller.source from repeater scope for VC in slotted content inside repeater', async function () {
      const capturedSources: any[] = [];
      const capturedBindings: any[] = [];

      @valueConverter({ name: 'repeaterSlotVc' })
      class RepeaterSlotVc {
        public readonly withContext = true;
        public toView(v: any, caller: ICallerContext) {
          capturedSources.push(caller.source);
          capturedBindings.push(caller.binding);
          return v;
        }
      }

      @customElement({
        name: 'child-repeater-el',
        template: '<au-slot></au-slot>',
      })
      class ChildRepeaterEl {}

      @customElement({
        name: 'parent-repeater-el',
        template: '<child-repeater-el repeat.for="item of items">${item.name | repeaterSlotVc}</child-repeater-el>',
        dependencies: [ChildRepeaterEl, RepeaterSlotVc],
      })
      class ParentRepeaterEl {
        public items = [{ name: 'item1' }, { name: 'item2' }];
      }

      const fixture = createFixture('<parent-repeater-el></parent-repeater-el>', class {}, [ParentRepeaterEl]);
      await fixture.startPromise;

      assert.strictEqual(capturedSources.length, 2, 'Should have captured two sources');
      assert.strictEqual(capturedBindings.length, 2, 'Should have captured two bindings');
      assert.instanceOf(capturedSources[0], ParentRepeaterEl, 'First captured source should be ParentRepeaterEl');
      assert.instanceOf(capturedSources[1], ParentRepeaterEl, 'Second captured source should be ParentRepeaterEl');
      assert.strictEqual(capturedSources[0], capturedSources[1], 'Both sources should be the same ParentRepeaterEl instance');
      assert.instanceOf(capturedBindings[0], Object, 'First captured binding should be an object');
      assert.instanceOf(capturedBindings[1], Object, 'Second captured binding should be an object');
      assert.notStrictEqual(capturedBindings[0], capturedBindings[1], 'Bindings should be different for each item');
    });
  });
});
