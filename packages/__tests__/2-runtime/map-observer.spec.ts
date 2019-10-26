// import {
//   disableMapObservation,
//   enableMapObservation,
//   IndexMap,
//   LifecycleFlags as LF,
//   MapObserver,
//   ILifecycle
// } from '@aurelia/runtime';
// import {
//   SpySubscriber,
//   stringify,
//   assert
// } from '@aurelia/testing';
// import { DI } from '@aurelia/kernel';

// function assetMapEqual(actual: Map<any, any>, expected: Map<any, any>): void {
//   const len = actual.size;
//   assert.strictEqual(len, expected.size, `expected.size=${expected.size}, actual.size=${actual.size}`, `len`);
//   actual = Array.from(actual) as any;
//   expected = Array.from(expected) as any;
//   let i = 0;
//   while (i < len) {
//     if (actual[i][0] !== expected[i][0] || actual[i][1] !== expected[i][1]) {
//       const start = Math.max(i - 3, 0);
//       const end = Math.min(i + 3, len);
//       const $actual = Array.from(actual).slice(start, end).map(stringify).join(',');
//       const $expected = Array.from(expected).slice(start, end).map(stringify).join(',');
//       const prefix = `[${start > 0 ? '...,' : ''}`;
//       const suffix = `${end < len ? ',...' : ''}]`;
//       throw new Error(`expected ${prefix}${$actual}${suffix} to equal ${prefix}${$expected}${suffix}`);
//     }
//     i++;
//   }
// }

// describe(`MapObserver`, function () {
//   let sut: MapObserver;

//   before(function () {
//     disableMapObservation();
//     enableMapObservation();
//   });

//   afterEach(function () {
//     if (sut) {
//       sut.dispose();
//     }
//   });

//   describe('should allow subscribing for immediate notification', function () {
//     it('set', function () {
//       const s = new SpySubscriber();
//       const map = new Map();
//       sut = new MapObserver(LF.none, DI.createContainer().get(ILifecycle), map);
//       sut.subscribe(s);
//       map.set(1, 1);
//       assert.deepStrictEqual(
//         s.handleChange.calls,
//         [
//           ['set', match(x => x[0] === 1)],
//         ],
//         `s.handleChange`,
//       );
//     });
//   });

//   describe('should allow unsubscribing for immediate notification', function () {
//     it('set', function () {
//       const s = new SpySubscriber();
//       const map = new Map();
//       sut = new MapObserver(LF.none, DI.createContainer().get(ILifecycle), map);
//       sut.subscribe(s);
//       sut.unsubscribe(s);
//       map.set(1, 1);
//       expect(s.handleChange).not.to.have.been.called;
//     });
//   });

//   describe('should allow subscribing for batched notification', function () {
//     it('set', function () {
//       const s = new SpySubscriber();
//       const map = new Map();
//       sut = new MapObserver(LF.none, DI.createContainer().get(ILifecycle), map);
//       sut.subscribeBatched(s);
//       map.set(1, 1);
//       const indexMap: IndexMap = sut.indexMap.slice();
//       indexMap.deletedItems = sut.indexMap.deletedItems;
//       sut.flush(LF.none);
//       assert.deepStrictEqual(
//         s.handleBatchedChange.calls,
//         [
//           [indexMap],
//         ],
//         `s.handleBatchedChange`,
//       );
//     });
//   });

//   describe('should allow unsubscribing for batched notification', function () {
//     it('set', function () {
//       const s = new SpySubscriber();
//       const map = new Map();
//       sut = new MapObserver(LF.none, DI.createContainer().get(ILifecycle), map);
//       sut.subscribeBatched(s);
//       sut.unsubscribeBatched(s);
//       map.set(1, 1);
//       sut.flush(LF.none);
//       expect(s.handleBatchedChange).not.to.have.been.called;
//     });
//   });

//   // the reason for this is because only a change will cause it to queue itself, so it would never normally be called without changes anyway,
//   // but for the occasion that it needs to be forced (such as via patch lifecycle), we do want all subscribers to be invoked regardless
//   describe('should notify batched subscribers even if there are no changes', function () {
//     it('set', function () {
//       const s = new SpySubscriber();
//       const map = new Map();
//       sut = new MapObserver(LF.none, DI.createContainer().get(ILifecycle), map);
//       sut.subscribeBatched(s);
//       sut.flush(LF.none);
//       expect(s.handleBatchedChange).to.have.been.called;
//     });
//   });

//   describe(`observeSet`, function () {
//     const initArr = [new Map(), new Map([[1, 1]]), new Map([[1, 1], [2, 2]])];
//     const itemsArr = [undefined, [], [1], [1, 2]];
//     const repeatArr = [1, 2];
//     for (const init of initArr) {
//       for (const items of itemsArr) {
//         for (const repeat of repeatArr) {
//           it(`size=${padRight(init.size, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, function () {
//             const map = new Map(Array.from(init));
//             const expectedMap = new Map(Array.from(init));
//             const newItems = items && items.slice();
//             sut = new MapObserver(LF.none, DI.createContainer().get(ILifecycle), map);
//             let expectedResult;
//             let actualResult;
//             let i = 0;
//             while (i < repeat) {
//               incrementItems(newItems, i);
//               if (newItems === undefined) {
//                 expectedResult = (expectedMap as any).set();
//                 actualResult = (map as any).set();
//               } else {
//                 for (const item of newItems) {
//                   expectedResult = expectedMap.set(item, item);
//                   actualResult = map.set(item, item);
//                 }
//               }
//               // either they're both undefined (in which case !== doesn't apply) or they're both sets that must be equivalent
//               if (actualResult !== expectedResult) {
//                 assetMapEqual(actualResult, expectedResult);
//               }
//               assetMapEqual(map, expectedMap);
//               i++;
//             }
//           });

