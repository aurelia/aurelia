import { Writable } from '@aurelia/kernel';
import { customElement, ICustomElement, ITemplateDefinition } from '@aurelia/runtime';
import { defineComponentLifecycleMock, IComponentLifecycleMock } from '../_doubles/mock-component-lifecycle';

export type CustomElement = Writable<ICustomElement> & IComponentLifecycleMock;

export function createCustomElement(nameOrDef: string | ITemplateDefinition) {
  if (arguments.length === 0) {
    nameOrDef = 'foo';
  }
  const Type = customElement(nameOrDef)(defineComponentLifecycleMock());
  const sut: CustomElement = new (Type as any)();

  return { Type, sut };
}
