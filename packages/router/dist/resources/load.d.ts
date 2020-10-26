import { INode, ICustomAttributeController, ICustomAttributeViewModel } from '@aurelia/runtime-html';
import { IRouter } from '../router';
export declare class LoadCustomAttribute implements ICustomAttributeViewModel {
    private readonly router;
    value: unknown;
    private hasHref;
    private readonly element;
    private observer;
    readonly $controller: ICustomAttributeController<this>;
    private readonly activeClass;
    constructor(element: INode, router: IRouter);
    beforeBind(): void;
    beforeUnbind(): void;
    valueChanged(newValue: unknown): void;
    private updateValue;
    handleChange(): void;
}
//# sourceMappingURL=load.d.ts.map