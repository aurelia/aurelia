import { IViewLocator } from '../../templating/view';
import { valueConverter } from '../value-converter';

@valueConverter('view')
export class ViewValueConverter {
  constructor(@IViewLocator private readonly viewLocator: IViewLocator) {}

  public toView(subject: object, viewName?: string) {
    return this.viewLocator.getViewComponentForModelInstance(
      subject,
      viewName
    );
  }
}
