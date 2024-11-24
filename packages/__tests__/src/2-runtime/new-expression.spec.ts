import { assert, createFixture } from '@aurelia/testing';

describe('2-runtime/new-expression.spec.ts', function () {
  it('new Array', function () {
    const { component } = createFixture(
      '${a = new Array()}',
      class { a = null; }
    );

    assert.instanceOf(component.a, Array);
  });

  it('new Map', function () {
    const { component } = createFixture(
      '${a = new Map()}',
      class { a = null; }
    );

    assert.instanceOf(component.a, Map);
  });

  it('new Set', function () {
    const { component } = createFixture(
      '${a = new Set()}',
      class { a = null; }
    );

    assert.instanceOf(component.a, Set);
  });

  it('new Boolean', function () {
    const { component } = createFixture(
      '${a = new Boolean()}',
      class { a = null; }
    );

    assert.instanceOf(component.a, Boolean);
  });

  it('new Number', function () {
    const { component } = createFixture(
      '${a = new Number()}',
      class { a = null; }
    );

    assert.instanceOf(component.a, Number);
  });

  it('new String', function () {
    const { component } = createFixture(
      '${a = new String()}',
      class { a = null; }
    );

    assert.instanceOf(component.a, String);
  });

  it('new Date', function () {
    const { component } = createFixture(
      '${a = new Date()}',
      class { a = null; }
    );

    assert.instanceOf(component.a, Date);
  });

  it('new Object', function () {
    const { component } = createFixture(
      '${a = new Object()}',
      class { a = null; }
    );

    assert.instanceOf(component.a, Object);
  });

  it('new RegExp', function () {
    const { component } = createFixture(
      '${a = new RegExp()}',
      class { a = null; }
    );

    assert.instanceOf(component.a, RegExp);
  });

  it('new Foo()', function () {
    class Foo {}

    const { component } = createFixture(
      '${a = new Foo()}',
      class { a = null; Foo = Foo; }
    );

    assert.instanceOf(component.a, Foo);
  });

  it('new Foo', function () {
    class Foo {}

    const { component } = createFixture(
      '${a = new Foo}',
      class { a = null; Foo = Foo; }
    );

    assert.instanceOf(component.a, Foo);
  });

  it('throws on new non-existing class', function () {
    const { start } = createFixture(
      '${a = new Foo()}',
      class { a = null; },
      [],
      false,
    );

    assert.throws(() => start(), /AUR0107/);
  });
});
