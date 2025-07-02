import { CustomElement } from '@aurelia/runtime-html';
import template from './one.html';

export class One {}
CustomElement.define({ name: 'one', template }, One);
