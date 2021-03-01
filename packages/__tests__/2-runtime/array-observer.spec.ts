import {
  ArrayObserver,
  copyIndexMap,
  disableArrayObservation,
  enableArrayObservation,
  ICollectionSubscriber,
  IndexMap,
  LifecycleFlags as LF,
  applyMutationsToIndices,
  synchronizeIndices,
  // batch,
} from '@aurelia/runtime';
import {
  assert,
  CollectionChangeSet,
  eachCartesianJoin,
  SpySubscriber,
} from '@aurelia/testing';

export class SynchronizingCollectionSubscriber implements ICollectionSubscriber {
  public readonly oldArr: unknown[];
  public readonly newArr: unknown[];

  public constructor(
    oldArr: unknown[],
    newArr: unknown[],
  ) {
    this.oldArr = oldArr;
    this.newArr = newArr;
  }

  public handleCollectionChange(indexMap: IndexMap, flags: LF): void {
    applyMutationsToIndices(indexMap);

    const newArr = this.newArr;
    const oldArr = this.oldArr;

    const deleted = indexMap.deletedItems.sort((a, b) => a - b);
    const deletedLen = deleted.length;
    let j = 0;
    for (let i = 0; i < deletedLen; ++i) {
      j = deleted[i] - i;
      oldArr.splice(j, 1);
    }

    const mapLen = indexMap.length;
    for (let i = 0; i < mapLen; ++i) {
      if (indexMap[i] === -2) {
        oldArr.splice(i, 0, newArr[i]);
      }
    }

    synchronizeIndices(oldArr, indexMap);
  }
}

