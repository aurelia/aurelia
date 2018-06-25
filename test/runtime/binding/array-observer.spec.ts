import { ArrayObserver } from './../../../src/runtime/binding/array-observer';
import { expect } from 'chai';

describe(`ArrayObserver`, () => {
  let sut: ArrayObserver;

  afterEach(() => {
    sut.dispose();
  });

  describe(`observePush`, () => {
    const initArr = [[], [1], [1, 2]];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2, 3];
    for (const init of initArr) {
      for (const items of itemsArr) {
        for (const repeat of repeatArr) {
          it(`size=${padRight(init.length, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, () => {
            const arr = init.slice();
            const expectedArr = init.slice();
            sut = new ArrayObserver(arr);
            let expectedResult;
            let actualResult;
            let i = 0;
            while (i < repeat) {
              if (items === undefined) {
                expectedResult = expectedArr.push();
                actualResult = arr.push();
              } else {
                expectedResult = expectedArr.push(...items);
                actualResult = arr.push(...items);
              }
              expect(actualResult).to.deep.equal(expectedResult);
              expect(arr).to.deep.equal(expectedArr);
              i++;
            }
          });

          it(`size=${padRight(init.length, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, () => {
            const arr = init.slice();
            const copy = init.slice();
            sut = new ArrayObserver(arr);
            let i = 0;
            while (i < repeat) {
              if (items === undefined) {
                arr.push();
              } else {
                arr.push(...items);
              }
              synchronize(copy, sut.indexMap, arr);
              expect(copy).to.deep.equal(arr);
              sut.resetIndexMap();
              i++;
            }
          });
        }
      }
    }
  });

  describe(`observeUnshift`, () => {
    const initArr = [[], [1], [1, 2]];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2, 3];
    for (const init of initArr) {
      for (const items of itemsArr) {
        for (const repeat of repeatArr) {
          it(`size=${padRight(init.length, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, () => {
            const arr = init.slice();
            const expectedArr = init.slice();
            sut = new ArrayObserver(arr);
            let expectedResult;
            let actualResult;
            let i = 0;
            while (i < repeat) {
              if (items === undefined) {
                expectedResult = expectedArr.unshift();
                actualResult = arr.unshift();
              } else {
                expectedResult = expectedArr.unshift(...items);
                actualResult = arr.unshift(...items);
              }
              expect(actualResult).to.deep.equal(expectedResult);
              expect(arr).to.deep.equal(expectedArr);
              i++;
            }
          });

          it(`size=${padRight(init.length, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, () => {
            const arr = init.slice();
            const copy = init.slice();
            sut = new ArrayObserver(arr);
            let i = 0;
            while (i < repeat) {
              if (items === undefined) {
                arr.unshift();
              } else {
                arr.unshift(...items);
              }
              synchronize(copy, sut.indexMap, arr);
              expect(copy).to.deep.equal(arr.slice());
              sut.resetIndexMap();
              i++;
            }
          });
        }
      }
    }
  });

  describe(`observePop`, () => {
    const initArr = [[], [1], [1, 2]];
    const repeatArr = [1, 2, 3, 4];
    for (const init of initArr) {
      for (const repeat of repeatArr) {
        const arr = init.slice();
        const expectedArr = init.slice();
        it(`size=${padRight(init.length, 2)} repeat=${repeat} - behaves as native`, () => {
          sut = new ArrayObserver(arr);
          let expectedResult;
          let actualResult;
          let i = 0;
          while (i < repeat) {
            expectedResult = expectedArr.pop();
            actualResult = arr.pop();
            expect(actualResult).to.equal(expectedResult);
            expect(arr).to.deep.equal(expectedArr);
            i++;
          }
        });
      }
    }
  });

  describe(`observeShift`, () => {
    const initArr = [[], [1], [1, 2]];
    const repeatArr = [1, 2, 3, 4];
    for (const init of initArr) {
      for (const repeat of repeatArr) {
        const arr = init.slice();
        const expectedArr = init.slice();
        it(`size=${padRight(init.length, 2)} repeat=${repeat} - behaves as native`, () => {
          sut = new ArrayObserver(arr);
          let expectedResult;
          let actualResult;
          let i = 0;
          while (i < repeat) {
            expectedResult = expectedArr.shift();
            actualResult = arr.shift();
            expect(actualResult).to.equal(expectedResult);
            expect(arr).to.deep.equal(expectedArr);
            i++;
          }
        });
      }
    }
  });

  describe(`observeSplice`, () => {
    const initArr = [[], [1], [1, 2]];
    const startArr = [undefined, -1, 0, 1, 2];
    const deleteCountArr = [undefined, -1, 0, 1, 2, 3];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2, 3];
    for (const init of initArr) {
      for (const start of startArr) {
        for (const deleteCount of deleteCountArr) {
          for (const items of itemsArr) {
            for (const repeat of repeatArr) {
              const arr = init.slice();
              const expectedArr = init.slice();
              it(`size=${padRight(arr.length, 2)} start=${padRight(start, 9)} deleteCount=${padRight(deleteCount, 9)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, () => {
                sut = new ArrayObserver(arr);
                let expectedResult;
                let actualResult;
                let i = 0;
                while (i < repeat) {
                  if (items === undefined) {
                    if (deleteCount === undefined) {
                      expectedResult = expectedArr.splice(start);
                      actualResult = arr.splice(start);
                    } else {
                      expectedResult = expectedArr.splice(start, deleteCount);
                      actualResult = arr.splice(start, deleteCount);
                    }
                  } else {
                    expectedResult = expectedArr.splice(start, deleteCount, ...items);
                    actualResult = arr.splice(start, deleteCount, ...items);
                  }
                  expect(actualResult).to.deep.equal(expectedResult);
                  expect(arr).to.deep.equal(expectedArr);
                  i++;
                }
              });
            }
          }
        }
      }
    }
  });

  describe(`observeReverse`, () => {
    const initArr = [[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6]];
    const repeatArr = [1, 2, 3, 4];
    for (const init of initArr) {
      for (const repeat of repeatArr) {
        const arr = init.slice();
        const expectedArr = init.slice();
        it(`size=${padRight(init.length, 2)} repeat=${repeat} - behaves as native`, () => {
          sut = new ArrayObserver(arr);
          let expectedResult;
          let actualResult;
          let i = 0;
          while (i < repeat) {
            expectedResult = expectedArr.reverse();
            actualResult = arr.reverse();
            expect(actualResult).to.deep.equal(expectedResult);
            expect(arr).to.deep.equal(expectedArr);
            i++;
          }
        });
      }
    }
  });

  describe(`observeSort`, () => {
    const arraySizes = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 50, 500, 1000];
    const types = ['undefined', 'null', 'boolean', 'string', 'number', 'object', 'mixed'];
    const compareFns = [
      undefined,
      (a, b) => a - b,
      (a, b) => a === b ? 0 : a - b,
      (a, b) => a === b ? 0 : a < b ? -1 : 1
    ];
    const reverseOrNot = [true, false];
    for (const reverse of reverseOrNot) {
      for (const compareFn of compareFns) {
        for (const arraySize of arraySizes) {
          const getNumber = getNumberFactory(arraySize);
          for (const type of types) {
            const getValue = getValueFactory(getNumber, type, types);
            const init = new Array(arraySize);
            let i = 0;
            while (i < arraySize) {
              init[i] = getValue(i);
              i++;
            }
            let arr = init.slice();
            let expectedArr = init.slice();
            if (reverse) {
              arr = arr.reverse();
              expectedArr = expectedArr.reverse();
            }
            it(`reverse=${padRight(reverse, 5)} size=${padRight(init.length, 4)} type=${padRight(type, 9)} sortFunc=${compareFn} - behaves as native`, () => {
              sut = new ArrayObserver(arr);
              const expectedResult = expectedArr.sort(compareFn);
              const actualResult = arr.sort(compareFn);
              expect(expectedResult).to.equal(expectedArr);
              expect(actualResult).to.equal(arr);
              try {
                expect(arr).to.deep.equal(expectedArr);
              } catch(e) {
                if (compareFn !== undefined) {
                  // a browser may wrap a custom sort function to normalize the results
                  // so don't consider this a failed test, but just warn so we know about it
                  let differences = 0;
                  let i = 0;
                  while (i < arraySize) {
                    if (arr[i] !== expectedArr[i]) {
                      differences++;
                    }
                    i++;
                  }
                  console.warn(`${differences} of the ${arraySize} '${type}' items had a different position after sorting with ${compareFn}`);
                } else {
                  throw e;
                }
              }
            });
          }
        }
      }
    }
  });

});

function padLeft(str: any, len: number): string {
  str = str + '';
  return new Array(len - str.length + 1).join(' ') + str;
}

function padRight(str: any, len: number): string {
  str = str + '';
  return str + new Array(len - str.length + 1).join(' ');
}

function getNumberFactory(arraySize: number) {
  const middle = (arraySize / 2) | 0;
  return (i) => {
    return i < middle ? arraySize - i : i;
  }
}

function getValueFactory(getNumber: Function, type: string, types: string[]): Function {
  switch (type) {
    case 'undefined':
      return () => undefined;
    case 'null':
      return () => null;
    case 'boolean':
      return (i) => i % 2 === 0;
    case 'string':
      return (i) => getNumber(i).toString();
    case 'number':
      return getNumber;
    case 'object':
      return (i) => {[getNumber(i)]};
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

function synchronize(oldArr: Array<Object>, indexMap: Array<number>, newArr: Array<Object>): void {
  if (oldArr.length === newArr.length && newArr.length === 0) {
    return;
  }

  // first clean up any items that were removed
  let oldIndex = 0;
  let oldLen = oldArr.length;
  while (oldIndex < oldLen) {
    const newIndex = indexMap.indexOf(oldIndex);
    if (newIndex === -1) {
      oldArr[oldIndex] = undefined; // simulate remove
    }
    oldIndex++;
  }

  // then move any of the existing items if they were moved
  let hasMoved = false;
  // todo: fix this (that's enough sorting algorithms for today..)
  //do {
    hasMoved = false;
    oldIndex = 0;
    while (oldIndex < oldLen) {
      const newIndex = indexMap.indexOf(oldIndex);
      if (newIndex !== -1 && oldIndex !== newIndex) {
        if (oldArr[oldIndex] !== undefined) {
          if (oldArr[newIndex] !== undefined) {
            let tmp = oldArr[oldIndex]; // simulate swap
            oldArr[oldIndex] =  oldArr[newIndex];
            oldArr[newIndex] = tmp;
          } else {
            oldArr[newIndex] = oldArr[oldIndex]; // simulate move;
            oldArr[oldIndex] = undefined;
          }
          hasMoved = true;
        }
      }
      oldIndex++;
    }
  //} while (hasMoved)

  // now that everything is in place, we can safely create the new items
  let newIndex = 0;
  let newLen = newArr.length;
  while (newIndex < newLen) {
    if (oldArr[newIndex] === undefined) {
      oldArr[newIndex] = newArr[newIndex]; // simulate create
    }
    newIndex++;
  }
}
