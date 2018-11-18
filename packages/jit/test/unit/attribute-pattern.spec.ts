import { expect } from 'chai';
import { SyntaxInterpreter, attributePattern, IAttributePattern, ISyntaxInterpreter, AttributePatternDefinition } from '../../src/attribute-pattern';
import { DI } from '@aurelia/kernel';

describe('@attributePattern', () => {
  for (const [defs, tests] of <[AttributePatternDefinition[], [string, string, string[]][]][]>[
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
  ]) {
    describe(`parse [${defs.map(d => d.pattern)}]`, () => {
      for (const [value, match, values] of tests) {
        it(`parse [${defs.map(d => d.pattern)}] -> interpret [${value}] -> match=[${match}]`, () => {
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
            }
          }
          const container = DI.createContainer();
          container.register(<any>ThePattern);
          const interpreter = container.get(ISyntaxInterpreter);
          const attrPattern = container.get(IAttributePattern);
          interpreter.add(attrPattern.$patternDefs);

          const result = interpreter.interpret(value);
          if (match !== null) {
            expect(attrPattern.$patternDefs.map(d => d.pattern).indexOf(result.pattern)).to.be.gte(0);
            attrPattern[result.pattern](value, 'foo', result.parts);
            expect(receivedRawName).to.equal(value);
            expect(receivedRawValue).to.equal('foo');
            expect(receivedParts).to.deep.equal(result.parts);
          } else {
            expect(attrPattern.$patternDefs.map(d => d.pattern).indexOf(result.pattern)).to.equal(-1);
          }

          expect(result.parts).to.deep.equal(values);
        });
      }
    });
  }
});
