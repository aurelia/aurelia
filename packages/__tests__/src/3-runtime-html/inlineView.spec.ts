import { customElement, inlineView } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/inlineView.spec.ts', function () {

  it('@inlineView before @customElement(NAME)', async function () {
    @inlineView('fizz-buzz')
    @customElement('foo-bar')
    class FooBar { }

    const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);

    await startPromise!;
    const fooBar = appHost.querySelector('foo-bar');
    assert.notEqual(fooBar, null, 'foo-bar not found');
    assert.html.textContent(fooBar, 'fizz-buzz', 'foo-bar content');

    await stop(true);
  });

  it('@inlineView after @customElement(NAME)', async function () {
    @customElement('foo-bar')
    @inlineView('fizz-buzz')
    class FooBar { }

    const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);

    await startPromise!;
    const fooBar = appHost.querySelector('foo-bar');
    assert.notEqual(fooBar, null, 'foo-bar not found');
    assert.html.textContent(fooBar, 'fizz-buzz', 'foo-bar content');

    await stop(true);
  });

  it('@inlineView before @customElement({NAME, TEMPLATE})', async function () {
    @inlineView('fizz-buzz')
    @customElement({ name: 'foo-bar', template: 'foo-bar' })
    class FooBar { }

    const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);

    await startPromise!;
    const fooBar = appHost.querySelector('foo-bar');
    assert.notEqual(fooBar, null, 'foo-bar not found');
    assert.html.textContent(fooBar, 'fizz-buzz', 'foo-bar content');

    await stop(true);
  });

  it('@inlineView after @customElement({NAME, TEMPLATE})', async function () {
    @customElement({ name: 'foo-bar', template: 'foo-bar' })
    @inlineView('fizz-buzz')
    class FooBar { }

    const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);

    await startPromise!;
    const fooBar = appHost.querySelector('foo-bar');
    assert.notEqual(fooBar, null, 'foo-bar not found');
    assert.html.textContent(fooBar, 'fizz-buzz', 'foo-bar content');

    await stop(true);
  });
});
