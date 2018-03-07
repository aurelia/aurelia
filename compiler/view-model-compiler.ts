import * as ts from 'typescript';
import * as fs from 'fs';
import {
  IViewResources,
  IAureliaModuleCompiler,
  IAureliaModule,
  ITemplateFactory,
  IViewModelCompiler,
  IResourceElement,
  IResourceAttribute,
  IResourceValueConverter,
  IResourceBindingBehavior,
  resourceKind,
  IAureliaModuleStatements,
} from "./interfaces";
import { ElementResource, AttributeResource } from './view-resources';
import { ViewCompiler } from './view-compiler';
import { getElementHtmlName, getAttributeHtmlName, getElementViewName, normalizeElementClassName } from './util';

export class ViewModelCompiler implements IViewModelCompiler {
  constructor(
  ) {

  }

  compile(fileName: string, content?: string): IAureliaModule {
    return new ResourceModule(fileName, content);
  }
}

export class ResourceModule implements IAureliaModule {

  elements: Record<string, IResourceElement> = {};
  attributes: Record<string, IResourceAttribute> = {};
  valueConverters?: Record<string, IResourceValueConverter>;
  bindingBehaviors?: Record<string, IResourceBindingBehavior>;

  public readonly file: ts.SourceFile;
  // public readonly resources: IViewResources = new ViewResources();

  templates: HTMLTemplateElement[];
  templateFactories: ITemplateFactory[];
  mainResource: IResourceElement;

  constructor(
    public fileName: string,
    text?: string
  ) {
    let file = ts.createSourceFile(
      fileName,
      text === undefined ? fs.readFileSync(fileName, 'utf-8') : text,
      ts.ScriptTarget.Latest
    );
    this.file = ts.updateSourceFileNode(file, this.transform(file));

    // this.customAttributes.forEach(e => {
    //   const attrName = getAttributeHtmlName(e.name);
    //   this.resources.setCustomAttribute(attrName, e);
    // });
    // this.valueConverters.forEach(e => {
    //   this.resources.setValueConverter(e.name.text, e);
    // });
    // this.bindingBehaviors.forEach(e => {
    //   this.resources.setBindingBehavior(e.name.text, e);
    // });
  }

  private isExportedClass(node: ts.Node): node is ts.ClassDeclaration & ts.ExportDeclaration {
    return node.kind === ts.SyntaxKind.ClassDeclaration
      && ((ts.getCombinedModifierFlags(node)
        | ts.ModifierFlags.Export) === ts.ModifierFlags.Export
      );
  }

  private isCustomElement(node: ts.Node): node is ts.ClassDeclaration & ts.ExportDeclaration {
    if (!this.isExportedClass(node)) {
      return false;
    }
    const name = node.name.escapedText.toString();
    if (name.endsWith('CustomElement')) {
      return true;
    }
    const decorators = node.decorators;
    if (!decorators) {
      return false;
    }
    return decorators.some(d => {
      const decoratorExpression = d.expression;
      if (ts.isCallExpression(decoratorExpression)) {
        return (decoratorExpression.expression as ts.Identifier).escapedText === 'customElement';
      } else {
        return (decoratorExpression as ts.Identifier).escapedText === 'customElement';
      }
    });
  }

  private isCustomAttribute(node: ts.Node): node is ts.ClassDeclaration & ts.ExportDeclaration {
    if (!this.isExportedClass(node)) {
      return false;
    }
    const name = node.name.escapedText.toString();
    if (name.endsWith('CustomAttribute')) {
      return true;
    }
    const decorators = node.decorators;
    if (!decorators) {
      return false;
    }
    return decorators.some(d => {
      const decoratorExpression = d.expression;
      if (ts.isCallExpression(decoratorExpression)) {
        return (decoratorExpression.expression as ts.Identifier).escapedText === 'customAttribute';
      } else {
        return (decoratorExpression as ts.Identifier).escapedText === 'customAttribute';
      }
    });
  }

  // private get customAttributes() {
  //   return this.file.getSourceFile().statements.filter(this.isCustomAttribute, this);
  // }

  // private get valueConverters() {
  //   return [];
  // }

  // private get bindingBehaviors() {
  //   return [];
  // }

