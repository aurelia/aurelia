import { CustomElement } from '@aurelia/runtime-html';
import { AnimationHooks } from '../animation-hooks';
import template from './home.html';
import homeImageUrl from './home-image.png';

export class Home {
  public readonly homeImageUrl = homeImageUrl;
}
CustomElement.define({ name: 'home', template, dependencies: [AnimationHooks] }, Home);
