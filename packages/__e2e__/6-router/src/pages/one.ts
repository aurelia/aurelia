import { CustomElement } from '@aurelia/runtime-html';
import { AnimationHooks } from '../animation-hooks';
import template from './one.html';

export class One {}
CustomElement.define({ name: 'one', template, dependencies: [AnimationHooks] }, One);
