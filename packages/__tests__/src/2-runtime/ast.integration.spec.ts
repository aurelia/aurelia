import {
  CustomExpression,
  createAccessScopeExpression,
  createConditionalExpression,
} from '@aurelia/expression-parser';
import {
  BindingMode,
  LetBinding,
  PropertyBinding,
} from '@aurelia/runtime-html';
import { batch, cloneIndexMap, getCollectionObserver, type IndexMap, runTasks, tasksSettled } from '@aurelia/runtime';
import {
  assert,
  createContainer,
  createFixture,
  createObserverLocator,
  createScopeForTest,
} from '@aurelia/testing';

describe('2-runtime/ast.integration.spec.ts', function () {
  // well maybe should just delete these tests
  (PropertyBinding as any).mix();
  (LetBinding as any).mix();

  describe('keyed method receivers', function () {
    for (const keyed of [false, true]) {
      it(`calls a string method with its receiver (keyed=${keyed})`, async function () {
        const { component, assertText, tearDown } = createFixture(
          keyed ? '${text[method]()}' : '${text.toUpperCase()}',
          { text: 'label', method: 'toUpperCase' },
        );

        try {
          assertText('LABEL');

          component.text = 'updated';
          await tasksSettled();
          assertText('UPDATED');

          if (keyed) {
            component.method = 'toLowerCase';
            await tasksSettled();
            assertText('updated');
          }
        } finally {
          await tearDown();
        }
      });

      for (const call of [false, true]) {
        it(`dispatches an action on its model (keyed=${keyed}, call=${call})`, async function () {
          const action = keyed ? 'model[action]' : 'model.add';
          const { component, trigger, assertText, tearDown } = createFixture(
            `<button click.trigger="${action}${call ? '()' : ''}">add</button><span>\${model.items.join(',')}</span>`,
            {
              action: 'add',
              model: {
                items: [] as string[],
                add() {
                  this.items.push('item');
                },
              },
            },
          );

          try {
            trigger.click('button');
            await tasksSettled();
            assert.deepStrictEqual(component.model.items, ['item']);
            assertText('additem');
          } finally {
            await tearDown();
          }
        });
      }

      it(`observes an array method through mutations and replacement (keyed=${keyed})`, async function () {
        const { component, assertText, tearDown } = createFixture(
          keyed ? '${items[method](", ")}' : '${items.join(", ")}',
          { items: ['a'], method: 'join' },
        );

        try {
          assertText('a');

          component.items.push('b');
          await tasksSettled();
          assertText('a, b');

          component.items.splice(0, 1);
          await tasksSettled();
          assertText('b');

          const previous = component.items;
          component.items = ['c'];
          await tasksSettled();
          assertText('c');

          previous.push('old');
          component.items.push('d');
          await tasksSettled();
          assertText('c, d');
        } finally {
          await tearDown();
        }
      });

      it(`updates a filtered repeat after source changes (keyed=${keyed})`, async function () {
        const filter = keyed ? 'items[method]' : 'items.filter';
        const { component, assertText, tearDown } = createFixture(
          `<span repeat.for="item of ${filter}(item => item.visible)">\${item.label}</span>`,
          {
            items: [
              { label: 'a', visible: true },
              { label: 'b', visible: false },
            ],
            method: 'filter',
          },
        );

        try {
          assertText('a');

          component.items[1].visible = true;
          await tasksSettled();
          assertText('ab');

          component.items.push({ label: 'c', visible: true });
          await tasksSettled();
          assertText('abc');

          component.items.splice(0, 1);
          await tasksSettled();
          assertText('bc');

          component.items = [{ label: 'd', visible: true }];
          await tasksSettled();
          assertText('d');
        } finally {
          await tearDown();
        }
      });
    }
  });

  describe('[[AccessScope]]', function () {
    describe('PropertyBinding', function () {
      it('binds and unbinds a custom expression', function () {
        class TestExpression extends CustomExpression {
          public bindCallCount = 0;
          public unbindCallCount = 0;

          public override bind(): void {
            ++this.bindCallCount;
          }

          public override unbind(): void {
            ++this.unbindCallCount;
          }
        }

        const container = createContainer();
        const expression = new TestExpression('custom value');
        const target = { value: '' };
        const binding = new PropertyBinding(
          { state: 0 },
          container,
          createObserverLocator(container),
          expression,
          target,
          'value',
          BindingMode.toView,
          false,
        );

        binding.bind(createScopeForTest({}));
        assert.strictEqual(expression.bindCallCount, 1);
        assert.strictEqual(target.value, 'custom value');

        binding.unbind();
        assert.strictEqual(expression.unbindCallCount, 1);
      });

      it('auto connects when evaluates', function () {
        const container = createContainer();
        const observerLocator = createObserverLocator(container);
        const accessScopeExpr = createAccessScopeExpression('name', 0);

        const source = { name: 'hello' };
        const target = { name: '' };
        const binding = new PropertyBinding(
          { state: 0 },
          container,
          observerLocator,
          accessScopeExpr,
          target,
          'name',
          BindingMode.toView,
          false,
        );

        binding.bind(createScopeForTest(source));

        assert.strictEqual(target.name, 'hello');

        Array.from({ length: 5 }).forEach((_, idx) => {
          source.name = `${idx}`;
          assert.strictEqual(target.name, `${idx}`);
        });
      });

      it('auto connects with ternary', function () {
        const container = createContainer();
        const observerLocator = createObserverLocator(container);
        const conditionalExpr = createConditionalExpression(
          createAccessScopeExpression('checked'),
          createAccessScopeExpression('yesMessage'),
          createAccessScopeExpression('noMessage'),
        );

        const source = { checked: false, yesMessage: 'yes', noMessage: 'no' };
        const target = { value: '' };
        const scope = createScopeForTest(target, source);
        const binding = new PropertyBinding(
          { state: 0 },
          container,
          observerLocator,
          conditionalExpr,
          target,
          'value',
          BindingMode.toView,
          false,
        );

        let handleChangeCallCount = 0;
        binding.handleChange = (handleChange => {
          return function (...args: unknown[]) {
            handleChangeCallCount++;
            return handleChange.apply(this, args);
          };
        })(binding.handleChange);
        binding.bind(scope);

        assert.strictEqual(target.value, 'no');

        Array.from({ length: 5 }).forEach((_, idx) => {
          const $count = handleChangeCallCount;
          source.checked = !source.checked;
          assert.strictEqual(target.value, source.checked ? 'yes' : 'no');
          assert.strictEqual(handleChangeCallCount, $count + 1);
          if (source.checked) {
            source.yesMessage = `yes ${idx}`;
            assert.strictEqual(target.value, `yes ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // assert the binding has dropped the old observers of the inactive branch in conditional
            source.noMessage = `no ${idx}`;
            assert.strictEqual(target.value, `yes ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // revert it back for next assertion
            source.noMessage = 'no';
            assert.strictEqual(handleChangeCallCount, $count + 2);
          } else {
            source.noMessage = `no ${idx}`;
            assert.strictEqual(target.value, `no ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // assert the binding has dropped the old observers of the inactive branch in conditional
            source.yesMessage = `yes ${idx}`;
            assert.strictEqual(target.value, `no ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // revert it back to normal for next assertion
            source.yesMessage = 'yes';
            assert.strictEqual(handleChangeCallCount, $count + 2);
          }
        });
      });
    });

    describe('LetBinding', function () {
      it('auto connects when evaluates', function () {
        const container = createContainer();
        const observerLocator = createObserverLocator(container);
        const accessScopeExpr = createAccessScopeExpression('name', 0);

        const source = { value: '' };
        const oc = { name: 'hello' };
        const scope = createScopeForTest(source, oc);
        const binding = new LetBinding(
          { state: 0 },
          container,
          observerLocator,
          accessScopeExpr,
          'value',
          true,
          false,
        );

        binding.bind(scope);

        assert.strictEqual(source.value, 'hello');

        Array.from({ length: 5 }).forEach((_, idx) => {
          oc.name = `${idx}`;
          assert.strictEqual(source.value, `${idx}`);
        });
      });

      it('auto connects with ternary', function () {
        const container = createContainer();
        const observerLocator = createObserverLocator(container);
        const conditionalExpr = createConditionalExpression(
          createAccessScopeExpression('checked'),
          createAccessScopeExpression('yesMessage'),
          createAccessScopeExpression('noMessage'),
        );

        const source = { value: '' };
        const oc = { checked: false, yesMessage: 'yes', noMessage: 'no' };
        const scope = createScopeForTest(source, oc);
        const binding = new LetBinding(
          { state: 0 },
          container,
          observerLocator,
          conditionalExpr,
          'value',
          true,
          false,
        );

        let handleChangeCallCount = 0;
        binding.handleChange = (handleChange => {
          return function (...args: unknown[]) {
            handleChangeCallCount++;
            return handleChange.apply(this, args);
          };
        })(binding.handleChange);
        binding.bind(scope);

        assert.strictEqual(source.value, 'no');
        assert.strictEqual(handleChangeCallCount, 0);

        Array.from({ length: 5 }).forEach((_, idx) => {
          const $count = handleChangeCallCount;
          oc.checked = !oc.checked;
          assert.strictEqual(source.value, oc.checked ? 'yes' : 'no');
          assert.strictEqual(handleChangeCallCount, $count + 1);
          if (oc.checked) {
            oc.yesMessage = `yes ${idx}`;
            assert.strictEqual(source.value, `yes ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // assert the binding has dropped the old observers of the inactive branch in conditional
            oc.noMessage = `no ${idx}`;
            assert.strictEqual(source.value, `yes ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // revert it back for next assertion
            oc.noMessage = 'no';
            assert.strictEqual(handleChangeCallCount, $count + 2);
          } else {
            oc.noMessage = `no ${idx}`;
            assert.strictEqual(source.value, `no ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // assert the binding has dropped the old observers of the inactive branch in conditional
            oc.yesMessage = `no ${idx}`;
            assert.strictEqual(source.value, `no ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // revert it back for next assertion
            oc.yesMessage = 'yes';
            assert.strictEqual(handleChangeCallCount, $count + 2);
          }
        });
      });
    });
  });

  describe('[[AccessMember]]', function () {
    it('notifies when binding with .length', function () {
      const { trigger, assertText } = createFixture
        .component({ items: [1, 2] })
        .html`
          <button click.trigger="items.length = 0">item count: \${items.length}</button>
        `
        .build();
      trigger.click('button');
      runTasks();
      assertText('button', 'item count: 0');
    });
  });

  describe('[[AccessKey]]', function () {
    it('notifies when assigning to array index', function () {
      const { trigger, assertText } = createFixture
        .component({ items: [1, 2] })
        .html`
          <button click.trigger="items[1] = 0">item at [1]: \${items[1]}</button>
        `
        .build();
      trigger.click('button');
      runTasks();
      assertText('button', 'item at [1]: 0');
    });

    it('notifies when binding two way with array index', function () {
      const { getAllBy, type } = createFixture
        .component({ items: [1, 2] })
        .html`
          <button click.trigger="items[1] = 0">item at [1]: \${items[1]}</button>
          <ul>
            <li repeat.for="i of items"><input value.bind="items[$index]"/>item at \${$index}: \${items[$index]}</li>
          </ul>
        `
        .build();

      const inputs = getAllBy('input');
      type(inputs[0], '3');
      runTasks();

      assert.strictEqual(getAllBy('li')[0].textContent, 'item at 0: 3');
    });

    // https://github.com/aurelia/aurelia/issues/2549
    describe('out of bounds index/length (#2549)', function () {
      const html = `<div repeat.for="q of questions"><input value.bind="answers[$index]"></div>`;
      const inputValues = (inputs: HTMLInputElement[]) => inputs.map(i => i.value);

      it('binds each input to its own index when filled out of order starting from an empty array', function () {
        const { component, getAllBy, type } = createFixture
          .component({ questions: ['q1', 'q2', 'q3'], answers: [] as string[] })
          .html(html)
          .build();

        const inputs = getAllBy('input') as HTMLInputElement[];
        type(inputs[2], 'C');
        runTasks();
        assert.deepStrictEqual(component.answers, [undefined, undefined, 'C']);
        assert.deepStrictEqual(inputValues(inputs), ['', '', 'C']);

        type(inputs[0], 'A');
        runTasks();
        assert.deepStrictEqual(component.answers, ['A', undefined, 'C']);
        assert.deepStrictEqual(inputValues(inputs), ['A', '', 'C']);

        type(inputs[1], 'B');
        runTasks();
        assert.deepStrictEqual(component.answers, ['A', 'B', 'C']);
        assert.deepStrictEqual(inputValues(inputs), ['A', 'B', 'C']);
      });

      it('keeps in-order filling unchanged', function () {
        const { component, getAllBy, type } = createFixture
          .component({ questions: ['q1', 'q2', 'q3'], answers: [] as string[] })
          .html(html)
          .build();

        const inputs = getAllBy('input') as HTMLInputElement[];
        type(inputs[0], 'A');
        type(inputs[1], 'B');
        type(inputs[2], 'C');
        runTasks();
        assert.deepStrictEqual(component.answers, ['A', 'B', 'C']);
        assert.deepStrictEqual(inputValues(inputs), ['A', 'B', 'C']);
      });

      it('extends the array when assigning past the end in an event handler', function () {
        const { component, trigger, getAllBy } = createFixture
          .component({ items: ['a'] })
          .html`
            <button click.trigger="items[3] = 'x'"></button>
            <p repeat.for="i of items">\${i}</p>
          `
          .build();

        trigger.click('button');
        runTasks();
        assert.strictEqual(component.items.length, 4);
        assert.deepStrictEqual(component.items, ['a', undefined, undefined, 'x']);
        assert.deepStrictEqual(getAllBy('p').map(p => p.textContent), ['a', '', '', 'x']);
      });

      it('fills a gap larger than the engine argument limit', function () {
        const { component, trigger, assertText } = createFixture
          .component({ items: ['a'], n: 300_000 })
          .html`
            <button click.trigger="items[n] = 'x'">\${items.length}</button>
            <span click.trigger="items.length = n * 2"></span>
          `
          .build();

        trigger.click('button');
        runTasks();
        assert.strictEqual(component.items.length, 300_001);
        assert.strictEqual(component.items[300_000], 'x');
        assert.strictEqual(299_999 in component.items, true);
        assertText('button', '300001');

        trigger.click('span');
        runTasks();
        assert.strictEqual(component.items.length, 600_000);
        assert.strictEqual(599_999 in component.items, true);
        assertText('button', '600000');
      });

      for (const [kind, expr] of [['keyed', `items['length']`], ['member', 'items.length']] as const) {
        it(`grows and shrinks the array when assigning length (${kind})`, function () {
          const { component, trigger, assertText, getAllBy } = createFixture
            .component({ items: ['a'], n: 3 })
            .html`
              <button click.trigger="${expr} = n">\${items.length}</button>
              <p repeat.for="i of items">\${i}</p>
            `
            .build();

          assertText('button', '1');

          trigger.click('button');
          runTasks();
          assert.strictEqual(component.items.length, 3);
          assert.deepStrictEqual(component.items, ['a', undefined, undefined]);
          assertText('button', '3');
          assert.strictEqual(getAllBy('p').length, 3);

          component.n = 1;
          trigger.click('button');
          runTasks();
          assert.deepStrictEqual(component.items, ['a']);
          assertText('button', '1');
          assert.strictEqual(getAllBy('p').length, 1);

          // same length is a no-op
          trigger.click('button');
          runTasks();
          assert.deepStrictEqual(component.items, ['a']);
          assertText('button', '1');
        });
      }
    });
  });

  describe('array assignment growth (#2558)', function () {
    for (const [target, value] of [['items[index]', 'D'], ['items[index]', undefined], ['items.length', 4], ["items['length']", 4]] as const) {
      it(`keeps collection, length, index and repeat observers coherent after ${target} = ${value}`, async function () {
        const isIndex = target === 'items[index]';
        const fixture = createFixture(
          `<button click.trigger="${target} = value"></button><span>\${items.length}</span><p repeat.for="item of items">\${item}</p>`,
          { items: ['A'], index: 3, value },
        );
        const observer = getCollectionObserver(fixture.component.items);
        const maps: IndexMap[] = [];
        const lengths: unknown[][] = [];
        const values: unknown[][] = [];
        observer.subscribe({ handleCollectionChange: (_items, map) => { maps.push(cloneIndexMap(map)); } });
        observer.getLengthObserver().subscribe({ handleChange: (value, oldValue) => { lengths.push([value, oldValue]); } });
        observer.getIndexObserver(3).subscribe({ handleChange: (value, oldValue) => { values.push([value, oldValue]); } });
        try {
          const first = fixture.getAllBy('p')[0];
          fixture.trigger.click('button');
          runTasks();
          assert.strictEqual(maps.length, 1, 'growth is one collection notification');
          assert.deepStrictEqual(Array.from(maps[0]), [0, -2, -2, -2]);
          assert.deepStrictEqual(maps[0].deletedIndices, []);
          assert.deepStrictEqual(maps[0].deletedItems, []);
          assert.deepStrictEqual(fixture.component.items, ['A', undefined, undefined, isIndex ? value : undefined]);
          assert.deepStrictEqual(lengths, [[4, 1]]);
          assert.deepStrictEqual(values, isIndex && value !== undefined ? [[value, undefined]] : []);
          fixture.assertText('span', '4');
          assert.deepStrictEqual(fixture.getAllBy('p').map(p => p.textContent), ['A', '', '', isIndex ? value ?? '' : '']);
          assert.strictEqual(fixture.getAllBy('p')[0], first);

          fixture.component.items.push('E');
          runTasks();
          assert.strictEqual(maps.length, 2);
          assert.deepStrictEqual(Array.from(maps[1]), [0, 1, 2, 3, -2]);
          assert.deepStrictEqual(lengths, [[4, 1], [5, 4]]);
          fixture.assertText('span', '5');
          assert.strictEqual(fixture.getAllBy('p').length, 5);
        } finally {
          await fixture.stop(true);
        }
      });
    }

    it('preserves earlier deletions and retained repeat views when growing in a batch', async function () {
      const fixture = createFixture(
        '<button click.trigger="items[3] = undefined"></button><p repeat.for="item of items">${item}</p>',
        { items: ['A', 'B', 'C'] },
      );
      const maps: IndexMap[] = [];
      getCollectionObserver(fixture.component.items).subscribe({
        handleCollectionChange: (_items, map) => { maps.push(cloneIndexMap(map)); },
      });
      try {
        const rows = fixture.getAllBy('p');
        batch(() => {
          fixture.component.items.splice(1, 1);
          fixture.trigger.click('button');
          assert.strictEqual(maps.length, 0, 'collection delivery is deferred until the batch ends');
        });
        runTasks();
        assert.strictEqual(maps.length, 1);
        assert.deepStrictEqual(Array.from(maps[0]), [0, 2, -2, -2]);
        assert.deepStrictEqual(maps[0].deletedIndices, [1]);
        assert.deepStrictEqual(maps[0].deletedItems, ['B']);
        assert.deepStrictEqual(fixture.component.items, ['A', 'C', undefined, undefined]);
        const updatedRows = fixture.getAllBy('p');
        assert.deepStrictEqual(updatedRows.map(p => p.textContent), ['A', 'C', '', '']);
        assert.strictEqual(updatedRows[0], rows[0]);
        assert.strictEqual(updatedRows[1], rows[2]);
      } finally {
        await fixture.stop(true);
      }
    });

    it('observes subsequent writes after growing an initially unobserved array', async function () {
      const fixture = createFixture(
        '<button click.trigger="items[3] = \'D\'"></button><div if.bind="show"><p repeat.for="item of items">${item}</p></div>',
        { items: ['A'], show: false },
      );
      try {
        // Before the list is first shown, no binding reads this collection or its length.
        fixture.trigger.click('button');
        assert.deepStrictEqual(fixture.component.items, ['A', undefined, undefined, 'D']);
        fixture.component.show = true;
        await tasksSettled();
        assert.deepStrictEqual(fixture.getAllBy('p').map(p => p.textContent), ['A', '', '', 'D']);
        fixture.component.items.push('E');
        runTasks();
        assert.deepStrictEqual(fixture.getAllBy('p').map(p => p.textContent), ['A', '', '', 'D', 'E']);
      } finally {
        await fixture.stop(true);
      }
    });
  });

  describe('[[AccessBoundary]]', function () {
    it('retrieves binding from component boundary in single repeat', async function () {
      const { assertText } = createFixture
        .html`<div repeat.for="name of ['bar', 'baz']">(\${this.name + name})</div>`
        .component({ name: 'foo' })
        .build();

      assertText('(foobar)(foobaz)');
    });

    it('retrieves binding from component boundary in nested repeat', async function () {
      const { assertText } = createFixture
        .html`<div repeat.for="name of ['bar', 'baz']"><div repeat.for="name of ['qux']">(\${this.name + $parent.name + name})</div></div>`
        .component({ name: 'foo' })
        .build();

      assertText('(foobarqux)(foobazqux)');
    });
  });
});
