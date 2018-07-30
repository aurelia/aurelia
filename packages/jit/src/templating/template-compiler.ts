import { ITemplateCompiler } from "../../runtime/templating/template-compiler";
import { TemplateDefinition } from "../../runtime/templating/instructions";
import { IResourceDescriptions } from "../../runtime/resource";

export class TemplateCompiler implements ITemplateCompiler {
  get name() {
    return 'default';
  }
  
  compile(definition: TemplateDefinition, resources: IResourceDescriptions): TemplateDefinition {
    throw new Error('Template Compiler Not Yet Implemented');
  }
}
