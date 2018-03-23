export const enum NodeKind {
  Module,
  Class,
  Function,
  Variable,
  ModuleImport,
  ModuleExport,
  CallExpression,
  Decorator,
  Method,
  Property,
  Constructor,
  Parameter,
  Argument
}

export type INode =
  | IModule
  | IModuleItem
  | IClass
  | IFunction
  | IVariable
  | IModuleImport
  | IModuleExport
  | IExpression
  | ICallExpression
  | IDecorator
  | IMember
  | IMethod
  | IConstructor
  | IParameter
  | IArgument;

export function Node(this: INode, kind: NodeKind, parent: INode = undefined): void {
  this.kind = kind;
  this.parent = parent;
  this.isAnalysisASTNode = true;
  switch(kind) {
    case NodeKind.Module: {
      (this as IModule).path = undefined;
      (this as IModule).items = [];
      break;
    }
    case NodeKind.Class:{
      (this as IClass).name = undefined;
      (this as IClass).ctor = undefined;
      (this as IClass).members = [];
      (this as IClass).decorators = [];
      break;
    }
    case NodeKind.Function:{
      (this as IFunction).name = undefined;
      (this as IFunction).parameters = [];
      (this as IFunction).decorators = [];
      break;
    }
    case NodeKind.Variable:{
      (this as IVariable).name = undefined;
      (this as IVariable).decorators = [];
      break;
    }
    case NodeKind.ModuleImport:{
      (this as IModuleImport).name = undefined;
      (this as IModuleImport).alias = undefined;
      (this as IModuleImport).path = undefined;
      break;
    }
    case NodeKind.ModuleExport:{
      (this as IModuleExport).name = undefined;
      (this as IModuleExport).declaration = undefined;
      (this as IModuleExport).alias = undefined;
      (this as IModuleExport).path = undefined;
      break;
    }
    case NodeKind.CallExpression:{
      (this as ICallExpression).callee = undefined;
      (this as ICallExpression).arguments = [];
      (this as ICallExpression).text = undefined;
      break;
    }
    case NodeKind.Decorator:{
      (this as IDecorator).name = undefined;
      (this as IDecorator).arguments = [];
      (this as IDecorator).text = undefined;
      break;
    }
    case NodeKind.Method:{
      (this as IMethod).name = undefined;
      (this as IMethod).parameters = [];
      (this as IMethod).decorators = [];
      break;
    }
    case NodeKind.Property:{
      (this as IProperty).name = undefined;
      (this as IProperty).getter = undefined;
      (this as IProperty).setter = undefined;
      (this as IProperty).decorators = [];
      break;
    }
    case NodeKind.Constructor:{
      (this as IConstructor).name = undefined;
      (this as IConstructor).parameters = [];
      break;
    }
    case NodeKind.Parameter:{
      (this as IParameter).name = undefined;
      (this as IParameter).typeName = undefined;
      (this as IParameter).text = undefined;
      (this as IParameter).decorators = [];
      break;
    }
    case NodeKind.Argument:{
      (this as IArgument).text = undefined;
      break;
    }
  }
}

export interface IModuleCollection {
  isAnalysisASTNode: false;
  modules: IModule[];
}

/**
 * Represents a single file
 */
export interface IModule {
  isAnalysisASTNode: true;
  kind: NodeKind.Module;
  parent: IModuleCollection;
  path: string;
  items: IModuleItem[];
}

/**
 * Any top-level item in a module
 */
export type IModuleItem = IClass | IFunction | IVariable | IModuleImport | IModuleExport;

/**
 * Any kind of function
 */
export type ICallable = IMethod | IConstructor | IFunction;

/**
 * Anything that can have a decorator (in other words: anything), limited to what we use in practise.
 */
export type IDecoratable = IClass | IFunction | IVariable | IMethod | IProperty | IParameter;

/**
 * A top-level class declaration in a module
 */
export interface IClass {
  isAnalysisASTNode: true;
  kind: NodeKind.Class;
  parent: IModule;
  name: string;
  ctor: IConstructor;
  members: IMember[];
  decorators: IDecorator[];
}

/**
 * A top-level function declaration in a module
 */
export interface IFunction {
  isAnalysisASTNode: true;
  kind: NodeKind.Function;
  parent: IModule;
  name: string;
  parameters: IParameter[];
  decorators: IDecorator[];
}

/**
 * A top-level variable declaration in a module
 */
export interface IVariable {
  isAnalysisASTNode: true;
  kind: NodeKind.Variable;
  parent: IModule;
  name: string;
  decorators: IDecorator[];
}

/**
 * An atomic import statement in a module
 */
export interface IModuleImport {
  isAnalysisASTNode: true;
  kind: NodeKind.ModuleImport;
  parent: IModule;
  name: string;
  alias?: string;
  path: string;
}

/**
 * An atomic export statement in a module
 */
export interface IModuleExport {
  isAnalysisASTNode: true;
  kind: NodeKind.ModuleExport;
  parent: IModule;
  declaration: IModuleItem;
  name: string;
  alias?: string;
  path: string;
}

/**
 * Can be more-or-less anything that is not a declaration
 */
export type IExpression = ICallExpression | IDecorator | IParameter | IArgument;

/**
 * A function call
 */
export interface ICallExpression {
  isAnalysisASTNode: true;
  kind: NodeKind.CallExpression;
  parent: INode;
  callee: IExpression;
  arguments: IArgument[];
  text: string;
}

/**
 * A decorator invocation (not the actual decorator declaration)
 */
export interface IDecorator {
  isAnalysisASTNode: true;
  kind: NodeKind.Decorator;
  parent: IDecoratable;
  name: string;
  arguments: IArgument[];
  text: string;
}

/**
 * Any member on a class
 */
export type IMember = IMethod | IConstructor | IProperty;

/**
 * A method on a class (can also be the constructor)
 */
export interface IMethod {
  isAnalysisASTNode: true;
  kind: NodeKind.Method;
  parent: IClass;
  name: string;
  parameters: IParameter[];
  decorators: IDecorator[];
}

/**
 * The constructor of a class
 */
export interface IConstructor {
  isAnalysisASTNode: true;
  kind: NodeKind.Constructor;
  parent: IClass;
  name: 'constructor';
  parameters: IParameter[];
}

/**
 * A property on a class that is not a method
 */
export interface IProperty {
  isAnalysisASTNode: true;
  kind: NodeKind.Property;
  parent: IClass;
  name: string;
  getter?: IMethod;
  setter?: IMethod;
  decorators: IDecorator[];
}

/**
 * A parameter of a method declaration
 */
export interface IParameter {
  isAnalysisASTNode: true;
  kind: NodeKind.Parameter;
  parent: IFunction | IMethod | IConstructor;
  name: string;
  typeName: string;
  text: string;
  decorators: IDecorator[];
}

/**
 * An argument that is passed to a CallExpression
 */
export interface IArgument {
  isAnalysisASTNode: true;
  kind: NodeKind.Argument;
  parent: ICallExpression | IDecorator;
  text: string;
}

export function getSourceFilePath(node: INode): string {
  let current = node;
  while (current.parent && current.parent.isAnalysisASTNode) {
    current = current.parent;
  }
  if (current.kind !== NodeKind.Module) {
    throw new Error("Expected module to be root node");
  }
  return current.path;
}
