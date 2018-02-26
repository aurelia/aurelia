import { Expression, TemplateLiteral } from './ast'

export enum bindingMode {
  oneTime = 0,
  toView = 1,
  oneWay = 1,
  fromView = 3,
  twoWay = 2,
}

export enum bindingType {
  binding = 1,
  listener = 2,
  ref = 3,
  text = 4,
}

export enum delegationStrategy {
  none = 0,
  capturing = 1,
  bubbling = 2
}

export const ELEMENT_REF_KEY = 'element';

export interface TemplateFactoryBinding {
  0: /** targetIndex */ number,
  1: /** bindingType */ bindingType,
  2: /** expression */ Expression,
  3?: /** attr or Event or ref type */ string,
  4?: /** bindingMode */ bindingMode | delegationStrategy
};

export class TemplateFactory {

  html: string = '';
  bindings: TemplateFactoryBinding[] = [];

  get observedProperties(): string[] {
    return Array.from(new Set<string>(this.bindings.reduce(
      (props, binding) => props.concat(binding[2].observedProperties),
      []
    )));
  }
}

export interface IInsepctionInfo {
  defaultBindingMode?: bindingMode;
  attrName?: string;
  attrValue?: string;
  command?: string;
}

export interface IBindingLanguage {
  inspectAttribute(
    elementName: Element,
    attrName: string,
    attrValue: string,
    targetIndex: number
  ): TemplateFactoryBinding;

  inspectTextContent(value: string): TemplateLiteral | null;
}

export interface ResourcesBag {
  attributes?: Record<string, any>;
  elements?: Record<string, any>;
}
