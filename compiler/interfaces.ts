import { Expression } from './ast'

export enum bindingMode {
  oneTime = 0,
  toView = 1,
  oneWay = 1,
  fromView = 3,
  twoWay = 2,
}

export type TemplateFactoryBinding = [
  /** targetIndex */ number,
  /** attr */ string,
  /** expression */ Expression,
  /** bindingMode */ bindingMode
];

export interface TemplateFactory {
  html: string;
  bindings: TemplateFactoryBinding[];
}
