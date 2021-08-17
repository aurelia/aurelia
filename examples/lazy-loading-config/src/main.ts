import Aurelia, { lifecycleHooks } from 'aurelia';
import { RouterConfiguration } from 'aurelia-direct-router';
import { MyApp } from './my-app';

@lifecycleHooks()
class NoopHandler {
  canLoad(vm, params, instruction, navigation) {
    console.log('In canLoad shared hook', ...arguments);
    // if (instruction.component.name === 'four') {
    //   return false;
    // }
    return true;
  }

  canUnload(vm, instruction, navigation) {
    console.log('In canUnload shared hook', ...arguments);
    if (instruction.component.name === 'four') {
      return false;
    }
    return true;
  }

  load(vm, instruction, navigation) {
    console.log('In load shared hook', ...arguments);
  }

  unload(vm, instruction, navigation) {
    console.log('In unload shared hook', ...arguments);
  }
}

@lifecycleHooks()
class SecondHandler {
  canLoad(vm, params, instruction, navigation) {
    console.log('In canLoad second handler', ...arguments);
    return true;
  }

  canUnload(vm, instruction, navigation) {
    console.log('In canUnload second handler', ...arguments);
    return true;
  }

  load(vm, instruction, navigation) {
    console.log('In load second handler', ...arguments);
  }

  unload(vm, instruction, navigation) {
    console.log('In unload second handler', ...arguments);
  }
}

Aurelia
  .register(RouterConfiguration)
  .register(NoopHandler, SecondHandler)
  .app(MyApp)
  .start();
