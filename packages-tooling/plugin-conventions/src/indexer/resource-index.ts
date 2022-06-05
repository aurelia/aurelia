export class ResourceIndex {
  public index(): ResourceInfo[] {
    return [];
  }
}

export class ResourceInfo {
  public constructor(
    public readonly path: string,
    public readonly type: ResourceType,
  ) {}
}

// expoo

export const enum ResourceType {
  Element = 1,
  Attr = 2,
  ValueConverter = 3,
  BindingBehavior = 4,
  AttributePattern = 5,
}
