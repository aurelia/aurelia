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

export type INode = IModule | IModuleItem | IClass | IFunction | IVariable | IModuleImport | IModuleExport | IExpression | ICallExpression | IDecorator | IMember | IMethod | IConstructor | IParameter | IArgument;

export interface IModule {
  kind: NodeKind.Module;
  parent: null;
  path: string;
  items: IModuleItem[];
}

export type IModuleItem = IClass | IFunction | IVariable | IModuleImport | IModuleExport;

export type ICallable = IMethod | IConstructor | IFunction;

export type IDecoratable = IClass | IFunction | IVariable | IMethod | IProperty | IParameter;

export interface IClass {
  kind: NodeKind.Class;
  parent: IModule;
  name: string;
  ctor: IConstructor;
  members: IMember[];
  decorators: IDecorator[];
}

export interface IFunction {
  kind: NodeKind.Function;
  parent: IModule;
  name: string;
  parameters: IParameter[];
  decorators: IDecorator[];
}

export interface IVariable {
  kind: NodeKind.Variable;
  parent: IModule;
  name: string;
  decorators: IDecorator[];
}

export interface IModuleImport {
  kind: NodeKind.ModuleImport;
  parent: IModule;
  name: string;
  alias?: string;
  path: string;
}

export interface IModuleExport {
  kind: NodeKind.ModuleExport;
  parent: IModule;
  declaration: IModuleItem;
  name: string;
  alias?: string;
  path: string;
}

export type IExpression = ICallExpression | IDecorator | IParameter | IArgument;

export interface ICallExpression {
  kind: NodeKind.CallExpression;
  callee: IExpression;
  arguments: IArgument[];
  text: string;
}

export interface IDecorator {
  kind: NodeKind.Decorator;
  parent: IDecoratable;
  name: string;
  arguments: IArgument[];
  text: string;
}

export type IMember = IMethod | IConstructor | IProperty;

export interface IMethod {
  kind: NodeKind.Method;
  parent: IClass;
  name: string;
  parameters: IParameter[];
  decorators: IDecorator[];
}

export interface IConstructor {
  kind: NodeKind.Constructor;
  parent: IClass;
  name: "constructor";
  parameters: IParameter[];
}

export interface IProperty {
  kind: NodeKind.Property;
  parent: IClass;
  name: string;
  getter?: IMethod;
  setter?: IMethod;
  decorators: IDecorator[];
}

export interface IParameter {
  kind: NodeKind.Parameter;
  parent: IFunction | IMethod | IConstructor;
  name: string;
  typeName: string;
  text: string;
  decorators: IDecorator[];
}

export interface IArgument {
  kind: NodeKind.Argument;
  parent: ICallExpression | IDecorator;
  text: string;
}
