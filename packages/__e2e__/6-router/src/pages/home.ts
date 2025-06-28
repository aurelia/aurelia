import { CustomElement } from '@aurelia/runtime-html';
import template from './home.html';

export class Home {}
CustomElement.define({ name: 'home', template }, Home);
