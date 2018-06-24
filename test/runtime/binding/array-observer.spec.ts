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

  describe(`push`, () => {
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
      it(`add ${items.length} items at once to an array of size ${arr.length}`, () => {
        sut = new ArrayObserver(arr);
        arr.push(...items);
        expect(sut.changes).to.deep.equal(new Uint16Array(changes));
      });
    }

    for (const { init, items, changes } of tests) {
      const arr = init.slice();
      it(`add ${items.length} items one at a time to an array of size ${arr.length}`, () => {
        sut = new ArrayObserver(arr);
        for (const item of items) {
          arr.push(item);
        }
        expect(sut.changes).to.deep.equal(new Uint16Array(changes));
      });
    }
  });

  describe(`unshift`, () => {
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
      it(`add ${items.length} items at once to an array of size ${arr.length}`, () => {
        sut = new ArrayObserver(arr);
        arr.unshift(...items);
        expect(sut.changes).to.deep.equal(new Uint16Array(changes));
      });
    }

    for (const { init, items, changes } of tests) {
      const arr = init.slice();
      it(`add ${items.length} items one at a time to an array of size ${arr.length}`, () => {
        sut = new ArrayObserver(arr);
        for (const item of items) {
          arr.unshift(item);
        }
        expect(sut.changes).to.deep.equal(new Uint16Array(changes));
      });
    }
  });

  describe('pop', () => {
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
      it(`remove the last item from an array of size ${arr.length}`, () => {
        sut = new ArrayObserver(arr);
        arr.pop();
        expect(sut.changes).to.deep.equal(new Uint16Array(changes));
      });
    }
  });

  describe('shift', () => {
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
      it(`remove the first item from an array of size ${arr.length}`, () => {
        sut = new ArrayObserver(arr);
        arr.shift();
        expect(sut.changes).to.deep.equal(new Uint16Array(changes));
      });
    }
  });

  describe(`splice`, () => {
    const tests = [
      {
        init: [],
        start: 0,
        deleteCount: 0,
        items: [],
        changes: []
      },
      {
        init: [],
        start: 1,
        deleteCount: 0,
        items: [],
        changes: []
      },
      {
        init: [],
        start: 0,
        deleteCount: 1,
        items: [],
        changes: []
      },
      {
        init: [],
        start: 1,
        deleteCount: 1,
        items: [],
        changes: []
      },
      {
        init: [],
        start: 1,
        deleteCount: 0,
        items: [1],
        changes: [a, a]
      },
      {
        init: [],
        start: 1,
        deleteCount: 1,
        items: [1],
        changes: [a]
      },
      {
        init: [],
        start: 2,
        deleteCount: 1,
        items: [1],
        changes: [a]
      },
      {
        init: [],
        start: 1,
        deleteCount: 2,
        items: [1],
        changes: [a]
      },
      {
        init: [],
        start: 0,
        deleteCount: 0,
        items: [1],
        changes: [a]
      },
      {
        init: [],
        start: 0,
        deleteCount: 1,
        items: [1],
        changes: [a]
      },
      {
        init: [],
        start: 0,
        deleteCount: 0,
        items: [1, 2],
        changes: [a, a]
      },
      {
        init: [],
        start: 0,
        deleteCount: 1,
        items: [1, 2],
        changes: [a, a]
      },
      {
        init: [1, 2],
        start: 0,
        deleteCount: 0,
        items: [3],
        changes: [a, n, n]
      },
      // {
      //   init: [1, 2],
      //   start: 0,
      //   deleteCount: 1,
      //   items: [],
      //   changes: [d, n]
      // },
      {
        init: [1, 2],
        start: 0,
        deleteCount: 1,
        items: [3],
        changes: [u, n]
      },
      {
        init: [1, 2],
        start: 1,
        deleteCount: 0,
        items: [3],
        changes: [n, a, n]
      },
      {
        init: [1, 2],
        start: 0,
        deleteCount: 0,
        items: [3, 4],
        changes: [a, a, n, n]
      }
    ];

    for (const { init, start, deleteCount, items, changes } of tests) {
      const arr = init.slice();
      const expectedArr = init.slice();
      it(`start at ${start}, delete ${deleteCount} items, add ${items.length} items at once to an array of size ${arr.length}`, () => {
        sut = new ArrayObserver(arr);
        expect(
          arr.splice(start, deleteCount, ...items)
        ).to.deep.equal(
          expectedArr.splice(start, deleteCount, ...items)
        );
        expect(arr).to.deep.equal(expectedArr);
        expect(sut.changes).to.deep.equal(new Uint16Array(changes));
      });
    }

    for (const { init, start, deleteCount, items, changes } of tests) {
      const arr = init.slice();
      const expectedArr = init.slice();
      it(`start at ${start}, delete ${deleteCount} items, add ${items.length} items one at a time to an array of size ${arr.length}`, () => {
        sut = new ArrayObserver(arr);
        let deleted = false;
        for (const item of items) {
          expect(
            arr.splice(start, deleted ? 0 : deleteCount, item)
          ).to.deep.equal(
            expectedArr.splice(start, deleted ? 0 : deleteCount, item)
          );
          deleted = true;
        }
        expect(arr).to.deep.equal(expectedArr);
        expect(sut.changes).to.deep.equal(new Uint16Array(changes));
      });
    }
  });

});
