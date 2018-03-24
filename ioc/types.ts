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

export function getClassSyntaxFromCtorParameter(param: AST.IParameter): AST.IClass | null {
  if (param.parent.kind !== AST.NodeKind.Constructor) {
    throw new Error('Expecting constructor parameter');
  }
  // no typename specified on the parameter, so we'll let the runtime DI figure this out from metadata/inject etc
  if (!param.typeName || param.typeName.length === 0) {
    return null;
  }
  const $module = param.parent.parent.parent;
  const moduleImports = $module.items.filter(i => i.kind === AST.NodeKind.ModuleImport) as AST.IModuleImport[];
  // alias has priority because a name can theoretically give a false positive
  let moduleImport = moduleImports.find(i => i.alias === param.typeName);
  if (moduleImport === undefined) {
    moduleImport = moduleImports.find(i => i.name === param.typeName);
  }
  // it's not an imported typename, see if it's something defined inside the module
  if (moduleImport === undefined) {
    const $class = $module.items.find(i => i.kind === AST.NodeKind.Class && i.name === param.typeName);
    if ($class === undefined) {
      // nope, let the runtime DI figure this out
      return null;
    }
    return $class as AST.IClass;
  }

  // these are ALL exports from all modules in the app
  const moduleExports = $module.parent.modules
    .map(m => m.items.filter(i => i.kind === AST.NodeKind.ModuleExport || i.kind === AST.NodeKind.Class))
    .reduce((prev, cur) => prev.concat(cur), []) as (AST.IModuleExport | AST.IClass)[];

  // a path theoretically should always match, but we need to implement relative path
  // matching logic etc for that, so we'll try aliases and names for now
  let moduleExport = moduleExports.find(e => e.kind === AST.NodeKind.ModuleExport && e.path === moduleImport.path);

  // alias has priority because a name can theoretically give a false positive
  if (moduleExport === undefined) {
    moduleExport = moduleExports.find(e => e.kind === AST.NodeKind.ModuleExport && e.alias === moduleImport.name);
  }
  if (moduleExport === undefined) {
    moduleExport = moduleExports.find(e => e.name === moduleImport.name);
  }
  if (moduleExport === undefined) {
    // it's not exported in the app, so must be an external module -> let runtime DI handle it
    return null;
  }

  const $class = moduleExport.parent.items.find(i => i.kind === AST.NodeKind.Class && i.name === moduleExport.name);

  return $class as AST.IClass;
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
  switch(firstTag) {
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
