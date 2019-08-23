import {
  IAttrSyntaxTransformer
} from '@aurelia/jit-html';
import {
  RuntimeCompilationResources
} from '@aurelia/kernel';
import {
  BindingMode,
  ITemplateCompiler,
  TargetedInstructionType as TT
} from '@aurelia/runtime';
import {
  assert,
  TestContext
} from '@aurelia/testing';

describe('html convention', function () {

  type IConventionCombo = [string, string, Record<string, string>?];

  const combos: IConventionCombo[] = [
    ['input', 'value'],
    ['input', 'files'],
    ['input', 'files', { types: 'file' }],
    ...(['date', 'datetime', 'password', 'email', 'color'].map(type => ['input', 'value', { type }] as IConventionCombo)),
    ['select', 'value'],
    ['input', 'checked', { type: 'checkbox' }],
    ['input', 'checked', { type: 'radio' }],
    ['div', 'textcontent', { contenteditable: 'true' }],
    ['div', 'innerhtml', { contenteditable: 'true' }],
    ['div', 'textcontent', { contenteditable: 'true' }],
    ['p', 'innerhtml', { contenteditable: 'true' }],
    ['textarea', 'value'],
    ['div', 'scrollleft'],
    ['div', 'scrolltop'],
    ['p', 'scrollleft'],
    ['span', 'scrollleft'],
  ];

  for (const [el, bindingAttr, elAttrs = {}] of combos) {
    const elAttrsStr = Object.entries(elAttrs).map(([key, value]) => `${key}=${value}`).join(' ');
    it(`compile <${el} ${bindingAttr}.bind="..." ${elAttrsStr} />`, function () {
      const ctx = TestContext.createHTMLTestContext();
      const compiler = ctx.container.get(ITemplateCompiler);
      const template = `<${el} ${bindingAttr}.bind="value" ${elAttrsStr}></${el}>`;
      const { instructions: rootInstructions } = compiler.compile(
        ctx.dom,
        { name: '', template, surrogates: [], instructions: [] },
        new RuntimeCompilationResources(ctx.container)
      );
      const attrTransformer = ctx.container.get(IAttrSyntaxTransformer);

      const expectedElInstructions: IExpectedInstruction[] = [
        { toVerify: ['type', 'mode', 'to'], mode: BindingMode.twoWay, to: attrTransformer.map(el, bindingAttr), type: TT.propertyBinding }
      ];
      verifyInstructions(rootInstructions[0], expectedElInstructions);
    });
  }
});

interface IExpectedInstruction {
  toVerify: string[];
  [prop: string]: any;
}

function verifyInstructions(actual: any[], expectation: IExpectedInstruction[], type?: string) {
  assert.strictEqual(actual.length, expectation.length, `Expected to have ${expectation.length} ${type ? type : ''} instructions. Received: ${actual.length}`);
  for (let i = 0, ii = actual.length; i < ii; ++i) {
    const actualInst = actual[i];
    const expectedInst = expectation[i];
    const ofType = type ? `of ${type}` : '';
    for (const prop of expectedInst.toVerify) {
      // tslint:disable-next-line:no-all-duplicated-branches
      if (expectedInst[prop] instanceof Object) {
        assert.deepStrictEqual(
          actualInst[prop],
          expectedInst[prop],
          `Expected actual instruction ${ofType} to have "${prop}": ${expectedInst[prop]}. Received: ${actualInst[prop]} (on index: ${i})`
        );
        // tslint:disable-next-line:no-duplicated-branches
      } else {
        assert.deepStrictEqual(
          actualInst[prop],
          expectedInst[prop],
          `Expected actual instruction ${ofType} to have "${prop}": ${expectedInst[prop]}. Received: ${actualInst[prop]} (on index: ${i})`
        );
      }
    }
  }
}
