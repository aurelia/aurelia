import { IRenderContext } from '@aurelia/runtime';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { CustomElementResource } from '@aurelia/runtime';
import { Router, ViewportContent } from '@aurelia/router';
import { assert } from '@aurelia/testing';

const define = (CustomElementResource as any).define;

describe('ViewportContent', function () {
  it('can be created', function () {
    const sut = new ViewportContent();
  });

  describe('resolving globals', function () {
    this.timeout(5000);

    async function $setup(dependencies: any[] = []) {
      const container = BasicConfiguration.createContainer();
      const router = container.get(Router);
      return { container, router };
    }

    it('resolves component name from string', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      container.register(Global);
      const viewport = new ViewportContent('global', null, null, router.container as unknown as IRenderContext);
      assert.strictEqual(viewport.componentName(), 'global', `viewport.componentName()`);
    });
    it('resolves component name from type', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      container.register(Global);
      const viewport = new ViewportContent('global', null, null, router.container as unknown as IRenderContext);
      assert.strictEqual(viewport.componentName(), 'global', `viewport.componentName()`);
    });

    it('resolves component type from string', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      container.register(Global);
      const viewport = new ViewportContent('global', null, null, router.container as unknown as IRenderContext);
      assert.strictEqual(viewport.componentType(router.container as unknown as IRenderContext), Global, `viewport.componentType(router.container as unknown as IRenderContext)`);
    });
    it('resolves component type from type', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      container.register(Global);
      const viewport = new ViewportContent(Global, null, null, router.container as unknown as IRenderContext);
      assert.strictEqual(viewport.componentType(router.container as unknown as IRenderContext), Global, `viewport.componentType(router.container as unknown as IRenderContext)`);
    });

    it('resolves component instance from string', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      container.register(Global);
      const viewport = new ViewportContent('global', null, null, router.container as unknown as IRenderContext);
      const component = viewport.componentInstance(router.container as unknown as IRenderContext);
      assert.strictEqual(component.constructor, Global, `component.constructor`);
    });
    it('resolves component instance from type', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      container.register(Global);
      // Registration.alias(CustomElementResource.keyFrom('global'), Global).register(container);

      const viewport = new ViewportContent(Global, null, null, router.container as unknown as IRenderContext);
      const component = viewport.componentInstance(router.container as unknown as IRenderContext);
      assert.strictEqual(component.constructor, Global, `component.constructor`);
    });
  });
});
