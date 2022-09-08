import { lifecycleHooks } from '@aurelia/runtime-html';
import { slideIn, slideOut } from './animations';

@lifecycleHooks()
export class AnimationHooks {
  public created(vm, controller): void {
   vm.element = controller.host;
  }

  public loading(vm, _params, _instruction, navigation) {
    vm.backwards = navigation.navigation.back;
  }
  public unloading(vm, _instruction, navigation) {
    vm.backwards = navigation.navigation.back;
  }

  public attaching(vm) {
   return slideIn(vm.element, 750, vm.backwards ? 'left' : 'right');
  }
  public detaching(vm) {
   return slideOut(vm.element, 750, vm.backwards ? 'right' : 'left');
  }
}
