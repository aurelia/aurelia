import { ITemplateSource, TargetedInstructionType } from './../../../../src/runtime/templating/instructions';
import { Aurelia } from '../../../../src/runtime/aurelia';
import { Repeater } from '../../../../src/runtime/templating/resources/repeater';
import { IContainer, DI } from '../../../../src/kernel/di';
import { ITaskQueue } from '../../../../src/runtime/task-queue';
import { enableArrayObservation, disableArrayObservation } from '../../../../src/runtime/binding/observers/array-observer';
import { DOM, INode } from '../../../../src/runtime/dom';
import { createAureliaRepeaterConfig, IRepeaterFixture, padRight, createRepeater, assertVisualsSynchronized, assertDOMSynchronized, incrementItems, createRepeaterTemplateSource, createTextBindingTemplateSource } from '../../util';
import { ICustomElement } from '../../../../src/runtime/templating/custom-element';
import { BindingFlags } from '../../../../src/runtime/binding/binding';
import { IObservedArray } from '../../../../src/runtime/binding/observation';
import { IExpressionParser } from '../../../../src/runtime/binding/expression-parser';
import { AccessScope, AccessMember } from '../../../../src/runtime/binding/ast';
import { expect } from 'chai';

describe('ArrayRepeater', () => {
  let container: IContainer;
  let taskQueue: ITaskQueue;
  let au: Aurelia;
  let host: INode;
  let sut: Repeater<IObservedArray>;

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
    taskQueue = container.get(ITaskQueue);
    au = new Aurelia(container);
    host = DOM.createElement('app');
    DOM.appendChild(document.body, host);
  });

  describe('splice should render correctly', () => {
    const fixtures: IRepeaterFixture[] = [
      { elName: 'foo', colName: 'todos', itemName: 'todo', propName: 'id' },
      { elName: 'bar', colName: 'bazzes', itemName: 'baz', propName: 'qux' }
    ];
    const initArr = [[], [1], [1, 2]];
    const startArr = [0, 1, 2];
    const deleteCountArr = [0, 1, 2];
    const itemsArr = [[], [4], [4, 5]];
    const flushArr = ['never', 'once', 'every'];
    const timesArr = [1, 2];
    const title1 = 'ArrayRepeater splice (render): ';

    // test with different collection-, local-, item- and property names
    for (const fixture of fixtures) {
      const { elName, colName, itemName, propName } = fixture;
      const title2 = title1 + ' fixture=' + padRight(`${elName},${colName},${itemName},${propName}`, 16);

      // test with differently sized initial collections
      for (const init of initArr) {
        const title3 = title2 + ' size=' + padRight(init.length, 2);

        // test with different splice starting indices (only up to one position out of array bounds to reduce test redundancy)
        for (const start of startArr.filter(s => s <= init.length + 1)) {
          const title4 = title3 + ' start=' + padRight(start, 2);

          // test with different splice deleteCount (only up to one higher than initial item count to reduce test redundancy)
          for (const deleteCount of deleteCountArr.filter(d => d <= init.length + 1)) {
            const title5 = title4 + ' deleteCount=' + padRight(deleteCount, 2);

            // test with different amounts of items added
            for (const items of itemsArr) {
              const title6 = title5 + ' itemCount=' + padRight(items.length, 2);

              // test with never flushing after mutation, flushing only after all mutations are done, or flushing after every mutation
              for (const flush of flushArr) {
                const title7 = title6 + ' flush=' + padRight(flush, 6);

                // repeat the operation different amounts of times to simulate complexer chained operations
                for (const times of timesArr) {
                  const title = title7 + ' times=' + padRight(times, 2);

                  it(title, () => {
                    aureliaConfig = createAureliaRepeaterConfig(fixture);
                    au.register(aureliaConfig);
                    const initItems = init.map(i => ({ [propName]: i }));
                    const initItemsCopy = initItems.slice();
                    const newItems = items.map(i => ({ [propName]: i }));
                    const templateSource = createRepeaterTemplateSource(fixture, createTextBindingTemplateSource(propName));
                    component = createRepeater(fixture, initItems, templateSource);
                    // connectQueue causes tests with bindings to be non-deterministic, so we need to turn it off (and test it explicitly in some other way)
                    component.$flags = BindingFlags.connectImmediate; 
                    au.app({ host, component });
                    au.start();
                    sut = <any>au['components'][0].$attachable[0];
                    taskQueue.flushMicroTaskQueue();
                    assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName, propName);
                    assertDOMSynchronized(fixture, component[colName], <any>host);
                    let i = 0;
                    while (i < times) {
                      // change the properties of the newly added items with each iteration to verify bindingTarget is updated correctly
                      incrementItems(newItems, i, fixture);
                      i++;
                      component[colName].splice(start, deleteCount, ...newItems);
                      switch (flush) {
                        case 'never':
                          // never flushed; verify everything is identical to the initial state after each mutation
                          assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName, propName);
                          assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                          break;
                        case 'once':
                          // flushed once; verify everything is identical to the initial state except for the last iteration
                          if (i === times) {
                            taskQueue.flushMicroTaskQueue();
                            assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName, propName);
                            assertDOMSynchronized(fixture, component[colName], <any>host);
                          } else {
                            assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName, propName);
                            assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                          }
                          break;
                        case 'every':
                          // flushed every; verify changes propagate to the DOM after each mutation
                          taskQueue.flushMicroTaskQueue();
                          assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName, propName);
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
      }
    }
  });

  describe('assign should render correctly', () => {
    const fixtures: IRepeaterFixture[] = [
      { elName: 'foo', colName: 'todos', itemName: 'todo', propName: 'id' },
      { elName: 'bar', colName: 'bazzes', itemName: 'baz', propName: 'qux' }
    ];
    const initArr = [[], [1], [1, 2]];
    const assignArr = [[], [4], [4, 5]];
    const flushArr = ['never', 'once', 'every'];
    const timesArr = [1, 2];
    const title1 = 'ArrayRepeater assign (render): ';

    // test with different collection-, local-, item- and property names
    for (const fixture of fixtures) {
      const { elName, colName, itemName, propName } = fixture;
      const title2 = title1 + ' fixture=' + padRight(`${elName},${colName},${itemName},${propName}`, 16);

      // test with differently sized initial collections
      for (const init of initArr) {
        const title3 = title2 + ' size=' + padRight(init.length, 2);

        // test with different amounts of items assigned
        for (const assign of assignArr) {
          const title4 = title3 + ' assignCount=' + padRight(assign.length, 2);

          // test with never flushing after mutation, flushing only after all mutations are done, or flushing after every mutation
          for (const flush of flushArr) {
            const title5 = title4 + ' flush=' + padRight(flush, 6);

            // repeat the operation different amounts of times to simulate complexer chained operations
            for (const times of timesArr) {
              const title = title5 + ' times=' + padRight(times, 2);

              it(title, () => {
                aureliaConfig = createAureliaRepeaterConfig(fixture);
                au.register(aureliaConfig);
                const initItems = init.map(i => ({ [propName]: i }));
                const initItemsCopy = initItems.slice();
                let assignItems = assign.map(i => ({ [propName]: i }));
                const templateSource = createRepeaterTemplateSource(fixture, createTextBindingTemplateSource(propName));
                component = createRepeater(fixture, initItems, templateSource);
                component.$flags = BindingFlags.connectImmediate; 
                au.app({ host, component });
                au.start();
                sut = <any>au['components'][0].$attachable[0];
                taskQueue.flushMicroTaskQueue();
                assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName, propName);
                assertDOMSynchronized(fixture, component[colName], <any>host);
                let i = 0;
                while (i < times) {
                  assignItems = assignItems.slice();
                  // change the properties of the newly added items with each iteration to verify bindingTarget is updated correctly
                  incrementItems(assignItems, i, fixture);
                  i++;
                  component[colName] = assignItems;
                  switch (flush) {
                    case 'never':
                      // never flushed; verify everything is identical to the initial state after each mutation
                      assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName, propName);
                      assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                      break;
                    case 'once':
                      // flushed once; verify everything is identical to the initial state except for the last iteration
                      if (i === times) {
                        taskQueue.flushMicroTaskQueue();
                        assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName, propName);
                        assertDOMSynchronized(fixture, component[colName], <any>host);
                      } else {
                        assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName, propName);
                        assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                      }
                      break;
                    case 'every':
                      // flushed every; verify changes propagate to the DOM after each mutation
                      taskQueue.flushMicroTaskQueue();
                      assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName, propName);
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
  });

  
  describe('reverse should render correctly', () => {
    const fixtures: IRepeaterFixture[] = [
      { elName: 'foo', colName: 'todos', itemName: 'todo', propName: 'id' },
      { elName: 'bar', colName: 'bazzes', itemName: 'baz', propName: 'qux' }
    ];
    const initArr = [[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4]];
    const flushArr = ['never', 'once', 'every'];
    const timesArr = [1, 2];
    const title1 = 'ArrayRepeater reverse (render): ';

    // test with different collection-, local-, item- and property names
    for (const fixture of fixtures) {
      const { elName, colName, itemName, propName } = fixture;
      const title2 = title1 + ' fixture=' + padRight(`${elName},${colName},${itemName},${propName}`, 16);

      // test with differently sized initial collections
      for (const init of initArr) {
        const title3 = title2 + ' size=' + padRight(init.length, 2);

        // test with never flushing after mutation, flushing only after all mutations are done, or flushing after every mutation
        for (const flush of flushArr) {
          const title4 = title3 + ' flush=' + padRight(flush, 6);

          // repeat the operation different amounts of times to simulate complexer chained operations
          for (const times of timesArr) {
            const title = title4 + ' times=' + padRight(times, 2);

            it(title, () => {
              aureliaConfig = createAureliaRepeaterConfig(fixture);
              au.register(aureliaConfig);
              const initItems = init.map(i => ({ [propName]: i }));
              const initItemsCopy = initItems.slice();
              const templateSource = createRepeaterTemplateSource(fixture, createTextBindingTemplateSource(propName));
              component = createRepeater(fixture, initItems, templateSource);
              // connectQueue causes tests with bindings to be non-deterministic, so we need to turn it off (and test it explicitly in some other way)
              component.$flags = BindingFlags.connectImmediate; 
              au.app({ host, component });
              au.start();
              sut = <any>au['components'][0].$attachable[0];
              taskQueue.flushMicroTaskQueue();
              assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName, propName);
              assertDOMSynchronized(fixture, component[colName], <any>host);
              let i = 0;
              while (i < times) {
                i++;
                component[colName].reverse();
                switch (flush) {
                  case 'never':
                    // never flushed; verify everything is identical to the initial state after each mutation
                    assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName, propName);
                    assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                    break;
                  case 'once':
                    // flushed once; verify everything is identical to the initial state except for the last iteration
                    if (i === times) {
                      taskQueue.flushMicroTaskQueue();
                      assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName, propName);
                      assertDOMSynchronized(fixture, component[colName], <any>host);
                    } else {
                      assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName, propName);
                      assertDOMSynchronized(fixture, initItemsCopy, <any>host);
                    }
                    break;
                  case 'every':
                    // flushed every; verify changes propagate to the DOM after each mutation
                    taskQueue.flushMicroTaskQueue();
                    assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName, propName);
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
  });


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
      todos: new AccessScope('todos'),
      id: new AccessMember(new AccessScope('todo'), 'id'),
      length: new AccessMember(new AccessMember(new AccessScope('todo'), 'innerTodos'), 'length'),
      innerTodos: new AccessMember(new AccessScope('todo'), 'innerTodos'),
      innerId: new AccessMember(new AccessScope('innerTodo'), 'innerId'),
      innerLength: new AccessMember(new AccessMember(new AccessScope('innerTodo'), 'innerInnerTodos'), 'length'),
      innerInnerTodos: new AccessMember(new AccessScope('innerTodo'), 'innerInnerTodos'),
      innerInnerId: new AccessMember(new AccessScope('innerInnerTodo'), 'innerInnerId')
    };
    aureliaConfig = {
      register(container: IContainer) {
        container.get(IExpressionParser).cache(expressionCache);
        container.register(<any>Repeater);
      }
    };
    au.register(aureliaConfig);
    const templateSource: ITemplateSource = {
      name: 'app',
      dependencies: [],
      template: `<span class="au"></span> `,
      instructions: [
        [
          {
            type: TargetedInstructionType.hydrateTemplateController,
            res: 'repeat',
            src: {
              cache: "*",
              template: `<span class="au"></span> <span class="au"></span> <span class="au"></span> `,
              instructions: [
                [ { type: TargetedInstructionType.textBinding, src: 'id' } ],
                [ { type: TargetedInstructionType.textBinding, src: 'length' } ],
                [
                  {
                    type: TargetedInstructionType.hydrateTemplateController,
                    res: 'repeat',
                    src: {
                      cache: "*",
                      template: `<span class="au"></span> <span class="au"></span> <span class="au"></span> `,
                      instructions: [
                        [ { type: TargetedInstructionType.textBinding, src: 'innerId' } ],
                        [ { type: TargetedInstructionType.textBinding, src: 'innerLength' } ],
                        [
                          {
                            type: TargetedInstructionType.hydrateTemplateController,
                            res: 'repeat',
                            src: {
                              cache: "*",
                              template: `<span class="au"></span> `,
                              instructions: [
                                [ { type: TargetedInstructionType.textBinding, src: 'innerInnerId' } ]
                              ]
                            },
                            instructions: [
                              { type: TargetedInstructionType.toViewBinding, src: 'innerInnerTodos', dest: 'items' },
                              { type: TargetedInstructionType.setProperty, value: 'innerInnerTodo', dest: 'local' },
                              { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
                            ]
                          }
                        ]
                      ]
                    },
                    instructions: [
                      { type: TargetedInstructionType.toViewBinding, src: 'innerTodos', dest: 'items' },
                      { type: TargetedInstructionType.setProperty, value: 'innerTodo', dest: 'local' },
                      { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
                    ]
                  }
                ]
              ]
            },
            instructions: [
              { type: TargetedInstructionType.toViewBinding, src: 'todos', dest: 'items' },
              { type: TargetedInstructionType.setProperty, value: 'todo', dest: 'local' },
              { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
            ]
          }
        ]
      ],
      surrogates: []
    }
    component = createRepeater(<any>{ colName: 'todos' }, initItems, templateSource);

    component.$flags = BindingFlags.connectImmediate; 
    au.app({ host, component });
    au.start();
    sut = <any>au['components'][0].$attachable[0];
    taskQueue.flushMicroTaskQueue();

    const expectedText = initItems.map(i => `${i.id}${i.innerTodos.length}${i.innerTodos.map(ii => `${ii.innerId}${ii.innerInnerTodos.length}${ii.innerInnerTodos.map(iii => `${iii.innerInnerId}`).join('')}`).join(' ')}`).join(' ');
    expect(host['innerText']).to.equal(expectedText);
  });
});

