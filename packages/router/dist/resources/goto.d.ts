import { INode, ICustomAttributeController, ICustomAttributeViewModel } from '@aurelia/runtime-html';
import { IRouter } from '../router';
export declare class GotoCustomAttribute implements ICustomAttributeViewModel {
    private readonly router;
    value: unknown;
    private hasHref;
    private readonly element;
    private observer;
    readonly $controller: ICustomAttributeController<this>;
    private readonly activeClass;
    constructor(element: INode, router: IRouter);
    binding(): void;
    unbinding(): void;
    valueChanged(newValue: unknown): void;
    private updateValue;
    handleChange(): void;
}
//# sourceMappingURL=goto.d.ts.map