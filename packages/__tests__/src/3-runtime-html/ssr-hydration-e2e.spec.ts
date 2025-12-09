/**
 * SSR Hydration E2E Tests
 *
 * These tests verify the REAL SSR → hydration flow:
 * 1. Server: Start Aurelia with ISSRContext { preserveMarkers: true }
 * 2. Server: Render component, capture innerHTML (with markers)
 * 3. Server: Record manifest via recordManifest()
 * 4. Client: Fresh Aurelia, hydrate with SSR HTML + ssrScope
 *
 * Uses the JIT helpers for consistent patterns.
 */

import { CustomElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import {
  ssrRender,
  clientHydrate,
  doubleRender,
  texts,
  text,
  count,
  flush,
} from './ssr-hydration-jit.helpers.js';

describe('3-runtime-html/ssr-hydration-e2e.spec.ts', function () {

  // ============================================================================
  // Simple Cases
  // ============================================================================

  describe('Simple text binding', function () {

    it('server renders then client hydrates simple text', async function () {
      const template = '<div>${message}</div>';
      const state = { message: 'Hello SSR' };

      // 1. SSR render
      const ssr = await ssrRender(template, state);

      // Verify server output has the text
      assert.includes(ssr.html, 'Hello SSR', 'server should render text');

      await ssr.stop();

      // 2. Client hydrate
      const client = await clientHydrate(template, ssr.html, state, ssr.manifest.manifest);

      // Verify hydration worked
      assert.includes(client.host.textContent ?? '', 'Hello SSR', 'client should have text');

      // 3. Test reactivity
      (client.vm as { message: string }).message = 'Updated';
      await flush();

      assert.includes(client.host.textContent ?? '', 'Updated', 'should react to change');

      await client.stop();
    });

    it('handles multiple text bindings', async function () {
      const { host, vm, stop } = await doubleRender(
        '<div>${first} ${last}</div>',
        { first: 'John', last: 'Doe' }
      );

      assert.includes(host.innerHTML, 'John', 'should have first name');
      assert.includes(host.innerHTML, 'Doe', 'should have last name');

      // Test reactivity
      (vm as { first: string }).first = 'Jane';
      await flush();

      assert.includes(host.innerHTML, 'Jane', 'should update first name');

      await stop();
    });
  });

  // ============================================================================
  // Repeat E2E
  // ============================================================================

  describe('Simple repeat', function () {

    it('server renders then client hydrates repeat', async function () {
      const template = '<div repeat.for="item of items">${item}</div>';
      const state = { items: ['A', 'B', 'C'] };

      // 1. SSR render
      const ssr = await ssrRender(template, state);

      // Verify server output
      assert.includes(ssr.html, 'A', 'should have A');
      assert.includes(ssr.html, 'B', 'should have B');
      assert.includes(ssr.html, 'C', 'should have C');

      await ssr.stop();

      // 2. Client hydrate
      const client = await clientHydrate(template, ssr.html, { items: ['A', 'B', 'C'] }, ssr.manifest.manifest);

      // 3. Test reactivity - push
      (client.vm as { items: string[] }).items.push('D');
      await flush();

      const divTexts = texts(client.host, 'div');
      assert.includes(divTexts, 'D', 'should have D after push');

      await client.stop();
    });

    it('handles empty repeat then population', async function () {
      const { host, vm, stop } = await doubleRender(
        '<div repeat.for="item of items">${item}</div>',
        { items: [] as string[] }
      );

      assert.strictEqual(count(host, 'div'), 0, 'initially empty');

      // Add items
      (vm as { items: string[] }).items.push('First', 'Second');
      await flush();

      const divTexts = texts(host, 'div');
      assert.includes(divTexts, 'First', 'should have First');
      assert.includes(divTexts, 'Second', 'should have Second');

      await stop();
    });
  });

  // ============================================================================
  // If E2E
  // ============================================================================

  describe('Simple if', function () {

    it('server renders then client hydrates if.bind=true', async function () {
      const template = '<div if.bind="show">Visible</div>';
      const state = { show: true };

      // 1. SSR render
      const ssr = await ssrRender(template, state);
      assert.includes(ssr.html, 'Visible', 'should have content');
      await ssr.stop();

      // 2. Client hydrate
      const client = await clientHydrate(template, ssr.html, { show: true }, ssr.manifest.manifest);

      // 3. Test reactivity - toggle off
      (client.vm as { show: boolean }).show = false;
      await flush();

      // 4. Toggle back on
      (client.vm as { show: boolean }).show = true;
      await flush();

      assert.includes(client.host.innerHTML, 'Visible', 'should have content after toggle');

      await client.stop();
    });

    it('server renders then client hydrates if.bind=false', async function () {
      const template = '<div if.bind="show">Hidden</div>';
      const state = { show: false };

      // 1. SSR render
      const ssr = await ssrRender(template, state);
      assert.notIncludes(ssr.html, 'Hidden', 'should not have content');
      await ssr.stop();

      // 2. Client hydrate
      const client = await clientHydrate(template, ssr.html, { show: false }, ssr.manifest.manifest);

      // 3. Test reactivity - toggle on
      (client.vm as { show: boolean }).show = true;
      await flush();

      assert.includes(client.host.innerHTML, 'Hidden', 'should have content after toggle on');

      await client.stop();
    });
  });

  // ============================================================================
  // If/Else E2E
  // ============================================================================

  describe('If/Else', function () {

    it('hydrates if/else and switches branches', async function () {
      const { host, vm, stop } = await doubleRender(
        '<div if.bind="loggedIn">Welcome!</div><div else>Please log in</div>',
        { loggedIn: true }
      );

      assert.includes(host.innerHTML, 'Welcome!', 'should show Welcome');
      assert.notIncludes(host.innerHTML, 'Please log in', 'should not show login prompt');

      // Switch to logged out
      (vm as { loggedIn: boolean }).loggedIn = false;
      await flush();

      assert.includes(host.innerHTML, 'Please log in', 'should show login prompt');

      // Switch back to logged in
      (vm as { loggedIn: boolean }).loggedIn = true;
      await flush();

      assert.includes(host.innerHTML, 'Welcome!', 'should show Welcome again');

      await stop();
    });
  });

  // ============================================================================
  // Nested Template Controllers
  // ============================================================================

  describe('Nested template controllers', function () {

    it('hydrates if > repeat nesting', async function () {
      const { host, vm, stop } = await doubleRender(
        '<ul if.bind="show"><li repeat.for="item of items">${item}</li></ul>',
        { show: true, items: ['X', 'Y', 'Z'] }
      );

      assert.strictEqual(count(host, 'li') >= 3, true, 'should have 3 items');

      // Toggle if off
      (vm as { show: boolean }).show = false;
      await flush();

      // Toggle if back on
      (vm as { show: boolean }).show = true;
      await flush();

      const liTexts = texts(host, 'li');
      assert.includes(liTexts, 'X', 'should have X after toggle');
      assert.includes(liTexts, 'Y', 'should have Y after toggle');
      assert.includes(liTexts, 'Z', 'should have Z after toggle');

      await stop();
    });

    it('hydrates repeat > if nesting', async function () {
      const { host, vm, stop } = await doubleRender(
        '<div repeat.for="item of items"><span if.bind="item.visible">${item.name}</span></div>',
        {
          items: [
            { name: 'A', visible: true },
            { name: 'B', visible: false },
            { name: 'C', visible: true },
          ]
        }
      );

      let spanTexts = texts(host, 'span');
      assert.includes(spanTexts, 'A', 'should have A');
      assert.notIncludes(spanTexts, 'B', 'should not have B (hidden)');
      assert.includes(spanTexts, 'C', 'should have C');

      // Toggle B visible
      (vm as { items: { name: string; visible: boolean }[] }).items[1].visible = true;
      await flush();

      spanTexts = texts(host, 'span');
      assert.includes(spanTexts, 'B', 'should have B after toggle');

      await stop();
    });
  });

  // ============================================================================
  // With E2E
  // ============================================================================

  describe('With binding', function () {

    it('hydrates with binding', async function () {
      const { host, vm, stop } = await doubleRender(
        '<div with.bind="person">${name} (${age})</div>',
        { person: { name: 'Alice', age: 30 } }
      );

      const divText = text(host, 'div');
      assert.includes(divText ?? '', 'Alice', 'should show Alice');
      assert.includes(divText ?? '', '30', 'should show 30');

      // Update person
      (vm as { person: { name: string; age: number } }).person.name = 'Bob';
      await flush();

      assert.includes(text(host, 'div') ?? '', 'Bob', 'should show Bob after update');

      await stop();
    });
  });

  // ============================================================================
  // Custom Element E2E
  // ============================================================================

  describe('Custom element', function () {

    it('hydrates custom element with bindable', async function () {
      const ChildEl = CustomElement.define({
        name: 'child-el',
        template: '<span>${message}</span>',
        bindables: ['message'],
      }, class { message = ''; });

      const { host, vm, stop } = await doubleRender(
        '<child-el message.bind="greeting"></child-el>',
        { greeting: 'Hello from parent' },
        [ChildEl],
      );

      assert.includes(text(host, 'span') ?? '', 'Hello from parent', 'should show greeting');

      // Update binding
      (vm as { greeting: string }).greeting = 'Updated greeting';
      await flush();

      assert.includes(text(host, 'span') ?? '', 'Updated greeting', 'should show updated greeting');

      await stop();
    });

    it('hydrates custom elements inside repeat', async function () {
      const ItemEl = CustomElement.define({
        name: 'item-el',
        template: '<b>${item}</b>',
        bindables: ['item'],
      }, class { item = ''; });

      const { host, vm, stop } = await doubleRender(
        '<item-el repeat.for="item of items" item.bind="item"></item-el>',
        { items: ['A', 'B', 'C'] },
        [ItemEl],
      );

      let bTexts = texts(host, 'b');
      assert.includes(bTexts, 'A', 'should have A');
      assert.includes(bTexts, 'B', 'should have B');
      assert.includes(bTexts, 'C', 'should have C');

      // Add item
      (vm as { items: string[] }).items.push('D');
      await flush();

      bTexts = texts(host, 'b');
      assert.includes(bTexts, 'D', 'should have D after push');

      await stop();
    });
  });

  // ============================================================================
  // Switch E2E
  // ============================================================================

  describe('Switch binding', function () {

    it('hydrates switch and changes cases', async function () {
      const { host, vm, stop } = await doubleRender(
        '<template switch.bind="status"><span case="loading">Loading...</span><span case="success">Done!</span><span case="error">Failed</span></template>',
        { status: 'loading' }
      );

      assert.includes(host.innerHTML, 'Loading...', 'should show Loading');

      // Change to success
      (vm as { status: string }).status = 'success';
      await flush();

      assert.includes(host.innerHTML, 'Done!', 'should show Done');

      // Change to error
      (vm as { status: string }).status = 'error';
      await flush();

      assert.includes(host.innerHTML, 'Failed', 'should show Failed');

      await stop();
    });
  });

  // ============================================================================
  // Attribute Binding E2E
  // ============================================================================

  describe('Attribute bindings', function () {

    it('hydrates class binding', async function () {
      const { host, vm, stop } = await doubleRender(
        '<div class.bind="cssClass">Content</div>',
        { cssClass: 'initial-class' }
      );

      const div = host.querySelector('div');
      assert.strictEqual(div?.classList.contains('initial-class'), true, 'should have initial class');

      // Update class
      (vm as { cssClass: string }).cssClass = 'updated-class';
      await flush();

      assert.strictEqual(div?.classList.contains('updated-class'), true, 'should have updated class');

      await stop();
    });

    it('hydrates conditional class', async function () {
      const { host, vm, stop } = await doubleRender(
        '<div active.class="isActive">Content</div>',
        { isActive: true }
      );

      const div = host.querySelector('div');
      assert.strictEqual(div?.classList.contains('active'), true, 'should have active class');

      // Toggle off
      (vm as { isActive: boolean }).isActive = false;
      await flush();

      assert.strictEqual(div?.classList.contains('active'), false, 'should not have active class');

      await stop();
    });

    it('hydrates form input bindings', async function () {
      const { host, vm, stop } = await doubleRender(
        '<input type="text" value.bind="inputValue">',
        { inputValue: 'initial' }
      );

      const input = host.querySelector('input') as HTMLInputElement;
      assert.strictEqual(input?.value, 'initial', 'should have initial value');

      // Update value
      (vm as { inputValue: string }).inputValue = 'updated';
      await flush();

      assert.strictEqual(input?.value, 'updated', 'should have updated value');

      await stop();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge cases', function () {

    it('handles deeply nested structure', async function () {
      const { host, vm, stop } = await doubleRender(
        `
        <div if.bind="level1">
          <ul>
            <li repeat.for="item of items">
              <span if.bind="item.visible">
                <b with.bind="item.data">\${name}</b>
              </span>
            </li>
          </ul>
        </div>
        `,
        {
          level1: true,
          items: [
            { visible: true, data: { name: 'A' } },
            { visible: false, data: { name: 'B' } },
            { visible: true, data: { name: 'C' } },
          ]
        }
      );

      const bTexts = texts(host, 'b');
      assert.includes(bTexts, 'A', 'should have A');
      assert.notIncludes(bTexts, 'B', 'should not have B (hidden)');
      assert.includes(bTexts, 'C', 'should have C');

      // Toggle level1 off
      (vm as { level1: boolean }).level1 = false;
      await flush();

      // Toggle back on
      (vm as { level1: boolean }).level1 = true;
      await flush();

      // Items should still be there
      const bTextsAfter = texts(host, 'b');
      assert.includes(bTextsAfter, 'A', 'should have A after toggle');
      assert.includes(bTextsAfter, 'C', 'should have C after toggle');

      await stop();
    });

    it('handles rapid state changes', async function () {
      const { host, vm, stop } = await doubleRender(
        '<div if.bind="show">${message}</div>',
        { show: true, message: 'Hello' }
      );

      const vmTyped = vm as { show: boolean; message: string };

      // Rapid changes
      vmTyped.show = false;
      vmTyped.message = 'Update 1';
      vmTyped.show = true;
      vmTyped.message = 'Update 2';
      vmTyped.show = false;
      vmTyped.show = true;
      vmTyped.message = 'Final';
      await flush();

      assert.includes(host.innerHTML, 'Final', 'should show Final');

      await stop();
    });

    it('handles empty to populated to empty', async function () {
      const { host, vm, stop } = await doubleRender(
        '<div repeat.for="item of items">${item}</div>',
        { items: [] as string[] }
      );

      const vmTyped = vm as { items: string[] };

      // Empty to populated
      vmTyped.items.push('A', 'B', 'C');
      await flush();

      assert.strictEqual(count(host, 'div') >= 3, true, 'should have 3 items');

      // Back to empty
      vmTyped.items.splice(0);
      await flush();

      // Repopulate
      vmTyped.items.push('X', 'Y');
      await flush();

      const divTexts = texts(host, 'div');
      assert.includes(divTexts, 'X', 'should have X');
      assert.includes(divTexts, 'Y', 'should have Y');

      await stop();
    });
  });
});
