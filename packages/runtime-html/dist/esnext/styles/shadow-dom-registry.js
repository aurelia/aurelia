import { Registration } from '@aurelia/kernel';
import { IShadowDOMStyles } from './shadow-dom-styles';
export class ShadowDOMRegistry {
    constructor(sharedStyles, createStyles) {
        this.sharedStyles = sharedStyles;
        this.createStyles = createStyles;
    }
    register(container, ...params) {
        container.register(Registration.instance(IShadowDOMStyles, this.createStyles(params, this.sharedStyles)));
    }
}
//# sourceMappingURL=shadow-dom-registry.js.map