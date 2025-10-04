import { tasksSettled } from '@aurelia/runtime';
import { CustomElement } from '@aurelia/runtime-html';
import {
  createFixture,
} from '@aurelia/testing';

describe('3-runtime-html/repeat.previous.spec.ts', function () {
  describe('$previous contextual property', function () {

    it('$previous is null for first item when previous.bind: true', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous === null ? 'null' : $previous}:\${item} </div>`,
        class { items = ['a', 'b', 'c']; }
      );
      assertText('null:a a:b b:c ');
    });

    it('$previous is undefined when previous.bind is not used', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items">\${typeof $previous}:\${item} </div>`,
        class { items = ['a', 'b', 'c']; }
      );
      assertText('undefined:a undefined:b undefined:c ');
    });

    it('$previous tracks previous item in array of primitives', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}-\${item} </div>`,
        class { items = [1, 2, 3, 4]; }
      );
      assertText('null-1 1-2 2-3 3-4 ');
    });

    it('$previous tracks previous object in array', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous?.value ?? 'null'}-\${item.value} </div>`,
        class { items = [{ value: 'a' }, { value: 'b' }, { value: 'c' }]; }
      );
      assertText('null-a a-b b-c ');
    });

    it('$previous updates correctly after push()', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}-\${item} </div>`,
        class { items = ['a', 'b']; }
      );
      assertText('null-a a-b ');

      component.items.push('c', 'd');
      await tasksSettled();

      assertText('null-a a-b b-c c-d ');
    });

    it('$previous updates correctly after unshift()', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}-\${item} </div>`,
        class { items = ['b', 'c']; }
      );
      assertText('null-b b-c ');

      component.items.unshift('a');
      await tasksSettled();

      assertText('null-a a-b b-c ');
    });

    it('$previous updates correctly after splice() insert', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}-\${item} </div>`,
        class { items = ['a', 'c']; }
      );
      assertText('null-a a-c ');

      component.items.splice(1, 0, 'b');
      await tasksSettled();

      assertText('null-a a-b b-c ');
    });

    it('$previous updates correctly after splice() remove', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}-\${item} </div>`,
        class { items = ['a', 'b', 'c']; }
      );
      assertText('null-a a-b b-c ');

      component.items.splice(1, 1);
      await tasksSettled();

      assertText('null-a a-c ');
    });

    it('$previous updates correctly after pop()', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}-\${item} </div>`,
        class { items = ['a', 'b', 'c']; }
      );
      assertText('null-a a-b b-c ');

      component.items.pop();
      await tasksSettled();

      assertText('null-a a-b ');
    });

    it('$previous updates correctly after shift()', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}-\${item} </div>`,
        class { items = ['a', 'b', 'c']; }
      );
      assertText('null-a a-b b-c ');

      component.items.shift();
      await tasksSettled();

      assertText('null-b b-c ');
    });

    it('$previous updates correctly after reverse()', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}-\${item} </div>`,
        class { items = ['a', 'b', 'c']; }
      );
      assertText('null-a a-b b-c ');

      component.items.reverse();
      await tasksSettled();

      assertText('null-c c-b b-a ');
    });

    it('$previous updates correctly after sort()', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}-\${item} </div>`,
        class { items = [3, 1, 2]; }
      );
      assertText('null-3 3-1 1-2 ');

      component.items.sort();
      await tasksSettled();

      assertText('null-1 1-2 2-3 ');
    });

    it('$previous works with Map collection', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="[key, value] of items; previous.bind: true">\${$previous?.[0] ?? 'null'}:\${key}-\${value} </div>`,
        class { items = new Map([['a', 1], ['b', 2], ['c', 3]]); }
      );
      assertText('null:a-1 a:b-2 b:c-3 ');
    });

    it('$previous works with Set collection', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}-\${item} </div>`,
        class { items = new Set(['x', 'y', 'z']); }
      );
      assertText('null-x x-y y-z ');
    });

    it('$previous works with number iteration', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}-\${item} </div>`,
        class { items = 4; }
      );
      assertText('null-0 0-1 1-2 2-3 ');
    });

    it('$previous works with keyed repeat (key.bind)', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; key: id; previous.bind: true">\${$previous?.id ?? 'null'}:\${item.id}-\${item.name} </div>`,
        class { items = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }]; }
      );
      assertText('null:1-a 1:2-b 2:3-c ');

      // Reassign reversed array instead of mutating in-place
      component.items = [{ id: 3, name: 'c' }, { id: 2, name: 'b' }, { id: 1, name: 'a' }];
      await tasksSettled();

      assertText('null:3-c 3:2-b 2:1-a ');
    });

    it('$previous works with destructured locals (array destructuring)', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="[key, value] of items; previous.bind: true">P:\${$previous?.[0] ?? 'X'}/K:\${key}/V:\${value}|</div>`,
        class { items = new Map([['a', 1], ['b', 2], ['c', 3]]); }
      );
      assertText('P:X/K:a/V:1|P:a/K:b/V:2|P:b/K:c/V:3|');
    });

    it('nested repeats: inner $previous does not interfere with outer', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="outer of outers; previous.bind: true"><span>\${$previous ?? 'null'}:\${outer}</span><div repeat.for="inner of inners; previous.bind: true">[\${$previous ?? 'null'}-\${inner}]</div></div>`,
        class {
          outers = ['A', 'B'];
          inners = [1, 2];
        }
      );
      // Outer: null:A, then A:B
      // For each outer, inner resets: [null-1][1-2]
      assertText('null:A[null-1][1-2]A:B[null-1][1-2]');
    });

    it('section divider use case: render headers when section changes', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items; previous.bind: true"><h2 if.bind="item.section !== $previous?.section">Section: \${item.section}</h2><div>\${item.name}</div></div>`,
        class {
          items = [
            { section: 'A', name: 'Item 1' },
            { section: 'A', name: 'Item 2' },
            { section: 'B', name: 'Item 3' },
            { section: 'B', name: 'Item 4' },
            { section: 'C', name: 'Item 5' },
          ];
        }
      );
      // Sections A, B, C should each render a header
      assertText('Section: AItem 1Item 2Section: BItem 3Item 4Section: CItem 5');
    });

    it('section divider updates correctly after sort', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; previous.bind: true"><h2 if.bind="item.section !== $previous?.section">Section: \${item.section}</h2><div>\${item.name}</div></div>`,
        class {
          items = [
            { section: 'A', name: 'Item 1' },
            { section: 'B', name: 'Item 2' },
            { section: 'A', name: 'Item 3' },
          ];
        }
      );
      // Initial: A, B, A headers
      assertText('Section: AItem 1Section: BItem 2Section: AItem 3');

      // Sort by section to group them
      component.items.sort((a, b) => a.section.localeCompare(b.section));
      await tasksSettled();

      // After sort: A, A, B - should only show two headers
      assertText('Section: AItem 1Item 3Section: BItem 2');
    });

    it('$previous works with static previous: true (without bind)', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items; previous: true">\${$previous ?? 'null'}-\${item} </div>`,
        class { items = ['a', 'b', 'c']; }
      );
      assertText('null-a a-b b-c ');
    });

    it('$previous is disabled with previous: false', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items; previous: false">\${typeof $previous}:\${item} </div>`,
        class { items = ['a', 'b']; }
      );
      assertText('undefined:a undefined:b ');
    });

    it('$previous can be enabled via expression (previous.bind: someBoolean)', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items; previous.bind: enablePrevious">\${typeof $previous === 'undefined' ? 'undef' : ($previous ?? 'null')}-\${item} </div>`,
        class {
          items = ['a', 'b', 'c'];
          enablePrevious = true;
        }
      );
      assertText('null-a a-b b-c ');
    });

    it('$previous remains disabled when expression evaluates to false', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items; previous.bind: enablePrevious">\${typeof $previous === 'undefined' ? 'undef' : ($previous ?? 'null')}-\${item} </div>`,
        class {
          items = ['a', 'b', 'c'];
          enablePrevious = false;
        }
      );
      assertText('undef-a undef-b undef-c ');
    });

    it('$previous with empty array', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${item}</div>`,
        class { items: string[] = []; }
      );
      assertText('');
    });

    it('$previous with single item', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}:\${item} </div>`,
        class { items = ['only']; }
      );
      assertText('null:only ');
    });

    // ======================================================================
    // Tests for <template> elements
    // ======================================================================

    it('$previous works with <template> element repeat', async function () {
      const { assertText } = createFixture(
        `<template><template repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}-\${item} </template></template>`,
        class { items = ['a', 'b', 'c']; }
      );
      assertText('null-a a-b b-c ');
    });

    it('$previous works with nested <template> repeats', async function () {
      const { assertText } = createFixture(
        `<template><template repeat.for="outer of outers; previous.bind: true"><span>Outer: \${$previous ?? 'null'}:\${outer}|</span><template repeat.for="inner of inners; previous.bind: true">Inner[\${$previous ?? 'null'}-\${inner}]</template></template></template>`,
        class {
          outers = ['A', 'B'];
          inners = [1, 2];
        }
      );
      assertText('Outer: null:A|Inner[null-1]Inner[1-2]Outer: A:B|Inner[null-1]Inner[1-2]');
    });

    it('$previous updates correctly in <template> after array mutation', async function () {
      const { assertText, component } = createFixture(
        `<template><template repeat.for="item of items; previous.bind: true">\${$previous ?? 'null'}-\${item} </template></template>`,
        class { items = ['x', 'y']; }
      );
      assertText('null-x x-y ');

      component.items.push('z');
      await tasksSettled();

      assertText('null-x x-y y-z ');
    });

    it('$previous works with <template> and if.bind combination', async function () {
      const { assertText, component } = createFixture(
        `<template><template repeat.for="item of items; previous.bind: true"><span if.bind="item.show">\${$previous?.value ?? 'null'}:\${item.value} </span></template></template>`,
        class {
          items = [
            { value: 'a', show: true },
            { value: 'b', show: true },
            { value: 'c', show: true }
          ];
        }
      );
      assertText('null:a a:b b:c ');

      component.items[1].show = false;
      await tasksSettled();

      // $previous should still track correctly even though middle item is hidden
      assertText('null:a b:c ');
    });

    // ======================================================================
    // Tests for custom elements with $previous
    // ======================================================================

    it('$previous works when repeating custom elements', async function () {
      const { assertText } = createFixture(
        `<div repeat.for="item of items; previous.bind: true"><my-element value.bind="item" prev.bind="$previous"></my-element></div>`,
        class { items = ['a', 'b', 'c']; },
        [
          CustomElement.define(
            { name: 'my-element', template: '\${prev ?? "null"}-\${value}|', bindables: ['value', 'prev'] },
            class { value: any; prev: any; }
          )
        ]
      );
      assertText('null-a|a-b|b-c|');
    });

    it('$previous works in custom element nested repeat', async function () {
      const { assertText } = createFixture(
        `<my-repeater items.bind="items"></my-repeater>`,
        class { items = ['x', 'y', 'z']; },
        [
          CustomElement.define(
            {
              name: 'my-repeater',
              template: '<div repeat.for="item of items; previous.bind: true">\${$previous ?? "null"}:\${item} </div>',
              bindables: ['items']
            },
            class { items: any; }
          )
        ]
      );
      assertText('null:x x:y y:z ');
    });

    it('$previous with custom element and keyed repeat', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; key: id; previous.bind: true"><my-item data.bind="item" prev-id.bind="$previous?.id ?? 'null'"></my-item></div>`,
        class { items = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }]; },
        [
          CustomElement.define(
            {
              name: 'my-item',
              template: '[\${prevId}→\${data.id}]',
              bindables: ['data', 'prevId']
            },
            class { data: any; prevId: any; }
          )
        ]
      );
      assertText('[null→1][1→2][2→3]');

      // Reverse the array - keys should keep the views, but $previous should update
      component.items = [{ id: 3, name: 'c' }, { id: 2, name: 'b' }, { id: 1, name: 'a' }];
      await tasksSettled();

      assertText('[null→3][3→2][2→1]');
    });

    // ======================================================================
    // Tests for dynamic enabling/disabling of $previous
    // ======================================================================

    it('previous.bind is evaluated once (not reactive) when toggling a boolean', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; previous.bind: showPrevious">\${typeof $previous === 'undefined' ? 'undef' : ($previous ?? 'null')}-\${item} </div>`,
        class {
          items = ['a', 'b', 'c'];
          showPrevious = true;
        }
      );
      // Initially enabled
      assertText('null-a a-b b-c ');

      // Disable $previous (should not affect already bound repeat)
      component.showPrevious = false;
      await tasksSettled();
      assertText('null-a a-b b-c ');

      // Re-enable $previous (still no change)
      component.showPrevious = true;
      await tasksSettled();
      assertText('null-a a-b b-c ');
    });

    it('previous.bind evaluates once even if the bound property changes', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; previous.bind: config.enablePrevious">\${typeof $previous === 'undefined' ? 'X' : ($previous ?? 'N')}-\${item}|</div>`,
        class {
          items = ['1', '2', '3'];
          config = { enablePrevious: false };
        }
      );
      assertText('X-1|X-2|X-3|');

      // Changing the expression after bind does not affect $previous
      component.config.enablePrevious = true;
      await tasksSettled();
      assertText('X-1|X-2|X-3|');
    });

    it('previous.bind remains effective across array mutations (non-reactive config)', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; previous.bind: enabled">\${$previous ?? 'null'}:\${item} </div>`,
        class {
          items = ['a', 'b'];
          enabled = true;
        }
      );
      assertText('null:a a:b ');

      // Add items while enabled
      component.items.push('c');
      await tasksSettled();
      assertText('null:a a:b b:c ');

      // Disable $previous (no effect post-bind)
      component.enabled = false;
      await tasksSettled();
      assertText('null:a a:b b:c ');

      // Add items while disabled (still using original enabled state)
      component.items.push('d');
      await tasksSettled();
      assertText('null:a a:b b:c c:d ');

      // Re-enable $previous (no effect)
      component.enabled = true;
      await tasksSettled();
      assertText('null:a a:b b:c c:d ');
    });

    // ======================================================================
    // Tests for $previous with keys
    // ======================================================================

    it('$previous with keyed repeat tracks correct items after reorder', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; key: id; previous.bind: true">\${$previous?.id ?? 'null'}→\${item.id}(\${item.name}) </div>`,
        class { items = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }]; }
      );
      assertText('null→1(a) 1→2(b) 2→3(c) ');

      // Reverse array - DOM should reorder but preserve keyed views
      component.items.reverse();
      await tasksSettled();

      assertText('null→3(c) 3→2(b) 2→1(a) ');
    });

    it('$previous with keyed repeat handles insertions correctly', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; key: id; previous.bind: true">[\${$previous?.id ?? 'X'}::\${item.id}]</div>`,
        class { items = [{ id: 1, name: 'a' }, { id: 3, name: 'c' }]; }
      );
      assertText('[X::1][1::3]');

      // Insert in the middle
      component.items.splice(1, 0, { id: 2, name: 'b' });
      await tasksSettled();

      assertText('[X::1][1::2][2::3]');
    });

    it('$previous with keyed repeat handles deletions correctly', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; key: id; previous.bind: true">(\${$previous?.id ?? '-'})→(\${item.id})</div>`,
        class { items = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }, { id: 4, name: 'd' }]; }
      );
      assertText('(-)→(1)(1)→(2)(2)→(3)(3)→(4)');

      // Remove item with id 2
      component.items.splice(1, 1);
      await tasksSettled();

      assertText('(-)→(1)(1)→(3)(3)→(4)');
    });

    it('$previous with keyed repeat and complex object keys', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; key: code; previous.bind: true">\${$previous?.code ?? 'START'}→\${item.code}|\${item.label} </div>`,
        class {
          items = [
            { code: 'US', label: 'USA' },
            { code: 'UK', label: 'United Kingdom' },
            { code: 'FR', label: 'France' }
          ];
        }
      );
      assertText('START→US|USA US→UK|United Kingdom UK→FR|France ');

      // Sort alphabetically by code
      component.items.sort((a, b) => a.code.localeCompare(b.code));
      await tasksSettled();

      assertText('START→FR|France FR→UK|United Kingdom UK→US|USA ');
    });

    it('$previous with keyed repeat works with Set values', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; key: id; previous.bind: true">\${$previous?.id ?? 'null'}→\${item.id} </div>`,
        class {
          items = new Set([{ id: 1 }, { id: 2 }, { id: 3 }]);
        }
      );
      // Sets maintain insertion order
      assertText('null→1 1→2 2→3 ');

      // Replace the Set with a new order
      const arr = Array.from(component.items).reverse();
      component.items = new Set(arr);
      await tasksSettled();

      assertText('null→3 3→2 2→1 ');
    });

    it('$previous with keyed repeat maintains correct tracking during mixed operations', async function () {
      const { assertText, component } = createFixture(
        `<div repeat.for="item of items; key: id; previous.bind: true">[\${$previous?.id ?? 'NULL'}→\${item.id}::\${item.name}]</div>`,
        class { items = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }]; }
      );
      assertText('[NULL→1::a][1→2::b][2→3::c]');

      // Remove first, add at end
      component.items.shift();
      component.items.push({ id: 4, name: 'd' });
      await tasksSettled();

      assertText('[NULL→2::b][2→3::c][3→4::d]');

      // Insert at beginning
      component.items.unshift({ id: 0, name: 'zero' });
      await tasksSettled();

      assertText('[NULL→0::zero][0→2::b][2→3::c][3→4::d]');
    });
  });
});
