import {
  bindable,
  alias,
  customAttribute,
  INode
} from '@aurelia/runtime';
import { assert, setup } from '@aurelia/testing';

describe('custom-attributes', function () {
  // custom elements
  describe('01. Aliases', function () {

    @customAttribute({ name: 'foo5', aliases: ['foo53'] })
    @alias(...['foo51', 'foo52'])
    class Fooatt5 {
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
    class Fooatt4 {
      @bindable({ primary: true })
      public value: any;
      public constructor(@INode private readonly element: Element) {
      }

      public bound() {
        this.element.setAttribute('test', this.value);
      }
    }

    @customAttribute({ name: 'foo44', aliases: ['foo431'] })
    @alias('foo411', 'foo421')
    @alias('foo422', 'foo422')
    class FooMultipleAlias {
      @bindable({ primary: true })
      public value: any;
      public constructor(@INode private readonly element: Element) {
      }

      public bound() {
        this.element.setAttribute('test', this.value);
      }
    }

    const resources: any[] = [Fooatt4, Fooatt5, FooMultipleAlias];
    const app = class { public value: string = 'wOOt'; };

    it('Simple spread Alias doesn\'t break def alias works on custom attribute', async function () {
      const options = setup('<template> <div foo53.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('2 aliases and attribute alias original works', async function () {
      const options = setup('<template> <div foo44.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('2 aliases and attribute alias first alias deco works', async function () {
      const options = setup('<template> <div foo411.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('2 aliases and attribute alias def alias works', async function () {
      const options = setup('<template> <div foo431.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('2 aliases and attribute alias second alias works', async function () {
      const options = setup('<template> <div foo422.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple spread Alias (1st position) works on custom attribute', async function () {
      const options = setup('<template> <div foo51.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple spread Alias (2nd position) works on custom attribute', async function () {
      const options = setup('<template> <div foo52.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple spread Alias doesn\'t break original custom attribute', async function () {
      const options = setup('<template> <div foo5.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias doesn\'t break def alias works on custom attribute', async function () {
      const options = setup('<template> <div foo43.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias (1st position) works on custom attribute', async function () {
      const options = setup('<template> <div foo41.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias (2nd position) works on custom attribute', async function () {
      const options = setup('<template> <div foo42.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias doesn\'t break original custom attribute', async function () {
      const options = setup('<template> <div foo4.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

  });

  describe('with multiple bindings', function () {

    @customAttribute('multi')
    class Multi {
        @bindable public a: boolean;
        @bindable public b: string;
        public aResult: boolean;
        public bResult: string;
        public constructor(@INode private readonly element: Element) {
          this.element.innerHTML = 'Created';
        }
        public bound() {
          this.aChanged();
          this.bChanged();
        }
        public aChanged() {
          this.aResult = this.a;
          this.updateContent();
        }
        public bChanged() {
          this.bResult = this.b;
          this.updateContent();
        }
        public updateContent() {
          this.element.innerHTML = `a: ${this.aResult}, b: ${this.bResult}`;
        }
    }
    @customAttribute('multi2')
    class Multi2 {
        @bindable public a: boolean;
        @bindable({ primary: true }) public b: string;
        public aResult: boolean;
        public bResult: string;
        public constructor(@INode private readonly element: Element) {
          this.element.innerHTML = 'Created';
        }
        public bound() {
          this.aChanged();
          this.bChanged();
        }
        public aChanged() {
          this.aResult = this.a;
          this.updateContent();
        }
        public bChanged() {
          this.bResult = this.b;
          this.updateContent();
        }
        public updateContent() {
          this.element.innerHTML = `a: ${this.aResult}, b: ${this.bResult}`;
        }
    }

    const app = class { public value: string = 'bound'; };

    it('binds to multiple properties correctly', async function () {
      const options = setup('<template> <div multi="a.bind: true; b.bind: value">Initial</div> </template>', app, [Multi]);
      assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: true, b: bound');
      await options.tearDown();
    });

    it('binds to multiple properties correctly when there’s a default property', async function () {
      const options = setup('<template> <div multi2="a.bind: true; b.bind: value">Initial</div> </template>', app, [Multi2]);
      assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: true, b: bound');
      await options.tearDown();
    });

    it('binds to the default property correctly', async function () {
      const options = setup('<template> <div multi2.bind="value">Initial</div> </template>', app, [Multi2]);
      assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: undefined, b: bound');
      await options.tearDown();
    });
  });

});
