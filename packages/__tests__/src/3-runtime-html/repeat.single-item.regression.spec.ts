import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/repeat.single-item.regression.spec.ts', function () {
  it('does not remove existing node when adding a second item (non-keyed)', function () {
    const { appHost, component, flush } = createFixture(
      `<div repeat.for="item of items">\${item}</div>`,
      class { items = [0]; }
    );

    // Get reference to the first item's DOM node
    const firstItemBefore = appHost.querySelector('div');
    assert.notStrictEqual(firstItemBefore, null);

    component.items.push(1);
    flush();

    // Check that the first item's DOM node is still the same (not recreated)
    const firstItemAfter = appHost.querySelector('div');
    const allDivs = appHost.querySelectorAll('div');

    assert.strictEqual(appHost.textContent, '01');
    assert.strictEqual(allDivs.length, 2);
    assert.strictEqual(firstItemBefore, firstItemAfter, 'First item DOM node should be reused, not recreated');
  });

  it('does not remove existing node when adding a second item (keyed)', function () {
    const { appHost, component, flush } = createFixture(
      `<div repeat.for="item of items; key: id">\${item.id}</div>`,
      class { items = [{ id: 0 }]; }
    );

    // Get reference to the first item's DOM node
    const firstItemBefore = appHost.querySelector('div');
    assert.notStrictEqual(firstItemBefore, null);

    component.items.push({ id: 1 });
    flush();

    // Check that the first item's DOM node is still the same (not recreated)
    const firstItemAfter = appHost.querySelector('div');
    const allDivs = appHost.querySelectorAll('div');

    assert.strictEqual(appHost.textContent, '01');
    assert.strictEqual(allDivs.length, 2);
    assert.strictEqual(firstItemBefore, firstItemAfter, 'First item DOM node should be reused, not recreated');
  });
});
