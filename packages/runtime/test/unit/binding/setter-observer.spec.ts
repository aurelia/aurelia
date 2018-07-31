import { SetterObserver } from '@aurelia/runtime';
import { executeSharedPropertyObserverTests } from './shared';
import { DI } from '@aurelia/kernel';
import { ITaskQueue } from '@aurelia/runtime';

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
