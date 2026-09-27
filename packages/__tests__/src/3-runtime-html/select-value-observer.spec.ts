import { tasksSettled } from '@aurelia/runtime';
import { SelectValueObserver } from '@aurelia/runtime-html';
import { h, TestContext, verifyEqual, assert, createFixture } from '@aurelia/testing';

type Anything = any;

describe('3-runtime-html/select-value-observer.spec.ts', function () {
  describe('[UNIT]', function () {
    function createFixture(initialValue: Anything = '', options = [], multiple = false) {
      const ctx = TestContext.create();
      const { platform, observerLocator } = ctx;

      const optionElements = options.map(o => `<option value="${o}">${o}</option>`).join('\n');
      const markup = `<select ${multiple ? 'multiple' : ''}>\n${optionElements}\n</select>`;
      const el = ctx.createElementFromMarkup(markup) as HTMLSelectElement;
      const sut = observerLocator.getObserver(el, 'value') as SelectValueObserver;
      sut.setValue(initialValue);

      return { ctx, el, sut, platform };
    }

    describe('setValue()', function () {
      const valuesArr = [['', 'foo', 'bar']];
      const initialArr = ['', 'foo', 'bar'];
      const nextArr = ['', 'foo', 'bar'];
      for (const values of valuesArr) {
        for (const initial of initialArr) {
          for (const next of nextArr) {
            it(`sets 'value' from "${initial}" to "${next}"`, async function () {
              const { el, sut } = createFixture(initial, values);

              assert.strictEqual(el.value, initial, `el.value`);

              sut.setValue(next);

              assert.strictEqual(el.value, next, `el.value`);
            });
          }
        }
      }
    });

    describe('synchronizeOptions', function () {
      return;
    });

    describe('synchronizeValue()', function () {
      describe('<select />', function () {
        return;
      });
      // There is subtle difference in behavior of synchronization for SelectObserver
      // When synchronzing value without synchronizing Options prior
      // the behavior is different, as such, if currentValue is an array
      //    1. With synchronizeOptions: source => target => source. Or selected <option/> are based on value array
      //    2. Without synchronizeOptions: target => source. Or selected values are based on selected <option/>
      describe('<select multiple="true" />', function () {
        it('retrieves value freshly when not observing', async function () {
          const initialValue = [];
          const { sut, el } = createMutiSelectSut(initialValue, [
            option({ text: 'A' }),
            option({ text: 'B' }),
            option({ text: 'C' })
          ]);
          el.options[0].selected = el.options[1].selected = true;

          assert.notStrictEqual(initialValue, sut.getValue());
          assert.deepEqual(['A', 'B'], sut.getValue(), `currentValue`);
        });

        it('retrieves <option /> "model" if has', async function () {
          const { sut } = createMutiSelectSut([], [
            option({ text: 'A', _model: { id: 1, name: 'select 1' }, selected: true }),
            option({ text: 'B', _model: { id: 2, name: 'select 2' }, selected: true }),
            option({ text: 'C' })
          ]);

          verifyEqual(
            [
              { id: 1, name: 'select 1' },
              { id: 2, name: 'select 2' }
            ],
            sut.getValue()
          );
        });

        it('synchronizes with array (3): disregard "value" when there is model', async function () {
          const { sut, el } = createMutiSelectSut([], [
            option({ text: 'A', value: 'AA', _model: { id: 1, name: 'select 1' }, selected: true }),
            option({ text: 'B', value: 'BB', _model: { id: 2, name: 'select 2' }, selected: true }),
            option({ text: 'C', value: 'CC' })
          ]);

          el.options[0].selected = el.options[1].selected = true;
          const currentValue = sut.getValue() as any[];

          sut.syncValue();

          assert.deepEqual(currentValue, sut.getValue(), `currentValue`);
          assert.strictEqual(currentValue.length, 2, `currentValue['length']`);

          verifyEqual(
            currentValue,
            [
              { id: 1, name: 'select 1' },
              { id: 2, name: 'select 2' }
            ]
          );
        });

        it('synchronize regardless disabled state of <option/>', async function () {
          const { sut, el } = createMutiSelectSut([], [
            option({ text: 'A', value: 'AA', _model: { id: 1, name: 'select 1' }, selected: true }),
            option({ text: 'B', value: 'BB', disabled: true, _model: { id: 2, name: 'select 2' }, selected: true }),
            option({ text: 'C', value: 'CC', disabled: true, selected: true })
          ]);

          for (let i = 0; i < el.options.length; i++) {
            el.options[i].selected = true;
          }
          const currentValue = sut.getValue();

          sut.syncValue();

          assert.deepEqual(currentValue, sut.getValue(), `currentValue`);

          verifyEqual(
            currentValue,
            [
              { id: 1, name: 'select 1' },
              { id: 2, name: 'select 2' },
              'CC'
            ]
          );
        });

        it('syncs array & <option/> mutation (from repeat etc...)', async function () {
          const { sut, el, ctx } = createMutiSelectSut([], [
            option({ text: 'A', value: 'AA', _model: { id: 1, name: 'select 1' }, selected: true }),
            option({ text: 'B', value: 'BB', disabled: true, _model: { id: 2, name: 'select 2' }, selected: true }),
            option({ text: 'C', value: 'CC', disabled: true, selected: true })
          ]);

          for (let i = 0; i < el.options.length; i++) {
            el.options[i].selected = true;
          }

          let handleChangeCallCount = 0;
          let currentValue = sut.getValue() as any[];
          const noopSubscriber = {
            handleChange() {
              handleChangeCallCount++;
            },
          };

          sut.syncValue();
          assert.deepEqual(currentValue, sut.getValue(), `currentValue`);
          sut.subscribe(noopSubscriber);

          el.add(option({ text: 'DD', value: 'DD', selected: true })(ctx));
          await Promise.resolve();

          // currentValue = sut.getValue() as any[];
          assert.strictEqual(handleChangeCallCount, 0);
          assert.strictEqual(el.options[3].value, 'DD');
          assert.strictEqual(el.options[3].selected, false);

          currentValue = sut.getValue() as any[];

          assert.deepEqual(
            currentValue,
            [
              { id: 1, name: 'select 1' },
              { id: 2, name: 'select 2' },
              'CC',
            ]
          );

          currentValue.push('DD');
          await Promise.resolve();
          assert.strictEqual(handleChangeCallCount, 0);
          assert.strictEqual(el.options[3].value, 'DD');
          assert.strictEqual(el.options[3].selected, true);
          assert.deepEqual(
            currentValue,
            [
              { id: 1, name: 'select 1' },
              { id: 2, name: 'select 2' },
              'CC',
              'DD'
            ]
          );

          sut.unsubscribe(noopSubscriber);
        });

        describe('with <optgroup>', function () {
          it('synchronizes with array', async function () {
            const { sut, el } = createMutiSelectSut([], [
              optgroup(
                {},
                option({ text: 'A', _model: { id: 1, name: 'select 1' }, selected: true }),
                option({ text: 'B', _model: { id: 2, name: 'select 2' }, selected: true }),
              ),
              option({ text: 'C', value: 'CC' })
            ]);

            el.options[0].selected = el.options[1].selected = true;

            let currentValue = sut.getValue() as any[];
            assert.strictEqual(currentValue.length, 2, `currentValue.length`);

            sut.syncValue();
            currentValue = sut.getValue() as any[];

            assert.deepEqual(
              sut.getValue(),
              [
                { id: 1, name: 'select 1' },
                { id: 2, name: 'select 2' }
              ]
            );
          });

        });

        type SelectValidChild = HTMLOptionElement | HTMLOptGroupElement;

        function createMutiSelectSut(initialValue: Anything[] | undefined, optionFactories: ((ctx: TestContext) => SelectValidChild)[]) {
          const ctx = TestContext.create();
          const { observerLocator } = ctx;

          const el = select(...optionFactories.map(create => create(ctx)))(ctx);
          const sut = observerLocator.getObserver(el, 'value') as SelectValueObserver;
          sut.setValue(initialValue);

          return { ctx, el, sut };
        }

        function select(...options: SelectValidChild[]): (ctx: TestContext) => HTMLSelectElement {
          return function (_ctx: TestContext) {
            return h(
              'select',
              { multiple: true },
              ...options
            );
          };
        }
      });
    });

    function option(attributes: Record<string, any>) {
      return function (_ctx: TestContext) {
        return h('option', attributes);
      };
    }

    function optgroup(attributes: Record<string, any>, ...optionFactories: ((ctx: TestContext) => HTMLOptionElement)[]) {
      return function (ctx: TestContext) {
        return h('optgroup', attributes, ...optionFactories.map(create => create(ctx)));
      };
    }
  });

  it('handles source change', async function () {
    const { ctx, component, tearDown } = await createFixture(
      `<h3>Select Product</h3>
      <select value.bind="selectedProductId" ref="selectEl">
        <option model.bind="null">Choose...</option>
        <option repeat.for="product of products" model.bind="product.id">
            \${product.id} - \${product.name}
        </option>
      </select>

      <h3>Data</h3>
      Selected product ID: \${selectedProductId}
      <button click.trigger="clear()">clear</button>`,
      class App {
        public selectEl: HTMLSelectElement;
        public products = [
          { id: 0, name: "Motherboard" },
          { id: 1, name: "CPU" },
          { id: 2, name: "Memory" }
        ];
        public selectedProductId = null;
        public clear() {
          this.selectedProductId = null;
        }
      }
    ).started;

    component.selectEl.selectedIndex = 2;
    component.selectEl.dispatchEvent(new ctx.CustomEvent('change'));
    assert.strictEqual(component.selectedProductId, 1);

    component.clear();
    await tasksSettled();
    assert.strictEqual(component.selectEl.selectedIndex, 0);

    await tearDown();
  });

  describe('initial selection', function () {
    for (const selected of [void 0, null, 'missing']) {
      it(`preserves the selection contract for an initial ${String(selected)} value`, async function () {
        const { appHost, tearDown } = createFixture(
          `<select value.bind="selected">
            <option ${selected === null ? 'model.bind="null"' : 'value="hardware"'}>Choose...</option>
            <option value="support">Support</option>
          </select>`,
          { selected },
        );
        const select = appHost.querySelector('select')!;
        const initialIndex = select.selectedIndex;
        try {
          await tasksSettled();
          assert.strictEqual(select.selectedIndex, selected === 'missing' ? initialIndex : 0);
        } finally {
          await tearDown();
        }
      });
    }

    it('preserves authored DOM selection with a from-view binding', async function () {
      const { appHost, tearDown } = await createFixture(
        '<select value.from-view="selected"><option value="hardware">Hardware</option><option value="support" selected>Support</option></select>',
        { selected: '' },
      ).started;
      try {
        await tasksSettled();
        assert.strictEqual(appHost.querySelector('select')!.value, 'support');
      } finally {
        await tearDown();
      }
    });

    for (const throughLet of [false, true]) {
      for (const bindModel of [false, true]) {
        it(`selects a pre-seeded request using ${throughLet ? 'a template local' : 'a direct binding'} and ${bindModel ? 'option models' : 'option values'}`, async function () {
          const state = {
            hardwareTopic: 'hardware',
            billingTopic: 'billing',
            supportTopic: 'support',
            requests: [
              { topics: ['support'] },
              { topics: ['hardware', 'billing'] },
            ],
            readRequest(index: number) {
              return this.requests[index];
            },
          };
          const { appHost, component, ctx, tearDown } = await createFixture(
            `${throughLet ? '<let request.bind="state.readRequest(requestId)"></let><template if.bind="request != null">' : ''}
              <select multiple value.bind="${throughLet ? 'request.topics' : 'state.readRequest(requestId).topics'}">
                <option ${bindModel ? 'model.bind="state.hardwareTopic"' : 'value="hardware"'}>Hardware</option>
                <option ${bindModel ? 'model.bind="state.billingTopic"' : 'value="billing"'}>Billing</option>
                <option ${bindModel ? 'model.bind="state.supportTopic"' : 'value="support"'}>Support</option>
              </select>
            ${throughLet ? '</template>' : ''}`,
            { state, requestId: 0 },
          ).started;

          try {
            await tasksSettled();
            const select = appHost.querySelector('select')!;
            assert.deepEqual(Array.from(select.options, option => option.selected), [false, false, true]);
            assert.deepEqual(state.requests[0].topics, ['support'], 'initialization preserves the model');

            component.requestId = 1;
            await tasksSettled();
            assert.deepEqual(Array.from(select.options, option => option.selected), [true, true, false]);

            const topics = state.requests[1].topics;
            topics.push('support');
            assert.deepEqual(Array.from(select.options, option => option.selected), [true, true, true]);

            select.options[0].selected = select.options[2].selected = false;
            select.dispatchEvent(new ctx.Event('change'));
            assert.strictEqual(state.requests[1].topics, topics, 'writeback retains the array');
            assert.deepEqual(topics, ['billing']);

            component.requestId = 0;
            await tasksSettled();
            assert.deepEqual(Array.from(select.options, option => option.selected), [false, false, true]);
          } finally {
            await tearDown();
          }
        });
      }
    }

    for (const mode of ['bind', 'to-view', 'one-time']) {
      for (const multiple of [false, true]) {
        it(`initializes ${multiple ? 'multiple' : 'single'} object selection with value.${mode} and a later matcher binding`, async function () {
          const selected = { code: 'support' };
          const selection = multiple ? [selected] : selected;
          const { appHost, component, tearDown } = await createFixture(
            `<select ${multiple ? 'multiple' : ''} value.${mode}="selection" matcher.bind="sameCode">
              <optgroup label="Topics">
                <option model.bind="null">Choose...</option>
                <option model.bind="options[0]">Hardware</option>
                <option model.bind="options[1]">Support</option>
                <option model.bind="options[2]">Support alias</option>
              </optgroup>
            </select>`,
            {
              selection,
              options: [{ code: 'hardware' }, { code: 'support' }, { code: 'support' }],
              sameCode: (left: { code: string } | null, right: { code: string } | null) => left?.code === right?.code,
            },
          ).started;

          try {
            await tasksSettled();
            const select = appHost.querySelector('select')!;
            // A single select keeps its existing first-match precedence. Initialization
            // must also leave the caller's object/array intact rather than write options back.
            assert.deepEqual(Array.from(select.options, option => option.selected), [false, false, true, multiple]);
            assert.strictEqual(component.selection, selection);
            assert.strictEqual(multiple ? (component.selection as unknown[])[0] : component.selection, selected);
          } finally {
            await tearDown();
          }
        });
      }

      it(`reconciles cached option models again when value.${mode} is rebound`, async function () {
        const { appHost, component, tearDown } = await createFixture(
          `<div if.bind="visible">
            <select multiple value.${mode}="selected">
              <option model.bind="topic">Topic</option>
            </select>
          </div>`,
          { visible: true, selected: ['support'], topic: 'support' },
        ).started;

        try {
          await tasksSettled();
          const select = appHost.querySelector('select')!;
          assert.strictEqual(select.options[0].selected, true);

          component.visible = false;
          await tasksSettled();
          component.selected.splice(0, 1, 'billing');
          component.topic = 'billing';
          component.visible = true;
          await tasksSettled();

          assert.strictEqual(appHost.querySelector('select'), select, 'the cached view reuses the select');
          assert.strictEqual(select.options[0].selected, true);
          assert.deepEqual(component.selected, ['billing']);
        } finally {
          await tearDown();
        }
      });
    }

    for (const rebind of [false, true]) {
      it(`${rebind ? 'uses the latest model after rebind' : 'discards pending initialization after unbind'} before the queue drains`, async function () {
        let matches = 0;
        const { appHost, component, tearDown } = createFixture(
          `<div if.bind="visible">
            <select multiple value.bind="selected" matcher.bind="matcher">
              <option model.bind="topic">Topic</option>
            </select>
          </div>`,
          {
            visible: true,
            selected: ['support'],
            topic: 'support',
            matcher: (left: string, right: string) => {
              matches++;
              return left === right;
            },
          },
        );

        try {
          component.visible = false;
          component.selected = ['billing'];
          component.topic = 'billing';
          if (rebind) component.visible = true;
          matches = 0;
          await tasksSettled();

          assert.strictEqual(matches, rebind ? 1 : 0);
          assert.strictEqual(appHost.querySelector('option')?.selected, rebind ? true : void 0);
          assert.deepEqual(component.selected, ['billing']);
        } finally {
          await tearDown();
        }
      });
    }

    it('does not add a second reconciliation to ordinary two-way updates', async function () {
      let matches = 0;
      const { appHost, component, tearDown } = await createFixture(
        `<select multiple value.bind="selected" matcher.bind="matcher">
          <option model.bind="hardware">Hardware</option>
          <option model.bind="support">Support</option>
        </select>`,
        {
          selected: ['support'],
          hardware: 'hardware',
          support: 'support',
          matcher: (left: string, right: string) => {
            matches++;
            return left === right;
          },
        },
      ).started;
      try {
        await tasksSettled();
        matches = 0;
        component.selected = ['hardware'];
        await tasksSettled();
        assert.strictEqual(matches, 2, 'one comparison per option');
        assert.deepEqual(Array.from(appHost.querySelector('select')!.options, option => option.selected), [true, false]);
      } finally {
        await tearDown();
      }
    });
  });

  describe('multiple and value binding order gh #1724 https://github.com/aurelia/aurelia/issues/1724', function () {
    it('disregards order in simple case', async function () {
      createFixture(
        `<select value.bind="[]" multiple.bind="true">`,
      );
    });

    it('disregard order when there are more attributes in between', async function () {
      createFixture(
        `<select value.bind="[]" id.bind="a" multiple.bind="true">`,
      );
    });

    it('disregard order when there are more attributes at the start', async function () {
      createFixture(
        `<select id.bind="a" value.bind="[]" multiple.bind="true">`,
      );
    });

    it('disregard order when there are more attributes at the end', async function () {
      createFixture(
        `<select value.bind="[]" multiple.bind="true" id.bind="a">`,
      );
    });
  });
});
