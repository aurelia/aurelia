import {
  CustomElement,
  LifecycleHooks,
} from '@aurelia/runtime-html';
import {
  assert,
  createFixture,
} from '@aurelia/testing';

describe('3-runtime-html/controller.partially-activated.spec.ts', function () {

  it('does not call [bound] when deactivated while waiting for [binding]', async function () {
    let count = 0;
    let boundCall = 0;
    const { stop } = createFixture('', class {
      binding() {
        return Promise.resolve().then(() => count++);
      }
      bound() {
        boundCall++;
      }
    });

    assert.strictEqual(count, 0);
    assert.strictEqual(boundCall, 0);
    stop();
    await Promise.resolve();
    assert.strictEqual(count, 1);
    assert.strictEqual(boundCall, 0);
  });

  it('does not call [attaching] when deactivated during while waiting for [bound]', async function () {
    let count = 0;
    let attachingCall = 0;
    const { stop } = createFixture('', class {
      bound() {
        return Promise.resolve().then(() => count++);
      }
      attaching() {
        attachingCall++;
      }
    });

    assert.strictEqual(count, 0);
    assert.strictEqual(attachingCall, 0);
    stop();
    await Promise.resolve();
    assert.strictEqual(count, 1);
    assert.strictEqual(attachingCall, 0);
  });

  it('does not call [attached] when deactivated while waiting for [attaching]', async function () {
    let count = 0;
    let attachedCall = 0;
    const { stop } = createFixture('', class {
      attaching() {
        return Promise.resolve().then(() => count++);
      }
      attached() {
        attachedCall++;
      }
    });

    assert.strictEqual(count, 0);
    assert.strictEqual(attachedCall, 0);
    stop();
    await Promise.resolve();
    assert.strictEqual(count, 1);
    assert.strictEqual(attachedCall, 0);
  });

  it('does not call [bound] when [binding] returns a rejected promise', async function () {
    let boundCall = 0;
    createFixture('', class {
      binding() {
        return Promise.reject();
      }
      bound() {
        boundCall++;
      }
    });

    assert.strictEqual(boundCall, 0);
    await Promise.resolve();
    assert.strictEqual(boundCall, 0);
  });

  it('does not call [attaching] when [bound] returns a rejected promise', async function () {
    let attachingCall = 0;
    createFixture('', class {
      bound() {
        return Promise.reject();
      }
      attaching() {
        attachingCall++;
      }
    });

    assert.strictEqual(attachingCall, 0);
    await Promise.resolve();
    assert.strictEqual(attachingCall, 0);
  });

  it('does not call [attached] when [attaching] returns a rejected promise', async function () {
    let attachedCall = 0;
    createFixture('', class {
      attaching() {
        return Promise.reject();
      }
      attached() {
        attachedCall++;
      }
    });

    assert.strictEqual(attachedCall, 0);
    await Promise.resolve();
    assert.strictEqual(attachedCall, 0);
  });

  // this should pass, but it fails at the moment
  it.skip('does not call [attached] when deactivated while waiting for child [binding]', async function () {
    let attachedCall = 0;
    createFixture('', class {
      attached() {
        attachedCall++;
      }
    }, [
      CustomElement.define({ name: 'child', }, class {
        binding() {
          return Promise.resolve();
        }
      })
    ]);

    assert.strictEqual(attachedCall, 0);
    await Promise.resolve();
    assert.strictEqual(attachedCall, 0);
  });

  it('does not call vm [bound] when deactivated while waiting for hooks [binding]', async function () {
    let count = 0;
    let boundCall = 0;
    const { stop } = createFixture('', class {
      bound() {
        boundCall++;
      }
    }, [LifecycleHooks.define({}, class {
      binding() {
        return Promise.resolve().then(() => count++);
      }
    })]);

    assert.strictEqual(count, 0);
    assert.strictEqual(boundCall, 0);
    stop();
    await Promise.resolve();
    assert.strictEqual(count, 1);
    assert.strictEqual(boundCall, 0);
  });

  it('does not call vm [attaching] when deactivated while waiting for hooks [bound]', async function () {
    let count = 0;
    let attachingCall = 0;
    const { stop } = createFixture('', class {
      attaching() {
        attachingCall++;
      }
    }, [LifecycleHooks.define({}, class {
      bound() {
        return Promise.resolve().then(() => count++);
      }
    })]);

    assert.strictEqual(count, 0);
    assert.strictEqual(attachingCall, 0);
    stop();
    await Promise.resolve();
    assert.strictEqual(count, 1);
    assert.strictEqual(attachingCall, 0);
  });

  it('does not call vm [attached] when deactivated while waiting for hooks [attaching]', async function () {
    let count = 0;
    let attachedCall = 0;
    const { stop } = createFixture('', class {
      attached() {
        attachedCall++;
      }
    }, [LifecycleHooks.define({}, class {
      attaching() {
        return Promise.resolve().then(() => count++);
      }
    })]);

    assert.strictEqual(count, 0);
    assert.strictEqual(attachedCall, 0);
    stop();
    await Promise.resolve();
    assert.strictEqual(count, 1);
    assert.strictEqual(attachedCall, 0);
  });

  it('does not call vm [bound] when hooks [binding] returns a rejected promise', async function () {
    let call = 0;
    let boundCall = 0;
    createFixture('', class {
      bound() {
        boundCall++;
      }
    }, [LifecycleHooks.define({}, class {
      binding() {
        return Promise.reject(call++);
      }
    })]);

    assert.strictEqual(call, 1);
    assert.strictEqual(boundCall, 0);
    // wait a bit more than a micro task, because it's necessary to demonstrate that the states assertion after is final
    await waitMacroTask();
    assert.strictEqual(call, 1);
    assert.strictEqual(boundCall, 0);
  });

  it('does not call vm [attaching] when hooks [bound] returns a rejected promise', async function () {
    let call = 0;
    let attachingCall = 0;
    createFixture('', class {
      attaching() {
        attachingCall++;
      }
    }, [LifecycleHooks.define({}, class {
      bound() {
        return Promise.reject(call++);
      }
    })]);

    assert.strictEqual(call, 1);
    assert.strictEqual(attachingCall, 0);
    // wait a bit more than a micro task, because it's necessary to demonstrate that the states assertion after is final
    await waitMacroTask();
    assert.strictEqual(call, 1);
    assert.strictEqual(attachingCall, 0);
  });

  it('does not call vm [attached] when hooks [attaching] returns a rejected promise', async function () {
    let call = 0;
    let attachedCall = 0;
    createFixture('', class {
      attached() {
        attachedCall++;
      }
    }, [LifecycleHooks.define({}, class {
      attaching() {
        return Promise.reject(call++);
      }
    })]);

    assert.strictEqual(call, 1);
    assert.strictEqual(attachedCall, 0);
    // wait a bit more than a micro task, because it's necessary to demonstrate that the states assertion after is final
    await waitMacroTask();
    assert.strictEqual(call, 1);
    assert.strictEqual(attachedCall, 0);
  });

  function waitMacroTask() {
    return new Promise(r => setTimeout(r));
  }
});
