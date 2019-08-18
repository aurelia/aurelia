import { IContainer, Registration } from '@aurelia/kernel';
import { StartTask } from '@aurelia/runtime';
import { HTMLDOM } from '../dom';
import { CSSModulesProcessorRegistry } from './css-modules-registry';
import { ShadowDOMRegistry } from './shadow-dom-registry';
import { AdoptedStyleSheetsStyles, IShadowDOMStyles, noopShadowDOMStyles, StyleElementStyles } from './shadow-dom-styles';
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
            let globalSharedStyles;
            if (config && config.sharedStyles) {
                globalSharedStyles = createStyles(config.sharedStyles, null);
            }
            else {
                globalSharedStyles = noopShadowDOMStyles;
            }
            container.register(Registration.instance(IShadowDOMStyles, globalSharedStyles));
            container.register(Registration.instance(ext, new ShadowDOMRegistry(globalSharedStyles, createStyles)));
        });
    }
};
//# sourceMappingURL=style-configuration.js.map