import { BindingBehavior, ValueConverter, CustomAttribute, INode } from '@aurelia/runtime-html';
import { runTasks } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/arrow-fn.spec.ts', function () {

  // leave this test at the top - if any tests below this one fail for unknown reasons, then corrupted parser state may not be properly recovered
  it('corrupt the parser state to ensure its correctly reset afterwards', async function () {
    let err: Error;
    try {
      createFixture
        .html`\${((e) => ({ e.v })({ v: 1 }))}`
        .build();
    } catch (e) {
      err = e;
    }
    assert.match(err.message, /AUR0167/);
  });

  it('works with IIFE', async function () {
    const { assertText } = createFixture
      .html`\${(a => a)(1)}`
      .build();
    assertText('1');
  });

  it('works with paren wrapping {}', async function () {
    const { assertText } = createFixture
      .html`\${(((e) => ({ a: e.v }))({ v: 1 })).a}`
      .build();
    assertText('1');
  });

  it('can sort number array', async function () {
    const { assertText } = createFixture
      .html`<div repeat.for='i of items.sort((a, b) => a - b)'>\${i}</div>`
      .component({ items: [5, 7, 6] })
      .build();
    assertText('567');
  });

  it('can observe property accessed in each parameter', async function () {
    const { component, assertText } = createFixture
      .component({ items: [{ v: 0 }, { v: 1 }] })
      .html`<div repeat.for='i of items.filter(i => i.v > 0)'>\${i.v}</div>`
      .build();
    assertText('1');

    component.items[0].v = 1;
    runTasks();
    assertText('11');
  });

  it('can reduce number array', async function () {
    const { assertText } = createFixture
      .html`\${items.reduce((sum, x) => sum + x, 0)}`
      .component({ items: [3, 4] })
      .build();
    assertText('7');
  });

  it('can call nested arrow inline', async function () {
    const { assertText } = createFixture
      .html`\${(a => b => a + b)(1)(2)}`
      .build();
    assertText('3');
  });

  it('can call arrow inline with rest', async function () {
    const { assertText } = createFixture
      .html`\${((...args) => args[0] + args[1] + args[2])(1, 2, 3)}`
      .build();
    assertText('6');
  });

  it('can flatMap nested fn', async function () {
    const { assertText } = createFixture
        .component({
          items: [
            { name: 'a1', children: [{ name: 'b1', children: [{ name: 'c1' }] }] },
            { name: 'a2', children: [{ name: 'b2', children: [{ name: 'c2' }] }] }
          ]
        })
      .html`<div repeat.for='item of items.flatMap(x => [x].concat(x.children.flatMap(y => [y].concat(y.children))))'>\${item.name}-</div>`
      .build();
    assertText('a1-b1-c1-a2-b2-c2-');
  });

  it('can flatMap nested fn and access parent scope', async function () {
    const { assertText } = createFixture
        .component({
          items: [
            { name: 'a1', children: [{ name: 'b1', children: [{ name: 'c1' }] }] },
            { name: 'a2', children: [{ name: 'b2', children: [{ name: 'c2' }] }] }
          ]
        })
      .html`<div repeat.for='item of items.flatMap(x => x.children.flatMap(y => ([x, y].concat(y.children))))'>\${item.name}-</div>`
      .build();
    assertText('a1-b1-c1-a2-b2-c2-');
  });

  it('can access the correct scope via $this', async function () {
    const { assertText } = createFixture
      .html`\${(a => $this.a)('2')}`
      .component({ a: '1' })
      .build();
    assertText('1');
  });

  it('can access the correct scope via $this in nested arrow', async function () {
    const { assertText } = createFixture
      .html`\${(a => a => $this.a)('3')('2')}`
      .component({ a: '1' })
      .build();
    assertText('1');
  });

  it('can access the correct scope via $parent', async function () {
    const { assertText } = createFixture
      .html`<div with.bind='{a:2}'><div with.bind='{a:3}'><div with.bind='{a:4}'>\${(a => $parent.a)('5')}</div></div></div>`
      .component({ a: '1' })
      .build();
    assertText('3');
  });

  it('can access the correct scope via $parent in nested arrow', async function () {
    const { assertText } = createFixture
      .html`<div with.bind='{a:2}'><div with.bind='{a:3}'><div with.bind='{a:4}'>\${(a => a => $parent.a)('6')('5')}</div></div></div>`
      .component({ a: '1' })
      .build();
    assertText('3');
  });

  it('can access the correct scope via $parent.$parent in nested arrow', async function () {
    const { assertText } = createFixture
      .html`<div with.bind='{a:2}'><div with.bind='{a:3}'><div with.bind='{a:4}'>\${(a => a => $parent.$parent.a)('6')('5')}</div></div></div>`
      .component({ a: '1' })
      .build();
    assertText('2');
  });

  it('works with attribute binding + binding command', async function () {
    const { getBy } = createFixture
      .component({ getValue: v => `light${v}` })
      .html`<div square.bind='v => getValue(v)'>`
      .deps(CustomAttribute.define('square', class {
        static inject = [INode];

        value: (v: string) => string;
        constructor(private readonly host: HTMLElement) {}

        binding() {
          this.host.setAttribute('data-color', this.value('red'));
        }
      }))
      .build();

    assert.strictEqual(getBy('div').getAttribute('data-color'), 'lightred');
  });

  it('works with attribute multi binding syntax', async function () {
    const { getBy } = createFixture
      .component({
        getValue: v => `light${v}`,
        getDarkValue: v => `dark${v}`,
      })
      .html`<div square='fn1.bind: v => getValue(v); fn2.bind: v => getDarkValue(v)'>`
      .deps(CustomAttribute.define({ name: 'square', bindables: ['fn1', 'fn2'] }, class {
        static inject = [INode];

        fn1: (v: string) => string;
        fn2: (v: string) => string;

        constructor(private readonly host: HTMLElement) {}

        binding() {
          this.host.setAttribute('data-color-light', this.fn1('red'));
          this.host.setAttribute('data-color-dark', this.fn2('green'));
        }
      }))
      .build();

    assert.strictEqual(getBy('div').getAttribute('data-color-light'), 'lightred');
    assert.strictEqual(getBy('div').getAttribute('data-color-dark'), 'darkgreen');
  });

  it('works with event', async function () {
    let i = 0;
    const { getBy } = createFixture
      .html`<button click.trigger='() => clicked()'>`
      .component({ clicked: () => i = 1 })
      .build();

    getBy('button').click();
    assert.strictEqual(i, 1);
  });

  it('works with binding behavior', async function () {
    const { assertText } = createFixture
      .html`<div repeat.for='i of items.sort((a, b) => a - b) & log'>\${i}</div>`
      .component({ items: [5, 7, 6] })
      .deps(BindingBehavior.define('log', class {}))
      .build();
    assertText('567');
  });

  it('works with value converter', async function () {
    const { assertText } = createFixture
      .html`<div repeat.for='i of items.sort((a, b) => a - b) | identity'>\${i}</div>`
      .component({ items: [5, 7, 6] })
      .deps(ValueConverter.define('identity', class {
        toView() {
          return [1];
        }
      }))
      .build();
    assertText('1');
  });

  describe('array obervation', function () {
    it('observes on .map()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.map(i => i + 1)}`
        .build();
      assertText('2');

      component.items.push(2);
      runTasks();
      assertText('2,3');

      component.items.push(3);
      runTasks();
      assertText('2,3,4');
    });

    it('observes on repeat + .map()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`<div repeat.for='i of items.map(i => i + 1)'>\${i}`
        .build();
      assertText('2');

      component.items.push(2);
      runTasks();
      assertText('23');

      component.items.push(3);
      runTasks();
      assertText('234');
    });

    it('observes on <let> + .map()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`<let i.bind='items.map(i => i + 1)'></let>\${i}`
        .build();
      assertText('2');

      component.items.push(2);
      runTasks();
      assertText('2,3');

      component.items.push(3);
      runTasks();
      assertText('2,3,4');
    });

    it('observes on .filter()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.filter(i => i > 1)}`
        .build();
      assertText('');

      component.items.push(2);
      runTasks();
      assertText('2');

      component.items.push(3);
      runTasks();
      assertText('2,3');
    });

    it('can call .filter() with function call inside', async function () {
      const { assertText } = createFixture
        .component({ query: 'item', items: [{ name: 'item 1' }, { name: 'gib' }] })
        .html`<div repeat.for="item of items.filter(i => i.name.includes(query))">\${item.name}</div>`
        .build();
      assertText('item 1');
    });

    it('observes on .at()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.at(-1)}`
        .build();
      assertText('1');

      component.items.push(2);
      runTasks();
      assertText('2');

      component.items.splice(1);
      runTasks();
      assertText('1');
    });

    it('observes on .includes()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.includes(2)}`
        .build();
      assertText('false');

      component.items.push(2);
      runTasks();
      assertText('true');

      component.items.splice(0);
      runTasks();
      assertText('false');
    });

    it('observes on .indexOf()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.indexOf(2)}`
        .build();
      assertText('-1');

      component.items.push(2);
      runTasks();
      assertText('1');

      component.items.splice(0);
      runTasks();
      assertText('-1');
    });

    it('observes on .lastIndexOf()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.lastIndexOf(2)}`
        .build();
      assertText('-1');

      component.items.push(2);
      runTasks();
      assertText('1');

      component.items.splice(0);
      runTasks();
      assertText('-1');
    });

    it('observes on .findIndex()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.findIndex(x => x === 2)}`
        .build();
      assertText('-1');

      component.items.push(2);
      runTasks();
      assertText('1');

      component.items.splice(0);
      runTasks();
      assertText('-1');
    });

    it('observes on .find()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.find(x => x === 2)}`
        .build();
      assertText('');

      component.items.push(2);
      runTasks();
      assertText('2');

      component.items.splice(0);
      runTasks();
      assertText('');
    });

    it('observes on .flat()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [[1]] })
        .html`\${items.flat()}`
        .build();
      assertText('1');

      component.items.push([2]);
      runTasks();
      assertText('1,2');

      component.items.splice(1);
      runTasks();
      assertText('1');
    });

    it('observes on .flatMap()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.flatMap(i => [i + 1])}`
        .build();
      assertText('2');

      component.items.push(2);
      runTasks();
      assertText('2,3');

      component.items.splice(1);
      runTasks();
      assertText('2');
    });

    it('observes on .join()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.join(', ')}`
        .build();
      assertText('1');

      component.items.push(2);
      runTasks();
      assertText('1, 2');

      component.items.splice(1);
      runTasks();
      assertText('1');
    });

    it('observes on .reduce()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.reduce((acc, i) => acc + i, 0)}`
        .build();
      assertText('1');

      component.items.push(2);
      runTasks();
      assertText('3');

      component.items.splice(1);
      runTasks();
      assertText('1');
    });

    it('observes on .reduceRight()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.reduceRight((acc, i) => acc + i)}`
        .build();
      assertText('1');

      component.items.push(2);
      runTasks();
      assertText('3');

      component.items.splice(1);
      runTasks();
      assertText('1');
    });

    it('observes on .slice()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.slice(0)}`
        .build();
      assertText('1');

      component.items.push(2);
      runTasks();
      assertText('1,2');

      component.items.splice(1);
      runTasks();
      assertText('1');
    });

    it('observes on .every()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.every(i => i < 2)}`
        .build();
      assertText('true');

      component.items.push(2);
      runTasks();
      assertText('false');

      component.items.splice(1);
      runTasks();
      assertText('true');
    });

    it('observes on .some()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.some(i => i > 1)}`
        .build();
      assertText('false');

      component.items.push(2);
      runTasks();
      assertText('true');

      component.items.splice(1);
      runTasks();
      assertText('false');
    });

    it('observes on text + .sort()', async function () {
      const { component, assertText } = createFixture
        .component({ items: [1, 4, 3] })
        // this'll result in double evaluation as
        // text binding auto observes array
        // though in realworld usage, it'll be normally with a .join() call
        // so it'll be a single trigger on array mutation
        .html`\${items.sort((a, b) => a - b)}`
        .build();
      assertText('1,3,4');

      component.items.push(2);
      runTasks();
      assertText('1,2,3,4');

      component.items.splice(1);
      runTasks();
      assertText('1');
    });

    it('observes on repeat + .slice().sort', async function () {
      const { component, assertText } = createFixture
        .component({ items: [{ id: 4, }, { id: 5, }, { id: 3, }, { id: 1 }] })
        .html`<div repeat.for='i of items.slice(0).sort((a, b) => a.id - b.id)'>\${i.id},`
        .build();
      assertText('1,3,4,5,');

      component.items.push({ id: 2 });
      runTasks();
      assertText('1,2,3,4,5,');

      component.items.splice(2);
      runTasks();
      assertText('4,5,');
    });

    // the following results in a error in the repeater
    // as when items.push() is call,
    // the repeater'll receive 2 signals at once: push + sort
    // todo: tweak the flush queue and incorporate it into bindings
    // so that it'll notify in breath first manner
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('observes on ..sort', function () {
      const { component, assertText } = createFixture
        .component({ items: [{ id: 4, }, { id: 5, }, { id: 3, }, { id: 1 }] })
        .html`<div repeat.for='i of items.sort((a, b) => a.id - b.id)'>\${i.id},`
        .build();
      assertText('1,3,4,5,');

      console.log('pushing');
      component.items.push({ id: 2 });
      assertText('1,2,3,4,5,');

      console.log('splicing');
      component.items.splice(2);
      assertText('4,5,');
    });
  });
});
