/* eslint-disable no-console */
import { INavigationOptions, IRouteViewModel, Params, RouteNode } from '@aurelia/router';
import { animate, eases } from 'animejs';
import { IController, lifecycleHooks } from 'aurelia';

const durationMs = 900;

// Page entering animation
const enterFromRight = (el: HTMLElement) =>
  animate(el, {
    translateX: ['150%', '0%'],
    duration: durationMs,
    ease: eases.outCubic,
  });

const enterFromLeft = (el: HTMLElement) =>
  animate(el, {
    translateX: ['-150%', '0%'],
    duration: durationMs,
    ease: eases.outCubic,
  });

// Page exiting animation
const exitToRight = (el: HTMLElement) =>
  animate(el, {
    translateX: ['0%', '150%'],
    duration: durationMs,
    ease: eases.inCubic,
  });

const exitToLeft = (el: HTMLElement) =>
  animate(el, {
    translateX: ['0%', '-150%'],
    duration: durationMs,
    ease: eases.inCubic,
  });

@lifecycleHooks()
export class AnimationHooks {
  private element: HTMLElement;
  private isBack: boolean = false;

  public created(vm, controller: IController): void {
    this.element = controller.host;
  }
  public loading(vm: IRouteViewModel, params: Params, next: RouteNode, current: RouteNode, options: INavigationOptions): void | Promise<void> {
    this.isBack = options.isBack;
  }

  public async unloading(vm: IRouteViewModel, next: RouteNode, current: RouteNode, options: INavigationOptions): Promise<void | Promise<void>> {
    // the typings are weird here
    await (options.isBack ? exitToRight(this.element).then() : exitToLeft(this.element).then());
  }

  public attaching() {
    return this.isBack ? enterFromLeft(this.element) : enterFromRight(this.element);
  }
}
