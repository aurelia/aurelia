import { SetterObserver } from '../../../src/runtime/binding/property-observation';
import { executeSharedPropertyObserverTests } from './shared';
import { DI } from '../../../src/runtime/di';
import { ITaskQueue } from '../../../src/runtime/task-queue';

describe('SetterObserver', () => {
  let obj, observer;

  before(() => {
    const taskQueue = DI.createContainer().get(ITaskQueue);
    obj = { foo: 'bar' };
    observer = new SetterObserver(taskQueue, obj, 'foo');
  });

  it('implements the property observer api', done => {
    executeSharedPropertyObserverTests(obj, observer, done);
  });
});