describe(`ArrayObserver`, function () {
  let sut: ArrayObserver;

  // eslint-disable-next-line mocha/no-hooks
  before(function () {
    disableArrayObservation();
    enableArrayObservation();
  });

  describe('should allow subscribing for immediate notification', function () {
    it('push', function () {
      const s = new SpySubscriber();
      const arr = [];
      sut = new ArrayObserver(arr);
      sut.subscribe(s);
      arr.push(1);
      assert.deepStrictEqual(
        s.collectionChanges.pop(),
        new CollectionChangeSet(0, LF.none, copyIndexMap([-2]))
      );
    });

    it('push 2', function () {
      const s = new SpySubscriber();
      const arr = [];
      sut = new ArrayObserver(arr);
      sut.subscribe(s);
      arr.push(1, 2);
      assert.deepStrictEqual(
        s.collectionChanges.pop(),
        new CollectionChangeSet(0, LF.none, copyIndexMap([-2, -2]))
      );
    });
  });

  describe('should allow unsubscribing for immediate notification', function () {
    it('push', function () {
      const s = new SpySubscriber();
      const arr = [];
      sut = new ArrayObserver(arr);
      sut.subscribe(s);
      sut.unsubscribe(s);
      arr.push(1);
      assert.strictEqual(s.collectionChanges.length, 0);
    });
  });

  // describe('should allow subscribing for batched notification', function () {
  //   it('push', function () {
  //     const s = new SpySubscriber();
  //     const arr = [];
  //     sut = new ArrayObserver(arr);
  //     sut.subscribe(s);
  //     batch(
  //       function () {
  //         arr.push(1);
  //       },
  //     );
  //     assert.deepStrictEqual(
  //       s.collectionChanges.pop(),
  //       new CollectionChangeSet(0, LF.none, copyIndexMap([-2]))
  //     );
  //   });

  //   it('push 2', function () {
  //     const s = new SpySubscriber();
  //     const arr = [];
  //     sut = new ArrayObserver(arr);
  //     sut.subscribe(s);
  //     batch(
  //       function () {
  //         arr.push(1, 2);
  //       },
  //     );
  //     assert.deepStrictEqual(
  //       s.collectionChanges.pop(),
  //       new CollectionChangeSet(0, LF.none, copyIndexMap([-2, -2]))
  //     );
  //   });
  // });

  // describe('should allow unsubscribing for batched notification', function () {
  //   it('push', function () {
  //     const s = new SpySubscriber();
  //     const arr = [];
  //     sut = new ArrayObserver(arr);
  //     sut.subscribe(s);
  //     sut.unsubscribeFromCollection(s);
  //     batch(
  //       function () {
  //         arr.push(1);
  //       },
  //     );
  //     assert.strictEqual(s.collectionChanges.length, 0);
  //   });
  // });

  // describe('should not notify batched subscribers if there are no changes', function () {
  //   it('push', function () {
  //     const s = new SpySubscriber();
  //     const arr = [];
  //     sut = new ArrayObserver(arr);
  //     batch(
  //       function () { return; },
  //     );
  //     assert.strictEqual(s.collectionChanges.length, 0);
  //   });
  // });

  describe(`observePush`, function () {
    const initArr = [[], [1], [1, 2]];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2];

    eachCartesianJoin(
      [
        initArr,
        itemsArr,
        repeatArr,
      ],
      function (init, items, repeat) {
        it(`size=${padRight(init.length, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, function () {
          const arr = init.slice();
          const expectedArr = init.slice();
          const newItems = items && items.slice();
          sut = new ArrayObserver(arr);
          let expectedResult;
          let actualResult;
          let i = 0;
          while (i < repeat) {
            incrementItems(newItems, i);
            if (newItems === undefined) {
              expectedResult = expectedArr.push();
              actualResult = arr.push();
            } else {
              expectedResult = expectedArr.push(...newItems);
              actualResult = arr.push(...newItems);
            }
            assert.deepStrictEqual(actualResult, expectedResult);
            assert.deepStrictEqual(arr, expectedArr);
            i++;
          }
        });

        it(`size=${padRight(init.length, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, function () {
          const arr = init.slice();
          const copy = init.slice();
          const newItems = items && items.slice();
          sut = new ArrayObserver(arr);
          sut.subscribe(new SynchronizingCollectionSubscriber(copy, arr));

          let i = 0;
          while (i < repeat) {
            incrementItems(newItems, i);
            if (newItems === undefined) {
              arr.push();
            } else {
              arr.push(...newItems);
            }
            assert.deepStrictEqual(copy, arr);
            i++;
          }
        });
      },
    );
  });

  describe(`observeUnshift`, function () {
    const initArr = [[], [1], [1, 2]];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2];

    eachCartesianJoin(
      [
        initArr,
        itemsArr,
        repeatArr,
      ],
      function (init, items, repeat) {
        it(`size=${padRight(init.length, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, function () {
          const arr = init.slice();
          const expectedArr = init.slice();
          const newItems = items && items.slice();
          sut = new ArrayObserver(arr);
          let expectedResult;
          let actualResult;
          let i = 0;
          while (i < repeat) {
            incrementItems(newItems, i);
            if (newItems === undefined) {
              expectedResult = expectedArr.unshift();
              actualResult = arr.unshift();
            } else {
              expectedResult = expectedArr.unshift(...newItems);
              actualResult = arr.unshift(...newItems);
            }
            assert.deepStrictEqual(actualResult, expectedResult);
            assert.deepStrictEqual(arr, expectedArr);
            i++;
          }
        });

        it(`size=${padRight(init.length, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, function () {
          const arr = init.slice();
          const copy = init.slice();
          const newItems = items && items.slice();
          sut = new ArrayObserver(arr);
          sut.subscribe(new SynchronizingCollectionSubscriber(copy, arr));
          let i = 0;
          while (i < repeat) {
            incrementItems(newItems, i);
            if (newItems === undefined) {
              arr.unshift();
            } else {
              arr.unshift(...newItems);
            }
            assert.deepStrictEqual(copy, arr);
            i++;
          }
        });
      },
    );
  });

  describe(`observePop`, function () {
    const initArr = [[], [1], [1, 2]];
    const repeatArr = [1, 2, 3, 4];

    eachCartesianJoin(
      [
        initArr,
        repeatArr,
      ],
      function (init, repeat) {
        it(`size=${padRight(init.length, 2)} repeat=${repeat} - behaves as native`, function () {
          const arr = init.slice();
          const expectedArr = init.slice();
          sut = new ArrayObserver(arr);
          let expectedResult;
          let actualResult;
          let i = 0;
          while (i < repeat) {
            expectedResult = expectedArr.pop();
            actualResult = arr.pop();
            assert.strictEqual(actualResult, expectedResult, `actualResult`);
            assert.deepStrictEqual(arr, expectedArr);
            i++;
          }
        });

        it(`size=${padRight(init.length, 2)} repeat=${repeat} - tracks changes`, function () {
          const arr = init.slice();
          const copy = init.slice();
          sut = new ArrayObserver(arr);
          sut.subscribe(new SynchronizingCollectionSubscriber(copy, arr));
          let i = 0;
          while (i < repeat) {
            arr.pop();
            assert.deepStrictEqual(copy, arr);
            i++;
          }
        });
      },
    );
  });

  describe(`observeShift`, function () {
    const initArr = [[], [1], [1, 2]];
    const repeatArr = [1, 2, 3, 4];

    eachCartesianJoin(
      [
        initArr,
        repeatArr,
      ],
      function (init, repeat) {
        it(`size=${padRight(init.length, 2)} repeat=${repeat} - behaves as native`, function () {
          const arr = init.slice();
          const expectedArr = init.slice();
          sut = new ArrayObserver(arr);
          let expectedResult;
          let actualResult;
          let i = 0;
          while (i < repeat) {
            expectedResult = expectedArr.shift();
            actualResult = arr.shift();
            assert.strictEqual(actualResult, expectedResult, `actualResult`);
            assert.deepStrictEqual(arr, expectedArr);
            i++;
          }
        });

        it(`size=${padRight(init.length, 2)} repeat=${repeat} - tracks changes`, function () {
          const arr = init.slice();
          const copy = init.slice();
          sut = new ArrayObserver(arr);
          sut.subscribe(new SynchronizingCollectionSubscriber(copy, arr));
          let i = 0;
          while (i < repeat) {
            arr.shift();
            assert.deepStrictEqual(copy, arr);
            i++;
          }
        });
      },
    );
  });

  describe(`observeSplice`, function () {
    const initArr = [[], [1], [1, 2]];
    const startArr = [undefined, -1, 0, 1, 2];
    const deleteCountArr = [undefined, -1, 0, 1, 2, 3];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2];

    eachCartesianJoin(
      [
        initArr,
        startArr,
        deleteCountArr,
        itemsArr,
        repeatArr,
      ],
      function (init, start, deleteCount, items, repeat) {
        it(`size=${padRight(init.length, 2)} start=${padRight(start, 9)} deleteCount=${padRight(deleteCount, 9)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, function () {
          const arr = init.slice();
          const expectedArr = init.slice();
          const newItems = items && items.slice();
          sut = new ArrayObserver(arr);
          let expectedResult;
          let actualResult;
          let i = 0;
          while (i < repeat) {
            incrementItems(newItems, i);
            if (items === undefined) {
              if (deleteCount === undefined) {
                if (start === undefined) {
                  expectedResult = (expectedArr as any).splice();
                  actualResult = (arr as any).splice();
                } else {
                  expectedResult = expectedArr.splice(start);
                  actualResult = arr.splice(start);
                }
              } else {
                expectedResult = expectedArr.splice(start, deleteCount);
                actualResult = arr.splice(start, deleteCount);
              }
            } else {
              expectedResult = expectedArr.splice(start, deleteCount, ...newItems);
              actualResult = arr.splice(start, deleteCount, ...newItems);
            }
            assert.deepStrictEqual(actualResult, expectedResult);
            assert.deepStrictEqual(arr, expectedArr);
            i++;
          }
        });

        it(`size=${padRight(init.length, 2)} start=${padRight(start, 9)} deleteCount=${padRight(deleteCount, 9)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, function () {
          const arr = init.slice();
          const copy = init.slice();
          const newItems = items && items.slice();
          sut = new ArrayObserver(arr);
          sut.subscribe(new SynchronizingCollectionSubscriber(copy, arr));
          let i = 0;
          while (i < repeat) {
            incrementItems(newItems, i);
            if (newItems === undefined) {
              if (deleteCount === undefined) {
                arr.splice(start);
              } else {
                arr.splice(start, deleteCount);
              }
            } else {
              arr.splice(start, deleteCount, ...newItems);
            }
            assert.deepStrictEqual(copy, arr);
            i++;
          }
        });
      },
    );
  });

  describe(`observeReverse`, function () {
    const initArr = [[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4]];
    const repeatArr = [1, 2];

    eachCartesianJoin(
      [
        initArr,
        repeatArr,
      ],
      function (init, repeat) {
        it(`size=${padRight(init.length, 2)} repeat=${repeat} - behaves as native`, function () {
          const arr = init.slice();
          const expectedArr = init.slice();
          sut = new ArrayObserver(arr);
          let expectedResult;
          let actualResult;
          let i = 0;
          while (i < repeat) {
            expectedResult = expectedArr.reverse();
            actualResult = arr.reverse();
            assert.deepStrictEqual(actualResult, expectedResult);
            assert.deepStrictEqual(arr, expectedArr);
            i++;
          }
        });

        it(`size=${padRight(init.length, 2)} repeat=${repeat} - tracks changes`, function () {
          const arr = init.slice();
          const copy = init.slice();
          sut = new ArrayObserver(arr);
          sut.subscribe(new SynchronizingCollectionSubscriber(copy, arr));
          let i = 0;
          while (i < repeat) {
            arr.reverse();
            assert.deepStrictEqual(copy, arr);
            i++;
          }
        });
      },
    );
  });

  describe(`observeSort`, function () {
    const arraySizes = [0, 1, 2, 3, 5, 10, 500, 2500];
    const types = ['undefined', 'null', 'boolean', 'string', 'number', 'object', 'mixed'];
    const compareFns = [
      undefined,
      (a, b) => a - b,
      (a, b) => a === b ? 0 : a - b,
      (a, b) => a === b ? 0 : a < b ? -1 : 1
    ];
    const reverseOrNot = [true, false];
    for (const arraySize of arraySizes) {
      const getNumber = getNumberFactory(arraySize);
      const init = new Array(arraySize);

      for (const type of types) {
        const getValue = getValueFactory(getNumber, type, types);
        let i = 0;
        while (i < arraySize) {
          init[i] = getValue(i);
          i++;
        }

        for (const reverse of reverseOrNot) {
          if (reverse) {
            init.reverse();
          }
          for (const compareFn of compareFns) {
            it(`size=${padRight(init.length, 4)} type=${padRight(type, 9)} reverse=${padRight(reverse, 5)} sortFunc=${compareFn} - behaves as native`, function () {
              const arr = init.slice();
              const expectedArr = init.slice();
              sut = new ArrayObserver(arr);
              const expectedResult = expectedArr.sort(compareFn);
              const actualResult = arr.sort(compareFn);
              assert.strictEqual(expectedResult, expectedArr, `expectedResult`);
              assert.strictEqual(actualResult, arr, `actualResult`);
              try {
                assert.deepStrictEqual(arr, expectedArr);
              } catch (e) {
                if (compareFn !== undefined) {
                  // a browser may wrap a custom sort function to normalize the results
                  // so don't consider this a failed test, but just warn so we know about it
                  let differences = 0;
                  let i2 = 0;
                  while (i2 < arraySize) {
                    if (arr[i2] !== expectedArr[i2]) {
                      differences++;
                    }
                    i2++;
                  }
                  console.warn(`${differences} of the ${arraySize} '${type}' items had a different position after sorting with ${compareFn}`);
                } else {
                  throw e;
                }
              }
            });

            it(`size=${padRight(init.length, 4)} type=${padRight(type, 9)} reverse=${padRight(reverse, 5)} sortFunc=${compareFn} - tracks changes`, function () {
              const arr = init.slice();
              const copy = init.slice();
              sut = new ArrayObserver(arr);
              sut.subscribe(new SynchronizingCollectionSubscriber(copy, arr));
              arr.sort(compareFn);
              assert.deepStrictEqual(copy, arr);
            });
          }
        }
      }
    }
  });
});

function padLeft(input: unknown, len: number): string {
  const str = `${input}`;
  return new Array(len - str.length + 1).join(' ') + str;
}

function padRight(input: unknown, len: number): string {
  const str = `${input}`;
  return str + new Array(len - str.length + 1).join(' ');
}

function getNumberFactory(arraySize: number) {
  const middle = (arraySize / 2) | 0;
  return (i) => {
    return i < middle ? arraySize - i : i;
  };
}

function getValueFactory(getNumber: (i: number) => unknown, type: string, types: string[]): (i: number) => unknown {
  let factories: ((i: number) => unknown)[];
  switch (type) {
    case 'undefined':
      return () => undefined;
    case 'null':
      return () => null;
    case 'boolean':
      return (i) => i % 2 === 0;
    case 'string':
      return (i) => (getNumber(i) as object).toString();
    case 'number':
      return getNumber;
    case 'object':
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      return (i) => { [getNumber(i)]; };
    case 'mixed':
      factories = [
        getValueFactory(getNumber, types[0], types),
        getValueFactory(getNumber, types[1], types),
        getValueFactory(getNumber, types[2], types),
        getValueFactory(getNumber, types[3], types),
        getValueFactory(getNumber, types[4], types),
        getValueFactory(getNumber, types[5], types)
      ];
      return (i) => factories[i % 6](i);
  }
}

function incrementItems(items: number[], by: number): void {
  if (items === undefined) {
    return;
  }
  let i = 0;
  const len = items.length;
  while (i < len) {
    if (typeof items[i] === 'number') {
      items[i] += by;
    }
    i++;
  }
}
