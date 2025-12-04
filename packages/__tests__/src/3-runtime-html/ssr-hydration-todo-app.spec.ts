/**
 * SSR Hydration - Todo App Integration Test
 *
 * This test mirrors the structure of our real todo app to verify SSR hydration
 * works correctly with:
 * - if > repeat nesting (list wrapped in conditional)
 * - Mutations: push, splice, property changes, array replacement
 * - Multiple bindings per repeat item (checkbox, text, click handlers)
 */

import { Aurelia } from '@aurelia/runtime-html';
import {
  BindingMode,
  PropertyBindingInstruction,
  TextBindingInstruction,
  HydrateTemplateController,
  IteratorBindingInstruction,
} from '@aurelia/template-compiler';
import { assert, TestContext } from '@aurelia/testing';
import type { IHydrationManifest } from '@aurelia/runtime-html';

import {
  createViewDef,
  createParentTemplate,
  assertCheckboxes,
  flush,
  texts,
  count,
} from './ssr-hydration.helpers.js';

describe('3-runtime-html/ssr-hydration-todo-app.spec.ts', function () {

  // ============================================================================
  // Types
  // ============================================================================

  interface Todo {
    id: number;
    text: string;
    completed: boolean;
  }

  // ============================================================================
  // Todo App Hydration Tests
  // ============================================================================

  describe('Todo app structure: if > repeat', function () {

    /**
     * Test the core todo app pattern:
     * <ul if.bind="todos.length > 0">
     *   <li repeat.for="todo of todos">
     *     <input type="checkbox" checked.bind="todo.completed">
     *     <span>${todo.text}</span>
     *   </li>
     * </ul>
     */
    it('hydrates if containing repeat with initial items', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      // Inner repeat view: <li><input checked.bind><span>${text}</span></li>
      // Local indices: 0=li, 1=input (checked), 2=span (text)
      const repeatViewDef = createViewDef(doc,
        '<li au-hid="0"><input au-hid="1" type="checkbox"><span><!--au:2--> </span></li>',
        [
          [], // 0: li element (no bindings on element itself)
          [new PropertyBindingInstruction('todo.completed', 'checked', BindingMode.twoWay)], // 1: checkbox
          [new TextBindingInstruction('todo.text')], // 2: text
        ]
      );

      const repeatInstruction = new HydrateTemplateController(
        repeatViewDef,
        'repeat',
        undefined,
        [new IteratorBindingInstruction('todo of todos', 'items', [])]
      );

      // If view: <ul><!--repeat render location--></ul>
      // Local indices: 0=repeat location
      const ifViewDef = createViewDef(doc,
        '<ul><!--au:0--><!--au-start--><!--au-end--></ul>',
        [[repeatInstruction]]
      );

      const ifInstruction = new HydrateTemplateController(
        ifViewDef,
        'if',
        undefined,
        [new PropertyBindingInstruction('todos.length > 0', 'value', BindingMode.toView)]
      );

      // Parent template: <!--au:0--><!--au-start--><!--au-end-->
      const parentTemplate = doc.createElement('template');
      parentTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end-->';

      class TodoApp {
        static $au = {
          type: 'custom-element' as const,
          name: 'todo-app',
          template: parentTemplate,
          instructions: [[ifInstruction]],
          needsCompile: false,
        };
        todos: Todo[] = [];
      }

      // SSR output with 3 todos
      // Global indices:
      // 0 = if render location
      // 1 = repeat render location (inside if's view)
      // 2,3,4 = first todo item targets (li, input, text)
      // 5,6,7 = second todo item targets
      // 8,9,10 = third todo item targets
      const host = doc.createElement('div');
      host.innerHTML = [
        '<!--au:0--><!--au-start-->',
        '<ul>',
        '<!--au:1--><!--au-start-->',
        '<li au-hid="2"><input au-hid="3" type="checkbox"><span><!--au:4-->Learn Aurelia</span></li>',
        '<li au-hid="5"><input au-hid="6" type="checkbox" checked><span><!--au:7-->Build app</span></li>',
        '<li au-hid="8"><input au-hid="9" type="checkbox"><span><!--au:10-->Deploy</span></li>',
        '<!--au-end-->',
        '</ul>',
        '<!--au-end-->',
      ].join('');
      doc.body.appendChild(host);

      const initialTodos: Todo[] = [
        { id: 1, text: 'Learn Aurelia', completed: false },
        { id: 2, text: 'Build app', completed: true },
        { id: 3, text: 'Deploy', completed: false },
      ];

      try {
        const au = new Aurelia(ctx.container);
        const root = await au.hydrate({
          host,
          component: TodoApp,
          state: { todos: initialTodos },
          manifest: {
            targetCount: 11,
            controllers: {
              // If at target 0: shows view with targets [1] (the repeat location)
              0: { type: 'if', views: [{ targets: [1], nodeCount: 1 }] },
              // Repeat at target 1: 3 views, each with 3 targets
              1: {
                type: 'repeat',
                views: [
                  { targets: [2, 3, 4], nodeCount: 1 },
                  { targets: [5, 6, 7], nodeCount: 1 },
                  { targets: [8, 9, 10], nodeCount: 1 },
                ]
              },
            }
          } as IHydrationManifest,
        });

        const instance = root.controller.viewModel as TodoApp;

        // Verify initial state
        assert.strictEqual(count(host, 'li'), 3, 'should have 3 items');
        assert.strictEqual(count(host, 'input[type="checkbox"]'), 3, 'should have 3 checkboxes');
        assertCheckboxes(host, [false, true, false]);
        assert.deepStrictEqual(texts(host, 'span'), ['Learn Aurelia', 'Build app', 'Deploy']);

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('handles push mutation after hydration', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      // Simpler structure: repeat only (no if wrapper) for isolated push test
      const repeatViewDef = createViewDef(doc,
        '<li><!--au:0--> </li>',
        [[new TextBindingInstruction('todo.text')]]
      );

      const repeatInstruction = new HydrateTemplateController(
        repeatViewDef,
        'repeat',
        undefined,
        [new IteratorBindingInstruction('todo of todos', 'items', [])]
      );

      const parentTemplate = doc.createElement('template');
      parentTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end-->';

      class TodoApp {
        static $au = {
          type: 'custom-element' as const,
          name: 'todo-app',
          template: parentTemplate,
          instructions: [[repeatInstruction]],
          needsCompile: false,
        };
        todos: Todo[] = [];
      }

      // SSR output with 2 todos
      const host = doc.createElement('ul');
      host.innerHTML = [
        '<!--au:0--><!--au-start-->',
        '<li><!--au:1-->Item 1</li>',
        '<li><!--au:2-->Item 2</li>',
        '<!--au-end-->',
      ].join('');
      doc.body.appendChild(host);

      const initialTodos: Todo[] = [
        { id: 1, text: 'Item 1', completed: false },
        { id: 2, text: 'Item 2', completed: false },
      ];

      try {
        const au = new Aurelia(ctx.container);
        const root = await au.hydrate({
          host,
          component: TodoApp,
          state: { todos: initialTodos },
          manifest: {
            targetCount: 3,
            controllers: {
              0: {
                type: 'repeat',
                views: [
                  { targets: [1], nodeCount: 1 },
                  { targets: [2], nodeCount: 1 },
                ]
              },
            }
          } as IHydrationManifest,
        });

        const instance = root.controller.viewModel as TodoApp;

        // Verify initial state
        assert.strictEqual(count(host, 'li'), 2, 'should have 2 items initially');

        // Mutation: push new todo
        instance.todos.push({ id: 3, text: 'Item 3', completed: false });
        await flush();

        // Verify mutation result
        assert.strictEqual(count(host, 'li'), 3, 'should have 3 items after push');
        assert.deepStrictEqual(texts(host, 'li'), ['Item 1', 'Item 2', 'Item 3']);

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('handles splice (remove) mutation after hydration', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      const repeatViewDef = createViewDef(doc,
        '<li><!--au:0--> </li>',
        [[new TextBindingInstruction('todo.text')]]
      );

      const repeatInstruction = new HydrateTemplateController(
        repeatViewDef,
        'repeat',
        undefined,
        [new IteratorBindingInstruction('todo of todos', 'items', [])]
      );

      const parentTemplate = doc.createElement('template');
      parentTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end-->';

      class TodoApp {
        static $au = {
          type: 'custom-element' as const,
          name: 'todo-app',
          template: parentTemplate,
          instructions: [[repeatInstruction]],
          needsCompile: false,
        };
        todos: Todo[] = [];
      }

      const host = doc.createElement('ul');
      host.innerHTML = [
        '<!--au:0--><!--au-start-->',
        '<li><!--au:1-->Item 1</li>',
        '<li><!--au:2-->Item 2</li>',
        '<li><!--au:3-->Item 3</li>',
        '<!--au-end-->',
      ].join('');
      doc.body.appendChild(host);

      const initialTodos: Todo[] = [
        { id: 1, text: 'Item 1', completed: false },
        { id: 2, text: 'Item 2', completed: false },
        { id: 3, text: 'Item 3', completed: false },
      ];

      try {
        const au = new Aurelia(ctx.container);
        const root = await au.hydrate({
          host,
          component: TodoApp,
          state: { todos: initialTodos },
          manifest: {
            targetCount: 4,
            controllers: {
              0: {
                type: 'repeat',
                views: [
                  { targets: [1], nodeCount: 1 },
                  { targets: [2], nodeCount: 1 },
                  { targets: [3], nodeCount: 1 },
                ]
              },
            }
          } as IHydrationManifest,
        });

        const instance = root.controller.viewModel as TodoApp;

        // Verify initial state
        assert.strictEqual(count(host, 'li'), 3, 'should have 3 items initially');

        // Mutation: remove middle item
        instance.todos.splice(1, 1);
        await flush();

        // Verify mutation result
        assert.strictEqual(count(host, 'li'), 2, 'should have 2 items after splice');
        assert.deepStrictEqual(texts(host, 'li'), ['Item 1', 'Item 3']);

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('handles property change (toggle completion) after hydration', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      const repeatViewDef = createViewDef(doc,
        '<li au-hid="0"><input au-hid="1" type="checkbox"><span><!--au:2--> </span></li>',
        [
          [],
          [new PropertyBindingInstruction('todo.completed', 'checked', BindingMode.twoWay)],
          [new TextBindingInstruction('todo.text')],
        ]
      );

      const repeatInstruction = new HydrateTemplateController(
        repeatViewDef,
        'repeat',
        undefined,
        [new IteratorBindingInstruction('todo of todos', 'items', [])]
      );

      const parentTemplate = doc.createElement('template');
      parentTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end-->';

      class TodoApp {
        static $au = {
          type: 'custom-element' as const,
          name: 'todo-app',
          template: parentTemplate,
          instructions: [[repeatInstruction]],
          needsCompile: false,
        };
        todos: Todo[] = [];
      }

      const host = doc.createElement('ul');
      host.innerHTML = [
        '<!--au:0--><!--au-start-->',
        '<li au-hid="1"><input au-hid="2" type="checkbox"><span><!--au:3-->Item 1</span></li>',
        '<li au-hid="4"><input au-hid="5" type="checkbox"><span><!--au:6-->Item 2</span></li>',
        '<!--au-end-->',
      ].join('');
      doc.body.appendChild(host);

      const initialTodos: Todo[] = [
        { id: 1, text: 'Item 1', completed: false },
        { id: 2, text: 'Item 2', completed: false },
      ];

      try {
        const au = new Aurelia(ctx.container);
        const root = await au.hydrate({
          host,
          component: TodoApp,
          state: { todos: initialTodos },
          manifest: {
            targetCount: 7,
            controllers: {
              0: {
                type: 'repeat',
                views: [
                  { targets: [1, 2, 3], nodeCount: 1 },
                  { targets: [4, 5, 6], nodeCount: 1 },
                ]
              },
            }
          } as IHydrationManifest,
        });

        const instance = root.controller.viewModel as TodoApp;

        // Verify initial state
        assertCheckboxes(host, [false, false]);

        // Mutation: toggle first item's completion
        instance.todos[0]!.completed = true;
        await flush();

        // Verify mutation result
        assertCheckboxes(host, [true, false]);

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('handles if toggle (show/hide list) after hydration', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      // Repeat view
      const repeatViewDef = createViewDef(doc,
        '<li><!--au:0--> </li>',
        [[new TextBindingInstruction('todo.text')]]
      );

      const repeatInstruction = new HydrateTemplateController(
        repeatViewDef,
        'repeat',
        undefined,
        [new IteratorBindingInstruction('todo of todos', 'items', [])]
      );

      // If view containing repeat
      const ifViewDef = createViewDef(doc,
        '<ul><!--au:0--><!--au-start--><!--au-end--></ul>',
        [[repeatInstruction]]
      );

      const ifInstruction = new HydrateTemplateController(
        ifViewDef,
        'if',
        undefined,
        [new PropertyBindingInstruction('showList', 'value', BindingMode.toView)]
      );

      const parentTemplate = doc.createElement('template');
      parentTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end-->';

      class TodoApp {
        static $au = {
          type: 'custom-element' as const,
          name: 'todo-app',
          template: parentTemplate,
          instructions: [[ifInstruction]],
          needsCompile: false,
        };
        showList = true;
        todos: Todo[] = [];
      }

      // SSR output: if=true, 2 items
      const host = doc.createElement('div');
      host.innerHTML = [
        '<!--au:0--><!--au-start-->',
        '<ul>',
        '<!--au:1--><!--au-start-->',
        '<li><!--au:2-->Item 1</li>',
        '<li><!--au:3-->Item 2</li>',
        '<!--au-end-->',
        '</ul>',
        '<!--au-end-->',
      ].join('');
      doc.body.appendChild(host);

      const initialTodos: Todo[] = [
        { id: 1, text: 'Item 1', completed: false },
        { id: 2, text: 'Item 2', completed: false },
      ];

      try {
        const au = new Aurelia(ctx.container);
        const root = await au.hydrate({
          host,
          component: TodoApp,
          state: { showList: true, todos: initialTodos },
          manifest: {
            targetCount: 4,
            controllers: {
              0: { type: 'if', views: [{ targets: [1], nodeCount: 1 }] },
              1: {
                type: 'repeat',
                views: [
                  { targets: [2], nodeCount: 1 },
                  { targets: [3], nodeCount: 1 },
                ]
              },
            }
          } as IHydrationManifest,
        });

        const instance = root.controller.viewModel as TodoApp;

        // Verify initial state
        assert.strictEqual(count(host, 'ul'), 1, 'list visible initially');
        assert.strictEqual(count(host, 'li'), 2, 'should have 2 items');

        // Mutation: hide list
        instance.showList = false;
        await flush();

        // Verify list hidden
        assert.strictEqual(count(host, 'ul'), 0, 'list hidden after toggle');
        assert.strictEqual(count(host, 'li'), 0, 'items removed with list');

        // Mutation: show list again
        instance.showList = true;
        await flush();

        // Verify list restored
        assert.strictEqual(count(host, 'ul'), 1, 'list visible again');
        assert.strictEqual(count(host, 'li'), 2, 'items restored');
        assert.deepStrictEqual(texts(host, 'li'), ['Item 1', 'Item 2']);

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('handles array replacement (clearCompleted pattern) after hydration', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      const repeatViewDef = createViewDef(doc,
        '<li><!--au:0--> </li>',
        [[new TextBindingInstruction('todo.text')]]
      );

      const repeatInstruction = new HydrateTemplateController(
        repeatViewDef,
        'repeat',
        undefined,
        [new IteratorBindingInstruction('todo of todos', 'items', [])]
      );

      const parentTemplate = doc.createElement('template');
      parentTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end-->';

      class TodoApp {
        static $au = {
          type: 'custom-element' as const,
          name: 'todo-app',
          template: parentTemplate,
          instructions: [[repeatInstruction]],
          needsCompile: false,
        };
        todos: Todo[] = [];

        clearCompleted() {
          this.todos = this.todos.filter(t => !t.completed);
        }
      }

      const host = doc.createElement('ul');
      host.innerHTML = [
        '<!--au:0--><!--au-start-->',
        '<li><!--au:1-->Active 1</li>',
        '<li><!--au:2-->Completed</li>',
        '<li><!--au:3-->Active 2</li>',
        '<!--au-end-->',
      ].join('');
      doc.body.appendChild(host);

      const initialTodos: Todo[] = [
        { id: 1, text: 'Active 1', completed: false },
        { id: 2, text: 'Completed', completed: true },
        { id: 3, text: 'Active 2', completed: false },
      ];

      try {
        const au = new Aurelia(ctx.container);
        const root = await au.hydrate({
          host,
          component: TodoApp,
          state: { todos: initialTodos },
          manifest: {
            targetCount: 4,
            controllers: {
              0: {
                type: 'repeat',
                views: [
                  { targets: [1], nodeCount: 1 },
                  { targets: [2], nodeCount: 1 },
                  { targets: [3], nodeCount: 1 },
                ]
              },
            }
          } as IHydrationManifest,
        });

        const instance = root.controller.viewModel as TodoApp;

        // Verify initial state
        assert.strictEqual(count(host, 'li'), 3);

        // Mutation: clear completed (array replacement)
        instance.clearCompleted();
        await flush();

        // Verify only active items remain
        assert.strictEqual(count(host, 'li'), 2);
        assert.deepStrictEqual(texts(host, 'li'), ['Active 1', 'Active 2']);

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('handles complex sequence: add, toggle, remove after hydration', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      const repeatViewDef = createViewDef(doc,
        '<li au-hid="0"><input au-hid="1" type="checkbox"><span><!--au:2--> </span></li>',
        [
          [],
          [new PropertyBindingInstruction('todo.completed', 'checked', BindingMode.twoWay)],
          [new TextBindingInstruction('todo.text')],
        ]
      );

      const repeatInstruction = new HydrateTemplateController(
        repeatViewDef,
        'repeat',
        undefined,
        [new IteratorBindingInstruction('todo of todos', 'items', [])]
      );

      const parentTemplate = doc.createElement('template');
      parentTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end-->';

      class TodoApp {
        static $au = {
          type: 'custom-element' as const,
          name: 'todo-app',
          template: parentTemplate,
          instructions: [[repeatInstruction]],
          needsCompile: false,
        };
        todos: Todo[] = [];
        nextId = 3;

        addTodo(text: string) {
          this.todos.push({ id: this.nextId++, text, completed: false });
        }

        toggleTodo(index: number) {
          this.todos[index]!.completed = !this.todos[index]!.completed;
        }

        removeTodo(index: number) {
          this.todos.splice(index, 1);
        }
      }

      const host = doc.createElement('ul');
      host.innerHTML = [
        '<!--au:0--><!--au-start-->',
        '<li au-hid="1"><input au-hid="2" type="checkbox"><span><!--au:3-->Todo 1</span></li>',
        '<li au-hid="4"><input au-hid="5" type="checkbox"><span><!--au:6-->Todo 2</span></li>',
        '<!--au-end-->',
      ].join('');
      doc.body.appendChild(host);

      const initialTodos: Todo[] = [
        { id: 1, text: 'Todo 1', completed: false },
        { id: 2, text: 'Todo 2', completed: false },
      ];

      try {
        const au = new Aurelia(ctx.container);
        const root = await au.hydrate({
          host,
          component: TodoApp,
          state: { todos: initialTodos, nextId: 3 },
          manifest: {
            targetCount: 7,
            controllers: {
              0: {
                type: 'repeat',
                views: [
                  { targets: [1, 2, 3], nodeCount: 1 },
                  { targets: [4, 5, 6], nodeCount: 1 },
                ]
              },
            }
          } as IHydrationManifest,
        });

        const instance = root.controller.viewModel as TodoApp;

        // Step 1: Add new item
        instance.addTodo('Todo 3');
        await flush();

        assert.strictEqual(count(host, 'li'), 3, 'should have 3 items after add');
        assert.deepStrictEqual(texts(host, 'span'), ['Todo 1', 'Todo 2', 'Todo 3']);

        // Step 2: Toggle first item
        instance.toggleTodo(0);
        await flush();

        assertCheckboxes(host, [true, false, false]);

        // Step 3: Remove second item
        instance.removeTodo(1);
        await flush();

        assert.strictEqual(count(host, 'li'), 2, 'should have 2 items after remove');
        assert.deepStrictEqual(texts(host, 'span'), ['Todo 1', 'Todo 3']);

        // Verify first item still completed
        assertCheckboxes(host, [true, false]);

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

  });

});
