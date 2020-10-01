import { INode, IDOM, ICustomAttributeController, ICustomAttributeViewModel } from '@aurelia/runtime';
import { IEventManager } from '@aurelia/runtime-html';
import { IRouter } from '../router';
export declare class LoadCustomAttribute implements ICustomAttributeViewModel<Element> {
    private readonly dom;
    private readonly router;
    private readonly eventManager;
    value: unknown;
    private listener;
    private hasHref;
    private readonly element;
    private observer;
    readonly $controller: ICustomAttributeController<Element, this>;
    private readonly activeClass;
    constructor(dom: IDOM, element: INode, router: IRouter, eventManager: IEventManager);
    beforeBind(): void;
    beforeUnbind(): void;
    valueChanged(newValue: unknown): void;
    private updateValue;
    handleChange(): void;
}
//# sourceMappingURL=load.d.ts.map