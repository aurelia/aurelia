import { Constructable } from '@aurelia/kernel';
/**
 * Decorator: Indicates that the custom element does not have a view.
 */
export declare function noView(target: Constructable, context: ClassDecoratorContext): void;
/**
 * Decorator: Indicates that the custom element does not have a view.
 */
export declare function noView(): (target: Constructable, context: ClassDecoratorContext) => void;
/**
 * Decorator: Indicates that the custom element has a markup defined inline in this decorator.
 */
export declare function inlineView(template: string | null): (target: Constructable, context: ClassDecoratorContext) => void;
//# sourceMappingURL=compat-custom-element.d.ts.map