import { TestContext, assert } from '@aurelia/testing';
import { TaskQueuePriority } from '@aurelia/runtime';
import { PLATFORM } from '@aurelia/kernel';

describe.only('Scheduler', function () {
  // There is only ever one global scheduler, so we might as well store it here instead of initializing all extra boilerplate each test
  const sut = TestContext.createHTMLTestContext().scheduler;

  describe('can queue', function () {
    it('microTask', function (done) {
      sut.queueTask(done, { priority: TaskQueuePriority.microTask });
    });

    it('eventLoop', function (done) {
      sut.queueTask(done, { priority: TaskQueuePriority.eventLoop });
    });

    it('render', function (done) {
      sut.queueTask(done, { priority: TaskQueuePriority.render });
    });

    it('postRender', function (done) {
      sut.queueTask(done, { priority: TaskQueuePriority.postRender });
    });

    it('macroTask', function (done) {
      sut.queueTask(done, { priority: TaskQueuePriority.macroTask });
    });

    it('idle', function (done) {
      sut.queueTask(done, { priority: TaskQueuePriority.idle });
    });
  });
});
