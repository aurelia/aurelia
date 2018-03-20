import { compiledElement } from "./compiled-element"; //added by the compiler
import { nameTag2Config } from './name-tag2-config'; //added by the compiler

@compiledElement(nameTag2Config) //added by the compiler
//@customElement //removed by the compiler
export class NameTag {
  name = 'Aurelia';
  color = 'red';
  borderColor = 'orange';
  borderWidth = 3;
  showHeader = true;

  nameChanged(newValue: string) {
    console.log(`Name changed to ${newValue}`);;
  }

  submit() {
    // alert('It was already updated, (two way binding thingy)');
    this.name = '' + Math.random();
  }
}
