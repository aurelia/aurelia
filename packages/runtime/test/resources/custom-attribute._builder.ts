import { Writable } from '@aurelia/kernel';
import {
  customAttribute,
  IAttributeDefinition,
  ICustomAttribute,
  templateController
} from '../../src/index';
import { defineComponentLifecycleMock, IComponentLifecycleMock } from '../_doubles/mock-component-lifecycle';

export type CustomAttribute = Writable<ICustomAttribute> & IComponentLifecycleMock;

export function createCustomAttribute(nameOrDef: string | IAttributeDefinition = 'foo') {
  const Type = customAttribute(nameOrDef)(defineComponentLifecycleMock());
  const sut: CustomAttribute = new (Type as any)();

  return { Type, sut };
}

export function createTemplateController(nameOrDef: string | IAttributeDefinition = 'foo') {
  const Type = templateController(nameOrDef)(defineComponentLifecycleMock());
  const sut: CustomAttribute = new (Type as any)();

  return { Type, sut };
}
