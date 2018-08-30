import { match } from 'sinon';
import { SetObserver, enableSetObservation, disableSetObservation, nativeSetDelete, nativeAdd, IndexMap } from '../../../src/index';
import { expect } from 'chai';
import { stringify, SpySubscriber } from '../util';
import { ChangeSet } from '../../../src/binding/change-set';

function assetSetEqual(actual: Set<any>, expected: Set<any>): void {
  const len = actual.size;
  expect(len).to.equal(expected.size, `expected.size=${expected.size}, actual.size=${actual.size}`);
  actual = <any>Array.from(actual);
  expected = <any>Array.from(expected);
  let i = 0;
  while (i < len) {
    if (actual[i] !== expected[i]) {
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

describe(`SetObserver`, () => {
  let sut: SetObserver;

  before(() => {
    enableSetObservation();
  });

  after(() => {
    disableSetObservation();
  });

  afterEach(() => {
    if (sut) {
      sut.dispose();
    }
  });

  describe('should allow subscribing for immediate notification', () => {
    it('add', () => {
      const s = new SpySubscriber();
      const set = new Set();
      sut = new SetObserver(new ChangeSet(), set);
      sut.subscribe(s);
      set.add(1);
      expect(s.handleChange).to.have.been.calledWith('add', match(x => x[0] === 1));
    });
  });

  describe('should allow unsubscribing for immediate notification', () => {
    it('add', () => {
      const s = new SpySubscriber();
      const set = new Set();
      sut = new SetObserver(new ChangeSet(), set);
      sut.subscribe(s);
      sut.unsubscribe(s);
      set.add(1);
      expect(s.handleChange).not.to.have.been.called;
    });
  });

  describe('should allow subscribing for batched notification', () => {
    it('add', () => {
      const s = new SpySubscriber();
      const set = new Set();
      sut = new SetObserver(new ChangeSet(), set);
      sut.subscribeBatched(s);
      set.add(1);
      const indexMap: IndexMap = sut.indexMap.slice();
      indexMap.deletedItems = sut.indexMap.deletedItems;
      sut.flushChanges();
      expect(s.handleBatchedChange).to.have.been.calledWith(indexMap);
    });
  });

  describe('should allow unsubscribing for batched notification', () => {
    it('add', () => {
      const s = new SpySubscriber();
      const set = new Set();
      sut = new SetObserver(new ChangeSet(), set);
      sut.subscribeBatched(s);
      sut.unsubscribeBatched(s);
      set.add(1);
      sut.flushChanges();
      expect(s.handleBatchedChange).not.to.have.been.called;
    });
  });

  xdescribe('should not notify batched subscribers if there are no changes', () => {
    it('add', () => {
      const s = new SpySubscriber();
      const set = new Set();
      sut = new SetObserver(new ChangeSet(), set);
      sut.subscribeBatched(s);
      sut.flushChanges();
      expect(s.handleBatchedChange).not.to.have.been.called;
    });
  });

  describe(`observeAdd`, () => {
    const initArr = [new Set(), new Set([1]), new Set([1, 2])];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2];
    for (const init of initArr) {
      for (const items of itemsArr) {
        for (const repeat of repeatArr) {
          it(`size=${padRight(init.size, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, () => {
            const set = new Set(Array.from(init));
            const expectedSet = new Set(Array.from(init));
            const newItems = items && items.slice();
            sut = new SetObserver(new ChangeSet(), set);
            let expectedResult;
            let actualResult;
            let i = 0;
            while (i < repeat) {
              incrementItems(newItems, i);
              if (newItems === undefined) {
                expectedResult = (<any>expectedSet).add();
                actualResult = (<any>set).add();
              } else {
                for (const item of newItems) {
                  expectedResult = expectedSet.add(item);
                  actualResult = set.add(item);
                }
              }
              // either they're both undefined (in which case !== doesn't apply) or they're both sets that must be equivalent
              if (actualResult !== expectedResult) {
                assetSetEqual(actualResult, expectedResult);
              }
              assetSetEqual(set, expectedSet);
              i++;
            }
          });

          it(`size=${padRight(init.size, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, () => {
            const set = new Set(Array.from(init));
            const copy = new Set(Array.from(init));
            const newItems = items && items.slice();
            sut = new SetObserver(new ChangeSet(), set);
            let i = 0;
            while (i < repeat) {
              incrementItems(newItems, i);
              if (newItems === undefined) {
                (<any>set).add();
              } else {
                for (const item of newItems) {
                  set.add(item);
                }
              }
              synchronize(copy, sut.indexMap, set);
              assetSetEqual(copy, set);
              sut.resetIndexMap();
              i++;
            }
          });
        }
      }
    }
  });

  describe(`observeDelete`, () => {
    const initArr = [new Set(), new Set([1]), new Set([1, 2])];
    const itemsArr = [undefined, [], [1], [1, 2]];
    const repeatArr = [1, 2];
    for (const init of initArr) {
      for (const items of itemsArr) {
        for (const repeat of repeatArr) {
          it(`size=${padRight(init.size, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - behaves as native`, () => {
            const set = new Set(Array.from(init));
            const expectedSet = new Set(Array.from(init));
            const newItems = items && items.slice();
            sut = new SetObserver(new ChangeSet(), set);
            let expectedResult;
            let actualResult;
            let i = 0;
            while (i < repeat) {
              incrementItems(newItems, i);
              if (newItems === undefined) {
                expectedResult = (<any>expectedSet).delete();
                actualResult = (<any>set).delete();
              } else {
                for (const item of newItems) {
                  expectedResult = expectedSet.delete(item);
                  actualResult = set.delete(item);
                }
              }
              // either they're both undefined (in which case !== doesn't apply) or they're both sets that must be equivalent
              if (actualResult !== expectedResult) {
                assetSetEqual(actualResult, expectedResult);
              }
              assetSetEqual(set, expectedSet);
              i++;
            }
          });

          it(`size=${padRight(init.size, 2)} itemCount=${padRight(items && items.length, 9)} repeat=${repeat} - tracks changes`, () => {
            const set = new Set(Array.from(init));
            const copy = new Set(Array.from(init));
            const newItems = items && items.slice();
            sut = new SetObserver(new ChangeSet(), set);
            let i = 0;
            while (i < repeat) {
              incrementItems(newItems, i);
              if (newItems === undefined) {
                (<any>set).delete();
              } else {
                for (const item of newItems) {
                  set.delete(item);
                }
              }
              synchronize(copy, sut.indexMap, set);
              assetSetEqual(copy, set);
              sut.resetIndexMap();
              i++;
            }
          });
        }
      }
    }
  });

  describe(`observeClear`, () => {
    const initArr = [new Set(), new Set([1]), new Set([1, 2])];
    const repeatArr = [1, 2];
    for (const init of initArr) {
      for (const repeat of repeatArr) {
        it(`size=${padRight(init.size, 2)} repeat=${repeat} - behaves as native`, () => {
          const set = new Set(Array.from(init));
          const expectedSet = new Set(Array.from(init));
          sut = new SetObserver(new ChangeSet(), set);
          let i = 0;
          while (i < repeat) {
            const expectedResult = expectedSet.clear();
            const actualResult = set.clear();
            expect(expectedResult === actualResult).to.be.true;
            assetSetEqual(set, expectedSet);
            i++;
          }
        });

        it(`size=${padRight(init.size, 2)} repeat=${repeat} - tracks changes`, () => {
          const set = new Set(Array.from(init));
          const copy = new Set(Array.from(init));
          sut = new SetObserver(new ChangeSet(), set);
          let i = 0;
          while (i < repeat) {
            set.clear();
            synchronize(copy, sut.indexMap, set);
            assetSetEqual(copy, set);
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

function synchronize(oldSet: Set<any>, indexMap: IndexMap, newSet: Set<any>): void {
  if (newSet.size === 0 && oldSet.size === 0) {
    return;
  }

  for (const entry of indexMap.deletedItems) {
    nativeSetDelete.call(oldSet, entry);
  }
  let i = 0;
  for (const entry of newSet.keys()) {
    if (indexMap[i] === -2) {
      nativeAdd.call(oldSet, entry);
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
