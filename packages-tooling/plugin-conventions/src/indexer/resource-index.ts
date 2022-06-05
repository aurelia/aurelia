export class ResourceIndex {
  public index(): ResourceInfo<unknown>[] {
    return [];
  }
}

export abstract class ResourceInfo<T> {
  public constructor(
    public readonly path: string,
    public readonly type: ResourceType,
  ) {}

  public abstract resolve(): T;
}

export class ResourceInfoElement extends ResourceInfo<object /* should be CE definition */> {
  public resolve(): object {
    return {};
  }
}

export class ResourceInfoAttribute extends ResourceInfo<object /* should be CA definition */> {
  public resolve(): object {
    return {};
  }
}

export const enum ResourceType {
  Element = 1,
  Attr = 2,
  ValueConverter = 3,
  BindingBehavior = 4,
  AttributePattern = 5,
}
