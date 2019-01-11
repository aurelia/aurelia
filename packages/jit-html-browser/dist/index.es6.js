import { DefaultBindingLanguage, DefaultBindingSyntax, DefaultComponents } from '@aurelia/jit';
import { DefaultBindingLanguage as DefaultBindingLanguage$1, DefaultComponents as DefaultComponents$1 } from '@aurelia/jit-html';
import { Profiler, DI } from '@aurelia/kernel';
import { BasicConfiguration } from '@aurelia/runtime-html-browser';

const { enter, leave } = Profiler.createTimer('BasicConfiguration');
/**
 * A DI configuration object containing html-specific, browser-specific registrations:
 * - `BasicConfiguration` from `@aurelia/runtime-html-browser`
 * - `DefaultComponents` from `@aurelia/jit`
 * - `DefaultBindingSyntax` from `@aurelia/jit`
 * - `DefaultBindingLanguage` from `@aurelia/jit`
 * - `DefaultComponents` from `@aurelia/jit-html`
 * - `DefaultBindingLanguage` from `@aurelia/jit-html`
 */
const BasicConfiguration$1 = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        BasicConfiguration
            .register(container)
            .register(...DefaultBindingLanguage, ...DefaultBindingSyntax, ...DefaultComponents, ...DefaultBindingLanguage$1, ...DefaultComponents$1);
        return container;
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        const container = this.register(DI.createContainer());
        return container;
    }
};

export { BasicConfiguration$1 as BasicConfiguration };
//# sourceMappingURL=index.es6.js.map
