import { createFixture } from "@aurelia/testing";

describe("3-runtime-html/repeat.basic.spec.ts", function () {
  it('updates view on array sort', function () {
    const { assertText, component: { items } } = createFixture(
      `<div repeat.for="i of items">\${i}</div>`,
      class { items = [1, 0]; }
    );
    assertText('10');
    items.sort();
    assertText('01');
  });

  it('updates view on array sort - without changes', function () {
    const { assertText, component: { items } } = createFixture(
      `<div repeat.for="i of items">\${i}</div>`,
      class { items = [0, 1]; }
    );
    assertText('01');
    items.sort();
    assertText('01');
  });

  it('updates view on array sort - 3 or more items', function () {
    const { assertText, component: { items } } = createFixture(
      `<div repeat.for="i of items">\${i}</div>`,
      class { items = [0, 2, 1]; }
    );
    assertText('021');
    items.sort();
    assertText('012');
  });
});
