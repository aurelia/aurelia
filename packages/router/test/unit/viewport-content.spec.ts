import { IRenderContext } from '@aurelia/runtime';
import { expect } from 'chai';
import { BasicConfiguration } from '../../../jit-html-browser/src/index';
import { CustomElementResource } from '../../../runtime/src/index';
import { Router } from '../../src/index';
import { ViewportContent } from '../../src/viewport-content';
import { registerComponent } from './utils';

const define = (CustomElementResource as any).define;

describe('ViewportContent', () => {
  it('can be created', () => {
    const sut = new ViewportContent();
  });

  describe('resolving globals', function () {
    this.timeout(30000);

    async function $setup(dependencies: any[] = []) {
      const container = BasicConfiguration.createContainer();
      const router = container.get(Router);
      return { container, router };
    }

    it('resolves component name from string', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      registerComponent(container, Global);
      const viewport = new ViewportContent('global', null, null, router.container as unknown as IRenderContext);
      expect(viewport.componentName()).to.equal('global');
    });
    it('resolves component name from type', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      registerComponent(container, Global);
      const viewport = new ViewportContent('global', null, null, router.container as unknown as IRenderContext);
      expect(viewport.componentName()).to.equal('global');
    });

    it('resolves component type from string', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      registerComponent(container, Global);
      const viewport = new ViewportContent('global', null, null, router.container as unknown as IRenderContext);
      expect(viewport.componentType(router.container as unknown as IRenderContext)).to.equal(Global);
    });
    it('resolves component type from type', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      registerComponent(container, Global);
      const viewport = new ViewportContent(Global, null, null, router.container as unknown as IRenderContext);
      expect(viewport.componentType(router.container as unknown as IRenderContext)).to.equal(Global);
    });

    it('resolves component instance from string', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      registerComponent(container, Global);
      const viewport = new ViewportContent('global', null, null, router.container as unknown as IRenderContext);
      const component = viewport.componentInstance(router.container as unknown as IRenderContext);
      expect(component.constructor).to.equal(Global);
    });
    it('resolves component instance from type', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      registerComponent(container, Global);
      // Registration.alias(CustomElementResource.keyFrom('global'), Global).register(container);

      const viewport = new ViewportContent(Global, null, null, router.container as unknown as IRenderContext);
      const component = viewport.componentInstance(router.container as unknown as IRenderContext);
      expect(component.constructor).to.equal(Global);
    });
  });
});
