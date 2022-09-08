import Aurelia, { lifecycleHooks } from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { MyApp } from './my-app';

@lifecycleHooks()
class NoopHandler {
  canLoad(...args) {
    console.log('In canLoad shared hook', ...args);
    // if (instruction.component.name === 'four') {
    //   return false;
    // }
    return true;
  }

  canUnload(...args) {
    console.log('In canUnload shared hook', ...args);
    if (instruction.component.name === 'four') {
      return false;
    }
    return true;
  }

  loading(...args) {
    console.log('In load shared hook', ...args);
  }

  unloading(...args) {
    console.log('In unloading shared hook', ...args);
  }
}

@lifecycleHooks()
class SecondHandler {
  canLoad(vm, params, instruction, navigation) {
    console.log('In canLoad second handler', vm, params, instruction, navigation);
    return true;
  }

  canUnload(vm, instruction, navigation) {
    console.log('In canUnload second handler', vm, instruction, navigation);
    return true;
  }

  loading(vm, params, instruction, navigation) {
    console.log('In load second handler', vm, params, instruction, navigation);
  }

  unloading(vm, instruction, navigation) {
    console.log('In unloading second handler', vm, instruction, navigation);
  }
}

Aurelia
  .register(RouterConfiguration)
  .register(NoopHandler, SecondHandler)
  .app(MyApp)
  .start();
