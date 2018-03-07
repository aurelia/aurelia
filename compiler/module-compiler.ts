import * as fs from 'fs';
import { IAureliaModuleCompiler, IAureliaModule, IViewCompiler, IViewModelCompiler } from "./interfaces";
import { DOM } from './dom';

export class AureliaModuleCompiler implements IAureliaModuleCompiler {

  static inject = ['IViewCompiler', 'IViewModelCompiler'];

  constructor(
    public viewCompiler: IViewCompiler,
    public viewModelCompiler: IViewModelCompiler
  ) {

  }

  compile(fileName: string, content?: string): IAureliaModule {
    let compiled: IAureliaModule = this.parseFile(fileName, content);
    return compiled;
  }

  private parseFile(fileName: string, content?: string) {
    let ext = (/\.(au|ts|js)$/.exec(fileName) || [])[1];
    if (!ext) {
      let auExist = fs.existsSync(`${fileName}.au`);
      if (auExist) {
        fileName = fileName + '.au';
        ext = 'au';
      }
    }
    switch (ext) {
      case 'au': return this.parseAuFile(fileName, content = content || fs.readFileSync(fileName, 'utf-8'));
      // case 'ts': return this.parseTsFile(fileName, content = content || fs.readFileSync(fileName, 'utf-8'));
      // case 'js': return this.parseJsFile(fileName, content = content || fs.readFileSync(fileName, 'utf-8'));
    }
    // TODO: support normal file
    throw new Error('normal file not supported');
  }

  private parseAuFile(fileName: string, content: string): IAureliaModule {
    const modules = DOM.parseHtml(content);
    let viewModule: Element;
    let viewModules: HTMLTemplateElement[] = [];
    let viewModelModule: Element;
    let styleModule: Element;
    for (let i = 0; i < modules.children.length; ++i) {
      let child = modules.children[i];
      if (child.tagName.toUpperCase() === 'TEMPLATE') {
        if (!viewModule) {
          viewModule = child;
        }
        viewModules.push(child as HTMLTemplateElement);
      } else if (child.tagName.toUpperCase() === 'SCRIPT') {
        if (!viewModelModule) {
          viewModelModule = child;
        }
      } else if (child.tagName.toUpperCase() === 'STYLE') {
        if (!styleModule) {
          styleModule = child;
        }
      }
    }
    if (!viewModules.length || !viewModelModule) {
      // TODO: support no view
      throw new Error('Invalid Aurelia file. Expect both view & view model.');
    }
    let $partialAureliaModule = this.viewModelCompiler.compile(fileName, viewModelModule.textContent);
    $partialAureliaModule.templates = viewModules;
    this.viewCompiler.compileWithModule(fileName, $partialAureliaModule);

    return $partialAureliaModule;
    // let templateFactory = this.viewCompiler.compile(fileName, viewModule, $viewModelModule);
    // let viewModelSource = viewModelModule.textContent;
    // this.generateViewModel(fileName, templateFactory, viewModelSource);
    // this.generate(fileName, templateFactory, $viewModelModule);
  }

  parseTsFile(fileName: string, content: string) {

  }

  parseJsFile(fileName: string, content: string) {

  }
}
