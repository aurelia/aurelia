import { createFixture } from "@aurelia/testing";

describe("3-runtime-html/repeat.batched.spec.ts", function () {
  describe('tests that failed before batched array mutation fixes', function () {
    it('combined remove and sort', function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${i}</div>`,
        class { items = [1, 2, 3, 4]; }
      );
      assertText('1234');
      component.items = [4, 1];
      assertText('41');
    });
  });

  describe('additional tests', function () {
    it('sort descending and remove [2, 3]', function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${i}</div>`,
        class { items = [1, 2, 3, 4]; }
      );
      assertText('1234');
      component.items = [4, 1];
      assertText('41');
    });

    it('sort descending and remove [2, 4, 5]', function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${i}</div>`,
        class { items = [1, 2, 3, 4, 5]; }
      );
      assertText('12345');
      component.items = [5, 3];
      assertText('53');
    });

    it('sort ascending and add [1, 2]', function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${i}</div>`,
        class { items = [3, 4, 5]; }
      );
      assertText('345');
      component.items = [1, 5, 3, 2];
      assertText('1532');
    });

    it('remove duplicates [3] and sort remaining', function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${i}</div>`,
        class { items = [2, 2, 3, 3, 4, 4]; }
      );
      assertText('223344');
      component.items = [4, 2];
      assertText('42');
    });

    it('sort ascending and remove [5, 7]', function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${i}</div>`,
        class { items = [7, 5, 9, 1]; }
      );
      assertText('7591');
      component.items = [9, 1];
      assertText('91');
    });

    it('shuffle without sort or remove', function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${i}</div>`,
        class { items = [1, 2, 3, 4]; }
      );
      assertText('1234');
      component.items = [3, 1, 4, 2];
      assertText('3142');
    });

    it('sort and replace [4, 5] with [2, 3]', function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${i}</div>`,
        class { items = [4, 5, 6]; }
      );
      assertText('456');
      component.items = [2, 3, 6];
      assertText('236');
    });

    it('sort ascending and remove [4, 5]', function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${i}</div>`,
        class { items = [5, 4, 3, 2, 1]; }
      );
      assertText('54321');
      component.items = [1, 2, 3];
      assertText('123');
    });

    it('complete replacement with [1, 2, 3]', function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${i}</div>`,
        class { items = [8, 9, 10]; }
      );
      assertText('8910');
      component.items = [1, 2, 3];
      assertText('123');
    });

  });
});
