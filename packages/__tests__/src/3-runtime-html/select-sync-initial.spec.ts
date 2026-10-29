import { assert, createFixture } from '@aurelia/testing';
import { CustomElement } from '@aurelia/runtime-html';

describe('3-runtime-html/select-sync-initial.spec.ts', function () {
  for (const mode of ['bind', 'to-view', 'one-time']) {
    it(`synchronizes the initial selection after option models and matcher bind with value.${mode}`, function () {
      const selected = { id: 2 };
      const { appHost, component, tearDown } = createFixture(
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

      try {
        const select = appHost.querySelector('select')!;
        assert.deepEqual(Array.from(select.options, option => option.selected), [false, true]);
        assert.strictEqual(component.selected, selected);
      } finally {
        void tearDown();
      }
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
    const fixture = createFixture(
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
      const select = fixture.appHost.querySelector('select')!;
      assert.deepEqual(Array.from(select.options, option => option.selected), [false, true]);
    } finally {
      resolveAttaching();
      await fixture.started;
      await fixture.tearDown();
    }
  });
});
