import { DI, PLATFORM, Registration } from '@aurelia/kernel';
import { Controller, CustomAttribute, CustomElement, INode } from '@aurelia/runtime';
import {
  AdoptedStyleSheetsStyles,
  CSSModulesProcessorRegistry,
  IShadowDOMStyles,
  ShadowDOMProjector,
  ShadowDOMRegistry,
  StyleConfiguration,
  StyleElementStyles,
  styles
} from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('Styles', () => {
  describe('CSS Modules Processor', () => {
    it('config adds correct registry for css', () => {
      const container = DI.createContainer();

      container.register(StyleConfiguration.cssModulesProcessor());

      const registry = container.get('.css');
      assert.instanceOf(registry, CSSModulesProcessorRegistry);
    });

    it('registry overrides class attribute', () => {
      const element = { className: '' };
      const container = DI.createContainer();
      container.register(Registration.instance(INode, element));
      const registry = new CSSModulesProcessorRegistry();
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

      const registry = new CSSModulesProcessorRegistry();
      registry.register(container, cssModulesLookup);

      const attr = container.get(CustomAttribute.keyFrom('class')) as any;
      attr.value = 'foo baz';
      attr.valueChanged();

      assert.equal(element.className, 'bar qux');
    });

    it('style function uses correct registry', () => {
      const container = DI.createContainer();
      const childContainer = container.createChild();

      container.register(StyleConfiguration.cssModulesProcessor());

      const element = { className: '' };
      const cssModulesLookup = {
        'foo': 'bar',
        'baz': 'qux'
      };

      childContainer.register(Registration.instance(INode, element));
      styles(cssModulesLookup).register(childContainer);

      const attr = childContainer.get(CustomAttribute.keyFrom('class')) as any;
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

      container.register(StyleConfiguration.shadowDOM());

      const registry = container.get('.css');
      assert.instanceOf(registry, ShadowDOMRegistry);
    });

    it('registry provides root shadow dom styles', () => {
      const container = DI.createContainer();
      const childContainer = container.createChild();

      container.register(StyleConfiguration.shadowDOM());

      const s = childContainer.get(IShadowDOMStyles);

      assert.instanceOf(s, Object);
      assert.equal(typeof s.applyTo, 'function');
    });

    it('config passes root styles to container', () => {
      const container = DI.createContainer();
      const childContainer = container.createChild();
      const rootStyles = '.my-class { color: red }';

      container.register(
        StyleConfiguration.shadowDOM({
          sharedStyles: [rootStyles]
        })
      );

      const s = childContainer.get(IShadowDOMStyles);

      if (AdoptedStyleSheetsStyles.supported()) {
        assert.instanceOf(s, AdoptedStyleSheetsStyles);
        assert.equal(s['styleSheets'].length, 1);
      } else {
        assert.instanceOf(s, StyleElementStyles);
        assert.equal(s['localStyles'].length, 1);
      }
    });

    it('element styles apply parent styles', () => {
      const root = { prepend() {} };
      const fake = {
        wasCalled: false,
        applyTo() { this.wasCalled = true; }
      };

      const s = new StyleElementStyles([], fake);
      s.applyTo(root as any);

      assert.equal(fake.wasCalled, true);
    });

    it('element styles apply by prepending style elements to shadow root', () => {
      const css = '.my-class { color: red }';
      const root = {
        element: null,
        prepend(styleElement) {
          this.element = styleElement;
        }
      };

      const s = new StyleElementStyles([css], null);
      s.applyTo(root as any);

      assert.equal(root.element.tagName, 'STYLE');
      assert.equal(root.element.innerHTML, css);
    });

    it('adopted styles apply parent styles', () => {
      const root = { adoptedStyleSheets: [] };
      const fake = {
        wasCalled: false,
        applyTo() { this.wasCalled = true; }
      };

      const s = new AdoptedStyleSheetsStyles([], new Map(), fake);
      s.applyTo(root as any);

      assert.equal(fake.wasCalled, true);
    });

    it('projector applies styles during projection', () => {
      const ctx = TestContext.createHTMLTestContext();
      const host = ctx.createElement('foo-bar');
      const FooBar = CustomElement.define(
        {
          name: 'foo-bar',
          shadowOptions: { mode: 'open' }
        }
      );
      const css = '.my-class { color: red }';
      const context = ctx.container.createChild();
      context.register(
        Registration.instance(
          IShadowDOMStyles,
          new StyleElementStyles([css], null)
        )
      );

      const component = new FooBar();
      const controller = Controller.forCustomElement(component, ctx.container, host);
      controller.context = context;

      const seq = { appendTo() {} };
      const projector = controller.projector!;

      projector.project(seq as any);

      const root = projector.provideEncapsulationSource() as ShadowRoot;
      assert.strictEqual(root.firstElementChild.innerHTML, css);
    });

    if (!AdoptedStyleSheetsStyles.supported()) {
      return;
    }

    it('adopted styles apply by setting adopted style sheets on shadow root', () => {
      const css = '.my-class { color: red }';
      const root = { adoptedStyleSheets: [] };

      const s = new AdoptedStyleSheetsStyles([css], new Map(), null);
      s.applyTo(root as any);

      assert.equal(root.adoptedStyleSheets.length, 1);
      assert.instanceOf(root.adoptedStyleSheets[0], CSSStyleSheet);
    });

    it('adopted styles use cached style sheets', () => {
      const css = '.my-class { color: red }';
      const root = { adoptedStyleSheets: [] };
      const cache = new Map();
      const sheet = new CSSStyleSheet();
      cache.set(css, sheet);

      const s = new AdoptedStyleSheetsStyles([css], cache, null);
      s.applyTo(root as any);

      assert.equal(root.adoptedStyleSheets.length, 1);
      assert.strictEqual(root.adoptedStyleSheets[0], sheet);
    });

    it('adopted styles merge sheets from parent', () => {
      const sharedCSS = '.my-class { color: red }';
      const localCSS = '.something-else { color: blue }';
      const root = { adoptedStyleSheets: [] };
      const cache = new Map();
      const sharedSheet = new CSSStyleSheet();
      const localSheet = new CSSStyleSheet();
      cache.set(sharedCSS, sharedSheet);
      cache.set(localCSS, localSheet);

      const p = new AdoptedStyleSheetsStyles([sharedCSS], cache, null);
      const s = new AdoptedStyleSheetsStyles([localCSS], cache, p);
      s.applyTo(root as any);

      assert.equal(root.adoptedStyleSheets.length, 2);
      assert.strictEqual(root.adoptedStyleSheets[0], sharedSheet);
      assert.strictEqual(root.adoptedStyleSheets[1], localSheet);
    });
  });
});
