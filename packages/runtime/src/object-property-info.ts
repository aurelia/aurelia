import { type ComputedGetterFn } from './computed-observer';

/** @internal */
export type ComputedPropertyDependency = string | symbol | ComputedGetterFn;

/** @internal */
export type ComputedPropertyInfo = {
  flush?: 'sync' | 'async';
  deps?: ComputedPropertyDependency[];
  deep?: boolean;
};
