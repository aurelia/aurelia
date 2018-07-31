import { IResourceDescriptions, ITemplateCompiler, TemplateDefinition } from '@aurelia/runtime';

export class TemplateCompiler implements ITemplateCompiler {
  public get name() {
    return 'default';
  }

  public compile(definition: TemplateDefinition, resources: IResourceDescriptions): TemplateDefinition {
    throw new Error('Template Compiler Not Yet Implemented');
  }
}
