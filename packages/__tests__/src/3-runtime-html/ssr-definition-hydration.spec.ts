import { Aurelia, CustomElement, hydrateSSRDefinition, type ISSRDefinition } from '@aurelia/runtime-html';
import { itHydrateTemplateController, itInterpolation, type HydrateTemplateController, type InterpolationInstruction } from '@aurelia/template-compiler';
import { tasksSettled } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';

describe('3-runtime-html/ssr-definition-hydration.spec.ts', function () {
  for (const content of [false, true]) {
    it(`preserves explicit text-content semantics through serialized interpolation instructions (${content})`, async function () {
      const hydrated = hydrateSSRDefinition({
        template: '<!--au--><textarea></textarea>',
        expressions: [{ id: 'value', ast: { $kind: 'AccessScope', name: 'value', ancestor: 0 } }],
        definition: {
          name: 'serialized-text-content',
          instructions: [[{
            type: itInterpolation,
            exprIds: ['value'],
            parts: ['Value: ', ''],
            to: 'textContent',
            ...(content ? { isTextContent: true as const } : {}),
          }]],
          nestedTemplates: [],
          targetCount: 1,
        },
        nestedHtmlTree: [],
      } satisfies ISSRDefinition);
      const instruction = hydrated.instructions[0][0] as InterpolationInstruction;
      assert.strictEqual(Object.hasOwn(instruction, 'isTextContent'), content);
      const App = CustomElement.define({ name: 'serialized-text-content', ...hydrated }, class {
        public value: string | undefined;
      });
      const ctx = TestContext.create();
      const host = ctx.doc.body.appendChild(ctx.createElement('serialized-text-content'));
      const component = new App();
      const au = new Aurelia(ctx.container).app({ host, component });
      try {
        await au.start();
        // Absence keeps existing property-interpolation behavior. Content
        // provenance is supplied by the compiler, not guessed from `to`.
        assert.strictEqual(host.querySelector('textarea')!.value, content ? 'Value: ' : 'Value: undefined');
        component.value = 'ready';
        await tasksSettled();
        assert.strictEqual(host.querySelector('textarea')!.value, 'Value: ready');
      } finally {
        await au.stop(true);
        au.dispose();
        host.remove();
      }
    });
  }

  it('keeps linked provenance absent when the serializer did not prove a link', function () {
    const hydrated = hydrateSSRDefinition({
      template: '<!--au-->',
      expressions: [],
      definition: {
        name: 'root',
        instructions: [[{
          type: itHydrateTemplateController,
          res: 'if',
          templateIndex: 0,
          instructions: [],
        }]],
        nestedTemplates: [{
          name: 'if-branch',
          instructions: [],
          nestedTemplates: [],
          targetCount: 0,
        }],
        targetCount: 1,
      },
      nestedHtmlTree: [{ html: '<div>branch</div>', nested: [] }],
    } satisfies ISSRDefinition);

    const instruction = hydrated.instructions[0][0] as HydrateTemplateController;
    assert.strictEqual(Object.prototype.hasOwnProperty.call(instruction, 'linked'), false);
  });

  it('restores linked provenance through nested serialized definitions', function () {
    const hydrated = hydrateSSRDefinition({
      template: '<!--au-->',
      expressions: [],
      definition: {
        name: 'root',
        instructions: [[{
          type: itHydrateTemplateController,
          res: 'else',
          templateIndex: 0,
          instructions: [],
          linked: true,
        }]],
        nestedTemplates: [{
          name: 'else-if-wrapper',
          instructions: [[{
            type: itHydrateTemplateController,
            res: 'if',
            templateIndex: 0,
            instructions: [],
            linked: true,
          }]],
          nestedTemplates: [{
            name: 'if-branch',
            instructions: [],
            nestedTemplates: [],
            targetCount: 0,
          }],
          targetCount: 1,
        }],
        targetCount: 1,
      },
      nestedHtmlTree: [{
        html: '<!--au-->',
        nested: [{ html: '<div>branch</div>', nested: [] }],
      }],
    } satisfies ISSRDefinition);

    const elseInstruction = hydrated.instructions[0][0] as HydrateTemplateController;
    assert.strictEqual(elseInstruction.linked, true);

    const ifInstruction = elseInstruction.def.instructions![0][0] as HydrateTemplateController;
    assert.strictEqual(ifInstruction.res, 'if');
    assert.strictEqual(ifInstruction.linked, true);
    assert.strictEqual(ifInstruction.def.template, '<div>branch</div>');
  });
});
