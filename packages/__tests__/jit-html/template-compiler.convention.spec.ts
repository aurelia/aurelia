import {
  RuntimeCompilationResources
} from '@aurelia/kernel';
import {
  BindingMode,
  ITemplateCompiler,
  TargetedInstructionType as TT,
  ITargetedInstruction
} from '@aurelia/runtime';
import {
  assert,
  TestContext
} from '@aurelia/testing';

describe('template-compiler.convention.spec.ts \n\thtml convention', function () {

  type IAttrMappingConventionCombo = [string, string, string?, Record<string, string>?];

  const bindToTwoWayCombos: IAttrMappingConventionCombo[] = [
    ['input', 'value'],
    ['input', 'files'],
    ['input', 'files', 'files', { types: 'file' }],
    ...(['date', 'datetime', 'password', 'email', 'color'].map(type => ['input', 'value', 'value', { type }] as IAttrMappingConventionCombo)),
    ['select', 'value'],
    ['input', 'checked', 'checked', { type: 'checkbox' }],
    ['input', 'checked', 'checked', { type: 'radio' }],
    ['div', 'textcontent', 'textContent', { contenteditable: 'true' }],
    ['div', 'innerhtml', 'innerHTML', { contenteditable: 'true' }],
    ['div', 'textcontent', 'textContent', { contenteditable: 'true' }],
    ['p', 'innerhtml', 'innerHTML', { contenteditable: 'true' }],
    ['textarea', 'value'],
    ['div', 'scrollleft', 'scrollLeft'],
    ['div', 'scrolltop', 'scrollTop'],
    ['p', 'scrollleft', 'scrollLeft'],
    ['span', 'scrollleft', 'scrollLeft'],
  ];

  for (const [el, bindingAttr, bindingProp = bindingAttr, elAttrs = {}] of bindToTwoWayCombos) {
    const elAttrsStr = Object.entries(elAttrs).map(([key, value]) => `${key}="${value}"`).join(' ');
    it(`compile <${el} ${bindingAttr}.bind="..." ${elAttrsStr} />`, function () {
      const ctx = TestContext.createHTMLTestContext();
      const compiler = ctx.container.get(ITemplateCompiler);
      const template = `<${el} ${bindingAttr}.bind="value" ${elAttrsStr}></${el}>`;
      const { instructions: rootInstructions } = compiler.compile(
        ctx.dom,
        { name: '', template, surrogates: [], instructions: [] },
        new RuntimeCompilationResources(ctx.container)
      );

      const expectedElInstructions: IExpectedInstruction[] = [
        { toVerify: ['type', 'mode', 'to'], mode: BindingMode.twoWay, to: bindingProp, type: TT.propertyBinding }
      ];
      verifyInstructions(rootInstructions[0], expectedElInstructions);
    });
  }

  const attrToPropCombos: IAttrMappingConventionCombo[] = [
    ['label', 'for', 'htmlFor'],
    ['img', 'usemap', 'useMap'],
    ['input', 'maxlength', 'maxLength'],
    ['input', 'minlength', 'minLength'],
    ['input', 'formaction', 'formAction'],
    ['input', 'formenctype', 'formEncType'],
    ['input', 'formmethod', 'formMethod'],
    ['input', 'formnovalidate', 'formNoValidate'],
    ['input', 'formtarget', 'formTarget'],
    ['input', 'inputmode', 'inputMode'],
    ['textarea', 'maxlength', 'maxLength'],
    ['td', 'rowspan', 'rowSpan'],
    ['td', 'colspan', 'colSpan'],
    ['th', 'rowspan', 'rowSpan'],
    ['th', 'colspan', 'colSpan'],
    ...(['div', 'p', 'span', 'custom-el'].reduce(
      (arr, el) => arr.concat([
        [el, 'accesskey', 'accessKey'],
        [el, 'contenteditable', 'contentEditable'],
        [el, 'tabindex', 'tabIndex'],
        [el, 'textcontent', 'textContent'],
        [el, 'innerhtml', 'innerHTML'],
        [el, 'readonly', 'readOnly'],
      ] as IAttrMappingConventionCombo[]),
      [] as IAttrMappingConventionCombo[]
    ))
  ];

  for (const [el, bindingAttr, bindingProp, elAttrs = {}] of attrToPropCombos) {
    const elAttrsStr = Object.entries(elAttrs).map(([key, value]) => `${key}="${value}"`).join(' ');
    it(`compile <${el} ${bindingAttr}.bind="..." ${elAttrsStr} />`, function () {
      const ctx = TestContext.createHTMLTestContext();
      const compiler = ctx.container.get(ITemplateCompiler);
      const template = `<${el} ${bindingAttr}.bind="value" ${elAttrsStr}></${el}>`;
      const { instructions: rootInstructions } = compiler.compile(
        ctx.dom,
        { name: '', template, surrogates: [], instructions: [] },
        new RuntimeCompilationResources(ctx.container)
      );

      const expectedElInstructions: IExpectedInstruction[] = [
        { toVerify: ['type', 'mode', 'to'], mode: BindingMode.toView, to: bindingProp, type: TT.propertyBinding }
      ];
      verifyInstructions(rootInstructions[0], expectedElInstructions);
    });
  }
});

interface IExpectedInstruction {
  toVerify: string[];
  [prop: string]: any;
}

function verifyInstructions(actual: readonly ITargetedInstruction[], expectation: IExpectedInstruction[], type?: string) {
  assert.strictEqual(actual.length, expectation.length, `Expected to have ${expectation.length} ${type ? type : ''} instructions. Received: ${actual.length}`);
  for (let i = 0, ii = actual.length; i < ii; ++i) {
    const actualInst = actual[i];
    const expectedInst = expectation[i];
    const ofType = type ? `of ${type}` : '';
    for (const prop of expectedInst.toVerify) {
      if (expectedInst[prop] instanceof Object) {
        assert.deepStrictEqual(
          actualInst[prop],
          expectedInst[prop],
          `Expected actual instruction ${ofType} to have "${prop}": ${expectedInst[prop]}. Received: ${actualInst[prop]} (on index: ${i})`
        );
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
