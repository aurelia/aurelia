import { expect } from 'chai';
import { SyntaxInterpreter, attributePattern, IAttributePattern, ISyntaxInterpreter } from '../../src/attribute-pattern';
import { DI } from '@aurelia/kernel';


describe('SyntaxInterpreter', () => {
  for (const [patterns, tests] of <[string[], [string, string, string[]][]][]>[
    [
      ['target.command'],
      [
        ['value.bind',  'target.command', ['value', 'bind']],
        ['.bind',       null,             []],
        ['bind',        null,             ['bind']],
        ['value.',      null,             ['value']],
        ['value',       null,             ['value']],
        ['.',           null,             []]
      ]
    ],
    [
      ['target.command', 'asdf.command', 'target.asdf'],
      [
        ['value.bind', 'target.command',  ['value', 'bind']],
        ['.bind',       null,             []],
        ['bind',        null,             ['bind']],
        ['value.',      null,             ['value']],
        ['value',       null,             ['value']],
        ['.',           null,             []]
      ]
    ],
    [
      ['target.command', ':target'],
      [
        ['value.bind',  'target.command', ['value', 'bind']],
        [':value',      ':target',        ['value']],
        ['.bind',       null,             []],
        ['bind',        null,             ['bind']],
        ['value.',      null,             ['value']],
        ['value',       null,             ['value']],
        ['.',           null,             []],
        ['value:',      null,             []],
        [':',           null,             []],
        [':.',          null,             []],
        [':value.',     null,             []],
        ['.value:',     null,             []],
        [':value.bind', null,             []],
        ['value.bind:', null,             ['value']],
        ['value:bind',  null,             []]
      ]
    ]
  ]) {
    describe(`parse [${patterns}]`, () => {
      for (const [value, match, values] of tests) {
        it(`parse [${patterns}] -> interpret [${value}] -> match=[${match}]`, () => {
          const sut = new SyntaxInterpreter();
          sut.add(patterns);

          const result = sut.interpret(value);
          expect(result.pattern).to.equal(match);
          expect(result.parts).to.deep.equal(values);
        });
      }
    });
  }
});

describe('@attributePattern', () => {
  for (const [patterns, tests] of <[string[], [string, string, string[]][]][]>[
    [
      ['target.command'],
      [
        ['value.bind',  'target.command', ['value', 'bind']]
      ]
    ],
    [
      ['target.command', 'asdf.command', 'target.asdf'],
      [
        ['value.bind', 'target.command',  ['value', 'bind']]
      ]
    ],
    [
      ['target.command', ':target'],
      [
        ['value.bind',  'target.command', ['value', 'bind']],
        [':value',      ':target',        ['value']]
      ]
    ]
  ]) {
    describe(`parse [${patterns}]`, () => {
      for (const [value, match, values] of tests) {
        it(`parse [${patterns}] -> interpret [${value}] -> match=[${match}]`, () => {
          let receivedRawName: string;
          let receivedRawValue: string;
          let receivedParts: string[];
          @attributePattern(patterns)
          class ThePattern {}
          for (const pattern of patterns) {
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
          interpreter.add(attrPattern.$patternOrPatterns);

          const result = interpreter.interpret(value);
          if (Array.isArray(attrPattern.$patternOrPatterns)) {
            expect(attrPattern.$patternOrPatterns.indexOf(result.pattern)).to.be.gte(0);
          } else {
            expect(attrPattern.$patternOrPatterns).to.equal(result.pattern);
          }

          attrPattern[result.pattern](value, 'foo', result.parts);
          expect(receivedRawName).to.equal(value);
          expect(receivedRawValue).to.equal('foo');
          expect(receivedParts).to.deep.equal(result.parts);
          expect(result.parts).to.deep.equal(values);
        });
      }
    });
  }
});
