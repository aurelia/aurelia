import { defineElement } from '@aurelia/runtime-html';
import template from './two.html';

export class Two {}
defineElement({ name: 'two', template }, Two);
