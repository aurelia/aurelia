import { assert, createFixture } from '@aurelia/testing';
import { CustomElement } from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';

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

  it('batches repeated option mounts into one synchronous refresh', function () {
    let matches = 0;
    const selected = { id: 3 };
    const { component, queryBy } = createFixture(
      `<select value.one-time="selected" matcher.bind="matchById">
        <option repeat.for="option of options" model.bind="option">\${option.id}</option>
      </select>`,
      {
        selected,
        options: [] as { id: number }[],
        matchById: (left: { id: number }, right: { id: number }) => {
          ++matches;
          return left?.id === right?.id;
        },
      },
    );

    matches = 0;
    component.options.push({ id: 1 }, { id: 2 }, { id: 3 });

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

  for (const mode of ['to-view', 'one-time']) {
    it(`selects options after their child component finishes async binding with value.${mode}`, async function () {
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
        `<select value.${mode}="selected"><optgroup as-element="async-options"></optgroup></select>`,
        { selected: 'second' },
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
