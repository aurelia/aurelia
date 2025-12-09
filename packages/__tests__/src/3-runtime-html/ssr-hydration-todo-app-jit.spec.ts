/**
 * SSR Hydration - Todo App Integration (JIT)
 *
 * Realistic todo app patterns with SSR hydration.
 */

import { assert } from '@aurelia/testing';
import { render, q, flush } from './ssr-hydration-jit.helpers.js';

interface Todo { id: number; text: string; completed: boolean; }

describe('3-runtime-html/ssr-hydration-todo-app-jit.spec.ts', function () {

  it('hydrates todo list with checkboxes', async function () {
    const { host, stop } = await render(
      '<ul><li repeat.for="t of todos"><input type="checkbox" checked.bind="t.completed"><span>${t.text}</span></li></ul>',
      { todos: [
        { id: 1, text: 'Learn', completed: false },
        { id: 2, text: 'Build', completed: true },
      ] as Todo[] }
    );
    assert.deepStrictEqual(q.checks(host), [false, true], 'checkboxes should match completed state');
    assert.includes(q.texts(host, 'span'), 'Learn', 'should have Learn');
    await stop();
  });

  it('handles add todo', async function () {
    const { host, vm, stop } = await render(
      '<li repeat.for="t of todos">${t.text}</li>',
      { todos: [{ id: 1, text: 'A' }] as Todo[] }
    );
    (vm as { todos: Todo[] }).todos.push({ id: 2, text: 'B', completed: false });
    await flush();
    assert.includes(q.texts(host, 'li'), 'B', 'should have B');
    await stop();
  });

  it('handles remove todo', async function () {
    const { host, vm, stop } = await render(
      '<li repeat.for="t of todos">${t.text}</li>',
      { todos: [{ id: 1, text: 'A' }, { id: 2, text: 'B' }, { id: 3, text: 'C' }] as Todo[] }
    );
    (vm as { todos: Todo[] }).todos.splice(1, 1);
    await flush();
    const texts = q.texts(host, 'li');
    assert.includes(texts, 'A', 'should have A');
    assert.includes(texts, 'C', 'should have C');
    await stop();
  });

  it('handles toggle completed', async function () {
    const { host, vm, stop } = await render(
      '<li repeat.for="t of todos"><input type="checkbox" checked.bind="t.completed"></li>',
      { todos: [{ id: 1, text: 'A', completed: false }] as Todo[] }
    );
    assert.deepStrictEqual(q.checks(host), [false], 'should be unchecked');
    (vm as { todos: Todo[] }).todos[0].completed = true;
    await flush();
    assert.deepStrictEqual(q.checks(host), [true], 'should be checked');
    await stop();
  });

  it('handles clear completed (array replacement)', async function () {
    const { host, vm, stop } = await render(
      '<li repeat.for="t of todos">${t.text}</li>',
      { todos: [
        { id: 1, text: 'Active', completed: false },
        { id: 2, text: 'Done', completed: true },
      ] as Todo[] }
    );
    const v = vm as { todos: Todo[] };
    v.todos = v.todos.filter(t => !t.completed);
    await flush();
    assert.includes(q.texts(host, 'li'), 'Active', 'should have Active');
    await stop();
  });

  it('handles if > repeat (conditional list)', async function () {
    const { host, vm, stop } = await render(
      '<ul if.bind="show"><li repeat.for="t of todos">${t.text}</li></ul>',
      { show: true, todos: [{ id: 1, text: 'A' }] as Todo[] }
    );
    assert.strictEqual(q.count(host, 'ul') >= 1, true, 'should have ul');
    (vm as { show: boolean }).show = false;
    await flush();
    (vm as { show: boolean }).show = true;
    await flush();
    assert.includes(q.texts(host, 'li'), 'A', 'should have A');
    await stop();
  });

  it('handles complex sequence: add, toggle, remove', async function () {
    const { host, vm, stop } = await render(
      '<li repeat.for="t of todos"><input type="checkbox" checked.bind="t.completed"><span>${t.text}</span></li>',
      { todos: [{ id: 1, text: 'T1', completed: false }, { id: 2, text: 'T2', completed: false }] as Todo[] }
    );
    const v = vm as { todos: Todo[] };

    // Add
    v.todos.push({ id: 3, text: 'T3', completed: false });
    await flush();
    assert.includes(q.texts(host, 'span'), 'T3', 'should have T3');

    // Toggle
    v.todos[0].completed = true;
    await flush();

    // Remove
    v.todos.splice(1, 1);
    await flush();

    const texts = q.texts(host, 'span');
    assert.includes(texts, 'T1', 'should have T1');
    assert.includes(texts, 'T3', 'should have T3');
    await stop();
  });
});
