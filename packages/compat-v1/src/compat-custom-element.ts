import { Constructable, getResourceKeyFor, Writable } from '@aurelia/kernel';
import { CustomElementDefinition, PartialCustomElementDefinition } from '@aurelia/runtime-html';
import { defineMetadata, getAnnotationKeyFor, getMetadata } from './utilities';

/**
 * Decorator: Indicates that the custom element does not have a view.
 */
export function noView(target: Constructable, context: ClassDecoratorContext): void;
/**
 * Decorator: Indicates that the custom element does not have a view.
 */
export function noView(): (target: Constructable, context: ClassDecoratorContext) => void;
export function noView(target?: Constructable, context?: ClassDecoratorContext): void | ((target: Constructable, context: ClassDecoratorContext) => void) {
  if (target === void 0) {
    return function ($target: Constructable, $context: ClassDecoratorContext) {
      $context.addInitializer(function (this) {
        setTemplate($target, null);
      });
    };
  }

  context!.addInitializer(function (this) {
    setTemplate(target, null);
  });
}

/**
 * Decorator: Indicates that the custom element has a markup defined inline in this decorator.
 */
export function inlineView(template: string | null): (target: Constructable, context: ClassDecoratorContext) => void {
  return function ($target: Constructable, context: ClassDecoratorContext) {
    context.addInitializer(function (this) {
      setTemplate($target, template);
    });
  };
}

const elementTypeName = 'custom-element';
const elementBaseName = /*@__PURE__*/getResourceKeyFor(elementTypeName);
const annotateElementMetadata = <K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K, value: PartialCustomElementDefinition[K]): void => {
  defineMetadata(value, Type, getAnnotationKeyFor(prop));
};

/** Manipulates the `template` property of the custom element definition for the type, when present else it annotates the type. */
function setTemplate(target: Constructable, template: string | null) {
  const def = getMetadata<CustomElementDefinition>(elementBaseName, target);
  if(def === void 0) {
    annotateElementMetadata(target, 'template', template);
    return;
  }
  (def as Writable<CustomElementDefinition>).template = template;
}
