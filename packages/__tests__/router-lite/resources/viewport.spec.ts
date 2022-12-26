import { IRouter, IRouteViewModel, Params, route, Router, ViewportCustomElement } from '@aurelia/router-lite';
import { CustomElement, customElement, IPlatform } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from '../_shared/create-fixture.js';

describe('viewport', function () {
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
});
