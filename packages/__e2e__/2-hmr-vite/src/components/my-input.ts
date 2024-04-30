import { CustomElement } from '@aurelia/runtime-html';

export class MyInput {
  value = '';
}
CustomElement.define({ name: 'my-input', bindables: ['value'] }, MyInput);
