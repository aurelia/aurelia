import { CustomElement } from '@aurelia/runtime-html';
import { AnimationHooks } from '../animation-hooks';
import template from './home.html';

export class Home {}
CustomElement.define({ name: 'home', template, dependencies: [AnimationHooks] }, Home);
