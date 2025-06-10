import { createFixture } from '@aurelia/testing';
import { runTasks } from '@aurelia/runtime';

describe("3-runtime-html/repeat.duplicates.spec.ts", function () {
  describe('yield correct $index', function () {
    it('duplicate primitive string', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = ['a', 'b', 'a']; }
      );
      assertText('0-a 1-b 2-a ');

      component.items.push('a');
      runTasks();

      assertText('0-a 1-b 2-a 3-a ');
    });

    it('duplicate primitive string + push + sort', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = ['a', 'b', 'a']; }
      );
      assertText('0-a 1-b 2-a ');

      component.items.sort();
      runTasks();

      assertText('0-a 1-a 2-b ');
    });

    it('duplicate primitive number', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [0, 1, 0]; }
      );
      assertText('0-0 1-1 2-0 ');

      component.items.push(0);
      runTasks();

      assertText('0-0 1-1 2-0 3-0 ');
    });

    it('duplicate primitive number + sort', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [0, 1, 0]; }
      );
      assertText('0-0 1-1 2-0 ');

      component.items.sort();
      runTasks();

      assertText('0-0 1-0 2-1 ');
    });

    it('duplicate object', async function () {
      const obj0 = { toString() { return '0'; } };
      const obj1 = { toString() { return '1'; } };

      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [obj0, obj1, obj0]; }
      );
      assertText('0-0 1-1 2-0 ');

      component.items.push(obj0);
      runTasks();

      assertText('0-0 1-1 2-0 3-0 ');
    });

    it('duplicate object + sort', async function () {
      const obj0 = { toString() { return '0'; } };
      const obj1 = { toString() { return '1'; } };

      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [obj0, obj1, obj0]; }
      );
      assertText('0-0 1-1 2-0 ');

      component.items.sort();
      runTasks();

      assertText('0-0 1-0 2-1 ');
    });

    // TODO: fix contextual props $index when sorting
    // it('primitive string + sort (move to contextual props tests)', async function () {
    it('primitive string + sort (move to contextual props tests)', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = ['c', 'b', 'a']; }
      );
      assertText('0-c 1-b 2-a ');

      component.items.sort();
      runTasks();

      assertText('0-a 1-b 2-c ');
    });

    it('object duplication unshift (issue #2078)', async function () {
      const objA = { toString() { return 'A'; } };
      const objB = { toString() { return 'B'; } };

      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [objA, objB]; }
      );
      assertText('0-A 1-B ');

      component.items.unshift(objB);
      runTasks();

      assertText('0-B 1-A 2-B ');
    });

    it('object duplication push with multiple references', async function () {
      const objA = { toString() { return 'A'; } };
      const objB = { toString() { return 'B'; } };

      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [objA, objB]; }
      );
      assertText('0-A 1-B ');

      component.items.push(objA, objB);
      runTasks();

      assertText('0-A 1-B 2-A 3-B ');
    });

    it('object duplication splice in the middle', async function () {
      const objA = { toString() { return 'A'; } };
      const objB = { toString() { return 'B'; } };
      const objC = { toString() { return 'C'; } };

      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [objA, objB, objC]; }
      );
      assertText('0-A 1-B 2-C ');

      component.items.splice(1, 1, objA, objA);
      runTasks();

      assertText('0-A 1-A 2-A 3-C ');
    });

    it('object duplication sort (ascending vs. descending)', async function () {
      const obj1 = { id: 3, toString() { return `X${this.id}`; } };
      const obj2 = { id: 1, toString() { return `X${this.id}`; } };
      const obj3 = { id: 2, toString() { return `X${this.id}`; } };
      const obj2Dup = obj2;

      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [obj1, obj2, obj3, obj2Dup]; }
      );
      assertText('0-X3 1-X1 2-X2 3-X1 ');

      component.items.sort((a, b) => a.id - b.id);
      runTasks();

      assertText('0-X1 1-X1 2-X2 3-X3 ');

      component.items.sort((a, b) => b.id - a.id);
      runTasks();

      assertText('0-X3 1-X2 2-X1 3-X1 ');
    });

    it('unshift multiple duplicates', async function () {
      const objA = { toString() { return 'A'; } };

      const { assertText, component } = createFixture(
        `<div repeat.for="i of items">\${$index}-\${i} </div>`,
        class { items = [objA, objA]; }
      );
      assertText('0-A 1-A ');

      component.items.unshift(objA);
      runTasks();
      assertText('0-A 1-A 2-A ');

      component.items.unshift(objA);
      runTasks();
      assertText('0-A 1-A 2-A 3-A ');
    });
  });
});
