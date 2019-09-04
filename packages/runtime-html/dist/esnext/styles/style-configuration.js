import { IContainer, Registration } from '@aurelia/kernel';
import { StartTask } from '@aurelia/runtime';
import { HTMLDOM } from '../dom';
import { CSSModulesProcessorRegistry } from './css-modules-registry';
import { ShadowDOMRegistry } from './shadow-dom-registry';
import { AdoptedStyleSheetsStyles, noopShadowDOMStyles, StyleElementStyles, IShadowDOMGlobalStyles } from './shadow-dom-styles';
const ext = '.css';
export function styles(...styles) {
    return Registration.defer(ext, ...styles);
}
export const StyleConfiguration = {
    cssModulesProcessor() {
        return {
            register(container) {
                container.register(Registration.singleton(ext, CSSModulesProcessorRegistry));
            }
        };
    },
    shadowDOM(config) {
        return StartTask.with(IContainer).beforeCreate().call(container => {
            const dom = container.get(HTMLDOM);
            let createStyles;
            if (AdoptedStyleSheetsStyles.supported(dom)) {
                const styleSheetCache = new Map();
                createStyles = (localStyles, sharedStyles) => {
                    return new AdoptedStyleSheetsStyles(dom, localStyles, styleSheetCache, sharedStyles);
                };
            }
            else {
                createStyles = (localStyles, sharedStyles) => {
                    if (localStyles.find(x => typeof x !== 'string')) {
                        // TODO: use reporter
                        throw new Error('Shadow DOM CSS must be a string.');
                    }
                    return new StyleElementStyles(dom, localStyles, sharedStyles);
                };
            }
            let globalStyles;
            if (config && config.sharedStyles) {
                globalStyles = createStyles(config.sharedStyles, null);
            }
            else {
                globalStyles = noopShadowDOMStyles;
            }
            container.register(Registration.instance(IShadowDOMGlobalStyles, globalStyles));
            container.register(Registration.instance(ext, new ShadowDOMRegistry(globalStyles, createStyles)));
        });
    }
};
//# sourceMappingURL=style-configuration.js.map