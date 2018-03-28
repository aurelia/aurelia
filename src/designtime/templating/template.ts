import {Template as RuntimeTemplate, ITemplate} from '../../runtime/templating/template';

export const Template = Object.assign(RuntimeTemplate, {
  fromUncompiledSource(uncompiledSource): ITemplate {
    let compiledSource = null; //TODO: Implement Compiler
    return RuntimeTemplate.fromCompiledSource(compiledSource);
  }
});
