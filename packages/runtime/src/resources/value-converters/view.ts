import { ComposableObject, IViewLocator, ViewSelector } from '../../templating/view';
import { valueConverter } from '../value-converter';

@valueConverter('view')
export class ViewValueConverter {
  constructor(@IViewLocator private readonly viewLocator: IViewLocator) {}

  public toView(object: ComposableObject | null | undefined, viewNameOrSelector?: string | ViewSelector) {
    return this.viewLocator.getViewComponentForObject(
      object,
      viewNameOrSelector
    );
  }
}
