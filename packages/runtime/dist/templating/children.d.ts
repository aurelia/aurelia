import { Constructable } from '@aurelia/kernel';
import { ChildrenObserverSource, ITemplateDefinition } from '../definitions';
export declare type HasChildrenObservers = Pick<ITemplateDefinition, 'childrenObservers'>;
export declare type ChildrenDecorator = <T extends InstanceType<Constructable & Partial<HasChildrenObservers>>>(target: T, prop: string) => void;
/**
 * Decorator: Specifies custom behavior for an array children property that synchronizes its items with child content nodes of the element.
 *
 * @param config - The overrides
 */
export declare function children(config?: ChildrenObserverSource): ChildrenDecorator;
/**
 * Decorator: Specifies an array property on a class that synchronizes its items with child content nodes of the element.
 *
 * @param prop - The property name
 */
export declare function children(prop: string): ClassDecorator;
/**
 * Decorator: Decorator: Specifies an array property that synchronizes its items with child content nodes of the element.
 *
 * @param target - The class
 * @param prop - The property name
 */
export declare function children<T extends InstanceType<Constructable & Partial<HasChildrenObservers>>>(target: T, prop: string): void;
//# sourceMappingURL=children.d.ts.map