import { IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { StartTask } from '@aurelia/runtime';
import { HTMLDOM } from '../dom';
import { CSSModulesProcessorRegistry } from './css-modules-registry';
import { ShadowDOMRegistry, ShadowDOMStylesFactory } from './shadow-dom-registry';
import {
  AdoptedStyleSheetsStyles,
  IShadowDOMStyles,
  noopShadowDOMStyles,
  StyleElementStyles,
  IShadowDOMGlobalStyles
} from './shadow-dom-styles';

const ext = '.css';

export interface IShadowDOMConfiguration {
  sharedStyles?: (string | CSSStyleSheet)[];
}

export function styles(...styles: unknown[]) {
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
    return StartTask.with(IContainer).beforeCreate().call(container => {
      const dom = container.get(HTMLDOM);
      let createStyles: ShadowDOMStylesFactory;

      if (AdoptedStyleSheetsStyles.supported(dom)) {
        const styleSheetCache = new Map();
        createStyles = (localStyles, sharedStyles) => {
          return new AdoptedStyleSheetsStyles(
            dom,
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

          return new StyleElementStyles(
            dom,
            localStyles as string[],
            sharedStyles
          );
        };
      }

      let globalStyles: IShadowDOMStyles;

      if (config && config.sharedStyles) {
        globalStyles = createStyles(config.sharedStyles, null);
      } else {
        globalStyles = noopShadowDOMStyles;
      }

      container.register(
        Registration.instance(
          IShadowDOMGlobalStyles,
          globalStyles
        )
      );

      container.register(
        Registration.instance(
          ext,
          new ShadowDOMRegistry(
            globalStyles,
            createStyles
          )
        )
      );
    });
  }
};
