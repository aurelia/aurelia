import { IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { CSSModulesRegistry } from './css-modules-registry';
import { ShadowDOMRegistry, ShadowDOMStylesFactory } from './shadow-dom-registry';
import {
  AdoptedStyleSheetsStyles,
  IShadowDOMStyles,
  noopShadowDOMStyles,
  StyleElementStyles
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
        let createStyles: ShadowDOMStylesFactory;

        if (AdoptedStyleSheetsStyles.supported()) {
          const styleSheetCache = new Map();
          createStyles = (localStyles, sharedStyles) => {
            return new AdoptedStyleSheetsStyles(
              localStyles,
              styleSheetCache,
              sharedStyles
            );
          };
        } else {
          createStyles = (localStyles, sharedStyles) => {
            return new StyleElementStyles(localStyles, sharedStyles);
          };
        }

        let globalSharedStyles: IShadowDOMStyles;

        if (config && config.sharedStyles) {
          globalSharedStyles = createStyles(config.sharedStyles, null);
        } else {
          globalSharedStyles = noopShadowDOMStyles;
        }

        container.register(
          Registration.instance(
            ext,
            new ShadowDOMRegistry(
              globalSharedStyles,
              createStyles
            )
          )
        );
      }
    };
  }
};
