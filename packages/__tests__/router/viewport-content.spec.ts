import { IRouter, ViewportContent, ViewportInstruction } from '@aurelia/router';
import { CustomElement } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';

const define = (CustomElement as any).define;

describe('ViewportContent', function () {
  it('can be created', function () {
    const sut = new ViewportContent();
  });

  describe('resolving globals', function () {
    this.timeout(5000);

    function $setup(dependencies: any[] = []) {
      const ctx = TestContext.createHTMLTestContext();
      const container = ctx.container;
      const router = container.get(IRouter);
      return { container, router };
    }

    it('resolves component name from string', function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = $setup([Local]);

      container.register(Global);
      const viewport = new ViewportContent(router.createViewportInstruction('global'), null, router.container);
      assert.strictEqual(viewport.toComponentName(), 'global', `viewport.toComponentName()`);
    });
    it('resolves component name from type', function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = $setup([Local]);

      container.register(Global);
      const viewport = new ViewportContent(router.createViewportInstruction('global'), null, router.container);
      assert.strictEqual(viewport.toComponentName(), 'global', `viewport.toComponentName()`);
    });

    it('resolves component type from string', function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = $setup([Local]);

      container.register(Global);
      const viewport = new ViewportContent(router.createViewportInstruction('global'), null, router.container);
      assert.strictEqual(viewport.toComponentType(router.container), Global, `viewport.toComponentType(router.container)`);
    });
    it('resolves component type from type', function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = $setup([Local]);

      container.register(Global);
      const viewport = new ViewportContent(router.createViewportInstruction(Global), null, router.container);
      assert.strictEqual(viewport.toComponentType(router.container), Global, `viewport.toComponentType(router.container)`);
    });

    it('resolves component instance from string', function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = $setup([Local]);

      container.register(Global);
      const viewport = new ViewportContent(router.createViewportInstruction('global'), null, router.container);
      const component = viewport.toComponentInstance(router.container);
      assert.strictEqual(component.constructor, Global, `component.constructor`);
    });
    it('resolves component instance from type', function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = $setup([Local]);

      container.register(Global);
      // Registration.alias(CustomElement.keyFrom('global'), Global).register(container);

      const viewport = new ViewportContent(router.createViewportInstruction(Global), null, router.container);
      const component = viewport.toComponentInstance(router.container);
      assert.strictEqual(component.constructor, Global, `component.constructor`);
    });
  });
});
