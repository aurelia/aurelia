import { ICustomAttributeViewModel } from '@aurelia/runtime-html';
import { IRouteContext } from '../route-context';
import { Params } from '../instructions';
export declare class LoadCustomAttribute implements ICustomAttributeViewModel {
    route: unknown;
    params?: Params;
    attribute: string;
    active: boolean;
    /**
     * When not bound, it defaults to the injected instance of the router context.
     */
    context?: IRouteContext;
    constructor();
    binding(): void;
    attaching(): void | Promise<void>;
    unbinding(): void;
    valueChanged(): void;
    private readonly onClick;
}
//# sourceMappingURL=load.d.ts.map