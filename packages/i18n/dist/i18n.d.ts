import { IDOM, ILifecycleTask } from '@aurelia/runtime';
import i18nextCore from 'i18next';
import { I18nConfigurationOptions } from './i18n-configuration-options';
import { I18nextWrapper } from './i18next-wrapper';
export declare const I18N: import("@aurelia/kernel").InterfaceSymbol<I18nService>;
/**
 * Translation service class.
 * @export
 */
export declare class I18nService {
    private readonly dom;
    i18next: i18nextCore.i18n;
    private options;
    private task;
    constructor(i18nextWrapper: I18nextWrapper, options: I18nConfigurationOptions, dom: IDOM<Node>);
    tr(key: string | string[], options?: i18nextCore.TOptions<object>): string;
    updateValue(node: Node, value: string, params?: i18nextCore.TOptions<object>): ILifecycleTask<unknown>;
    private updateValueCore;
    private extractAttributesFromKey;
    private applyTranslations;
    private initializeI18next;
}
//# sourceMappingURL=i18n.d.ts.map