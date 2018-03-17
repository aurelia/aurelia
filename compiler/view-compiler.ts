import {
  // bindingMode,
  IBindingLanguage,
  // bindingType,
  // IViewResources,
  IAureliaModule,
  IResourceElement,
  IAureliaModuleCompiler,
  IViewCompiler,
  ITemplateFactory,
  resourceKind
} from "./interfaces";
import { Parser } from "./parser";
import { DOM } from "./dom";
import {
  TextBinding,
  // AbstractBinding,
} from "./binding";
// import * as path from 'path';
// import * as ts from 'typescript';
import { relativeToFile } from 'aurelia-path';
import { TemplateFactory } from './template-factory';
import { arrayRemove } from "./util";
import { CustomElementBinding } from "./behavior-binding";

export class ViewCompiler implements IViewCompiler {

  static inject = [Parser, 'IBindingLanguage'];

  moduleCompiler: IAureliaModuleCompiler;

  constructor(
    public parser: Parser,
    public bindingLanguage: IBindingLanguage
  ) {

  }

  compileWithModule(fileName: string, aureliaModule: IAureliaModule) {
    let templates = aureliaModule.templates;
    let mainTemplate = templates[0];
    let importFiles = this.extractTemplateImports(mainTemplate);

    // let depModules: IAureliaModule[] = [];
    // let depFactories: ITemplateFactory[] = [];

    let dependencies = importFiles.map(depFileName => {
      let depModule = this.moduleCompiler.compile(relativeToFile(depFileName, fileName));
      // depModules.push(depModule);
      // this.compileWithModule(depModule.fileName, depModule);
      return depModule;
    });

    let factory = this.compile(fileName, mainTemplate, aureliaModule, dependencies, aureliaModule.mainResource);

    aureliaModule.addFactory(factory);
    dependencies.forEach(dep => {
      factory.addDependency(this.compileWithModule(dep.fileName, dep));
    });

    return aureliaModule;
  }

  compile(fileName: string, template: string | Element, aureliaModule: IAureliaModule, dependencyModules: IAureliaModule[], elRes?: IResourceElement): ITemplateFactory {
    let factory: ITemplateFactory = new TemplateFactory(aureliaModule, elRes);
    let node: Node;
    let element: Element;

    if (typeof template === 'string') {
      element = DOM.createTemplateFromMarkup(template);
      node = (element as HTMLTemplateElement).content;
    } else {
      element = template;
      node = template.tagName.toLowerCase() === 'template' ? (template as HTMLTemplateElement).content : template;
    }
    this.compileNode(node, aureliaModule, factory, dependencyModules, element);
    factory.html = element.innerHTML.trim();
    factory.owner = aureliaModule;
    return factory;
  }

  private extractTemplateImports(template: HTMLTemplateElement): string[] {
    const imports = Array.from(template.getElementsByTagName('import'));
    const requires = Array.from(template.getElementsByTagName('require'));
    const importModules = [];
    while (imports.length) {
      let $import = imports[0];
      let moduleId = $import.getAttribute('from');
      if (!moduleId) {
        throw new Error('Invalid <import/> element. No "from" attribute specifier.');
      }
      importModules.push(moduleId);
      ($import.parentNode || template).removeChild($import);
      arrayRemove(imports, $import);
    }
    let hasRequires = false;
    while (requires.length) {
      let $require = requires[0];
      let moduleId = $require.getAttribute('from');
      if (!moduleId) {
        throw new Error('Invalid <require/> element. No "from" attribute specifier.');
      }
      importModules.push(moduleId);
      hasRequires = true;
      ($require.parentNode || template).removeChild($require);
      arrayRemove(requires, $require);
    }
    if (hasRequires) {
      console.log('Use <import from="..." /> instead of <require/>. <require/> was used to support IE11 as IE11 does NOT allow <import />.');
    }
    return importModules;
  }

  // private processImports(fileName: string, imports: string[], templateFactory: ITemplateFactory, sourceResource: IAureliaModule) {
  //   const modules = imports.map(m => {
  //     return {
  //       fileName,
  //       text: fs.readFileSync(path.resolve(fileName, m), 'utf-8')
  //     };
  //   });
  //   modules.forEach(m => {
  //     templateFactory.addDependency(this.moduleCompiler.compile(m.fileName, m.text));
  //   });
  // }

