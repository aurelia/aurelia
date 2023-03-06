import { IRouter, IRouteViewModel, Params, route, Router, ViewportCustomElement } from '@aurelia/router-lite';
import { CustomElement, customElement, IPlatform } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from '../_shared/create-fixture.js';

describe('router-lite/resources/viewport.spec.ts', function () {

  function assertText(vps: Element[], expected: string[]) {
    for (let i = 0; i < expected.length; i++) {
      assert.html.textContent(vps[i], expected[i], `content #${i + 1}`);
    }
  }

  it('sibling viewports with non-default routes are supported by binding the default property to null', async function () {

    @customElement({ name: 'ce-one', template: 'ce1' })
    class CeOne implements IRouteViewModel { }

    @customElement({ name: 'ce-two', template: 'ce2' })
    class CeTwo implements IRouteViewModel { }

    @route({
      routes: [
        {
          path: ['', 'ce-one'],
          component: CeOne,
        },
        {
          path: 'ce-two',
          component: CeTwo,
        },
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
                <au-viewport name="$1"></au-viewport>
                <au-viewport name="$2" default.bind="null"></au-viewport>
            `
    })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
    const queue = container.get(IPlatform).domWriteQueue;
    const router = container.get<Router>(IRouter);

    await queue.yield();
    const [vp1, vp2] = Array.from(host.querySelectorAll('au-viewport'));
    const vm1 = CustomElement.for<ViewportCustomElement>(vp1).viewModel;
    const vm2 = CustomElement.for<ViewportCustomElement>(vp2).viewModel;
    assert.strictEqual(vm1.name, '$1');
    assert.strictEqual(vm2.name, '$2');
    assert.html.textContent(vp1, 'ce1');
    assert.html.textContent(vp2, '');

    await router.load('ce-two');
    await queue.yield();
    assert.html.textContent(vp1, 'ce2');
    assert.html.textContent(vp2, '');

    await router.load('ce-one');
    await queue.yield();
    assert.html.textContent(vp1, 'ce1');
    assert.html.textContent(vp2, '');

    await router.load('ce-two@$1+ce-one@$2');
    await queue.yield();
    assert.html.textContent(vp1, 'ce2');
    assert.html.textContent(vp2, 'ce1');

    await au.stop();
  });

  it('sibling viewports in children with non-default routes are supported by binding the default property to null', async function () {

    @customElement({ name: 'ce-11', template: `ce11` })
    class CeOneOne implements IRouteViewModel { }

    @customElement({ name: 'ce-21', template: `ce21` })
    class CeTwoOne implements IRouteViewModel { }

    @route({
      routes: [
        {
          path: ['', 'ce-11'],
          component: CeOneOne,
        }
      ]
    })
    @customElement({
      name: 'ce-one', template: `ce1
        <au-viewport name="$1"></au-viewport>
        <au-viewport name="$2" default.bind="null"></au-viewport>` })
    class CeOne implements IRouteViewModel { }

    @route({
      routes: [
        {
          path: ['', 'ce-21'],
          component: CeTwoOne,
        }
      ]
    })
    @customElement({
      name: 'ce-two', template: `ce2
    <au-viewport name="$1"></au-viewport>
    <au-viewport name="$2" default.bind="null"></au-viewport>` })
    class CeTwo implements IRouteViewModel { }

    @route({
      routes: [
        {
          path: ['', 'ce-one'],
          component: CeOne,
        },
        {
          path: 'ce-two',
          component: CeTwo,
        },
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
                <au-viewport name="$1"></au-viewport>
                <au-viewport name="$2" default.bind="null"></au-viewport>
            `
    })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
    const queue = container.get(IPlatform).domWriteQueue;
    const router = container.get<Router>(IRouter);

    await queue.yield();
    assert.html.textContent(host, 'ce1 ce11');

    await router.load('ce-two');
    await queue.yield();
    assert.html.textContent(host, 'ce2 ce21');

    await router.load('ce-one/ce-11');
    await queue.yield();
    assert.html.textContent(host, 'ce1 ce11');

    await router.load('ce-two@$1+ce-one@$2');
    await queue.yield();
    assert.html.textContent(host, 'ce2 ce21 ce1 ce11');

    await au.stop();
  });

  it('sibling viewports in children with non-default routes are supported by binding the default property to null - transition plan: invoke-lifecycle', async function () {

    @customElement({ name: 'ce-21', template: `ce21` })
    class CeTwoOne implements IRouteViewModel { }

    @customElement({
      name: 'ce-one', template: `ce1`
    })
    class CeOne implements IRouteViewModel { }

    @route({
      routes: [
        {
          path: ['', 'ce-21'],
          component: CeTwoOne,
        }
      ]
    })
    @customElement({
      name: 'ce-two', template: `ce2
    <au-viewport name="$1"></au-viewport>
    <au-viewport name="$2" default.bind="null"></au-viewport>` })
    class CeTwo implements IRouteViewModel { }

    @route({
      routes: [
        {
          path: ['', 'ce-one'],
          component: CeOne,
        },
        {
          path: 'ce-two',
          component: CeTwo,
        },
      ],
      transitionPlan() { return 'invoke-lifecycles'; }
    })
    @customElement({
      name: 'ro-ot',
      template: `
                <au-viewport name="$1"></au-viewport>
                <au-viewport name="$2" default.bind="null"></au-viewport>
            `
    })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
    const queue = container.get(IPlatform).domWriteQueue;
    const router = container.get<Router>(IRouter);

    await queue.yield();
    const [vp1, vp2] = Array.from(host.querySelectorAll('au-viewport'));
    const vm1 = CustomElement.for<ViewportCustomElement>(vp1).viewModel;
    const vm2 = CustomElement.for<ViewportCustomElement>(vp2).viewModel;
    assert.strictEqual(vm1.name, '$1');
    assert.strictEqual(vm2.name, '$2');
    assert.html.textContent(vp1, 'ce1');
    assert.html.textContent(vp2, '');

    await router.load('ce-two/ce-21');
    await queue.yield();
    assert.html.textContent(vp1, 'ce2 ce21');
    assert.html.textContent(vp2, '');

    await router.load('ce-two@$2+ce-one@$1');
    await queue.yield();
    assert.html.textContent(vp1, 'ce1');
    assert.html.textContent(vp2, 'ce2 ce21');

    await au.stop();
  });

  it('sibling viewports - load non-empty-route@non-default-vp+empty-alias-route@default-vp', async function () {

    @customElement({ name: 'ce-one', template: 'ce1' })
    class CeOne implements IRouteViewModel { }

    @customElement({ name: 'ce-two', template: 'ce2 ${id}' })
    class CeTwo implements IRouteViewModel {
      id: string;
      public canLoad(params: Params): boolean {
        this.id = params.id;
        return true;
      }
    }

    @route({
      routes: [
        {
          path: ['', 'ce-one'],
          component: CeOne,
        },
        {
          path: 'ce-two/:id',
          component: CeTwo,
        },
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
                <au-viewport name="$1"></au-viewport>
                <au-viewport name="$2" default.bind="null"></au-viewport>
            `
    })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
    const queue = container.get(IPlatform).domWriteQueue;
    const router = container.get<Router>(IRouter);

    await queue.yield();
    assert.html.textContent(host, 'ce1');

    await router.load('ce-two/42@$2+ce-one@$1');
    await queue.yield();
    assert.html.textContent(host, 'ce1 ce2 42');

    await au.stop();
  });

  // precondition: exists a mixture of named and unnamed viewports
  // action: components are attempted to be loaded into named viewports
  // expectation: components are loaded into named viewports
  it('targeted components can be loaded into named viewports even when default viewports are present', async function () {
    @customElement({ name: 'ce-one', template: 'ce1' })
    class CeOne implements IRouteViewModel { }

    @customElement({ name: 'ce-two', template: 'ce2 ${id}' })
    class CeTwo implements IRouteViewModel {
      id: string;
      public canLoad(params: Params): boolean {
        this.id = params.id;
        return true;
      }
    }

    @route({
      routes: [
        {
          path: 'ce-one',
          component: CeOne,
        },
        {
          path: 'ce-two/:id',
          component: CeTwo,
        },
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
                <au-viewport></au-viewport>
                <au-viewport name="$1"></au-viewport>
                <au-viewport></au-viewport>
                <au-viewport name="$2"></au-viewport>
                <au-viewport></au-viewport>
            `
    })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
    const queue = container.get(IPlatform).domWriteQueue;
    const router = container.get<Router>(IRouter);

    await queue.yield();
    const vps = Array.from(host.querySelectorAll('au-viewport'));
    const vms = vps.map(vp => CustomElement.for<ViewportCustomElement>(vp).viewModel);
    assert.deepStrictEqual(vms.map(vm => vm.name), ['default', '$1', 'default', '$2', 'default']);

    await router.load('ce-one@$1');
    await queue.yield();
    assertText(vps, ['', 'ce1', '', '', '']);

    await router.load('ce-one@$2+ce-two/42@$1');
    await queue.yield();
    assertText(vps, ['', 'ce2 42', '', 'ce1', '']);

    await router.load('ce-one+ce-two/42');
    await queue.yield();
    assertText(vps, ['ce1', 'ce2 42', '', '', '']);

    await au.stop();
  });

  it('viewport configuration for route is respected', async function () {
    @customElement({ name: 'ce-one', template: 'ce1' })
    class CeOne implements IRouteViewModel { }

    @customElement({ name: 'ce-two', template: 'ce2 ${id}' })
    class CeTwo implements IRouteViewModel {
      id: string;
      public canLoad(params: Params): boolean {
        this.id = params.id;
        return true;
      }
    }

    @route({
      routes: [
        {
          path: 'ce-one',
          component: CeOne,
          viewport: '$2',
        },
        {
          path: 'ce-two/:id',
          component: CeTwo,
          viewport: '$1',
        },
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
                <au-viewport></au-viewport>
                <au-viewport name="$1"></au-viewport>
                <au-viewport></au-viewport>
                <au-viewport name="$2"></au-viewport>
                <au-viewport></au-viewport>
            `
    })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
    const queue = container.get(IPlatform).domWriteQueue;
    const router = container.get<Router>(IRouter);

    await queue.yield();
    const vps = Array.from(host.querySelectorAll('au-viewport'));
    const vms = vps.map(vp => CustomElement.for<ViewportCustomElement>(vp).viewModel);
    assert.deepStrictEqual(vms.map(vm => vm.name), ['default', '$1', 'default', '$2', 'default']);

    await router.load('ce-one');
    await queue.yield();
    assertText(vps, ['', '', '', 'ce1', '']);

    await router.load('ce-one+ce-two/42');
    await queue.yield();
    assertText(vps, ['', 'ce2 42', '', 'ce1', '']);

    try {
      await router.load('ce-one@$1');
      assert.fail('expected error for loading ce-one@$1');
    } catch {
      /** ignore */
    }

    try {
      await router.load('ce-two/42@$2');
      assert.fail('expected error for loading ce-two/42@$2');
    } catch {
      /** ignore */
    }

    await au.stop();
  });

  it('multiple routes can use the same viewport', async function () {
    @customElement({ name: 'ce-one', template: 'ce1' })
    class CeOne implements IRouteViewModel { }

    @customElement({ name: 'ce-two', template: 'ce2 ${id}' })
    class CeTwo implements IRouteViewModel {
      id: string;
      public canLoad(params: Params): boolean {
        this.id = params.id;
        return true;
      }
    }

    @route({
      routes: [
        {
          path: 'ce-one',
          component: CeOne,
          viewport: '$1',
        },
        {
          path: 'ce-two/:id',
          component: CeTwo,
          viewport: '$1',
        },
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
                <au-viewport></au-viewport>
                <au-viewport name="$1"></au-viewport>
            `
    })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
    const queue = container.get(IPlatform).domWriteQueue;
    const router = container.get<Router>(IRouter);

    await queue.yield();
    const vps = Array.from(host.querySelectorAll('au-viewport'));
    const vms = vps.map(vp => CustomElement.for<ViewportCustomElement>(vp).viewModel);
    assert.deepStrictEqual(vms.map(vm => vm.name), ['default', '$1']);

    await router.load('ce-one');
    await queue.yield();
    assertText(vps, ['', 'ce1']);

    await router.load('ce-two/42');
    await queue.yield();
    assertText(vps, ['', 'ce2 42']);

    try {
      await router.load('ce-one+ce-two/42');
      assert.fail('expected error for loading ce-one+ce-two/42');
    } catch {
      /** ignore */
    }
    await au.stop();
  });

  it('used-by is respected', async function () {
    @customElement({ name: 'ce-one', template: 'ce1' })
    class CeOne implements IRouteViewModel { }

    @customElement({ name: 'ce-two', template: '${id1} ce2 ${id2}' })
    class CeTwo implements IRouteViewModel {
      id1: string;
      id2: string;
      public canLoad(params: Params): boolean {
        this.id1 = params.id1;
        this.id2 = params.id2;
        return true;
      }
    }

    @route({
      routes: [
        {
          id: 'ce1',
          path: 'ce-one',
          component: CeOne,
        },
        {
          id: 'ce2',
          path: ':id1/foo/:id2',
          component: CeTwo,
        },
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
                <au-viewport used-by="whatever"></au-viewport>
                <au-viewport used-by="ce-two"></au-viewport>
                <au-viewport used-by="ce-one"></au-viewport>
            `
    })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
    const queue = container.get(IPlatform).domWriteQueue;
    const router = container.get<Router>(IRouter);

    await queue.yield();
    const vps = Array.from(host.querySelectorAll('au-viewport'));

    await router.load('ce-one');
    await queue.yield();
    assertText(vps, ['', '', 'ce1']);

    await router.load('42/foo/43');
    await queue.yield();
    assertText(vps, ['', '42 ce2 43', '']);

    await router.load('ce1+43/foo/42');
    await queue.yield();
    assertText(vps, ['', '43 ce2 42', 'ce1']);

    await au.stop();
  });

  it('comma-separated used-by is respected', async function () {
    @customElement({ name: 'ce-one', template: 'ce1' })
    class CeOne implements IRouteViewModel { }

    @customElement({ name: 'ce-two', template: '${id1} ce2 ${id2}' })
    class CeTwo implements IRouteViewModel {
      id1: string;
      id2: string;
      public canLoad(params: Params): boolean {
        this.id1 = params.id1;
        this.id2 = params.id2;
        return true;
      }
    }

    @route({
      routes: [
        {
          id: 'ce1',
          path: 'ce-one',
          component: CeOne,
        },
        {
          id: 'ce2',
          path: ':id1/foo/:id2',
          component: CeTwo,
        },
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
                <au-viewport used-by="whatever"></au-viewport>
                <au-viewport used-by="ce-one,ce-two"></au-viewport>
                <au-viewport used-by="ce-one"></au-viewport>
            `
    })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
    const queue = container.get(IPlatform).domWriteQueue;
    const router = container.get<Router>(IRouter);

    await queue.yield();
    const vps = Array.from(host.querySelectorAll('au-viewport'));

    await router.load('ce-one');
    await queue.yield();
    assertText(vps, ['', 'ce1', '']);

    await router.load('42/foo/43');
    await queue.yield();
    assertText(vps, ['', '42 ce2 43', '']);

    await router.load('43/foo/42+ce1');
    await queue.yield();
    assertText(vps, ['', '43 ce2 42', 'ce1']);

    try {
      await router.load('ce1+43/foo/42');
      assert.fail('expected failure due to no free viewport to handle "43/foo/42" from the instruction "ce1+43/foo/42"');
    } catch {
      /* ignore */
    }

    await au.stop();
  });

  it('a preceding default (without used-by) can load components', async function () {
    @customElement({ name: 'ce-one', template: 'ce1' })
    class CeOne implements IRouteViewModel { }

    @customElement({ name: 'ce-two', template: '${id1} ce2 ${id2}' })
    class CeTwo implements IRouteViewModel {
      id1: string;
      id2: string;
      public canLoad(params: Params): boolean {
        this.id1 = params.id1;
        this.id2 = params.id2;
        return true;
      }
    }

    @route({
      routes: [
        {
          id: 'ce1',
          path: 'ce-one',
          component: CeOne,
        },
        {
          id: 'ce2',
          path: ':id1/foo/:id2',
          component: CeTwo,
        },
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
                <au-viewport></au-viewport>
                <au-viewport used-by="ce-one,ce-two"></au-viewport>
            `
    })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
    const queue = container.get(IPlatform).domWriteQueue;
    const router = container.get<Router>(IRouter);

    await queue.yield();
    const vps = Array.from(host.querySelectorAll('au-viewport'));

    await router.load('ce-one');
    await queue.yield();
    assertText(vps, ['ce1', '']);

    await router.load('42/foo/43');
    await queue.yield();
    assertText(vps, ['42 ce2 43', '']);

    await router.load('43/foo/42+ce1');
    await queue.yield();
    assertText(vps, ['43 ce2 42', 'ce1']);

    await au.stop();
  });
});
