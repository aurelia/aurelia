import { CustomElement } from '@aurelia/runtime-html';
import template from './two.html';

export class Two {}
CustomElement.define({ name: 'two', template }, Two);
