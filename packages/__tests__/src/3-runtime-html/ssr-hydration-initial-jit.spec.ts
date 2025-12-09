/**
 * SSR Hydration Tests - Initial + Reactive (JIT)
 *
 * Tests SSR → hydrate flow and post-hydration mutations.
 */

import { CustomElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { render, q, flush, manifest } from './ssr-hydration-jit.helpers.js';

describe('3-runtime-html/ssr-hydration-initial-jit.spec.ts', function () {

  // ===========================================================================
  // Text & Attribute Bindings
  // ===========================================================================

  describe('Text bindings', function () {
    it('hydrates text interpolation', async function () {
      const { host, stop } = await render('<div>${msg}</div>', { msg: 'Hello' });
      assert.includes(host.innerHTML, 'Hello', 'should have Hello');
      await stop();
    });

    it('reacts to text change', async function () {
      const { host, vm, stop } = await render('<div>${msg}</div>', { msg: 'Hello' });
      (vm as { msg: string }).msg = 'Updated';
      await flush();
      assert.includes(host.innerHTML, 'Updated', 'should have Updated');
      await stop();
    });
  });

  describe('Attribute bindings', function () {
    it('hydrates class binding', async function () {
      const { host, vm, stop } = await render('<div class.bind="c">X</div>', { c: 'foo' });
      assert.strictEqual(host.querySelector('div')?.classList.contains('foo'), true, 'should have foo');
      (vm as { c: string }).c = 'bar';
      await flush();
      assert.strictEqual(host.querySelector('div')?.classList.contains('bar'), true, 'should have bar');
      await stop();
    });

    it('hydrates conditional class', async function () {
      const { host, vm, stop } = await render('<div active.class="on">X</div>', { on: true });
      assert.strictEqual(host.querySelector('div')?.classList.contains('active'), true, 'should have active');
      (vm as { on: boolean }).on = false;
      await flush();
      assert.strictEqual(host.querySelector('div')?.classList.contains('active'), false, 'should not have active');
      await stop();
    });

    it('hydrates input value', async function () {
      const { host, vm, stop } = await render('<input value.bind="v">', { v: 'init' });
      assert.strictEqual((host.querySelector('input') as HTMLInputElement)?.value, 'init', 'should be init');
      (vm as { v: string }).v = 'changed';
      await flush();
      assert.strictEqual((host.querySelector('input') as HTMLInputElement)?.value, 'changed', 'should be changed');
      await stop();
    });

    it('hydrates checkbox', async function () {
      const { host, vm, stop } = await render('<input type="checkbox" checked.bind="c">', { c: false });
      assert.strictEqual((host.querySelector('input') as HTMLInputElement)?.checked, false, 'should be unchecked');
      (vm as { c: boolean }).c = true;
      await flush();
      assert.strictEqual((host.querySelector('input') as HTMLInputElement)?.checked, true, 'should be checked');
      await stop();
    });
  });

  // ===========================================================================
  // Repeat
  // ===========================================================================

  describe('Repeat', function () {
    it('hydrates repeat', async function () {
      const { host, manifest: m, stop } = await render(
        '<div repeat.for="x of items">${x}</div>',
        { items: ['A', 'B', 'C'] }
      );
      assert.includes(q.texts(host, 'div'), 'A', 'should have A');
      assert.includes(q.texts(host, 'div'), 'B', 'should have B');
      assert.strictEqual(manifest.repeatViews(m.manifest), 3, 'should have 3 views');
      await stop();
    });

    it('handles push', async function () {
      const { host, vm, stop } = await render('<li repeat.for="x of items">${x}</li>', { items: ['A', 'B'] });
      (vm as { items: string[] }).items.push('C');
      await flush();
      assert.includes(q.texts(host, 'li'), 'C', 'should have C');
      await stop();
    });

    it('handles pop', async function () {
      const { host, vm, stop } = await render('<li repeat.for="x of items">${x}</li>', { items: ['A', 'B', 'C'] });
      (vm as { items: string[] }).items.pop();
      await flush();
      assert.includes(q.texts(host, 'li'), 'A', 'should have A');
      assert.includes(q.texts(host, 'li'), 'B', 'should have B');
      await stop();
    });

    it('handles splice', async function () {
      const { host, vm, stop } = await render('<li repeat.for="x of items">${x}</li>', { items: ['A', 'B', 'C'] });
      (vm as { items: string[] }).items.splice(1, 1);
      await flush();
      assert.includes(q.texts(host, 'li'), 'A', 'should have A');
      assert.includes(q.texts(host, 'li'), 'C', 'should have C');
      await stop();
    });

    it('handles array replacement', async function () {
      const { host, vm, stop } = await render('<li repeat.for="x of items">${x}</li>', { items: ['A', 'B'] });
      (vm as { items: string[] }).items = ['X', 'Y', 'Z'];
      await flush();
      assert.includes(q.texts(host, 'li'), 'X', 'should have X');
      assert.includes(q.texts(host, 'li'), 'Y', 'should have Y');
      assert.includes(q.texts(host, 'li'), 'Z', 'should have Z');
      await stop();
    });

    it('handles empty to populated', async function () {
      const { host, vm, stop } = await render('<li repeat.for="x of items">${x}</li>', { items: [] as string[] });
      assert.strictEqual(q.count(host, 'li'), 0, 'should be empty');
      (vm as { items: string[] }).items.push('First');
      await flush();
      assert.includes(q.texts(host, 'li'), 'First', 'should have First');
      await stop();
    });

    it('hydrates with $index', async function () {
      const { host, stop } = await render('<li repeat.for="x of items">${$index}:${x}</li>', { items: ['A', 'B'] });
      assert.includes(host.innerHTML, '0:A', 'should have 0:A');
      assert.includes(host.innerHTML, '1:B', 'should have 1:B');
      await stop();
    });

    it('hydrates containerless repeat', async function () {
      const { host, stop } = await render(
        '<ul><template repeat.for="x of items"><li>${x}</li></template></ul>',
        { items: ['A', 'B'] }
      );
      assert.includes(q.texts(host, 'li'), 'A', 'should have A');
      assert.includes(q.texts(host, 'li'), 'B', 'should have B');
      await stop();
    });
  });

  // ===========================================================================
  // If
  // ===========================================================================

  describe('If', function () {
    it('hydrates if=true', async function () {
      const { host, manifest: m, stop } = await render('<div if.bind="show">Yes</div>', { show: true });
      assert.includes(host.innerHTML, 'Yes', 'should have Yes');
      assert.strictEqual(manifest.ifRendered(m.manifest), true, 'if should be rendered');
      await stop();
    });

    it('hydrates if=false', async function () {
      const { host, manifest: m, stop } = await render('<div if.bind="show">No</div>', { show: false });
      assert.notIncludes(host.innerHTML, 'No', 'should not have No');
      assert.strictEqual(manifest.ifRendered(m.manifest), false, 'if should not be rendered');
      await stop();
    });

    it('toggles if true→false→true', async function () {
      const { host, vm, stop } = await render('<div if.bind="show">Content</div>', { show: true });
      (vm as { show: boolean }).show = false;
      await flush();
      (vm as { show: boolean }).show = true;
      await flush();
      assert.includes(host.innerHTML, 'Content', 'should have Content');
      await stop();
    });

    it('hydrates if/else with if active', async function () {
      const { host, stop } = await render('<div if.bind="ok">Yes</div><div else>No</div>', { ok: true });
      assert.includes(host.innerHTML, 'Yes', 'should have Yes');
      assert.notIncludes(host.innerHTML, 'No', 'should not have No');
      await stop();
    });

    it('hydrates if/else with else active', async function () {
      const { host, stop } = await render('<div if.bind="ok">Yes</div><div else>No</div>', { ok: false });
      assert.notIncludes(host.innerHTML, 'Yes', 'should not have Yes');
      assert.includes(host.innerHTML, 'No', 'should have No');
      await stop();
    });

    it('switches if/else branches', async function () {
      const { host, vm, stop } = await render('<div if.bind="ok">Yes</div><div else>No</div>', { ok: true });
      (vm as { ok: boolean }).ok = false;
      await flush();
      assert.includes(host.innerHTML, 'No', 'should have No');
      (vm as { ok: boolean }).ok = true;
      await flush();
      assert.includes(host.innerHTML, 'Yes', 'should have Yes');
      await stop();
    });
  });

  // ===========================================================================
  // With
  // ===========================================================================

  describe('With', function () {
    it('hydrates with binding', async function () {
      const { host, stop } = await render('<div with.bind="p">${name}</div>', { p: { name: 'Alice' } });
      assert.includes(host.innerHTML, 'Alice', 'should have Alice');
      await stop();
    });

    it('reacts to with value change', async function () {
      const { host, vm, stop } = await render('<div with.bind="p">${name}</div>', { p: { name: 'Alice' } });
      (vm as { p: { name: string } }).p.name = 'Bob';
      await flush();
      assert.includes(host.innerHTML, 'Bob', 'should have Bob');
      await stop();
    });
  });

  // ===========================================================================
  // Switch
  // ===========================================================================

  describe('Switch', function () {
    it('hydrates switch', async function () {
      const { host, stop } = await render(
        '<template switch.bind="s"><span case="a">A</span><span case="b">B</span></template>',
        { s: 'a' }
      );
      assert.includes(host.innerHTML, 'A', 'should have A');
      await stop();
    });

    it('switches cases', async function () {
      const { host, vm, stop } = await render(
        '<template switch.bind="s"><span case="a">A</span><span case="b">B</span></template>',
        { s: 'a' }
      );
      (vm as { s: string }).s = 'b';
      await flush();
      assert.includes(host.innerHTML, 'B', 'should have B');
      await stop();
    });
  });

  // ===========================================================================
  // Nested Template Controllers
  // ===========================================================================

  describe('Nested TCs', function () {
    it('hydrates if > repeat', async function () {
      const { host, vm, stop } = await render(
        '<ul if.bind="show"><li repeat.for="x of items">${x}</li></ul>',
        { show: true, items: ['A', 'B'] }
      );
      assert.includes(q.texts(host, 'li'), 'A', 'should have A');
      (vm as { show: boolean }).show = false;
      await flush();
      (vm as { show: boolean }).show = true;
      await flush();
      assert.includes(q.texts(host, 'li'), 'A', 'should have A after toggle');
      await stop();
    });

    it('hydrates repeat > if', async function () {
      const { host, vm, stop } = await render(
        '<div repeat.for="x of items"><span if.bind="x.on">${x.v}</span></div>',
        { items: [{ v: 'A', on: true }, { v: 'B', on: false }] }
      );
      assert.includes(q.texts(host, 'span'), 'A', 'should have A');
      assert.notIncludes(q.texts(host, 'span'), 'B', 'should not have B');
      (vm as { items: { v: string; on: boolean }[] }).items[1].on = true;
      await flush();
      assert.includes(q.texts(host, 'span'), 'B', 'should have B after toggle');
      await stop();
    });

    it('hydrates deeply nested: if > repeat > if', async function () {
      const { host, stop } = await render(
        '<div if.bind="outer"><span repeat.for="x of items"><b if.bind="x.on">${x.v}</b></span></div>',
        { outer: true, items: [{ v: 'X', on: true }, { v: 'Y', on: false }] }
      );
      assert.includes(q.texts(host, 'b'), 'X', 'should have X');
      assert.notIncludes(q.texts(host, 'b'), 'Y', 'should not have Y');
      await stop();
    });
  });

  // ===========================================================================
  // Custom Elements
  // ===========================================================================

  describe('Custom elements', function () {
    it('hydrates custom element', async function () {
      const Child = CustomElement.define({ name: 'child-el', template: '<b>${msg}</b>', bindables: ['msg'] }, class { msg = ''; });
      const { host, vm, stop } = await render('<child-el msg.bind="m"></child-el>', { m: 'Hello' }, [Child]);
      assert.includes(q.text(host, 'b'), 'Hello', 'should have Hello');
      (vm as { m: string }).m = 'Updated';
      await flush();
      assert.includes(q.text(host, 'b'), 'Updated', 'should have Updated');
      await stop();
    });

    it('hydrates custom elements in repeat', async function () {
      const Item = CustomElement.define({ name: 'item-el', template: '<i>${x}</i>', bindables: ['x'] }, class { x = ''; });
      const { host, vm, stop } = await render(
        '<item-el repeat.for="x of items" x.bind="x"></item-el>',
        { items: ['A', 'B'] },
        [Item]
      );
      assert.includes(q.texts(host, 'i'), 'A', 'should have A');
      (vm as { items: string[] }).items.push('C');
      await flush();
      assert.includes(q.texts(host, 'i'), 'C', 'should have C');
      await stop();
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge cases', function () {
    it('handles rapid mutations', async function () {
      const { host, vm, stop } = await render('<li repeat.for="x of items">${x}</li>', { items: ['A', 'B'] });
      const v = vm as { items: string[] };
      v.items.push('C');
      v.items.pop();
      v.items.push('D');
      v.items.shift();
      v.items.unshift('E');
      await flush();
      assert.includes(q.texts(host, 'li'), 'E', 'should have E');
      assert.includes(q.texts(host, 'li'), 'B', 'should have B');
      assert.includes(q.texts(host, 'li'), 'D', 'should have D');
      await stop();
    });

    it('handles empty template', async function () {
      const { stop } = await render('', {});
      await stop();
    });

    it('handles static template', async function () {
      const { host, stop } = await render('<div>Static</div>', {});
      assert.includes(host.innerHTML, 'Static', 'should have Static');
      await stop();
    });
  });
});
