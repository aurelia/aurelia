import * as ts from 'typescript';
import { Transformer } from './transformer';
import * as fs from 'fs';
import { DOM } from './dom'
import { Parser } from './parser';
import { Expression } from './ast';
import { TemplateFactory, TemplateFactoryBinding, bindingMode } from './interfaces'
import { ViewCompiler } from './view-compiler';

export class Au {

  public static readonly parser = new Parser();
  public static readonly viewCompiler = new ViewCompiler(Au.parser);

  parseFile(fileName: string) {
    let content: string = fs.readFileSync(fileName, 'utf-8');
    if (fileName.endsWith('.au')) {
      this.parseAuFile(fileName, content);
      return;
    }
    // TODO: support normal file
    throw new Error('normal file not supported');
  }

  parseAuFile(fileName: string, content: string) {
    const modules = DOM.parseHtml(content);
    let viewModule: Element;
    let viewModelModule: Element;
    let styleModule: Element;
    for (let i = 0; i < modules.children.length; ++i) {
      let child = modules.children[i];
      if (child.tagName.toUpperCase() === 'TEMPLATE') {
        if (!viewModule) {
          viewModule = child;
        }
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
    if (!viewModule || !viewModelModule) {
      // TODO: support no view
      throw new Error('Invalid Aurelia file. Expect both view & view model.');
    }
    let templateFactory = Au.viewCompiler.compile(viewModule);
    let viewModelSource = viewModelModule.textContent;
    this.generateViewModel(fileName, templateFactory, viewModelSource);
  }

  generateViewModel(fileName: string, templateFactory: TemplateFactory, viewModelSource: string) {
    fileName = fileName.replace(/\.au$/, '.js');
    const output = ts.transpileModule(viewModelSource, {
      fileName: fileName,
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
      },
      transformers: {
        before: [
          new Transformer(templateFactory).transform
        ]
      }
    });
    fs.writeFileSync(fileName, output.outputText, 'utf-8');
    let astOutput = TemplateFactory.emitAst();
    // ts.createProgram(
    //   [],
    //   { target: ts.ScriptTarget.Latest },
    //   {
    //     getSourceFile: (fileName) => astOutput,
    //     getDefaultLibFileName: () => '',
    //     getCurrentDirectory: () => '',
    //     getDirectories: () => [],
    //     getCanonicalFileName: (fileName) => fileName,
    //     useCaseSensitiveFileNames: () => true,
    //     getNewLine: () => "\n",
    //     fileExists: (fileName) => fileName === 'src/asts.js',
    //     readFile: (fileName) => astOutput.text,
    //     writeFile: (fileName, text) => {
    //       fs.writeFileSync(fileName, text, 'utf-8')
    //     }
    //   }
    // ).emit(astOutput, (fileName, text) => {
    //   fs.writeFileSync(fileName, text, 'utf-8')
    // });
    // astOutput = ts.transform(astOutput, [], {
    //   target: ts.ScriptTarget.Latest
    // }).transformed[0]// || astOutput;
    // console.log(astOutput);
    fs.writeFileSync('src/asts.js', ts.createPrinter().printFile(astOutput), 'utf-8');
  }
}


