import { IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { CSSModulesRegistry } from './css-modules-registry';
import { adoptedStyleSheetsSupported, ShadowDOMRegistry, ShadowDOMStyleManagerFactory } from './shadow-dom-registry';
import {
  AdoptedStyleSheetsStyleManager,
  IShadowDOMStyleManager,
  noopShadowDOMStyleManager,
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
        let factory: ShadowDOMStyleManagerFactory;

        if (adoptedStyleSheetsSupported()) {
          const cache = new Map();
          factory = (s, parent) => {
            return new AdoptedStyleSheetsStyleManager(
              s,
              cache,
              parent
            );
          };
        } else {
          factory = (s, parent) => {
            return new StyleElementStyleManager(s, parent);
          };
        }

        let parent: IShadowDOMStyleManager;

        if (config && config.sharedStyles) {
          parent = factory(config.sharedStyles, null);
        } else {
          parent = noopShadowDOMStyleManager;
        }

        container.register(
          Registration.instance(
            ext,
            new ShadowDOMRegistry(
              parent,
              factory
            )
          )
        );
      }
    };
  }
};