//           it(`size=${padRight(init.size, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, function () {
//             const map = new Map(Array.from(init));
//             const copy = new Map(Array.from(init));
//             const newItems = items && items.slice();
//             sut = new MapObserver(LF.none, DI.createContainer().get(ILifecycle), map);
//             let i = 0;
//             while (i < repeat) {
//               incrementItems(newItems, i);
//               if (newItems === undefined) {
//                 (map as any).set();
//               } else {
//                 for (const item of newItems) {
//                   map.set(item, item);
//                 }
//               }
//               synchronize(copy, sut.indexMap, map);
//               assetMapEqual(copy, map);
//               sut.resetIndexMap();
//               i++;
//             }
//           });
//         }
//       }
//     }
//   });

//   describe(`observeDelete`, function () {
//     const initArr = [new Map(), new Map([[1, 1]]), new Map([[1, 1], [2, 2]])];
//     const itemsArr = [undefined, [], [1], [1, 2]];
//     const repeatArr = [1, 2];
//     for (const init of initArr) {
//       for (const items of itemsArr) {
//         for (const repeat of repeatArr) {
//           it(`size=${padRight(init.size, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, function () {
//             const map = new Map(Array.from(init));
//             const expectedMap = new Map(Array.from(init));
//             const newItems = items && items.slice();
//             sut = new MapObserver(LF.none, DI.createContainer().get(ILifecycle), map);
//             let expectedResult;
//             let actualResult;
//             let i = 0;
//             while (i < repeat) {
//               incrementItems(newItems, i);
//               if (newItems === undefined) {
//                 expectedResult = (expectedMap as any).delete();
//                 actualResult = (map as any).delete();
//               } else {
//                 for (const item of newItems) {
//                   expectedResult = expectedMap.delete(item);
//                   actualResult = map.delete(item);
//                 }
//               }
//               // either they're both undefined (in which case !== doesn't apply) or they're both sets that must be equivalent
//               if (actualResult !== expectedResult) {
//                 assetMapEqual(actualResult, expectedResult);
//               }
//               assetMapEqual(map, expectedMap);
//               i++;
//             }
//           });

//           it(`size=${padRight(init.size, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, function () {
//             const map = new Map(Array.from(init));
//             const copy = new Map(Array.from(init));
//             const newItems = items && items.slice();
//             sut = new MapObserver(LF.none, DI.createContainer().get(ILifecycle), map);
//             let i = 0;
//             while (i < repeat) {
//               incrementItems(newItems, i);
//               if (newItems === undefined) {
//                 (map as any).delete();
//               } else {
//                 for (const item of newItems) {
//                   map.delete(item);
//                 }
//               }
//               synchronize(copy, sut.indexMap, map);
//               assetMapEqual(copy, map);
//               sut.resetIndexMap();
//               i++;
//             }
//           });
//         }
//       }
//     }
//   });

//   describe(`observeClear`, function () {
//     const initArr = [new Map(), new Map([[1, 1]]), new Map([[1, 1], [2, 2]])];
//     const repeatArr = [1, 2];
//     for (const init of initArr) {
//       for (const repeat of repeatArr) {
//         it(`size=${padRight(init.size, 2)} repeat=${repeat} - behaves as native`, function () {
//           const map = new Map(Array.from(init));
//           const expectedMap = new Map(Array.from(init));
//           sut = new MapObserver(LF.none, DI.createContainer().get(ILifecycle), map);
//           let i = 0;
//           while (i < repeat) {
//             expectedMap.clear();
//             map.clear();
//             assetMapEqual(map, expectedMap);
//             i++;
//           }
//         });

//         it(`size=${padRight(init.size, 2)} repeat=${repeat} - tracks changes`, function () {
//           const map = new Map(Array.from(init));
//           const copy = new Map(Array.from(init));
//           sut = new MapObserver(LF.none, DI.createContainer().get(ILifecycle), map);
//           let i = 0;
//           while (i < repeat) {
//             map.clear();
//             synchronize(copy, sut.indexMap, map);
//             assetMapEqual(copy, map);
//             sut.resetIndexMap();
//             i++;
//           }
//         });
//       }
//     }
//   });

// });

// function padRight(str: any, len: number): string {
//   str = `${str}`;
//   return str + new Array(len - str.length + 1).join(' ');
// }
// function synchronize(oldMap: Map<any, any>, indexMap: IndexMap, newMap: Map<any, any>): void {
//   if (newMap.size === 0 && oldMap.size === 0) {
//     return;
//   }

//   let i = 0;
//   const toDelete = [];
//   for (const deleted of indexMap.deletedItems) {
//     i = 0;
//     for (const entry of oldMap.keys()) {
//       if (i === deleted) {
//         toDelete.push(entry);
//       }
//       i++;
//     }
//   }
//   for (const del of toDelete) {
//     oldMap.delete(del);
//   }
//   i = 0;
//   for (const entry of newMap.keys()) {
//     if (indexMap[i] === -2) {
//       oldMap.set(entry, entry);
//     }
//     i++;
//   }
// }

// function incrementItems(items: number[], by: number): void {
//   if (items === undefined) {
//     return;
//   }
//   let i = 0;
//   const len = items.length;
//   while (i < len) {
//     if (typeof items[i] === 'number') {
//       items[i] += by;
//     }
//     i++;
//   }
// }
