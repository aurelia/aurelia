import { Constructable } from "../kernel/interfaces";
import { IRegistry } from "../kernel/di";

function resourceName(this: IResourceKind, name: string) {
  return `${this.name}:${name}`;
}

function isType(this: IResourceKind, type: Function) {
  return (<any>type).kind === this;
}

export interface IResourceDescription {
  name: string;
}

export interface IResourceKind {
  name: 'attribute' | 'element' | 'value-converter' | 'binding-behavior';
  key(name: string): string;
  isType(type: Function): boolean;
}

export interface IResourceType<T = {}> extends Constructable<T>, IRegistry {
  kind: IResourceKind;
  description: IResourceDescription;
}

export const Resource = {
  attribute: {
    name: 'attribute',
    key: resourceName,
    isType: isType
  } as IResourceKind,
  element: {
    name: 'element',
    key: resourceName,
    isType: isType
  } as IResourceKind,
  valueConverter: {
    name: 'value-converter',
    key: resourceName,
    isType: isType
  } as IResourceKind,
  bindingBehavior: {
    name: 'binding-behavior',
    key: resourceName,
    isType: isType
  } as IResourceKind
};
