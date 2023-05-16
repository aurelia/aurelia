import { CustomElementDefinition } from '../resources/custom-element';
import { isString } from '../utilities';
import { createInterface } from '../utilities-di';
import { Controller } from './controller';

import type { IContainer } from '@aurelia/kernel';
import type { PartialCustomElementDefinition } from '../resources/custom-element';
import type { ICustomAttributeController, ICustomElementController, ISyntheticView } from './controller';

export interface IViewFactory extends ViewFactory {}
export const IViewFactory = /*@__PURE__*/createInterface<IViewFactory>('IViewFactory');
export class ViewFactory implements IViewFactory {
  public static maxCacheSize: number = 0xFFFF;

  public name: string;
  public readonly container: IContainer;
  public def: PartialCustomElementDefinition;
  public isCaching: boolean = false;

  /** @internal */
  private _cache: ISyntheticView[] = null!;
  /** @internal */
  private _cacheSize: number = -1;

  public constructor(
    container: IContainer,
    def: CustomElementDefinition,
  ) {
    this.name = def.name;
    this.container = container;
    this.def = def;
  }

  public setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (size) {
      if (size === '*') {
        size = ViewFactory.maxCacheSize;
      } else if (isString(size)) {
        size = parseInt(size, 10);
      }

      if (this._cacheSize === -1 || !doNotOverrideIfAlreadySet) {
        this._cacheSize = size;
      }
    }

    if (this._cacheSize > 0) {
      this._cache = [];
    } else {
      this._cache = null!;
    }

    this.isCaching = this._cacheSize > 0;
  }

  public canReturnToCache(_controller: ISyntheticView): boolean {
    return this._cache != null && this._cache.length < this._cacheSize;
  }

  public tryReturnToCache(controller: ISyntheticView): boolean {
    if (this.canReturnToCache(controller)) {
      this._cache.push(controller);
      return true;
    }

    return false;
  }

  public create(
    parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController | undefined,
  ): ISyntheticView {
    const cache = this._cache;
    let controller: ISyntheticView;

    if (cache != null && cache.length > 0) {
      controller = cache.pop()!;
      return controller;
    }

    controller = Controller.$view(this, parentController);
    return controller;
  }
}
