import { ComposableObject, IViewLocator } from '../../templating/view';
import { valueConverter } from '../value-converter';

@valueConverter('view')
export class ViewValueConverter {
  constructor(@IViewLocator private readonly viewLocator: IViewLocator) {}

  public toView(subject: ComposableObject | null | undefined, viewName?: string) {
    return this.viewLocator.getViewComponentForModelInstance(
      subject,
      viewName
    );
  }
}
