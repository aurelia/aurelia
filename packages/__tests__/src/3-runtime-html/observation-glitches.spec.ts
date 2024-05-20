import { DI, IPlatform, Registration } from '@aurelia/kernel';
import { BrowserPlatform } from '@aurelia/platform-browser';
import { DirtyChecker, IObserverLocator } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe('3-runtime-html/observation-glitches.spec.ts', function () {
  let locator: IObserverLocator;

  this.beforeEach(function () {
    locator = DI.createContainer()
      .register(
        DirtyChecker,
        Registration.instance(IPlatform, BrowserPlatform.getOrCreate(globalThis))
      )
      .get(IObserverLocator);
  });

  it('handles glitches', function () {
    let i1 = 0;
    let i2 = 0;
    let i3 = 0;

    class NameTag {
      firstName = '';
      lastName = '';

      get tag() {
        if (!this.firstName && !this.lastName) {
          i1++;
          return '(Anonymous)';
        }
        if (this.fullName.includes('Sync')) {
          i2++;
          return '[Banned]';
        }
        i3++;
        return `[Badge] ${this.fullName}`;
      }

      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      }
    }
    const obj = new NameTag();
    const tagObserver = locator.getObserver(obj, 'tag');
    tagObserver.subscribe({ handleChange: () => { /* only to trigger observation */ } });
    assert.deepEqual([i1, i2, i3], [1, 0, 0]);

    obj.firstName = 'Sync';
    obj.lastName = 'Last';
    assert.strictEqual(obj.tag, '[Banned]');
    assert.deepEqual([i1, i2, i3], [1, 2, 0]);

    obj.firstName = '';
    assert.throws(() => assert.deepEqual([i1, i2, i3], [1, 2, 1]));
  });
});
