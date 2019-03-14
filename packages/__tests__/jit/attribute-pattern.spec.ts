import { DI } from '@aurelia/kernel';
import { expect } from 'chai';
import {
  attributePattern,
  AttributePatternDefinition,
  IAttributePattern,
  ISyntaxInterpreter
} from '../src/index';

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
          // @ts-ignore
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
            expect(attrPattern.$patternDefs.map(d => d.pattern).indexOf(result.pattern)).to.be.gte(0);
            attrPattern[result.pattern](value, 'foo', result.parts);
            expect(receivedRawName).to.equal(value);
            expect(receivedRawValue).to.equal('foo');
            expect(receivedParts).to.deep.equal(result.parts);
          } else {
            expect(attrPattern.$patternDefs.map(d => d.pattern)).not.to.contain(result.pattern);
          }

          expect(result.parts).to.deep.equal(values);
        });
      }
    });
  }
});
