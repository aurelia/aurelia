import { match } from 'sinon';
import { MapObserver, enableMapObservation, disableMapObservation, nativeMapDelete, nativeSet, IndexMap } from '../../../src/index';
import { expect } from 'chai';
import { stringify, SpySubscriber } from '../util';
import { ChangeSet } from '../../../src/binding/change-set';

function assetMapEqual(actual: Map<any, any>, expected: Map<any, any>): void {
  const len = actual.size;
  expect(len).to.equal(expected.size, `expected.size=${expected.size}, actual.size=${actual.size}`);
  actual = <any>Array.from(actual);
  expected = <any>Array.from(expected);
  let i = 0;
  while (i < len) {
    if (actual[i][0] !== expected[i][0] || actual[i][1] !== expected[i][1]) {
      const start = Math.max(i - 3, 0);
      const end = Math.min(i + 3, len);
      let $actual = Array.from(actual).slice(start, end).map(stringify).join(',');
      let $expected = Array.from(expected).slice(start, end).map(stringify).join(',');
      const prefix = `[${start > 0 ? '...,' : ''}`;
      const suffix = `${end < len ? ',...' : ''}]`;
      throw new Error(`expected ${prefix}${$actual}${suffix} to equal ${prefix}${$expected}${suffix}`);
    }
    i++;
  }
}

