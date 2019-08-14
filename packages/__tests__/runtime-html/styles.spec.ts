import { DI, PLATFORM, Registration } from '@aurelia/kernel';
import { CustomAttribute, INode } from '@aurelia/runtime';
import { AdoptedStyleSheetsStyles, CSSModulesRegistry, ShadowDOMRegistry, StyleConfiguration } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

describe.only('styles', () => {
  describe('CSS Modules', () => {
    it('config adds correct registry for css', () => {
      const container = DI.createContainer();

      container.register(
        StyleConfiguration.cssModules()
      );

      const registry = container.get('.css');
      assert.instanceOf(registry, CSSModulesRegistry);
    });

    it('registry overrides class attribute', () => {
      const element = { className: '' };
      const container = DI.createContainer();
      container.register(Registration.instance(INode, element));
      const registry = new CSSModulesRegistry();
      const cssModulesLookup = {};

      registry.register(container, cssModulesLookup);

      const attr = container.get(CustomAttribute.keyFrom('class'));

      assert.equal(CustomAttribute.isType(attr.constructor), true);
    });

    it('class attribute maps class names', () => {
      const element = { className: '' };
      const container = DI.createContainer();
      container.register(Registration.instance(INode, element));
      const cssModulesLookup = {
        'foo': 'bar',
        'baz': 'qux'
      };

      const registry = new CSSModulesRegistry();
      registry.register(container, cssModulesLookup);

      const attr = container.get(CustomAttribute.keyFrom('class')) as any;
      attr.value = 'foo baz';
      attr.valueChanged();

      assert.equal(element.className, 'bar qux');
    });
  });

  describe('Shadow DOM', () => {
    if (!PLATFORM.isBrowserLike) {
      return;
    }

    it('config adds correct registry for css', () => {
      const container = DI.createContainer();

      container.register(
        StyleConfiguration.shadowDOM()
      );

      const registry = container.get('.css');
      assert.instanceOf(registry, ShadowDOMRegistry);
    });

    // TODO: style element style tests

    if (!AdoptedStyleSheetsStyles.supported()) {
      return;
    }

    // TODO: adopted styles tests
  });
});
