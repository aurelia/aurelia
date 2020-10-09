import { IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime';
import { IShadowDOMGlobalStyles } from './shadow-dom-styles';
import { IShadowDOMStyleFactory } from './shadow-dom-registry';

export interface IShadowDOMConfiguration {
  sharedStyles?: (string | CSSStyleSheet)[];
}

export const StyleConfiguration = {
  shadowDOM(config: IShadowDOMConfiguration): IRegistry {
    return AppTask.with(IContainer).beforeCreate().call(container => {
      if (config.sharedStyles) {
        const factory = container.get(IShadowDOMStyleFactory);
        container.register(
          Registration.instance(
            IShadowDOMGlobalStyles,
            factory.createStyles(config.sharedStyles, null)
          )
        );
      }
    });
  }
};
