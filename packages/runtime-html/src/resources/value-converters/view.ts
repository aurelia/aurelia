import { ComposableObjectComponentType, IViewLocator, ViewSelector } from '../../templating/view';
import { valueConverter } from '../value-converter';
import type { ICustomElementViewModel } from '../../templating/controller';

export class ViewValueConverter {
  public constructor(
    /** @internal */ @IViewLocator private readonly _viewLocator: IViewLocator,
  ) {}

  public toView<T extends ICustomElementViewModel>(
    object: T | null | undefined,
    viewNameOrSelector?: string | ViewSelector
  ): ComposableObjectComponentType<T> | null {
    return this._viewLocator.getViewComponentForObject<T>(
      object,
      viewNameOrSelector
    );
  }
}

valueConverter('view')(ViewValueConverter);
