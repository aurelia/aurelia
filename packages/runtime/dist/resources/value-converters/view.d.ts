import { ComposableObjectComponentType, IViewLocator, ViewSelector } from '../../templating/view';
import { ICustomElementViewModel } from '../../lifecycle';
export declare class ViewValueConverter {
    private readonly viewLocator;
    constructor(viewLocator: IViewLocator);
    toView<T extends ICustomElementViewModel>(object: T | null | undefined, viewNameOrSelector?: string | ViewSelector): ComposableObjectComponentType<T> | null;
}
//# sourceMappingURL=view.d.ts.map