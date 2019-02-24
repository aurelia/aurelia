import { DefaultBindingLanguage, DefaultBindingSyntax, DefaultComponents } from '@aurelia/jit';
import { DefaultBindingLanguage as DefaultBindingLanguage$1, DefaultComponents as DefaultComponents$1 } from '@aurelia/jit-html';
import { DI } from '@aurelia/kernel';
import { BasicConfiguration as BasicConfiguration$1 } from '@aurelia/runtime-pixi';

/**
 * A DI configuration object containing html-, pixi- and browser-specific registrations:
 * - `BasicConfiguration` from `@aurelia/runtime-pixi`
 * - `DefaultComponents` from `@aurelia/jit`
 * - `DefaultBindingSyntax` from `@aurelia/jit`
 * - `DefaultBindingLanguage` from `@aurelia/jit`
 * - `DefaultComponents` from `@aurelia/jit-html`
 * - `DefaultBindingLanguage` from `@aurelia/jit-html`
 */
const BasicConfiguration = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        return BasicConfiguration$1
            .register(container)
            .register(...DefaultBindingLanguage, ...DefaultBindingSyntax, ...DefaultComponents, ...DefaultBindingLanguage$1, ...DefaultComponents$1);
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(DI.createContainer());
    }
};

export { BasicConfiguration };
//# sourceMappingURL=index.es6.js.map
