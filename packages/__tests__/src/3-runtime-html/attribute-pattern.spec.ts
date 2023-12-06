import { DI, Constructable } from '@aurelia/kernel';
import {
  attributePattern,
  AttributePatternDefinition,
  IAttributePattern,
  ISyntaxInterpreter,
  AttributePattern
} from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

describe('3-runtime-html/attribute-pattern.spec.ts', function () {
  for (const [defs, tests] of [
    [
      [
        { pattern: 'PART.PART', symbols: '.' }
      ],
      [
        ['value.bind',  'PART.PART', ['value', 'bind']],
        ['.bind',       null,        []],
        ['bind',        null,        []],
        ['value.',      null,        []],
        ['value',       null,        []],
        ['.',           null,        []]
      ]
    ],
    [
      [
        { pattern: 'PART.PART', symbols: '.' },
        { pattern: 'asdf.PART', symbols: '.' },
        { pattern: 'PART.asdf', symbols: '.' }
      ],
      [
        ['value.bind', 'PART.PART',  ['value', 'bind']],
        ['.bind',       null,        []],
        ['bind',        null,        []],
        ['value.',      null,        []],
        ['value',       null,        []],
        ['.',           null,        []]
      ]
    ],
    [
      [
        { pattern: 'PART.PART', symbols: '.' },
        { pattern: ':PART', symbols: ':' }
      ],
      [
        ['value.bind',  'PART.PART',    ['value', 'bind']],
        [':.:',         'PART.PART',    [':', ':']],
        [':value.bind', 'PART.PART',    [':value', 'bind']],
        ['value.bind:', 'PART.PART',    ['value', 'bind:']],
        [':value',      ':PART',        ['value']],
        [':.',          ':PART',        ['.']],
        [':value.',     ':PART',        ['value.']],
        ['.bind',       null,           []],
        ['bind',        null,           []],
        ['value.',      null,           []],
        ['value',       null,           []],
        ['value:',      null,           []],
        ['.',           null,           []],
        [':',           null,           []],
        ['::',          null,           []],
        ['..',          null,           []],
        ['.:',          null,           []],
        ['.value:',     null,           []],
        ['value:bind',  null,           []]
      ]
    ],
    [
      [
        { pattern: 'PART.PART', symbols: '.' },
        { pattern: '@PART', symbols: '@' }
      ],
      [
        ['value.bind',  'PART.PART',    ['value', 'bind']],
        ['@.@',         'PART.PART',    ['@', '@']],
        ['@value.bind', 'PART.PART',    ['@value', 'bind']],
        ['value.bind@', 'PART.PART',    ['value', 'bind@']],
        ['@value',      '@PART',        ['value']],
        ['@.',          '@PART',        ['.']],
        ['@value.',     '@PART',        ['value.']],
        ['.bind',       null,           []],
        ['bind',        null,           []],
        ['value.',      null,           []],
        ['value',       null,           []],
        ['value@',      null,           []],
        ['.',           null,           []],
        ['@',           null,           []],
        ['@@',          null,           []],
        ['..',          null,           []],
        ['.@',          null,           []],
        ['.value@',     null,           []],
        ['value@bind',  null,           []]
      ]
    ],
    [
      [
        { pattern: 'PART.PART', symbols: '.' },
        { pattern: '@PART', symbols: '@' },
        { pattern: ':PART', symbols: ':' }
      ],
      [
        ['value.bind',   'PART.PART',    ['value', 'bind']],
        [':value',       ':PART',        ['value']],
        ['@value',       '@PART',        ['value']],
        [':.:',          'PART.PART',    [':', ':']],
        ['@.@',          'PART.PART',    ['@', '@']],
        [':value.bind',  'PART.PART',    [':value', 'bind']],
        ['@value.bind',  'PART.PART',    ['@value', 'bind']],
        ['@:value.bind', 'PART.PART',    ['@:value', 'bind']],
        [':@value.bind', 'PART.PART',    [':@value', 'bind']],
        ['@:value',      '@PART',        [':value']],
        [':@value',      ':PART',        ['@value']],
        ['value.bind:',  'PART.PART',    ['value', 'bind:']],
        ['value.bind@',  'PART.PART',    ['value', 'bind@']],
        [':value',       ':PART',        ['value']],
        ['@value',       '@PART',        ['value']],
        [':.',           ':PART',        ['.']],
        ['@.',           '@PART',        ['.']],
        [':value.',      ':PART',        ['value.']],
        ['@value.',      '@PART',        ['value.']],
        ['.bind',        null,           []],
        ['bind',         null,           []],
        ['value.',       null,           []],
        ['value',        null,           []],
        ['value:',       null,           []],
        ['value@',       null,           []],
        ['.',            null,           []],
        ['..',           null,           []],
        [':',            null,           []],
        ['@',            null,           []],
        ['::',           null,           []],
        ['@@',           null,           []],
        ['.:',           null,           []],
        ['.@',           null,           []],
        ['.value:',      null,           []],
        ['.value@',      null,           []],
        ['value:bind',   null,           []],
        ['value@bind',   null,           []]
      ]
    ],
    // overlapping characters for promise + i18n combo
    // then before t to make sure it still terminates at the correct position
    [
      [
        { pattern: "promise.resolve", symbols: '' },
        { pattern: "then", symbols: '' },
        { pattern: "catch", symbols: '' },
        { pattern: "ref", symbols: '' },
        { pattern: "PART.ref", symbols: '.' },
        { pattern: "PART.PART", symbols: '.' },
        { pattern: "PART.PART.PART", symbols: '.' },
        { pattern: 't.PART', symbols: '.' },
        { pattern: 'PART.t', symbols: '.' },
        { pattern: "t", symbols: '' },
        { pattern: "t.bind", symbols: '' },
        { pattern: "t-params.bind", symbols: '' },
      ],
      [
        ['t', 't', ['t']],
        ['tt.bind', 'PART.PART', ['tt', 'bind']],
        ['t.bind', 't.PART', ['t', 'bind']],
        ['then', 'then', ['then']],
        ['t-params.bind', 't-params.bind', ['t-params.bind']],
      ],
    ],
    [
      [
        { pattern: 'then', symbols: '' },
        { pattern: 'the', symbols: '' },
        { pattern: 'th', symbols: '' },
        { pattern: 't', symbols: '' },
        { pattern: 't.PART', symbols: '.' },
      ],
      [
        ['tt', null, []],
        ['t', 't', ['t']],
        ['th', 'th', ['th']],
        ['the', 'the', ['the']],
        ['then', 'then', ['then']],
      ],
    ],
    [
      [
        { pattern: 'then', symbols: '' },
        { pattern: 'the', symbols: '' },
        { pattern: 'th', symbols: '' },
        { pattern: 't', symbols: '' },
        { pattern: 't.PART', symbols: '.' },
      ],
      [
        ['then', 'then', ['then']],
        ['the', 'the', ['the']],
        ['th', 'th', ['th']],
        ['t', 't', ['t']],
        ['tt', null, []],
      ],
    ],
    [
      [
        { pattern: 't', symbols: '' },
        { pattern: 'th', symbols: '' },
        { pattern: 'the', symbols: '' },
        { pattern: 'then', symbols: '' },
        { pattern: 't.PART', symbols: '.' },
      ],
      [
        ['then', 'then', ['then']],
        ['the', 'the', ['the']],
        ['th', 'th', ['th']],
        ['t', 't', ['t']],
        ['tt', null, []],
      ],
    ],
    [
      [
        { pattern: 't', symbols: '' },
        { pattern: 'th', symbols: '' },
        { pattern: 'the', symbols: '' },
        { pattern: 'then', symbols: '' },
        { pattern: 't.PART', symbols: '.' },
      ],
      [
        ['t', 't', ['t']],
        ['th', 'th', ['th']],
        ['the', 'the', ['the']],
        ['then', 'then', ['then']],
        ['tt', null, []],
      ],
    ],
  ] as [AttributePatternDefinition[], [string, string, string[]][]][]) {
    describe(`[UNIT] parse [${defs.map(d => d.pattern)}]`, function () {
      for (const [value, match, parts] of tests) {
        it(`parse [${defs.map(d => d.pattern)}] -> interpret [${value}] -> match=[${match}]`, function () {
          let receivedRawName: string;
          let receivedRawValue: string;
          let receivedParts: string[];
          @attributePattern(...defs)
          class ThePattern {}
          for (const { pattern } of defs) {
            ThePattern.prototype[pattern] = (rawName, rawValue, parts) => {
              receivedRawName = rawName;
              receivedRawValue = rawValue;
              receivedParts = parts;
            };
          }
          const container = DI.createContainer();
          container.register(ThePattern as any);
          const interpreter = container.get(ISyntaxInterpreter);
          const attrPattern = container.get(IAttributePattern);
          const patternDefs = AttributePattern.getPatternDefinitions(attrPattern.constructor as Constructable);
          interpreter.add(patternDefs);

          const result = interpreter.interpret(value);
          if (match != null) {
            assert.strictEqual(result.pattern, match);
            assert.strictEqual(
              patternDefs.map(d => d.pattern).includes(result.pattern),
              true,
              `patternDefs.map(d => d.pattern).indexOf(result.pattern) >= 0\n  result: ${result.pattern}`
            );
            attrPattern[result.pattern](value, 'foo', result.parts);
            assert.strictEqual(receivedRawName, value, `receivedRawName`);
            assert.strictEqual(receivedRawValue, 'foo', `receivedRawValue`);
            assert.deepStrictEqual(receivedParts, result.parts, `receivedParts`);
          } else {
            assert.strictEqual(
              !patternDefs.map(d => d.pattern).includes(result.pattern),
              true,
              `patternDefs.map(d => d.pattern).indexOf(result.pattern) === -1`
            );
          }

          assert.deepStrictEqual(result.parts, parts, `result.parts`);
        });
      }
    });
  }
});
