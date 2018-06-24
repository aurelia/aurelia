import { ArrayObserver, MutationType } from './../../../src/runtime/binding/array-observer';
import { expect } from 'chai';

const a = MutationType.add;
const d = MutationType.delete;
const u = MutationType.update;
const n = MutationType.none;

describe(`ArrayObserver`, () => {
  let sut: ArrayObserver;

  afterEach(() => {
    sut.dispose();
  });

  describe(`observePush should work like native push`, () => {
    const initArr = [[], [1], [1, 2]];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2, 3];
    for (const init of initArr) {
      for (const items of itemsArr) {
        for (const repeat of repeatArr) {
          const arr = init.slice();
          const expectedArr = init.slice();
          it(`size=${padRight(init.length, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat}`, () => {
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
        }
      }
    }
  });

  describe(`observePush should track changes`, () => {
    const tests = [
      {
        init: [],
        items: [1],
        changes: [a]
      },
      {
        init: [],
        items: [1, 2],
        changes: [a, a]
      },
      {
        init: [1, 2],
        items: [3],
        changes: [n, n, a]
      },
      {
        init: [1, 2],
        items: [3, 4],
        changes: [n, n, a, a]
      }
    ];

    for (const { init, items, changes } of tests) {
      const arr = init.slice();
      it(`size=${padRight(init.length, 2)} itemCount=${items.length}`, () => {
        sut = new ArrayObserver(arr);
        arr.push(...items);
        expect(sut.changeSets[sut.mutationCount - 1]).to.deep.equal(new Uint16Array(changes));
      });
    }
  });

  describe(`observeUnshift should work like native unshift`, () => {
    const initArr = [[], [1], [1, 2]];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2, 3];
    for (const init of initArr) {
      for (const items of itemsArr) {
        for (const repeat of repeatArr) {
          const arr = init.slice();
          const expectedArr = init.slice();
          it(`size=${padRight(init.length, 2)} items=${padRight(items && items.length, 9)} repeat=${repeat}`, () => {
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
        }
      }
    }
  });

  describe(`observeUnshift should track changes`, () => {
    const tests = [
      {
        init: [],
        items: [1],
        changes: [a]
      },
      {
        init: [],
        items: [1, 2],
        changes: [a, a]
      },
      {
        init: [1, 2],
        items: [3],
        changes: [a, n, n]
      },
      {
        init: [1, 2],
        items: [3, 4],
        changes: [a, a, n, n]
      }
    ];

    for (const { init, items, changes } of tests) {
      const arr = init.slice();
      it(`size=${padRight(init.length, 2)} itemCount=${items.length}`, () => {
        sut = new ArrayObserver(arr);
        arr.unshift(...items);
        expect(sut.changeSets[sut.mutationCount - 1]).to.deep.equal(new Uint16Array(changes));
      });
    }
  });

  describe(`observePop should work like native pop`, () => {
    const initArr = [[], [1], [1, 2]];
    const repeatArr = [1, 2, 3, 4];
    for (const init of initArr) {
      for (const repeat of repeatArr) {
        const arr = init.slice();
        const expectedArr = init.slice();
        it(`size=${padRight(init.length, 2)} repeat=${repeat}`, () => {
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

  describe('observePop should track changes', () => {
    const tests = [
      {
        init: [],
        changes: []
      },
      {
        init: [1],
        changes: [d]
      },
      {
        init: [1, 2],
        changes: [n, d]
      },
      {
        init: [1, 2, 3],
        changes: [n, n, d]
      }
    ];

    for (const { init, changes } of tests) {
      const arr = init.slice();
      it(`size=${init.length}`, () => {
        sut = new ArrayObserver(arr);
        arr.pop();
        if (init.length) {
          expect(sut.mutationCount).to.equal(1);
          expect(sut.changeSets[sut.mutationCount - 1]).to.deep.equal(new Uint16Array(changes));
        } else {
          expect(sut.mutationCount).to.equal(0);
        }
      });
    }
  });

  describe(`observeShift should work like native shift`, () => {
    const initArr = [[], [1], [1, 2]];
    const repeatArr = [1, 2, 3, 4];
    for (const init of initArr) {
      for (const repeat of repeatArr) {
        const arr = init.slice();
        const expectedArr = init.slice();
        it(`size=${padRight(init.length, 2)} repeat=${repeat}`, () => {
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

  describe('observeShift should track changes', () => {
    const tests = [
      {
        init: [],
        changes: []
      },
      {
        init: [1],
        changes: [d]
      },
      {
        init: [1, 2],
        changes: [d, n]
      },
      {
        init: [1, 2, 3],
        changes: [d, n, n]
      }
    ];

    for (const { init, changes } of tests) {
      const arr = init.slice();
      it(`size=${init.length}`, () => {
        sut = new ArrayObserver(arr);
        arr.shift();
        if (init.length) {
          expect(sut.mutationCount).to.equal(1);
          expect(sut.changeSets[sut.mutationCount - 1]).to.deep.equal(new Uint16Array(changes));
        } else {
          expect(sut.mutationCount).to.equal(0);
        }
      });
    }
  });

  describe(`observeSplice should work like native splice`, () => {
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
              it(`size=${padRight(arr.length, 2)} start=${padRight(start, 9)} deleteCount=${padRight(deleteCount, 9)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat}`, () => {
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

  describe(`observeReverse should work like native reverse`, () => {
    const initArr = [[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6]];
    const repeatArr = [1, 2, 3, 4];
    for (const init of initArr) {
      for (const repeat of repeatArr) {
        const arr = init.slice();
        const expectedArr = init.slice();
        it(`size=${padRight(init.length, 2)} repeat=${repeat}`, () => {
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

  describe(`observeSort should work like native sort`, () => {
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
            it(`reverse=${padRight(reverse, 5)} size=${padRight(init.length, 4)} type=${padRight(type, 9)} sortFunc=${compareFn}`, () => {
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

function padLeft(str, len) {
  str = str + '';
  return new Array(len - str.length + 1).join(' ') + str;
}

function padRight(str, len) {
  str = str + '';
  return str + new Array(len - str.length + 1).join(' ');
}

function getNumberFactory(arraySize) {
  const middle = (arraySize / 2) | 0;
  return (i) => {
    return i < middle ? arraySize - i : i;
  }
}

function getValueFactory(getNumber, type, types) {
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
