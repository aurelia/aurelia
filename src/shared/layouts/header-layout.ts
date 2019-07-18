import { inject } from '@aurelia/kernel';
import { Router } from '@aurelia/router';
import { bindable, BindingMode, customElement } from '@aurelia/runtime';
import { SharedState } from 'shared/state/shared-state';
import template from './header-layout.html';

@inject(SharedState)
@customElement({ name: "header-layout", template })
export class HeaderLayout {
  @bindable({ mode: BindingMode.toView }) public router?: Router;
  constructor(private readonly sharedState: SharedState) {
  }
  get activeParentRoute() {
    return this.router && this.router.activeComponents[0];
  }
}
