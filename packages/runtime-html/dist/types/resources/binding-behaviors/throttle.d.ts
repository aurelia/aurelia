import { IPlatform } from '@aurelia/kernel';
import { BindingBehaviorInstance, type IBinding, type Scope } from '@aurelia/runtime';
export declare class ThrottleBindingBehavior implements BindingBehaviorInstance {
    constructor(platform: IPlatform);
    bind(scope: Scope, binding: IBinding, delay?: number, signals?: string | string[]): void;
    unbind(scope: Scope, binding: IBinding): void;
}
//# sourceMappingURL=throttle.d.ts.map