import { IContainer, resolve } from '@aurelia/kernel';
import { CustomElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

import { createFixture } from './_shared/create-fixture.js';

describe('router/viewport.spec.ts', function () {
  it('can be created', async function () {
    const App = CustomElement.define({ name: 'app', template: '<au-viewport></au-viewport>' });

    const { router, tearDown } = await createFixture(App);

    const viewport: any = router.allEndpoints('Viewport').filter(vp => vp.name === 'default')[0];
    assert.strictEqual(viewport.name, 'default', `name === 'default'`);

    await tearDown();
  });

  it('can understand exist attributes', async function () {
    const App = CustomElement.define({ name: 'app', template: '<au-viewport no-link></au-viewport>' });

    const { router, tearDown } = await createFixture(App);

    const viewport: any = router.allEndpoints('Viewport').filter(vp => vp.name === 'default')[0];
    assert.strictEqual(viewport.options.noLink, true, `noLink === true`);

    await tearDown();
  });

  it('loads default component', async function () {
    const One = CustomElement.define({ name: 'one', template: '!one!' });
    const App = CustomElement.define({ name: 'app', template: '<au-viewport default="one"></au-viewport>', dependencies: [One] });

    const { host, tearDown } = await createFixture(App);

    assert.strictEqual(host.textContent, '!one!', `default="one" loaded`);

    await tearDown();
  });

  it('loads sibling default components', async function () {
    const One = CustomElement.define({ name: 'one', template: '!one!' });
    const Two = CustomElement.define({ name: 'two', template: '!two!' });
    const App = CustomElement.define({
      name: 'app', dependencies: [One, Two],
      template: '<au-viewport name="left" default="one"></au-viewport><au-viewport name="right" default="two"></au-viewport>',
    });

    const { host, tearDown } = await createFixture(App);

    assert.strictEqual(host.textContent, '!one!!two!', `default="one" default="two" loaded`);

    await tearDown();
  });

  it('loads recursive default components', async function () {
    const One = CustomElement.define({ name: 'one', template: '!one!<au-viewport default="two"></au-viewport>' });
    const Two = CustomElement.define({ name: 'two', template: '!two!' });
    const App = CustomElement.define({
      name: 'app', dependencies: [One, Two],
      template: '<au-viewport name="left" default="one"></au-viewport>',
    });

    const { host, tearDown } = await createFixture(App);

    assert.strictEqual(host.textContent, '!one!!two!', `default="one" default="two" loaded`);

    await tearDown();
  });

  it('loads component with correct container', async function () {
    let testContainer, testController;
    class OneClass {
      private readonly container: IContainer = testContainer = resolve(IContainer);
      created(controller) {
        testController = controller;
      }
    }
    const One = CustomElement.define({ name: 'one', template: '!one!' }, OneClass);
    const App = CustomElement.define({ name: 'app', template: '<au-viewport default="one"></au-viewport>', dependencies: [One] });

    const { host, tearDown } = await createFixture(App);

    assert.strictEqual(host.textContent, '!one!', `default="one" loaded`);
    assert.strictEqual(testContainer, testController.container, `injected container equals controller container`);

    await tearDown();
  });
});
