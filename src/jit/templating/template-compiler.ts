import { ITemplateCompiler, ICompilationResources } from "../../runtime/templating/template-compiler";
import { TemplateDefinition } from "../../runtime/templating/instructions";

export class TemplateCompiler implements ITemplateCompiler {
  get name() {
    return 'default';
  }
  
  compile(definition: TemplateDefinition, resources: ICompilationResources): TemplateDefinition {
    throw new Error('Template Compiler Not Yet Implemented');
  }
}
