import { IRegistry } from '@aurelia/kernel';
import {
  AttributeDefinition,
  BindingMode,
  CustomAttributeResource,
  IAttributeDefinition,
  ICustomAttributeResource,
  INode
} from '@aurelia/runtime';

export type IIntersectionObserverConstructor = new(cb: IntersectionObserverCallback) => IntersectionObserver;

/**
 * Visible attribute class
 */
export class VisibleCustomAttribute {

  public static register: IRegistry['register'];
  public static bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;
  /**
   * Intersection observer implementation that will be used to observe visiblity of elements
   * Assigning new implementation will have no effect on existing bound visible attributes
   * todo: should this be based on IDOM?
   */
  public static IntersectionObserver: IIntersectionObserverConstructor;

  /**
   * @internal
   */
  public static inject: unknown[] = [INode];

  public value: boolean;
  public visibility: number;

  /**
   * @internal
   */
  private element: Element;
  /**
   * @internal
   */
  private observer!: IntersectionObserver;

  constructor(
    element: Element
  ) {
    this.element = element;
    this.value = false;
    this.visibility = 0;
  }

  public attached(): void {
    const Ctor = VisibleCustomAttribute.IntersectionObserver || IntersectionObserver;
    if (typeof Ctor !== 'function') {
      throw new Error('IntersectionObserver not supported.'); // todo: proper error code
    }
    const observer = this.observer = new Ctor((entries) => {
      debugger;
      this.value = entries[0].isIntersecting;
      this.visibility = entries[0].intersectionRatio;
    });
    observer.observe(this.element);
  }

  public detaching(): void {
    this.observer!.disconnect();
    this.observer = undefined!;
  }
}

VisibleCustomAttribute.bindables = {
  value: { property: 'value', attribute: 'value', mode: BindingMode.fromView },
  visibility: { property: 'visibility', attribute: 'visibility', mode: BindingMode.fromView }
};
CustomAttributeResource.define('visible', VisibleCustomAttribute);
