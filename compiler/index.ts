import * as ts from 'typescript';
import { Transformer } from './transformer';
import * as fs from 'fs';
import { DOM } from './dom'
import { Parser } from './parser';
import { Expression } from './ast';
import { bindingMode, IAureliaModule, IAureliaModuleCompiler, IViewCompiler, IViewModelCompiler } from './interfaces'
import { ViewCompiler } from './view-compiler';
import { ViewModelCompiler, ResourceModule } from './view-model-compiler';
import { AureliaModuleCompiler } from './module-compiler';
import 'aurelia-polyfills';
import { Container } from '../src/framework/dependency-injection/container';
import { TemplatingBindingLanguage } from './binding-language';
import { SyntaxInterpreter } from './syntax-interpreter';

export { Parser } from './parser';

export class AureliaCompiler {

  public readonly container: Container;
  public readonly parser: Parser;
  public readonly viewCompiler: IViewCompiler;
  public readonly viewModelCompiler: IViewModelCompiler;
  public readonly moduleCompiler: IAureliaModuleCompiler;

  constructor() {
    let container = this.container = new Container().makeGlobal();

    this.parser = container.get(Parser);
    container.registerInstance('Parser', this.parser);

    let bindingLanguage = container.get(TemplatingBindingLanguage);
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

  // parseFile(fileName: string) {
  //   let content: string = fs.readFileSync(fileName, 'utf-8');
  //   if (fileName.endsWith('.au')) {
  //     this.parseAuFile(fileName, content);
  //     return;
  //   }
  //   // TODO: support normal file
  //   throw new Error('normal file not supported');
  // }

  // parseAuFile(fileName: string, content: string) {
  //   const modules = DOM.parseHtml(content);
  //   let viewModule: Element;
  //   let viewModules: HTMLTemplateElement[];
  //   let viewModelModule: Element;
  //   let styleModule: Element;
  //   for (let i = 0; i < modules.children.length; ++i) {
  //     let child = modules.children[i];
  //     if (child.tagName.toUpperCase() === 'TEMPLATE') {
  //       if (!viewModule) {
  //         viewModule = child;
  //       }
  //     } else if (child.tagName.toUpperCase() === 'SCRIPT') {
  //       if (!viewModelModule) {
  //         viewModelModule = child;
  //       }
  //     } else if (child.tagName.toUpperCase() === 'STYLE') {
  //       if (!styleModule) {
  //         styleModule = child;
  //       }
  //     }
  //   }
  //   if (!viewModule || !viewModelModule) {
  //     // TODO: support no view
  //     throw new Error('Invalid Aurelia file. Expect both view & view model.');
  //   }
  //   let $viewModelModule = this.viewModelCompiler.compile(fileName, viewModelModule.textContent);
  //   let templateFactory = this.viewCompiler.compile(fileName, viewModule, $viewModelModule, true);
  //   let viewModelSource = viewModelModule.textContent;
  //   // this.generateViewModel(fileName, templateFactory, viewModelSource);
  //   this.generate(fileName, templateFactory, $viewModelModule);
  // }

  // private generate(fileName: string, templateFactory: TemplateFactory, viewModelModule: IAureliaModule) {
  //   const source = ts.createPrinter().printFile(viewModelModule.file);
  //   const output = ts.transpileModule(source, {
  //     fileName: fileName,
  //     compilerOptions: {
  //       target: ts.ScriptTarget.ESNext,
  //     },
  //     transformers: {
  //       before: [
  //         new Transformer(templateFactory, viewModelModule).transform
  //       ]
  //     }
  //   });
  //   fs.writeFileSync(fileName = fileName.replace(/\.au$/, '.js'), output.outputText, 'utf-8');
  //   let astOutput = TemplateFactory.emitAst();
  //   fs.writeFileSync('src/asts.js', ts.createPrinter().printFile(astOutput), 'utf-8');
  // }

  // generateViewModel(fileName: string, templateFactory: TemplateFactory, viewModelSource: string) {
  //   fileName = fileName.replace(/\.au$/, '.js');
  //   const output = ts.transpileModule(viewModelSource, {
  //     fileName: fileName,
  //     compilerOptions: {
  //       target: ts.ScriptTarget.ESNext,
  //     },
  //     transformers: {
  //       before: [
  //         new Transformer(templateFactory, null).transform
  //       ]
  //     }
  //   });
  //   fs.writeFileSync(fileName, output.outputText, 'utf-8');
  //   let astOutput = TemplateFactory.emitAst();
  //   fs.writeFileSync('src/asts.js', ts.createPrinter().printFile(astOutput), 'utf-8');
  // }
}


