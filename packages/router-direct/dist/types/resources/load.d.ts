import { ICustomAttributeViewModel } from '@aurelia/runtime-html';
import { Parameters } from '../instructions/instruction-parameters';
export declare class LoadCustomAttribute implements ICustomAttributeViewModel {
    value: unknown;
    component?: string;
    parameters?: Parameters;
    viewport?: string;
    id?: string;
    private hasHref;
    private routerNavigationSubscription;
    private readonly element;
    private readonly router;
    private readonly linkHandler;
    private readonly ea;
    private readonly activeClass;
    binding(): void;
    unbinding(): void;
    valueChanged(_newValue: unknown): void;
    private updateValue;
    private readonly navigationEndHandler;
    private updateActive;
}
//# sourceMappingURL=load.d.ts.map