  private compileNode(node: Node, resourceModule: IAureliaModule, templateFactory: ITemplateFactory, dependencyModules: IAureliaModule[], parentNode: Node) {
    switch (node.nodeType) {
      case 1: //element node
        return this.compileElement(node as Element, resourceModule, templateFactory, dependencyModules, parentNode);
      // return this._compileElement(node, resources, instructions, parentNode, parentInjectorId, targetLightDOM);
      case 3: //text node
        //use wholeText to retrieve the textContent of all adjacent text nodes.
        let templateLiteralExpression = this.bindingLanguage.inspectTextContent(node.textContent || '');
        if (templateLiteralExpression) {
          let marker = document.createElement('au-marker');
          marker.className = 'au';
          // let auTargetID = makeIntoInstructionTarget(marker);
          (node.parentNode || parentNode).insertBefore(marker, node);
          node.textContent = ' ';
          // instructions[auTargetID] = TargetInstruction.contentExpression(expression);
          //remove adjacent text nodes.
          while (node.nextSibling && node.nextSibling.nodeType === 3) {
            (node.parentNode || parentNode).removeChild(node.nextSibling);
          }
          let lastIndex = templateFactory.lastTargetIndex;
          templateFactory.bindings.push(new TextBinding(
            Parser.addAst(node.textContent, templateLiteralExpression),
            lastIndex + 1
          ));
        } else {
          //skip parsing adjacent text nodes.
          while (node.nextSibling && node.nextSibling.nodeType === 3) {
            node = node.nextSibling;
          }
        }
        return node.nextSibling;
      case 11: //document fragment node
        let currentChild = node.firstChild;
        while (currentChild) {
          currentChild = this.compileNode(currentChild, resourceModule, templateFactory, dependencyModules, parentNode);
        }
        break;
      default:
        break;
    }
    return node.nextSibling;
  }

  private compileElement(node: Element, resourceModule: IAureliaModule, templateFactory: ITemplateFactory, dependencyModules: IAureliaModule[], parentNode: Node) {
    let hasBinding = false;
    let lastIndex = templateFactory.lastTargetIndex;
    // let currentElement: IResourceElement = templateFactory.elementResource;
    let elementResource = templateFactory.getCustomElement(node.tagName);
    if (!elementResource) {
      for (let i = 0, ii = dependencyModules.length; ii > i; ++i) {
        let dep = dependencyModules[i];
        elementResource = dep.getCustomElement(node.tagName);
        if (elementResource) {
          // If custom element comes from a dependency

          // get all currently used dependencies from that dep
          let existingDepedencies = templateFactory.usedDependencies.get(dep);
          if (!existingDepedencies) {
            // ensure the list is allocated
            templateFactory.usedDependencies.set(dep, existingDepedencies = []);
          }

          let existed = false;
          // loop through existing and find match
          // TODO:  ensure one module always resultes in 1 IAureliaModule instance
          //        so no need to loop and check for matching name of the resource
          for (let j = 0, jj = existingDepedencies.length; jj > j; ++j) {
            let existingDep = existingDepedencies[j];
            if (existingDep.kind === resourceKind.element && existingDep.name === elementResource.name) {
              existed = true;
              break;
            }
          }
          if (!existed) {
            existingDepedencies.push(elementResource);
          }
          break;
        }
      }
    }
    let elementBinding: CustomElementBinding;
    if (elementResource) {
      templateFactory.bindings.push(elementBinding = new CustomElementBinding(
        elementResource,
        lastIndex + 1,
        templateFactory.lastBehaviorIndex + 1
      ));
    }
    for (let i = 0; i < node.attributes.length; ++i) {
      let attr = node.attributes[i];
      let binding = this.bindingLanguage.inspectAttribute(node, attr.nodeName, attr.value, lastIndex + 1, elementResource, templateFactory, resourceModule);
      if (binding) {
        // if (elementResource) {

        // } else {
        templateFactory.bindings.push(binding);
        hasBinding = true;
        node.removeAttribute(attr.nodeName);
        --i;
        // }
      }
    }
    if (hasBinding) {
      node.classList.add('au');
    }
    let currentChild = node.firstChild;
    while (currentChild) {
      currentChild = this.compileNode(currentChild, resourceModule, templateFactory, dependencyModules, parentNode);
    }
    return node.nextSibling;
  }
}
