import { lifecycleHooks } from '@aurelia/runtime-html';

@lifecycleHooks()
export class AnimationHooks {
  // Only routing hooks are yet supported
  //public created(vm, controller): void {
  //  vm.element = controller.host;
  //}

  public loading(vm, _params, _instruction, navigation) {
    console.log('loading', vm.backwards);
    vm.backwards = navigation.navigation.back;
  }
  public load(vm, _params, _instruction, navigation) {
    console.log('load', vm.backwards);
    vm.backwards = navigation.navigation.back;
  }
  public unload(vm, _instruction, navigation) {
    console.log('unload', vm.backwards);
    vm.backwards = navigation.navigation.back;
  }
  public unloading(vm, _instruction, navigation) {
    console.log('unloading', vm.backwards);
    vm.backwards = navigation.navigation.back;
  }

  // Only routing hooks are yet supported
  //public attaching() {
  //  return slideIn(vm.element, 750, vm.backwards ? 'left' : 'right');
  //}
  // Only routing hooks are yet supported
  //public detaching() {
  //  return slideOut(vm.element, 750, vm.backwards ? 'right' : 'left');
  //}
}
