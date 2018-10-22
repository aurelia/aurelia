import { customAttribute, IAttributeDefinition, IInternalCustomAttributeImplementation, templateController } from '../../../src/index';
import { defineComponentLifecycleMock, IComponentLifecycleMock } from '../mock';
import { Writable } from '@aurelia/kernel';

export type CustomAttribute = Writable<IInternalCustomAttributeImplementation> & IComponentLifecycleMock;

export function createCustomAttribute(nameOrDef: string | IAttributeDefinition = 'foo') {
  const Type = customAttribute(nameOrDef)(defineComponentLifecycleMock());
  const sut: CustomAttribute = new (<any>Type)();

  return { Type, sut };
}

export function createTemplateController(nameOrDef: string | IAttributeDefinition = 'foo') {
  const Type = templateController(nameOrDef)(defineComponentLifecycleMock());
  const sut: CustomAttribute = new (<any>Type)();

  return { Type, sut };
}
