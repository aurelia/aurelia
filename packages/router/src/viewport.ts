import { IContainer } from '@aurelia/kernel';
import { CustomElementResource, ICustomElement, INode, IRenderingEngine, LifecycleFlags } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';

export class Viewport {
  public content: ICustomElement;
  public nextContent: ICustomElement;

  public instruction: INavigationInstruction;
  public nextInstruction: INavigationInstruction;

  public component: ICustomElement;
  public nextComponent: ICustomElement;

  constructor(private container: IContainer, public name: string, public element: Element, public controller: any) {
  }

  public setNextContent(content: ICustomElement | string, instruction: INavigationInstruction): boolean {
    this.nextContent = <ICustomElement>content; // If it's a string, we need to find the module
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
    console.log('viewport canLeave', component.canLeave(this.instruction, this.nextInstruction));

    const result = component.canLeave(this.instruction, this.nextInstruction);
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
    console.log('viewport canEnter', component.canEnter(this.nextInstruction, this.instruction));
    const result = component.canEnter(this.nextInstruction, this.instruction);
    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    return result;
  }

  public loadContent(): Promise<boolean> {
    console.log('Viewport loadContent', this.name);

    const host: INode = this.element;
    const renderingEngine = this.container.get(IRenderingEngine);

    if (this.component) {
      (<any>this.component).leave(this.instruction, this.nextInstruction);
      this.component.$detach(LifecycleFlags.fromStopTask);
      this.component.$unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
    }

    (<any>this.nextComponent).enter(this.nextInstruction, this.instruction);
    this.nextComponent.$hydrate(renderingEngine, host);
    this.nextComponent.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind);
    this.nextComponent.$attach(LifecycleFlags.fromStartTask, host);

    this.content = this.nextContent;
    this.instruction = this.nextInstruction;
    this.component = this.nextComponent;

    return Promise.resolve(true);
  }

  private loadComponent(componentOrName: ICustomElement): void {
    this.nextComponent = <any>this.container.get(CustomElementResource.keyFrom((<any>componentOrName).description.name));
  }
}
