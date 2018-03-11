import * as ts from 'typescript';
import {
  // Expression,
  TemplateLiteral
} from './ast'
// import * as AST from './ast';
import { bindingMode, delegationStrategy, AbstractBinding } from './binding';

// const AstNames = Object.getOwnPropertyNames(AST).filter(ast => ast !== 'Expression');

export enum bindingType {
  binding = 1,
  listener = 2,
  ref = 3,
  text = 4,
}

export { bindingMode, delegationStrategy };

export const ELEMENT_REF_KEY = 'element';

// export interface TemplateFactoryBinding {
//   0: /** targetIndex */ number,
//   1: /** bindingType */ bindingType,
//   2: /** expression */ Expression,
//   3?: /** attr or Event or ref type */ string,
//   4?: /** bindingMode */ bindingMode | delegationStrategy
// };

export interface IViewCompiler {
  moduleCompiler: IAureliaModuleCompiler;

  compileWithModule(fileName: string, aureliaModule: IAureliaModule): IAureliaModule;
  compile(fileName: string, template: string | Element, resourceModule: IAureliaModule, dependencyModules: IAureliaModule[]): ITemplateFactory;
}

export interface ITemplateFactory {
  html: string;
  elementResource: IResourceElement;
  bindings: AbstractBinding[];

  owner: IAureliaModule;
  dependencies: IAureliaModule[];

  readonly observedProperties: string[];
  readonly lastTargetIndex: number;
  readonly lastBehaviorIndex: number;

  addDependency(dependency: IAureliaModule): void;
  transform(emitImport?: boolean): ts.SourceFile;

  getCustomElement(htmlName: string): IResourceElement;
  getCode(emitImports?: boolean): ITemplateFactoryCode;
}

export interface ITemplateFactoryCode {
  imports: ts.ImportDeclaration[];
  view: ts.ClassDeclaration;
}

export interface IInsepctionInfo {
  defaultBindingMode?: bindingMode;
  attrName?: string;
  attrValue?: string;
  command?: string;
}

export interface IBindingLanguage {
  inspectAttribute(
    element: Element,
    attrName: string,
    attrValue: string,
    targetIndex: number,
    elementResource: IResourceElement,
    templateFactory: ITemplateFactory,
    module: IAureliaModule
  ): AbstractBinding;

  inspectTextContent(value: string): TemplateLiteral | null;
}

export interface IBindable {
  name: string;
  attribute: string;
  type: string;
  defaultBindingMode?: bindingMode;
  defaultValue?: ts.Expression;
}

export enum resourceKind {
  element,
  attribute,
  valueConverter,
  bindingBehavior
}

export interface IResource {
  name: string;
  kind: resourceKind;
  impl: ts.ClassDeclaration;
}

export interface IResourceBehavior extends IResource {
  htmlName: string;
  bindables: Record<string, IBindable>;
  initializers: Record<string, ts.Expression>;
  getBindable(name: string): IBindable;
}

export interface IResourceElement extends IResourceBehavior {
  kind: resourceKind.element;
}

export interface IResourceAttribute extends IResourceBehavior {
  kind: resourceKind.attribute;
}

export interface IResourceValueConverter extends IResource {
  kind: resourceKind.valueConverter;
}

export interface IResourceBindingBehavior extends IResource {
  kind: resourceKind.bindingBehavior;
}

export interface IViewResources {

  elements?: Record<string, IResourceElement>;
  attributes?: Record<string, IResourceAttribute>;
  valueConverters?: Record<string, IResourceValueConverter>;
  bindingBehaviors?: Record<string, IResourceBindingBehavior>;

  parent?: IViewResources;
  children?: IViewResources[];

  getCustomElement(name: string): IResourceElement;
  setCustomElement(name: string, impl: ts.ClassDeclaration): boolean;

  getCustomAttribute(name: string): IResourceAttribute;
  setCustomAttribute(name: string, impl: ts.ClassDeclaration): boolean;

  getValueConverter(name: string): IResourceValueConverter;
  setValueConverter(name: string, impl: ts.ClassDeclaration): boolean;

  getBindingBehavior(name: string): IResourceBindingBehavior;
  setBindingBehavior(name: string, impl: ts.ClassDeclaration): boolean;
}

export interface IAureliaModule {

  fileName: string;
  file: ts.SourceFile;

  templates: HTMLTemplateElement[];
  templateFactories: ITemplateFactory[];

  mainResource: IResourceElement;
  // resources: IViewResources;

  addFactory(factory: ITemplateFactory): this;

  getExports(): ts.ExportDeclaration[];

  getCustomElement(htmlName: string): IResourceElement;
  getCustomElements(): IResourceElement[];
  getCustomAttributes(): IResourceAttribute[];
  getValueConverters(): IResourceValueConverter[];
  getBindingBehaviors(): IResourceBindingBehavior[];

  toStatements(emitImports?: boolean): IAureliaModuleStatements;
  /**
   * Return compiled content, as ts document object model
   */
  toSourceFile(emitImports?: boolean): ts.SourceFile;
  /**
   * Return compiled content from templates, scripts
   */
  compile(): string;
}

export interface IAureliaModuleStatements {
  imports: ts.ImportDeclaration[];
  view: ts.ClassDeclaration;
  originals: ts.Statement[];
  deps: IAureliaModuleStatements[];
}

// export interface IScriptModule {
//   elements: Record<string, IResourceElement>;
//   attributes?: Record<string, IResourceAttribute>;
//   valueConverters?: Record<string, IResourceValueConverter>;
//   bindingBehaviors?: Record<string, IResourceBindingBehavior>;
// }

export interface IViewModelCompiler {
  compile(fileName: string, content?: string): IAureliaModule;
}

export interface IAureliaModuleCompiler {

  viewCompiler: IViewCompiler;
  viewModelCompiler: IViewModelCompiler;

  compile(fileName: string, text?: string): IAureliaModule;
}
