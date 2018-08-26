import { spy, SinonSpy } from 'sinon';
import { ChangeSet, IChangeSet } from './../../../src/binding/change-set';
import { expect } from 'chai';
import { IChangeTracker } from '../../../src/index';


export class MockChangeTracker implements IChangeTracker {
  hasChanges?: boolean;

  public flushChanges: () => void = spy();
}

export class FlushingStateVerifyingMockChangeTracker implements IChangeTracker {
  public changeSet: IChangeSet;
  hasChanges?: boolean;

  public flushChanges: () => void = spy(() => {
    expect(this.changeSet.flushing).to.be.true;
  });
}

export class SelfQueueingMockChangeTracker implements IChangeTracker {
  public changeSet: IChangeSet;
  constructor(public queueCount: number) { }
  hasChanges?: boolean;

  public flushChanges: () => void = spy(() => {
    if (this.queueCount > 0) {
      this.queueCount--;
      this.changeSet.add(this);
    }
  });
}

function createChangeTrackersArr(): MockChangeTracker[][] {
  return [
    [new MockChangeTracker()],
    [new MockChangeTracker(), new MockChangeTracker(), new MockChangeTracker()],
    [new MockChangeTracker(), new MockChangeTracker(), new MockChangeTracker(), new MockChangeTracker(), new MockChangeTracker(), new MockChangeTracker(), new MockChangeTracker(), new MockChangeTracker(), new MockChangeTracker(), new MockChangeTracker()]
  ];
}

function createFlushingStateVerifyingChangeTrackersArr(): FlushingStateVerifyingMockChangeTracker[][] {
  return [
    [new FlushingStateVerifyingMockChangeTracker()],
    [new FlushingStateVerifyingMockChangeTracker(), new FlushingStateVerifyingMockChangeTracker(), new FlushingStateVerifyingMockChangeTracker()],
    [new FlushingStateVerifyingMockChangeTracker(), new FlushingStateVerifyingMockChangeTracker(), new FlushingStateVerifyingMockChangeTracker(), new FlushingStateVerifyingMockChangeTracker(), new FlushingStateVerifyingMockChangeTracker(), new FlushingStateVerifyingMockChangeTracker(), new FlushingStateVerifyingMockChangeTracker(), new FlushingStateVerifyingMockChangeTracker(), new FlushingStateVerifyingMockChangeTracker(), new FlushingStateVerifyingMockChangeTracker()]
  ];
}

function createSelfQueueingChangeTrackersArr(qc: number): SelfQueueingMockChangeTracker[][] {
  return [
    [new SelfQueueingMockChangeTracker(qc)],
    [new SelfQueueingMockChangeTracker(qc), new SelfQueueingMockChangeTracker(qc), new SelfQueueingMockChangeTracker(qc)],
    [new SelfQueueingMockChangeTracker(qc), new SelfQueueingMockChangeTracker(qc), new SelfQueueingMockChangeTracker(qc), new SelfQueueingMockChangeTracker(qc), new SelfQueueingMockChangeTracker(qc), new SelfQueueingMockChangeTracker(qc), new SelfQueueingMockChangeTracker(qc), new SelfQueueingMockChangeTracker(qc), new SelfQueueingMockChangeTracker(qc), new SelfQueueingMockChangeTracker(qc)]
  ];
}

