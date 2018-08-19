import { DI, IContainer, IRegistry, PLATFORM } from '@aurelia/kernel';
import { BindingFlags } from './binding/binding-flags';
import { ICustomElement } from './templating/custom-element';
import { IRenderingEngine } from './templating/rendering-engine';

export interface ISinglePageApp {
  host: any,
  component: any
}

export class Aurelia {
  private components: ICustomElement[] = [];
  private startTasks: (() => void)[] = [];
  private stopTasks: (() => void)[] = [];
  private isStarted = false;

  constructor(private container: IContainer = DI.createContainer()) {}

  public register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]) {
    this.container.register(...params);
    return this;
  }

  public app(config: ISinglePageApp) {
    let component: ICustomElement = config.component;
    let startTask = () => {
      if (!this.components.includes(component)) {
        this.components.push(component);
        component.$hydrate(
          this.container.get(IRenderingEngine),
          config.host
        );
      }

      component.$bind(BindingFlags.startTaskOrigin | BindingFlags.bindOrigin);
      component.$attach(config.host);
    };

    this.startTasks.push(startTask);

    this.stopTasks.push(() => {
      component.$detach();
      component.$unbind(BindingFlags.stopTaskOrigin | BindingFlags.unbindOrigin);
    });

    if (this.isStarted) {
      startTask();
    }

    return this;
  }

  public start() {
    this.startTasks.forEach(x => x());
    this.isStarted = true;
    return this;
  }

  public stop() {
    this.isStarted = false;
    this.stopTasks.forEach(x => x());
    return this;
  }
}

(<any>PLATFORM.global).Aurelia = Aurelia;
