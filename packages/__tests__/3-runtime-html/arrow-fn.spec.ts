import { BindingBehavior, ValueConverter, CustomAttribute, INode } from '@aurelia/runtime-html';
import { assert, createFixture } from "@aurelia/testing";

describe("arrow-fn", function () {

  // leave this test at the top - if any tests below this one fail for unknown reasons, then corrupted parser state may not be properly recovered
  it("corrupt the parser state to ensure it's correctly reset afterwards", function () {
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

  it("works with IIFE", function () {
    const { assertText } = createFixture
      .html`\${(a => a)(1)}`
      .build();
    assertText('1');
  });

  it("works with paren wrapping {}", function () {
    const { assertText } = createFixture
      .html`\${(((e) => ({ a: e.v }))({ v: 1 })).a}`
      .build();
    assertText('1');
  });

  it("can sort number array", function () {
    const { assertText } = createFixture
      .html`<div repeat.for="i of items.sort((a, b) => a - b)">\${i}</div>`
      .component({ items: [5, 7, 6] })
      .build();
    assertText('567');
  });

  it("can observe property accessed in each parameter", function () {
    const { component, assertText } = createFixture
      .component({ items: [{ v: 0 }, { v: 1 }] })
      .html`<div repeat.for="i of items.filter(i => i.v > 0)">\${i.v}</div>`
      .build();
    assertText('1');

    component.items[0].v = 1;
    assertText('11');
  });

  it("can reduce number array", function () {
    const { assertText } = createFixture
      .html`\${items.reduce((sum, x) => sum + x, 0)}`
      .component({ items: [3, 4] })
      .build();
    assertText('7');
  });

  it("can call nested arrow inline", function () {
    const { assertText } = createFixture
      .html`\${(a => b => a + b)(1)(2)}`
      .build();
    assertText('3');
  });

  it("can call arrow inline with rest", function () {
    const { assertText } = createFixture
      .html`\${((...args) => args[0] + args[1] + args[2])(1, 2, 3)}`
      .build();
    assertText('6');
  });

  it("can flatMap nested fn", function () {
    const { assertText } = createFixture
        .component({
          items: [
            { name: 'a1', children: [{ name: 'b1', children: [{ name: 'c1' }] }] },
            { name: 'a2', children: [{ name: 'b2', children: [{ name: 'c2' }] }] }
          ]
        })
      .html`<div repeat.for="item of items.flatMap(x => [x].concat(x.children.flatMap(y => [y].concat(y.children))))">\${item.name}-</div>`
      .build();
    assertText('a1-b1-c1-a2-b2-c2-');
  });

  it("can flatMap nested fn and access parent scope", function () {
    const { assertText } = createFixture
        .component({
          items: [
            { name: 'a1', children: [{ name: 'b1', children: [{ name: 'c1' }] }] },
            { name: 'a2', children: [{ name: 'b2', children: [{ name: 'c2' }] }] }
          ]
        })
      .html`<div repeat.for="item of items.flatMap(x => x.children.flatMap(y => ([x, y].concat(y.children))))">\${item.name}-</div>`
      .build();
    assertText('a1-b1-c1-a2-b2-c2-');
  });

  it("can access the correct scope via $this", function () {
    const { assertText } = createFixture
      .html`\${(a => $this.a)('2')}`
      .component({ a: '1' })
      .build();
    assertText('1');
  });

  it("can access the correct scope via $this in nested arrow", function () {
    const { assertText } = createFixture
      .html`\${(a => a => $this.a)('3')('2')}`
      .component({ a: '1' })
      .build();
    assertText('1');
  });

  it("can access the correct scope via $parent", function () {
    const { assertText } = createFixture
      .html`<div with.bind="{a:2}"><div with.bind="{a:3}"><div with.bind="{a:4}">\${(a => $parent.a)('5')}</div></div></div>`
      .component({ a: '1' })
      .build();
    assertText('3');
  });

  it("can access the correct scope via $parent in nested arrow", function () {
    const { assertText } = createFixture
      .html`<div with.bind="{a:2}"><div with.bind="{a:3}"><div with.bind="{a:4}">\${(a => a => $parent.a)('6')('5')}</div></div></div>`
      .component({ a: '1' })
      .build();
    assertText('3');
  });

  it("can access the correct scope via $parent.$parent in nested arrow", function () {
    const { assertText } = createFixture
      .html`<div with.bind="{a:2}"><div with.bind="{a:3}"><div with.bind="{a:4}">\${(a => a => $parent.$parent.a)('6')('5')}</div></div></div>`
      .component({ a: '1' })
      .build();
    assertText('2');
  });

  it('works with attribute binding + binding command', function () {
    const { getBy } = createFixture
      .component({ getValue: v => `light${v}` })
      .html`<div square.bind="v => getValue(v)">`
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

  it('works with attribute multi binding syntax', function () {
    const { getBy } = createFixture
      .component({
        getValue: v => `light${v}`,
        getDarkValue: v => `dark${v}`,
      })
      .html`<div square="fn1.bind: v => getValue(v); fn2.bind: v => getDarkValue(v)">`
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

  it('works with event', function () {
    let i = 0;
    const { getBy } = createFixture
      .html`<button click.trigger="() => clicked()">`
      .component({ clicked: () => i = 1 })
      .build();

    getBy('button').click();
    assert.strictEqual(i, 1);
  });

  it('works with binding behavior', function () {
    const { assertText } = createFixture
      .html`<div repeat.for="i of items.sort((a, b) => a - b) & log">\${i}</div>`
      .component({ items: [5, 7, 6] })
      .deps(BindingBehavior.define('log', class {}))
      .build();
    assertText('567');
  });

  it('works with value converter', function () {
    const { assertText } = createFixture
      .html`<div repeat.for="i of items.sort((a, b) => a - b) | identity">\${i}</div>`
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
    it('observes on .map()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.map(i => i + 1)}`
        .build();
      assertText('2');

      component.items.push(2);
      flush();
      assertText('2,3');

      component.items.push(3);
      flush();
      assertText('2,3,4');
    });

    it('observes on repeat + .map()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`<div repeat.for="i of items.map(i => i + 1)">\${i}`
        .build();
      assertText('2');

      component.items.push(2);
      flush();
      assertText('23');

      component.items.push(3);
      flush();
      assertText('234');
    });

    it('observes on <let> + .map()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`<let i.bind="items.map(i => i + 1)"></let>\${i}`
        .build();
      assertText('2');

      component.items.push(2);
      flush();
      assertText('2,3');

      component.items.push(3);
      flush();
      assertText('2,3,4');
    });

    it('observes on .filter()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.filter(i => i > 1)}`
        .build();
      assertText('');

      component.items.push(2);
      flush();
      assertText('2');

      component.items.push(3);
      flush();
      assertText('2,3');
    });

    it('observes on .at()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.at(-1)}`
        .build();
      assertText('1');

      component.items.push(2);
      flush();
      assertText('2');

      component.items.splice(1);
      flush();
      assertText('1');
    });

    it('observes on .includes()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.includes(2)}`
        .build();
      assertText('false');

      component.items.push(2);
      flush();
      assertText('true');

      component.items.splice(0);
      flush();
      assertText('false');
    });

    it('observes on .indexOf()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.indexOf(2)}`
        .build();
      assertText('-1');

      component.items.push(2);
      flush();
      assertText('1');

      component.items.splice(0);
      flush();
      assertText('-1');
    });

    it('observes on .lastIndexOf()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.lastIndexOf(2)}`
        .build();
      assertText('-1');

      component.items.push(2);
      flush();
      assertText('1');

      component.items.splice(0);
      flush();
      assertText('-1');
    });

    it('observes on .findIndex()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.findIndex(x => x === 2)}`
        .build();
      assertText('-1');

      component.items.push(2);
      flush();
      assertText('1');

      component.items.splice(0);
      flush();
      assertText('-1');
    });

    it('observes on .find()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.find(x => x === 2)}`
        .build();
      assertText('undefined');

      component.items.push(2);
      flush();
      assertText('2');

      component.items.splice(0);
      flush();
      assertText('undefined');
    });

    it('observes on .flat()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [[1]] })
        .html`\${items.flat()}`
        .build();
      assertText('1');

      component.items.push([2]);
      flush();
      assertText('1,2');

      component.items.splice(1);
      flush();
      assertText('1');
    });

    it('observes on .flatMap()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.flatMap(i => [i + 1])}`
        .build();
      assertText('2');

      component.items.push(2);
      flush();
      assertText('2,3');

      component.items.splice(1);
      flush();
      assertText('2');
    });

    it('observes on .join()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.join(', ')}`
        .build();
      assertText('1');

      component.items.push(2);
      flush();
      assertText('1, 2');

      component.items.splice(1);
      flush();
      assertText('1');
    });

    it('observes on .reduce()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.reduce((acc, i) => acc + i, 0)}`
        .build();
      assertText('1');

      component.items.push(2);
      flush();
      assertText('3');

      component.items.splice(1);
      flush();
      assertText('1');
    });

    it('observes on .reduceRight()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.reduceRight((acc, i) => acc + i)}`
        .build();
      assertText('1');

      component.items.push(2);
      flush();
      assertText('3');

      component.items.splice(1);
      flush();
      assertText('1');
    });

    it('observes on .slice()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.slice(0)}`
        .build();
      assertText('1');

      component.items.push(2);
      flush();
      assertText('1,2');

      component.items.splice(1);
      flush();
      assertText('1');
    });

    it('observes on .every()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.every(i => i < 2)}`
        .build();
      assertText('true');

      component.items.push(2);
      flush();
      assertText('false');

      component.items.splice(1);
      flush();
      assertText('true');
    });

    it('observes on .some()', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [1] })
        .html`\${items.some(i => i > 1)}`
        .build();
      assertText('false');

      component.items.push(2);
      flush();
      assertText('true');

      component.items.splice(1);
      flush();
      assertText('false');
    });

    // the follow results in a infinite loop,
    // because sort mutate the existing array causing the binding & repeat to update infinitely
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('observes on .sort', function () {
      const { component, flush, assertText } = createFixture
        .component({ items: [{ id: 4, }, { id: 5, }, { id: 3, }, { id: 1 }] })
        .html`<div repeat.for="i of items.slice(0).sort((a, b) => a.id - b.id)">\${i.id}`
        .build();
      assertText('1345');

      component.items.push({ id: 2 });
      // flush();
      assertText('1,2,3');

      component.items.splice(2);
      flush();
      assertText('1,2');
    });
  });
});
