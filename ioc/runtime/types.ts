import { IPair, IRequirement } from './interfaces';
import { metadata } from 'aurelia-metadata';
import { RegistrationRuleBuilder } from './registration';

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
  | FunctionConstructor;

const validKeyTypes = new Set(['function', 'string', 'object', 'number', 'symbol']);
export function validateKey(key: DependencyType): boolean {
  const type = typeof key;
  if (!validKeyTypes.has(type)) {
    throw new Error(`Invalid dependency key type '${type}'`);
  }
  return true;
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

export class Pair<L, R> implements IPair<L, R> {
  public readonly left: L;
  public readonly right: R;

  constructor(left: L, right: R) {
    this.left = left;
    this.right = right;
  }
}

export namespace registry {
  const key = '__ioc__';
  export const requirements = new Map<DependencyType, IRequirement>();
  export const dependencies = new Map<DependencyType, ParameterDecorator>();
  export function getMetadata(target: Function): { requirements?: IRequirement[]; registrationRule?: RegistrationRuleBuilder } {
    if (!target[key]) {
      target[key] = Object.create(null);
    }
    return target[key];
  }
}
