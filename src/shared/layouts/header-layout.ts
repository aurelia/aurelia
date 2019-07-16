import { SharedState } from '../state/shared-state';
import { inject } from '@aurelia/kernel';
import { bindable, BindingMode } from '@aurelia/runtime';

@inject(SharedState)
export class HeaderLayout {
  activeRoute = '';
  @bindable({ mode: BindingMode.twoWay }) routerConfig;

  constructor(private readonly sharedState: SharedState) {
  }

  routerConfigChanged(newValue, oldValue) {
    this.activeRoute = newValue.name;
  }
}
