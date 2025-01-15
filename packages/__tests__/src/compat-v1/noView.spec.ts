import { resolve } from '@aurelia/kernel';
import { noView } from '@aurelia/compat-v1';
import { customElement, ICustomElementViewModel, IHydratedController, INode } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('compat-v1/noView.spec.ts', function () {

  it('@noView before @customElement(NAME)', async function () {
    let attached = false;
    @noView
    @customElement('foo-bar')
    class FooBar implements ICustomElementViewModel {
      attached(_initiator: IHydratedController): void | Promise<void> {
        attached = true;
      }
    }

    const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);

    await startPromise!;
    const fooBar = appHost.querySelector('foo-bar');
    assert.notEqual(fooBar, null, 'foo-bar not found');
    assert.html.textContent(fooBar, '', 'foo-bar content');

    assert.strictEqual(attached, true, 'attached not called');

    await stop(true);
  });

  it('@noView after @customElement(NAME)', async function () {
    let attached = false;
    @customElement('foo-bar')
    @noView
    class FooBar implements ICustomElementViewModel {
      attached(_initiator: IHydratedController): void | Promise<void> {
        attached = true;
      }
    }

    const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);

    await startPromise!;
    const fooBar = appHost.querySelector('foo-bar');
    assert.notEqual(fooBar, null, 'foo-bar not found');
    assert.html.textContent(fooBar, '', 'foo-bar content');

    assert.strictEqual(attached, true, 'attached not called');

    await stop(true);
  });

  it('@noView before @customElement({NAME, TEMPLATE})', async function () {
    let attached = false;
    @noView
    @customElement({ name: 'foo-bar', template: 'foo-bar' })
    class FooBar implements ICustomElementViewModel {
      attached(_initiator: IHydratedController): void | Promise<void> {
        attached = true;
      }
    }

    const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);

    await startPromise!;
    const fooBar = appHost.querySelector('foo-bar');
    assert.notEqual(fooBar, null, 'foo-bar not found');
    assert.html.textContent(fooBar, '', 'foo-bar content');

    assert.strictEqual(attached, true, 'attached not called');

    await stop(true);
  });

  it('@noView after @customElement({NAME, TEMPLATE})', async function () {
    let attached = false;
    @customElement({ name: 'foo-bar', template: 'foo-bar' })
    @noView
    class FooBar implements ICustomElementViewModel {
      attached(_initiator: IHydratedController): void | Promise<void> {
        attached = true;
      }
    }

    const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);

    await startPromise!;
    const fooBar = appHost.querySelector('foo-bar');
    assert.notEqual(fooBar, null, 'foo-bar not found');
    assert.html.textContent(fooBar, '', 'foo-bar content');

    assert.strictEqual(attached, true, 'attached not called');

    await stop(true);
  });

  it('@noView with @customElement(NAME) and projected content', async function () {
    let attached = false;
    @noView
    @customElement('foo-bar')
    class FooBar implements ICustomElementViewModel {
      attached(_initiator: IHydratedController): void | Promise<void> {
        attached = true;
      }
    }

    const { appHost, stop, startPromise } = createFixture(`<foo-bar>fizz-buzz</foo-bar>`, undefined, [FooBar]);

    await startPromise!;
    const fooBar = appHost.querySelector('foo-bar');
    assert.notEqual(fooBar, null, 'foo-bar not found');
    assert.html.textContent(fooBar, '', 'foo-bar content');

    assert.strictEqual(attached, true, 'attached not called');

    await stop(true);
  });

  it('@noView with @customElement({NAME, TEMPLATE}) and projected content', async function () {
    let attached = false;
    @noView
    @customElement({ name: 'foo-bar', template: 'foo-bar' })
    class FooBar implements ICustomElementViewModel {
      attached(_initiator: IHydratedController): void | Promise<void> {
        attached = true;
      }
    }

    const { appHost, stop, startPromise } = createFixture(`<foo-bar>fizz-buzz</foo-bar>`, undefined, [FooBar]);

    await startPromise!;
    const fooBar = appHost.querySelector('foo-bar');
    assert.notEqual(fooBar, null, 'foo-bar not found');
    assert.html.textContent(fooBar, '', 'foo-bar content');

    assert.strictEqual(attached, true, 'attached not called');

    await stop(true);
  });

  it('@noView with @customElement and injected node', async function () {
    @noView
    @customElement({ name: 'foo-bar', template: 'foo-bar' })
    class FooBar implements ICustomElementViewModel {
      private readonly host: INode<Element> = resolve(INode) as INode<Element>;
      attached(_initiator: IHydratedController): void | Promise<void> {
        this.host.textContent = '42';
      }
    }

    const { appHost, stop, startPromise } = createFixture(`<foo-bar>fizz-buzz</foo-bar>`, undefined, [FooBar]);

    await startPromise!;
    const fooBar = appHost.querySelector('foo-bar');
    assert.notEqual(fooBar, null, 'foo-bar not found');
    assert.html.textContent(fooBar, '42', 'foo-bar content');

    await stop(true);
  });

  it('@noView()', async function () {
    let attached = false;
    @noView()
    @customElement('foo-bar')
    class FooBar implements ICustomElementViewModel {
      attached(_initiator: IHydratedController): void | Promise<void> {
        attached = true;
      }
    }

    const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);

    await startPromise!;
    const fooBar = appHost.querySelector('foo-bar');
    assert.notEqual(fooBar, null, 'foo-bar not found');
    assert.html.textContent(fooBar, '', 'foo-bar content');

    assert.strictEqual(attached, true, 'attached not called');

    await stop(true);
  });
});
