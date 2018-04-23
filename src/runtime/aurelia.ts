import { IElementComponent } from "./templating/component";
import { PLATFORM } from "./pal";
import { DI } from "./di";
import { View } from "./templating/view";

export interface ISinglePageApp {
  host: HTMLElement,
  component: any
}

class AureliaFramework { 
  private components: IElementComponent[] = [];
  private startTasks: (() => void)[] = [];
  private stopTasks: (() => void)[] = [];
  private isStarted = false;

  register(...params: any[]) {
    DI.register(...params);
    return this;
  }

  app(config: ISinglePageApp) {
    let component: IElementComponent = config.component;
    let startTask = () => {
      if (!this.components.includes(component)) {
        this.components.push(component);
        component.hydrate(config.host);
      }

      component.bind();
      component.attach();
    };

    this.startTasks.push(startTask);

    this.stopTasks.push(() => {
      component.detach();
      component.unbind();
    });

    if (this.isStarted) {
      startTask();
    }
    
    return this;
  }

  start() {
    this.isStarted = true;
    this.startTasks.forEach(x => x());
    return this;
  }

  stop() {
    this.isStarted = false;
    this.stopTasks.forEach(x => x());
    return this;
  }
}

export const Aurelia = new AureliaFramework();
(<any>PLATFORM.global).Aurelia = Aurelia;
