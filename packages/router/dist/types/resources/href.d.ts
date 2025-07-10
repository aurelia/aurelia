import { type ICustomAttributeViewModel, type ICustomAttributeController, type CustomAttributeStaticAuDefinition } from '@aurelia/runtime-html';
export declare class HrefCustomAttribute implements ICustomAttributeViewModel {
    static readonly $au: CustomAttributeStaticAuDefinition;
    value: unknown;
    readonly $controller: ICustomAttributeController<this>;
    constructor();
    binding(): void;
    unbinding(): void;
    valueChanged(newValue: unknown): void;
    handleEvent(e: MouseEvent): void;
}
//# sourceMappingURL=href.d.ts.map