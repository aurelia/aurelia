import { IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { AttributeDefinition, BindingMode, CustomAttributeResource, IAttributeDefinition, ICustomAttributeResource, INode } from '@aurelia/runtime';

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
  // tslint:disable-next-line:variable-name
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
  private element: HTMLElement;
  /**
   * @internal
   */
  private observer?: IntersectionObserver;

  constructor(
    element: HTMLElement
  ) {
    this.element = element;
  }

  public attached(): void {
    this.observer = new VisibleCustomAttribute.IntersectionObserver((entries) => {
      this.value = entries[0].isIntersecting;
      this.visibility = entries[0].intersectionRatio;
    });
    this.observer.observe(this.element);
  }

  public detached(): void {
    (this.observer as IntersectionObserver).disconnect();
    this.observer = undefined;
  }
}

CustomAttributeResource.define('visible', VisibleCustomAttribute);
VisibleCustomAttribute.register = function(container: IContainer): void {
  const description = this.description;
  const resourceKey = this.kind.keyFrom(description.name);
  const aliases = description.aliases;

  container.register(Registration.transient(resourceKey, this));
}
VisibleCustomAttribute.bindables = {
  value: { property: 'value', attribute: 'value', mode: BindingMode.fromView },
  visibility: { property: 'visibility', attribute: 'visibility', mode: BindingMode.fromView }
};
