import { IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { CSSModulesProcessorRegistry } from './css-modules-registry';
import { ShadowDOMRegistry, ShadowDOMStylesFactory } from './shadow-dom-registry';
import {
  AdoptedStyleSheetsStyles,
  IShadowDOMStyles,
  noopShadowDOMStyles,
  StyleElementStyles
} from './shadow-dom-styles';

const ext = '.css';

export interface IShadowDOMConfiguration {
  sharedStyles?: (string | CSSStyleSheet)[];
}

export function styles(...styles: any[]) {
  return Registration.defer(ext, ...styles);
}

export const StyleConfiguration = {
  cssModulesProcessor(): IRegistry {
    return {
      register(container: IContainer) {
        container.register(
          Registration.singleton(ext, CSSModulesProcessorRegistry)
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
            if (localStyles.find(x => typeof x !== 'string')) {
              // TODO: use reporter
              throw new Error('Shadow DOM CSS must be a string.');
            }

            return new StyleElementStyles(localStyles as string[], sharedStyles);
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
