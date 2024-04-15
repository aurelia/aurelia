import { defineElement } from '@aurelia/runtime-html';
import template from './home.html';

export class Home {}
defineElement({ name: 'home', template }, Home);
