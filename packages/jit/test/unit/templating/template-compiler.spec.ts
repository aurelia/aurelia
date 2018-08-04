import { DI } from '@aurelia/kernel';
import { IExpressionParser, IResourceDescriptions, IExpression, BindingType, ExpressionKind, AccessScope, ObjectBindingPattern, CustomAttributeResource, BindingIdentifier, ArrayBindingPattern, PrimitiveLiteral, ArrayLiteral, BindingBehavior, ValueConverter, ForOfStatement, Interpolation, AccessMember, Binary, Template } from '@aurelia/runtime';
import { TemplateCompiler, register, BindingCommandResource } from '@aurelia/jit';
import { expect } from 'chai';
import { RuntimeCompilationResources } from '../../../../runtime/src/templating/rendering-engine';
import { verifyEqual } from '../../util';


export function createAttribute(name: string, value: string): Attr {
  const attr = document.createAttribute(name);
  attr.value = value;
  return attr;
}

describe('TemplateCompiler', () => {
  let sut: TemplateCompiler;
  let expressionParser: IExpressionParser;
  let resources: IResourceDescriptions;

  beforeEach(() => {
    const container = DI.createContainer();
    register(container);
    expressionParser = container.get(IExpressionParser);
    sut = new TemplateCompiler(expressionParser);
    container.registerResolver(CustomAttributeResource.key('foo'), <any>{ getFactory: () => ({ type: { description: {} } }) });
    container.registerResolver(BindingCommandResource.key('foo'), <any>{ getFactory: () => ({ type: { description: {} } }) });
    resources = new RuntimeCompilationResources(<any>container);
  });

  const attrNameArr = [
    { $type: BindingType.IsPlain, attrName: 'one-time' },
    { $type: BindingType.IsPlain, attrName: 'to-view' },
    { $type: BindingType.IsPlain, attrName: 'from-view' },
    { $type: BindingType.IsPlain, attrName: 'two-way' },
    { $type: BindingType.IsPlain, attrName: 'bind' },
    { $type: BindingType.IsPlain, attrName: 'trigger' },
    { $type: BindingType.IsPlain, attrName: 'capture' },
    { $type: BindingType.IsPlain, attrName: 'delegate' },
    { $type: BindingType.IsPlain, attrName: 'call' },
    { $type: BindingType.IsPlain, attrName: 'options' },
    { $type: BindingType.IsPlain, attrName: 'for' },

    { $type: BindingType.OneTimeCommand,  attrName: 'foo.one-time' },
    { $type: BindingType.ToViewCommand,   attrName: 'foo.to-view' },
    { $type: BindingType.FromViewCommand, attrName: 'foo.from-view' },
    { $type: BindingType.TwoWayCommand,   attrName: 'foo.two-way' },
    { $type: BindingType.BindCommand,     attrName: 'foo.bind' },
    { $type: BindingType.TriggerCommand,  attrName: 'foo.trigger' },
    { $type: BindingType.CaptureCommand,  attrName: 'foo.capture' },
    { $type: BindingType.DelegateCommand, attrName: 'foo.delegate' },
    { $type: BindingType.CallCommand,     attrName: 'foo.call' },
    { $type: BindingType.OptionsCommand,  attrName: 'foo.options' },
    { $type: BindingType.ForCommand,      attrName: 'foo.for' },
    { $type: BindingType.CustomCommand,   attrName: 'foo.foo' },
    { $type: BindingType.BindCommand,     attrName: 'bind.bind' },

    { $type: BindingType.IsPlain, attrName: 'bar' },

    { $type: BindingType.IsPlain, attrName: 'foo.bar' },
    { $type: BindingType.IsPlain, attrName: 'foo.ref' },
    { $type: BindingType.IsPlain, attrName: 'foo.bind.bind' },

    { $type: BindingType.IsCustom, attrName: 'foo' },
    { $type: BindingType.IsRef,    attrName: 'ref' },
  ];

  for (const { $type, attrName } of attrNameArr) {
    describe(attrName, () => {
      const declarationArr = [
        { attrValue: 'item', output: new BindingIdentifier('item') },
        { attrValue: '[key, value]', output: new ArrayBindingPattern([<any>new AccessScope('key'), <any>new AccessScope('value')]) },
        { attrValue: '{foo, bar}', output: new ObjectBindingPattern(['foo', 'bar'], [<any>new AccessScope('foo'), <any>new AccessScope('bar')]) },
        { attrValue: '{foo: bar}', output: new ObjectBindingPattern(['foo'], [<any>new AccessScope('bar')]) }
      ];
      const statementArr = [
        { attrValue: 'items', output: new AccessScope('items') },
        { attrValue: '10', output: new PrimitiveLiteral(10) },
        { attrValue: 'null', output: new PrimitiveLiteral(null) },
        { attrValue: 'undefined', output: new PrimitiveLiteral(undefined) },
        { attrValue: '[,1]', output: new ArrayLiteral([new PrimitiveLiteral(undefined), new PrimitiveLiteral(1)]) },
        { attrValue: 'items | stuff', output: new ValueConverter(new AccessScope('items'), 'stuff', []) },
        { attrValue: 'items & stuff', output: new BindingBehavior(<any>new AccessScope('items'), 'stuff', []) },
      ]

      for (const { attrValue: declAttrValue, output: declOutput } of declarationArr) {
        for (const { attrValue: sttmtAttrValue, output: sttmtOutput } of statementArr) {
          const input = `${declAttrValue} of ${sttmtAttrValue}`;
          it(`iterator - "${attrName}"="${input}"`, () => {
            const attr = createAttribute(attrName, input);
            const expected = new ForOfStatement(<any>declOutput, <any>sttmtOutput);
            let err: Error;
            let actual: IExpression;
            try {
              actual = <any>sut.parseAttribute(attr, resources);
            } catch (e) {
              err = e;
            }
            if ($type & BindingType.IsIterator) {
              verifyEqual(actual, expected);
            } else if ($type & BindingType.IsPlain) {
              expect(actual).to.be.null;
            } else {
              expect(err).not.to.be.undefined;
              expect(err.message).to.contain(`Parser Error: Unconsumed token of`);
            }
          });
        }
      }

      const expressionValues = ['foo'];
      for (const value of expressionValues) {
        const attr = createAttribute(attrName, value);
        it(`expression - "${attrName}"="${value}"`, () => {
          let err: Error;
          let actual: IExpression;
          try {
            actual = <any>sut.parseAttribute(attr, resources);
          } catch (e) {
            err = e;
          }
          if ($type & BindingType.IsPlain) {
            expect(actual).to.be.null;
          } else if ($type & BindingType.IsIterator) {
            expect(err).not.to.be.undefined;
            expect(err.message).to.contain(`Parser Error: Missing expected token of`);
          } else {
            expect(actual.$kind).to.equal(ExpressionKind.AccessScope);
          }
        });
      }

      const expressionArr = [
        { attrValue: '${foo}', output: new AccessScope('foo') },
        { attrValue: '${foo.bar}', output: new AccessMember(new AccessScope('foo'), 'bar') },
        { attrValue: '${\'foo\' + \'bar\'}', output: new Binary('+', new PrimitiveLiteral('foo'), new PrimitiveLiteral('bar')) },
        { attrValue: '${`foo${bar}baz`}', output: new Template(['foo', 'baz'], [new AccessScope('bar')]) }
      ];
      const partArr = [
        { attrValue: '', output: '' },
        { attrValue: '-', output: '-' },
        { attrValue: '--', output: '--' }
      ];
      const countArr = [ 1, 2, 3 ];

      for (const { attrValue: exprAttrValue, output: exprOutput } of expressionArr) {
        for (const { attrValue: partAttrValue, output: partOutput } of partArr) {
          for (const count of countArr) {
            const parts = new Array<string>(count + 1);
            const expressions = new Array<IExpression>(count);
            let input = '';
            let i = 0;
            while (i < count) {
              parts[i] = partOutput;
              expressions[i] = exprOutput;
              input += partAttrValue + exprAttrValue;
              i++;
            }
            input += partAttrValue;
            parts[i] = partOutput;
            const attr = createAttribute(attrName, input);
            const expected = new Interpolation(parts, expressions);
            it(`interpolation - "${attrName}"="${input}"`, () => {
              let err: Error;
              let actual: Interpolation;
              try {
                actual = <any>sut.parseAttribute(attr, resources);
              } catch (e) {
                err = e;
              }
              if ($type & BindingType.IsPlain) {
                verifyEqual(actual, expected);
              } else if ($type & BindingType.IsIterator) {
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
