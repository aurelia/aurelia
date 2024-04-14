import { defineElement } from '@aurelia/runtime-html';

export class MyInput {
  value = '';
}
defineElement({ name: 'my-input', bindables: ['value'] }, MyInput);
