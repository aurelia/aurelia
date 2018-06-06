import { createObserverLocator, checkDelay } from './shared';
import { ModifyCollectionObserver } from '../../../src/runtime/binding/collection-observation';
import { spy } from 'sinon';
import { expect } from 'chai';

describe('collection length', () => {
  let locator;
  before(() => {
    locator = createObserverLocator();
  });

  it('should observe array.length', done => {
    const obj = [];
    const observer = locator.getObserver(obj, 'length');
    const callback = spy();
    observer.subscribe(callback);
    expect(observer.getValue()).to.equal(0);
    obj.push('foo');
    expect(observer.getValue()).to.equal(1);
    setTimeout(() => {
      expect(callback).to.have.been.calledWith(1, 0);
      observer.unsubscribe(callback);
      done();
    },         checkDelay * 2);
  });

  it('should observe map.size', done => {
    const obj = new Map();
    const observer = locator.getObserver(obj, 'size');
    const callback = spy();
    observer.subscribe(callback);
    expect(observer.getValue()).to.equal(0);
    obj.set('foo', 'bar');
    expect(observer.getValue()).to.equal(1);
    setTimeout(() => {
      expect(callback).to.have.been.calledWith(1, 0);
      observer.unsubscribe(callback);
      done();
    },         checkDelay * 2);
  });
});

describe('addChangeRecord', () => {
  let locator;
  before(() => {
    locator = new ModifyCollectionObserver(<any>undefined, <any>undefined);
    locator.lengthObserver = true;
    locator.queued = true;
  });

  beforeEach(() => {
    locator.changeRecords = null;
  });

  describe('splice record', () => {
    it('should not change index when deleting last item - splice(3, 1)', () => {
      const array = ['1', '2', '3'];
      const record = {
        type: 'splice',
        object: array,
        index: 3,
        removed: ['4'],
        addedCount: 0
      };

      locator.addChangeRecord(record);

      expect(locator.changeRecords[0].index).to.equal(3);
    });

    it('should set index of last item when index -1 - splice(-1, 1)', () => {
      const array = ['1', '2', '3'];
      const record = {
        type: 'splice',
        object: array,
        index: -1,
        removed: ['4'],
        addedCount: 0
      };

      locator.addChangeRecord(record);

      expect(locator.changeRecords[0].index).to.equal(3);
    });

    it('should set index of second last item when index -2 - splice(-2, 1)', () => {
      const array = ['1', '2', '4'];
      const record = {
        type: 'splice',
        object: array,
        index: -2,
        removed: ['3'],
        addedCount: 0
      };

      locator.addChangeRecord(record);

      expect(locator.changeRecords[0].index).to.equal(2);
    });

    it('should set index of second last item when index -1 and adding 1 - splice(-1, 0, "Foo")', () => {
      const array = ['1', '2', '3', 'Foo', '4'];
      const record = {
        type: 'splice',
        object: array,
        index: -1,
        removed: [],
        addedCount: 1
      };

      locator.addChangeRecord(record);

      expect(locator.changeRecords[0].index).to.equal(3);
    });

    it('should set index of third last item when index -2 and adding 1 - splice(-2, 0, "Foo")', () => {
      const array = ['1', '2', 'Foo', '3', '4'];
      const record = {
        type: 'splice',
        object: array,
        index: -2,
        removed: [],
        addedCount: 1
      };

      locator.addChangeRecord(record);

      expect(locator.changeRecords[0].index).to.equal(2);
    });

    it('should set index of third last item when index -1 and adding 1 - splice(-1, 0, "Foo", "Bar")', () => {
      const array = ['1', '2', '3', 'Foo', 'Bar', '4'];
      const record = {
        type: 'splice',
        object: array,
        index: -1,
        removed: [],
        addedCount: 2
      };

      locator.addChangeRecord(record);

      expect(locator.changeRecords[0].index).to.equal(3);
    });

    it('should set index of second last item on index -1 removing 1 adding 1  - splice(-1, 1, "Foo")', () => {
      const array = ['1', '2', '3', 'Foo'];
      const record = {
        type: 'splice',
        object: array,
        index: -1,
        removed: ['4'],
        addedCount: 1
      };

      locator.addChangeRecord(record);

      expect(locator.changeRecords[0].index).to.equal(3);
    });

    it('should set index to array length minus added count when index bigger than array - splice(6, 0, "Foo")', () => {
      const array = ['1', '2', '3', '4', 'Foo'];
      const record = {
        type: 'splice',
        object: array,
        index: 6,
        removed: [],
        addedCount: 1
      };

      locator.addChangeRecord(record);

      expect(locator.changeRecords[0].index).to.equal(4);
    });
  });
});