describe('ChangeSet', () => {
  let sut: ChangeSet;

  beforeEach(() => {
    sut = new ChangeSet();
  });

  it('creates its own promise per instance', () => {
    const sut2 = new ChangeSet();

    expect(sut.promise === sut2.promise).to.be.false;
  });

  describe('flushing', () => {
    it('initializes with false', () => {
      expect(sut.flushing).to.be.false;
    });

    for (const changeTrackers of createFlushingStateVerifyingChangeTrackersArr()) {
      it(`is set to true during flushing of ${changeTrackers.length} ChangeTracker(s)`, () => {
        for (const changeTracker of changeTrackers) {
          changeTracker.changeSet = sut;
          sut.add(changeTracker);
        }
        for (const changeTracker of changeTrackers) {
          expect(changeTracker.flushChanges).not.to.have.been.called;
        }
        sut.flushChanges();
        for (const changeTracker of changeTrackers) {
          expect(changeTracker.flushChanges).to.have.been.called;
        }
      });
    }
  });

  describe('flushed', () => {
    it('initializes with undefined', () => {
      expect(sut.flushed).to.be.undefined;
    });

    for (const changeTrackers of createChangeTrackersArr()) {
      it(`causes flushChanges to be called on ${changeTrackers.length} ChangeTracker(s) when awaited`, async () => {
        for (const changeTracker of changeTrackers) {
          sut.add(changeTracker);
        }
        for (const changeTracker of changeTrackers) {
          expect(changeTracker.flushChanges).not.to.have.been.called;
        }
        await sut.flushed;
        for (const changeTracker of changeTrackers) {
          expect(changeTracker.flushChanges).to.have.been.called;
        }
      });
    }
  });

  describe('add()', () => {
    for (const changeTrackers of createChangeTrackersArr()) {
      it(`adds ${changeTrackers.length} ChangeTracker(s) to the set`, () => {
        const iterator = sut.keys();
        for (const changeTracker of changeTrackers) {
          sut.add(changeTracker);
          expect(iterator.next().value === changeTracker).to.be.true;
        }
      });
    }

    for (const changeTrackers of createChangeTrackersArr()) {
      it(`is idempotent when adding ${changeTrackers.length} ChangeTracker(s) twice`, () => {
        for (const changeTracker of changeTrackers) {
          sut.add(changeTracker);
          sut.add(changeTracker);
        }
        expect(sut.size).to.equal(changeTrackers.length);
      });
    }

    for (const changeTrackers of createChangeTrackersArr()) {
      it(`does not immediately call flushChanges on ${changeTrackers.length} ChangeTracker(s)`, () => {
        for (const changeTracker of changeTrackers) {
          sut.add(changeTracker);
        }
        for (const changeTracker of changeTrackers) {
          expect(changeTracker.flushChanges).not.to.have.been.called;
        }
      });
    }

    for (const changeTrackers of createChangeTrackersArr()) {
      it(`calls flushChanges on each of ${changeTrackers.length} ChangeTracker(s) when awaited individually`, async () => {
        for (const changeTracker of changeTrackers) {
          await sut.add(changeTracker);
          expect(changeTracker.flushChanges).to.have.been.called;
        }
      });
    }

    for (const changeTrackers of createChangeTrackersArr()) {
      it(`calls flushChanges on ${changeTrackers.length} ChangeTracker(s) when only the last one is awaited`, async () => {
        let last: IChangeTracker;
        for (const changeTracker of changeTrackers) {
          sut.add(changeTracker);
          last = changeTracker;
        }
        for (const changeTracker of changeTrackers) {
          expect(changeTracker.flushChanges).not.to.have.been.called;
        }
        await sut.add(last);
        for (const changeTracker of changeTrackers) {
          expect(changeTracker.flushChanges).to.have.been.called;
        }
      });
    }

    for (const changeTrackers of createChangeTrackersArr()) {
      it(`returns the same promise when called ${changeTrackers.length} time(s) consecutively without awaiting`, () => {
        let promise = sut.add(changeTrackers[0]);
        for (const changeTracker of changeTrackers) {
          expect(sut.add(changeTracker) === promise).to.be.true;
        }
      });
    }
  });

  describe('toArray()', () => {
    for (const changeTrackers of createChangeTrackersArr()) {
      it(`returns the set of ${changeTrackers.length} ChangeTracker(s) as an array`, () => {
        for (const changeTracker of changeTrackers) {
          sut.add(changeTracker);
        }
        const arr = sut.toArray();
        for (let i = 0; i < changeTrackers.length; i++) {
          expect(arr[i] === changeTrackers[i]).to.be.true;
        }
      });
    }
  });

  describe('flushChanges()', () => {
    for (const changeTrackers of createChangeTrackersArr()) {
      it(`calls flushChanges() on ${changeTrackers.length} ChangeTracker(s)`, () => {
        for (const changeTracker of changeTrackers) {
          sut.add(changeTracker);
        }
        for (const changeTracker of changeTrackers) {
          expect(changeTracker.flushChanges).not.to.have.been.called;
        }
        sut.flushChanges();
        for (const changeTracker of changeTrackers) {
          expect(changeTracker.flushChanges).to.have.been.called;
        }
      });
    }

    for (const queueCount of [1, 3, 10]) {
      for (const changeTrackers of createSelfQueueingChangeTrackersArr(queueCount)) {
        it(`recursively calls flushChanges() on ${changeTrackers.length} ChangeTracker(s) when self re-queued ${queueCount} time(s)`, () => {
          for (const changeTracker of changeTrackers) {
            changeTracker.changeSet = sut;
            sut.add(changeTracker);
          }
          for (const changeTracker of changeTrackers) {
            expect(changeTracker.flushChanges).not.to.have.been.called;
          }
          sut.flushChanges();
          for (const changeTracker of changeTrackers) {
            expect((<SinonSpy>changeTracker.flushChanges).callCount).to.equal(queueCount + 1);
          }
        });
      }
    }
  });
});
