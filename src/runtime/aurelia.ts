import { IComponent } from "./templating/component";
import { PLATFORM } from "./platform";
import { ViewResources } from "./templating/view-resources";
import { Expression } from "./binding/expression";
import { IExpression } from "./binding/ast";

export interface SinglePageApp {
  host: HTMLElement,
  component: any
}

export interface ProgressiveEnhancement {
  element: HTMLElement,
  data?: any
}

class AureliaImplementation { 
  private components: IComponent[] = [];
  private startTasks: (() => void)[] = [];
  private stopTasks: (() => void)[] = [];

  globalResources(...params: any[]) {
    ViewResources.register(params);
    return this;
  }

  primeExpressionCache(expressionCache: Record<string, IExpression>) {
    Expression.primeCache(expressionCache);
    return this;
  }

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

export const Aurelia = new AureliaImplementation();
(<any>PLATFORM.global).Aurelia = Aurelia;
