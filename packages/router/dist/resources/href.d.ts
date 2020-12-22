import { INode, ICustomAttributeViewModel, ICustomAttributeController } from '@aurelia/runtime-html';
import { IRouter } from '../router.js';
export declare class HrefCustomAttribute implements ICustomAttributeViewModel {
    private readonly element;
    private readonly router;
    value: string | undefined;
    readonly $controller: ICustomAttributeController<this>;
    constructor(element: INode<Element>, router: IRouter);
    binding(): void;
    unbinding(): void;
    valueChanged(): void;
    private updateValue;
    private hasGoto;
}
//# sourceMappingURL=href.d.ts.map