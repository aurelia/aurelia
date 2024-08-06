import { DI, IPlatform, Registration } from '@aurelia/kernel';
import { BrowserPlatform } from '@aurelia/platform-browser';
import { batch, DirtyChecker, IObserverLocator, observable } from '@aurelia/runtime';
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
      assert.deepEqual([i1, i2, i3], [1, 2, 1]);
    });

    it('handles nested dependencies glitches', function () {
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
      assert.deepEqual([i1, i2, i3], [1, 2, 1]);
    });

    it('handles many layers of nested dependencies glitches', function () {
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
      assert.deepEqual([i1, i2, i3], [1, 2, 1]);
    });

    it('handles @observable decorator glitches', function () {
      let i1 = 0;
      let i2 = 0;
      let i3 = 0;

      class NameTag {
        @observable firstName = '';
        @observable lastName = '';

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
      assert.deepEqual([i1, i2, i3], [1, 2, 1]);
    });

    it('handles array index related glitches', function () {
      class NameTag {
        firstName = '';
        lastName = '';

        constructor(readonly tags: string[] = []) {
        }

        get tag() {
          return this.tags[0] === 'a' ? `[Badge] ${this.tags.join(',')}` : '[a]';
        }
      }

      const tags: string[] = [];
      const changeSnapshots: unknown[][] = [];
      locator.getArrayObserver(tags).subscribe({
        handleCollectionChange(collection: []) {
          changeSnapshots.push([collection.length, obj.tag]);
        }
      });
      const obj = new NameTag(tags);
      const tagObserver = locator.getObserver(obj, 'tag');
      tagObserver.subscribe({
        handleChange: () => {
          // only for triggering observation
        }
      });

      tags.push('a');
      assert.deepEqual(changeSnapshots, [
        [1, '[Badge] a']
      ]);
    });

    it('handles array length related glitches', function () {
      class NameTag {
        firstName = '';
        lastName = '';

        constructor(readonly tags: string[] = []) {
        }

        get tag() {
          return this.tags.length > 0 ? `[Badge] ${this.tags.join(',')}` : '[a]';
        }
      }

      const tags: string[] = [];
      const changeSnapshots: unknown[][] = [];
      locator.getArrayObserver(tags).subscribe({
        handleCollectionChange(collection: []) {
          changeSnapshots.push([collection.length, obj.tag]);
        }
      });
      const obj = new NameTag(tags);
      const tagObserver = locator.getObserver(obj, 'tag');
      tagObserver.subscribe({
        handleChange: () => {
          // only for triggering observation
        }
      });

      tags.push('a');
      assert.deepEqual(changeSnapshots, [
        [1, '[Badge] a']
      ]);
    });

    it('handles map size related glitches', function () {
      class NameTag {
        firstName = '';
        lastName = '';

        constructor(readonly tags: Map<string, string>) {
        }

        get tag() {
          return this.tags.size > 0 ? `[Badge] ${[...this.tags.values()].join(',')}` : '[a]';
        }
      }

      const tags = new Map<string, string>();
      const changeSnapshots: unknown[][] = [];
      locator.getMapObserver(tags).subscribe({
        handleCollectionChange(collection: Map<string, string>) {
          changeSnapshots.push([collection.size, obj.tag]);
        }
      });
      const obj = new NameTag(tags);
      const tagObserver = locator.getObserver(obj, 'tag');
      tagObserver.subscribe({
        handleChange: () => {
          // only for triggering observation
        }
      });

      tags.set('a', 'b');
      assert.deepEqual(changeSnapshots, [
        [1, '[Badge] b']
      ]);
    });

    it('handles set size related glitches', function () {
      class NameTag {
        firstName = '';
        lastName = '';

        constructor(readonly tags: Set<string>) {
        }

        get tag() {
          return this.tags.size > 0 ? `[Badge] ${[...this.tags.values()].join(',')}` : '[a]';
        }
      }

      const tags = new Set<string>();
      const changeSnapshots: unknown[][] = [];
      locator.getSetObserver(tags).subscribe({
        handleCollectionChange(collection: Set<string>) {
          changeSnapshots.push([collection.size, obj.tag]);
        }
      });
      const obj = new NameTag(tags);
      const tagObserver = locator.getObserver(obj, 'tag');
      tagObserver.subscribe({
        handleChange: () => {
          // only for triggering observation
        }
      });

      tags.add('a');
      assert.deepEqual(changeSnapshots, [
        [1, '[Badge] a']
      ]);
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('handles glitches in circular dependencies', function () { });

    describe('with batch()', function () {

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

        batch(() => {
          obj.firstName = 'Sync';
          obj.lastName = 'Last';
        });
        assert.strictEqual(obj.tag, '[Banned]');
        assert.deepEqual([i1, i2, i3], [1, 1, 0]);

        batch(() => {
          obj.firstName = '';
        });
        // shouldn't go to 2 because fullName should no longer have 'Sync' in it
        assert.deepEqual([i1, i2, i3], [1, 1, 1]);
      });

      it('handles nested dependencies glitches', function () {
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

        batch(() => {
          obj.firstName = 'Sync';
          obj.lastName = 'Last';
        });
        assert.strictEqual(obj.tag, '[Banned]');
        assert.deepEqual([i1, i2, i3], [1, 1, 0]);

        batch(() => {
          obj.firstName = '';
        });
        assert.deepEqual([i1, i2, i3], [1, 1, 1]);
      });

      it('handles many layers of nested dependencies glitches', function () {
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

        batch(() => {
          obj.firstName = 'Sync';
          obj.lastName = 'Last';
        });
        assert.strictEqual(obj.tag, '[Banned]');
        assert.deepEqual([i1, i2, i3], [1, 1, 0]);

        batch(() => {
          obj.firstName = '';
        });
        assert.deepEqual([i1, i2, i3], [1, 1, 1]);
      });

      it('handles @observable decorator glitches', function () {
        let i1 = 0;
        let i2 = 0;
        let i3 = 0;

        class NameTag {
          @observable firstName = '';
          @observable lastName = '';

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

        batch(() => {
          obj.firstName = 'Sync';
          obj.lastName = 'Last';
        });
        assert.strictEqual(obj.tag, '[Banned]');
        assert.deepEqual([i1, i2, i3], [1, 1, 0]);

        batch(() => {
          obj.firstName = '';
        });
        assert.deepEqual([i1, i2, i3], [1, 1, 1]);
      });

      it('handles array index related glitches', function () {
        class NameTag {
          firstName = '';
          lastName = '';

          constructor(readonly tags: string[] = []) {
          }

          get tag() {
            return this.tags[0] === 'a' ? `[Badge] ${this.tags.join(',')}` : '[a]';
          }
        }

        const tags: string[] = [];
        const changeSnapshots: unknown[][] = [];
        locator.getArrayObserver(tags).subscribe({
          handleCollectionChange(collection: []) {
            changeSnapshots.push([collection.length, obj.tag]);
          }
        });
        const obj = new NameTag(tags);
        const tagObserver = locator.getObserver(obj, 'tag');
        tagObserver.subscribe({
          handleChange: () => {
            // only for triggering observation
          }
        });

        batch(() => {
          tags.push('a');
        });
        assert.deepEqual(changeSnapshots, [
          [1, '[Badge] a']
        ]);
      });

      it('handles array length related glitches', function () {
        class NameTag {
          firstName = '';
          lastName = '';

          constructor(readonly tags: string[] = []) {
          }

          get tag() {
            return this.tags.length > 0 ? `[Badge] ${this.tags.join(',')}` : '[a]';
          }
        }

        const tags: string[] = [];
        const changeSnapshots: unknown[][] = [];
        locator.getArrayObserver(tags).subscribe({
          handleCollectionChange(collection: []) {
            changeSnapshots.push([collection.length, obj.tag]);
          }
        });
        const obj = new NameTag(tags);
        const tagObserver = locator.getObserver(obj, 'tag');
        tagObserver.subscribe({
          handleChange: () => {
            // only for triggering observation
          }
        });

        tags.push('a');
        assert.deepEqual(changeSnapshots, [
          [1, '[Badge] a']
        ]);
      });

      it('handles map size related glitches', function () {
        class NameTag {
          firstName = '';
          lastName = '';

          constructor(readonly tags: Map<string, string>) {
          }

          get tag() {
            return this.tags.size > 0 ? `[Badge] ${[...this.tags.values()].join(',')}` : '[a]';
          }
        }

        const tags = new Map<string, string>();
        const changeSnapshots: unknown[][] = [];
        locator.getMapObserver(tags).subscribe({
          handleCollectionChange(collection: Map<string, string>) {
            changeSnapshots.push([collection.size, obj.tag]);
          }
        });
        const obj = new NameTag(tags);
        const tagObserver = locator.getObserver(obj, 'tag');
        tagObserver.subscribe({
          handleChange: () => {
            // only for triggering observation
          }
        });

        tags.set('a', 'b');
        assert.deepEqual(changeSnapshots, [
          [1, '[Badge] b']
        ]);
      });

      it('handles set size related glitches', function () {
        class NameTag {
          firstName = '';
          lastName = '';

          constructor(readonly tags: Set<string>) {
          }

          get tag() {
            return this.tags.size > 0 ? `[Badge] ${[...this.tags.values()].join(',')}` : '[a]';
          }
        }

        const tags = new Set<string>();
        const changeSnapshots: unknown[][] = [];
        locator.getSetObserver(tags).subscribe({
          handleCollectionChange(collection: Set<string>) {
            changeSnapshots.push([collection.size, obj.tag]);
          }
        });
        const obj = new NameTag(tags);
        const tagObserver = locator.getObserver(obj, 'tag');
        tagObserver.subscribe({
          handleChange: () => {
            // only for triggering observation
          }
        });

        tags.add('a');
        assert.deepEqual(changeSnapshots, [
          [1, '[Badge] a']
        ]);
      });
    });
  });

  describe('app based', function () {
    // is there a way to express glitches in app that is different with the above unit tests?
  });
});
