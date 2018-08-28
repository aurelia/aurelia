import { DI } from '../../../../kernel/src/index';
import {
  IExpressionParser,
  IResourceDescriptions,
  IExpression,
  BindingType,
  ExpressionKind,
  AccessScope,
  ObjectBindingPattern,
  CustomAttributeResource,
  BindingIdentifier,
  ArrayBindingPattern,
  PrimitiveLiteral,
  ArrayLiteral,
  BindingBehavior,
  ValueConverter,
  ForOfStatement,
  Interpolation,
  AccessMember,
  Binary,
  Template,
  TargetedInstruction,
  Repeat,
  RuntimeCompilationResources
} from '../../../../runtime/src/index';
import {
  TemplateCompiler,
  register,
  BindingCommandResource,
  ToViewBindingInstruction,
  HydrateTemplateController,
  OneTimeBindingInstruction,
  FromViewBindingInstruction,
  TwoWayBindingInstruction,
  TriggerBindingInstruction,
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  CallBindingInstruction,
  RefBindingInstruction,
  HydrateAttributeInstruction,
  TextBindingInstruction,
  SetPropertyInstruction
} from '../../../src/index';
import { expect } from 'chai';
import { verifyEqual, createElement } from '../../util';


export function createAttribute(name: string, value: string): Attr {
  const attr = document.createAttribute(name);
  attr.value = value;
  return attr;
}

const attrNameArr = [
  { $type: BindingType.Interpolation, attrName: 'one-time' },
  { $type: BindingType.Interpolation, attrName: 'to-view' },
  { $type: BindingType.Interpolation, attrName: 'from-view' },
  { $type: BindingType.Interpolation, attrName: 'two-way' },
  { $type: BindingType.Interpolation, attrName: 'bind' },
  { $type: BindingType.Interpolation, attrName: 'trigger' },
  { $type: BindingType.Interpolation, attrName: 'capture' },
  { $type: BindingType.Interpolation, attrName: 'delegate' },
  { $type: BindingType.Interpolation, attrName: 'call' },
  { $type: BindingType.Interpolation, attrName: 'options' },
  { $type: BindingType.Interpolation, attrName: 'for' },

  { $type: BindingType.OneTimeCommand, attrName: 'foo.one-time' },
  { $type: BindingType.ToViewCommand, attrName: 'foo.to-view' },
  { $type: BindingType.FromViewCommand, attrName: 'foo.from-view' },
  { $type: BindingType.TwoWayCommand, attrName: 'foo.two-way' },
  { $type: BindingType.BindCommand, attrName: 'foo.bind' },
  { $type: BindingType.TriggerCommand, attrName: 'foo.trigger' },
  { $type: BindingType.CaptureCommand, attrName: 'foo.capture' },
  { $type: BindingType.DelegateCommand, attrName: 'foo.delegate' },
  { $type: BindingType.CallCommand, attrName: 'foo.call' },
  { $type: BindingType.Interpolation, attrName: 'foo.options' },
  { $type: BindingType.ForCommand, attrName: 'foo.for' },
  { $type: BindingType.Interpolation, attrName: 'foo.foo' },
  { $type: BindingType.BindCommand, attrName: 'bind.bind' },

  { $type: BindingType.Interpolation, attrName: 'bar' },

  { $type: BindingType.Interpolation, attrName: 'foo.bar' },
  { $type: BindingType.Interpolation, attrName: 'foo.ref' },
  { $type: BindingType.Interpolation, attrName: 'foo.bind.bind' },

  { $type: BindingType.IsCustom, attrName: 'foo' },
  { $type: BindingType.IsRef, attrName: 'ref' },
];

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
];

