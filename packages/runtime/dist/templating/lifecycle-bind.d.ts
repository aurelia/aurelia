import { LifecycleFlags } from '../flags';
import { IComponent, ILifecycleHooks, IRenderable } from '../lifecycle';
interface IBindable extends IRenderable, ILifecycleHooks, IComponent {
    constructor: {
        description?: {
            name: string;
        };
        name: string;
    };
}
export declare function $patch(this: IBindable, flags: LifecycleFlags): void;
export {};
//# sourceMappingURL=lifecycle-bind.d.ts.map