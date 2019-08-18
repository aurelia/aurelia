import { IRegistry } from '@aurelia/kernel';
export interface IShadowDOMConfiguration {
    sharedStyles?: (string | CSSStyleSheet)[];
}
export declare function styles(...styles: unknown[]): IRegistry;
export declare const StyleConfiguration: {
    cssModulesProcessor(): IRegistry;
    shadowDOM(config?: IShadowDOMConfiguration | undefined): IRegistry;
};
//# sourceMappingURL=style-configuration.d.ts.map