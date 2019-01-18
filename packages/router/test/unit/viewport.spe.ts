import { Registration } from '@aurelia/kernel';
import { expect } from 'chai';
import { BasicConfiguration } from '../../../jit-html-browser/src/index';
import { CustomElementResource } from '../../../runtime/src/index';
import { Router, Viewport } from '../../src/index';
import { registerComponent } from './utils';

const define = (CustomElementResource as any).define;

describe('Viewport', () => {
  it('can be created', () => {
    const sut = new Viewport(null, null, null, null, null, null);
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
      const viewport = new Viewport(router, 'main', null, null, null, null);
      expect(viewport.componentName('global')).to.equal('global');
    });
    it('resolves component name from type', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      registerComponent(container, Global);
      const viewport = new Viewport(router, 'main', null, null, null, null);
      expect(viewport.componentName(Global)).to.equal('global');
    });

    it('resolves component type from string', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      registerComponent(container, Global);
      const viewport = new Viewport(router, 'main', null, null, null, null);
      expect(viewport.componentType('global')).to.equal(Global);
    });
    it('resolves component type from type', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      registerComponent(container, Global);
      const viewport = new Viewport(router, 'main', null, null, null, null);
      expect(viewport.componentType(Global)).to.equal(Global);
    });

    it('resolves component instance from string', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      registerComponent(container, Global);
      const viewport = new Viewport(router, 'main', null, null, null, null);
      const component = viewport.componentInstance('global');
      expect(component.constructor).to.equal(Global);
    });
    it('resolves component instance from type', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, router } = await $setup([Local]);

      registerComponent(container, Global);
      // Registration.alias(CustomElementResource.keyFrom('global'), Global).register(container);

      const viewport = new Viewport(router, 'main', null, null, null, null);
      const component = viewport.componentInstance(Global);
      expect(component.constructor).to.equal(Global);
    });
  });
});
