import { IRouter, ViewportContent, RoutingInstruction, Viewport } from 'aurelia-direct-router';
import { CustomElement } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

const define = (CustomElement as any).define;

describe('ViewportContent', function () {
  function $setup(dependencies: any[] = []) {
    const ctx = TestContext.create();
    const container = ctx.container;
    const router = container.get(IRouter);
    const viewport = new Viewport(router, 'default', null, null, true);
    return { container, router, viewport };
  }

  it('can be created', function () {
    const { container, router, viewport } = $setup();
    const sut = new ViewportContent(router, viewport);
  });

  describe('resolving globals', function () {
    this.timeout(5000);

    it('resolves component name from string', function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router, viewport } = $setup([Local]);

      container.register(Global);
      const viewportContent = new ViewportContent(router, viewport, null, true, RoutingInstruction.create('global'), null, container);
      assert.strictEqual(viewportContent.toComponentName(), 'global', `viewportContent.toComponentName()`);
    });
    it('resolves component name from type', function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router, viewport } = $setup([Local]);

      container.register(Global);
      const viewportContent = new ViewportContent(router, viewport, null, true, RoutingInstruction.create('global'), null, container);
      assert.strictEqual(viewportContent.toComponentName(), 'global', `viewportContent.toComponentName()`);
    });

    it('resolves component type from string', function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router, viewport } = $setup([Local]);

      container.register(Global);
      const viewportContent = new ViewportContent(router, viewport, null, true, RoutingInstruction.create('global'), null, container);
      assert.strictEqual(viewportContent.toComponentType(container), Global, `viewportContent.toComponentType(container)`);
    });
    it('resolves component type from type', function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router, viewport } = $setup([Local]);

      container.register(Global);
      const viewportContent = new ViewportContent(router, viewport, null, true, RoutingInstruction.create(Global), null, container);
      assert.strictEqual(viewportContent.toComponentType(container), Global, `viewportContent.toComponentType(container)`);
    });

    it('resolves component instance from string', function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router, viewport } = $setup([Local]);

      container.register(Global);
      const viewportContent = new ViewportContent(router, viewport, null, true, RoutingInstruction.create('global'), null, container);
      const component = viewportContent.toComponentInstance(container);
      assert.strictEqual(component.constructor, Global, `component.constructor`);
    });
    it('resolves component instance from type', function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router, viewport } = $setup([Local]);

      container.register(Global);
      // Registration.aliasTo(CustomElement.keyFrom('global'), Global).register(container);

      const viewportContent = new ViewportContent(router, viewport, null, true, RoutingInstruction.create(Global), null, container);
      const component = viewportContent.toComponentInstance(container);
      assert.strictEqual(component.constructor, Global, `component.constructor`);
    });
  });
});
