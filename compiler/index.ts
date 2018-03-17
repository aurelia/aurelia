import { Parser } from './parser';
import { IAureliaModule, IAureliaModuleCompiler, IViewCompiler, IViewModelCompiler, IBindingLanguage, IFileUtils } from './interfaces'
import { ViewCompiler } from './view-compiler';
import { ViewModelCompiler } from './view-model-compiler';
import { AureliaModuleCompiler } from './module-compiler';
import { IContainer, Container } from './di/container';
import { TemplatingBindingLanguage } from './binding-language';

export { Parser } from './parser';

export class AureliaCompiler {

  public readonly container: IContainer;
  public readonly parser: Parser;
  public readonly viewCompiler: IViewCompiler;
  public readonly viewModelCompiler: IViewModelCompiler;
  public readonly moduleCompiler: IAureliaModuleCompiler;

  constructor(fileUtils: IFileUtils) {
    let container: IContainer = this.container = new Container().makeGlobal();

    this.parser = container.get(Parser);
    container.registerInstance('Parser', this.parser);

    // let fileUtils: IFileUtils = container.get(NodeFileUtils);
    container.registerInstance('IFileUtils', fileUtils);

    let bindingLanguage: IBindingLanguage = container.get(TemplatingBindingLanguage);
    container.registerInstance('IBindingLanguage', bindingLanguage);

    let viewModelCompiler: IViewModelCompiler = this.viewModelCompiler = container.get(ViewModelCompiler);
    container.registerInstance('IViewModelCompiler', viewModelCompiler);

    let viewCompiler: IViewCompiler = this.viewCompiler = container.get(ViewCompiler);
    container.registerInstance('IViewCompiler', viewCompiler);

    let moduleCompiler: IAureliaModuleCompiler = this.moduleCompiler = container.get(AureliaModuleCompiler);
    container.registerInstance('IAureliaModuleCompiler', moduleCompiler)

    viewCompiler.moduleCompiler = moduleCompiler;
  }

  start(fileName: string): IAureliaModule {

    return this.moduleCompiler.compile(fileName);
  }

  emitAll() {
    return this.moduleCompiler.emitAll();
  }
}


