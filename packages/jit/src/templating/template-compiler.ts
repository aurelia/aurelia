import { ITemplateCompiler } from '@aurelia/runtime';
import { TemplateDefinition } from '@aurelia/runtime';
import { IResourceDescriptions } from '@aurelia/runtime';

export class TemplateCompiler implements ITemplateCompiler {
  get name() {
    return 'default';
  }
  
  compile(definition: TemplateDefinition, resources: IResourceDescriptions): TemplateDefinition {
    throw new Error('Template Compiler Not Yet Implemented');
  }
}
