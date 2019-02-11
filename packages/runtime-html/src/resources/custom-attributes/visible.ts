import { IRegistry, Reporter } from '@aurelia/kernel';
import {
  AttributeDefinition,
  BindingMode,
  CustomAttributeResource,
  IAttributeDefinition,
  ICustomAttributeResource,
  INode
} from '@aurelia/runtime';

export type IIntersectionObserverConstructor = new(cb: IntersectionObserverCallback) => IntersectionObserver;

export class VisibleCustomAttribute {

  public static register: IRegistry['register'];
  public static bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;
  /**
   * Intersection observer implementation that will be used to observe visiblity of elements
   * Assigning new implementation will have no effect on existing bound visible attributes
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
  private observer?: IntersectionObserver;

  constructor(
    element: Element
  ) {
    this.element = element;
  }

  public attached(): void {
    const Ctor = VisibleCustomAttribute.IntersectionObserver || IntersectionObserver;
    if (typeof Ctor !== 'function') {
      throw Reporter.error(404, 'IntersectionObserver not supported.'); // todo: proper error code
    }
    this.observer = new Ctor((entries) => {
      this.value = entries[0].isIntersecting;
      this.visibility = entries[0].intersectionRatio;
    });
    this.observer.observe(this.element);
  }

  public detaching(): void {
    (this.observer as IntersectionObserver).disconnect();
    this.observer = undefined;
  }
}

CustomAttributeResource.define('visible', VisibleCustomAttribute);
VisibleCustomAttribute.bindables = {
  value: { property: 'value', attribute: 'value', mode: BindingMode.fromView },
  visibility: { property: 'visibility', attribute: 'visibility', mode: BindingMode.fromView }
};
