import { batch, tasksSettled } from '@aurelia/runtime';
import { CustomElement, Repeat, customElement, type IHydratedController } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

function findRepeat(controller: IHydratedController): Repeat {
  let repeat: Repeat | undefined;
  controller.accept(child => {
    if (child.viewModel instanceof Repeat) {
      repeat = child.viewModel;
      return true;
    }
  });
  assert.notStrictEqual(repeat, void 0);
  return repeat!;
}

describe('3-runtime-html/repeat.reconciliation.spec.ts', function () {
  for (const keyed of [false, true]) {
    const key = keyed ? '; key: id' : '';

    for (const mutation of ['push', 'sort', 'splice'] as const) {
      it(`preserves child state and input selection after ${mutation} then reassignment (keyed: ${keyed}, #2489)`, async function () {
        const events: string[] = [];

        @customElement({ name: 'stateful-repeat-row', template: '<input value.bind="draft">${item.id}', bindables: ['item'] })
        class Row {
          public item!: { id: number };
          public draft = 'initial';
          public binding(): void { events.push(`bind:${this.item.id}`); }
          public detaching(): void { events.push(`detach:${this.item.id}`); }
        }

        const fixture = createFixture(
          `<stateful-repeat-row repeat.for="item of items${key}" item.bind="item"></stateful-repeat-row>`,
          class { public items = [{ id: 0 }, { id: 1 }, { id: 2 }]; },
          [Row],
        );
        const { component, appHost } = fixture;
        if (mutation === 'push') {
          component.items.push({ id: 3 });
        } else if (mutation === 'sort') {
          component.items.sort((a, b) => b.id - a.id);
        } else {
          component.items.splice(1, 1, { id: 3 }, { id: 4 });
        }
        await tasksSettled();

        const hosts = Array.from(appHost.querySelectorAll('stateful-repeat-row'));
        const rows = hosts.map(host => CustomElement.for(host).viewModel as Row);
        const input = hosts[0].querySelector('input')!;
        rows[0].draft = 'unsaved local edit';
        await tasksSettled();
        input.focus();
        input.setSelectionRange(2, 7);
        events.length = 0;

        component.items = component.items.slice();
        await tasksSettled();

        const currentHosts = Array.from(appHost.querySelectorAll('stateful-repeat-row'));
        for (let i = 0; i < hosts.length; ++i) {
          assert.strictEqual(currentHosts[i] === hosts[i], true, `row ${i} retains its DOM node`);
          assert.strictEqual(CustomElement.for(currentHosts[i]).viewModel === rows[i], true, `row ${i} retains its component`);
        }
        assert.strictEqual(input.value, 'unsaved local edit');
        assert.strictEqual(appHost.ownerDocument.activeElement === input, true, 'focus is retained');
        assert.strictEqual(input.selectionStart, 2);
        assert.strictEqual(input.selectionEnd, 7);
        assert.deepStrictEqual(events, []);
        await fixture.tearDown();
      });
    }

    for (const observerMap of [false, true]) {
      it(`preserves view identity and lifecycle order for bulk deletion/insertion (keyed: ${keyed}, observer map: ${observerMap}, #2490)`, async function () {
        const events: string[] = [];

        @customElement({ name: 'bulk-repeat-row', template: '${item.id}:${index};', bindables: ['item', 'index'] })
        class Row {
          public item!: { id: number };
          public index!: number;
          public binding(): void { events.push(`bind:${this.item.id}`); }
          public detaching(): void { events.push(`detach:${this.item.id}`); }
        }

        const items = Array.from({ length: 8 }, (_, id) => ({ id }));
        const fixture = createFixture(
          `<bulk-repeat-row repeat.for="item of items${key}" item.bind="item" index.bind="$index"></bulk-repeat-row>`,
          class { public items = items.slice(); },
          [Row],
        );
        const repeat = findRepeat(fixture.au.root.controller);
        const views = repeat.views;
        const originalViews = views.slice();
        const hosts = Array.from(fixture.appHost.querySelectorAll('bulk-repeat-row'));
        events.length = 0;

        let expected: number[];
        if (observerMap) {
          batch(() => {
            fixture.component.items.splice(0, 2, { id: 8 }, { id: 9 }, { id: 10 });
            fixture.component.items.splice(4, 2);
            fixture.component.items.reverse();
          });
          expected = [7, 6, 5, 2, 10, 9, 8];
          assert.deepStrictEqual(events, ['detach:0', 'detach:1', 'detach:3', 'detach:4', 'bind:8', 'bind:9', 'bind:10']);
        } else {
          fixture.component.items = [items[7], { id: 8 }, items[5], { id: 9 }, items[3], items[1]];
          expected = [7, 8, 5, 9, 3, 1];
          assert.deepStrictEqual(events, ['detach:0', 'detach:2', 'detach:4', 'detach:6', 'bind:9', 'bind:8']);
        }
        await tasksSettled();

        assert.strictEqual(repeat.views === views, true, 'the public views array is retained');
        assert.strictEqual(views.length, expected.length);
        fixture.assertText(expected.map((id, i) => `${id}:${i};`).join(''));
        const currentHosts = Array.from(fixture.appHost.querySelectorAll('bulk-repeat-row'));
        for (let i = 0; i < expected.length; ++i) {
          if (expected[i] < 8) {
            assert.strictEqual(views[i] === originalViews[expected[i]], true, `view ${expected[i]} is reused`);
            assert.strictEqual(currentHosts[i] === hosts[expected[i]], true, `DOM row ${expected[i]} is reused`);
          }
        }
        await fixture.tearDown();
      });
    }

    for (const stop of [false, true]) {
      it(`settles bulk async removals before rapid external updates${stop ? ' and owner stop' : ''} (keyed: ${keyed})`, async function () {
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        let block = true;
        const events: string[] = [];

        @customElement({ name: 'gated-repeat-row', template: '${item.id}', bindables: ['item'] })
        class Row {
          public item!: { id: number };
          public binding(): void { events.push(`bind:${this.item.id}`); }
          public detaching(): void | Promise<void> {
            events.push(`detach:${this.item.id}`);
            return block && this.item.id % 2 === 0 ? gate : void 0;
          }
        }

        const items = Array.from({ length: 8 }, (_, id) => ({ id }));
        const fixture = createFixture(
          `<gated-repeat-row repeat.for="item of items${key}" item.bind="item"></gated-repeat-row>`,
          class { public items = items.slice(); },
          [Row],
        );
        const repeat = findRepeat(fixture.au.root.controller);
        const views = repeat.views;
        const oldViews = views.slice();
        events.length = 0;
        batch(() => {
          for (let i = 6; i >= 0; i -= 2) {
            fixture.component.items.splice(i, 1);
          }
        });
        const reconciliation = (repeat as unknown as { _reconciliation: { promise: Promise<void> } })._reconciliation.promise;
        assert.deepStrictEqual(events, ['detach:0', 'detach:2', 'detach:4', 'detach:6']);
        assert.deepStrictEqual(views.map(view => oldViews.indexOf(view)), [1, 3, 5, 7]);
        fixture.component.items = [items[7], { id: 8 }, items[1]];
        fixture.component.items.push({ id: 9 });
        const stopped = stop ? fixture.stop(true) : void 0;
        block = false;
        release();
        await reconciliation;
        await stopped;
        await tasksSettled();

        if (stop) {
          assert.strictEqual(events.some(event => event.startsWith('bind:')), false, 'stopped owner never activates queued rows');
          fixture.assertText('');
        } else {
          fixture.assertText('7819');
          assert.strictEqual(repeat.views === views, true);
          assert.strictEqual(views[0] === oldViews[7], true, 'latest generation reuses surviving row 7');
          assert.strictEqual(views[2] === oldViews[1], true, 'latest generation reuses surviving row 1');
          await fixture.tearDown();
        }
      });
    }
  }

  for (const primitive of [false, true]) {
    it(`retains duplicate occurrence identity after reverse then reassignment (primitive: ${primitive}, #2489)`, async function () {
      const a = primitive ? 'A' : { toString: () => 'A' };
      const b = primitive ? 'B' : { toString: () => 'B' };
      const fixture = createFixture(
        '<input repeat.for="item of items" value.bind="item">',
        class { public items = [a, b, a]; },
      );
      const initial = Array.from(fixture.appHost.querySelectorAll('input'));
      fixture.component.items.reverse();
      await tasksSettled();
      const reversed = Array.from(fixture.appHost.querySelectorAll('input'));
      assert.strictEqual(reversed[0] === initial[2], true);
      assert.strictEqual(reversed[2] === initial[0], true);
      fixture.component.items = fixture.component.items.slice();
      await tasksSettled();
      const current = Array.from(fixture.appHost.querySelectorAll('input'));
      for (let i = 0; i < current.length; ++i) {
        assert.strictEqual(current[i] === reversed[i], true, `duplicate occurrence ${i} is reused`);
      }
      await fixture.tearDown();
    });
  }

  it('matches the collection identity rather than an edited repeat local after a mutation (#2489)', async function () {
    const fixture = createFixture(
      '<input repeat.for="item of items" value.bind="item">',
      class { public items = ['A', 'B']; },
    );
    fixture.component.items.push('C');
    const input = fixture.appHost.querySelector('input')!;
    const repeat = findRepeat(fixture.au.root.controller);
    const view = repeat.views[0];
    input.value = 'edited row local';
    input.dispatchEvent(new fixture.ctx.wnd.Event('input', { bubbles: true }));
    await tasksSettled();
    assert.strictEqual(view.scope.bindingContext.item, 'edited row local');
    assert.strictEqual(fixture.component.items[0], 'A');

    fixture.component.items = fixture.component.items.slice();
    await tasksSettled();
    assert.strictEqual(repeat.views[0] === view, true);
    assert.strictEqual(fixture.appHost.querySelector('input') === input, true);
    assert.strictEqual(input.value, 'A');
    await fixture.tearDown();
  });

  it('does not resurrect a removed duplicate occurrence after reversal and reassignment (#2489)', async function () {
    let created = 0;
    const item = { value: 'shared' };
    @customElement({ name: 'duplicate-repeat-row', template: '<input value.bind="draft">', bindables: ['item'] })
    class Row {
      public item!: { value: string };
      public readonly id = ++created;
      public draft = `draft-${this.id}`;
    }
    const fixture = createFixture(
      '<duplicate-repeat-row repeat.for="item of items" item.bind="item"></duplicate-repeat-row>',
      class { public items = [item, item, item]; },
      [Row],
    );
    const repeat = findRepeat(fixture.au.root.controller);
    const views = repeat.views.slice();
    const hosts = Array.from(fixture.appHost.querySelectorAll('duplicate-repeat-row'));
    const rows = hosts.map(host => CustomElement.for(host).viewModel as Row);

    fixture.component.items.splice(1, 1);
    fixture.component.items.reverse();
    await tasksSettled();
    fixture.component.items = fixture.component.items.slice();
    await tasksSettled();

    const current = Array.from(fixture.appHost.querySelectorAll('duplicate-repeat-row'));
    assert.strictEqual(current.length, 2);
    for (const [index, original] of [[0, 2], [1, 0]]) {
      assert.strictEqual(repeat.views[index] === views[original], true, 'the surviving occurrence keeps its view');
      assert.strictEqual(current[index] === hosts[original], true, 'the surviving occurrence keeps its DOM');
      assert.strictEqual(CustomElement.for(current[index]).viewModel === rows[original], true);
      assert.strictEqual(current[index].querySelector('input')!.value, `draft-${original + 1}`);
    }
    assert.strictEqual(repeat.views.includes(views[1]), false, 'the removed occurrence stays removed');
    assert.strictEqual(created, 3, 'replacement does not create another row');
    await fixture.tearDown();
  });

  for (const tuple of [false, true]) {
    it(`retains destructured row identity after mutation and reassignment (tuple: ${tuple}, #2489)`, async function () {
      const item = (id: number) => tuple ? [id] : { id };
      const fixture = createFixture(
        `<input repeat.for="${tuple ? '[id]' : '{ id }'} of items" value.bind="id">`,
        class { public items = [item(0), item(1)]; },
      );
      fixture.component.items.push(item(2));
      await tasksSettled();
      const inputs = Array.from(fixture.appHost.querySelectorAll('input'));
      fixture.component.items = fixture.component.items.slice();
      await tasksSettled();
      const current = Array.from(fixture.appHost.querySelectorAll('input'));
      for (let i = 0; i < current.length; ++i) {
        assert.strictEqual(current[i] === inputs[i], true, `destructured row ${i} is reused`);
        assert.strictEqual(current[i].value, String(i));
      }
      await fixture.tearDown();
    });
  }

  it('starts with fresh scopes after stopping an owner whose scope map was invalidated', async function () {
    const fixture = createFixture(
      '<div repeat.for="item of items">${item}</div>',
      class { public items = ['A', 'B']; },
    );
    const repeat = findRepeat(fixture.au.root.controller);
    fixture.component.items.push('C');
    const oldViews = repeat.views.slice();
    const oldScopes = oldViews.map(view => view.scope);
    await fixture.stop(false);
    await fixture.au.start();
    fixture.assertText('ABC');
    for (let i = 0; i < oldViews.length; ++i) {
      assert.strictEqual(repeat.views[i] === oldViews[i], false, `restart recreates view ${i}`);
      assert.strictEqual(repeat.views[i].scope === oldScopes[i], false, `restart recreates scope ${i}`);
    }

    fixture.component.items.push('D');
    const newViews = repeat.views.slice();
    fixture.component.items = fixture.component.items.slice();
    await tasksSettled();
    fixture.assertText('ABCD');
    for (let i = 0; i < newViews.length; ++i) {
      assert.strictEqual(repeat.views[i] === newViews[i], true, `new generation retains view ${i}`);
    }
    await fixture.stop(true);
  });
});
