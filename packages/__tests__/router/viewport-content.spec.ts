import { IRouter, ViewportContent, RoutingInstruction, Viewport } from '@aurelia/router';
import { CustomElement } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { createFixture } from './_shared/create-fixture.js';

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

    it('resolves component instance from string', async function () {
      const Global = define({ name: 'global', template: 'global' }, null);
      const App = define({ name: 'app', template: '<au-viewport></au-viewport>' });

      const { container, router, tearDown } = await createFixture(App);
      const viewport = router.allEndpoints('Viewport')[0];
      const connectedCE = viewport.connectedCE;
      container.register(Global);
      const viewportContent = new ViewportContent(router, viewport, null, true, RoutingInstruction.create('global'), null, connectedCE);
      const component = viewportContent.toComponentInstance(connectedCE.container, connectedCE.controller, connectedCE.element);
      assert.strictEqual(component.constructor, Global, `component.constructor`);

      await tearDown();
    });
    it('resolves component instance from type', async function () {
      const Global = define({ name: 'global', template: 'global' }, null);
      const App = define({ name: 'app', template: '<au-viewport></au-viewport>' });

      const { container, router, tearDown } = await createFixture(App);
      const viewport = router.allEndpoints('Viewport')[0];
      const connectedCE = viewport.connectedCE;

      container.register(Global);
      // Registration.aliasTo(CustomElement.keyFrom('global'), Global).register(container);

      const viewportContent = new ViewportContent(router, viewport, null, true, RoutingInstruction.create('global'), null, connectedCE);
      const component = viewportContent.toComponentInstance(connectedCE.container, connectedCE.controller, connectedCE.element);
      assert.strictEqual(component.constructor, Global, `component.constructor`);

      await tearDown();
    });
  });
});