  private transform(source: ts.SourceFile) {
    let updatedStatements = source.getSourceFile().statements.reduce((statements: ts.Statement[], statement: ts.Statement, idx: number) => {
      // console.log(statement, this.isCustomElement(statement));
      if (this.isCustomElement(statement)) {
        let htmlName = getElementHtmlName(statement);
        let elResource = new ElementResource(normalizeElementClassName(statement), resourceKind.element, statement);
        if (!this.mainResource) {
          this.mainResource = elResource;
        }
        this.elements[htmlName] = elResource;
        return statements.concat(this.updateCustomElementClass(statement));
      } else {
        return statements.concat(statement);
      }
    }, []);
    return updatedStatements;
  }

  private updateCustomElementClass(node: ts.ClassDeclaration) {
    // this.exportedCustomElements = this.exportedCustomElements || [];
    // let elName = getCustomElementName(node.name);
    // let exportedElement = this.exportedCustomElements.find(e => getCustomElementName(e.name) === elName);
    // if (!exportedElement) {
    //   exportedElement = { name: elName };
    //   this.exportedElements.push(exportedElement);
    // }
    const htmlName = getElementHtmlName(node.name);
    const viewClassName = getElementViewName(node.name);
    const classMembers = [...node.members];
    let ctor: ts.ConstructorDeclaration;
    let ctorBody: ts.Block;
    let ctorIndex: number = -1;
    let bindMethod: ts.MethodDeclaration;
    let bindMethodBody: ts.Block;
    let bindMethodIndex: number = -1;


    // classMembers.forEach((member, idx) => {
    //   if (!ctor && ts.isConstructorDeclaration(member)) {
    //     ctor = member;
    //     ctorIndex = idx;
    //     return;
    //   }
    //   if (!ts.isMethodDeclaration(member)) {
    //     return;
    //   }
    //   if (!bindMethod && member.name.toString() === 'bind') {
    //     bindMethod = member;
    //     bindMethodIndex = idx;
    //   }
    // });

    // if (ctor) {
    //   ctor = ts.createConstructor(
    //     undefined,
    //     undefined,
    //     undefined,
    //     ts.createBlock([
    //       ts.createStatement(
    //         ts.createCall(
    //           ts.createSuper(),
    //           undefined,
    //           undefined
    //         ),
    //       ),
    //       ...ctor.body.statements
    //     ], /* multiline */ true)
    //   );
    //   classMembers.splice(ctorIndex, 1, ctor);
    // }

    // if (bindMethod) {
    //   bindMethodIndex = classMembers.indexOf(bindMethod);
    //   bindMethodBody = (bindMethod as ts.MethodDeclaration).body;
    // } else {
    //   bindMethod = {} as any;
    //   bindMethodBody = ts.createBlock([]);
    // }
    // bindMethod = ts.createMethod(
    //   bindMethod.decorators,
    //   bindMethod.modifiers,
    //   bindMethod.asteriskToken,
    //   'bind',
    //   bindMethod.questionToken,
    //   bindMethod.typeParameters,
    //   bindMethod.parameters,
    //   bindMethod.type,
    //   ts.createBlock(
    //     [
    //       ts.createStatement(
    //         ts.createCall(
    //           ts.createPropertyAccess(
    //             ts.createSuper(),
    //             ts.createIdentifier('bind')
    //           ),
    //           undefined,
    //           undefined
    //         ),
    //       ),
    //       ...bindMethodBody.statements
    //     ],
    //     /** multiline */ true
    //   )
    // );

    // classMembers.splice(
    //   bindMethodIndex === -1 ? (ctor ? 1 : 0) : bindMethodIndex,
    //   bindMethodIndex === -1 ? 0 : 1,
    //   bindMethod
    // );

    return ts.updateClassDeclaration(
      node,
      Array.isArray(node.decorators) ? this.updateElementDecorators(node.decorators) : undefined,
      node.modifiers,
      node.name,
      Array.isArray(node.typeParameters) ? node.typeParameters : undefined,
      node.heritageClauses,
      classMembers
    );
  }

