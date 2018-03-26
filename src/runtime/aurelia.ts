import { IComponent } from "./templating/component";

export interface SinglePageApp {
  host: HTMLElement,
  component: any
}

export interface ProgressiveEnhancement {
  element: HTMLElement,
  data?: any
}

export class Aurelia {
  private components: IComponent[] = [];
  private startTasks: (() => void)[] = [];
  private stopTasks: (() => void)[] = [];

  enhance(config: ProgressiveEnhancement) {
    return this;
  }

  app(config: SinglePageApp) {
    let component: IComponent = config.component;

    this.startTasks.push(() => {
      if (!this.components.includes(component)) {
        this.components.push(component);
        component.applyTo(config.host);
      }

      component.bind();
      component.attach();
    });

    this.stopTasks.push(() => {
      component.detach();
      component.unbind();
    });
    
    return this;
  }

  start() {
    this.startTasks.forEach(x => x());
    return this;
  }

  stop() {
    this.stopTasks.forEach(x => x());
    return this;
  }
}
