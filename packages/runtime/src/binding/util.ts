import { IBinding } from '../lifecycle';
import { Class } from '@aurelia/kernel';

export type BindingCompareFunction = (bindingA: IBinding, bindingB: IBinding) => number;
export type ComparableBinding = Class<IBinding, IBinding & { compareFunction: BindingCompareFunction }>;

export function sortableBinding(compareFunction: BindingCompareFunction) {
  return function(constructor: Class<IBinding>) {
    (constructor as ComparableBinding).compareFunction = compareFunction;
  };
}

export function getBindingCompareFunction(binding: IBinding): BindingCompareFunction | undefined {
  return (binding.constructor as ComparableBinding).compareFunction;
}
