import {
  ITemplateSource,
  TargetedInstructionType,
  BindingMode,
  ForOfStatement,
  BindingIdentifier,
  Aurelia,
  Repeat,
  IChangeSet,
  enableArrayObservation,
  disableArrayObservation,
  DOM,
  INode,
  ICustomElement,
  IExpressionParser,
  AccessScope,
  AccessMember
} from '../../../../src/index';
import { IContainer, DI } from '../../../../../kernel/src/index';
import { createAureliaRepeaterConfig, IRepeaterFixture, padRight, createRepeater, assertDOMSynchronized, incrementItems, createRepeaterTemplateSource, createTextBindingTemplateSource } from '../../util';
import { expect } from 'chai';

describe('ArrayRepeater - render html', () => {
  let container: IContainer;
  let changeSet: IChangeSet;
  let au: Aurelia;
  let host: INode;

  let aureliaConfig: ReturnType<typeof createAureliaRepeaterConfig>;
  let component: ICustomElement;

  before(() => {
    enableArrayObservation();
  });

  after(() => {
    disableArrayObservation();
  });

  beforeEach(() => {
    container = DI.createContainer();
    changeSet = container.get(IChangeSet);
    au = new Aurelia(container);
    host = DOM.createElement('app');
    DOM.appendChild(document.body, host);
  });

  const initArr = [[], [3, 2, 1], [19, 18, 17, 16, 15, 14, 13, 12, 11, 10]];
  const flushModeArr = ['never', 'once', 'every'];
  const timesArr = [1, 2];
  const itemsArr = [[], [4, 5, 6], [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]];
  const fixtures: IRepeaterFixture[] = [
    { elName: 'foo', colName: 'todos', itemName: 'todo', propName: 'id' },
    { elName: 'bar', colName: 'bazzes', itemName: 'baz', propName: 'qux' }
  ];

  // test with different collection-, local-, item- and property names
  for (const fixture of fixtures) {
    const { elName, colName, itemName, propName } = fixture;
    const fixtureTitle = 'fixture=' + padRight(`${elName},${colName},${itemName},${propName}`, 16);

    // test with differently sized initial collections
    for (const init of initArr) {
      const initTitle = 'initSize=' + padRight(init.length, 2);

      // test with never flushing after mutation, flushing only after all mutations are done, or flushing after every mutation
      for (const flushMode of flushModeArr) {
        const flushModeTitle = 'flushMode=' + padRight(flushMode, 6);

        // repeat the operation different amounts of times to simulate complexer chained operations
        for (const times of timesArr) {
          const timesTitle = 'times=' + padRight(times, 2);

          // test with different amounts of items added
          for (const items of itemsArr) {
            const itemTitle = 'addCount=' + padRight(items.length, 2);

            for (const op of ['push', 'unshift']) {
              const opTitle = padRight(op, 10);
              it(`${opTitle} - ${fixtureTitle} ${initTitle} ${flushModeTitle} ${timesTitle} ${itemTitle}`, () => {
                aureliaConfig = createAureliaRepeaterConfig(fixture);
                au.register(aureliaConfig);
                const initItems = init.map(i => ({ [propName]: i }));
                const initItemsCopy = initItems.slice();
                const newItems = items.map(i => ({ [propName]: i }));
                const templateSource = createRepeaterTemplateSource(fixture, createTextBindingTemplateSource(propName));
                component = createRepeater(fixture, initItems, templateSource);
                au.app({ host, component });
                au.start();
                changeSet.flushChanges();
                assertDOMSynchronized(fixture, component[colName], <any>host);

                let i = 0;
                while (i < times) {
                  // change the properties of the newly added items with each iteration to verify bindingTarget is updated correctly
                  incrementItems(newItems, i, fixture);
                  i++;
                  component[colName].push(...newItems);
                  switch (flushMode) {
                    case 'never':
                      // never flushed; verify everything is identical to the initial state after each mutation
                      assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                      break;
                    case 'once':
                      // flushed once; verify everything is identical to the initial state except for the last iteration
                      if (i === times) {
                        changeSet.flushChanges();
                        assertDOMSynchronized(fixture, component[colName], <any>host);
                      } else {
                        assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                      }
                      break;
                    case 'every':
                      // flushed every; verify changes propagate to the DOM after each mutation
                      changeSet.flushChanges();
                      assertDOMSynchronized(fixture, component[colName], <any>host);
                      break;
                  }
                }
                DOM.remove(host);
              });
            }
          }

          for (const op of ['pop', 'shift']) {
            const opTitle = padRight(op, 10);
            it(`${opTitle} - ${fixtureTitle} ${initTitle} ${flushModeTitle} ${timesTitle}`, () => {
              aureliaConfig = createAureliaRepeaterConfig(fixture);
              au.register(aureliaConfig);
              const initItems = init.map(i => ({ [propName]: i }));
              const initItemsCopy = initItems.slice();
              const templateSource = createRepeaterTemplateSource(fixture, createTextBindingTemplateSource(propName));
              component = createRepeater(fixture, initItems, templateSource);
              au.app({ host, component });
              au.start();
              changeSet.flushChanges();
              assertDOMSynchronized(fixture, component[colName], <any>host);

              let i = 0;
              while (i < times) {
                i++;
                component[colName].pop();
                switch (flushMode) {
                  case 'never':
                    // never flushed; verify everything is identical to the initial state after each mutation
                    assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                    break;
                  case 'once':
                    // flushed once; verify everything is identical to the initial state except for the last iteration
                    if (i === times) {
                      changeSet.flushChanges();
                      assertDOMSynchronized(fixture, component[colName], <any>host);
                    } else {
                      assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                    }
                    break;
                  case 'every':
                    // flushed every; verify changes propagate to the DOM after each mutation
                    changeSet.flushChanges();
                    assertDOMSynchronized(fixture, component[colName], <any>host);
                    break;
                }
              }
              DOM.remove(host);
            });
          }

          const startArr = [0, 1, 2];
          const deleteCountArr = [0, 1, 2];

          // test with different splice starting indices (only up to one position out of array bounds to reduce test redundancy)
          for (const start of startArr.filter(s => s <= init.length + 1)) {
            const startTitle = 'start=' + padRight(start, 2);

            // test with different splice deleteCount (only up to one higher than initial item count to reduce test redundancy)
            for (const deleteCount of deleteCountArr.filter(d => d <= init.length + 1)) {
              const deleteCountTitle = 'deleteCount=' + padRight(deleteCount, 2);

              // test with different amounts of items added
              for (const items of itemsArr) {
                const itemsTitle = 'itemCount=' + padRight(items.length, 2);
                const opTitle = padRight('splice', 10);

                it(`${opTitle} - ${fixtureTitle} ${initTitle} ${flushModeTitle} ${timesTitle} ${startTitle} ${deleteCountTitle} ${itemsTitle}`, () => {
                  aureliaConfig = createAureliaRepeaterConfig(fixture);
                  au.register(aureliaConfig);
                  const initItems = init.map(i => ({ [propName]: i }));
                  const initItemsCopy = initItems.slice();
                  const newItems = items.map(i => ({ [propName]: i }));
                  const templateSource = createRepeaterTemplateSource(fixture, createTextBindingTemplateSource(propName));
                  component = createRepeater(fixture, initItems, templateSource);
                  au.app({ host, component });
                  au.start();
                  changeSet.flushChanges();
                  assertDOMSynchronized(fixture, component[colName], <any>host);
                  let i = 0;
                  while (i < times) {
                    // change the properties of the newly added items with each iteration to verify bindingTarget is updated correctly
                    incrementItems(newItems, i, fixture);
                    i++;
                    component[colName].splice(start, deleteCount, ...newItems);
                    switch (flushMode) {
                      case 'never':
                        // never flushed; verify everything is identical to the initial state after each mutation
                        assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                        break;
                      case 'once':
                        // flushed once; verify everything is identical to the initial state except for the last iteration
                        if (i === times) {
                          changeSet.flushChanges();
                          assertDOMSynchronized(fixture, component[colName], <any>host);
                        } else {
                          assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                        }
                        break;
                      case 'every':
                        // flushed every; verify changes propagate to the DOM after each mutation
                        changeSet.flushChanges();
                        assertDOMSynchronized(fixture, component[colName], <any>host);
                        break;
                    }
                  }
                  DOM.remove(host);
                });
              }
            }
          }

          const assignArr = [[], [1], [1, 2]];

          for (const assign of assignArr) {
            const assignTitle = 'assign=' + padRight(assign.length, 2);
            const opTitle = padRight('assign', 10);

            it(`${opTitle} - ${fixtureTitle} ${initTitle} ${flushModeTitle} ${timesTitle} ${assignTitle}`, () => {
              aureliaConfig = createAureliaRepeaterConfig(fixture);
              au.register(aureliaConfig);
              const initItems = init.map(i => ({ [propName]: i }));
              const initItemsCopy = initItems.slice();
              let assignItems = assign.map(i => ({ [propName]: i }));
              const templateSource = createRepeaterTemplateSource(fixture, createTextBindingTemplateSource(propName));
              component = createRepeater(fixture, initItems, templateSource);
              au.app({ host, component });
              au.start();
              changeSet.flushChanges();
              assertDOMSynchronized(fixture, component[colName], <any>host);
              let i = 0;
              while (i < times) {
                assignItems = assignItems.slice();
                // change the properties of the newly added items with each iteration to verify bindingTarget is updated correctly
                incrementItems(assignItems, i, fixture);
                i++;
                component[colName] = assignItems;
                switch (flushMode) {
                  case 'never':
                    // never flushed; verify everything is identical to the initial state after each mutation
                    assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                    break;
                  case 'once':
                    // flushed once; verify everything is identical to the initial state except for the last iteration
                    if (i === times) {
                      changeSet.flushChanges();
                      assertDOMSynchronized(fixture, component[colName], <any>host);
                    } else {
                      assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                    }
                    break;
                  case 'every':
                    // flushed every; verify changes propagate to the DOM after each mutation
                    changeSet.flushChanges();
                    assertDOMSynchronized(fixture, component[colName], <any>host);
                    break;
                }
              }
              DOM.remove(host);
            });
          }

          for (const op of ['reverse', 'sort']) {
            const opTitle = padRight(op, 10);
            it(`${opTitle} - ${fixtureTitle} ${initTitle} ${flushModeTitle} ${timesTitle}`, () => {
              aureliaConfig = createAureliaRepeaterConfig(fixture);
              au.register(aureliaConfig);
              const initItems = init.map(i => ({ [propName]: i }));
              const initItemsCopy = initItems.slice();
              const templateSource = createRepeaterTemplateSource(fixture, createTextBindingTemplateSource(propName));
              component = createRepeater(fixture, initItems, templateSource);
              au.app({ host, component });
              au.start();
              changeSet.flushChanges();
              assertDOMSynchronized(fixture, component[colName], <any>host);

              let i = 0;
              while (i < times) {
                i++;
                component[colName].pop();
                switch (flushMode) {
                  case 'never':
                    // never flushed; verify everything is identical to the initial state after each mutation
                    assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                    break;
                  case 'once':
                    // flushed once; verify everything is identical to the initial state except for the last iteration
                    if (i === times) {
                      changeSet.flushChanges();
                      assertDOMSynchronized(fixture, component[colName], <any>host);
                    } else {
                      assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                    }
                    break;
                  case 'every':
                    // flushed every; verify changes propagate to the DOM after each mutation
                    changeSet.flushChanges();
                    assertDOMSynchronized(fixture, component[colName], <any>host);
                    break;
                }
              }
              DOM.remove(host);
            });
          }
        }
      }
    }
  }

  it('triple nested repeater should render correctly', () => {
    const initItems = [
      {
        id: 1,
        innerTodos: [
          { innerId: 10, innerInnerTodos: [ { innerInnerId: 100 }, { innerInnerId: 101 }, { innerInnerId: 102 } ] },
          { innerId: 11, innerInnerTodos: [ { innerInnerId: 110 }, { innerInnerId: 111 }, { innerInnerId: 112 } ] },
          { innerId: 12, innerInnerTodos: [ { innerInnerId: 120 }, { innerInnerId: 121 }, { innerInnerId: 122 } ] }
        ]
      },
      { id: 2,
        innerTodos: [
          { innerId: 20, innerInnerTodos: [ { innerInnerId: 200 }, { innerInnerId: 201 }, { innerInnerId: 202 } ] },
          { innerId: 21, innerInnerTodos: [ { innerInnerId: 210 }, { innerInnerId: 211 }, { innerInnerId: 212 } ] },
          { innerId: 22, innerInnerTodos: [ { innerInnerId: 220 }, { innerInnerId: 221 }, { innerInnerId: 222 } ] }
        ]
      },
      { id: 3,
        innerTodos: [
          { innerId: 30, innerInnerTodos: [ { innerInnerId: 300 }, { innerInnerId: 301 }, { innerInnerId: 302 } ] },
          { innerId: 31, innerInnerTodos: [ { innerInnerId: 310 }, { innerInnerId: 311 }, { innerInnerId: 312 } ] },
          { innerId: 32, innerInnerTodos: [ { innerInnerId: 320 }, { innerInnerId: 321 }, { innerInnerId: 322 } ] }
        ]
      },
    ];
    const expressionCache = {
      todos: new ForOfStatement(new BindingIdentifier('todo'), new AccessScope('todos')),
      id: new AccessMember(new AccessScope('todo'), 'id'),
      length: new AccessMember(new AccessMember(new AccessScope('todo'), 'innerTodos'), 'length'),
      innerTodos: new ForOfStatement(new BindingIdentifier('innerTodo'), new AccessMember(new AccessScope('todo'), 'innerTodos')),
      innerId: new AccessMember(new AccessScope('innerTodo'), 'innerId'),
      innerLength: new AccessMember(new AccessMember(new AccessScope('innerTodo'), 'innerInnerTodos'), 'length'),
      innerInnerTodos: new ForOfStatement(new BindingIdentifier('innerInnerTodo'), new AccessMember(new AccessScope('innerTodo'), 'innerInnerTodos')),
      innerInnerId: new AccessMember(new AccessScope('innerInnerTodo'), 'innerInnerId')
    };
    aureliaConfig = {
      register(container: IContainer) {
        (<IExpressionParser>container.get(IExpressionParser)).cache(expressionCache);
        container.register(<any>Repeat);
      }
    };
    au.register(aureliaConfig);
    const templateSource: ITemplateSource = {
      name: 'app',
      dependencies: [],
      templateOrNode: `<span class="au"></span> `,
      instructions: [
        [
          {
            type: TargetedInstructionType.hydrateTemplateController,
            res: 'repeat',
            src: {
              cache: "*",
              templateOrNode: `<span class="au"></span> <span class="au"></span> <span class="au"></span> `,
              instructions: [
                [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'id' } ],
                [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'length' } ],
                [
                  {
                    type: TargetedInstructionType.hydrateTemplateController,
                    res: 'repeat',
                    src: {
                      cache: "*",
                      templateOrNode: `<span class="au"></span> <span class="au"></span> <span class="au"></span> `,
                      instructions: [
                        [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'innerId' } ],
                        [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'innerLength' } ],
                        [
                          {
                            type: TargetedInstructionType.hydrateTemplateController,
                            res: 'repeat',
                            src: {
                              cache: "*",
                              templateOrNode: `<span class="au"></span> `,
                              instructions: [
                                [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'innerInnerId' } ]
                              ]
                            },
                            instructions: [
                              { type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView, srcOrExpr: 'innerInnerTodos', dest: 'items' },
                              { type: TargetedInstructionType.setProperty, value: 'innerInnerTodo', dest: 'local' },
                              { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
                            ]
                          }
                        ]
                      ]
                    },
                    instructions: [
                      { type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView, srcOrExpr: 'innerTodos', dest: 'items' },
                      { type: TargetedInstructionType.setProperty, value: 'innerTodo', dest: 'local' },
                      { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
                    ]
                  }
                ]
              ]
            },
            instructions: [
              { type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView, srcOrExpr: 'todos', dest: 'items' },
              { type: TargetedInstructionType.setProperty, value: 'todo', dest: 'local' },
              { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
            ]
          }
        ]
      ],
      surrogates: []
    }
    component = createRepeater(<any>{ colName: 'todos' }, initItems, templateSource);

    au.app({ host, component });
    au.start();
    changeSet.flushChanges();

    const expectedText = initItems.map(i => `${i.id}${i.innerTodos.length}${i.innerTodos.map(ii => `${ii.innerId}${ii.innerInnerTodos.length}${ii.innerInnerTodos.map(iii => `${iii.innerInnerId}`).join('')}`).join(' ')}`).join(' ');
    expect(host['innerText']).to.equal(expectedText);
  });
});

