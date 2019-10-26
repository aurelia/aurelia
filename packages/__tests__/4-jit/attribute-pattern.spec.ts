import { DI } from '@aurelia/kernel';
import {
  attributePattern,
  AttributePatternDefinition,
  IAttributePattern,
  ISyntaxInterpreter
} from '@aurelia/jit';
import { assert } from '@aurelia/testing';

describe('@attributePattern', function () {
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
    ]
  ] as [AttributePatternDefinition[], [string, string, string[]][]][]) {
    describe(`parse [${defs.map(d => d.pattern)}]`, function () {
      for (const [value, match, values] of tests) {
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
          interpreter.add(attrPattern.$patternDefs);

          const result = interpreter.interpret(value);
          if (match != null) {
            assert.strictEqual(
              attrPattern.$patternDefs.map(d => d.pattern).includes(result.pattern),
              true,
              `attrPattern.$patternDefs.map(d => d.pattern).indexOf(result.pattern) >= 0`
            );
            attrPattern[result.pattern](value, 'foo', result.parts);
            assert.strictEqual(receivedRawName, value, `receivedRawName`);
            assert.strictEqual(receivedRawValue, 'foo', `receivedRawValue`);
            assert.deepStrictEqual(receivedParts, result.parts, `receivedParts`);
          } else {
            assert.strictEqual(
              !attrPattern.$patternDefs.map(d => d.pattern).includes(result.pattern),
              true,
              `attrPattern.$patternDefs.map(d => d.pattern).indexOf(result.pattern) === -1`
            );
          }

          assert.deepStrictEqual(result.parts, values, `result.parts`);
        });
      }
    });
  }
});
