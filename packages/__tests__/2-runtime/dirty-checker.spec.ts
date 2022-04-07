import {
  DirtyCheckSettings,
  IDirtyChecker,
  LifecycleFlags,
} from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';

describe('DirtyChecker', function () {
  // eslint-disable-next-line mocha/no-hooks
  afterEach(function () {
    DirtyCheckSettings.resetToDefault();
  });

  function createFixture() {
    const ctx = TestContext.create();
    const dirtyChecker = ctx.container.get(IDirtyChecker);
    const taskQueue = ctx.platform.taskQueue;

    return { dirtyChecker, taskQueue };
  }
  const expectedFlags = LifecycleFlags.none;

  const specs = [
    {
      timeoutsPerCheck: 1,
      frameChecks: [
        { callCount: 0 },
        { oldValue: '0', newValue: '1', callCount: 1, flags: expectedFlags },
        { oldValue: '1', newValue: '2', callCount: 2, flags: expectedFlags },
        { oldValue: '2', newValue: '3', callCount: 3, flags: expectedFlags },
        { oldValue: '3', newValue: '4', callCount: 4, flags: expectedFlags },
        { oldValue: '4', newValue: '5', callCount: 5, flags: expectedFlags },
        { oldValue: '5', newValue: '6', callCount: 6, flags: expectedFlags },
        { oldValue: '6', newValue: '7', callCount: 7, flags: expectedFlags },
        { oldValue: '7', newValue: '8', callCount: 8, flags: expectedFlags },
        { oldValue: '8', newValue: '9', callCount: 9, flags: expectedFlags },
        { oldValue: '9', newValue: '10', callCount: 10, flags: expectedFlags },
        { oldValue: '10', newValue: '11', callCount: 11, flags: expectedFlags }
      ]
    },
    {
      timeoutsPerCheck: 2,
      frameChecks: [
        { callCount: 0 },
        { callCount: 0 },
        { oldValue: '0', newValue: '2', callCount: 1, flags: expectedFlags },
        { oldValue: '0', newValue: '2', callCount: 1, flags: expectedFlags },
        { oldValue: '2', newValue: '4', callCount: 2, flags: expectedFlags },
        { oldValue: '2', newValue: '4', callCount: 2, flags: expectedFlags },
        { oldValue: '4', newValue: '6', callCount: 3, flags: expectedFlags },
        { oldValue: '4', newValue: '6', callCount: 3, flags: expectedFlags },
        { oldValue: '6', newValue: '8', callCount: 4, flags: expectedFlags },
        { oldValue: '6', newValue: '8', callCount: 4, flags: expectedFlags },
        { oldValue: '8', newValue: '10', callCount: 5, flags: expectedFlags },
        { oldValue: '8', newValue: '10', callCount: 5, flags: expectedFlags }
      ]
    },
    {
      timeoutsPerCheck: 3,
      frameChecks: [
        { callCount: 0 },
        { callCount: 0 },
        { callCount: 0 },
        { oldValue: '0', newValue: '3', callCount: 1, flags: expectedFlags },
        { oldValue: '0', newValue: '3', callCount: 1, flags: expectedFlags },
        { oldValue: '0', newValue: '3', callCount: 1, flags: expectedFlags },
        { oldValue: '3', newValue: '6', callCount: 2, flags: expectedFlags },
        { oldValue: '3', newValue: '6', callCount: 2, flags: expectedFlags },
        { oldValue: '3', newValue: '6', callCount: 2, flags: expectedFlags },
        { oldValue: '6', newValue: '9', callCount: 3, flags: expectedFlags },
        { oldValue: '6', newValue: '9', callCount: 3, flags: expectedFlags },
        { oldValue: '6', newValue: '9', callCount: 3, flags: expectedFlags }
      ]
    },
    {
      timeoutsPerCheck: 6,
      frameChecks: [
        { callCount: 0 },
        { callCount: 0 },
        { callCount: 0 },
        { callCount: 0 },
        { callCount: 0 },
        { callCount: 0 },
        { oldValue: '0', newValue: '6', callCount: 1, flags: expectedFlags },
        { oldValue: '0', newValue: '6', callCount: 1, flags: expectedFlags },
        { oldValue: '0', newValue: '6', callCount: 1, flags: expectedFlags },
        { oldValue: '0', newValue: '6', callCount: 1, flags: expectedFlags },
        { oldValue: '0', newValue: '6', callCount: 1, flags: expectedFlags },
        { oldValue: '0', newValue: '6', callCount: 1, flags: expectedFlags }
      ]
    }
  ];

  for (const spec of specs) {
    it(`updates after ${spec.timeoutsPerCheck} RAF call`, function (done) {
      const { timeoutsPerCheck, frameChecks } = spec;
      DirtyCheckSettings.timeoutsPerCheck = timeoutsPerCheck;
      const { dirtyChecker, taskQueue } = createFixture();

      const obj1 = { foo: '0' };
      const obj2 = { foo: '0' };

      const observer1 = dirtyChecker.createProperty(obj1, 'foo');
      const observer2 = dirtyChecker.createProperty(obj2, 'foo');

      let callCount1: number = 0;
      let newValue1: string;
      let oldValue1: string;
      let flags1: LifecycleFlags;
      const subscriber1 = {
        handleChange($newValue: string, $oldValue: string, $flags: LifecycleFlags) {
          ++callCount1;
          newValue1 = $newValue;
          oldValue1 = $oldValue;
          flags1 = $flags;
        }
      };

      let callCount2: number = 0;
      let newValue2: string;
      let oldValue2: string;
      let flags2: LifecycleFlags;
      const subscriber2 = {
        handleChange($newValue: string, $oldValue: string, $flags: LifecycleFlags) {
          ++callCount2;
          newValue2 = $newValue;
          oldValue2 = $oldValue;
          flags2 = $flags;
        }
      };

      let callCount3: number = 0;
      let newValue3: string;
      let oldValue3: string;
      let flags3: LifecycleFlags;
      const subscriber3 = {
        handleChange($newValue: string, $oldValue: string, $flags: LifecycleFlags) {
          ++callCount3;
          newValue3 = $newValue;
          oldValue3 = $oldValue;
          flags3 = $flags;
        }
      };

      let callCount4: number = 0;
      let newValue4: string;
      let oldValue4: string;
      let flags4: LifecycleFlags;
      const subscriber4 = {
        handleChange($newValue: string, $oldValue: string, $flags: LifecycleFlags) {
          ++callCount4;
          newValue4 = $newValue;
          oldValue4 = $oldValue;
          flags4 = $flags;
        }
      };

      let frameCount = 0;
      function verifyCalled(marker: number) {
        // marker is just to make it easier to pin down failing assertions from the test logs
        const expected = frameChecks[frameCount];
        if (expected.callCount > 0) {
          assert.strictEqual(callCount1, expected.callCount, `callCount1 #${marker}`);
          assert.strictEqual(newValue1, expected.newValue, `newValue1 #${marker}`);
          assert.strictEqual(oldValue1, expected.oldValue, `oldValue1 #${marker}`);
          assert.strictEqual(flags1, expected.flags, `flag1s #${marker}`);

          assert.strictEqual(callCount2, expected.callCount, `callCount2 #${marker}`);
          assert.strictEqual(newValue2, expected.newValue, `newValue2 #${marker}`);
          assert.strictEqual(oldValue2, expected.oldValue, `oldValue2 #${marker}`);
          assert.strictEqual(flags2, expected.flags, `flags2 #${marker}`);

          assert.strictEqual(callCount3, expected.callCount, `callCount3 #${marker}`);
          assert.strictEqual(newValue3, expected.newValue, `newValue3 #${marker}`);
          assert.strictEqual(oldValue3, expected.oldValue, `oldValue3 #${marker}`);
          assert.strictEqual(flags3, expected.flags, `flags3 #${marker}`);

          assert.strictEqual(callCount4, expected.callCount, `callCount4 #${marker}`);
          assert.strictEqual(newValue4, expected.newValue, `newValue4 #${marker}`);
          assert.strictEqual(oldValue4, expected.oldValue, `oldValue4 #${marker}`);
          assert.strictEqual(flags4, expected.flags, `flags4 #${marker}`);
        } else {
          assert.strictEqual(callCount1, 0, `callCount1 #${marker}`);

          assert.strictEqual(callCount2, 0, `callCount2 #${marker}`);

          assert.strictEqual(callCount3, 0, `callCount3 #${marker}`);

          assert.strictEqual(callCount4, 0, `callCount4 #${marker}`);
        }
      }

      taskQueue.queueTask(() => {
        observer1.subscribe(subscriber1);
        observer1.subscribe(subscriber2);
        observer2.subscribe(subscriber3);
        observer2.subscribe(subscriber4);

        obj1.foo = obj2.foo = `${frameCount + 1}`;

        assert.strictEqual(callCount1, 0, `callCount1`);
        assert.strictEqual(callCount2, 0, `callCount2`);
        assert.strictEqual(callCount3, 0, `callCount3`);
        assert.strictEqual(callCount4, 0, `callCount4`);
        taskQueue.queueTask(() => {
          obj1.foo = obj2.foo = `${++frameCount + 1}`;
          verifyCalled(2);
          taskQueue.queueTask(() => {
            obj1.foo = obj2.foo = `${++frameCount + 1}`;
            verifyCalled(3);
            taskQueue.queueTask(() => {
              obj1.foo = obj2.foo = `${++frameCount + 1}`;
              verifyCalled(4);
              taskQueue.queueTask(() => {
                obj1.foo = obj2.foo = `${++frameCount + 1}`;
                verifyCalled(5);
                taskQueue.queueTask(() => {
                  obj1.foo = obj2.foo = `${++frameCount + 1}`;
                  verifyCalled(6);
                  taskQueue.queueTask(() => {
                    obj1.foo = obj2.foo = `${++frameCount + 1}`;
                    verifyCalled(7);
                    taskQueue.queueTask(() => {
                      obj1.foo = obj2.foo = `${++frameCount + 1}`;
                      verifyCalled(8);
                      taskQueue.queueTask(() => {
                        obj1.foo = obj2.foo = `${++frameCount + 1}`;
                        verifyCalled(9);
                        taskQueue.queueTask(() => {
                          obj1.foo = obj2.foo = `${++frameCount + 1}`;
                          verifyCalled(10);
                          taskQueue.queueTask(() => {
                            obj1.foo = obj2.foo = `${++frameCount + 1}`;
                            verifyCalled(11);
                            observer1.unsubscribe(subscriber1);
                            observer1.unsubscribe(subscriber2);
                            observer2.unsubscribe(subscriber3);
                            observer2.unsubscribe(subscriber4);

                            done();
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  it('does nothing if disabled', function (done) {
    const timeoutsPerCheck: number = 1;
    DirtyCheckSettings.timeoutsPerCheck = timeoutsPerCheck;
    DirtyCheckSettings.disabled = true;
    const { dirtyChecker, taskQueue } = createFixture();

    const obj = { foo: '0' };
    const observer = dirtyChecker.createProperty(obj, 'foo');

    let callCount: number = 0;
    const subscriber = {
      handleChange() {
        ++callCount;
      }
    };

    observer.subscribe(subscriber);

    obj.foo = `1`;

    assert.strictEqual(callCount, 0, `callCount`);

    taskQueue.queueTask(() => {
      assert.strictEqual(callCount, 0, `callCount`);
      taskQueue.queueTask(() => {
        assert.strictEqual(callCount, 0, `callCount`);
        taskQueue.queueTask(() => {
          assert.strictEqual(callCount, 0, `callCount`);
          taskQueue.queueTask(() => {
            assert.strictEqual(callCount, 0, `callCount`);
            taskQueue.queueTask(() => {
              assert.strictEqual(callCount, 0, `callCount`);
              observer.unsubscribe(subscriber);

              done();
            });
          });
        });
      });
    });
  });

  it('throws on property creation if configured', function () {
    DirtyCheckSettings.throw = true;
    const { dirtyChecker } = createFixture();

    const obj = { foo: '0' };
    let err;
    try {
      dirtyChecker.createProperty(obj, 'foo');
    } catch (e) {
      err = e;
    }
    assert.match(err.message, /AUR0222:foo/, `err.message`);
    // assert.match(err.message, /Property 'foo' is being dirty-checked/, `err.message`);
  });
});
