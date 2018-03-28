import { IFulfillment, IRequirement, IActivator, IPair } from './interfaces';
import { DependencyMap } from './container';
import { metadata } from 'aurelia-metadata';
import * as AST from './analysis/ast';

export const enum RegistrationFlags {
  None = 1 << 0,
  Terminal = 1 << 1
}

export enum Lifetime {
  Unspecified,
  Singleton,
  Transient
}

export type DependencyType =
  | number
  | Number
  | string
  | String
  | symbol
  | Symbol
  | object
  | Object
  | Function
  | AST.INode;

export function validateKey(key: DependencyType): boolean {
  const type = typeof key;

  return key === 'function' || key === 'object' || key === 'string' || key === 'number';
}

export function isConstructor(key: DependencyType): boolean {
  return /Function/.test(Object.prototype.toString.call(key)) && Object.prototype.hasOwnProperty.call(key, 'prototype');
}

export function isASTNode(key: DependencyType): boolean {
  return key !== null && key !== undefined && (key as AST.INode).isAnalysisASTNode;
}

export function getParamTypes(ctor: any): any[] {
  let types: any[] = [];
  if (ctor.inject === undefined) {
    types = (metadata.getOwn('design:paramtypes', ctor) as Array<any>) || [];
  } else {
    let base = ctor;
    while (base !== Function.prototype && base !== Object.prototype) {
      types.push(...getInjectTypes(base));
      base = Object.getPrototypeOf(base);
    }
  }
  return types;
}

function getInjectTypes(ctor: any): any[] {
  if (!Object.prototype.hasOwnProperty.call(ctor, 'inject')) {
    return [];
  } else if (typeof ctor.inject === 'function') {
    return ctor.inject();
  } else {
    return ctor.inject;
  }
}

export function getTypeSourceFromCtorParameter(param: AST.IParameter): AST.INode | null {
  if (param.parent.kind !== AST.NodeKind.Constructor) {
    throw new Error('Expecting constructor parameter');
  }
  // no typename specified on the parameter, try to get it from decorators/inject method
  if (!param.typeName || param.typeName.length === 0) {
    param.typeName = getTypeNameFromInjectProperty(param) || getTypeSourceFromInjectDecorator(param);
    if (param.typeName === null) {
      return null;
    }
  }
  const $module = param.parent.parent.parent;
  let moduleImport = $module.items.find(
    i => i.kind === AST.NodeKind.ModuleImport && (i.alias === param.typeName || (i.name === param.typeName && !i.alias))
  ) as AST.IModuleImport;

  // a typename is specified but no matching import, so must be something declared inside the same module
  if (moduleImport === undefined) {
    const $class = $module.items.find(i => i.kind === AST.NodeKind.Class && i.name === param.typeName);
    if ($class === undefined) {
      throw new Error(`Could not find a matching import or type declaration for ${param.typeName}`);
    }
    return $class;
  }

  // it's not declared inside this module, so calculate the import's absolute path and see if it exists inside the project
  const absolutePath = $module.path;
  const relativePath = moduleImport.path;
  const absoluteParts = absolutePath.split('/');
  const relativeParts = relativePath.split('/');
  for (let i = 0; i < relativeParts.length; i++) {
    if (relativeParts[i] === '.') {
      continue;
    } else if (relativeParts[i] === '..') {
      absoluteParts.pop();
    } else {
      absoluteParts.push(relativeParts[i]);
    }
  }
  const importPath = absoluteParts.join('/');
  const importedModule = $module.parent.modules.find(m => m.path === importPath);
  if (!importedModule) {
    // we're not going to analyze an external module, so just return the import itself and let runtime DI handle the dependency resolution
    return moduleImport;
  }

  // look for an actual export declaration first
  let moduleExport = importedModule.items.find(
    i => i.kind === AST.NodeKind.ModuleExport && (i.alias === param.typeName || (i.name === param.typeName && !i.alias))
  );
  if (!moduleExport) {
    // only if no export declaration is found, look for a matching class or function declared in the module
    moduleExport = importedModule.items.find(
      i => i.kind === (AST.NodeKind.Class || i.kind === AST.NodeKind.Function) && i.name === param.typeName
    );

    // not sure if this is even possible?
    if (!moduleExport) {
      throw new Error(`Module at ${importedModule.path} was expected to have an export of ${param.typeName}`);
    }
  }

  return moduleExport;
}

