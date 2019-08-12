import { IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { CSSModulesRegistry } from './css-modules-registry';
import { adoptedStyleSheetsSupported, ShadowDOMRegistry } from './shadow-dom-registry';
import {
  AdoptedStyleSheetsStyleManager,
  IShadowDOMStyleManager,
  StyleElementStyleManager
} from './shadow-dom-styles';

const ext = '.css';

export interface IShadowDOMConfiguration {
  sharedStyles?: string[];
}

export function styles(...styles: any[]) {
  return Registration.defer(ext, ...styles);
}

export const StyleConfiguration = {
  cssModules(): IRegistry {
    return {
      register(container: IContainer) {
        container.register(
          Registration.singleton(ext, CSSModulesRegistry)
        );
      }
    };
  },

  shadowDOM(config?: IShadowDOMConfiguration): IRegistry {
    return {
      register(container: IContainer) {
        if (config && config.sharedStyles) {
          container.register(
            Registration.instance(
              IShadowDOMStyleManager,
              adoptedStyleSheetsSupported()
                ? new AdoptedStyleSheetsStyleManager(config.sharedStyles, null)
                : new StyleElementStyleManager(config.sharedStyles, null)
            )
          );
        }

        container.register(
          Registration.singleton(ext, ShadowDOMRegistry)
        );
      }
    };
  }
};
