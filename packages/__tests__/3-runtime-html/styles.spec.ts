import { DI, Registration } from '@aurelia/kernel';
import { Aurelia, CustomAttribute, CustomElement, INode, CustomAttributeType, Controller, ICustomElementViewModel, ILifecycle, NodeSequence } from '@aurelia/runtime';
import {
  AdoptedStyleSheetsStyles,
  CSSModulesProcessorRegistry,
  StyleConfiguration,
  StyleElementStyles,
  cssModules,
  IShadowDOMGlobalStyles,
  IShadowDOMStyles,
  ShadowDOMProjector
} from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('Styles', function () {
  async function startApp(configure: (au: Aurelia) => void) {
    const ctx = TestContext.createHTMLTestContext();
    const au = new Aurelia(ctx.container);
    configure(au);
    const host = ctx.createElement('div');
    class App { }
    const component = CustomElement.define({ name: 'app', template: ' ' }, App);
    au.app({ host, component });
    await au.start();
    return { au, ctx, host, container: au.container };
  }

  describe('CSS Modules Processor', function () {
    it('registry overrides class attribute', function () {
      const element = { className: '' };
      const container = DI.createContainer();
      container.register(Registration.instance(INode, element));
      const cssModulesLookup = {};
      const registry = new CSSModulesProcessorRegistry([cssModulesLookup]);

      registry.register(container);

      const attr = container.get<CustomAttributeType>(
        CustomAttribute.keyFrom('class')
      );

      assert.equal(CustomAttribute.isType(attr.constructor), true);
    });

    it('class attribute maps class names', function () {
      const element = { className: '' };
      const container = DI.createContainer();
      container.register(Registration.instance(INode, element));
      const cssModulesLookup = {
        'foo': 'bar',
        'baz': 'qux'
      };

      const registry = new CSSModulesProcessorRegistry([cssModulesLookup]);
      registry.register(container);

      const attr = container.get(CustomAttribute.keyFrom('class')) as any;
      attr.value = 'foo baz';
      attr.valueChanged();

      assert.equal(element.className, 'bar qux');
    });

    it('style function uses correct registry', function () {
      const element = { className: '' };
      const container = DI.createContainer();
      const childContainer = container.createChild();
      const cssModulesLookup = {
        'foo': 'bar',
        'baz': 'qux'
      };

      childContainer.register(Registration.instance(INode, element));
      cssModules(cssModulesLookup).register(childContainer);

      const attr = childContainer.get(CustomAttribute.keyFrom('class')) as any;
      attr.value = 'foo baz';
      attr.valueChanged();

      assert.equal(element.className, 'bar qux');
    });

    // TODO(fkleuver): Reactivate this test
    // it('components do not inherit parent component styles', function () {
    //   const rootContainer = DI.createContainer();
    //   const parentContainer = rootContainer.createChild();
    //   const cssModulesLookup = {};
    //   const registry = new CSSModulesProcessorRegistry([cssModulesLookup]);
    //   registry.register(parentContainer);

    //   const childContainer = parentContainer.createChild();

    //   const fromParent = parentContainer.findResource(CustomAttribute, 'class');
    //   const fromChild = childContainer.findResource(CustomAttribute, 'class');

    //   assert.equal(fromParent.name, 'class');
    //   assert.equal(fromChild, null);
    // });
  });

  describe('Shadow DOM', function () {
    it('registry provides root shadow dom styles', async function () {
      const rootStyles = '.my-class { color: red }';
      const { container, au } = await startApp(au => {
        au.register(StyleConfiguration.shadowDOM({
          sharedStyles: [rootStyles]
        }));
      });

      const childContainer = container.createChild();
      const s = childContainer.get(IShadowDOMGlobalStyles);

      assert.instanceOf(s, Object);
      assert.equal(typeof s.applyTo, 'function');

      await au.stop();
      au.dispose();
    });

    it('config passes root styles to container', async function () {
      const rootStyles = '.my-class { color: red }';
      const { container, ctx, au } = await startApp(au => {
        au.register(StyleConfiguration.shadowDOM({
          sharedStyles: [rootStyles]
        }));
      });

      const childContainer = container.createChild();
      const s = childContainer.get(IShadowDOMGlobalStyles);

      if (AdoptedStyleSheetsStyles.supported(ctx.dom)) {
        assert.instanceOf(s, AdoptedStyleSheetsStyles);
        assert.equal(s['styleSheets'].length, 1);
      } else {
        assert.instanceOf(s, StyleElementStyles);
        assert.equal(s['localStyles'].length, 1);
      }

      await au.stop();
      au.dispose();
    });

    it('element styles apply parent styles', function () {
      const ctx = TestContext.createHTMLTestContext();
      const root = { prepend() { return; } };
      const fake = {
        wasCalled: false,
        applyTo() { this.wasCalled = true; }
      };

      const s = new StyleElementStyles(ctx.dom, [], fake);
      s.applyTo(root as any);

      assert.equal(fake.wasCalled, true);
    });

    it('element styles apply by prepending style elements to shadow root', function () {
      const ctx = TestContext.createHTMLTestContext();
      const css = '.my-class { color: red }';
      const root = {
        element: null,
        prepend(styleElement) {
          this.element = styleElement;
        }
      };

      const s = new StyleElementStyles(ctx.dom, [css], null);
      s.applyTo(root as any);

      assert.equal(root.element.tagName, 'STYLE');
      assert.equal(root.element.innerHTML, css);
    });

    it('adopted styles apply parent styles', function () {
      const ctx = TestContext.createHTMLTestContext();
      const root = { adoptedStyleSheets: [] };
      const fake = {
        wasCalled: false,
        applyTo() { this.wasCalled = true; }
      };

      const s = new AdoptedStyleSheetsStyles(ctx.dom, [], new Map(), fake);
      s.applyTo(root as any);

      assert.equal(fake.wasCalled, true);
    });

    it.skip('projector applies styles during projection', function () {
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
          new StyleElementStyles(ctx.dom, [css], null)
        )
      );

      const component = new FooBar();
      const controller = Controller.forCustomElement(
        null,
        ctx.container,
        component as ICustomElementViewModel<HTMLElement>,
        ctx.lifecycle,
        host,
        void 0,
        null,
      );

      const seq = NodeSequence.empty;
      const projector = controller.projector as ShadowDOMProjector;

      projector.project(seq);

      const root = projector.provideEncapsulationSource();

      assert.strictEqual(root.firstElementChild.innerHTML, css);
    });

    if (!AdoptedStyleSheetsStyles.supported(TestContext.createHTMLTestContext().dom)) {
      return;
    }

    it('adopted styles apply by setting adopted style sheets on shadow root', function () {
      const css = '.my-class { color: red }';
      const root = { adoptedStyleSheets: [] };
      const ctx = TestContext.createHTMLTestContext();

      const s = new AdoptedStyleSheetsStyles(ctx.dom, [css], new Map(), null);
      s.applyTo(root as any);

      assert.equal(root.adoptedStyleSheets.length, 1);
      assert.instanceOf(root.adoptedStyleSheets[0], ctx.dom.CSSStyleSheet);
    });

    it('adopted styles use cached style sheets', function () {
      const ctx = TestContext.createHTMLTestContext();
      const css = '.my-class { color: red }';
      const root = { adoptedStyleSheets: [] };
      const cache = new Map();
      const sheet = new ctx.dom.CSSStyleSheet();
      cache.set(css, sheet);

      const s = new AdoptedStyleSheetsStyles(ctx.dom, [css], cache, null);
      s.applyTo(root as any);

      assert.equal(root.adoptedStyleSheets.length, 1);
      assert.strictEqual(root.adoptedStyleSheets[0], sheet);
    });

    it('adopted styles merge sheets from parent', function () {
      const ctx = TestContext.createHTMLTestContext();
      const sharedCSS = '.my-class { color: red }';
      const localCSS = '.something-else { color: blue }';
      const root = { adoptedStyleSheets: [] };
      const cache = new Map();
      const sharedSheet = new ctx.dom.CSSStyleSheet();
      const localSheet = new ctx.dom.CSSStyleSheet();
      cache.set(sharedCSS, sharedSheet);
      cache.set(localCSS, localSheet);

      const p = new AdoptedStyleSheetsStyles(ctx.dom, [sharedCSS], cache, null);
      const s = new AdoptedStyleSheetsStyles(ctx.dom, [localCSS], cache, p);
      s.applyTo(root as any);

      assert.equal(root.adoptedStyleSheets.length, 2);
      assert.strictEqual(root.adoptedStyleSheets[0], sharedSheet);
      assert.strictEqual(root.adoptedStyleSheets[1], localSheet);
    });
  });
});
