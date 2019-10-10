import {
  bindable,
  alias,
  customAttribute,
  INode,
  bindingBehavior,
  IBindingBehavior,
  LifecycleFlags,
  IScope,
  IBinding,
  PropertyBinding
} from '@aurelia/runtime';
import { assert, setup } from '@aurelia/testing';

describe('value-converters', function () {
  // custom elements
  describe('01. Aliases', function () {

    const app = class {
      public value = 'wOOt';
      public method = () => {
        this.value = 'wOOt1';
      };
    };

    @bindingBehavior({ name: 'woot1', aliases: ['woot13'] })
    @alias(...['woot11', 'woot12'])
    class WootBehavior implements IBindingBehavior<() => void> {
      public bind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding, func: (param: string) => void): void {
        func(binding.target[binding.targetProperty]);
      }
      public unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding, func: () => void): void {
        return;
      }
    }

    @bindingBehavior({ name: 'woot2', aliases: ['woot23'] })
    @alias('woot21', 'woot22')
    class WootBehavior2 implements IBindingBehavior<() => void> {
      public bind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding, func: (param: string) => void, func2: (param: string) => void): void {
        func2(binding.target[binding.targetProperty]);
      }
      public unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding): void {
        return;
      }
    }

    @customAttribute({ name: 'foo5', aliases: ['foo53'] })
    @alias(...['foo51', 'foo52'])
    class FooAttr5 {
      @bindable({ primary: true })
      public value: any;
      public constructor(@INode private readonly element: Element) {
      }

      public bound() {
        this.element.setAttribute('test', this.value);
      }
    }

    @customAttribute({ name: 'foo4', aliases: ['foo43'] })
    @alias('foo41', 'foo42')
    class FooAttr4 {
      @bindable({ primary: true })
      public value: any;
      public constructor(@INode private readonly element: Element) {
      }

      public bound() {
        this.element.setAttribute('test', this.value);
      }
    }

    const resources: any[] = [WootBehavior, WootBehavior2, FooAttr4, FooAttr5];
    it('Simple spread Alias doesn\'t break def alias works on binding behavior', async function () {
      const options = setup('<template> <div foo53.bind="value & woot13:method"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple spread Alias (1st position) works on binding behavior', async function () {
      const options = setup('<template> <div foo51.bind="value & woot11:method"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple spread Alias (2nd position) works on binding behavior', async function () {
      const options = setup('<template> <div foo52.bind="value & woot12:method:method"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple spread Alias doesn\'t break original binding behavior', async function () {
      const options = setup('<template> <div foo5.bind="value & woot2:method:method"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple Alias doesn\'t break def alias works on binding behavior', async function () {
      const options = setup('<template> <div foo43.bind="value & woot23:method:method"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple Alias (1st position) works on binding behavior', async function () {
      const options = setup('<template> <div foo41.bind="value & woot21:method:method"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple Alias (2nd position) works on binding behavior', async function () {
      const options = setup('<template> <div foo42.bind="value & woot22:method:method"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple Alias doesn\'t break original binding behavior', async function () {
      const options = setup('<template> <div foo4.bind="value & woot2:method:method"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

  });

});
