import { Constructable, Decoratable, Decorated } from '@aurelia/kernel';
import { ITemplateDefinition } from '../definitions';
import { ICustomElement, ICustomElementResource, ICustomElementType } from './lifecycle-render';
declare type CustomElementDecorator = <T extends Constructable>(target: Decoratable<ICustomElement, T>) => Decorated<ICustomElement, T> & ICustomElementType;
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export declare function customElement(nameOrSource: string | ITemplateDefinition): CustomElementDecorator;
declare type HasShadowOptions = Pick<ITemplateDefinition, 'shadowOptions'>;
/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export declare function useShadowDOM<T extends Constructable>(options?: HasShadowOptions['shadowOptions']): (target: T & HasShadowOptions) => Decorated<HasShadowOptions, T>;
/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export declare function useShadowDOM<T extends Constructable>(target: (T & HasShadowOptions)): Decorated<HasShadowOptions, T>;
declare type HasContainerless = Pick<ITemplateDefinition, 'containerless'>;
declare function containerlessDecorator<T extends Constructable>(target: T & HasContainerless): Decorated<HasContainerless, T>;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export declare function containerless(): typeof containerlessDecorator;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export declare function containerless<T extends Constructable>(target: T & HasContainerless): Decorated<HasContainerless, T>;
export declare const CustomElementResource: ICustomElementResource;
export {};
//# sourceMappingURL=custom-element.d.ts.map