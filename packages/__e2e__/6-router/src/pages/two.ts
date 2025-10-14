import { CustomElement } from '@aurelia/runtime-html';
import { AnimationHooks } from '../animation-hooks';
import template from './two.html';

export class Two {}
CustomElement.define({ name: 'two', template, dependencies: [AnimationHooks] }, Two);
