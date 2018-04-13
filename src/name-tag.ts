import { compiledElement } from "./runtime/decorators"; //added by the compiler
import { nameTagConfig } from './name-tag-config'; //added by the compiler

@compiledElement(nameTagConfig) //added by the compiler
//@customElement //removed by the compiler
export class NameTag {
  name = 'Aurelia';
  color = 'red';
  borderColor = 'orange';
  borderWidth = 3;
  showHeader = true;

  nameChanged(newValue: string) {
    console.log(`Name changed to ${newValue}`);
  }

  submit() {
    this.name = '' + Math.random();
  }

  bound() {
    console.log('name-tag bound');
  }

  attaching() {
    console.log('name-tag attaching');
  }

  attached() {
    console.log('name-tag attached');
  }

  detaching() {
    console.log('name-tag detaching');
  }

  detached() {
    console.log('name-tag detached');
  }

  unbound() {
    console.log('name-tag unbound');
  }
}
