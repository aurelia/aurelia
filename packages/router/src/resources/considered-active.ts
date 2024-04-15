import { ICustomAttributeViewModel, defineAttribute } from '@aurelia/runtime-html';
import { bmToView } from './utils';

export class ConsideredActiveCustomAttribute implements ICustomAttributeViewModel {
  public value: unknown;
}
defineAttribute({ name: 'considered-active', bindables: { value: { mode: bmToView } } }, ConsideredActiveCustomAttribute);
