import { BindingIdentifier, BindingBehavior, ArrayBindingPattern, ObjectBindingPattern } from './../../../../runtime/src/binding/ast';
import { BindingType, parseAttributeValue, bindingTypeToString } from '@aurelia/jit';
import { expect } from 'chai';
import { ForOfStatement, IExpression, ExpressionKind, Interpolation, AccessScope, AccessMember, Binary, PrimitiveLiteral, Template, ArrayLiteral, ValueConverter } from '@aurelia/runtime';
import { verifyEqual } from '../../util';

describe('parseAttributeValue', () => {
  const bindingTypes = [
    BindingType.None,
    BindingType.Interpolation,
    BindingType.IsPlain,
    BindingType.IsRef,
    BindingType.IsIterator,
    BindingType.IsCustom,
    BindingType.IsFunction,
    BindingType.IsEvent,
    BindingType.IsProperty,
    BindingType.IsCommand,
    BindingType.Command,
    BindingType.UnknownCommand,
    BindingType.OneTimeCommand,
    BindingType.ToViewCommand,
    BindingType.FromViewCommand,
    BindingType.TwoWayCommand,
    BindingType.BindCommand,
    BindingType.TriggerCommand,
    BindingType.CaptureCommand,
    BindingType.DelegateCommand,
    BindingType.CallCommand,
    BindingType.OptionsCommand,
    BindingType.ForCommand,
    BindingType.CustomCommand
  ];

  for (const bindingType of bindingTypes) {
    const $type = bindingTypeToString(bindingType);
    describe($type, () => {
      const declarationArr = [
        { input: 'item', output: new BindingIdentifier('item') },
        { input: '[key, value]', output: new ArrayBindingPattern([<any>new AccessScope('key'), <any>new AccessScope('value')]) },
        { input: '{foo, bar}', output: new ObjectBindingPattern(['foo', 'bar'], [<any>new AccessScope('foo'), <any>new AccessScope('bar')]) },
        { input: '{foo: bar}', output: new ObjectBindingPattern(['foo'], [<any>new AccessScope('bar')]) }
      ];
      const statementArr = [
        { input: 'items', output: new AccessScope('items') },
        { input: '10', output: new PrimitiveLiteral(10) },
        { input: 'null', output: new PrimitiveLiteral(null) },
        { input: 'undefined', output: new PrimitiveLiteral(undefined) },
        { input: '[,1]', output: new ArrayLiteral([new PrimitiveLiteral(undefined), new PrimitiveLiteral(1)]) },
        { input: 'items | stuff', output: new ValueConverter(new AccessScope('items'), 'stuff', []) },
        { input: 'items & stuff', output: new BindingBehavior(<any>new AccessScope('items'), 'stuff', []) },
      ]

      for (const { input: declInput, output: declOutput } of declarationArr) {
        for (const { input: sttmtInput, output: sttmtOutput } of statementArr) {
          const input = `${declInput} of ${sttmtInput}`;
          const expected = new ForOfStatement(<any>declOutput, <any>sttmtOutput);
          it(`iterator - ${input}`, () => {
            let err: Error;
            let actual: IExpression;
            try {
              actual = <any>parseAttributeValue(input, bindingType);
            } catch (e) {
              err = e;
            }
            if (bindingType & BindingType.IsIterator) {
              verifyEqual(actual, expected);
            } else if (bindingType & BindingType.IsPlain) {
              expect(actual).to.equal(input);
            } else {
              expect(err).not.to.be.undefined;
              expect(err.message).to.contain(`Parser Error: Unconsumed token of`);
            }
          });
        }
      }

      const expressionValues = ['foo'];
      for (const value of expressionValues) {
        it(`expression - ${value}`, () => {
          let err: Error;
          let actual: IExpression;
          try {
            actual = <any>parseAttributeValue(value, bindingType);
          } catch (e) {
            err = e;
          }
          if (bindingType & BindingType.IsPlain) {
            expect(actual).to.equal(value);
          } else if (bindingType & BindingType.IsIterator) {
            expect(err).not.to.be.undefined;
            expect(err.message).to.contain(`Parser Error: Missing expected token of`);
          } else {
            expect(actual.$kind).to.equal(ExpressionKind.AccessScope);
          }
        });
      }

      const expressionArr = [
        { input: '${foo}', output: new AccessScope('foo') },
        { input: '${foo.bar}', output: new AccessMember(new AccessScope('foo'), 'bar') },
        { input: '${\'foo\' + \'bar\'}', output: new Binary('+', new PrimitiveLiteral('foo'), new PrimitiveLiteral('bar')) },
        { input: '${`foo${bar}baz`}', output: new Template(['foo', 'baz'], [new AccessScope('bar')]) }
      ];
      const partArr = [
        { input: '', output: '' },
        { input: '-', output: '-' },
        { input: '--', output: '--' }
      ];
      const countArr = [ 1, 2, 3 ];

      for (const { input: exprInput, output: exprOutput } of expressionArr) {
        for (const { input: partInput, output: partOutput } of partArr) {
          for (const count of countArr) {
            const parts = new Array<string>(count + 1);
            const expressions = new Array<IExpression>(count);
            let input = '';
            let i = 0;
            while (i < count) {
              parts[i] = partOutput;
              expressions[i] = exprOutput;
              input += partInput + exprInput;
              i++;
            }
            input += partInput;
            parts[i] = partOutput;
            const expected = new Interpolation(parts, expressions);
            it(`interpolation - ${input}`, () => {
              let err: Error;
              let actual: Interpolation;
              try {
                actual = <any>parseAttributeValue(input, bindingType);
              } catch (e) {
                err = e;
              }
              if (bindingType & BindingType.IsPlain) {
                verifyEqual(actual, expected);
              } else if (bindingType & BindingType.IsIterator) {
                expect(err).not.to.be.undefined;
                expect(err.message).to.contain(`Parser Error: Missing expected token of`);
              } else {
                expect(err).not.to.be.undefined;
                expect(err.message).to.contain(`Parser Error: Unconsumed token {`);
              }
            });
          }
        }
      }
    });
  }
});

export class AttributeBindingCommand {
  constructor(public name: string, public command: string, public expression: any) {}
}

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  return wrapper.firstElementChild as HTMLElement;
}