  private updateElementDecorators(decorators: ts.Decorator[]) {
    return decorators.map(dec => {
      const decoratorExpression = dec.expression;
      if (ts.isCallExpression(decoratorExpression) && (decoratorExpression.expression as ts.Identifier).escapedText === 'customElement'
        || (decoratorExpression as ts.Identifier).escapedText === 'customElement'
      ) {
        return null;
      } else {
        return dec;
      }
    }).filter(Boolean);
  }

  addFactory(factory: ITemplateFactory) {
    (this.templateFactories || (this.templateFactories = [])).push(factory);
    return this;
  }

  getExports(): ts.ExportDeclaration[] {
    return this.file
      .getSourceFile()
      .statements
      .filter(c => (ts.getCombinedModifierFlags(c) | ts.SyntaxKind.ExportKeyword) === ts.SyntaxKind.ExportKeyword) as (ts.Node & ts.ExportDeclaration)[];
  }

  getCustomElement(htmlName: string) {
    return this.elements[htmlName] || null;
  }

  getCustomElements(): IResourceElement[] {
    return Object.keys(this.elements).map(el => this.elements[el]);
  }

  getCustomAttributes(): IResourceAttribute[] {
    return Object.keys(this.attributes).map(attr => this.attributes[attr]);
  }

  getValueConverters(): IResourceValueConverter[] {
    return Object.keys(this.valueConverters).map(vc => this.valueConverters[vc]);
  }

  getBindingBehaviors(): IResourceBindingBehavior[] {
    return Object.keys(this.bindingBehaviors).map(bb => this.bindingBehaviors[bb]);
  }

  toStatements(emitImports?: boolean): IAureliaModuleStatements {
    let factories = this.templateFactories;
    let mainFactory = factories[0];
    let mainFactoryCode = mainFactory.getCode(emitImports);
    let depModules: IAureliaModuleStatements[] = [];
    // for (let i = 1, ii = factories.length; ii > i; ++i) {
    //   let factory = factories[i];
    let deps = mainFactory.dependencies;
    for (let j = 0, jj = deps.length; jj > j; ++j) {
      let dep = deps[j];
      let statements = dep.toStatements();
      depModules.push(statements);
    }
    // depModules[i] = factory.owner.toStatements();
    // }
    return {
      imports: mainFactoryCode.imports,
      view: mainFactoryCode.view,
      originals: [
        ...this.file.statements
      ],
      deps: depModules
    };
  }

  toSourceFile(emitImport?: boolean): ts.SourceFile {
    let importsEmitted = false;
    let imports: ts.ImportDeclaration[];
    let templateViews: ts.ClassDeclaration[] = [];
    let file = ts.createSourceFile(this.fileName, '', ts.ScriptTarget.Latest);

    let factories = this.templateFactories;
    let mainFactory = factories[0];
    let mainFactoryCode = mainFactory.getCode();
    let statements: ts.Statement[] = [...mainFactoryCode.imports];

    for (let i = 1, ii = factories.length; ii > i; ++i) {
      let factory = factories[i];
    }

    let templateCodes = this.templateFactories.forEach(tf => {
      let code = tf.getCode(emitImport && !imports ? true : false);
      if (!imports) {
        imports = code.imports;
        statements.push(...code.imports);
      }
      statements.push(code.view);
      templateViews.push(code.view);
    });

    // let templateFiles = this.templateFactories.map(tf => {
    //   return tf.transform(emitImport && !importsEmitted ? true : false)
    // });
    return ts.updateSourceFileNode(file, [
      ...imports,
      ...this.file.statements,
      ...statements,
      // ...templateFiles.reduce((statements, tf) => statements.concat(tf.statements), []),
    ]);
  }

  compile(): string {
    return ts.createPrinter().printFile(this.toSourceFile(true));
  }

  toString() {
    let file = ts.createSourceFile(this.fileName, '', ts.ScriptTarget.Latest);
    let moduleStatements = this.toStatements(true);

    return ts.createPrinter().printFile(ts.updateSourceFileNode(file, [
      ...moduleStatements.imports,
      ...moduleStatements.deps.reduce((stms, mdule) => {
        return stms.concat([
          ...mdule.originals,
          mdule.view
        ])
      }, []),
      ...moduleStatements.originals,
      moduleStatements.view
    ]));
  }
}
