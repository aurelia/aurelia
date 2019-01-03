import { PLATFORM } from '@aurelia/kernel';
import { ICustomElement, PromiseTask } from '@aurelia/runtime';
import { loader, loaders } from 'pixi.js';

export class LoadResourceTask {
  private constructor() { }

  public static register(component: ICustomElement<Node>): loaders.Loader {
    component.$lifecycle.registerTask(
      new PromiseTask(
        new Promise(loader.load.bind(loader)),
        PLATFORM.noop
      )
    );
    return loader;
  }
}
