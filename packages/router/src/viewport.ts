import { IContainer } from '@aurelia/kernel';
import { CustomElementResource, ICustomElement, INode, IRenderingEngine, LifecycleFlags, ICustomElementType } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { Scope } from './scope';

export class Viewport {
  public content: ICustomElementType;
  public nextContent: ICustomElementType;

  public instruction: INavigationInstruction;
  public nextInstruction: INavigationInstruction;

  public component: ICustomElement;
  public nextComponent: ICustomElement;

  public pendingQueries: Object[] = [];

  constructor(private container: IContainer, public name: string, public element: Element, public scope: Scope) {
  }

  public setNextContent(content: ICustomElementType | string, instruction: INavigationInstruction): boolean {
    if (typeof content === 'string') {
      const resolver = this.container.getResolver(CustomElementResource.keyFrom(content));
      if (resolver !== null) {
        content = <ICustomElementType>resolver.getFactory(this.container).Type;
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

    const component: any = this.component;
    if (!component.canLeave) {
      return Promise.resolve(true);
    }
    console.log('viewport canLeave', component.canLeave(this.instruction, this.nextInstruction));

    const result = component.canLeave(this.instruction, this.nextInstruction);
    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    return result;
  }

  public canEnter(): Promise<boolean> {
    if (!this.nextContent) {
      return Promise.resolve(false);
    }

    this.loadComponent(this.nextContent);
    if (!this.nextComponent) {
      return Promise.resolve(false);
    }

    const component: any = this.nextComponent;
    if (!component.canEnter) {
      return Promise.resolve(true);
    }

    console.log('viewport canEnter', component.canEnter(this.nextInstruction, this.instruction));
    const result = component.canEnter(this.nextInstruction, this.instruction);
    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    return result;
  }

  public loadContent(): Promise<boolean> {
    console.log('Viewport loadContent', this.name);

    if (!this.element) {
      return Promise.resolve(false);
    }

    const host: INode = this.element;
    const renderingEngine = this.container.get(IRenderingEngine);

    if (this.component) {
      if ((<any>this.component).leave) {
        (<any>this.component).leave(this.instruction, this.nextInstruction);
      }
      this.component.$detach(LifecycleFlags.fromStopTask);
      this.component.$unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
    }

    if (this.nextComponent) {
      if ((<any>this.nextComponent).enter) {
        (<any>this.nextComponent).enter(this.nextInstruction, this.instruction);
      }
      this.nextComponent.$hydrate(renderingEngine, host);
      this.nextComponent.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind);
      const targetHost = this.nextComponent.$projector.host;
      console.log('===== $BOUND', targetHost === this.element, targetHost, this.element);
      this.nextComponent.$attach(LifecycleFlags.fromStartTask, host);

      this.content = this.nextContent;
      this.instruction = this.nextInstruction;
      this.component = this.nextComponent;

      this.nextContent = this.nextInstruction = this.nextComponent = null;
    }

    return Promise.resolve(true);
  }

  public description() {
    if (this.content) {
      let component = (<any>this.content).description.name;
      // component = component.split(':').pop();
      return `${this.name}:${component}`;
    }
  }

  private loadComponent(component: ICustomElementType): void {
    this.nextComponent = <any>this.container.get(CustomElementResource.keyFrom(component.description.name));
  }
}
