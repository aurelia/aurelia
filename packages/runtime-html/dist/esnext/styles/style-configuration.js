import { IContainer, Registration } from '@aurelia/kernel';
import { StartTask } from '@aurelia/runtime';
import { IShadowDOMGlobalStyles } from './shadow-dom-styles';
import { IShadowDOMStyleFactory } from './shadow-dom-registry';
export const StyleConfiguration = {
    shadowDOM(config) {
        return StartTask.with(IContainer).beforeCreate().call(container => {
            if (config.sharedStyles) {
                const factory = container.get(IShadowDOMStyleFactory);
                container.register(Registration.instance(IShadowDOMGlobalStyles, factory.createStyles(config.sharedStyles, null)));
            }
        });
    }
};
//# sourceMappingURL=style-configuration.js.map