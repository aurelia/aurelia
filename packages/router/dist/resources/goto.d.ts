import { INode, IDOM, ICustomAttributeController, ICustomAttributeViewModel } from '@aurelia/runtime';
import { IRouter } from '../router';
import { IEventManager } from '@aurelia/runtime-html';
export declare class GotoCustomAttribute implements ICustomAttributeViewModel<HTMLElement> {
    private readonly dom;
    private readonly router;
    private readonly eventManager;
    value: unknown;
    private listener;
    private hasHref;
    private readonly element;
    private observer;
    readonly $controller: ICustomAttributeController<HTMLElement, this>;
    private readonly activeClass;
    constructor(dom: IDOM, element: INode, router: IRouter, eventManager: IEventManager);
    beforeBind(): void;
    beforeUnbind(): void;
    valueChanged(newValue: unknown): void;
    private updateValue;
    handleChange(): void;
}
//# sourceMappingURL=goto.d.ts.map