import { kebabCase } from '@aurelia/kernel';

export class BindableInfo {
  public constructor(
    public readonly prop: string,
    public readonly mode: 'oneWay' | 'toView' | 'fromView' | 'twoWay' | 'default'
  ) {}
}

export abstract class ResourceDefinition {
  public constructor(
    public readonly className: string,
    public readonly name: string,
  ) {

  }
}

export class ElementDefinition extends ResourceDefinition {
  public constructor(
    public readonly className: string,
    public readonly bindables: BindableInfo[],
  ) {
    super(className, kebabCase(className.replace(/CustomElement?$/, '')));
  }
}

export class AttributeDefinition extends ResourceDefinition {
  public constructor(
    public readonly className: string,
    public readonly bindables: BindableInfo[],
  ) {
    super(className, kebabCase(className.replace(/CustomElement?$/, '')));
  }
}