function getTypeNameFromInjectProperty(param: AST.IParameter): string | null {
  const $class = param.parent.parent as AST.IClass;
  const injectProperty = $class.members.find(m => m.name === 'inject');
  if (!injectProperty) {
    return null;
  }
  // if inject is a function, this will be NodeKind.Method
  if (injectProperty.kind !== AST.NodeKind.Property) {
    throw new Error('function body not yet implemented for statically analyzed inject property');
  }

  // if inject has a property getter, the value will not have been resolved by syntax-transformer
  if (!injectProperty.initializerValue) {
    throw new Error('getter not yet supported for statically analyzed inject property');
  }

  if (!Array.isArray(injectProperty.initializerValue)) {
    throw new Error('inject property must be an array');
  }

  return injectProperty.initializerValue[param.parent.parameters.indexOf(param)];
}

function getTypeSourceFromInjectDecorator(param: AST.IParameter): string | null {
  const $class = param.parent.parent as AST.IClass;

  const injectDecorator = $class.decorators.find(m => m.name === 'inject');
  if (!injectDecorator) {
    return null;
  }

  return injectDecorator.arguments[param.parent.parameters.indexOf(param)].text;
}

export class Pair<L, R> implements IPair<L, R> {
  public readonly left: L;
  public readonly right: R;

  constructor(left: L, right: R) {
    this.left = left;
    this.right = right;
  }

  public isEqualTo(other: Pair<L, R>): boolean {
    if (this === other) {
      return true;
    }
    // if (!(other instanceof Pair)) {
    //   return false;
    // }

    return areEqual(this.left, other.left) && areEqual(this.right, other.right);
  }
}

function areEqual(first: any, second: any): boolean {
  if (first === second) {
    return true;
  }
  const firstTag = / (\w+)/.exec(Object.prototype.toString.call(first))[1];
  const secondTag = / (\w+)/.exec(Object.prototype.toString.call(first))[1];
  if (firstTag !== secondTag) {
    return false;
  }
  switch (firstTag) {
    case 'Undefined':
    case 'Null':
    case 'Boolean':
    case 'Number':
    case 'String':
    case 'Symbol': {
      return false;
    }
    case 'Array': {
      if (first.length !== second.length) {
        return false;
      }
      for (let i = 0; i < first.length; i++) {
        if (!areEqual(first[i], second[i])) {
          return false;
        }
      }
      return true;
    }
    case 'Map': {
      if (first.size !== second.size) {
        return false;
      }
      const firstKeys = Array.from(first.keys());
      const secondKeys = Array.from(second.keys());
      for (let i = 0; i < firstKeys.length; i++) {
        const firstKey = firstKeys[i];
        const secondKey = secondKeys[i];
        if (!areEqual(firstKey, secondKey)) {
          return false;
        }
        if (!areEqual(first.get(firstKey), second.get(secondKey))) {
          return false;
        }
      }
      return true;
    }
    case 'Set': {
      if (first.size !== second.size) {
        return false;
      }
      const firstKeys = Array.from(first.keys());
      const secondKeys = Array.from(second.keys());
      for (let i = 0; i < firstKeys.length; i++) {
        if (!areEqual(firstKeys[i], secondKeys[i])) {
          return false;
        }
      }
      return true;
    }
  }
  if ('isEqualTo' in first && 'isEqualTo' in second) {
    return first.isEqualTo(second);
  }
}
