import { ICustomAttributeViewModel, CustomAttribute } from '@aurelia/runtime-html';
import { bmToView } from './utils';

export class ConsideredActiveCustomAttribute implements ICustomAttributeViewModel {
  public value: unknown;
}
CustomAttribute.define({ name: 'considered-active', bindables: { value: { mode: bmToView } } }, ConsideredActiveCustomAttribute);
