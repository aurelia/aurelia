import { DefaultBindingLanguage, DefaultBindingSyntax, DefaultComponents } from '@aurelia/jit';
import { DefaultBindingLanguage as DefaultBindingLanguage$1, DefaultComponents as DefaultComponents$1 } from '@aurelia/jit-html';
import { Profiler, DI } from '@aurelia/kernel';
import { BasicConfiguration as BasicConfiguration$1 } from '@aurelia/runtime-html-jsdom';

const { enter, leave } = Profiler.createTimer('BasicConfiguration');
/**
 * A DI configuration object containing html-specific, jsdom-specific registrations:
 * - `BasicConfiguration` from `@aurelia/runtime-html-jsdom`
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
        if (Profiler.enabled) {
            enter();
        }
        BasicConfiguration$1
            .register(container)
            .register(...DefaultBindingLanguage, ...DefaultBindingSyntax, ...DefaultComponents, ...DefaultBindingLanguage$1, ...DefaultComponents$1);
        if (Profiler.enabled) {
            leave();
        }
        return container;
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        if (Profiler.enabled) {
            enter();
        }
        const container = this.register(DI.createContainer());
        if (Profiler.enabled) {
            leave();
        }
        return container;
    }
};

export { BasicConfiguration };
//# sourceMappingURL=index.es6.js.map
