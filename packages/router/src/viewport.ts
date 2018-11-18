import { Aurelia, ICustomElement, CustomElementResource, IRenderingEngine, LifecycleFlags, INode } from '@aurelia/runtime';
import { DI, IContainer } from '../../kernel/dist';

export class Viewport {
  public content: string;
  public nextContent: any;

  public component: ICustomElement;
  public nextComponent: ICustomElement;

  constructor(private container: IContainer, public name: string, public element: Element, public controller: any) {
  }

  public setNextContent(content: ICustomElement | string): boolean {
    if (this.content === content) {
      return false;
    }
    this.nextContent = content;
    return true;
  }

  public canLeave(): Promise<boolean> {
    if (!this.component) {
      return Promise.resolve(true);
    }

    const component: any = this.component;
    console.log('viewport canLeave', component.canLeave());

    const result = component.canLeave();
    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    return result;
  }

  public canEnter(): Promise<boolean> {
    this.loadComponent(this.nextContent);
    if (!this.nextComponent) {
      return Promise.resolve(false);
    }

    const component: any = this.nextComponent;
    console.log('viewport canEnter', component.canEnter());
    const result = component.canEnter();
    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    return result;
  }

  public loadContent(): Promise<boolean> {
    console.log('Viewport loadContent', this.name); //, this.nextContent);

    const host: INode = this.element;
    const renderingEngine = this.container.get(IRenderingEngine);

    if (this.component) {
      (<any>this.component).leave();
      this.component.$detach(LifecycleFlags.fromStopTask);
      // this.component.$unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
    }

    (<any>this.nextComponent).enter();
    this.nextComponent.$hydrate(renderingEngine, host);
    this.nextComponent.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind);
    this.nextComponent.$attach(LifecycleFlags.fromStartTask, host);

    this.content = this.nextContent;
    this.component = this.nextComponent;

    return Promise.resolve(true);
    // return this.controller.loadContent(this.nextContent);
  }

  // public mountContent(): Promise<boolean> {
  //   console.log('Mounting', this.name, this.nextContent);
  //   if (this.component) {
  //     (<any>this.component).leave();
  //   }
  //   this.content = this.nextContent;
  //   this.component = this.nextComponent;
  //   return this.controller.mount();
  // }

  private loadComponent(componentOrName: ICustomElement) {
    // const host: INode = this.element;
    this.nextComponent = <any>this.container.get(CustomElementResource.keyFrom((<any>componentOrName).description.name));
  }
}
