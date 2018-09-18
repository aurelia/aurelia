import { ExpressionParser } from './../../../../runtime/src/binding/expression-parser';
import { Constructable } from './../../../../kernel/src/interfaces';
import { ForOfStatement, BindingIdentifier, IExpression, CallScope, PrimitiveLiteral } from './../../../../runtime/src/binding/ast';
import { DI, IContainer, IRegistry, PLATFORM, Registration } from '../../../../kernel/src/index';
import {
  IExpressionParser,
  IResourceDescriptions,
  BindingType,
  AccessScope,
  CustomAttributeResource,
  Repeat,
  RuntimeCompilationResources,
  BindingMode,
  customElement,
  TargetedInstructionType as TT,
  bindable,
  customAttribute,
  ViewCompileFlags,
  ILetElementInstruction,
  ITemplateSource,
  IHydrateTemplateController,
  IHydrateElementInstruction,
  ITargetedInstruction,
  TargetedInstructionType,
  IBindableDescription,
  DelegationStrategy
} from '../../../../runtime/src/index';
import {
  TemplateCompiler,
  register,
  HydrateTemplateController,
  BasicConfiguration
} from '../../../src/index';
import { expect } from 'chai';
import { verifyEqual, createElement, eachCartesianJoin, eachCartesianJoinFactory, verifyBindingInstructionsEqual } from '../util';
import { spy } from 'sinon';


export function createAttribute(name: string, value: string): Attr {
  const attr = document.createAttribute(name);
  attr.value = value;
  return attr;
}

