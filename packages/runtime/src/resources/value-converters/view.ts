import { ComposableObject, IViewLocator } from '../../templating/view';
import { valueConverter } from '../value-converter';

@valueConverter('view')
export class ViewValueConverter {
  constructor(@IViewLocator private readonly viewLocator: IViewLocator) {}

  public toView(object: ComposableObject | null | undefined, viewName?: string) {
    return this.viewLocator.getViewComponentForObject(
      object,
      viewName
    );
  }
}
