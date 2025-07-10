import { ICustomAttributeViewModel, ICustomAttributeController, CustomAttributeStaticAuDefinition } from '@aurelia/runtime-html';
export declare class HrefCustomAttribute implements ICustomAttributeViewModel {
    static readonly $au: CustomAttributeStaticAuDefinition;
    value: string | undefined;
    readonly $controller: ICustomAttributeController<this>;
    private routerNavigationSubscription?;
    private readonly element;
    private readonly router;
    private readonly linkHandler;
    private readonly ea;
    private readonly activeClass;
    binding(): void;
    unbinding(): void;
    valueChanged(): void;
    private updateValue;
    private readonly navigationEndHandler;
    private updateActive;
    private hasLoad;
}
//# sourceMappingURL=href.d.ts.map