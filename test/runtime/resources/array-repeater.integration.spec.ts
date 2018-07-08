import { Aurelia } from '../../../src/runtime/aurelia';
import { ICustomElement } from './../../../src/runtime/templating/component';
import { ArrayRepeater } from './../../../src/runtime/resources/array-repeater';
import { IContainer, DI } from '../../../src/kernel/di';
import { ITaskQueue } from '../../../src/runtime/task-queue';
import { enableArrayObservation, disableArrayObservation } from '../../../src/runtime/binding/array-observer';
import { DOM, INode } from '../../../src/runtime/dom';
import { createAureliaConfig, IFixture, padRight, createComponent, assertVisualsSynchronized, assertDOMSynchronized, incrementItems } from '../util';

describe('ArrayRepeater', () => {
  let container: IContainer;
  let taskQueue: ITaskQueue;
  let au: Aurelia;
  let host: INode;
  let sut: ArrayRepeater;

  let aureliaConfig: ReturnType<typeof createAureliaConfig>;
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
    const fixtures: IFixture[] = [
      { type: ArrayRepeater, elName: 'foo', colName: 'todos', itemName: 'todo', propName: 'id' },
      { type: ArrayRepeater, elName: 'bar', colName: 'bazzes', itemName: 'baz', propName: 'qux' }
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
                    aureliaConfig = createAureliaConfig(fixture);
                    au.register(aureliaConfig);
                    const initItems = init.map(i => ({ [propName]: i }));
                    const initItemsCopy = initItems.slice();
                    const newItems = items.map(i => ({ [propName]: i }));
                    component = createComponent(fixture, initItems);
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

  // describe('assign should render correctly', () => {
  //   const fixtures: IFixture[] = [
  //     { type: ArrayRepeater, elName: 'foo', colName: 'todos', itemName: 'todo', propName: 'id' },
  //     { type: ArrayRepeater, elName: 'bar', colName: 'bazzes', itemName: 'baz', propName: 'qux' }
  //   ];
  //   const initArr = [[], [1], [1, 2]];
  //   const assignArr = [[], [4], [4, 5]];
  //   const flushArr = ['never', 'once', 'every'];
  //   const timesArr = [1, 2];
  //   const title1 = 'ArrayRepeater assign (render): ';

  //   // test with different collection-, local-, item- and property names
  //   for (const fixture of fixtures) {
  //     const { elName, colName, itemName, propName } = fixture;
  //     const title2 = title1 + ' fixture=' + padRight(`${elName},${colName},${itemName},${propName}`, 16);

  //     // test with differently sized initial collections
  //     for (const init of initArr) {
  //       const title3 = title2 + ' size=' + padRight(init.length, 2);

  //       // test with different amounts of items assigned
  //       for (const assign of assignArr) {
  //         const title4 = title3 + ' assignCount=' + padRight(assign.length, 2);

  //         // test with never flushing after mutation, flushing only after all mutations are done, or flushing after every mutation
  //         for (const flush of flushArr) {
  //           const title5 = title4 + ' flush=' + padRight(flush, 6);

  //           // repeat the operation different amounts of times to simulate complexer chained operations
  //           for (const times of timesArr) {
  //             const title = title5 + ' times=' + padRight(times, 2);

  //             it(title, () => {
  //               aureliaConfig = createAureliaConfig(fixture);
  //               au.register(aureliaConfig);
  //               const initItems = init.map(i => ({ [propName]: i }));
  //               const initItemsCopy = initItems.slice();
  //               let assignItems = assign.map(i => ({ [propName]: i }));
  //               component = createComponent(fixture, initItems);
  //               au.app({ host, component });
  //               au.start();
  //               sut = <any>au['components'][0].$attachable[0];
  //               taskQueue.flushMicroTaskQueue();
  //               assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName, propName);
  //               assertDOMSynchronized(fixture, component[colName], <any>host);
  //               let i = 0;
  //               while (i < times) {
  //                 assignItems = assignItems.slice();
  //                 // change the properties of the newly added items with each iteration to verify bindingTarget is updated correctly
  //                 incrementItems(assignItems, i, fixture);
  //                 i++;
  //                 component[colName] = assignItems;
  //                 switch (flush) {
  //                   case 'never':
  //                     // never flushed; verify everything is identical to the initial state after each mutation
  //                     assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName, propName);
  //                     assertDOMSynchronized(fixture, initItemsCopy, <any>host);
  //                     break;
  //                   case 'once':
  //                     // flushed once; verify everything is identical to the initial state except for the last iteration
  //                     if (i === times) {
  //                       taskQueue.flushMicroTaskQueue();
  //                       assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName, propName);
  //                       assertDOMSynchronized(fixture, component[colName], <any>host);
  //                     } else {
  //                       assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName, propName);
  //                       assertDOMSynchronized(fixture, initItemsCopy, <any>host);
  //                     }
  //                     break;
  //                   case 'every':
  //                     // flushed every; verify changes propagate to the DOM after each mutation
  //                     taskQueue.flushMicroTaskQueue();
  //                     assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName, propName);
  //                     assertDOMSynchronized(fixture, component[colName], <any>host);
  //                     break;
  //                 }
  //               }
  //               DOM.remove(host);
  //             });
  //           }
  //         }
  //       }
  //     }
  //   }
  // });

  
  describe('reverse should render correctly', () => {
    const fixtures: IFixture[] = [
      { type: ArrayRepeater, elName: 'foo', colName: 'todos', itemName: 'todo', propName: 'id' },
      { type: ArrayRepeater, elName: 'bar', colName: 'bazzes', itemName: 'baz', propName: 'qux' }
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
              aureliaConfig = createAureliaConfig(fixture);
              au.register(aureliaConfig);
              const initItems = init.map(i => ({ [propName]: i }));
              const initItemsCopy = initItems.slice();
              component = createComponent(fixture, initItems);
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
});

