import { CustomElementResource, ICustomElement, ICustomElementType, INode, IRenderingEngine, LifecycleFlags } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { Router } from './router';
import { Scope } from './scope';

export interface IRouteableCustomElement extends ICustomElement {
  canEnter?: Function;
  enter?: Function;
  canLeave?: Function;
  leave?: Function;
}

export class Viewport {
  public content: ICustomElementType;
  public nextContent: ICustomElementType;

  public instruction: INavigationInstruction;
  public nextInstruction: INavigationInstruction;

  public component: IRouteableCustomElement;
  public nextComponent: IRouteableCustomElement;

  private clear: boolean = false;

  constructor(private router: Router, public name: string, public element: Element, public owningScope: Scope, public scope: Scope) {
  }

  public setNextContent(content: ICustomElementType | string, instruction: INavigationInstruction): boolean {
    this.clear = false;
    if (typeof content === 'string') {
      if (content === this.router.separators.clear) {
        this.clear = true;
        content = null;
      } else {
        const resolver = this.router.container.getResolver(CustomElementResource.keyFrom(content));
        if (resolver !== null) {
          content = <ICustomElementType>resolver.getFactory(this.router.container).Type;
        }
      }
    }

    this.nextContent = <ICustomElementType>content;
    this.nextInstruction = instruction;

    if (this.content !== content || instruction.isRefresh) {
      return true;
    }

    // Add comparisons against path and data here

    return false;
  }

  public canLeave(): Promise<boolean> {
    if (!this.component) {
      return Promise.resolve(true);
    }

    const component: IRouteableCustomElement = this.component;
    if (!component.canLeave) {
      return Promise.resolve(true);
    }
    // tslint:disable-next-line:no-console
    console.log('viewport canLeave', component.canLeave(this.instruction, this.nextInstruction));

    const result = component.canLeave(this.instruction, this.nextInstruction);
    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    return result;
  }

  public canEnter(): Promise<boolean> {
    if (this.clear) {
      return Promise.resolve(true);
    }

    if (!this.nextContent) {
      return Promise.resolve(false);
    }

    this.loadComponent(this.nextContent);
    if (!this.nextComponent) {
      return Promise.resolve(false);
    }

    const component: IRouteableCustomElement = this.nextComponent;
    if (!component.canEnter) {
      return Promise.resolve(true);
    }

    // tslint:disable-next-line:no-console
    console.log('viewport canEnter', component.canEnter(this.nextInstruction, this.instruction));
    const result = component.canEnter(this.nextInstruction, this.instruction);
    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    return result;
  }

  public loadContent(): Promise<boolean> {
    // tslint:disable-next-line:no-console
    console.log('Viewport loadContent', this.name);

    if (!this.element) {
      return Promise.resolve(false);
    }

    const host: INode = this.element;
    const renderingEngine = this.router.container.get(IRenderingEngine);

    if (this.component) {
      if (this.component.leave) {
        this.component.leave(this.instruction, this.nextInstruction);
      }
      this.component.$detach(LifecycleFlags.fromStopTask);
      this.component.$unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
    }

    if (this.nextComponent) {
      if (this.nextComponent.enter) {
        this.nextComponent.enter(this.nextInstruction, this.instruction);
      }
      this.nextComponent.$hydrate(renderingEngine, host);
      this.nextComponent.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind);
      this.nextComponent.$attach(LifecycleFlags.fromStartTask, host);

      this.content = this.nextContent;
      this.instruction = this.nextInstruction;
      this.component = this.nextComponent;
    }

    if (this.clear) {
      this.content = this.component = null;
      this.instruction = this.nextInstruction;
    }

    this.nextContent = this.nextInstruction = this.nextComponent = null;

    return Promise.resolve(true);
  }

  public description(): string {
    if (this.content) {
      const component = this.content.description.name;
      const newScope: string = this.scope ? this.router.separators.ownsScope : '';
      return `${this.name}${newScope}${this.router.separators.viewport}${component}`;
    }
  }

  public scopedDescription(): string {
    const descriptions = [this.owningScope.context(), this.description()];
    return descriptions.filter((value) => value && value.length).join(this.router.separators.scope);
  }

  private loadComponent(component: ICustomElementType): void {
    this.nextComponent = this.router.container.get<IRouteableCustomElement>(CustomElementResource.keyFrom(component.description.name));
  }
}
