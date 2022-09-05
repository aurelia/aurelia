import { createFixture } from "@aurelia/testing";

describe("arrow-fn", function () {

  it("can sort number array", function () {
    const { assertText } = createFixture
      .html`<div repeat.for="i of items.sort((a, b) => a - b)">\${i}</div>`
      .component({ items: [5, 7, 6] })
      .build();
    assertText('567');
  });

  it.skip("can reactively sort number array", function () {
    const { assertText, component, platform } = createFixture
      .component({ items: [5, 7, 6] })
      .html`<div repeat.for="i of items.sort((a, b) => a - b)">\${i}</div>`
      .build();
    assertText('567');

    component.items.push(0);
    platform.domWriteQueue.flush();
    assertText('0567');
  });

  it("can reduce number array", function () {
    const { assertText } = createFixture
      .html`\${items.reduce((sum, x) => sum + x, 0)}`
      .component({ items: [3, 4] })
      .build();
    assertText('7');
  });

  it.skip("can reactively reduce number array", function () {
    const { component, platform, assertText } = createFixture
      .component({ items: [3, 4] })
      .html`\${items.reduce((sum, x) => sum + x, 0)}`
      .build();
    assertText('7');

    component.items.push(5);
    platform.domWriteQueue.flush();
    assertText('12');
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
});
