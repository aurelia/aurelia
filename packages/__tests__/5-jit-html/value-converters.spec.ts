import {
  bindable,
  alias,
  customAttribute,
  INode,
  valueConverter
} from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';

// TemplateCompiler - value converter integration
describe('value-converters', function () {
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
      private readonly element: Element;
      public constructor(@INode element: INode) {
        this.element = element as Element;
      }

      public afterBind() {
        this.element.setAttribute('test', this.value);
      }
    }

    @customAttribute({ name: 'foo4', aliases: ['foo43'] })
    @alias('foo41', 'foo42')
    class FooAttribute2 {
      @bindable({ primary: true })
      public value: any;
      private readonly element: Element;
      public constructor(@INode element: INode) {
        this.element = element as Element;
      }

      public afterBind() {
        this.element.setAttribute('test', this.value);
      }
    }

    const resources: any[] = [WootConverter, WootConverter2, FooAttribute2, FooAttribute];
    const app = class { public value = 'wOOt'; };

    it('Simple spread Alias doesn\'t break def alias works on value converter', async function () {
      const options = createFixture('<template> <div foo53.bind="value | woot13"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple spread Alias (1st position) works on value converter', async function () {
      const options = createFixture('<template> <div foo51.bind="value | woot11"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple spread Alias (2nd position) works on value converter', async function () {
      const options = createFixture('<template> <div foo52.bind="value | woot12"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple spread Alias doesn\'t break original value converter', async function () {
      const options = createFixture('<template> <div foo5.bind="value | woot2"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple Alias doesn\'t break def alias works on value converter', async function () {
      const options = createFixture('<template> <div foo43.bind="value | woot23"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple Alias (1st position) works on value converter', async function () {
      const options = createFixture('<template> <div foo41.bind="value | woot21"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple Alias (2nd position) works on value converter', async function () {
      const options = createFixture('<template> <div foo42.bind="value | woot22"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

    it('Simple Alias doesn\'t break original value converter', async function () {
      const options = createFixture('<template> <div foo4.bind="value | woot2"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
      await options.tearDown();
    });

  });

});
