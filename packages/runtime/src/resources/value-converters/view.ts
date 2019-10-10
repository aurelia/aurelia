import {
  ClassInstance,
  ComposableObject,
  ComposableObjectComponentType,
  IViewLocator,
  ViewSelector
} from '../../templating/view';
import { valueConverter } from '../value-converter';

@valueConverter('view')
export class ViewValueConverter {
  public constructor(@IViewLocator private readonly viewLocator: IViewLocator) {}

  public toView<T extends ClassInstance<ComposableObject>>(
    object: T | null | undefined,
    viewNameOrSelector?: string | ViewSelector
  ): ComposableObjectComponentType<T> | null {
    return this.viewLocator.getViewComponentForObject<T>(
      object,
      viewNameOrSelector
    );
  }
}
