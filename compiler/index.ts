import { propertyAccessor } from './../src/framework/property-observation';
import * as ts from 'typescript';
import { Transformer } from './transformer';
import * as fs from 'fs';
import { Document, Element } from './dom'
import { Parser } from './parser';
import { Expression } from './ast';
import { TemplateFactory, TemplateFactoryBinding, bindingMode } from './interfaces'

let document: Document;


export class Au {

  public static readonly parser: Parser = new Parser();

  // static run() {
  //   return ts.transpileModule(`export class App {\n}`, {
  //     fileName: 'app.au',
  //     compilerOptions: {
  //       target: ts.ScriptTarget.ES2015
  //     },
  //     transformers: {
  //       before: [
  //         new Transformer().transform
  //       ]
  //     }
  //   });
  // }

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
    const template = this.parseHtml(content);
    let viewModule: Element;
    let viewModelModule: Element;
    let styleModule: Element;
    for (let i = 0; i < template.children.length; ++i) {
      let child = template.children[i];
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
    let templateFactory = this.compile(viewModule);
    let viewModelSource = viewModelModule.textContent;
    this.generateViewModel(fileName, templateFactory, viewModelSource);
  }

  generateViewModel(fileName: string, templateFactory: TemplateFactory, viewModelSource: string) {
    fileName = fileName.replace(/\.au$/, '.js');
    const output = ts.transpileModule(viewModelSource, {
      fileName: fileName,
      compilerOptions: {
        target: ts.ScriptTarget.ESNext
      },
      transformers: {
        before: [
          new Transformer(templateFactory).transform
        ]
      }
    });
    fs.writeFileSync(fileName, output.outputText, 'utf-8');
  }

  parseHtml(html: string): Element {
    document = new Document();
    document.documentElement.innerHTML = `
      <head></head>
      <body><div>${html.trim()}</div></body>
    `;
    return document.body.firstElementChild;
  }

  parseTemplate(template: string) {
    const element = this.parseHtml(template.trim());

  }

  compile(template: string | Element) {
    const factory: TemplateFactory = {
      html: '',
      bindings: []
    };
    const element = typeof template === 'string' ? this.parseHtml(template) : template;
    this.compileNode(element.firstChild, factory);
    factory.html = element.innerHTML;
    return factory;
  }

  compileNode(node: Node, templateFactory: TemplateFactory) {
    switch (node.nodeType) {
      case 1: //element node
        return this.compileElement(node as Element, templateFactory);
      // return this._compileElement(node, resources, instructions, parentNode, parentInjectorId, targetLightDOM);
      case 3: //text node
        //use wholeText to retrieve the textContent of all adjacent text nodes.
        // let expression = resources.getBindingLanguage(this.bindingLanguage).inspectTextContent(resources, node.wholeText);
        // if (expression) {
        //   let marker = document.createElement('au-marker');
        //   let auTargetID = makeIntoInstructionTarget(marker);
        //   (node.parentNode || parentNode).insertBefore(marker, node);
        //   node.textContent = ' ';
        //   instructions[auTargetID] = TargetInstruction.contentExpression(expression);
        //   //remove adjacent text nodes.
        //   while (node.nextSibling && node.nextSibling.nodeType === 3) {
        //     (node.parentNode || parentNode).removeChild(node.nextSibling);
        //   }
        // } else {
        //   //skip parsing adjacent text nodes.
        //   while (node.nextSibling && node.nextSibling.nodeType === 3) {
        //     node = node.nextSibling;
        //   }
        // }
        // return node.nextSibling;
        const marker = document.createElement('au-marker');
        node.parentNode.insertBefore(marker, node);
        node.textContent = ' ';
        // instructions[auTargetID] = TargetInstruction.contentExpression(expression);
        //remove adjacent text nodes.
        while (node.nextSibling && node.nextSibling.nodeType === 3) {
          node.parentNode.removeChild(node.nextSibling);
        }
        node.textContent = ' ';
        return node.nextSibling;
      case 11: //document fragment node
        // let currentChild = node.firstChild;
        // while (currentChild) {
        //   currentChild = this._compileNode(currentChild, resources, instructions, node, parentInjectorId, targetLightDOM);
        // }
        // break;
        const nextSibling = node.nextSibling;
        node.parentNode.removeChild(node);
        return nextSibling;
      default:
        throw new Error('Unsuported node type');
    }
  }

  private compileElement(node: Element, templateFactory: TemplateFactory) {
    let hasBinding = false;
    let bindings = templateFactory.bindings;
    let lastBinding = bindings[bindings.length - 1];
    let lastIndex = lastBinding ? lastBinding[0] : -1;
    for (let i = 0; i < node.attributes.length; ++i) {
      let attr = node.attributes[i];
      let parts = attr.nodeName.split('.');
      if (parts.length === 2) {
        let command = parts[1];
        let attrBindingMode = command in bindingMode ? bindingMode[command] : this.determineBindingMode(node, parts[0]);
        bindings.push([
          lastIndex + 1,
          parts[0],
          Au.parser.parse(attr.value),
          attrBindingMode
        ]);
        node.removeAttribute(attr.nodeName);
        hasBinding = true;
      }
    }
    if (hasBinding) {
      node.classList.add('au');
    }
    let currentChild = node.firstChild;
    while (currentChild) {
      currentChild = this.compileNode(currentChild, templateFactory);
    }
    return node.nextSibling;
  }

  determineBindingMode(element: Element, attr: string) {
    return element.tagName === 'INPUT' && (attr === 'checked' || attr === 'value')
      ? bindingMode.twoWay
      : bindingMode.oneWay;
  }
}


