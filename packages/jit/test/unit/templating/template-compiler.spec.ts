import { DI, Immutable, PLATFORM, Registration, IContainer } from '../../../../kernel/src/index';
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
  RuntimeCompilationResources,
  IResourceKind,
  ICustomAttributeSource,
  ICustomElementResource,
  IResourceType,
  ICustomElement,
  CustomElementResource,
  BindingMode,
  customElement,
  ICustomElementType,
  TargetedInstructionType,
  bindable,
  ITargetedInstruction,
  IPropertyBindingInstruction,
  customAttribute,
  ViewCompileFlags
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
  SetPropertyInstruction,
  HydrateElementInstruction
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
  let container: IContainer;
  let sut: TemplateCompiler;
  let expressionParser: IExpressionParser;
  let resources: IResourceDescriptions;

  beforeEach(() => {
    container = DI.createContainer();
    register(container);
    Repeat.register(container);
    expressionParser = container.get(IExpressionParser);
    sut = new TemplateCompiler(expressionParser as any);
    container.registerResolver(CustomAttributeResource.keyFrom('foo'), <any>{ getFactory: () => ({ type: { description: {} } }) });
    container.registerResolver(BindingCommandResource.keyFrom('foo'), <any>{ getFactory: () => ({ type: { description: {} } }) });
    resources = new RuntimeCompilationResources(<any>container);
  });


  describe('attribute compilation', () => {
    for (const { $type, attrName } of attrNameArr) {
      describe(`parseAttribute() - ${attrName}`, () => {

        // for (const { attrValue: declAttrValue, output: declOutput } of declarationArr) {
        //   for (const { attrValue: sttmtAttrValue, output: sttmtOutput } of statementArr) {
        //     const input = `${declAttrValue} of ${sttmtAttrValue}`;
        //     it(`iterator - "${attrName}"="${input}"`, () => {
        //       const dummyElement = document.createElement('dummy');
        //       const attr = createAttribute(attrName, input);
        //       const expr = new ForOfStatement(<any>declOutput, <any>sttmtOutput); // TODO: implement+verify
        //       const expected = new HydrateTemplateController({}, attrName.split('.')[0], []);
        //       dummyElement.setAttributeNode(attr);
        //       let err: Error;
        //       let actual: IExpression;
        //       try {
        //         actual = <any>sut.compileAttribute(attr, dummyElement, resources, null, false);
        //       } catch (e) {
        //         err = e;
        //       }
        //       if ($type & BindingType.IsIterator) {
        //         verifyEqual(actual, expected);
        //       } else if ($type & BindingType.Interpolation) {
        //         expect(actual).to.be.null;
        //       } else {
        //         if (err === undefined) {
        //           expect(actual).to.be.null;
        //         } else {
        //           expect(err.message).to.contain(`Parser Error: Unconsumed token of`);
        //         }
        //       }
        //     });
        //   }
        // }

        // const expressionValues = ['foo'];
        // for (const value of expressionValues) {
        //   it(`expression - "${attrName}"="${value}"`, () => {
        //     const dummyElement = document.createElement('dummy');
        //     const attr = createAttribute(attrName, value);
        //     const expr = new AccessScope(value) as any;
        //     let expected: any;
        //     dummyElement.setAttributeNode(attr);
        //     switch (attrName.split('.')[1]) {
        //       case 'one-time':
        //         expected = new OneTimeBindingInstruction(expr, attrName.split('.')[0]);
        //         break;
        //       case 'bind':
        //       case 'to-view':
        //         expected = new ToViewBindingInstruction(expr, attrName.split('.')[0]);
        //         break;
        //       case 'from-view':
        //         expected = new FromViewBindingInstruction(expr, attrName.split('.')[0]);
        //         break;
        //       case 'two-way':
        //         expected = new TwoWayBindingInstruction(expr, attrName.split('.')[0]);
        //         break;
        //       case 'trigger':
        //         expected = new TriggerBindingInstruction(expr, attrName.split('.')[0]);
        //         break;
        //       case 'capture':
        //         expected = new CaptureBindingInstruction(expr, attrName.split('.')[0]);
        //         break;
        //       case 'delegate':
        //         expected = new DelegateBindingInstruction(expr, attrName.split('.')[0]);
        //         break;
        //       case 'call':
        //         expected = new CallBindingInstruction(expr, attrName.split('.')[0]);
        //         break;
        //       case 'foo':
        //         expected = new ToViewBindingInstruction(expr, attrName.split('.')[0]);
        //         break;
        //       case undefined:
        //         switch (attrName) {
        //           case 'ref':
        //             expected = new RefBindingInstruction(expr);
        //             break;
        //           case 'foo':
        //             expected = new HydrateAttributeInstruction('foo', []);
        //             break;
        //         }
        //     }
        //     let err: Error;
        //     let actual: IExpression;
        //     try {
        //       actual = <any>sut.compileAttribute(attr, dummyElement, resources, null, false);
        //     } catch (e) {
        //       err = e;
        //     }
        //     if ($type & BindingType.Interpolation) {
        //       expect(actual).to.be.null;
        //     } else if ($type & BindingType.IsIterator) {
        //       expect(err).not.to.be.undefined;
        //       expect(err.message.length).to.be.greaterThan(0);
        //     } else {
        //       verifyEqual(actual, expected);
        //     }
        //   });
        // }

        // const expressionArr = [
        //   { attrValue: '${foo}', output: new AccessScope('foo') },
        //   { attrValue: '${foo.bar}', output: new AccessMember(new AccessScope('foo'), 'bar') },
        //   { attrValue: '${\'foo\' + \'bar\'}', output: new Binary('+', new PrimitiveLiteral('foo'), new PrimitiveLiteral('bar')) },
        //   { attrValue: '${`foo${bar}baz`}', output: new Template(['foo', 'baz'], [new AccessScope('bar')]) }
        // ];
        // const partArr = [
        //   { attrValue: '', output: '' },
        //   { attrValue: '-', output: '-' },
        //   { attrValue: '--', output: '--' }
        // ];
        // const countArr = [1, 2, 3];

        // for (const { attrValue: exprAttrValue, output: exprOutput } of expressionArr) {
        //   for (const { attrValue: partAttrValue, output: partOutput } of partArr) {
        //     for (const count of countArr) {
        //       const parts = new Array<string>(count + 1);
        //       const expressions = new Array<IExpression>(count);
        //       let input = '';
        //       let i = 0;
        //       while (i < count) {
        //         parts[i] = partOutput;
        //         expressions[i] = exprOutput;
        //         input += partAttrValue + exprAttrValue;
        //         i++;
        //       }
        //       input += partAttrValue;
        //       parts[i] = partOutput;
        //       const attr = createAttribute(attrName, input);
        //       const expected = new ToViewBindingInstruction(new Interpolation(parts, expressions), attrName);
        //       it(`interpolation - "${attrName}"="${input}"`, () => {
        //         let err: Error;
        //         let actual: Interpolation;
        //         try {
        //           actual = <any>sut.compileAttribute(attr, <any>null, resources, null, false);
        //         } catch (e) {
        //           err = e;
        //         }
        //         if ($type & BindingType.Interpolation) {
        //           verifyEqual(actual, expected);
        //         } else if ($type & BindingType.IsIterator) {
        //           expect(err.message.length).to.be.greaterThan(0);
        //         } else {
        //           if (err === undefined) {
        //             expect(actual).to.be.null;
        //           } else {
        //             expect(err.message).to.contain(`Parser Error: Unconsumed token {`);
        //           }
        //         }
        //       });
        //     }
        //   }
        // }
      });
    }
  });

  describe(`compile()`, () => {
    const tests = [
      // {
      //   inputMarkup: `<input type="text" value.bind="foo">`,
      //   outputMarkup: `<input type="text" value.bind="foo" class="au">`,
      //   instructions: [new ToViewBindingInstruction(new AccessScope('foo') as any, 'value')]
      // },
      // {
      //   inputMarkup: `<input type="text" value.bind="foo"><div><input type="text" value.bind="foo"></div>`,
      //   outputMarkup: `<input type="text" value.bind="foo" class="au"><div><input type="text" value.bind="foo" class="au"></div>`,
      //   instructions: [
      //     new ToViewBindingInstruction(new AccessScope('foo') as any, 'value'),
      //     new ToViewBindingInstruction(new AccessScope('foo') as any, 'value')
      //   ]
      // },
      // {
      //   inputMarkup: `<input type="text" value="\${foo}">`,
      //   outputMarkup: `<input type="text" value="\${foo}" class="au">`,
      //   instructions: [
      //     new ToViewBindingInstruction(
      //       new Interpolation(
      //         ['', ''],
      //         [new AccessScope('foo')]
      //       ) as any,
      //       'value'
      //     )
      //   ]
      // },
      // {
      //   inputMarkup: `<input type="text" value="\${foo}"><div><input type="text" value="\${foo}"></div>`,
      //   outputMarkup: `<input type="text" value="\${foo}" class="au"><div><input type="text" value="\${foo}" class="au"></div>`,
      //   instructions: [
      //     new ToViewBindingInstruction(new Interpolation(['', ''], [new AccessScope('foo')]) as any, 'value'),
      //     new ToViewBindingInstruction(new Interpolation(['', ''], [new AccessScope('foo')]) as any, 'value')
      //   ]
      // },
      // {
      //   inputMarkup: `<div>\${foo}</div>`,
      //   outputMarkup: `<div><au-marker class="au"></au-marker> </div>`,
      //   instructions: [new TextBindingInstruction(new Interpolation(['', ''], [new AccessScope('foo')]) as any)]
      // },
      // {
      //   inputMarkup: `<div>\${foo}<div>\${foo}</div></div>`,
      //   outputMarkup: `<div><au-marker class="au"></au-marker> <div><au-marker class="au"></au-marker> </div></div>`,
      //   instructions: [
      //     new TextBindingInstruction(new Interpolation(['', ''], [new AccessScope('foo')]) as any),
      //     new TextBindingInstruction(new Interpolation(['', ''], [new AccessScope('foo')]) as any)
      //   ]
      // },
      // {
      //   inputMarkup: `<div repeat.for="item of items"></div>`,
      //   outputMarkup: `<div></div>`,
      //   instructions: [
      //     new HydrateTemplateController({ templateOrNode: null, instructions: [] }, 'repeat', [
      //       new ToViewBindingInstruction(
      //         new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items')) as any,
      //         'items'
      //       ),
      //       new SetPropertyInstruction('item', 'local'),
      //     ])
      //   ]
      // },
      // {
      //   inputMarkup: `<div repeat.for="item of items"><div></div></div>`,
      //   outputMarkup: `<au-marker class="au"></au-marker><div></div>`,
      //   instructions: [
      //     new HydrateTemplateController({ templateOrNode: (<any>createElement(`<template><div></div></template>`)).content, instructions: [] }, 'repeat', [
      //       new ToViewBindingInstruction(
      //         new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items')) as any,
      //         'items'
      //       ),
      //       new SetPropertyInstruction('item', 'local'),
      //     ])
      //   ]
      // },
      // {
      //   inputMarkup: `<div repeat.for="item of items"><div repeat.for="item of items"><div></div></div></div>`,
      //   outputMarkup: `<au-marker class="au"></au-marker>`,
      //   instructions: [
      //     new HydrateTemplateController({
      //       templateOrNode: (<any>createElement(`<template><div></div></template>`)).content,
      //       instructions: [[
      //         new HydrateTemplateController({ templateOrNode: (<any>createElement(`<template><div></div></template>`)).content, instructions: [] }, 'repeat', [
      //           new ToViewBindingInstruction(
      //             new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items')) as any,
      //             'items'
      //           ),
      //           new SetPropertyInstruction('item', 'local'),
      //         ])
      //       ]]
      //     }, 'repeat', [
      //         new ToViewBindingInstruction(
      //           new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items')) as any,
      //           'items'
      //         ),
      //         new SetPropertyInstruction('item', 'local'),
      //       ])
      //   ]
      // }
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
      }).to.throw(/not implemented/i);
    });

    describe('with custom element', () => {

      describe('compiles surrogate', () => {

        it('compiles surrogate', () => {
          const { instructions, surrogates } = compileWith(
            `<template class="h-100"></template>`,
            [],
            ViewCompileFlags.surrogate
          );
          verifyInstructions(instructions as any, []);
          verifyInstructions(surrogates as any, [
            { toVerify: ['type', 'value', 'dest'], type: TargetedInstructionType.setAttribute, value: 'h-100', dest: 'class' }
          ]);
        });

        it('throws on attributes that require to be unique', () => {
          const attrs = ['id', 'part', 'replace-part'];
          attrs.forEach(attr => {
            expect(() => compileWith(
              `<template ${attr}="${attr}"></template>`,
              [],
              ViewCompileFlags.surrogate
            )).to.throw(/Invalid surrogate attribute/);
          });
        });
      });

      it('understands attr precendence: event > custom attr > element prop', () => {
        @customElement('el')
        class El {
          @bindable() prop1: string;
          @bindable() prop2: string;
          @bindable() prop3: string;
        }

        @customAttribute('prop3')
        class Prop {}

        const actual = compileWith(
          `<template>
            <el prop1.bind="p" prop2.trigger="p" prop3.delegate="t" prop3="t"></el>
          </template>`,
          [El, Prop]
        );
        const rootInstructions = actual.instructions[0] as any[];
        const expectedRootInstructions = [
          { toVerify: ['type', 'res'], type: TargetedInstructionType.hydrateElement, res: 'el' },
          { toVerify: ['type', 'res'], type: TargetedInstructionType.listenerBinding, dest: 'prop2' },
          { toVerify: ['type', 'res'], type: TargetedInstructionType.listenerBinding, dest: 'prop2' },
          { toVerify: ['type', 'res'], type: TargetedInstructionType.hydrateAttribute, res: 'prop3' }
        ];
        verifyInstructions(rootInstructions, expectedRootInstructions);
      });

      it('distinguishs element properties / normal attributes', () => {
        @customElement('el')
        class El {

          @bindable()
          name: string;
        }

        const actual = compileWith(
          `<template>
            <el name="name" name2="label"></el>
          </template>`,
          [El]
        );
        const rootInstructions = actual.instructions[0] as any[];
        const expectedRootInstructions = [
          { toVerify: ['type', 'res'], type: TargetedInstructionType.hydrateElement, res: 'el' }
        ];
        verifyInstructions(rootInstructions, expectedRootInstructions);

        const expectedElInstructions = [
          { toVerify: ['type', 'mode', 'dest'], type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView, dest: 'name' },
        ];
        verifyInstructions(rootInstructions[0].instructions, expectedElInstructions);
      });

      it('understands element property casing', () => {
        @customElement('el')
        class El {

          @bindable()
          backgroundColor: string;
        }

        const actual = compileWith(
          `<template>
            <el background-color="label"></el>
          </template>`,
          [El]
        );
        const rootInstructions = actual.instructions[0] as any[];

        const expectedElInstructions = [
          { toVerify: ['type', 'mode', 'dest'], type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView, dest: 'backgroundColor' },
        ];
        verifyInstructions(rootInstructions[0].instructions, expectedElInstructions);
      });

      it('understands binding commands', () => {
        @customElement('el')
        class El {
          @bindable({ mode: BindingMode.twoWay }) propProp1: string;
          @bindable() prop2: string;
          @bindable() propProp3: string;
          @bindable() prop4: string;
          @bindable() propProp5: string;
        }
        const actual = compileWith(
          `<template>
            <el
              prop-prop1.bind="prop1"
              prop2.one-time="prop2"
              prop-prop3.to-view="prop3"
              prop4.from-view="prop4"
              prop-prop5.two-way="prop5"
              ></el>
          </template>`,
          [El]
        );
        const rootInstructions = actual.instructions[0] as any[];

        const expectedElInstructions = [
          { toVerify: ['type', 'mode', 'dest'], mode: BindingMode.twoWay, dest: 'propProp1' },
          { toVerify: ['type', 'mode', 'dest'], mode: BindingMode.oneTime, dest: 'prop2' },
          { toVerify: ['type', 'mode', 'dest'], mode: BindingMode.toView, dest: 'propProp3' },
          { toVerify: ['type', 'mode', 'dest'], mode: BindingMode.fromView, dest: 'prop4' },
          { toVerify: ['type', 'mode', 'dest'], mode: BindingMode.twoWay, dest: 'propProp5' },
        ].map((e: any) => {
          e.type = TargetedInstructionType.propertyBinding;
          return e;
        });
        verifyInstructions(rootInstructions[0].instructions, expectedElInstructions);
      });

      describe('with template controller', () => {
        it('compiles', () => {
          @customAttribute({
            name: 'prop',
            isTemplateController: true
          })
          class Prop {
            value: any;
          }
          const { templateOrNode, instructions } = compileWith(
            `<template><el prop.bind="p"></el></template>`,
            [Prop]
          );
          expect((templateOrNode as HTMLTemplateElement).outerHTML).to.equal('<template><au-marker class="au"></au-marker></template>')
          const [hydratePropAttrInstruction] = instructions[0] as [HydrateTemplateController];
          expect((hydratePropAttrInstruction.src.templateOrNode as HTMLTemplateElement).outerHTML).to.equal('<template><el></el></template>');
        });

        it('moves attrbiutes instructions before the template controller into it', () => {
          @customAttribute({
            name: 'prop',
            isTemplateController: true
          })
          class Prop {
            value: any;
          }
          const { templateOrNode, instructions } = compileWith(
            `<template><el name.bind="name" title.bind="title" prop.bind="p"></el></template>`,
            [Prop]
          );
          expect((templateOrNode as HTMLTemplateElement).outerHTML).to.equal('<template><au-marker class="au"></au-marker></template>')
          const [hydratePropAttrInstruction] = instructions[0] as [HydrateTemplateController];
          verifyInstructions(hydratePropAttrInstruction.instructions as any, [
            { toVerify: ['type', 'dest', 'srcOrExp'],
              type: TargetedInstructionType.propertyBinding, dest: 'value', srcOrExp: 'p' },
            { toVerify: ['type', 'dest', 'srcOrExp'],
              type: TargetedInstructionType.propertyBinding, dest: 'name', srcOrExp: 'name' },
            { toVerify: ['type', 'dest', 'srcOrExp'],
              type: TargetedInstructionType.propertyBinding, dest: 'title', srcOrExp: 'title' },
          ]);
        });
      });
    });

    interface IExpectedInstruction {
      toVerify: string[];
      [prop: string]: any;
    }

    function compileWith(markup: string, extraResources: any[], viewCompileFlags?: ViewCompileFlags) {
      extraResources.forEach(e => e.register(container));
      return sut.compile(<any>{ templateOrNode: markup, instructions: [], surrogates: [] }, resources, viewCompileFlags);
    }

    function verifyInstructions(actual: any[], expectation: IExpectedInstruction[]) {
      expect(actual.length).to.equal(expectation.length, `Expected to have ${expectation.length} instructions. Received: ${actual.length}`);
      actual.forEach((inst, idx) => {
        const expectedInst = expectation[idx];
        for (const prop in expectedInst.toVerify) {
          verifyInstructionProp(inst, expectedInst, prop);
        }
      });
    }

    function verifyInstructionProp(actual: ITargetedInstruction, expected: IExpectedInstruction, prop: string) {
      expect(
        actual[prop]).to.equal(expected[prop],
        `Expected actual instruction to have "${prop}": ${expected[prop]}. Received: ${actual[prop]}`
      );
    }
  });
});
