import { ICustomAttributeViewModel, ICustomAttributeController, IEventDelegator, IEventTarget, INode, IWindow } from '@aurelia/runtime-html';
import { IRouter } from '../router.js';
import { IRouteContext } from '../route-context.js';
export declare class HrefCustomAttribute implements ICustomAttributeViewModel {
    private readonly target;
    private readonly el;
    private readonly router;
    private readonly delegator;
    private readonly ctx;
    value: unknown;
    private eventListener;
    private isInitialized;
    private isEnabled;
    readonly $controller: ICustomAttributeController<this>;
    constructor(target: IEventTarget, el: INode<HTMLElement>, router: IRouter, delegator: IEventDelegator, ctx: IRouteContext, w: IWindow);
    binding(): void;
    unbinding(): void;
    valueChanged(newValue: unknown): void;
    private readonly onClick;
}
//# sourceMappingURL=href.d.ts.map