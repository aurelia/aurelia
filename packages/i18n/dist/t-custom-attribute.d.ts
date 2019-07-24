import { LifecycleFlags } from '@aurelia/runtime';
import { I18nService } from './i18n';
/**
 * `t` custom attribute to facilitate the translation via HTML
 * @export
 */
export declare class TCustomAttribute {
    private readonly node;
    private readonly i18n;
    value: string;
    constructor(node: Node, i18n: I18nService);
    binding(flags: LifecycleFlags): import("@aurelia/runtime").ILifecycleTask<unknown>;
    private isStringValue;
}
//# sourceMappingURL=t-custom-attribute.d.ts.map