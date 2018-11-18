import { expect } from 'chai';
import { SyntaxInterpreter } from '../../src/attribute-pattern';


describe.only('@bindingSyntax', () => {
  for (const [patterns, tests] of <[string[], [string, string][]][]>[
    [
      ['target.command'],
      [
        ['value.bind', 'target.command'],
        ['.bind', null],
        ['bind', null],
        ['value.', null],
        ['value', null],
        ['.', null]
      ]
    ],
    [
      ['target.command', 'asdf.command', 'target.asdf'],
      [
        ['value.bind', 'target.command'],
        ['.bind', null],
        ['bind', null],
        ['value.', null],
        ['value', null],
        ['.', null]
      ]
    ],
    [
      ['target.command', ':target'],
      [
        ['value.bind', 'target.command'],
        [':value', ':target'],
        ['.bind', null],
        ['bind', null],
        ['value.', null],
        ['value', null],
        ['.', null],
        ['value:', null],
        [':', null],
        [':.', null],
        [':value.', null],
        ['.value:', null],
        [':value.bind', null],
        ['value.bind:', null],
        ['value:bind', null]
      ]
    ]
  ]) {
    describe(`parse [${patterns}]`, () => {
      for (const [value, match] of tests) {
        it(`parse [${patterns}] -> interpret [${value}] -> match=[${match}]`, () => {
          const sut = new SyntaxInterpreter();
          sut.add(patterns);

          const result = sut.interpret(value);
          expect(result.pattern).to.equal(match);
        });
      }
    });
  }


});
