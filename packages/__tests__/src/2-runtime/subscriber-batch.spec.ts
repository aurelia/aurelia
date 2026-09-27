import { batch, cloneIndexMap, ComputedObserver, copyIndexMap, getCollectionObserver, IndexMap, IObservation, SetterObserver } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';

describe('2-runtime/subscriber-batch.spec.ts', function () {
  const scenarios = [
    {
      name: 'array',
      create() {
        const collection = [1, 2, 3];
        return { collection, remove: () => collection.shift(), add: (value: number) => collection.push(value) };
      },
    },
    {
      name: 'map',
      create() {
        const collection = new Map([[1, 1], [2, 2], [3, 3]]);
        return { collection, remove: () => collection.delete(collection.keys().next().value), add: (value: number) => collection.set(value, value) };
      },
    },
    {
      name: 'set',
      create() {
        const collection = new Set([1, 2, 3]);
        return { collection, remove: () => collection.delete(collection.keys().next().value), add: (value: number) => collection.add(value) };
      },
    },
  ];

  for (const { name, create } of scenarios) {
    it(`does not replay batched ${name} deletions on later synchronous mutations (#2480)`, function () {
      const { collection, remove, add } = create();
      const observer = getCollectionObserver(collection);
      const changes: IndexMap[] = [];
      observer.subscribe({ handleCollectionChange: (_, indexMap) => changes.push(cloneIndexMap(indexMap)) });

      batch(remove);
      assert.deepStrictEqual(changes, [copyIndexMap([1, 2], [0], [1])]);
      add(4);
      assert.deepStrictEqual(changes[1], copyIndexMap([0, 1, -2]));
      batch(() => add(5));
      assert.deepStrictEqual(changes[2], copyIndexMap([0, 1, 2, -2]));
      add(6);
      assert.deepStrictEqual(changes[3], copyIndexMap([0, 1, 2, 3, -2]));
    });

    it(`starts a fresh ${name} index map before invoking a reentrant subscriber`, function () {
      const { collection, remove, add } = create();
      const observer = getCollectionObserver(collection);
      const changes: IndexMap[] = [];
      observer.subscribe({
        handleCollectionChange(_, indexMap) {
          changes.push(indexMap);
          if (changes.length === 1) {
            add(4);
          }
        },
      });

      batch(remove);
      assert.deepStrictEqual(changes, [copyIndexMap([1, 2], [0], [1]), copyIndexMap([0, 1, -2])]);
    });

    it(`restores ${name} observation when a batch callback throws`, function () {
      const { collection, remove, add } = create();
      const observer = getCollectionObserver(collection);
      const changes: IndexMap[] = [];
      observer.subscribe({ handleCollectionChange: (_, indexMap) => changes.push(cloneIndexMap(indexMap)) });
      const error = new Error('callback failed');

      assert.throws(() => batch(() => { remove(); throw error; }), error);
      add(4);
      assert.deepStrictEqual(changes, [copyIndexMap([1, 2], [0], [1]), copyIndexMap([0, 1, -2])]);
    });

    it(`restores ${name} observation when its subscriber throws`, function () {
      const { collection, remove, add } = create();
      const observer = getCollectionObserver(collection);
      const error = new Error('subscriber failed');
      const subscriber = { handleCollectionChange() { throw error; } };
      observer.subscribe(subscriber);
      assert.throws(() => batch(remove), error);
      observer.unsubscribe(subscriber);

      const changes: IndexMap[] = [];
      observer.subscribe({ handleCollectionChange: (_, indexMap) => changes.push(cloneIndexMap(indexMap)) });
      add(4);
      assert.deepStrictEqual(changes, [copyIndexMap([0, 1, -2])]);
    });

    it(`preserves inner ${name} flushes without replaying them and resumes outer batching`, function () {
      const { collection, remove, add } = create();
      const observer = getCollectionObserver(collection);
      const changes: IndexMap[] = [];
      observer.subscribe({ handleCollectionChange: (_, indexMap) => changes.push(cloneIndexMap(indexMap)) });

      batch(() => {
        remove();
        batch(() => batch(remove));
        assert.deepStrictEqual(changes, [copyIndexMap([2], [0, 1], [1, 2])]);
        add(4);
        add(5);
        assert.strictEqual(changes.length, 1, 'the outer callback is still batched');
      });
      assert.deepStrictEqual(changes, [copyIndexMap([2], [0, 1], [1, 2]), copyIndexMap([0, -2, -2])]);
    });
  }

  it('reports the first old value and the final new value (#2480)', function () {
    const obj = { value: 'initial' };
    const observer = new SetterObserver(obj, 'value');
    const changes: unknown[][] = [];
    observer.subscribe({ handleChange: (value, oldValue) => changes.push([value, oldValue]) });
    batch(() => {
      obj.value = 'intermediate';
      obj.value = 'final';
      assert.strictEqual(changes.length, 0);
    });
    assert.deepStrictEqual(changes, [['final', 'initial']]);
    obj.value = 'later';
    assert.deepStrictEqual(changes[1], ['later', 'final']);
  });

  it('does not replay a pending collection delivered by a reentrant mutation', function () {
    const first = [1, 2, 3];
    const second = [1, 2, 3];
    const changes: IndexMap[] = [];
    getCollectionObserver(first).subscribe({ handleCollectionChange() { second.push(4); } });
    getCollectionObserver(second).subscribe({ handleCollectionChange: (_, indexMap) => changes.push(cloneIndexMap(indexMap)) });
    batch(() => {
      first.shift();
      second.shift();
    });
    assert.deepStrictEqual(changes, [copyIndexMap([1, 2, -2], [0], [1])]);
    second.push(5);
    assert.deepStrictEqual(changes[1], copyIndexMap([0, 1, 2, -2]));
  });

  it('preserves undelivered collection changes after an earlier subscriber throws', function () {
    const first = [1, 2, 3];
    const second = [1, 2, 3];
    const changes: IndexMap[] = [];
    const error = new Error('subscriber failed');
    getCollectionObserver(first).subscribe({ handleCollectionChange() { throw error; } });
    getCollectionObserver(second).subscribe({ handleCollectionChange: (_, indexMap) => changes.push(cloneIndexMap(indexMap)) });
    assert.throws(() => batch(() => {
      first.shift();
      second.shift();
    }), error);
    assert.deepStrictEqual(changes, [], 'delivery remains fail-fast');
    second.push(4);
    assert.deepStrictEqual(changes, [copyIndexMap([1, 2, -2], [0], [1])]);
  });

  it('delivers a reentrant normalized value synchronously without replaying the pending value', function () {
    const form = { trim: false, label: 'initial', other: 0 };
    const calls: unknown[][] = [];
    let displayedLabel = form.label;
    new SetterObserver(form, 'trim').subscribe({
      handleChange() {
        calls.push(['normalize']);
        form.label = form.label.trim();
        calls.push(['normalized', displayedLabel]);
      },
    });
    new SetterObserver(form, 'label').subscribe({
      handleChange(value: string, oldValue) {
        displayedLabel = value;
        calls.push(['label', value, oldValue]);
      },
    });
    new SetterObserver(form, 'other').subscribe({ handleChange: (value, old) => calls.push(['other', value, old]) });
    batch(() => {
      form.trim = true;
      form.label = ' next ';
      form.other = 1;
    });
    assert.strictEqual(form.label, 'next');
    assert.strictEqual(displayedLabel, 'next');
    assert.deepStrictEqual(calls, [['normalize'], ['label', 'next', 'initial'], ['normalized', 'next'], ['other', 1, 0]]);
  });

  it('suppresses a pending value normalized back to its initial value', function () {
    const form = { trim: false, label: 'initial' };
    const changes: unknown[][] = [];
    new SetterObserver(form, 'trim').subscribe({ handleChange() { form.label = form.label.trim(); } });
    new SetterObserver(form, 'label').subscribe({ handleChange: (value, old) => changes.push([value, old]) });
    batch(() => {
      form.trim = true;
      form.label = ' initial ';
    });
    assert.strictEqual(form.label, 'initial');
    assert.deepStrictEqual(changes, []);
  });

  it('reconciles a pending outer value changed synchronously while an inner batch flushes', function () {
    const form = { trim: false, label: 'initial' };
    const changes: unknown[][] = [];
    new SetterObserver(form, 'trim').subscribe({ handleChange() { form.label = form.label.trim(); } });
    new SetterObserver(form, 'label').subscribe({ handleChange: (value, old) => changes.push([value, old]) });
    batch(() => {
      form.label = ' next ';
      batch(() => { form.trim = true; });
      assert.deepStrictEqual(changes, [['next', 'initial']]);
      form.label = 'last';
      assert.strictEqual(changes.length, 1, 'the outer callback resumes batching');
    });
    assert.deepStrictEqual(changes, [['next', 'initial'], ['last', 'next']]);
  });

  it('reconciles a pending value changed by a new batch inside a subscriber', function () {
    const form = { trim: false, label: 'initial', other: 0 };
    const changes: unknown[][] = [];
    new SetterObserver(form, 'trim').subscribe({
      handleChange() {
        batch(() => { form.label = form.label.trim(); });
        form.other = 1;
        assert.deepStrictEqual(changes, [['label', 'next', 'initial'], ['other', 1, 0]], 'the outer flush resumes synchronous delivery');
      },
    });
    new SetterObserver(form, 'label').subscribe({ handleChange: (value, old) => changes.push(['label', value, old]) });
    new SetterObserver(form, 'other').subscribe({ handleChange: (value, old) => changes.push(['other', value, old]) });
    batch(() => {
      form.trim = true;
      form.label = ' next ';
    });
    assert.deepStrictEqual(changes, [['label', 'next', 'initial'], ['other', 1, 0]]);
  });

  it('keeps reentrant changes to the value currently being delivered synchronous', function () {
    const obj = { value: 0 };
    const changes: unknown[][] = [];
    new SetterObserver(obj, 'value').subscribe({
      handleChange(value, oldValue) {
        changes.push([value, oldValue]);
        if (value === 1) {
          obj.value = 2;
          assert.deepStrictEqual(changes, [[1, 0], [2, 1]]);
        }
      },
    });
    batch(() => { obj.value = 1; });
    assert.deepStrictEqual(changes, [[1, 0], [2, 1]]);
  });

  for (const initial of [0, NaN, 'initial', {}]) {
    it(`suppresses a value round trip using observer equality (${String(initial)})`, function () {
      const obj = { value: initial as unknown };
      const observer = new SetterObserver(obj, 'value');
      const changes: unknown[][] = [];
      let dirtyCount = 0;
      observer.subscribe({
        handleChange: (value, oldValue) => changes.push([value, oldValue]),
        handleDirty: () => dirtyCount++,
      });
      batch(() => {
        obj.value = 'intermediate';
        obj.value = initial;
      });
      assert.deepStrictEqual(changes, []);
      assert.strictEqual(dirtyCount, 2, 'dirty notification remains synchronous');
    });
  }

  it('preserves signed-zero changes', function () {
    const obj = { value: 0 };
    const observer = new SetterObserver(obj, 'value');
    const changes: unknown[][] = [];
    observer.subscribe({ handleChange: (value, oldValue) => changes.push([value, oldValue]) });
    batch(() => { obj.value = -0; });
    assert.deepStrictEqual(changes, [[-0, 0]]);
  });

  it('coalesces values across inner flushes without flushing unrelated outer values', function () {
    const obj = { value: 0, other: 0 };
    const changes: unknown[][] = [];
    new SetterObserver(obj, 'value').subscribe({ handleChange: (value, old) => changes.push(['value', value, old]) });
    new SetterObserver(obj, 'other').subscribe({ handleChange: (value, old) => changes.push(['other', value, old]) });
    batch(() => {
      obj.other = 1;
      obj.value = 1;
      batch(() => batch(() => { obj.value = 2; }));
      assert.deepStrictEqual(changes, [['value', 2, 0]]);
      obj.value = 3;
      obj.value = 4;
      assert.strictEqual(changes.length, 1);
    });
    assert.deepStrictEqual(changes, [['value', 2, 0], ['other', 1, 0], ['value', 4, 2]]);
  });

  it('resumes the outer batch after a caught inner callback failure', function () {
    const obj = { value: 0 };
    const changes: unknown[][] = [];
    new SetterObserver(obj, 'value').subscribe({ handleChange: (value, old) => changes.push([value, old]) });
    const error = new Error('inner callback failed');
    batch(() => {
      assert.throws(() => batch(() => { obj.value = 1; throw error; }), error);
      assert.deepStrictEqual(changes, [[1, 0]]);
      obj.value = 2;
      obj.value = 3;
      assert.strictEqual(changes.length, 1);
    });
    assert.deepStrictEqual(changes, [[1, 0], [3, 1]]);
  });

  it('keeps collection length, computed reads, and effects coherent at batch boundaries', function () {
    const { observerLocator, container } = TestContext.create();
    const obj = { items: [1, 2, 3], get summary() { return this.items.join(','); } };
    const observer = getCollectionObserver(obj.items);
    const lengths: unknown[][] = [];
    observer.getLengthObserver().subscribe({ handleChange: (value, old) => lengths.push([value, old]) });
    const computed = observerLocator.getObserver(obj, 'summary') as ComputedObserver<typeof obj>;
    computed.useFlush('sync');
    const summaries: unknown[][] = [];
    computed.subscribe({ handleChange: (value, old) => summaries.push([value, old]) });
    const effects: string[] = [];
    const effect = container.get(IObservation).run(watcher => {
      watcher.observeCollection(obj.items);
      effects.push(obj.items.join(','));
    });

    batch(() => {
      obj.items.shift();
      obj.items.push(4, 5);
      assert.strictEqual(computed.getValue(), '2,3,4,5', 'dirty computed reads see current values');
      assert.deepStrictEqual(lengths, []);
      assert.deepStrictEqual(effects, ['1,2,3']);
    });
    assert.deepStrictEqual(lengths, [[4, 3]]);
    assert.deepStrictEqual(summaries, [['2,3,4,5', '1,2,3']]);
    assert.deepStrictEqual(effects, ['1,2,3', '2,3,4,5']);
    obj.items.push(6);
    assert.deepStrictEqual(lengths[1], [5, 4]);
    assert.deepStrictEqual(summaries[1], ['2,3,4,5,6', '2,3,4,5']);
    assert.deepStrictEqual(effects, ['1,2,3', '2,3,4,5', '2,3,4,5,6']);
    effect.stop();
  });
});
