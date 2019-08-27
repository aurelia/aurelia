import { ClassInstance, ComposableObject, ComposableObjectComponentType, IViewLocator, ViewSelector } from '../../templating/view';
export declare class ViewValueConverter {
    private readonly viewLocator;
    constructor(viewLocator: IViewLocator);
    toView<T extends ClassInstance<ComposableObject>>(object: T | null | undefined, viewNameOrSelector?: string | ViewSelector): ComposableObjectComponentType<T> | null;
}
//# sourceMappingURL=view.d.ts.map