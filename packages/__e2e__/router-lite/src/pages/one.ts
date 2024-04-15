import { defineElement } from '@aurelia/runtime-html';
import template from './one.html';

export class One {}
defineElement({ name: 'one', template }, One);
