import { assert, createFixture } from '@aurelia/testing';

// when dom node sequences are linked again and again during rendering
// a lot of dom movement operations are performed unnecessarily
// this causes issues with focus and other stateful elements
// this test suite verifies that the fix for this issue works correctly
// the fix is to ensure that existing nodes are not unnecessarily re-linked or re-inserted
// https://github.com/aurelia/aurelia/issues/2089
describe('3-runtime-html/repeat.no-dom-movement.spec.ts', function () {
  it('[non-keyed] does not remove existing node when adding a second item', async function () {
    const { appHost, component } = createFixture(
      `<div repeat.for="item of items">\${item}</div>`,
      class { items = [0]; }
    );

    // Get reference to the first item's DOM node
    const firstItemBefore = appHost.querySelector('div');
    assert.notStrictEqual(firstItemBefore, null);

    // Set up MutationObserver to detect DOM removals
    let nodeWasRemoved = false;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const removedNode of mutation.removedNodes) {
          if (removedNode === firstItemBefore) {
            nodeWasRemoved = true;
          }
        }
      }
    });

    observer.observe(appHost, { childList: true, subtree: true });

    component.items.push(1);

    // Give MutationObserver time to process
    await Promise.resolve();

    observer.disconnect();

    // Check results
    const firstItemAfter = appHost.querySelector('div');
    const allDivs = appHost.querySelectorAll('div');

    assert.strictEqual(appHost.textContent, '01');
    assert.strictEqual(allDivs.length, 2);
    assert.strictEqual(nodeWasRemoved, false, 'First item DOM node should NOT be removed during update');
    assert.strictEqual(firstItemBefore, firstItemAfter, 'First item DOM node should be reused, not recreated');
  });

  it('[keyed] does not remove existing node when adding a second item ', async function () {
    const { appHost, component } = createFixture(
      `<div repeat.for="item of items; key: id">\${item.id}</div>`,
      class { items = [{ id: 0 }]; }
    );

    // Get reference to the first item's DOM node
    const firstItemBefore = appHost.querySelector('div');
    assert.notStrictEqual(firstItemBefore, null);

    // Set up MutationObserver to detect DOM removals
    let nodeWasRemoved = false;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const removedNode of mutation.removedNodes) {
          if (removedNode === firstItemBefore) {
            nodeWasRemoved = true;
          }
        }
      }
    });

    observer.observe(appHost, { childList: true, subtree: true });

    component.items.push({ id: 1 });

    // Give MutationObserver time to process
    await Promise.resolve();

    observer.disconnect();

    // Check results
    const firstItemAfter = appHost.querySelector('div');
    const allDivs = appHost.querySelectorAll('div');

    assert.strictEqual(appHost.textContent, '01');
    assert.strictEqual(allDivs.length, 2);
    assert.strictEqual(nodeWasRemoved, false, 'First item DOM node should NOT be removed during update');
    assert.strictEqual(firstItemBefore, firstItemAfter, 'First item DOM node should be reused, not recreated');
  });

  it('does not lose focus when adding a second item', async function () {
    const { appHost, component } = createFixture(
      `<input repeat.for="item of items" value.bind="item" />`,
      class { items = ['first']; }
    );

    // Focus the first input
    const firstInput = appHost.querySelector('input') as HTMLInputElement;
    assert.notStrictEqual(firstInput, null);
    firstInput.focus();
    assert.strictEqual(document.activeElement, firstInput, 'First input should have focus');

    // Track if focus was lost
    let focusWasLost = false;
    firstInput.addEventListener('blur', () => {
      focusWasLost = true;
    });

    component.items.push('second');

    // Give time for any async operations
    await Promise.resolve();

    // Check that focus was maintained
    assert.strictEqual(focusWasLost, false, 'Focus should not be lost when adding second item');
    assert.strictEqual(document.activeElement, firstInput, 'First input should still have focus');

    // Verify both inputs exist
    const allInputs = appHost.querySelectorAll('input');
    assert.strictEqual(allInputs.length, 2);
  });

  it('properly detects DOM operations using detailed MutationObserver tracking', async function () {
    const { appHost, component } = createFixture(
      `<div repeat.for="item of items" id="\${item}">\${item}</div>`,
      class { items = [0]; }
    );

    // Get reference to the first item's DOM node
    const firstItemBefore = appHost.querySelector('div');
    assert.notStrictEqual(firstItemBefore, null);
    assert.strictEqual(firstItemBefore.id, '0');

    // Set up detailed MutationObserver to track all DOM operations
    const mutations: string[] = [];
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          // Track removals
          for (const removedNode of mutation.removedNodes) {
            if (removedNode.nodeType === 1) { // Element node
              const elem = removedNode as Element;
              mutations.push(`REMOVED: ${elem.tagName}#${elem.id}`);
            }
          }
          // Track additions
          for (const addedNode of mutation.addedNodes) {
            if (addedNode.nodeType === 1) { // Element node
              const elem = addedNode as Element;
              mutations.push(`ADDED: ${elem.tagName}#${elem.id}`);
            }
          }
        }
      }
    });

    observer.observe(appHost, { childList: true, subtree: true });

    // Add second item
    component.items.push(1);

    // Give MutationObserver time to process
    await Promise.resolve();
    await Promise.resolve(); // Extra tick to be sure

    observer.disconnect();

    // Check results
    const allDivs = appHost.querySelectorAll('div');
    assert.strictEqual(appHost.textContent, '01');
    assert.strictEqual(allDivs.length, 2);

    // The first item should NOT have been removed and re-added
    const unexpectedMutations = mutations.filter(m => m.includes('DIV#0'));
    assert.strictEqual(
      unexpectedMutations.length,
      0,
      `Unexpected mutations for first item: ${unexpectedMutations.join(', ')}`
    );

    // Only the second item should have been added
    assert.strictEqual(mutations.length, 1, `Expected only 1 mutation, got ${mutations.length}: ${mutations.join(', ')}`);
    assert.strictEqual(mutations[0], 'ADDED: DIV#1');
  });

  it('tracks actual DOM removal with disconnected callback', async function () {
    let disconnectCount = 0;
    const { appHost, component } = createFixture(
      `<div repeat.for="item of items" custom-attr>\${item}</div>`,
      class { items = [0]; },
      [
        class CustomAttr {
          static $au = {
            type: 'custom-attribute',
            name: 'custom-attr'
          };
          detaching() {
            disconnectCount++;
          }
        }
      ]
    );

    // Add second item
    component.items.push(1);

    await Promise.resolve();

    // The first item's custom attribute should NOT have been detached
    assert.strictEqual(disconnectCount, 0, 'First item should not be detached when adding second item');

    // Verify both items exist
    const allDivs = appHost.querySelectorAll('div');
    assert.strictEqual(allDivs.length, 2);
    assert.strictEqual(appHost.textContent, '01');
  });

  it('does not deactivate and reactivate existing views when adding items', async function () {
    const lifecycleEvents: string[] = [];

    const { component } = createFixture(
      `<div repeat.for="item of items"><span lifecycle-tracker.bind="'item: ' + item">\${item}</span></div>`,
      class { items = [0]; },
      [
        class LifecycleTracker {
          static $au = {
            type: 'custom-attribute',
            name: 'lifecycle-tracker',
            bindables: ['value']
          };

          value: string;

          binding() {
            lifecycleEvents.push(`binding: ${this.value}`);
          }

          bound() {
            lifecycleEvents.push(`bound: ${this.value}`);
          }

          attaching() {
            lifecycleEvents.push(`attaching: ${this.value}`);
          }

          attached() {
            lifecycleEvents.push(`attached: ${this.value}`);
          }

          detaching() {
            lifecycleEvents.push(`detaching: ${this.value}`);
          }

          unbinding() {
            lifecycleEvents.push(`unbinding: ${this.value}`);
          }
        }
      ]
    );

    // Clear initial lifecycle events
    lifecycleEvents.length = 0;

    // Add second item
    component.items.push(1);

    await Promise.resolve();

    // The first item (item: 0) should NOT have any lifecycle events
    const firstItemEvents = lifecycleEvents.filter(e => e.includes('item: 0'));
    assert.strictEqual(
      firstItemEvents.length,
      0,
      `First item should not have lifecycle events. Got: ${firstItemEvents.join(', ')}`
    );

    // Only the second item should have been created
    assert.deepStrictEqual(lifecycleEvents, [
      'binding: item: 1',
      'bound: item: 1',
      'attaching: item: 1',
      'attached: item: 1'
    ]);
  });
});
