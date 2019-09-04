import { DI, PLATFORM } from '@aurelia/kernel';
export const noopShadowDOMStyles = Object.freeze({
    applyTo: PLATFORM.noop
});
export const IShadowDOMStyles = DI.createInterface('IShadowDOMStyles').noDefault();
export const IShadowDOMGlobalStyles = DI.createInterface('IShadowDOMGlobalStyles')
    .withDefault(x => x.instance(noopShadowDOMStyles));
export class AdoptedStyleSheetsStyles {
    constructor(dom, localStyles, styleSheetCache, sharedStyles = null) {
        this.sharedStyles = sharedStyles;
        this.styleSheets = localStyles.map(x => {
            let sheet;
            if (x instanceof dom.CSSStyleSheet) {
                sheet = x;
            }
            else {
                sheet = styleSheetCache.get(x);
                if (!sheet) {
                    sheet = new dom.CSSStyleSheet();
                    sheet.replaceSync(x);
                    styleSheetCache.set(x, sheet);
                }
            }
            return sheet;
        });
    }
    static supported(dom) {
        return 'adoptedStyleSheets' in dom.ShadowRoot.prototype;
    }
    applyTo(shadowRoot) {
        if (this.sharedStyles !== null) {
            this.sharedStyles.applyTo(shadowRoot);
        }
        // https://wicg.github.io/construct-stylesheets/
        // https://developers.google.com/web/updates/2019/02/constructable-stylesheets
        shadowRoot.adoptedStyleSheets = [
            ...shadowRoot.adoptedStyleSheets,
            ...this.styleSheets
        ];
    }
}
export class StyleElementStyles {
    constructor(dom, localStyles, sharedStyles = null) {
        this.dom = dom;
        this.localStyles = localStyles;
        this.sharedStyles = sharedStyles;
    }
    applyTo(shadowRoot) {
        const styles = this.localStyles;
        const dom = this.dom;
        for (let i = styles.length - 1; i > -1; --i) {
            const element = dom.createElement('style');
            element.innerHTML = styles[i];
            shadowRoot.prepend(element);
        }
        if (this.sharedStyles !== null) {
            this.sharedStyles.applyTo(shadowRoot);
        }
    }
}
//# sourceMappingURL=shadow-dom-styles.js.map