describe('TemplateCompiler', () => {
  let container: IContainer;
  let sut: TemplateCompiler;
  let expressionParser: IExpressionParser;
  let resources: IResourceDescriptions;

  beforeEach(() => {
    container = DI.createContainer();
    container.register(BasicConfiguration);
    expressionParser = container.get(IExpressionParser);
    sut = new TemplateCompiler(expressionParser as any);
    container.registerResolver(CustomAttributeResource.keyFrom('foo'), <any>{ getFactory: () => ({ type: { description: {} } }) });
    resources = new RuntimeCompilationResources(<any>container);
  });


  describe(`compileNode()`, () => {
    function setup() {
      const container = DI.createContainer();
      container.register(BasicConfiguration);
      const expressionParser = container.get(IExpressionParser);
      const sut = new TemplateCompiler(expressionParser as any);
      const resources = new RuntimeCompilationResources(<any>container);
      const definition: any = {
        hasSlots: false,
        bindables: {},
        instructions: [],
        surrogates: []
      } as Required<ITemplateSource>;
      const instructions = definition.instructions;
      return { sut, resources, definition, instructions };
    }

    it(`handles Element with Element nextSibling`, () => {
      const { sut, resources, definition, instructions } = setup();

      sut.compileElementNode = spy();

      const parent = document.createElement('div');
      const node = document.createElement('div');
      const nextSibling = document.createElement('div');
      parent.appendChild(node);
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(node, parent, definition, instructions, resources);

      expect(sut.compileElementNode).to.have.been.calledWith(node, parent, definition, instructions, resources);
      expect(actual).to.equal(nextSibling);
    });

    it(`handles Element with Text nextSibling`, () => {
      const { sut, resources, definition, instructions } = setup();

      sut.compileElementNode = spy();

      const parent = document.createElement('div');
      const node = document.createElement('div');
      const nextSibling = document.createTextNode('foo');
      parent.appendChild(node);
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(node, parent, definition, instructions, resources);

      expect(sut.compileElementNode).to.have.been.calledWith(node, parent, definition, instructions, resources);
      expect(actual).to.equal(nextSibling);
    });

    it(`handles Element with Comment nextSibling`, () => {
      const { sut, resources, definition, instructions } = setup();

      sut.compileElementNode = spy();

      const parent = document.createElement('div');
      const node = document.createElement('div');
      const nextSibling = document.createComment('foo');
      parent.appendChild(node);
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(node, parent, definition, instructions, resources);

      expect(sut.compileElementNode).to.have.been.calledWith(node, parent, definition, instructions, resources);
      expect(actual).to.equal(nextSibling);
    });

    it(`handles TextNode without interpolation`, () => {
      const { sut, resources, definition, instructions } = setup();

      sut.compileTextNode = spy(() => false)

      const parent = document.createElement('div');
      const firstChild = document.createTextNode(' ');
      parent.appendChild(firstChild);
      parent.appendChild(document.createTextNode('asdf'));
      parent.appendChild(document.createTextNode(' '));
      parent.appendChild(document.createTextNode(' '));
      parent.appendChild(document.createTextNode('asdf'));
      parent.appendChild(document.createTextNode(' '));
      const nextSibling = document.createElement('div');
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(firstChild, parent, definition, instructions, resources);

      expect(actual).to.equal(nextSibling);
    });

    it(`handles TextNode with interpolation`, () => {
      const { sut, resources, definition, instructions } = setup();

      sut.compileTextNode = spy(() => true)

      const parent = document.createElement('div');
      const firstChild = document.createTextNode(' ');
      parent.appendChild(firstChild);
      const nextSibling = document.createTextNode('asdf');
      parent.appendChild(nextSibling);
      parent.appendChild(document.createTextNode(' '));
      parent.appendChild(document.createTextNode(' '));
      parent.appendChild(document.createTextNode('asdf'));
      parent.appendChild(document.createTextNode(' '));
      parent.appendChild(document.createElement('div'));

      const actual = sut.compileNode(firstChild, parent, definition, instructions, resources);

      expect(actual).to.equal(nextSibling);
    });

    it(`handles Comment with Element nextSibling`, () => {
      const { sut, resources, definition, instructions } = setup();

      const parent = document.createElement('div');
      const node = document.createComment('foo');
      const nextSibling = document.createElement('div');
      parent.appendChild(node);
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(node, parent, definition, instructions, resources);

      expect(actual).to.equal(nextSibling);
    });

    it(`handles Comment with Text nextSibling`, () => {
      const { sut, resources, definition, instructions } = setup();

      const parent = document.createElement('div');
      const node = document.createComment('foo');
      const nextSibling = document.createTextNode('foo');
      parent.appendChild(node);
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(node, parent, definition, instructions, resources);

      expect(actual).to.equal(nextSibling);
    });

    it(`handles Comment with Comment nextSibling`, () => {
      const { sut, resources, definition, instructions } = setup();

      const parent = document.createElement('div');
      const node = document.createComment('foo');
      const nextSibling = document.createComment('foo');
      parent.appendChild(node);
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(node, parent, definition, instructions, resources);

      expect(actual).to.equal(nextSibling);
    });

    it(`handles Document`, () => {
      const { sut, resources, definition, instructions } = setup();

      const actual = sut.compileNode(document, null, definition, instructions, resources);

      expect(actual).to.equal(document.firstChild);
    });

    it(`handles DocumentType`, () => {
      const { sut, resources, definition, instructions } = setup();

      const actual = <Element>sut.compileNode(document.firstChild, null, definition, instructions, resources);

      expect(actual).to.equal(document.firstChild.nextSibling);
    });
  });

  describe(`compileSurrogate()`, () => {
    function setup() {
      const container = DI.createContainer();
      container.register(BasicConfiguration);
      const expressionParser = container.get(IExpressionParser);
      const sut = new TemplateCompiler(expressionParser as any);
      const resources = new RuntimeCompilationResources(<any>container);
      const definition: any = {
        hasSlots: false,
        bindables: {},
        instructions: [],
        surrogates: []
      } as Required<ITemplateSource>;
      const instructions = definition.instructions;
      return { sut, resources, definition, instructions };
    }

    it(`handles Element with Element nextSibling`, () => {
      const { sut, resources, definition, instructions } = setup();

      sut.compileElementNode = spy();

      const parent = document.createElement('div');
      const node = document.createElement('div');
      const nextSibling = document.createElement('div');
      parent.appendChild(node);
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(node, parent, definition, instructions, resources);

      expect(sut.compileElementNode).to.have.been.calledWith(node, parent, definition, instructions, resources);
      expect(actual).to.equal(nextSibling);
    });

    it(`handles Element with Text nextSibling`, () => {
      const { sut, resources, definition, instructions } = setup();

      sut.compileElementNode = spy();

      const parent = document.createElement('div');
      const node = document.createElement('div');
      const nextSibling = document.createTextNode('foo');
      parent.appendChild(node);
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(node, parent, definition, instructions, resources);

      expect(sut.compileElementNode).to.have.been.calledWith(node, parent, definition, instructions, resources);
      expect(actual).to.equal(nextSibling);
    });

    it(`handles Element with Comment nextSibling`, () => {
      const { sut, resources, definition, instructions } = setup();

      sut.compileElementNode = spy();

      const parent = document.createElement('div');
      const node = document.createElement('div');
      const nextSibling = document.createComment('foo');
      parent.appendChild(node);
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(node, parent, definition, instructions, resources);

      expect(sut.compileElementNode).to.have.been.calledWith(node, parent, definition, instructions, resources);
      expect(actual).to.equal(nextSibling);
    });

    it(`handles TextNode without interpolation`, () => {
      const { sut, resources, definition, instructions } = setup();

      sut.compileTextNode = spy(() => false)

      const parent = document.createElement('div');
      const firstChild = document.createTextNode(' ');
      parent.appendChild(firstChild);
      parent.appendChild(document.createTextNode('asdf'));
      parent.appendChild(document.createTextNode(' '));
      parent.appendChild(document.createTextNode(' '));
      parent.appendChild(document.createTextNode('asdf'));
      parent.appendChild(document.createTextNode(' '));
      const nextSibling = document.createElement('div');
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(firstChild, parent, definition, instructions, resources);

      expect(actual).to.equal(nextSibling);
    });

    it(`handles TextNode with interpolation`, () => {
      const { sut, resources, definition, instructions } = setup();

      sut.compileTextNode = spy(() => true)

      const parent = document.createElement('div');
      const firstChild = document.createTextNode(' ');
      parent.appendChild(firstChild);
      const nextSibling = document.createTextNode('asdf');
      parent.appendChild(nextSibling);
      parent.appendChild(document.createTextNode(' '));
      parent.appendChild(document.createTextNode(' '));
      parent.appendChild(document.createTextNode('asdf'));
      parent.appendChild(document.createTextNode(' '));
      parent.appendChild(document.createElement('div'));

      const actual = sut.compileNode(firstChild, parent, definition, instructions, resources);

      expect(actual).to.equal(nextSibling);
    });

    it(`handles Comment with Element nextSibling`, () => {
      const { sut, resources, definition, instructions } = setup();

      const parent = document.createElement('div');
      const node = document.createComment('foo');
      const nextSibling = document.createElement('div');
      parent.appendChild(node);
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(node, parent, definition, instructions, resources);

      expect(actual).to.equal(nextSibling);
    });

    it(`handles Comment with Text nextSibling`, () => {
      const { sut, resources, definition, instructions } = setup();

      const parent = document.createElement('div');
      const node = document.createComment('foo');
      const nextSibling = document.createTextNode('foo');
      parent.appendChild(node);
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(node, parent, definition, instructions, resources);

      expect(actual).to.equal(nextSibling);
    });

    it(`handles Comment with Comment nextSibling`, () => {
      const { sut, resources, definition, instructions } = setup();

      const parent = document.createElement('div');
      const node = document.createComment('foo');
      const nextSibling = document.createComment('foo');
      parent.appendChild(node);
      parent.appendChild(nextSibling);

      const actual = sut.compileNode(node, parent, definition, instructions, resources);

      expect(actual).to.equal(nextSibling);
    });

    it(`handles Document`, () => {
      const { sut, resources, definition, instructions } = setup();

      const actual = sut.compileNode(document, null, definition, instructions, resources);

      expect(actual).to.equal(document.firstChild);
    });

    it(`handles DocumentType`, () => {
      const { sut, resources, definition, instructions } = setup();

      const actual = <Element>sut.compileNode(document.firstChild, null, definition, instructions, resources);

      expect(actual).to.equal(document.firstChild.nextSibling);
    });
  });


  describe('compileElement()', () => {

    it('set hasSlots to true <slot/>', () => {
      const definition = compileWith('<template><slot></slot></template>', []);
      expect(definition.hasSlots).to.be.true;

      // test this with nested slot inside template controller
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
            { toVerify: ['type', 'value', 'dest'], type: TT.setAttribute, value: 'h-100', dest: 'class' }
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

      it('understands attr precendence: custom attr > element prop', () => {
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
            <el prop1.bind="p" prop2.bind="p" prop3.bind="t" prop3="t"></el>
          </template>`,
          [El, Prop]
        );
        expect(actual.instructions.length).to.equal(1);
        expect(actual.instructions[0].length).to.equal(1);
        const rootInstructions = actual.instructions[0][0]['instructions'] as any[];
        const expectedRootInstructions = [
          { toVerify: ['type', 'res', 'dest'], type: TT.propertyBinding, dest: 'prop1' },
          { toVerify: ['type', 'res', 'dest'], type: TT.propertyBinding, dest: 'prop2' },
          { toVerify: ['type', 'res', 'dest'], type: TT.hydrateAttribute, res: 'prop3' },
          { toVerify: ['type', 'res', 'dest'], type: TT.hydrateAttribute, res: 'prop3' }
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
          { toVerify: ['type', 'res'], type: TT.hydrateElement, res: 'el' }
        ];
        verifyInstructions(rootInstructions, expectedRootInstructions);

        const expectedElInstructions = [
          { toVerify: ['type', 'dest', 'value'], type: TT.setProperty, dest: 'name', value: 'name' },
          { toVerify: ['type', 'dest', 'value'], type: TT.setProperty, dest: 'name2', value: 'label' },
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
          { toVerify: ['type', 'value', 'dest'], type: TT.setProperty, value: 'label', dest: 'backgroundColor' },
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
          e.type = TT.propertyBinding;
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
            { toVerify: ['type', 'dest', 'srcOrExpr'],
              type: TT.propertyBinding, dest: 'value', srcOrExpr: new AccessScope('p') },
            { toVerify: ['type', 'dest', 'srcOrExpr'],
              type: TT.propertyBinding, dest: 'name', srcOrExpr: new AccessScope('name') },
            { toVerify: ['type', 'dest', 'srcOrExpr'],
              type: TT.propertyBinding, dest: 'title', srcOrExpr: new AccessScope('title') },
          ]);
        });

        describe('[as-element]', () => {
          it('understands [as-element]', () => {
            @customElement('not-div')
            class NotDiv {}
            const { instructions } = compileWith('<template><div as-element="not-div"></div></template>', [NotDiv]);
            verifyInstructions(instructions[0] as any, [
              { toVerify: ['type', 'res'],
                type: TT.hydrateElement, res: 'not-div' }
            ]);
          });

          it('does not throw when element is not found', () => {
            const { instructions } = compileWith('<template><div as-element="not-div"></div></template>');
            expect(instructions.length).to.equal(0);
          });

          describe('with template controller', () => {
            it('compiles', () => {
              @customElement('not-div')
              class NotDiv {}
              const { instructions } = compileWith(
                '<template><div if.bind="value" as-element="not-div"></div></template>',
                [NotDiv]
              );

              verifyInstructions(instructions[0] as any, [
                { toVerify: ['type', 'res', 'dest'],
                  type: TargetedInstructionType.hydrateTemplateController, res: 'if' }
              ]);
              const templateControllerInst = instructions[0][0] as any as IHydrateTemplateController;
              verifyInstructions(templateControllerInst.instructions, [
                { toVerify: ['type', 'dest', 'srcOrExpr'],
                  type: TargetedInstructionType.propertyBinding, dest: 'value', srcOrExpr: new AccessScope('value') }
              ]);
              const [hydrateNotDivInstruction] = templateControllerInst.src.instructions[0] as [IHydrateElementInstruction];
              verifyInstructions([hydrateNotDivInstruction], [
                { toVerify: ['type', 'res'],
                  type: TargetedInstructionType.hydrateElement, res: 'not-div' }
              ]);
              verifyInstructions(hydrateNotDivInstruction.instructions, []);
            });
          });
        });
      });

      describe('<let/> element', () => {

        it('compiles', () => {
          const { instructions } = compileWith(`<template><let></let></template>`);
          expect(instructions.length).to.equal(1);
        });

        it('does not generate instructions when there is no bindings', () => {
          const { instructions } = compileWith(`<template><let></let></template>`);
          expect((instructions[0][0] as any).instructions.length).to.equal(0);
        });

        it('ignores custom element resource', () => {
          @customElement('let')
          class Let {}

          const { instructions } = compileWith(
            `<template><let></let></template>`,
            [Let]
          );
          verifyInstructions(instructions[0] as any, [
            { toVerify: ['type'], type: TT.letElement }
          ]);
        });

        it('compiles with attributes', () => {
          const { instructions } = compileWith(`<let a.bind="b" c="\${d}"></let>`);
          verifyInstructions((instructions[0][0] as any).instructions, [
            { toVerify: ['type', 'dest', 'srcOrExp'],
              type: TT.letBinding, dest: 'a', srcOrExpr: 'b' },
            { toVerify: ['type', 'dest'],
              type: TT.letBinding, dest: 'c' }
          ]);
        });

        describe('[to-view-model]', () => {
          it('understands [to-view-model]', () => {
            const { instructions } = compileWith(`<template><let to-view-model></let></template>`);
            expect((instructions[0][0] as any).toViewModel).to.be.true;
          });

          it('ignores [to-view-model] order', () => {
            let instructions = compileWith(`<template><let a.bind="a" to-view-model></let></template>`).instructions[0] as any;
            verifyInstructions(instructions, [
              { toVerify: ['type', 'toViewModel'], type: TT.letElement, toViewModel: true }
            ]);
            instructions = compileWith(`<template><let to-view-model a.bind="a"></let></template>`).instructions[0] as any;
            verifyInstructions(instructions, [
              { toVerify: ['type', 'toViewModel'], type: TT.letElement, toViewModel: true }
            ]);
          });
        });
      });
    });

    interface IExpectedInstruction {
      toVerify: string[];
      [prop: string]: any;
    }

    function compileWith(markup: string | Element, extraResources: any[] = [], viewCompileFlags?: ViewCompileFlags) {
      extraResources.forEach(e => e.register(container));
      return sut.compile(<any>{ templateOrNode: markup, instructions: [], surrogates: [] }, resources, viewCompileFlags);
    }

    function verifyInstructions(actual: any[], expectation: IExpectedInstruction[]) {
      expect(actual.length).to.equal(expectation.length, `Expected to have ${expectation.length} instructions. Received: ${actual.length}`);
      for (let i = 0, ii = actual.length; i < ii; ++i) {
        const actualInst = actual[i];
        const expectedInst = expectation[i];
        for (const prop of expectedInst.toVerify) {
          if (expectedInst[prop] instanceof Object) {
            expect(
              actualInst[prop]).to.deep.equal(expectedInst[prop],
              `Expected actual instruction to have "${prop}": ${expectedInst[prop]}. Received: ${actualInst[prop]} (on index: ${i})`
            );
          } else {
            expect(
              actualInst[prop]).to.equal(expectedInst[prop],
              `Expected actual instruction to have "${prop}": ${expectedInst[prop]}. Received: ${actualInst[prop]} (on index: ${i})`
            );
          }
        }
      }
    }
  });
});

describe(`TemplateCompiler - combinations`, () => {
  function setup(...globals: IRegistry[]) {
    const container = DI.createContainer();
    container.register(BasicConfiguration, ...globals);
    const expressionParser = container.get<IExpressionParser>(IExpressionParser);
    const sut = new TemplateCompiler(expressionParser as any);
    const resources = new RuntimeCompilationResources(<any>container);
    return { container, expressionParser, sut, resources }
  }

  eachCartesianJoinFactory([
    <(() => [string])[]>[
      () => ['div']
    ],
    <(($1: [string]) => [string, string, string, IExpression])[]>[
      ($1) => ['foo', 'foo', 'bar', new AccessScope('bar')],
      ($1) => ['foo.bar', 'foo', 'bar', new AccessScope('bar')],
      ($1) => ['foo.bind', 'foo', 'bar', new AccessScope('bar')],
      ($1) => ['value', 'value', 'value', new AccessScope('value')]
    ],
    <(($1: [string], $2: [string, string, string, IExpression]) => [string, string, any])[]>[
      ($1, [attr, dest, value, srcOrExpr]) => [`ref`,               value, { type: TT.refBinding,      srcOrExpr }],
      ($1, [attr, dest, value, srcOrExpr]) => [`${attr}.bind`,      value, { type: TT.propertyBinding, srcOrExpr, dest, mode: BindingMode.toView,   oneTime: false }],
      ($1, [attr, dest, value, srcOrExpr]) => [`${attr}.to-view`,   value, { type: TT.propertyBinding, srcOrExpr, dest, mode: BindingMode.toView,   oneTime: false }],
      ($1, [attr, dest, value, srcOrExpr]) => [`${attr}.one-time`,  value, { type: TT.propertyBinding, srcOrExpr, dest, mode: BindingMode.oneTime,  oneTime: true  }],
      ($1, [attr, dest, value, srcOrExpr]) => [`${attr}.from-view`, value, { type: TT.propertyBinding, srcOrExpr, dest, mode: BindingMode.fromView, oneTime: false }],
      ($1, [attr, dest, value, srcOrExpr]) => [`${attr}.two-way`,   value, { type: TT.propertyBinding, srcOrExpr, dest, mode: BindingMode.twoWay,   oneTime: false }],
      ($1, [attr, dest, value, srcOrExpr]) => [`${attr}.trigger`,   value, { type: TT.listenerBinding, srcOrExpr, dest, strategy: DelegationStrategy.none,      preventDefault: true }],
      ($1, [attr, dest, value, srcOrExpr]) => [`${attr}.delegate`,  value, { type: TT.listenerBinding, srcOrExpr, dest, strategy: DelegationStrategy.bubbling,  preventDefault: false }],
      ($1, [attr, dest, value, srcOrExpr]) => [`${attr}.capture`,   value, { type: TT.listenerBinding, srcOrExpr, dest, strategy: DelegationStrategy.capturing, preventDefault: false }],
      ($1, [attr, dest, value, srcOrExpr]) => [`${attr}.call`,      value, { type: TT.callBinding,     srcOrExpr, dest }]
    ]
  ], ([el], $2, [n1, v1, i1]) => {
    const markup = `<${el} ${n1}="${v1}"></${el}>`;

    it(markup, () => {
      const input = { templateOrNode: markup, instructions: [], surrogates: [] };
      const expected = { templateOrNode: createElement(`<${el} ${n1}="${v1}" class="au"></${el}>`), instructions: [[i1]], surrogates: [] };

      const { sut, resources } = setup();

      const actual = sut.compile(<any>input, resources);

      verifyBindingInstructionsEqual(actual, expected);
    });
  });

  eachCartesianJoinFactory([
    // ICustomAttributeSource.bindables
    <(() => [Record<string, IBindableDescription> | undefined, BindingMode | undefined, string])[]>[
      () => [undefined, undefined, 'value'],
      () => [{}, undefined,  'value'],
      () => [{ asdf: { attribute: 'baz-baz', property: 'bazBaz', mode: BindingMode.oneTime } }, BindingMode.oneTime, 'bazBaz'],
      () => [{ asdf: { attribute: 'baz-baz', property: 'bazBaz', mode: BindingMode.fromView } }, BindingMode.fromView, 'bazBaz'],
      () => [{ asdf: { attribute: 'baz-baz', property: 'bazBaz', mode: BindingMode.twoWay } }, BindingMode.twoWay, 'bazBaz'],
      () => [{ asdf: { attribute: 'baz-baz', property: 'bazBaz', mode: BindingMode.default } }, BindingMode.default, 'bazBaz']
    ],
    <(() => [string, string, IExpression, Constructable])[]>[
      () => ['foo',     '', new PrimitiveLiteral(''), class Foo{}],
      () => ['foo-foo', '', new PrimitiveLiteral(''), class FooFoo{}],
      () => ['foo',     'bar', new AccessScope('bar'), class Foo{}]
    ],
    // ICustomAttributeSource.defaultBindingMode
    <(() => BindingMode | undefined)[]>[
      () => undefined,
      () => BindingMode.oneTime,
      () => BindingMode.toView,
      () => BindingMode.fromView,
      () => BindingMode.twoWay
    ],
    <(($1: [Record<string, IBindableDescription>, BindingMode, string], $2: [string, string, IExpression, Constructable], $3: BindingMode) => [string, any])[]>[
      ([$11, mode, dest], [attr, $21, srcOrExpr], defaultMode) => [`${attr}`,           { type: TT.propertyBinding, srcOrExpr, dest, mode: (mode && mode !== BindingMode.default) ? mode : (defaultMode || BindingMode.toView) }],
      ([$11, mode, dest], [attr, $21, srcOrExpr], defaultMode) => [`${attr}.bind`,      { type: TT.propertyBinding, srcOrExpr, dest, mode: (mode && mode !== BindingMode.default) ? mode : (defaultMode || BindingMode.toView) }],
      ([$11, mode, dest], [attr, $21, srcOrExpr], defaultMode) => [`${attr}.to-view`,   { type: TT.propertyBinding, srcOrExpr, dest, mode: BindingMode.toView }],
      ([$11, mode, dest], [attr, $21, srcOrExpr], defaultMode) => [`${attr}.one-time`,  { type: TT.propertyBinding, srcOrExpr, dest, mode: BindingMode.oneTime }],
      ([$11, mode, dest], [attr, $21, srcOrExpr], defaultMode) => [`${attr}.from-view`, { type: TT.propertyBinding, srcOrExpr, dest, mode: BindingMode.fromView }],
      ([$11, mode, dest], [attr, $21, srcOrExpr], defaultMode) => [`${attr}.two-way`,   { type: TT.propertyBinding, srcOrExpr, dest, mode: BindingMode.twoWay }]
    ]
  ], ([bindables], [attr, value, srcOrExpr, ctor], defaultBindingMode, [name, childInstruction]) => {
    childInstruction.oneTime = childInstruction.mode === BindingMode.oneTime;
    const src = { name: PLATFORM.camelCase(attr), defaultBindingMode, bindables };
    const markup = `<div ${name}="${value}"></div>`;

    it(`${markup}  CustomAttribute=${JSON.stringify(src)}`, () => {
      const input = { templateOrNode: markup, instructions: [], surrogates: [] };
      const instruction = { type: TT.hydrateAttribute, res: attr, instructions: [childInstruction] };
      const expected = { templateOrNode: createElement(`<div ${name}="${value}" class="au"></div>`), instructions: [[instruction]], surrogates: [] };

      const def = CustomAttributeResource.define(src, ctor);
      const { sut, resources } = setup(def);

      const actual = sut.compile(<any>input, resources);

      verifyBindingInstructionsEqual(actual, expected);
    });
  });

  function createTplCtrlAttributeInstruction(attr: string, value: string) {
    if (attr === 'repeat.for') {
      return [{
        type: TT.propertyBinding,
        srcOrExpr: new ForOfStatement(
          new BindingIdentifier(value.split(' of ')[0]),
          new AccessScope(value.split(' of ')[1])),
        dest: 'items',
        mode: BindingMode.toView,
        oneTime: false
      }, {
        type: TT.setProperty,
        value: 'item',
        dest: 'local'
      }];
    } else {
      return [{
        type: TT.propertyBinding,
        srcOrExpr: value.length === 0 ? new PrimitiveLiteral('') : new AccessScope(value),
        dest: 'value',
        mode: BindingMode.toView,
        oneTime: false
      }];
    }
  }

  function createTemplateController(attr: string, target: string, value: string, markupOpen: string, markupClose: string, finalize: boolean, childInstr?, childTpl?) {
    // multiple template controllers per element
    if (markupOpen === null && markupClose === null) {
      const instruction = {
        type: TT.hydrateTemplateController,
        res: target,
        src: {
          name: target,
          templateOrNode: createElement(`<template><au-marker class="au"></au-marker></template>`),
          instructions: [[childInstr]]
        },
        instructions: createTplCtrlAttributeInstruction(attr, value),
        link: attr === 'else'
      };
      const rawMarkup = childTpl.replace('<div', `<div ${attr}="${value||''}"`);
      const input = {
        templateOrNode: finalize ? `<div>${rawMarkup}</div>` : rawMarkup,
        instructions: []
      }
      const output = {
        templateOrNode: createElement(`<div><au-marker class="au"></au-marker></div>`),
        instructions: [[instruction]]
      }
      return [input, output];
    } else {
      let compiledMarkup;
      let instructions;
      if (childInstr === undefined) {
        compiledMarkup = `${markupOpen}${markupClose}`;
        instructions = []
      } else {
        compiledMarkup = `${markupOpen}<au-marker class="au"></au-marker>${markupClose}`;
        instructions = [[childInstr]]
      }
      const instruction = {
        type: TT.hydrateTemplateController,
        res: target,
        src: {
          name: target,
          templateOrNode: createElement(`<template>${compiledMarkup}</template>`),
          instructions
        },
        instructions: createTplCtrlAttributeInstruction(attr, value),
        link: attr === 'else'
      };
      const rawMarkup = `${markupOpen.slice(0, -1)} ${attr}="${value||''}">${childTpl||''}${markupClose}`;
      const input = {
        templateOrNode: finalize ? `<div>${rawMarkup}</div>` : rawMarkup,
        instructions: []
      }
      const output = {
        templateOrNode: createElement(`<div><au-marker class="au"></au-marker></div>`),
        instructions: [[instruction]]
      }
      return [input, output];
    }
  }

  type CTCResult = [ITemplateSource, ITemplateSource];

  eachCartesianJoinFactory([
    <(() => CTCResult)[]>[
      () => createTemplateController('foo',        'foo',    '',              '<div>', '</div>', false),
      () => createTemplateController('foo',        'foo',    'bar',           '<div>', '</div>', false),
      () => createTemplateController('if.bind',    'if',     'show',          '<div>', '</div>', false),
      () => createTemplateController('repeat.for', 'repeat', 'item of items', '<div>', '</div>', false)
    ],
    <(($1: CTCResult) => CTCResult)[]>[
      ([input, output]) => createTemplateController('foo',        'foo',    '',              '<div>', '</div>', false, output.instructions[0][0], input.templateOrNode),
      ([input, output]) => createTemplateController('foo',        'foo',    'bar',           '<div>', '</div>', false, output.instructions[0][0], input.templateOrNode),
      ([input, output]) => createTemplateController('bar',        'bar',    '',              null,     null,    false, output.instructions[0][0], input.templateOrNode),
      ([input, output]) => createTemplateController('if.bind',    'if',     'show',          '<div>', '</div>', false, output.instructions[0][0], input.templateOrNode),
      ([input, output]) => createTemplateController('else',       'else',   '',              null,     null,    false, output.instructions[0][0], input.templateOrNode),
      ([input, output]) => createTemplateController('else',       'else',   '',              '<div>', '</div>', false, output.instructions[0][0], input.templateOrNode),
      ([input, output]) => createTemplateController('repeat.for', 'repeat', 'item of items', '<div>', '</div>', false, output.instructions[0][0], input.templateOrNode),
      ([input, output]) => createTemplateController('with.bind',  'with',   'foo',           '<div>', '<div>',  false, output.instructions[0][0], input.templateOrNode),
      ([input, output]) => createTemplateController('with.bind',  'with',   'foo',           null,    null,     false, output.instructions[0][0], input.templateOrNode)
    ],
    <(($1: CTCResult, $2: CTCResult) => CTCResult)[]>[
      ($1, [input, output]) => createTemplateController('foo',        'foo',    '',              '<div>', '</div>', true, output.instructions[0][0], input.templateOrNode),
      ($1, [input, output]) => createTemplateController('foo',        'foo',    'bar',           '<div>', '</div>', true, output.instructions[0][0], input.templateOrNode),
      ($1, [input, output]) => createTemplateController('baz',        'baz',    '',              null,     null,    true, output.instructions[0][0], input.templateOrNode),
      ($1, [input, output]) => createTemplateController('repeat.for', 'repeat', 'item of items', '<div>', '</div>', true, output.instructions[0][0], input.templateOrNode)
    ]
  ], ($1, $2, [input, output]) => {

    it(`${input.templateOrNode}`, () => {

      const { sut, resources } = setup(
        <any>CustomAttributeResource.define({ name: 'foo', isTemplateController: true }, class Foo{}),
        <any>CustomAttributeResource.define({ name: 'bar', isTemplateController: true }, class Bar{}),
        <any>CustomAttributeResource.define({ name: 'baz', isTemplateController: true }, class Baz{})
      );

      const actual = sut.compile(<any>input, resources);
      try {
        verifyBindingInstructionsEqual(actual, output);
      } catch(err) {
        console.log(JSON.stringify(output.instructions[0][0], null, 2));
        throw err;
      }
    });
  });
});
