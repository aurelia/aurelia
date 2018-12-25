import { IComponentLifecycleMock, defineComponentLifecycleMock } from './../mock';
import { Writable } from '@aurelia/kernel';
import { customElement, ITemplateDefinition, ICustomElement } from '../../src/index';

export type CustomElement = Writable<ICustomElement> & IComponentLifecycleMock;

export function createCustomElement(nameOrDef: string | ITemplateDefinition) {
  if (arguments.length === 0) {
    nameOrDef = 'foo';
  }
  const Type = customElement(nameOrDef)(defineComponentLifecycleMock());
  const sut: CustomElement = new (<any>Type)();

  return { Type, sut };
}