describe(`MapObserver`, () => {
  let sut: MapObserver;

  before(() => {
    enableMapObservation();
  });

  after(() => {
    disableMapObservation();
  });

  afterEach(() => {
    if (sut) {
      sut.dispose();
    }
  });

  describe('should allow subscribing for immediate notification', () => {
    it('set', () => {
      const s = new SpySubscriber();
      const map = new Map();
      sut = new MapObserver(new ChangeSet(), map);
      sut.subscribe(s);
      map.set(1, 1);
      expect(s.handleChange).to.have.been.calledWith('set', match(x => x[0] === 1));
    });
  });

  describe('should allow unsubscribing for immediate notification', () => {
    it('set', () => {
      const s = new SpySubscriber();
      const map = new Map();
      sut = new MapObserver(new ChangeSet(), map);
      sut.subscribe(s);
      sut.unsubscribe(s);
      map.set(1, 1);
      expect(s.handleChange).not.to.have.been.called;
    });
  });

  describe('should allow subscribing for batched notification', () => {
    it('set', () => {
      const s = new SpySubscriber();
      const map = new Map();
      sut = new MapObserver(new ChangeSet(), map);
      sut.subscribeBatched(s);
      map.set(1, 1);
      const indexMap: IndexMap = sut.indexMap.slice();
      indexMap.deletedItems = sut.indexMap.deletedItems;
      sut.flushChanges();
      expect(s.handleBatchedChange).to.have.been.calledWith(indexMap);
    });
  });

  describe('should allow unsubscribing for batched notification', () => {
    it('set', () => {
      const s = new SpySubscriber();
      const map = new Map();
      sut = new MapObserver(new ChangeSet(), map);
      sut.subscribeBatched(s);
      sut.unsubscribeBatched(s);
      map.set(1, 1);
      sut.flushChanges();
      expect(s.handleBatchedChange).not.to.have.been.called;
    });
  });

  xdescribe('should not notify batched subscribers if there are no changes', () => {
    it('set', () => {
      const s = new SpySubscriber();
      const map = new Map();
      sut = new MapObserver(new ChangeSet(), map);
      sut.subscribeBatched(s);
      sut.flushChanges();
      expect(s.handleBatchedChange).not.to.have.been.called;
    });
  });

  describe(`observeSet`, () => {
    const initArr = [new Map(), new Map([[1, 1]]), new Map([[1, 1], [2, 2]])];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2];
    for (const init of initArr) {
      for (const items of itemsArr) {
        for (const repeat of repeatArr) {
          it(`size=${padRight(init.size, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, () => {
            const map = new Map(Array.from(init));
            const expectedMap = new Map(Array.from(init));
            const newItems = items && items.slice();
            sut = new MapObserver(new ChangeSet(), map);
            let expectedResult;
            let actualResult;
            let i = 0;
            while (i < repeat) {
              incrementItems(newItems, i);
              if (newItems === undefined) {
                expectedResult = (<any>expectedMap).set();
                actualResult = (<any>map).set();
              } else {
                for (const item of newItems) {
                  expectedResult = expectedMap.set(item, item);
                  actualResult = map.set(item, item);
                }
              }
              // either they're both undefined (in which case !== doesn't apply) or they're both sets that must be equivalent
              if (actualResult !== expectedResult) {
                assetMapEqual(actualResult, expectedResult);
              }
              assetMapEqual(map, expectedMap);
              i++;
            }
          });

          it(`size=${padRight(init.size, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, () => {
            const map = new Map(Array.from(init));
            const copy = new Map(Array.from(init));
            const newItems = items && items.slice();
            sut = new MapObserver(new ChangeSet(), map);
            let i = 0;
            while (i < repeat) {
              incrementItems(newItems, i);
              if (newItems === undefined) {
                (<any>map).set();
              } else {
                for (const item of newItems) {
                  map.set(item, item);
                }
              }
              synchronize(copy, sut.indexMap, map);
              assetMapEqual(copy, map);
              sut.resetIndexMap();
              i++;
            }
          });
        }
      }
    }
  });

  describe(`observeDelete`, () => {
    const initArr = [new Map(), new Map([[1, 1]]), new Map([[1, 1], [2, 2]])];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2];
    for (const init of initArr) {
      for (const items of itemsArr) {
        for (const repeat of repeatArr) {
          it(`size=${padRight(init.size, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, () => {
            const map = new Map(Array.from(init));
            const expectedMap = new Map(Array.from(init));
            const newItems = items && items.slice();
            sut = new MapObserver(new ChangeSet(), map);
            let expectedResult;
            let actualResult;
            let i = 0;
            while (i < repeat) {
              incrementItems(newItems, i);
              if (newItems === undefined) {
                expectedResult = (<any>expectedMap).delete();
                actualResult = (<any>map).delete();
              } else {
                for (const item of newItems) {
                  expectedResult = expectedMap.delete(item);
                  actualResult = map.delete(item);
                }
              }
              // either they're both undefined (in which case !== doesn't apply) or they're both sets that must be equivalent
              if (actualResult !== expectedResult) {
                assetMapEqual(actualResult, expectedResult);
              }
              assetMapEqual(map, expectedMap);
              i++;
            }
          });

          it(`size=${padRight(init.size, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, () => {
            const map = new Map(Array.from(init));
            const copy = new Map(Array.from(init));
            const newItems = items && items.slice();
            sut = new MapObserver(new ChangeSet(), map);
            let i = 0;
            while (i < repeat) {
              incrementItems(newItems, i);
              if (newItems === undefined) {
                (<any>map).delete();
              } else {
                for (const item of newItems) {
                  map.delete(item);
                }
              }
              synchronize(copy, sut.indexMap, map);
              assetMapEqual(copy, map);
              sut.resetIndexMap();
              i++;
            }
          });
        }
      }
    }
  });

  describe(`observeClear`, () => {
    const initArr = [new Map(), new Map([[1, 1]]), new Map([[1, 1], [2, 2]])];
    const repeatArr = [1, 2];
    for (const init of initArr) {
      for (const repeat of repeatArr) {
        it(`size=${padRight(init.size, 2)} repeat=${repeat} - behaves as native`, () => {
          const map = new Map(Array.from(init));
          const expectedMap = new Map(Array.from(init));
          sut = new MapObserver(new ChangeSet(), map);
          let i = 0;
          while (i < repeat) {
            const expectedResult = expectedMap.clear();
            const actualResult = map.clear();
            expect(expectedResult === actualResult).to.be.true;
            assetMapEqual(map, expectedMap);
            i++;
          }
        });

        it(`size=${padRight(init.size, 2)} repeat=${repeat} - tracks changes`, () => {
          const map = new Map(Array.from(init));
          const copy = new Map(Array.from(init));
          sut = new MapObserver(new ChangeSet(), map);
          let i = 0;
          while (i < repeat) {
            map.clear();
            synchronize(copy, sut.indexMap, map);
            assetMapEqual(copy, map);
            sut.resetIndexMap();
            i++;
          }
        });
      }
    }
  });

});

function padRight(str: any, len: number): string {
  str = str + '';
  return str + new Array(len - str.length + 1).join(' ');
}
function synchronize(oldMap: Map<any, any>, indexMap: IndexMap, newMap: Map<any, any>): void {
  if (newMap.size === 0 && oldMap.size === 0) {
    return;
  }

  for (const entry of indexMap.deletedItems) {
    nativeMapDelete.call(oldMap, entry);
  }
  let i = 0;
  for (const entry of newMap.keys()) {
    if (indexMap[i] === -2) {
      nativeSet.call(oldMap, entry, entry);
    }
    i++;
  }
}

function incrementItems(items: number[], by: number): void {
  if (items === undefined) {
    return;
  }
  let i = 0;
  let len = items.length;
  while (i < len) {
    if (typeof items[i] === 'number') {
      items[i] += by;
    }
    i++;
  }
}
