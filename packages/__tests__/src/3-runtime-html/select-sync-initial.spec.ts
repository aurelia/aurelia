import { assert, createFixture } from '@aurelia/testing';
import { CustomElement } from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
import { isNode } from '../util.js';

describe('3-runtime-html/select-sync-initial.spec.ts', function () {
  it('makes static option selection available to the owning component bound hook', function () {
    class Form {
      public select!: HTMLSelectElement;
      public selected = { id: 2 };
      public options = [{ id: 1 }, { id: 2 }];
      public selectionAtBound: boolean[] | undefined;
      public matchById(left: { id: number }, right: { id: number }): boolean {
        return left?.id === right?.id;
      }
      public bound(): void {
        this.selectionAtBound = Array.from(this.select.options, option => option.selected);
      }
    }
    const { component } = createFixture(
      `<select ref="select" value.bind="selected" matcher.bind="matchById">
        <option model.bind="options[0]">One</option>
        <option model.bind="options[1]">Two</option>
      </select>`,
      Form,
    );
    // Check #2580's stronger timing guarantee separately from eventual
    // selection: the owner can inspect its static select inside bound().
    assert.deepEqual(component.selectionAtBound, [false, true]);
  });

  for (const kind of ['repeated', 'conditional']) {
    for (const mode of ['bind', 'to-view', 'one-time']) {
      for (const multiple of [false, true]) {
        it(`selects ${kind} options with ${multiple ? 'multiple' : 'single'} value.${mode}`, function () {
          const options = [{ id: 1 }, { id: 2 }];
          const selected = options[1];
          const selection = multiple ? [selected] : selected;
          const optionsTemplate = kind === 'repeated'
            ? '<option repeat.for="option of options" model.bind="option">${option.id}</option>'
            : `<optgroup if.bind="available" label="Available options">
                <option model.bind="options[0]">One</option>
                <option model.bind="options[1]">Two</option>
              </optgroup>`;
          const { component, queryBy } = createFixture(
            `<select ${multiple ? 'multiple' : ''} value.${mode}="selection" matcher.bind="matchById">
              ${optionsTemplate}
            </select>`,
            {
              available: true,
              selection,
              options,
              matchById: (left: { id: number }, right: { id: number }) => left?.id === right?.id,
            },
          );
          // These options belong to a child view, but their synchronous mount
          // still completes selection before createFixture returns.
          const select = queryBy('select') as HTMLSelectElement;
          assert.strictEqual(select.options.length, 2);
          assert.deepEqual(Array.from(select.options, option => option.selected), [false, true]);
          assert.strictEqual(component.selection, selection);
        });
      }
    }
  }

  for (const mode of ['bind', 'to-view', 'one-time']) {
    it(`synchronizes the initial selection after option models and matcher bind with value.${mode}`, function () {
      const selected = { id: 2 };
      const { component, queryBy } = createFixture(
        `<select value.${mode}="selected" matcher.bind="matchById">
          <option model.bind="options[0]">One</option>
          <option model.bind="options[1]">Two</option>
        </select>`,
        {
          selected,
          options: [{ id: 1 }, { id: 2 }],
          matchById: (left: { id: number }, right: { id: number }) => left?.id === right?.id,
        },
      );

      const select = queryBy('select') as HTMLSelectElement;
      assert.deepEqual(Array.from(select.options, option => option.selected), [false, true]);
      assert.strictEqual(component.selected, selected);
    });
  }

  it('batches initial repeated option mounts into one synchronous refresh', function () {
    let matches = 0;
    const selected = { id: 3 };
    const { queryBy } = createFixture(
      `<select value.one-time="selected" matcher.bind="matchById">
        <option repeat.for="option of options" model.bind="option">\${option.id}</option>
      </select>`,
      {
        selected,
        options: [{ id: 1 }, { id: 2 }, { id: 3 }],
        matchById: (left: { id: number }, right: { id: number }) => {
          ++matches;
          return left?.id === right?.id;
        },
      },
    );

    const select = queryBy('select') as HTMLSelectElement;
    assert.deepEqual(Array.from(select.options, option => option.selected), [false, false, true]);
    assert.strictEqual(matches, 3, 'refreshes once after the complete mount batch');
  });

  for (const mode of ['bind', 'to-view', 'one-time']) {
    it(`preserves a user selection when unrelated help content mounts with value.${mode}`, async function () {
      const { component, ctx, queryBy } = createFixture(
        `<select value.${mode}="selected">
          <option value="first">First</option>
          <option value="second">Second</option>
        </select>
        <p if.bind="showHelp" data-help>Help</p>`,
        { selected: 'first', showHelp: false },
      );
      const select = queryBy('select') as HTMLSelectElement;
      select.value = 'second';
      select.dispatchEvent(new ctx.Event('change'));
      await tasksSettled();
      assert.strictEqual(select.value, 'second');

      // A one-way binding can provide the form's initial value without owning
      // subsequent user input. Mounting help changes neither this select nor its options.
      component.showHelp = true;
      await tasksSettled();
      assert.strictEqual(queryBy('[data-help]')?.textContent, 'Help');
      assert.strictEqual(select.value, 'second');
    });
  }

  for (const { mode, conditional } of [
    { mode: 'to-view', conditional: false },
    { mode: 'one-time', conditional: false },
    { mode: 'one-time', conditional: true },
  ]) {
    it(`selects options after their ${conditional ? 'conditional ' : ''}child component finishes async binding with value.${mode}`, async function () {
      let finishBinding!: () => void;
      const AsyncOptions = CustomElement.define({
        name: 'async-options',
        template: '<option value="first">First</option><option value="second">Second</option>',
      }, class {
        public binding(): Promise<void> {
          return new Promise(resolve => { finishBinding = resolve; });
        }
      });
      const { queryBy, started } = createFixture(
        `<select value.${mode}="selected"><optgroup ${conditional ? 'if.bind="available"' : ''} as-element="async-options"></optgroup></select>`,
        { selected: 'second', available: true },
        [AsyncOptions],
      );
      const select = queryBy('select') as HTMLSelectElement;
      try {
        assert.strictEqual(select.options.length, 0, 'the child has not mounted its options yet');
      } finally {
        finishBinding();
      }
      await started;
      assert.deepEqual(Array.from(select.options, option => option.selected), [false, true]);
    });
  }

  for (const mode of ['bind', 'to-view', 'one-time']) {
    it(`preserves user input while an unrelated async sibling finishes initial binding with value.${mode}`, async function () {
      let finishBinding!: () => void;
      const AsyncHelp = CustomElement.define({ name: 'async-help', template: '<p>Help</p>' }, class {
        public binding(): Promise<void> {
          return new Promise(resolve => { finishBinding = resolve; });
        }
      });
      const { ctx, queryBy, started } = createFixture(
        `<select value.${mode}="selected">
          <option value="first">First</option>
          <option value="second">Second</option>
        </select>
        <async-help></async-help>`,
        { selected: 'first' },
        [AsyncHelp],
      );
      const select = queryBy('select') as HTMLSelectElement;
      try {
        // The form is already mounted while a separate component loads. Its
        // user input must survive the remaining application's initial activation.
        await tasksSettled();
        select.value = 'second';
        select.dispatchEvent(new ctx.Event('change'));
        assert.strictEqual(select.value, 'second');
      } finally {
        finishBinding();
      }
      await started;
      assert.strictEqual(queryBy('async-help')?.textContent, 'Help');
      assert.strictEqual(select.value, 'second');
    });
  }

  it('initializes late options in one select without overwriting user input in another', async function () {
    let finishBinding!: () => void;
    const AsyncOptions = CustomElement.define({
      name: 'async-options',
      template: '<option value="first">First</option><option value="second">Second</option>',
    }, class {
      public binding(): Promise<void> {
        return new Promise(resolve => { finishBinding = resolve; });
      }
    });
    const { ctx, queryBy, started } = createFixture(
      `<select data-ready value.one-time="readySelection">
        <option value="first">First</option>
        <option value="second">Second</option>
      </select>
      <select data-loading value.one-time="loadingSelection">
        <optgroup as-element="async-options"></optgroup>
      </select>`,
      { readySelection: 'first', loadingSelection: 'second' },
      [AsyncOptions],
    );
    const ready = queryBy('[data-ready]') as HTMLSelectElement;
    const loading = queryBy('[data-loading]') as HTMLSelectElement;
    try {
      await tasksSettled();
      ready.value = 'second';
      ready.dispatchEvent(new ctx.Event('change'));
      assert.strictEqual(loading.options.length, 0);
    } finally {
      finishBinding();
    }
    await started;
    assert.strictEqual(loading.value, 'second', 'the late option list uses its own initial value');
    assert.strictEqual(ready.value, 'second', 'the other select retains the user choice');
  });

  for (const mode of ['bind', 'one-time']) {
    it(`preserves a surviving selected option across repeated option reorder and removal with value.${mode}`, async function () {
      if (isNode() && mode === 'one-time') {
        // JSDOM drops an option's selection when insertBefore moves it, even
        // without Aurelia. Exercise native selection preservation in the browser.
        this.skip();
      }
      const { component, queryBy } = createFixture(
        `<select value.${mode}="selected">
          <option repeat.for="option of options" model.bind="option">\${option}</option>
        </select>`,
        { selected: 'second', options: ['first', 'second', 'third'] },
      );
      const select = queryBy('select') as HTMLSelectElement;
      const selectedOption = select.options[1];
      component.options.reverse();
      await tasksSettled();
      assert.strictEqual(select.selectedOptions[0], selectedOption);

      component.options.splice(0, 1);
      await tasksSettled();
      assert.strictEqual(select.selectedOptions[0], selectedOption);
      assert.strictEqual(component.selected, 'second');
    });
  }

  it('rebinds a form after hiding it during async option binding', async function () {
    let finishBinding!: () => void;
    const bindingReady = new Promise<void>(resolve => { finishBinding = resolve; });
    const AsyncOptions = CustomElement.define({
      name: 'async-options',
      template: '<option value="first">First</option><option value="second">Second</option>',
    }, class {
      public binding(): Promise<void> {
        return bindingReady;
      }
    });
    const { component, queryBy, started } = createFixture(
      `<section if.bind="visible">
        <select value.one-time="selected"><optgroup as-element="async-options"></optgroup></select>
      </section>`,
      { visible: true, selected: 'second' },
      [AsyncOptions],
    );
    // Closing a form while its options load is an ordinary external update,
    // not a lifecycle hook mutating the condition that owns it.
    try {
      component.visible = false;
      component.selected = 'first';
    } finally {
      finishBinding();
    }
    await started;
    await tasksSettled();
    assert.strictEqual(queryBy('select'), null);

    component.visible = true;
    await tasksSettled();
    assert.strictEqual((queryBy('select') as HTMLSelectElement).value, 'first');
  });

  it('initializes nested row option views before retiring their refresh targets', function () {
    const rows = Array.from({ length: 2 }, () => {
      const options = [{ id: 1 }, { id: 2 }];
      return { options, selected: options[1] };
    });
    const { getBy, getAllBy } = createFixture(
      `<select data-summary value.one-time="summary">
        <option value="first">First</option><option value="second">Second</option>
      </select>
      <section repeat.for="row of rows">
        <select data-row value.one-time="row.selected">
          <option repeat.for="option of row.options" model.bind="option">\${option.id}</option>
        </select>
      </section>`,
      { summary: 'second', rows },
    );
    // The outer select keeps a parent batch open while each row finishes its
    // own nested option views. Those row targets still need their final refresh.
    assert.strictEqual((getBy('[data-summary]') as HTMLSelectElement).value, 'second');
    for (const select of getAllBy('[data-row]') as HTMLSelectElement[]) {
      assert.deepEqual(Array.from(select.options, option => option.selected), [false, true]);
    }
  });

  it('keeps initial option matching linear across independent editable rows', function () {
    const totals: number[] = [];
    for (const rowCount of [10, 20]) {
      // Keep instrumentation outside the observed row objects. These counts
      // measure actual matcher work without making it another binding input.
      const matches: number[] = Array(rowCount).fill(0);
      const rows = Array.from({ length: rowCount }, (_, index) => {
        const options = [{ id: 1 }, { id: 2 }];
        return {
          options,
          selected: options[1],
          matchById(left: { id: number }, right: { id: number }): boolean {
            ++matches[index];
            return left?.id === right?.id;
          },
        };
      });
      const { getAllBy } = createFixture(
        `<div repeat.for="row of rows">
          <select value.bind="row.selected" matcher.bind="row.matchById">
            <option model.bind="row.options[0]">First</option>
            <option model.bind="row.options[1]">Second</option>
          </select>
        </div>`,
        { rows },
      );
      const selects = getAllBy('select') as HTMLSelectElement[];
      assert.strictEqual(selects.length, rowCount);
      for (const select of selects) {
        assert.strictEqual(select.options[1].selected, true);
      }
      totals.push(matches.reduce((total, count) => total + count, 0));
    }
    // Each select owns a fixed pair of options. Adding independent rows must
    // not repeatedly rescan the option lists in all rows already mounted.
    assert.ok(totals[1] <= 2 * totals[0], `doubling rows increased matcher calls from ${totals[0]} to ${totals[1]}`);
  });

  it('synchronizes before descendant async activation settles', async function () {
    let resolveAttaching!: () => void;
    const AsyncChild = CustomElement.define({ name: 'async-child', template: 'child' }, class {
      public attaching(): Promise<void> {
        return new Promise(resolve => {
          resolveAttaching = resolve;
        });
      }
    });
    const selected = { id: 2 };
    const { queryBy, started } = createFixture(
      `<select value.bind="selected" matcher.bind="matchById">
        <option model.bind="options[0]">One</option>
        <option model.bind="options[1]">Two</option>
      </select>
      <async-child></async-child>`,
      {
        selected,
        options: [{ id: 1 }, { id: 2 }],
        matchById: (left: { id: number }, right: { id: number }) => left?.id === right?.id,
      },
      [AsyncChild],
    );

    try {
      const select = queryBy('select') as HTMLSelectElement;
      assert.deepEqual(Array.from(select.options, option => option.selected), [false, true]);
    } finally {
      resolveAttaching();
    }
    await started;
  });
});
