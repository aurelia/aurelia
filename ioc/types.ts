import { IFulfillment, IRequirement, IActivator } from './interfaces';
import { DependencyMap } from './container';
import { metadata } from 'aurelia-metadata';

export const enum RegistrationFlags {
  None = 1 << 0,
  Terminal = 1 << 1
}

export enum Lifetime {
  Unspecified,
  Singleton,
  Transient
}

export type DependencyType = number | Number | string | String | symbol | Symbol | object | Object | Function;

export function validateKey(key: DependencyType): boolean {
  const type = typeof key;

  return key === 'function' || key === 'object' || key === 'string' || key === 'number';
}

export function isConstructor(key: DependencyType): boolean {
  return /Function/.test(Object.prototype.toString.call(key)) && Object.prototype.hasOwnProperty.call(key, 'prototype');
}

export function getParamTypes(ctor: any): any[] {
  let types: any[] = [];
  if (ctor.inject === undefined) {
    types = metadata.getOwn("design:paramtypes", ctor) as Array<any> || [];
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
  if (!Object.prototype.hasOwnProperty.call(ctor, "inject")) {
    return [];
  } else if (typeof ctor.inject === "function") {
    return ctor.inject();
  } else {
    return ctor.inject;
  }
}
