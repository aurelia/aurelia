import { route } from '@aurelia/router';
import { containerless, customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';
import { tasksSettled } from '@aurelia/runtime';

describe('router/router-containerless.spec.ts', function () {
  it('does not render container when the routable component has @containerless', async function () {

    @containerless()
    @customElement({
      name: 'foo',
      template: 'foo'
    })
    class Foo {}

    @route({
      routes: [
        { id: 'foo', path: '', component: Foo },
      ]
    })
    @customElement({
      name: 'root',
      template: 'root <au-viewport>'
    })
    class App {}

    const { host } = await start({ appRoot: App });

    assert.strictEqual(null, host.querySelector('foo'));
  });

  it('cleans up when rendering another component after a containerless component', async function () {
    @containerless()
    @customElement({ name: 'foo', template: 'foo' })
    class Foo {}

    @customElement({ name: 'normal-foo', template: 'normal-foo' })
    class NormalFoo {}

    @route({
      routes: [
        { id: 'foo', path: '', component: Foo },
        { id: 'normal-foo', path: 'normal-foo', component: NormalFoo },
      ]
    })
    @customElement({
      name: 'root',
      template: 'root <a href="./normal-foo"></a><au-viewport>'
    })
    class App {}

    const { host } = await start({ appRoot: App });

    assert.strictEqual(null, host.querySelector('foo'));
    assert.html.textContent(host.querySelector('au-viewport'), 'foo');

    host.querySelector('a').click();

    await tasksSettled();
    assert.html.textContent(host.querySelector('au-viewport'), 'normal-foo');
    assert.notIncludes(host.innerHTML, '<!--au-start-->');
    assert.includes(host.innerHTML, '<normal-foo>normal-foo</normal-foo>');
  });

  it('renders routed content when the au-viewport is containerless', async function () {
    @customElement({ name: 'foo', template: 'foo' })
    class Foo {}

    @route({
      routes: [
        { id: 'foo', path: '', component: Foo },
      ]
    })
    @customElement({
      name: 'root',
      template: 'root <au-viewport containerless></au-viewport>'
    })
    class App {}

    const { host } = await start({ appRoot: App });

    assert.html.textContent(host, 'root foo');
    assert.strictEqual(null, host.querySelector('au-viewport'));
    assert.includes(host.innerHTML, '<foo>foo</foo>');
  });

  it('renders a containerless routed component into a containerless au-viewport', async function () {
    @containerless()
    @customElement({ name: 'foo', template: 'foo' })
    class Foo {}

    @route({
      routes: [
        { id: 'foo', path: '', component: Foo },
      ]
    })
    @customElement({
      name: 'root',
      template: 'root <au-viewport containerless></au-viewport>'
    })
    class App {}

    const { host } = await start({ appRoot: App });

    assert.html.textContent(host, 'root foo');
    assert.strictEqual(null, host.querySelector('au-viewport'));
    assert.strictEqual(null, host.querySelector('foo'));
    assert.includes(host.innerHTML, 'root <!--au-start--><!--au-start-->foo<!--au-end--><!--au-end-->');
  });

  it('renders routed content through nested containerless au-viewports', async function () {
    @customElement({ name: 'grand-child', template: 'grand-child' })
    class GrandChild {}

    @route({
      routes: [
        { id: 'grand-child', path: '', component: GrandChild },
      ]
    })
    @customElement({
      name: 'child-host',
      template: 'child-host <au-viewport containerless></au-viewport>'
    })
    class ChildHost {}

    @route({
      routes: [
        { id: 'child-host', path: '', component: ChildHost },
      ]
    })
    @customElement({
      name: 'root',
      template: 'root <au-viewport containerless></au-viewport>'
    })
    class App {}

    const { host } = await start({ appRoot: App });

    assert.html.textContent(host, 'root child-host grand-child');
    assert.strictEqual(null, host.querySelector('au-viewport'));
    assert.includes(host.innerHTML, '<child-host>child-host <!--au-start--><grand-child>grand-child</grand-child><!--au-end--></child-host>');
  });

  it('renders a containerless routed component through three nested containerless au-viewports', async function () {
    @containerless()
    @customElement({ name: 'great-grand-child', template: 'great-grand-child' })
    class GreatGrandChild {}

    @route({
      routes: [
        { id: 'great-grand-child', path: '', component: GreatGrandChild },
      ]
    })
    @customElement({
      name: 'grand-child-host',
      template: 'grand-child-host <au-viewport containerless></au-viewport>'
    })
    class GrandChildHost {}

    @route({
      routes: [
        { id: 'grand-child-host', path: '', component: GrandChildHost },
      ]
    })
    @customElement({
      name: 'child-host',
      template: 'child-host <au-viewport containerless></au-viewport>'
    })
    class ChildHost {}

    @route({
      routes: [
        { id: 'child-host', path: '', component: ChildHost },
      ]
    })
    @customElement({
      name: 'root',
      template: 'root <au-viewport containerless></au-viewport>'
    })
    class App {}

    const { host } = await start({ appRoot: App });

    assert.html.textContent(host, 'root child-host grand-child-host great-grand-child');
    assert.strictEqual(null, host.querySelector('au-viewport'));
    assert.strictEqual(null, host.querySelector('great-grand-child'));
    assert.includes(host.innerHTML, '<child-host>child-host <!--au-start--><grand-child-host>grand-child-host <!--au-start--><!--au-start-->great-grand-child<!--au-end--><!--au-end--></grand-child-host><!--au-end--></child-host>');
  });
});
