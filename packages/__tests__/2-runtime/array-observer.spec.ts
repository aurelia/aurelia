import {
  ArrayObserver,
  copyIndexMap,
  disableArrayObservation,
  enableArrayObservation,
  ICollectionSubscriber,
  IndexMap,
  applyMutationsToIndices,
  synchronizeIndices,
  batch,
  Collection,
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

  public handleCollectionChange(collection: Collection, indexMap: IndexMap): void {
    indexMap = applyMutationsToIndices(indexMap);

    const newArr = this.newArr;
    const oldArr = this.oldArr;

    const deleted = indexMap.deletedIndices;
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

  describe('should allow subscribing for batched notification', function () {
    const observerMap = new WeakMap<unknown[], ArrayObserver>();
    function verifyChanges(arr: number[], fn: (arr: number[]) => void, existing: number[], deletedIndices?: number[], deletedItems?: number[]) {
      const s = new SpySubscriber();
      const sut = observerMap.get(arr) ?? (observerMap.set(arr, new ArrayObserver(arr)).get(arr));
      sut.subscribe(s);

      batch(() => {
        fn(arr);
      });

      assert.deepStrictEqual(
        s.collectionChanges.pop(),
        new CollectionChangeSet(0, copyIndexMap(existing, deletedIndices, deletedItems)),
      );
    }

    function verifyNoChanges(arr: number[], fn: (arr: number[]) => void) {
      const s = new SpySubscriber();
      const sut = new ArrayObserver(arr);
      sut.subscribe(s);

      batch(() => {
        fn(arr);
      });

      assert.strictEqual(s.collectionChanges.length, 0);
    }

    function asc(a: number, b: number) {
      if (a === b) return 0;
      return a > b ? 1 : -1;
    }
    function desc(a: number, b: number) {
      if (a === b) return 0;
      return a > b ? -1 : 1;
    }

    describe('empty array', function () {
      it('2x push', function () {
        verifyChanges([], arr => {
          arr.push(1);
          arr.push(2);
        }, [-2, -2]);
      });

      it('2x unshift', function () {
        verifyChanges([], arr => {
          arr.unshift(1);
          arr.unshift(2);
        }, [-2, -2]);
      });

      it('2x push + 2x unshift', function () {
        verifyChanges([], arr => {
          arr.push(1);
          arr.push(2);
          arr.unshift(3);
          arr.unshift(4);
        }, [-2, -2, -2, -2]);
      });

      it('push + pop', function () {
        verifyNoChanges([], arr => {
          arr.push(1);
          arr.pop();
        });
      });

      it('unshift + shift', function () {
        verifyNoChanges([], arr => {
          arr.unshift(1);
          arr.shift();
        });
      });

      it('push + push + pop', function () {
        verifyChanges([], arr => {
          arr.push(1);
          arr.push(2);
          arr.pop();
        }, [-2]);
      });
    });

    describe('array w/ 1 item', function () {
      it('2x push', function () {
        verifyChanges([1], arr => {
          arr.push(2);
          arr.push(3);
        }, [0, -2, -2]);
      });

      it('2x unshift', function () {
        verifyChanges([1], arr => {
          arr.unshift(2);
          arr.unshift(3);
        }, [-2, -2, 0]);
      });

      it('2x push + 2x unshift', function () {
        verifyChanges([1], arr => {
          arr.push(2);
          arr.push(3);
          arr.unshift(4);
          arr.unshift(5);
        }, [-2, -2, 0, -2, -2]);
      });

      it('push + pop', function () {
        verifyNoChanges([1], arr => {
          arr.push(2);
          arr.pop();
        });
      });

      it('unshift + shift', function () {
        verifyNoChanges([1], arr => {
          arr.unshift(2);
          arr.shift();
        });
      });

      it('push + push + pop', function () {
        verifyChanges([1], arr => {
          arr.push(2);
          arr.push(3);
          arr.pop();
        }, [0, -2]);
      });

      it('push + shift', function () {
        verifyChanges([1], arr => {
          arr.push(2);
          arr.shift();
        }, [-2], [0], [1]);
      });

      it('push + push + shift', function () {
        verifyChanges([1], arr => {
          arr.push(2);
          arr.push(3);
          arr.shift();
        }, [-2, -2], [0], [1]);
      });

      it('push + splice(0, 2, 3, 4)', function () {
        verifyChanges([1], arr => {
          arr.push(2);
          arr.splice(0, 2, 3, 4);
        }, [-2, -2], [0], [1]);
      });

      it('splice(1, 0, 2) + splice(1, 1)', function () {
        verifyNoChanges([1], arr => {
          arr.splice(1, 0, 2);
          arr.splice(1, 1);
        });
      });
    });

    describe('array w/ 2 item', function () {
      it('2x push', function () {
        verifyChanges([1, 2], arr => {
          arr.push(3);
          arr.push(4);
        }, [0, 1, -2, -2]);
      });

      it('2x unshift', function () {
        verifyChanges([1, 2], arr => {
          arr.unshift(3);
          arr.unshift(4);
        }, [-2, -2, 0, 1]);
      });

      it('2x push + 2x unshift', function () {
        verifyChanges([1, 2], arr => {
          arr.push(3);
          arr.push(4);
          arr.unshift(5);
          arr.unshift(6);
        }, [-2, -2, 0, 1, -2, -2]);
      });

      it('push + pop', function () {
        verifyNoChanges([1, 2], arr => {
          arr.push(3);
          arr.pop();
        });
      });

      it('unshift + shift', function () {
        verifyNoChanges([1, 2], arr => {
          arr.unshift(3);
          arr.shift();
        });
      });

      it('push + push + pop', function () {
        verifyChanges([1, 2], arr => {
          arr.push(3);
          arr.push(4);
          arr.pop();
        }, [0, 1, -2]);
      });

      it('push + shift', function () {
        verifyChanges([1, 2], arr => {
          arr.push(3);
          arr.shift();
        }, [1, -2], [0], [1]);
      });

      it('push + push + shift', function () {
        verifyChanges([1, 2], arr => {
          arr.push(3);
          arr.push(4);
          arr.shift();
        }, [1, -2, -2], [0], [1]);
      });

      it('push + splice(0, 2, 4, 5)', function () {
        verifyChanges([1, 2], arr => {
          arr.push(3);
          arr.splice(0, 2, 4, 5);
        }, [-2, -2, -2], [0, 1], [1, 2]);
      });

      it('splice(1, 0, 2) + splice(1, 1)', function () {
        verifyNoChanges([1, 3], arr => {
          arr.splice(1, 0, 2);
          arr.splice(1, 1);
        });
      });

      it('push + reverse', function () {
        verifyChanges([1, 2], arr => {
          arr.push(3);
          arr.reverse();
        }, [-2, 1, 0]);
      });

      it('reverse + reverse', function () {
        verifyNoChanges([1, 2], arr => {
          arr.reverse();
          arr.reverse();
        });
      });

      it('reverse + reverse + reverse', function () {
        verifyChanges([1, 2], arr => {
          arr.reverse();
          arr.reverse();
          arr.reverse();
        }, [1, 0]);
      });

      it('push + sort(a>b?-1:1)', function () {
        verifyChanges([1, 2], arr => {
          arr.push(3);
          arr.sort(desc);
        }, [-2, 1, 0]);
      });

      it('push + sort(asc)', function () {
        verifyChanges([1, 2], arr => {
          arr.push(3);
          arr.sort(asc);
        }, [0, 1, -2]);
      });

      it('sort(a>b?-1:1) + sort(asc)', function () {
        verifyNoChanges([1, 2], arr => {
          arr.sort(desc);
          arr.sort(asc);
        });
      });

      it('sort(a>b?-1:1) + sort(asc) + sort(a>b?-1:1)', function () {
        verifyChanges([1, 2], arr => {
          arr.sort(desc);
          arr.sort(asc);
          arr.sort(desc);
        }, [1, 0]);
      });
    });

    describe('array w/ 4 item', function () {
      // note: these tests were failing on synchronization during implementation but succeeded here; the error was in the applyMutationsToIndices
      it('splice the first three items each with two new items in reverse order', function () {
        verifyChanges([1, 2, 3, 4], arr => {
          arr.splice(2, 1, 5, 6); // 1, 2, [5], [6], 4
          arr.splice(1, 1, 3, 4); // 1, [3], [4], [5], [6], 4
          arr.splice(0, 1, 1, 2); // [1], [2], [3], [4], [5], [6], 4
        }, [-2, -2, -2, -2, -2, -2, 3], [2, 1, 0], [3, 2, 1]);
      });

      it('splice the first two items each with two new items in reverse order', function () {
        verifyChanges([1, 2, 3, 4], arr => {
          arr.splice(1, 1, 3, 4); // 1, [3], [4], 3, 4
          arr.splice(0, 1, 1, 2); // [1], [2], [3], [4], 3, 4
        }, [-2, -2, -2, -2, 2, 3], [1, 0], [2, 1]);
      });

      it('splice the middle two items each with two new items in reverse order', function () {
        verifyChanges([1, 2, 3, 4], arr => {
          arr.splice(2, 1, 3, 4); // 1, 2, [3], [4], 4
          arr.splice(1, 1, 1, 2); // 1, [1], [2], [3], [4], 4
        }, [0, -2, -2, -2, -2, 3], [2, 1], [3, 2]);
      });

      it('splice the first and third items each with two new items in reverse order', function () {
        verifyChanges([1, 2, 3, 4], arr => {
          arr.splice(2, 1, 5, 6); // 1, 2, [5], [6], 4
          arr.splice(0, 1, 7, 8); // [7], [8], 2, [5], [6], 4
        }, [-2, -2, 1, -2, -2, 3], [2, 0], [3, 1]);
      });

      it('splice the second and fourth items each with two new items in reverse order', function () {
        verifyChanges([1, 2, 3, 4], arr => {
          arr.splice(3, 1, 5, 6); // 1, 2, 3, [5], [6]
          arr.splice(1, 1, 7, 8); // 1, [7], [8], 3, [5], [6]
        }, [0, -2, -2, 2, -2, -2], [3, 1], [4, 2]);
      });
    });

    it('works with double nested batch', function () {
      const arr = [1, 2, 3];
      const o = new ArrayObserver(arr);
      let map: IndexMap;
      let callCount = 0;
      o.subscribe({
        handleCollectionChange(_collection, indexMap) {
          map = indexMap;
          callCount++;
        },
      });
      batch(() => {
        arr.splice(1, 1, 5);
        assert.deepStrictEqual(arr, [1, 5, 3]);
        batch(() => {
          arr.splice(0, 1, 7);
        });
        assert.strictEqual(callCount, 1);
        assert.deepStrictEqual(arr, [7, 5, 3]);
        assert.deepStrictEqual(
          map,
          Object.assign([-2, -2, 2], { deletedIndices: [1, 0], deletedItems: [2, 1], isIndexMap: true })
        );
      });
      assert.strictEqual(callCount, 2);
      assert.deepStrictEqual(
        map,
        Object.assign([-2, -2, 2], { deletedIndices: [1, 0], deletedItems: [2, 1], isIndexMap: true })
      );
    });
  });

  describe('should allow unsubscribing for batched notification', function () {
    it('push', function () {
      const s = new SpySubscriber();
      const arr = [];
      sut = new ArrayObserver(arr);
      sut.subscribe(s);
      sut.unsubscribe(s);
      batch(() => {
        arr.push(1);
      });
      assert.strictEqual(s.collectionChanges.length, 0);
    });
  });

  describe('should not notify batched subscribers if there are no changes', function () {
    it('push', function () {
      const s = new SpySubscriber();
      const arr = [];
      sut = new ArrayObserver(arr);
      batch(() => { /* do nothing */ });
      assert.strictEqual(s.collectionChanges.length, 0);
    });
  });

  describe('synchronize batched indexMap changes', function () {
    function verifyChanges(arr: symbol[], fn: (arr: symbol[]) => void) {
      const copy = arr.slice();
      const s = new SynchronizingCollectionSubscriber(copy, arr);
      const sut = new ArrayObserver(arr);
      sut.subscribe(s);

      batch(() => {
        fn(arr);
      });

      assert.deepStrictEqual(copy, arr);
    }

    function asc(a: symbol, b: symbol) {
      const $a = a.toString();
      const $b = b.toString();
      if ($a === $b) return 0;
      return $a > $b ? 1 : -1;
    }
    function desc(a: symbol, b: symbol) {
      const $a = a.toString();
      const $b = b.toString();
      if ($a === $b) return 0;
      return $a > $b ? -1 : 1;
    }

    const S = Symbol;

    describe('empty array', function () {
      it('2x push', function () {
        verifyChanges([], arr => {
          arr.push(S(1));
          arr.push(S(2));
        });
      });

      it('2x unshift', function () {
        verifyChanges([], arr => {
          arr.unshift(S(1));
          arr.unshift(S(2));
        });
      });

      it('2x push + 2x unshift', function () {
        verifyChanges([], arr => {
          arr.push(S(1));
          arr.push(S(2));
          arr.unshift(S(3));
          arr.unshift(S(4));
        });
      });

      it('push + pop', function () {
        verifyChanges([], arr => {
          arr.push(S(1));
          arr.pop();
        });
      });

      it('unshift + shift', function () {
        verifyChanges([], arr => {
          arr.unshift(S(1));
          arr.shift();
        });
      });

      it('push + push + pop', function () {
        verifyChanges([], arr => {
          arr.push(S(1));
          arr.push(S(2));
          arr.pop();
        });
      });
    });

    describe('array w/ 1 item', function () {
      it('2x push', function () {
        verifyChanges([S(1)], arr => {
          arr.push(S(2));
          arr.push(S(3));
        });
      });

      it('2x unshift', function () {
        verifyChanges([S(1)], arr => {
          arr.unshift(S(2));
          arr.unshift(S(3));
        });
      });

      it('2x push + 2x unshift', function () {
        verifyChanges([S(1)], arr => {
          arr.push(S(2));
          arr.push(S(3));
          arr.unshift(S(4));
          arr.unshift(S(5));
        });
      });

      it('push + pop', function () {
        verifyChanges([S(1)], arr => {
          arr.push(S(2));
          arr.pop();
        });
      });

      it('unshift + shift', function () {
        verifyChanges([S(1)], arr => {
          arr.unshift(S(2));
          arr.shift();
        });
      });

      it('push + push + pop', function () {
        verifyChanges([S(1)], arr => {
          arr.push(S(2));
          arr.push(S(3));
          arr.pop();
        });
      });

      it('push + shift', function () {
        verifyChanges([S(1)], arr => {
          arr.push(S(2));
          arr.shift();
        });
      });

      it('push + push + shift', function () {
        verifyChanges([S(1)], arr => {
          arr.push(S(2));
          arr.push(S(3));
          arr.shift();
        });
      });

      it('push + splice(0, 2, 3, 4)', function () {
        verifyChanges([S(1)], arr => {
          arr.push(S(2));
          arr.splice(0, 2, S(3), S(4));
        });
      });

      it('splice(1, 0, 2) + splice(1, 1)', function () {
        verifyChanges([S(1)], arr => {
          arr.splice(1, 0, S(2));
          arr.splice(1, 1);
        });
      });
    });

    describe('array w/ 2 item', function () {
      it('2x push', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.push(S(3));
          arr.push(S(4));
        });
      });

      it('2x unshift', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.unshift(S(3));
          arr.unshift(S(4));
        });
      });

      it('2x push + 2x unshift', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.push(S(3));
          arr.push(S(4));
          arr.unshift(S(5));
          arr.unshift(S(6));
        });
      });

      it('push + pop', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.push(S(3));
          arr.pop();
        });
      });

      it('unshift + shift', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.unshift(S(3));
          arr.shift();
        });
      });

      it('push + push + pop', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.push(S(3));
          arr.push(S(4));
          arr.pop();
        });
      });

      it('push + shift', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.push(S(3));
          arr.shift();
        });
      });

      it('push + push + shift', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.push(S(3));
          arr.push(S(4));
          arr.shift();
        });
      });

      it('push + splice(0, 2, 3, 4)', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.push(S(3));
          arr.splice(0, 2, S(4), S(5));
        });
      });

      it('splice(1, 0, 2) + splice(1, 1)', function () {
        verifyChanges([S(1), S(3)], arr => {
          arr.splice(1, 0, S(2));
          arr.splice(1, 1);
        });
      });

      it('push + reverse', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.push(S(3));
          arr.reverse();
        });
      });

      it('reverse + reverse', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.reverse();
          arr.reverse();
        });
      });

      it('reverse + reverse + reverse', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.reverse();
          arr.reverse();
          arr.reverse();
        });
      });

      it('push + sort(desc)', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.push(S(3));
          arr.sort(desc);
        });
      });

      it('push + sort(asc)', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.push(S(3));
          arr.sort(asc);
        });
      });

      it('sort(desc) + sort(asc)', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.sort(desc);
          arr.sort(asc);
        });
      });

      it('sort(desc) + sort(asc) + sort(desc)', function () {
        verifyChanges([S(1), S(2)], arr => {
          arr.sort(desc);
          arr.sort(asc);
          arr.sort(desc);
        });
      });
    });

    describe('array w/ 3 item', function () {
      it('2x push', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.push(S(4));
          arr.push(S(5));
        });
      });

      it('2x unshift', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.unshift(S(4));
          arr.unshift(S(5));
        });
      });

      it('2x push + 2x unshift', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.push(S(4));
          arr.push(S(5));
          arr.unshift(S(6));
          arr.unshift(S(7));
        });
      });

      it('push + pop', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.push(S(4));
          arr.pop();
        });
      });

      it('unshift + shift', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.unshift(S(4));
          arr.shift();
        });
      });

      it('push + push + pop', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.push(S(4));
          arr.push(S(5));
          arr.pop();
        });
      });

      it('push + shift', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.push(S(4));
          arr.shift();
        });
      });

      it('push + push + shift', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.push(S(4));
          arr.push(S(5));
          arr.shift();
        });
      });

      it('push + splice(0, 2, 5, 6)', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.push(S(4));
          arr.splice(0, 2, S(5), S(6));
        });
      });

      it('splice(1, 0, 2) + splice(1, 1)', function () {
        verifyChanges([S(1), S(3), S(4)], arr => {
          arr.splice(1, 0, S(2));
          arr.splice(1, 1);
        });
      });

      it('splice(1, 0, 2, 3) + splice(1, 1)', function () {
        verifyChanges([S(1), S(4), S(5)], arr => {
          arr.splice(1, 0, S(2), S(3));
          arr.splice(1, 1);
        });
      });

      it('splice each item with two new items', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.splice(0, 1, S(1), S(2));
          arr.splice(2, 1, S(3), S(4));
          arr.splice(4, 1, S(5), S(6));
        });
      });

      it('splice each item with two new items and sort asc in-between', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.splice(0, 1, S(1), S(2));
          arr.sort(asc);
          arr.splice(2, 1, S(3), S(4));
          arr.sort(asc);
          arr.splice(4, 1, S(5), S(6));
          arr.sort(asc);
        });
      });

      it('splice each item with two new items and sort desc in-between', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.splice(0, 1, S(1), S(2));
          arr.sort(desc);
          arr.splice(2, 1, S(3), S(4));
          arr.sort(desc);
          arr.splice(4, 1, S(5), S(6));
          arr.sort(desc);
        });
      });

      it('splice each item with two new items and sort alternating asc & desc in-between', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.splice(0, 1, S(1), S(2));
          arr.sort(asc);
          arr.splice(2, 1, S(3), S(4));
          arr.sort(desc);
          arr.splice(4, 1, S(5), S(6));
          arr.sort(asc);
        });
      });

      it('splice the first two items each with two new items in reverse order', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.splice(1, 1, S(4), S(5));
          arr.splice(0, 1, S(6), S(7));
        });
      });

      it('splice each item with two new items in reverse order', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.splice(2, 1, S(5), S(6));
          arr.splice(1, 1, S(3), S(4));
          arr.splice(0, 1, S(1), S(2));
        });
      });

      it('splice the middle item with three new items and sort asc', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.splice(1, 1, S(2), S(4), S(5));
          arr.sort(asc);
        });
      });

      it('splice the middle item with three new items and sort desc', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.splice(1, 1, S(2), S(4), S(5));
          arr.sort(desc);
        });
      });

      it('push + reverse', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.push(S(4));
          arr.reverse();
        });
      });

      it('reverse + reverse', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.reverse();
          arr.reverse();
        });
      });

      it('reverse + reverse + reverse', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.reverse();
          arr.reverse();
          arr.reverse();
        });
      });

      it('push + sort(desc)', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.push(S(4));
          arr.sort(desc);
        });
      });

      it('push + sort(asc)', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.push(S(4));
          arr.sort(asc);
        });
      });

      it('sort(desc) + sort(asc)', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.sort(desc);
          arr.sort(asc);
        });
      });

      it('sort(desc) + sort(asc) + sort(desc)', function () {
        verifyChanges([S(1), S(2), S(3)], arr => {
          arr.sort(desc);
          arr.sort(asc);
          arr.sort(desc);
        });
      });
    });

    describe('array w/ 4 item', function () {
      it('2x push', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.push(S(5));
          arr.push(S(6));
        });
      });

      it('2x unshift', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.unshift(S(5));
          arr.unshift(S(6));
        });
      });

      it('2x push + 2x unshift', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.push(S(5));
          arr.push(S(6));
          arr.unshift(S(7));
          arr.unshift(S(8));
        });
      });

      it('push + pop', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.push(S(5));
          arr.pop();
        });
      });

      it('unshift + shift', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.unshift(S(5));
          arr.shift();
        });
      });

      it('push + push + pop', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.push(S(5));
          arr.push(S(6));
          arr.pop();
        });
      });

      it('push + shift', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.push(S(5));
          arr.shift();
        });
      });

      it('push + push + shift', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.push(S(5));
          arr.push(S(6));
          arr.shift();
        });
      });

      it('push + splice(0, 2, 5, 6)', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.push(S(5));
          arr.splice(0, 2, S(6), S(7));
        });
      });

      it('splice(1, 0, 2) + splice(1, 1)', function () {
        verifyChanges([S(1), S(3), S(5), S(6)], arr => {
          arr.splice(1, 0, S(2));
          arr.splice(1, 1);
        });
      });

      it('splice(1, 0, 2, 3) + splice(1, 1)', function () {
        verifyChanges([S(1), S(5), S(6), S(7)], arr => {
          arr.splice(1, 0, S(2), S(3));
          arr.splice(1, 1);
        });
      });

      it('splice the first three items each with two new items', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(0, 1, S(1), S(2));
          arr.splice(2, 1, S(3), S(4));
          arr.splice(4, 1, S(5), S(6));
        });
      });

      it('splice the first three items each with two new items and sort asc in-between', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(0, 1, S(5), S(6));
          arr.sort(asc);
          arr.splice(2, 1, S(7), S(8));
          arr.sort(asc);
          arr.splice(4, 1, S(9), S(10));
          arr.sort(asc);
        });
      });

      it('splice the first three items each with two new items and sort desc in-between', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(0, 1, S(5), S(6));
          arr.sort(desc);
          arr.splice(2, 1, S(7), S(8));
          arr.sort(desc);
          arr.splice(4, 1, S(9), S(10));
          arr.sort(desc);
        });
      });

      it('splice the first three items each with two new items and sort alternating asc & desc in-between', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(0, 1, S(5), S(6));
          arr.sort(asc);
          arr.splice(2, 1, S(7), S(8));
          arr.sort(desc);
          arr.splice(4, 1, S(9), S(10));
          arr.sort(asc);
        });
      });

      it('splice the first three items each with two new items in reverse order', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(2, 1, S(5), S(6));
          arr.splice(1, 1, S(3), S(4));
          arr.splice(0, 1, S(1), S(2));
        });
      });

      it('splice the last three items each with two new items in reverse order', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(3, 1, S(5), S(6));
          arr.splice(2, 1, S(3), S(4));
          arr.splice(1, 1, S(1), S(2));
        });
      });

      it('splice the first two items each with two new items in reverse order', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(1, 1, S(5), S(6));
          arr.splice(0, 1, S(7), S(8));
        });
      });

      it('splice the middle two items each with two new items in reverse order', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(2, 1, S(5), S(6));
          arr.splice(1, 1, S(7), S(8));
        });
      });

      it('splice the last two items each with two new items in reverse order', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(3, 1, S(5), S(6));
          arr.splice(2, 1, S(7), S(8));
        });
      });

      it('splice the first and third items each with two new items in reverse order', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(2, 1, S(5), S(6));
          arr.splice(0, 1, S(7), S(8));
        });
      });

      it('splice the second and fourth items each with two new items in reverse order', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(3, 1, S(5), S(6));
          arr.splice(1, 1, S(7), S(8));
        });
      });

      it('splice each item with two new items', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(0, 1, S(1), S(2));
          arr.splice(2, 1, S(3), S(4));
          arr.splice(4, 1, S(5), S(6));
          arr.splice(6, 1, S(7), S(8));
        });
      });

      it('splice each item with two new items and sort asc in-between', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(0, 1, S(5), S(6));
          arr.sort(asc);
          arr.splice(2, 1, S(7), S(8));
          arr.sort(asc);
          arr.splice(4, 1, S(9), S(10));
          arr.sort(asc);
          arr.splice(6, 1, S(11), S(12));
          arr.sort(asc);
        });
      });

      it('splice each item with two new items and sort desc in-between', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(0, 1, S(5), S(6));
          arr.sort(desc);
          arr.splice(2, 1, S(7), S(8));
          arr.sort(desc);
          arr.splice(4, 1, S(9), S(10));
          arr.sort(desc);
          arr.splice(6, 1, S(11), S(12));
          arr.sort(desc);
        });
      });

      it('splice each item with two new items and sort alternating asc & desc in-between', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(0, 1, S(5), S(6));
          arr.sort(asc);
          arr.splice(2, 1, S(7), S(8));
          arr.sort(desc);
          arr.splice(4, 1, S(9), S(10));
          arr.sort(asc);
          arr.splice(6, 1, S(11), S(12));
          arr.sort(desc);
        });
      });

      it('splice each item with two new items in reverse order', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(3, 1, S(7), S(8));
          arr.splice(2, 1, S(5), S(6));
          arr.splice(1, 1, S(3), S(4));
          arr.splice(0, 1, S(1), S(2));
        });
      });

      it('splice the middle item with three new items and sort asc', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(1, 1, S(2), S(5), S(6));
          arr.sort(asc);
        });
      });

      it('splice the middle item with three new items and sort desc', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.splice(1, 1, S(2), S(5), S(6));
          arr.sort(desc);
        });
      });

      it('push + reverse', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.push(S(5));
          arr.reverse();
        });
      });

      it('reverse + reverse', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.reverse();
          arr.reverse();
        });
      });

      it('reverse + reverse + reverse', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.reverse();
          arr.reverse();
          arr.reverse();
        });
      });

      it('push + sort(desc)', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.push(S(5));
          arr.sort(desc);
        });
      });

      it('push + sort(asc)', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.push(S(5));
          arr.sort(asc);
        });
      });

      it('sort(desc) + sort(asc)', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.sort(desc);
          arr.sort(asc);
        });
      });

      it('sort(desc) + sort(asc) + sort(desc)', function () {
        verifyChanges([S(1), S(2), S(3), S(4)], arr => {
          arr.sort(desc);
          arr.sort(asc);
          arr.sort(desc);
        });
      });
    });
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
        new CollectionChangeSet(0, copyIndexMap([-2]))
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
        new CollectionChangeSet(0, copyIndexMap([-2, -2]))
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
        it(`size=${padRight(init.length, 2)} itemCount=${padRight(items?.length, 9)} repeat=${repeat} - behaves as native`, function () {
          const arr = init.slice();
          const expectedArr = init.slice();
          const newItems = items?.slice();
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

        it(`size=${padRight(init.length, 2)} itemCount=${padRight(items?.length, 9)} repeat=${repeat} - tracks changes`, function () {
          const arr = init.slice();
          const copy = init.slice();
          const newItems = items?.slice();
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
        it(`size=${padRight(init.length, 2)} itemCount=${padRight(items?.length, 9)} repeat=${repeat} - behaves as native`, function () {
          const arr = init.slice();
          const expectedArr = init.slice();
          const newItems = items?.slice();
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

        it(`size=${padRight(init.length, 2)} itemCount=${padRight(items?.length, 9)} repeat=${repeat} - tracks changes`, function () {
          const arr = init.slice();
          const copy = init.slice();
          const newItems = items?.slice();
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
        it(`size=${padRight(init.length, 2)} start=${padRight(start, 9)} deleteCount=${padRight(deleteCount, 9)} itemCount=${padRight(items?.length, 9)} repeat=${repeat} - behaves as native`, function () {
          const arr = init.slice();
          const expectedArr = init.slice();
          const newItems = items?.slice();
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

        it(`size=${padRight(init.length, 2)} start=${padRight(start, 9)} deleteCount=${padRight(deleteCount, 9)} itemCount=${padRight(items?.length, 9)} repeat=${repeat} - tracks changes`, function () {
          const arr = init.slice();
          const copy = init.slice();
          const newItems = items?.slice();
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

// function padLeft(input: unknown, len: number): string {
//   const str = `${input}`;
//   return new Array(len - str.length + 1).join(' ') + str;
// }

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
