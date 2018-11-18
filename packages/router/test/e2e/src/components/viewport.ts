import { Viewport } from './../../../../src/viewport';
import { inject } from '@aurelia/kernel';
import { bindable, RenderPlan, DOM, createElement } from "@aurelia/runtime";
import { customElement } from '@aurelia/runtime';
import * as template from './viewport.html';
import { Router } from '../../../../src/router';


@inject(Router, Element)
@customElement({ name: 'viewport', template })
export class ViewportCustomElement {
  @bindable name: string;
  @bindable blockEnter: boolean;

  public loaded: boolean = false;
  public blockLeave: boolean = false;

  public viewport: Viewport;
  public sub: RenderPlan = null;
  private nextSub: RenderPlan = null;

  constructor(private router: Router, private element: Element) { }

  bound() {
    this.viewport = this.router.addViewport(this.name, this.element, this);
  }

  public loadContent(content: string): Promise<boolean> {
    this.sub = createElement(content);
    this.loaded = true;
    return Promise.resolve(true);
  }
  // public load(content: string): Promise<boolean> {
  //   this.nextSub = createElement(content);
  //   return Promise.resolve(true);
  // }
  // public mount(component) {
  //   this.sub = this.nextSub;
  //   this.loaded = true;
  //   return Promise.resolve(true);
  // }

  // public canEnter(): boolean {
  //   return !this.loaded || !this.blockEnter;
  // }
  // public canLeave(): boolean {
  //   return !this.loaded || !this.blockLeave;
  // }
}
