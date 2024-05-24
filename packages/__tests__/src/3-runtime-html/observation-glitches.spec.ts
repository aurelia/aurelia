import { DI, IPlatform, Registration } from '@aurelia/kernel';
import { BrowserPlatform } from '@aurelia/platform-browser';
import { DirtyChecker, IObserverLocator } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe('3-runtime-html/observation-glitches.spec.ts', function () {
  describe('[UNIT] - objects only', function () {

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

    it('handle nested dependencies glitches', function () {
      // in this test, fullName depends on firstName, but is not directly a dependency of tag
      // in other word, `fullName` is an indirect dependency of `tag`
      // though it also depends on firstName, so this test is to ensure that regardless of the position of the dependency in the chain,
      // it should still be able to get the notification
      //
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
          if (this.trimmed.includes('Sync')) {
            i2++;
            return '[Banned]';
          }
          i3++;
          return `[Badge] ${this.trimmed}`;
        }

        get fullName() {
          return `${this.firstName} ${this.lastName}`;
        }

        get trimmed() {
          return this.fullName.slice(0, 10);
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

    it('handle many layers of nested dependencies glitches', function () {
      // in this test, fullName depends on firstName, but is not directly a dependency of tag
      // in other word, `fullName` is an indirect dependency of `tag`
      // though it also depends on firstName, so this test is to ensure that regardless of the position of the dependency in the chain,
      // it should still be able to get the notification
      //
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
          if (this.trimmed.includes('Sync')) {
            i2++;
            return '[Banned]';
          }
          i3++;
          return `[Badge] ${this.trimmed}`;
        }

        get fullName() {
          return `${this.firstName} ${this.lastName}`;
        }

        get trimmed() {
          return this.trimmed1;
        }
        get trimmed1() {
          return this.trimmed2.slice(0, 10);
        }
        get trimmed2() {
          return this.trimmed3.slice(0, 10);
        }
        get trimmed3() {
          return this.fullName.slice(0, 10);
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

    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('handles glitches in circular dependencies', function () { });
  });

  describe('app based', function () {
    // is there a way to express glitches in app that is different with the above unit tests?
  });
});
