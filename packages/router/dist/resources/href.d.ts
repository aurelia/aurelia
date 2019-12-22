import { INode, IDOM, ICustomAttributeViewModel, ICustomAttributeController } from '@aurelia/runtime';
import { IRouter } from '../router';
import { IEventManager } from '@aurelia/runtime-html';
export declare class HrefCustomAttribute implements ICustomAttributeViewModel<HTMLElement> {
    private readonly dom;
    private readonly router;
    private readonly eventManager;
    value: string | undefined;
    private eventListener;
    private readonly element;
    readonly $controller: ICustomAttributeController<HTMLElement, this>;
    constructor(dom: IDOM, element: INode, router: IRouter, eventManager: IEventManager);
    beforeBind(): void;
    beforeUnbind(): void;
    valueChanged(): void;
    private updateValue;
    private hasGoto;
}
//# sourceMappingURL=href.d.ts.map