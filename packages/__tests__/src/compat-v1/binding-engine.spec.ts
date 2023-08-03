import { BindingEngine } from '@aurelia/compat-v1';
import { assert, createFixture } from '@aurelia/testing';

describe('compat-v1/binding-engine.spec.ts', function () {
  async function create() {
    const fixture = await createFixture('').started;
    const bindingEngine = fixture.container.get(BindingEngine);
    return { ...fixture, bindingEngine };
  }

  describe('.propertyObserver', function () {
    it('subscribes with propertyObserver string key', async function () {
      const { bindingEngine } = await create();
      const obj = { a: 1 };
      let v: any = 0;
      let callCount = 0;
      const sub = bindingEngine.propertyObserver(obj, 'a').subscribe(newV => {
        callCount++;
        v = newV;
      });
      obj.a = 2;
      assert.strictEqual(v, 2);
      assert.strictEqual(callCount, 1);

      sub.dispose();
      obj.a = 0;
      assert.strictEqual(v, 2);
      assert.strictEqual(callCount, 1);
    });

    it('subscribes symbol key', async function () {
      const { bindingEngine } = await create();
      const obj = { [Symbol.for('a')]: 1 };
      let v: any = 0;
      let callCount = 0;
      const sub = bindingEngine.propertyObserver(obj, Symbol.for('a')).subscribe(newV => {
        callCount++;
        v = newV;
      });
      obj[Symbol.for('a')] = 2;
      assert.strictEqual(v, 2);
      assert.strictEqual(callCount, 1);

      sub.dispose();
      obj[Symbol.for('a')] = 0;
      assert.strictEqual(v, 2);
      assert.strictEqual(callCount, 1);
    });
  });

  describe('.collectionObserver', function () {
    it('subscribes Array', async function () {
      const { bindingEngine } = await create();
      const arr = [1];
      let callCount = 0;
      bindingEngine.collectionObserver(arr).subscribe(() => {
        callCount++;
      });
      arr.push(1);
      assert.strictEqual(callCount, 1);
    });

    it('subscribes Set', async function () {
      const { bindingEngine } = await create();
      const set = new Set([1]);
      let callCount = 0;
      bindingEngine.collectionObserver(set).subscribe(() => {
        callCount++;
      });
      set.add(2);
      assert.strictEqual(callCount, 1);
    });

    it('subscribes Map',  async function () {
      const { bindingEngine } = await create();
      const set = new Map([
        [1, '1']
      ]);
      let callCount = 0;
      bindingEngine.collectionObserver(set).subscribe(() => {
        callCount++;
      });
      set.set(2, '2');
      assert.strictEqual(callCount, 1);
    });
  });

  describe('.expressionObserver', function () {
    it('subscribes simple expression', async function () {
      const { bindingEngine } = await create();
      const obj = {
        a: {
          b: 1
        },
        c: 2
      };
      let v: any = 0;
      let callCount = 0;
      bindingEngine.expressionObserver(obj, 'a.b').subscribe(newV => {
        callCount++;
        v = newV;
      });
      obj.a.b = 2;
      assert.strictEqual(callCount, 1);
      assert.strictEqual(v, 2);

      obj.c = 1;
      assert.strictEqual(callCount, 1);
      assert.strictEqual(v, 2);
    });

    it('gives undefined when parent object becomes invalid', async function () {
      const { bindingEngine } = await create();
      const obj = {
        a: {
          b: 1
        },
        c: 2
      };
      let v: any = 0;
      let callCount = 0;
      const sub = bindingEngine.expressionObserver(obj, 'a.b').subscribe(newV => {
        callCount++;
        v = newV;
      });
      obj.a = null;
      assert.strictEqual(callCount, 1);
      assert.strictEqual(v, undefined);

      sub.dispose();
      obj.a = { b: 1 };
      assert.strictEqual(callCount, 1);
      assert.strictEqual(v, undefined);
    });
  });
});
