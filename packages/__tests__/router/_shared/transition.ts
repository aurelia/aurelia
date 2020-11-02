import { SwapStrategy } from './create-fixture';
import { Component, TransitionComponent } from './component';

export class Transition {
  public from: Component;
  public to: Component;

  public constructor(transition: { from: string | TransitionComponent | Component; to: string | TransitionComponent | Component }, forceParallel: boolean) {
    this.from = new Component(transition.from, forceParallel);
    this.to = new Component(transition.to, forceParallel);
  }
}
