import { PLATFORM, Reporter } from '@aurelia/kernel';
import { ITemplateDefinition, TemplatePartDefinitions } from '../definitions';
import { INode } from '../dom';
import { LifecycleFlags, State } from '../flags';
import {
  IController,
  ILifecycle,
  IViewFactory
} from '../lifecycle';
import { ITemplate } from '../rendering-engine';
import { Controller } from './controller';

export class ViewFactory<T extends INode = INode> implements IViewFactory<T> {
  public static maxCacheSize: number = 0xFFFF;

  public isCaching: boolean;
  public name: string;
  public parts: TemplatePartDefinitions;

  private cache: IController<T>[];
  private cacheSize: number;
  private readonly lifecycle: ILifecycle;
  private readonly template: ITemplate<T>;

  constructor(name: string, template: ITemplate<T>, lifecycle: ILifecycle) {
    this.isCaching = false;

    this.cacheSize = -1;
    this.cache = null!;
    this.lifecycle = lifecycle;
    this.name = name;
    this.template = template;
    this.parts = PLATFORM.emptyObject;
  }

  public setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void {
    if (size) {
      if (size === '*') {
        size = ViewFactory.maxCacheSize;
      } else if (typeof size === 'string') {
        size = parseInt(size, 10);
      }

      if (this.cacheSize === -1 || !doNotOverrideIfAlreadySet) {
        this.cacheSize = size;
      }
    }

    if (this.cacheSize > 0) {
      this.cache = [];
    } else {
      this.cache = null!;
    }

    this.isCaching = this.cacheSize > 0;
  }

  public canReturnToCache(controller: IController<T>): boolean {
    return this.cache != null && this.cache.length < this.cacheSize;
  }

  public tryReturnToCache(controller: IController<T>): boolean {
    if (this.canReturnToCache(controller)) {
      controller.cache(LifecycleFlags.none);
      this.cache.push(controller);
      return true;
    }

    return false;
  }

  public create(flags?: LifecycleFlags): IController<T> {
    const cache = this.cache;
    let controller: IController<T>;

    if (cache != null && cache.length > 0) {
      controller = cache.pop()!;
      controller.state = (controller.state | State.isCached) ^ State.isCached;
      return controller;
    }

    controller = Controller.forSyntheticView(this, this.lifecycle, flags);
    this.template.render(controller, null!, this.parts, flags);
    if (!controller.nodes) {
      throw Reporter.error(90);
    }
    return controller;
  }

  public addParts(parts: Record<string, ITemplateDefinition>): void {
    if (this.parts === PLATFORM.emptyObject) {
      this.parts = { ...parts };
    } else {
      Object.assign(this.parts, parts);
    }
  }
}
