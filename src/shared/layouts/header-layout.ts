import { SharedState } from '../state/shared-state';
import { inject } from '@aurelia/kernel';
import { bindable, BindingMode, customElement } from '@aurelia/runtime';
import { Router } from '@aurelia/router';
import template from './header-layout.html';


@inject(SharedState)
@customElement({ name: 'header-layout', template: template })
export class HeaderLayout {
  @bindable({ mode: BindingMode.toView }) router: Router;
  constructor(private readonly sharedState: SharedState) {
  }
}