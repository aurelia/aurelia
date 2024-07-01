import { bindable } from 'aurelia';
import { CeSuper } from './ce-super';

export class CeSub extends CeSuper {
  @bindable p4;
}
