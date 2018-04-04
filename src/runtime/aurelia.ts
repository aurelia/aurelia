import { IElementComponent } from "./templating/component";
import { PLATFORM } from "./platform";
import { DI } from "./di";

export interface ISinglePageApp {
  host: HTMLElement,
  component: any
}

export interface IProgressiveEnhancement {
  element: HTMLElement,
  data?: any
}

class AureliaFramework { 
  private components: IElementComponent[] = [];
  private startTasks: (() => void)[] = [];
  private stopTasks: (() => void)[] = [];

  register(...params: any[]) {
    DI.register(...params);
    return this;
  }

  enhance(config: IProgressiveEnhancement) {
    return this;
  }

  app(config: ISinglePageApp) {
    let component: IElementComponent = config.component;

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

export const Aurelia = new AureliaFramework();
(<any>PLATFORM.global).Aurelia = Aurelia;
