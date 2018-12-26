import { Writable } from '@aurelia/kernel';
import { customElement, ICustomElement, ITemplateDefinition } from '../../src/index';
import { defineComponentLifecycleMock, IComponentLifecycleMock } from './../mock';

export type CustomElement = Writable<ICustomElement> & IComponentLifecycleMock;

export function createCustomElement(nameOrDef: string | ITemplateDefinition) {
  if (arguments.length === 0) {
    nameOrDef = 'foo';
  }
  const Type = customElement(nameOrDef)(defineComponentLifecycleMock());
  const sut: CustomElement = new (Type as any)();

  return { Type, sut };
}
