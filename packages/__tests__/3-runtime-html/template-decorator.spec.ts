import {
  bindable,
  alias,
  customAttribute,
  INode,
  valueConverter,
  template,
  customElement,
  CustomElement,
  inlineView
} from '@aurelia/runtime-html';
import { assert, createFixture, } from '@aurelia/testing';

describe('template-decorator', function () {
  describe('Simple inline template', function () {

    @template('<div>TEST</div>')
    class Simple {
    }

    it('Simple test with @template renders correct template string', async function () {
      const options = createFixture('<simple></simple>', class { }, [CustomElement.define('simple', Simple)]);
      assert.strictEqual(options.appHost.firstElementChild.innerHTML, '<div>TEST</div>');
      await options.tearDown();
    });

  });

  describe('Simple inline template with dependencies', function () {

    @template('<div>Inner Test</div>')
    class InnerSimple { }

    @template('<div><inner></inner></div>', [CustomElement.define('inner', InnerSimple)])
    class Simple {
    }

    it('Simple test with @template renders correct template string', async function () {
      const options = createFixture('<simple></simple>', class { }, [CustomElement.define('simple', Simple)]);
      assert.strictEqual(options.appHost.querySelector('inner').innerHTML, '<div>Inner Test</div>');
      await options.tearDown();
    });

  });

  describe('Simple inline using inlineView', function () {

    @inlineView('<div>TEST</div>')
    class Simple {
    }

    it('Simple test with @inlineView renders correct template string', async function () {
      const options = createFixture('<simple></simple>', class { }, [CustomElement.define('simple', Simple)]);
      assert.strictEqual(options.appHost.firstElementChild.innerHTML, '<div>TEST</div>');
      await options.tearDown();
    });

  });

  describe('Simple inline using inlineView with dependencies', function () {

    @template('<div>Inner Test</div>')
    class InnerSimple { }

    @template('<div><inner></inner></div>', [CustomElement.define('inner', InnerSimple)])
    class Simple {
    }

    it('Simple test with @template renders correct template string', async function () {
      const options = createFixture('<simple></simple>', class { }, [CustomElement.define('simple', Simple)]);
      assert.strictEqual(options.appHost.querySelector('inner').innerHTML, '<div>Inner Test</div>');
      await options.tearDown();
    });

  });

});
