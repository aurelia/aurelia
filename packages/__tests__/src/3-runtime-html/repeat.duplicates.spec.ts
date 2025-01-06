import { createFixture } from "@aurelia/testing";

describe("3-runtime-html/repeat.duplicates.spec.ts", function () {
  describe('yield correct $index', function () {
    it('duplicate primitive string', function () {
      const { assertText, component, flush } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = ['a', 'b', 'a']; }
      );
      assertText('0-a 1-b 2-a ');

      component.items.push('a');
      flush();

      assertText('0-a 1-b 2-a 3-a ');
    });

    it('duplicate primitive string + push + sort', function () {
      const { assertText, component, flush } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = ['a', 'b', 'a']; }
      );
      assertText('0-a 1-b 2-a ');

      component.items.sort();
      flush();

      assertText('0-a 1-a 2-b ');
    });

    it('duplicate primitive number', function () {
      const { assertText, component, flush } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [0, 1, 0]; }
      );
      assertText('0-0 1-1 2-0 ');

      component.items.push(0);
      flush();

      assertText('0-0 1-1 2-0 3-0 ');
    });

    it('duplicate primitive number + sort', function () {
      const { assertText, component, flush } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [0, 1, 0]; }
      );
      assertText('0-0 1-1 2-0 ');

      component.items.sort();
      flush();

      assertText('0-0 1-0 2-1 ');
    });

    it('duplicate object', function () {
      const obj0 = { toString() { return '0'; } };
      const obj1 = { toString() { return '1'; } };

      const { assertText, component, flush } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [obj0, obj1, obj0]; }
      );
      assertText('0-0 1-1 2-0 ');

      component.items.push(obj0);
      flush();

      assertText('0-0 1-1 2-0 3-0 ');
    });

    it('duplicate object + sort', function () {
      const obj0 = { toString() { return '0'; } };
      const obj1 = { toString() { return '1'; } };

      const { assertText, component, flush } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [obj0, obj1, obj0]; }
      );
      assertText('0-0 1-1 2-0 ');

      component.items.sort();
      flush();

      assertText('0-0 1-0 2-1 ');
    });

    // TODO: fix contextual props $index when sorting
    // it('primitive string + sort (move to contextual props tests)', function () {
    it('primitive string + sort (move to contextual props tests)', function () {
      const { assertText, component, flush } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = ['c', 'b', 'a']; }
      );
      assertText('0-c 1-b 2-a ');

      component.items.sort();
      flush();

      assertText('0-a 1-b 2-c ');
    });

    it('object duplication unshift (issue #2078)', function () {
      const objA = { toString() { return 'A'; } };
      const objB = { toString() { return 'B'; } };

      const { assertText, component, flush } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [objA, objB]; }
      );
      assertText('0-A 1-B ');

      component.items.unshift(objB);
      flush();

      assertText('0-B 1-A 2-B ');
    });

    it('object duplication push with multiple references', function () {
      const objA = { toString() { return 'A'; } };
      const objB = { toString() { return 'B'; } };

      const { assertText, component, flush } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [objA, objB]; }
      );
      assertText('0-A 1-B ');

      component.items.push(objA, objB);
      flush();

      assertText('0-A 1-B 2-A 3-B ');
    });

    it('object duplication splice in the middle', function () {
      const objA = { toString() { return 'A'; } };
      const objB = { toString() { return 'B'; } };
      const objC = { toString() { return 'C'; } };

      const { assertText, component, flush } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [objA, objB, objC]; }
      );
      assertText('0-A 1-B 2-C ');

      component.items.splice(1, 1, objA, objA);
      flush();

      assertText('0-A 1-A 2-A 3-C ');
    });

    it('object duplication sort (ascending vs. descending)', function () {
      const obj1 = { id: 3, toString() { return `X${this.id}`; } };
      const obj2 = { id: 1, toString() { return `X${this.id}`; } };
      const obj3 = { id: 2, toString() { return `X${this.id}`; } };
      const obj2Dup = obj2;

      const { assertText, component, flush } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [obj1, obj2, obj3, obj2Dup]; }
      );
      assertText('0-X3 1-X1 2-X2 3-X1 ');

      component.items.sort((a, b) => a.id - b.id);
      flush();

      assertText('0-X1 1-X1 2-X2 3-X3 ');

      component.items.sort((a, b) => b.id - a.id);
      flush();

      assertText('0-X3 1-X2 2-X1 3-X1 ');
    });

    it('unshift multiple duplicates', function () {
      const objA = { toString() { return 'A'; } };

      const { assertText, component, flush } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [objA, objA]; }
      );
      assertText('0-A 1-A ');

      component.items.unshift(objA);
      flush();
      assertText('0-A 1-A 2-A ');

      component.items.unshift(objA);
      flush();
      assertText('0-A 1-A 2-A 3-A ');
    });
  });
});
