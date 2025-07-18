import { route } from '@aurelia/router';
import { containerless, customElement, IPlatform } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

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

    const { host, container } = await start({ appRoot: App });

    assert.strictEqual(null, host.querySelector('foo'));
    assert.html.textContent(host.querySelector('au-viewport'), 'foo');

    host.querySelector('a').click();

    await container.get(IPlatform).domQueue.yield();
    assert.html.textContent(host.querySelector('au-viewport'), 'normal-foo');
    assert.notIncludes(host.innerHTML, '<!--au-start-->');
    assert.includes(host.innerHTML, '<normal-foo>normal-foo</normal-foo>');
  });
});
