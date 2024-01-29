import { createFixture } from '@aurelia/testing';

describe('3-runtime-html/access-boundary.spec.ts', function () {
  it('retrieves binding from component boundary in single repeat', async function () {
    const { assertText } = createFixture
      .html`<div repeat.for="name of ['bar', 'baz']">(\${this.name + name})</div>`
      .component({ name: 'foo' })
      .build();

    assertText('(foobar)(foobaz)');
  });

  it('retrieves binding from component boundary in nested repeat', async function () {
    const { assertText } = createFixture
      .html`<div repeat.for="name of ['bar', 'baz']"><div repeat.for="name of ['qux']">(\${this.name + $parent.name + name})</div></div>`
      .component({ name: 'foo' })
      .build();

    assertText('(foobarqux)(foobazqux)');
  });
});
