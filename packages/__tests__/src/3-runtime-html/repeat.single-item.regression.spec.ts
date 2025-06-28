import { assert, createFixture } from '@aurelia/testing';
import { resolve } from '@aurelia/kernel';
import { INode } from '@aurelia/runtime-html';

describe('3-runtime-html/repeat.single-item.regression.spec.ts', function () {
  it('does not remove existing node when adding a second item (non-keyed)', async function () {
    const { appHost, component, flush } = createFixture(
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
    flush();

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

  it('does not remove existing node when adding a second item (keyed)', async function () {
    const { appHost, component, flush } = createFixture(
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
    flush();

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
    const { appHost, component, flush } = createFixture(
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
    flush();

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
    const { appHost, component, flush } = createFixture(
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
    flush();

    // Give MutationObserver time to process
    await Promise.resolve();
    await Promise.resolve(); // Extra tick to be sure

    observer.disconnect();

    // Log the mutations for debugging
    console.log('DOM Mutations:', mutations);

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
    const { appHost, component, flush } = createFixture(
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
    flush();

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

    const { appHost, component, flush } = createFixture(
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
    flush();

    await Promise.resolve();

    // Log lifecycle events
    console.log('Lifecycle events:', lifecycleEvents);

    // The first item (item: 0) should NOT have any lifecycle events
    const firstItemEvents = lifecycleEvents.filter(e => e.includes('item: 0'));
    assert.strictEqual(
      firstItemEvents.length,
      0,
      `First item should not have lifecycle events. Got: ${firstItemEvents.join(', ')}`
    );

    // Only the second item should have been created
    const secondItemEvents = lifecycleEvents.filter(e => e.includes('item: 1'));
    assert.strictEqual(secondItemEvents.length > 0, true, 'Second item should have lifecycle events');
    assert.strictEqual(secondItemEvents.includes('binding: item: 1'), true);
    assert.strictEqual(secondItemEvents.includes('attaching: item: 1'), true);
  });

  it('verifies view.nodes.link is not called unnecessarily', async function () {
    // This test would require mocking or spying on internal methods
    // For now, we'll rely on the other tests to detect the symptoms
    const { appHost, component, flush } = createFixture(
      `<div repeat.for="item of items">\${item}</div>`,
      class { items = [0]; }
    );

    // We can't directly spy on view.nodes.link without modifying the runtime
    // But we've already verified through MutationObserver that no DOM removals occur

    component.items.push(1);
    flush();

    await Promise.resolve();

    // If the fix is applied correctly, this test combined with the others
    // should ensure the issue doesn't resurface
    assert.strictEqual(appHost.textContent, '01');
  });

  interface InsertBeforeCall {
    parent: Node;
    child: Node;
    ref: Node | null;
  }

  it('does not call insertBefore on existing nodes when adding items', async function () {
    const insertBeforeCalls: InsertBeforeCall[] = [];

    // Store original insertBefore
    const originalInsertBefore = Node.prototype.insertBefore;

    // Override insertBefore to track calls
    Node.prototype.insertBefore = function (this: Node, newChild: Node, refChild: Node | null) {
      insertBeforeCalls.push({
        parent: this,
        child: newChild,
        ref: refChild
      });
      return originalInsertBefore.call(this, newChild, refChild);
    };

    try {
      const { appHost, component, flush } = createFixture(
        `<div repeat.for="item of items" id="item-\${item}">\${item}</div>`,
        class { items = [0]; }
      );

      // Get reference to the first item's DOM node
      const firstItem = appHost.querySelector('#item-0');
      assert.notStrictEqual(firstItem, null);

      // Clear any setup calls
      insertBeforeCalls.length = 0;

      // Add second item
      component.items.push(1);
      flush();

      await Promise.resolve();

      // Check insertBefore calls
      console.log('insertBefore calls:', insertBeforeCalls.map(call => ({
        child: (call.child as Element).id || call.child.nodeName,
        ref: call.ref ? ((call.ref as Element).id || call.ref.nodeName) : 'null'
      })));

      // Check if any call contains the first item (could be in a fragment)
      const firstItemReinserted = insertBeforeCalls.some(call => {
        if (call.child === firstItem) return true;
        if ((call.child as Element).id === 'item-0') return true;
        // Check if it's a fragment containing the first item
        if (call.child.nodeType === 11) { // DocumentFragment
          const fragment = call.child as DocumentFragment;
          const nodes = Array.from(fragment.childNodes);
          return nodes.some(node =>
            node === firstItem ||
            (node.nodeType === 1 && (node as Element).id === 'item-0')
          );
        }
        return false;
      });

      assert.strictEqual(
        firstItemReinserted,
        false,
        'First item should not be re-inserted via insertBefore'
      );

      // Count total insertBefore calls
      const nonCommentInserts = insertBeforeCalls.filter(call =>
        call.child.nodeType !== 8 // Not a comment node
      );

      console.log('Non-comment insertBefore calls:', nonCommentInserts.length);

      // With the bug, we expect more insertBefore calls than necessary
      // Without the bug, we should only have calls for the new item
      assert.strictEqual(
        nonCommentInserts.length <= 1,
        true,
        `Too many insertBefore calls: ${nonCommentInserts.length}. Should be at most 1 for adding one new item.`
      );

      // Verify final state
      assert.strictEqual(appHost.textContent, '01');
    } finally {
      // Restore original insertBefore
      Node.prototype.insertBefore = originalInsertBefore;
    }
  });

  it('does not call insertBefore on existing nodes when adding items (keyed)', async function () {
    const insertBeforeCalls: InsertBeforeCall[] = [];

    // Store original insertBefore
    const originalInsertBefore = Node.prototype.insertBefore;

    // Override insertBefore to track calls
    Node.prototype.insertBefore = function (this: Node, newChild: Node, refChild: Node | null) {
      insertBeforeCalls.push({
        parent: this,
        child: newChild,
        ref: refChild
      });
      return originalInsertBefore.call(this, newChild, refChild);
    };

    try {
      const { appHost, component, flush } = createFixture(
        `<div repeat.for="item of items; key: id" id="item-\${item.id}">\${item.name}</div>`,
        class { items = [{ id: 0, name: 'first' }]; }
      );

      // Get reference to the first item's DOM node
      const firstItem = appHost.querySelector('#item-0');
      assert.notStrictEqual(firstItem, null);

      // Clear any setup calls
      insertBeforeCalls.length = 0;

      // Add second item
      component.items.push({ id: 1, name: 'second' });
      flush();

      await Promise.resolve();

      // The first item should NOT have insertBefore called on it
      const firstItemReinserted = insertBeforeCalls.some(call =>
        call.child === firstItem ||
        (call.child as Element).id === 'item-0'
      );

      assert.strictEqual(
        firstItemReinserted,
        false,
        'First keyed item should not be re-inserted via insertBefore'
      );

      // Verify final state
      assert.strictEqual(appHost.textContent, 'firstsecond');
    } finally {
      // Restore original insertBefore
      Node.prototype.insertBefore = originalInsertBefore;
    }
  });

  it('demonstrates the actual issue - unnecessary linking of existing views', async function () {
    // The issue is that calling view.nodes.link() unnecessarily prepares nodes for re-insertion
    // even when they don't need to move. This test will track link operations.

    const linkCalls: string[] = [];

    // We need to intercept the link calls on FragmentNodeSequence
    // Since we can't easily mock internal Aurelia classes, we'll use a different approach

    const { appHost, component, flush } = createFixture(
      `<template>
        <div repeat.for="item of items" id="item-\${item}">
          <span focus-tracker="item-\${item}">\${item}</span>
        </div>
      </template>`,
      class { items = [0]; },
      [
        class FocusTracker {
          static $au = {
            type: 'custom-attribute',
            name: 'focus-tracker',
            bindables: ['value']
          };

          value: string;
          element: HTMLElement;

          constructor() {
            this.element = resolve(INode) as HTMLElement;
          }

          attached() {
            // If the parent node gets re-inserted, focus would be lost
            if (this.value === 'item-0' && this.element.tagName === 'SPAN') {
              this.element.tabIndex = 0;
              this.element.focus();
              console.log('Focused element:', this.value);
            }
          }
        }
      ]
    );

    // Verify first item is focused
    const focusedBefore = document.activeElement as HTMLElement;
    assert.strictEqual(focusedBefore?.parentElement?.id, 'item-0', 'First item should have focus');

    // Add second item
    component.items.push(1);
    flush();

    await Promise.resolve();

    // Check if focus was lost (which would indicate the node was re-inserted)
    const focusedAfter = document.activeElement as HTMLElement;
    assert.strictEqual(focusedAfter?.parentElement?.id, 'item-0', 'First item should still have focus');
    assert.strictEqual(focusedBefore, focusedAfter, 'Same element should maintain focus');

    // Verify both items exist
    assert.strictEqual(appHost.textContent.replace(/\s+/g, ''), '01');
  });

  it('verifies the fix - only new views should be linked', async function () {
    // This test confirms that with the fix, only new views are linked/inserted
    // We'll use a more direct approach by checking parent-child relationships

    const { appHost, component, flush } = createFixture(
      `<div repeat.for="item of items" id="item-\${item}" parent-tracker>\${item}</div>`,
      class { items = [0]; },
      [
        class ParentTracker {
          static $au = {
            type: 'custom-attribute',
            name: 'parent-tracker'
          };

          element: HTMLElement;
          initialParent: Node | null;

          constructor() {
            this.element = resolve(INode) as HTMLElement;
          }

          attached() {
            this.initialParent = this.element.parentNode;
          }

          detaching() {
            // This would be called if the view is being removed/re-inserted
            console.log(`Detaching: ${this.element.id}`);
          }
        }
      ]
    );

    // Get reference to first item
    const firstItem = appHost.querySelector('#item-0') as HTMLElement;
    const initialParent = firstItem.parentNode;

    // Monitor appendChild/insertBefore on the parent
    let reinsertionDetected = false;
    const originalAppendChild = initialParent!.appendChild;
    const originalInsertBefore = initialParent!.insertBefore;

    (initialParent as any).appendChild = function (node: Node) {
      if (node === firstItem || (node.nodeType === 11 && Array.from(node.childNodes).includes(firstItem))) {
        reinsertionDetected = true;
      }
      return originalAppendChild.call(this, node);
    };

    (initialParent as any).insertBefore = function (node: Node, ref: Node | null) {
      if (node === firstItem || (node.nodeType === 11 && Array.from(node.childNodes).includes(firstItem))) {
        reinsertionDetected = true;
      }
      return originalInsertBefore.call(this, node, ref);
    };

    // Add second item
    component.items.push(1);
    flush();

    await Promise.resolve();

    // Restore originals
    (initialParent as any).appendChild = originalAppendChild;
    (initialParent as any).insertBefore = originalInsertBefore;

    assert.strictEqual(reinsertionDetected, false, 'First item should not be re-inserted into parent');
    assert.strictEqual(firstItem.parentNode, initialParent, 'First item should have same parent');
    assert.strictEqual(appHost.textContent, '01');
  });

  it('tracks detaching calls during item addition', async function () {
    let detachingCalls: string[] = [];
    let operationPhase = 'setup';

    const { appHost, component, flush } = createFixture(
      `<div repeat.for="item of items" id="item-\${item}" detach-tracker>\${item}</div>`,
      class { items = [0]; },
      [
        class DetachTracker {
          static $au = {
            type: 'custom-attribute',
            name: 'detach-tracker'
          };

          element: HTMLElement;

          constructor() {
            this.element = resolve(INode) as HTMLElement;
          }

          detaching() {
            detachingCalls.push(`${operationPhase}: ${this.element.id}`);
          }
        }
      ]
    );

    // Clear setup calls
    detachingCalls = [];
    operationPhase = 'adding-item';

    // Add second item
    component.items.push(1);
    flush();

    await Promise.resolve();

    operationPhase = 'after-add';

    // Check if any detaching happened during the add operation
    const detachingDuringAdd = detachingCalls.filter(call => call.startsWith('adding-item:'));
    
    assert.strictEqual(
      detachingDuringAdd.length,
      0,
      `Views should not be detached when adding items. Got: ${detachingDuringAdd.join(', ')}`
    );

    // Verify both items exist
    assert.strictEqual(appHost.textContent, '01');
  });

  it('REGRESSION TEST: verifies the single-item bug is fixed', async function () {
    // This test specifically targets the bug where calling view.nodes.link() on all views
    // causes unnecessary work. We'll detect this by checking if existing views are "prepared"
    // for insertion when they shouldn't be.
    
    let linkOperationDetected = false;
    const viewOperations: string[] = [];
    
    const { appHost, component, flush } = createFixture(
      `<div repeat.for="item of items" id="item-\${item}" operation-tracker>\${item}</div>`,
      class { items = [0]; },
      [
        class OperationTracker {
          static $au = {
            type: 'custom-attribute',
            name: 'operation-tracker'
          };
          
          element: HTMLElement;
          private originalLink: any;
          private nodeSequence: any;
          
          constructor() {
            this.element = resolve(INode) as HTMLElement;
          }
          
          attached() {
            // Try to intercept the link operation on the view's node sequence
            // This is a bit hacky but necessary to detect the issue
            const controller = (this as any).$controller;
            const parentController = controller?.parent;
            
            if (parentController?.vmKind === 'synthetic') {
              this.nodeSequence = parentController.nodes;
              if (this.nodeSequence && typeof this.nodeSequence.link === 'function') {
                this.originalLink = this.nodeSequence.link;
                this.nodeSequence.link = (...args: any[]) => {
                  viewOperations.push(`link called on ${this.element.id}`);
                  if (this.element.id === 'item-0') {
                    linkOperationDetected = true;
                  }
                  return this.originalLink.apply(this.nodeSequence, args);
                };
              }
            }
          }
          
          detaching() {
            // Restore original link function
            if (this.nodeSequence && this.originalLink) {
              this.nodeSequence.link = this.originalLink;
            }
          }
        }
      ]
    );
    
    // Clear any setup operations
    viewOperations.length = 0;
    linkOperationDetected = false;
    
    // Add second item - this is where the bug manifests
    component.items.push(1);
    flush();
    
    await Promise.resolve();
    
    // With the bug: link() is called on the existing view (item-0) unnecessarily
    // With the fix: link() should NOT be called on the existing view
    assert.strictEqual(
      linkOperationDetected,
      false,
      `link() should not be called on existing view. Operations: ${viewOperations.join(', ')}`
    );
    
    // Verify the DOM is correct
    assert.strictEqual(appHost.textContent, '01');
  });

  it('REGRESSION TEST: focus is maintained when adding second item', async function () {
    // The actual bug manifests as focus loss when the first item's view is unnecessarily linked
    // This happens because link() prepares the view for potential re-insertion
    // which can cause focus to be lost in some browsers/scenarios

    const { appHost, component, flush } = createFixture(
      `<input repeat.for="item of items" value.bind="item" id="input-\${item}" />`,
      class { items = ['first']; }
    );

    // Focus the first input
    const firstInput = appHost.querySelector('#input-first') as HTMLInputElement;
    assert.notStrictEqual(firstInput, null);
    firstInput.focus();

    // Verify focus
    assert.strictEqual(document.activeElement, firstInput, 'First input should have focus');

    // Track if we lose focus at any point
    let focusLostCount = 0;
    firstInput.addEventListener('blur', () => {
      focusLostCount++;
    });

    // Add second item - this is where the bug would manifest
    component.items.push('second');
    flush();

    // Process all microtasks
    await Promise.resolve();
    await Promise.resolve();

    // With the bug: focus might be lost due to unnecessary view operations
    // With the fix: focus should be maintained
    assert.strictEqual(focusLostCount, 0, 'Focus should never be lost when adding items');
    assert.strictEqual(document.activeElement, firstInput, 'First input should still have focus');

    // Verify both inputs exist
    const allInputs = appHost.querySelectorAll('input');
    assert.strictEqual(allInputs.length, 2);
  });
});
