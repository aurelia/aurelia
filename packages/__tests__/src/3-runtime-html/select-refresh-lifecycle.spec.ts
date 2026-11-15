import { tasksSettled } from '@aurelia/runtime';
import { CustomElement } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/select-refresh-lifecycle.spec.ts', function () {
  it('cleans up select bindings when an opened if branch fails asynchronous activation', async function () {
    let rejectActivation!: (reason: unknown) => void;
    const activation = new Promise<void>((_resolve, reject) => { rejectActivation = reject; });
    let finishCleanup!: () => void;
    const cleanedUp = new Promise<void>(resolve => { finishCleanup = resolve; });
    let attempts = 0;
    let unbindings = 0;
    const Child = CustomElement.define({ name: 'select-refresh-child', template: 'child' }, class {
      public attaching(): void | Promise<void> {
        if (++attempts === 1) return activation;
      }
      public unbinding(): void {
        ++unbindings;
        finishCleanup();
      }
    });
    const fixture = createFixture(
      `<div if="value.bind: show; cache: false">
        <select value.one-time="selected" matcher.bind="matchById">
          <option model.bind="options[0]">First</option>
          <option model.bind="options[1]">Second</option>
        </select>
        <select-refresh-child></select-refresh-child>
      </div>
      <span else>closed</span>`,
      {
        show: false,
        selected: { id: 2 },
        options: [{ id: 1 }, { id: 2 }],
        matchById: (left: { id: number }, right: { id: number }) => left?.id === right?.id,
      },
      [Child],
    );

    // Value-driven If swaps already own cleanup after an asynchronous branch
    // failure. Exercise that existing path with a registered refresh target.
    fixture.component.show = true;
    const failedSelect = fixture.getBy('select');
    assert.deepEqual(Array.from(failedSelect.options, option => option.selected), [false, true]);
    const expected = new Error('expected child activation failure');
    const observedFailure = activation.catch(error => error as unknown);
    rejectActivation(expected);
    assert.strictEqual(await observedFailure, expected);
    await cleanedUp;
    await tasksSettled();
    assert.strictEqual(fixture.queryBy('select'), null);
    assert.strictEqual(unbindings, 1);

    fixture.component.show = false;
    await tasksSettled();
    assert.strictEqual(fixture.getBy('span').textContent, 'closed');
    fixture.component.selected = { id: 1 };
    fixture.component.show = true;
    await tasksSettled();
    const freshSelect = fixture.getBy('select');
    assert.notStrictEqual(freshSelect, failedSelect, 'the uncached branch starts with a new target');
    assert.deepEqual(Array.from(freshSelect.options, option => option.selected), [true, false]);
    assert.strictEqual(attempts, 2);
  });
});
