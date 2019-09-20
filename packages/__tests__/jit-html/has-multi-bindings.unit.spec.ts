import { hasMultipleBindings } from '@aurelia/jit-html';
import { assert } from '@aurelia/testing';

describe.skip('has-multi-bindings.unit.spec.ts', function() {
  type IHasMultipleBindingParserTestCase = [/* attr value */string, /* has multiple bindings? */boolean];

  const testCases: IHasMultipleBindingParserTestCase[] = [
    ['color', false],
    ['${c}', false],
    ['http\\://abc.def', false],
    ['1111', false],
    ['1.11', false],
    // ['::Math', false], // should throw?
    // [':::::Math', false], // should throw?
    ['${a | b:{c:b}}', false],
    ['${a & b:{c:b}}', false],
    ['${a & b:{c:b}} ${a & b:{c:b}}', false],
    ['a:b', true],
    ['a:a;b: b', true],
    ['a:1;b: 2', true],
    ['a.bind:1;b: 2', true],
    ['a:1; b.bind: 2', true],
    ['a:1 | c:d; b.bind: 2', true],
    ['a.bind:1 | c:d; b.bind: 2', true],
    ['a: ${a | c:d} abcd; b.bind: 2', true],
    ['a: http\\:/ahbc.def; b.bind: 2', true],
    ['a-a.bind: bcd; b-b5.bind: 2', true],
    // router v1 scenarios
    ['route: mainRoute; params.bind: { name: name, address, id: userId }', true],
    ['params.bind: { name: name, address, id: userId }; route: mainRoute;', true],
    // router v1 scenarios, twisted
    ['params.bind: { name: name, address, id: userId } | normalizeAddress; route: mainRoute', true],
    ['params.bind: { name: name, address, id: userId } | normalizeAddress; route: mainRoute;', true],
    ['params.bind: { name: name, address, id: userId } | normalizeAddress:`en-us`; route: mainRoute', true],
    ['params.bind: { name: name, address, id: userId } | normalizeAddress:`en-us`; route: mainRoute;', true],
  ];

  for (const testCase of testCases) {
    const [attrValue, isMultiple] = testCase;
    it(`detects multiple bindings on ${attrValue} (${isMultiple}) correctly`, function() {
      assert.strictEqual(hasMultipleBindings(attrValue), isMultiple, ``);
    });
  }
});
