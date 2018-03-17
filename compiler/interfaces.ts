import * as ts from 'typescript';
import {
  // Expression,
  TemplateLiteral
} from './ast'
// import * as AST from './ast';
import { bindingMode, IBinding } from './binding';

// const AstNames = Object.getOwnPropertyNames(AST).filter(ast => ast !== 'Expression');

export enum bindingType {
  binding = 1,
  listener = 2,
  ref = 3,
  text = 4,
}

// export { IBinding, bindingMode, delegationStrategy };

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
  elementResource?: IResourceElement;
  bindings: IBinding[];

  owner: IAureliaModule;
  dependencies: IAureliaModule[];
  usedDependencies: Map<IAureliaModule, IResource[]>;

  readonly observedProperties: string[];
  readonly lastTargetIndex: number;
  readonly lastBehaviorIndex: number;

  addDependency(dependency: IAureliaModule): void;
  transform(emitImport?: boolean): ts.SourceFile;

  getCustomElement(htmlName: string): IResourceElement | null;
  getCode(emitImports?: boolean): ITemplateFactoryCode;

  getUsedDependency(): ts.Statement[];
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
    elementResource: IResourceElement | null,
    templateFactory: ITemplateFactory,
    module: IAureliaModule
  ): IBinding | null;

  inspectTextContent(value: string): TemplateLiteral | null;
}

export interface IBindable {
  name: string;
  attribute: string;
  type: string;
  defaultBindingMode?: bindingMode;
  defaultValue?: ts.Expression;
  primaryProperty?: boolean;
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
  // impl: ts.ClassDeclaration;
}

export interface IResourceBehavior extends IResource {
  owner: IAureliaModule;
  htmlName: string;
  bindables: Record<string, IBindable>;
  initializers: Record<string, ts.Expression>;
  getBindable(name: string): IBindable;

  hasConstructor: boolean;
  hasCreated: boolean;
  hasBind: boolean;
  hasAttached: boolean;
  hasDetached: boolean;
  hasUnbind: boolean;
}

export interface IResourceElement extends IResourceBehavior {
  kind: resourceKind.element;
}

export interface IResourceAttribute extends IResourceBehavior {
  kind: resourceKind.attribute;

  primaryProperty?: IBindable;
}

export interface IResourceValueConverter extends IResource {
  kind: resourceKind.valueConverter;
}

export interface IResourceBindingBehavior extends IResource {
  kind: resourceKind.bindingBehavior;
}

/**
 * Describe a module (file) loaded by aurelia bootstrap entry
 * Or required by another module
 * 
 * Contains information about resources packed within it
 */
export interface IAureliaModule {

  /**
   * Get global resources. Each of Aurelia application module can
   * retrieve resources either locally or globally
   */
  getGlobalResources(): IAureliaModule;
  /**
   * Each module is associated with a path
   */
  fileName: string;
  /**
   * Source file build from content of file retrieved by this module fileName
   */
  file: ts.SourceFile;
  /**
   * If this is a single file module, then it has templates associated with it
   * Could be 0+
   */
  templates: HTMLTemplateElement[];
  /**
   * Each template is compiled into a template factory,
   * Each module can have 0 or many template factories
   */
  templateFactories: ITemplateFactory[];

  /**
   * A main resource, or a custom element exported in this module
   * A module may also have no custom element exports
   */
  mainResource?: IResourceElement;

  addFactory(factory: ITemplateFactory): this;

  /**
   * Each module knows about their own exports
   * From there, will figure out many kind of resources:
   * 
   * custom elements, custom attributes, value converters, binding behaviors
   * Each kind of those of resources can be retrieved with corresponding method name
   */
  getCustomElement(htmlName: string): IResourceElement;
  getCustomElements(): IResourceElement[];
  /**
   * Add a synthesized custom element to metadata of this module
   */
  addCustomElement(el: IResourceElement): IResourceElement;

  /**
   * Get a single exported custom attribute of this module
   */
  getCustomAttribute(htmlName: string): IResourceAttribute;
  /**
   * Get all exported custom attributes of this module
   */
  getCustomAttributes(): IResourceAttribute[];
  /**
   * Add a synthesized custom attribute to metadata of this module
   */
  addCustomAttribute(attr: IResourceAttribute): IResourceAttribute;

  getValueConverters(): IResourceValueConverter[];
  getBindingBehaviors(): IResourceBindingBehavior[];

  toStatements(file: ts.SourceFile, emitImports?: boolean): IAureliaModuleStatements;
  /**
   * Return compiled content, as ts document object model
   */
  toSourceFile(emitImports?: boolean): ts.SourceFile;
  /**
   * Return compiled content from templates, scripts
   */
  compile(): string;
  /**
   * Emit a JSON definition file for progressive compilation
   * file name will be `${fileName}.json`
   */
  toJSON(): any;
}

export interface IAureliaModuleStatements {
  imports: ts.ImportDeclaration[];
  view: ts.ClassDeclaration;
  originals: ts.Statement[];
  deps: IAureliaModuleStatements[];
}

export interface IViewModelCompiler {
  compile(fileName: string, content?: string): IAureliaModule;
}

export interface IAureliaModuleCompiler {

  viewCompiler: IViewCompiler;
  viewModelCompiler: IViewModelCompiler;

  moduleRegistry: Record<string, IAureliaModule>;

  compile(fileName: string, text?: string, noRecompile?: boolean): IAureliaModule;

  /**
   * Ability to load metadata of a module without loading it
   * @param fileName the path to file / json that contains metadata about the module
   */
  fromJson(fileName: string): IAureliaModule;

  emit(moduleName: string): Promise<boolean>;
  emitAll(): Promise<void>;
}

export interface IFileUtils {
  readFile(fileName: string): Promise<string>;
  readFileSync(fileName: string): string;

  writeFile(fileName: string, data: any): Promise<boolean>
  writeFileSync(fileName: string, data: any): boolean;

  exists(fileName: string): Promise<boolean>;
  existsSync(fileName: string): boolean;
}
