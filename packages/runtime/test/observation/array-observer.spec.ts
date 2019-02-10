import { expect } from 'chai';
import { match } from 'sinon';
import {
  ArrayObserver,
  disableArrayObservation,
  enableArrayObservation,
  IndexMap,
  LifecycleFlags as LF
} from '../../src/index';
import { Lifecycle } from '../../src/lifecycle';
import {
  SpySubscriber,
  stringify
} from '../util';

export function assertArrayEqual(actual: ReadonlyArray<any>, expected: ReadonlyArray<any>): void {
  const len = actual.length;
  let i = 0;
  while (i < len) {
    if (actual[i] !== expected[i]) {
      const start = Math.max(i - 3, 0);
      const end = Math.min(i + 3, len);
      const $actual = actual.slice(start, end).map(stringify).join(',');
      const $expected = expected.slice(start, end).map(stringify).join(',');
      const prefix = `[${start > 0 ? '...,' : ''}`;
      const suffix = `${end < len ? ',...' : ''}]`;
      throw new Error(`expected ${prefix}${$actual}${suffix} to equal ${prefix}${$expected}${suffix}`);
    }
    i++;
  }
  expect(len).to.equal(expected.length, `expected.length=${expected.length}, actual.length=${actual.length}`);
}

describe(`ArrayObserver`, function() {
  let sut: ArrayObserver;

  before(function() {
    disableArrayObservation();
    enableArrayObservation();
  });

  afterEach(function() {
    if (sut) {
      sut.dispose();
    }
  });

  describe('should allow subscribing for immediate notification', function() {
    it('push', function() {
      const s = new SpySubscriber();
      const arr = [];
      sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
      sut.subscribe(s);
      arr.push(1);
      expect(s.handleChange).to.have.been.calledWith('push', match(x => x[0] === 1));
    });

    it('push', function() {
      const s = new SpySubscriber();
      const arr = [];
      sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
      sut.subscribe(s);
      arr.push(1, 2);
      expect(s.handleChange).to.have.been.calledWith('push', match(x => x[0] === 1 && x[1] === 2));
    });
  });

  describe('should allow unsubscribing for immediate notification', function() {
    it('push', function() {
      const s = new SpySubscriber();
      const arr = [];
      sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
      sut.subscribe(s);
      sut.unsubscribe(s);
      arr.push(1);
      expect(s.handleChange).not.to.have.been.called;
    });
  });

  describe('should allow subscribing for batched notification', function() {
    it('push', function() {
      const s = new SpySubscriber();
      const arr = [];
      sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
      sut.subscribeBatched(s);
      arr.push(1);
      const indexMap: IndexMap = sut.indexMap.slice();
      indexMap.deletedItems = sut.indexMap.deletedItems;
      sut.flush(LF.none);
      expect(s.handleBatchedChange).to.have.been.calledWith(indexMap);
    });

    it('push', function() {
      const s = new SpySubscriber();
      const arr = [];
      sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
      sut.subscribeBatched(s);
      arr.push(1, 2);
      const indexMap: IndexMap = sut.indexMap.slice();
      indexMap.deletedItems = sut.indexMap.deletedItems;
      sut.flush(LF.none);
      expect(s.handleBatchedChange).to.have.been.calledWith(indexMap);
    });
  });

  describe('should allow unsubscribing for batched notification', function() {
    it('push', function() {
      const s = new SpySubscriber();
      const arr = [];
      sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
      sut.subscribeBatched(s);
      sut.unsubscribeBatched(s);
      arr.push(1);
      sut.flush(LF.none);
      expect(s.handleBatchedChange).not.to.have.been.called;
    });
  });

  // the reason for this is because only a change will cause it to queue itself, so it would never normally be called without changes anyway,
  // but for the occasion that it needs to be forced (such as via patch lifecycle), we do want all subscribers to be invoked regardless
  describe('should notify batched subscribers even if there are no changes', function() {
    it('push', function() {
      const s = new SpySubscriber();
      const arr = [];
      sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
      sut.subscribeBatched(s);
      sut.flush(LF.none);
      expect(s.handleBatchedChange).to.have.been.called;
    });
  });

  describe(`observePush`, function() {
    const initArr = [[], [1], [1, 2]];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2];
    for (const init of initArr) {
      for (const items of itemsArr) {
        for (const repeat of repeatArr) {
          it(`size=${padRight(init.length, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, function() {
            const arr = init.slice();
            const expectedArr = init.slice();
            const newItems = items && items.slice();
            sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
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
              assertArrayEqual(actualResult, expectedResult);
              assertArrayEqual(arr, expectedArr);
              i++;
            }
          });

          it(`size=${padRight(init.length, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, function() {
            const arr = init.slice();
            const copy = init.slice();
            const newItems = items && items.slice();
            sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
            let i = 0;
            while (i < repeat) {
              incrementItems(newItems, i);
              if (newItems === undefined) {
                arr.push();
              } else {
                arr.push(...newItems);
              }
              synchronize(copy, sut.indexMap, arr);
              assertArrayEqual(copy, arr);
              sut.resetIndexMap();
              i++;
            }
          });
        }
      }
    }
  });

  describe(`observeUnshift`, function() {
    const initArr = [[], [1], [1, 2]];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2];
    for (const init of initArr) {
      for (const items of itemsArr) {
        for (const repeat of repeatArr) {
          it(`size=${padRight(init.length, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, function() {
            const arr = init.slice();
            const expectedArr = init.slice();
            const newItems = items && items.slice();
            sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
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
              assertArrayEqual(actualResult, expectedResult);
              assertArrayEqual(arr, expectedArr);
              i++;
            }
          });

          it(`size=${padRight(init.length, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, function() {
            const arr = init.slice();
            const copy = init.slice();
            const newItems = items && items.slice();
            sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
            let i = 0;
            while (i < repeat) {
              incrementItems(newItems, i);
              if (newItems === undefined) {
                arr.unshift();
              } else {
                arr.unshift(...newItems);
              }
              synchronize(copy, sut.indexMap, arr);
              assertArrayEqual(copy, arr);
              sut.resetIndexMap();
              i++;
            }
          });
        }
      }
    }
  });

  describe(`observePop`, function() {
    const initArr = [[], [1], [1, 2]];
    const repeatArr = [1, 2, 3, 4];
    for (const init of initArr) {
      for (const repeat of repeatArr.filter(r => r <= (init.length + 1))) {
        it(`size=${padRight(init.length, 2)} repeat=${repeat} - behaves as native`, function() {
          const arr = init.slice();
          const expectedArr = init.slice();
          sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
          let expectedResult;
          let actualResult;
          let i = 0;
          while (i < repeat) {
            expectedResult = expectedArr.pop();
            actualResult = arr.pop();
            expect(actualResult).to.equal(expectedResult);
            assertArrayEqual(arr, expectedArr);
            i++;
          }
        });

        it(`size=${padRight(init.length, 2)} repeat=${repeat} - tracks changes`, function() {
          const arr = init.slice();
          const copy = init.slice();
          sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
          let i = 0;
          while (i < repeat) {
            arr.pop();
            synchronize(copy, sut.indexMap, arr);
            assertArrayEqual(copy, arr);
            sut.resetIndexMap();
            i++;
          }
        });
      }
    }
  });

  describe(`observeShift`, function() {
    const initArr = [[], [1], [1, 2]];
    const repeatArr = [1, 2, 3, 4];
    for (const init of initArr) {
      for (const repeat of repeatArr.filter(r => r <= (init.length + 1))) {
        const arr = init.slice();
        const expectedArr = init.slice();
        it(`size=${padRight(init.length, 2)} repeat=${repeat} - behaves as native`, function() {
          sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
          let expectedResult;
          let actualResult;
          let i = 0;
          while (i < repeat) {
            expectedResult = expectedArr.shift();
            actualResult = arr.shift();
            expect(actualResult).to.equal(expectedResult);
            assertArrayEqual(arr, expectedArr);
            i++;
          }
        });

        it(`size=${padRight(init.length, 2)} repeat=${repeat} - tracks changes`, function() {
          const arr2 = init.slice();
          const copy = init.slice();
          sut = new ArrayObserver(LF.none, new Lifecycle(), arr2);
          let i = 0;
          while (i < repeat) {
            arr2.shift();
            synchronize(copy, sut.indexMap, arr2);
            assertArrayEqual(copy, arr2);
            sut.resetIndexMap();
            i++;
          }
        });
      }
    }
  });

  describe(`observeSplice`, function() {
    const initArr = [[], [1], [1, 2]];
    const startArr = [undefined, -1, 0, 1, 2];
    const deleteCountArr = [undefined, -1, 0, 1, 2, 3];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2];
    for (const init of initArr) {
      for (const start of startArr.filter(s => s === undefined || s <= (init.length + 1))) {
        for (const deleteCount of deleteCountArr.filter(d => d === undefined || d <= (init.length + 1))) {
          for (const items of itemsArr) {
            for (const repeat of repeatArr) {
              it(`size=${padRight(init.length, 2)} start=${padRight(start, 9)} deleteCount=${padRight(deleteCount, 9)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, function() {
                const arr = init.slice();
                const expectedArr = init.slice();
                const newItems = items && items.slice();
                sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
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
                  assertArrayEqual(actualResult, expectedResult);
                  assertArrayEqual(arr, expectedArr);
                  i++;
                }
              });

              it(`size=${padRight(init.length, 2)} start=${padRight(start, 9)} deleteCount=${padRight(deleteCount, 9)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, function() {
                const arr = init.slice();
                const copy = init.slice();
                const newItems = items && items.slice();
                sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
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
                  synchronize(copy, sut.indexMap, arr);
                  assertArrayEqual(copy, arr);
                  sut.resetIndexMap();
                  i++;
                }
              });
            }
          }
        }
      }
    }
  });

  describe(`observeReverse`, function() {
    const initArr = [[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4]];
    const repeatArr = [1, 2];
    for (const init of initArr) {
      for (const repeat of repeatArr) {
        it(`size=${padRight(init.length, 2)} repeat=${repeat} - behaves as native`, function() {
          const arr = init.slice();
          const expectedArr = init.slice();
          sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
          let expectedResult;
          let actualResult;
          let i = 0;
          while (i < repeat) {
            expectedResult = expectedArr.reverse();
            actualResult = arr.reverse();
            assertArrayEqual(actualResult, expectedResult);
            assertArrayEqual(arr, expectedArr);
            i++;
          }
        });

        it(`size=${padRight(init.length, 2)} repeat=${repeat} - tracks changes`, function() {
          const arr = init.slice();
          const copy = init.slice();
          sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
          let i = 0;
          while (i < repeat) {
            arr.reverse();
            synchronize(copy, sut.indexMap, arr);
            assertArrayEqual(copy, arr);
            sut.resetIndexMap();
            i++;
          }
        });
      }
    }
  });

  describe(`observeSort`, function() {
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
            it(`size=${padRight(init.length, 4)} type=${padRight(type, 9)} reverse=${padRight(reverse, 5)} sortFunc=${compareFn} - behaves as native`, function() {
              const arr = init.slice();
              const expectedArr = init.slice();
              sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
              const expectedResult = expectedArr.sort(compareFn);
              const actualResult = arr.sort(compareFn);
              expect(expectedResult).to.equal(expectedArr);
              expect(actualResult).to.equal(arr);
              try {
                assertArrayEqual(arr, expectedArr);
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

            it(`size=${padRight(init.length, 4)} type=${padRight(type, 9)} reverse=${padRight(reverse, 5)} sortFunc=${compareFn} - tracks changes`, function() {
              const arr = init.slice();
              const copy = init.slice();
              sut = new ArrayObserver(LF.none, new Lifecycle(), arr);
              arr.sort(compareFn);
              synchronize(copy, sut.indexMap, arr);
              assertArrayEqual(copy, arr);
              sut.resetIndexMap();
            });
          }
        }
      }
    }
  });
});

function padLeft(str: any, len: number): string {
  str = `${str}`;
  return new Array(len - str.length + 1).join(' ') + str;
}

function padRight(str: any, len: number): string {
  str = `${str}`;
  return str + new Array(len - str.length + 1).join(' ');
}

function getNumberFactory(arraySize: number) {
  const middle = (arraySize / 2) | 0;
  return (i) => {
    return i < middle ? arraySize - i : i;
  };
}

function getValueFactory(getNumber: (i: number) => unknown, type: string, types: string[]): (i: number) => unknown {
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
      return (i) => {[getNumber(i)]; };
    case 'mixed':
      const factories = [
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

function synchronize(oldArr: unknown[], indexMap: number[], newArr: unknown[]): void {
  if (newArr.length === 0 && oldArr.length === 0) {
    return;
  }

  const copy = oldArr.slice();
  const len = indexMap.length;
  let to = 0;
  let from = 0;
  while (to < len) {
    from = indexMap[to];
    if (from > -1) {
      // move existing
      oldArr[to] = copy[from];
    } else if (from < -1) {
      // add new
      oldArr[to] = newArr[to];
    }
    to++;
  }
  oldArr.length = newArr.length;
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
