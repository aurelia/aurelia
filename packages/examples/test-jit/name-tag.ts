import { customElement } from '@aurelia/runtime';
import view from 'view!./name-tag.html';

@customElement(view)
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