describe('TemplateCompiler', () => {
  let sut: TemplateCompiler;
  let expressionParser: IExpressionParser;
  let resources: IResourceDescriptions;

  beforeEach(() => {
    const container = DI.createContainer();
    register(container);
    Repeat.register(container);
    expressionParser = container.get(IExpressionParser);
    sut = new TemplateCompiler(expressionParser);
    container.registerResolver(CustomAttributeResource.keyFrom('foo'), <any>{ getFactory: () => ({ type: { description: {} } }) });
    container.registerResolver(BindingCommandResource.keyFrom('foo'), <any>{ getFactory: () => ({ type: { description: {} } }) });
    resources = new RuntimeCompilationResources(<any>container);
  });


  for (const { $type, attrName } of attrNameArr) {
    describe(`parseAttribute() - ${attrName}`, () => {

      for (const { attrValue: declAttrValue, output: declOutput } of declarationArr) {
        for (const { attrValue: sttmtAttrValue, output: sttmtOutput } of statementArr) {
          const input = `${declAttrValue} of ${sttmtAttrValue}`;
          it(`iterator - "${attrName}"="${input}"`, () => {
            const attr = createAttribute(attrName, input);
            const expr = new ForOfStatement(<any>declOutput, <any>sttmtOutput); // TODO: implement+verify
            const expected = new HydrateTemplateController({}, attrName.split('.')[0], []);
            let err: Error;
            let actual: IExpression;
            try {
              actual = <any>sut.compileAttribute(attr, <any>null, resources);
            } catch (e) {
              err = e;
            }
            if ($type & BindingType.IsIterator) {
              verifyEqual(actual, expected);
            } else if ($type & BindingType.Interpolation) {
              expect(actual).to.be.null;
            } else {
              if (err === undefined) {
                expect(actual).to.be.null;
              } else {
                expect(err.message).to.contain(`Parser Error: Unconsumed token of`);
              }
            }
          });
        }
      }

      const expressionValues = ['foo'];
      for (const value of expressionValues) {
        const attr = createAttribute(attrName, value);
        it(`expression - "${attrName}"="${value}"`, () => {
          const expr = new AccessScope(value);
          let expected: TargetedInstruction;
          switch (attrName.split('.')[1]) {
            case 'one-time':
              expected = new OneTimeBindingInstruction(expr, attrName.split('.')[0]);
              break;
            case 'bind':
            case 'to-view':
              expected = new ToViewBindingInstruction(expr, attrName.split('.')[0]);
              break;
            case 'from-view':
              expected = new FromViewBindingInstruction(expr, attrName.split('.')[0]);
              break;
            case 'two-way':
              expected = new TwoWayBindingInstruction(expr, attrName.split('.')[0]);
              break;
            case 'trigger':
              expected = new TriggerBindingInstruction(expr, attrName.split('.')[0]);
              break;
            case 'capture':
              expected = new CaptureBindingInstruction(expr, attrName.split('.')[0]);
              break;
            case 'delegate':
              expected = new DelegateBindingInstruction(expr, attrName.split('.')[0]);
              break;
            case 'call':
              expected = new CallBindingInstruction(expr, attrName.split('.')[0]);
              break;
            case 'foo':
              expected = new ToViewBindingInstruction(expr, attrName.split('.')[0]);
              break;
            case undefined:
              switch (attrName) {
                case 'ref':
                  expected = new RefBindingInstruction(expr);
                  break;
                case 'foo':
                  expected = new HydrateAttributeInstruction('foo', []);
                  break;
              }
          }
          let err: Error;
          let actual: IExpression;
          try {
            actual = <any>sut.compileAttribute(attr, <any>null, resources);
          } catch (e) {
            err = e;
          }
          if ($type & BindingType.Interpolation) {
            expect(actual).to.be.null;
          } else if ($type & BindingType.IsIterator) {
            expect(err).not.to.be.undefined;
            expect(err.message.length).to.be.greaterThan(0);
          } else {
            verifyEqual(actual, expected);
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
      const countArr = [1, 2, 3];

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
            const expected = new ToViewBindingInstruction(new Interpolation(parts, expressions), attrName);
            it(`interpolation - "${attrName}"="${input}"`, () => {
              let err: Error;
              let actual: Interpolation;
              try {
                actual = <any>sut.compileAttribute(attr, <any>null, resources);
              } catch (e) {
                err = e;
              }
              if ($type & BindingType.Interpolation) {
                verifyEqual(actual, expected);
              } else if ($type & BindingType.IsIterator) {
                expect(err.message.length).to.be.greaterThan(0);
              } else {
                if (err === undefined) {
                  expect(actual).to.be.null;
                } else {
                  expect(err.message).to.contain(`Parser Error: Unconsumed token {`);
                }
              }
            });
          }
        }
      }
    });
  }

  describe(`compile()`, () => {
    const tests = [
      {
        inputMarkup: `<input type="text" value.bind="foo">`,
        outputMarkup: `<input type="text" value.bind="foo" class="au">`,
        instructions: [new ToViewBindingInstruction(new AccessScope('foo'), 'value')]
      },
      {
        inputMarkup: `<input type="text" value.bind="foo"><div><input type="text" value.bind="foo"></div>`,
        outputMarkup: `<input type="text" value.bind="foo" class="au"><div><input type="text" value.bind="foo" class="au"></div>`,
        instructions: [
          new ToViewBindingInstruction(new AccessScope('foo'), 'value'),
          new ToViewBindingInstruction(new AccessScope('foo'), 'value')
        ]
      },
      {
        inputMarkup: `<input type="text" value="\${foo}">`,
        outputMarkup: `<input type="text" value="\${foo}" class="au">`,
        instructions: [new ToViewBindingInstruction(new Interpolation(['', ''], [new AccessScope('foo')]), 'value')]
      },
      {
        inputMarkup: `<input type="text" value="\${foo}"><div><input type="text" value="\${foo}"></div>`,
        outputMarkup: `<input type="text" value="\${foo}" class="au"><div><input type="text" value="\${foo}" class="au"></div>`,
        instructions: [
          new ToViewBindingInstruction(new Interpolation(['', ''], [new AccessScope('foo')]), 'value'),
          new ToViewBindingInstruction(new Interpolation(['', ''], [new AccessScope('foo')]), 'value')
        ]
      },
      {
        inputMarkup: `<div>\${foo}</div>`,
        outputMarkup: `<div><au-marker class="au"></au-marker> </div>`,
        instructions: [new TextBindingInstruction(new Interpolation(['', ''], [new AccessScope('foo')]))]
      },
      {
        inputMarkup: `<div>\${foo}<div>\${foo}</div></div>`,
        outputMarkup: `<div><au-marker class="au"></au-marker> <div><au-marker class="au"></au-marker> </div></div>`,
        instructions: [
          new TextBindingInstruction(new Interpolation(['', ''], [new AccessScope('foo')])),
          new TextBindingInstruction(new Interpolation(['', ''], [new AccessScope('foo')]))
        ]
      },
      {
        inputMarkup: `<div repeat.for="item of items"></div>`,
        outputMarkup: `<div repeat.for="item of items" class="au"></div>`,
        instructions: [
          new HydrateTemplateController({ templateOrNode: null, instructions: [] }, 'repeat', [
            new ToViewBindingInstruction(new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items')), 'items'),
            new SetPropertyInstruction('item', 'local'),
          ])
        ]
      },
      {
        inputMarkup: `<div repeat.for="item of items"><div></div></div>`,
        outputMarkup: `<div repeat.for="item of items" class="au"></div>`,
        instructions: [
          new HydrateTemplateController({ templateOrNode: (<any>createElement(`<template><div></div></template>`)).content, instructions: [] }, 'repeat', [
            new ToViewBindingInstruction(new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items')), 'items'),
            new SetPropertyInstruction('item', 'local'),
          ])
        ]
      },
      {
        inputMarkup: `<div repeat.for="item of items"><div repeat.for="item of items"><div></div></div></div>`,
        outputMarkup: `<div repeat.for="item of items" class="au"></div>`,
        instructions: [
          new HydrateTemplateController({
            templateOrNode: (<any>createElement(`<template><div repeat.for="item of items" class="au"></div></template>`)).content,
            instructions: [[
              new HydrateTemplateController({ templateOrNode: (<any>createElement(`<template><div></div></template>`)).content, instructions: [] }, 'repeat', [
                new ToViewBindingInstruction(new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items')), 'items'),
                new SetPropertyInstruction('item', 'local'),
              ])
            ]]
          }, 'repeat', [
              new ToViewBindingInstruction(new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items')), 'items'),
              new SetPropertyInstruction('item', 'local'),
            ])
        ]
      }
    ];

    for (const count of [1, 2, 3]) {
      for (let { inputMarkup, outputMarkup, instructions } of tests) {
        inputMarkup = new Array(count + 1).join(inputMarkup);
        it(inputMarkup, () => {
          outputMarkup = new Array(count + 1).join(outputMarkup);
          instructions = new Array(count).fill(instructions).reduce((acc, item) => acc.concat(item));
          const actual = sut.compile(<any>{ templateOrNode: inputMarkup, instructions: [] }, resources);
          const expected = {
            templateOrNode: createElement(outputMarkup),
            instructions: [instructions]
          };
          verifyEqual(actual, expected);
        });
      }
    }

  });

  describe('compileElement()', () => {

    it('throws on <let/> + <slot/>', () => {
      const markup = '<template><slot></slot></template>';
      expect(() => {
        sut.compile(<any>{ templateOrNode: markup, instructions: [] }, resources);
      }).to.throw();
    });
  });
});
