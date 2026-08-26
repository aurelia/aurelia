import { hydrateSSRDefinition, type ISSRDefinition } from '@aurelia/runtime-html';
import { itHydrateTemplateController, type HydrateTemplateController } from '@aurelia/template-compiler';
import { assert } from '@aurelia/testing';

describe('3-runtime-html/ssr-definition-hydration.spec.ts', function () {
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
