import { ResourceType } from '../options';
import { AttributeDefinition, ElementDefinition, ResourceDefinition } from './resource';

export class ResourceIndex {
  public constructor(
    private readonly resources: ResourceInfo<ResourceDefinition>[],
  ) {

  }

  public findElement(name: string): object {
    return { name };
  }

  public findAttribute(name: string): object {
    return { name };
  }
}

export abstract class ResourceInfo<T> {
  public constructor(
    public readonly path: string,
    public readonly type: ResourceType,
  ) {}

  public abstract resolve(): T;
}

export class ResourceInfoElement extends ResourceInfo<ElementDefinition> {
  public resolve(): ElementDefinition {
    return null!;
  }
}

export class ResourceInfoAttribute extends ResourceInfo<AttributeDefinition> {
  public resolve(): ElementDefinition {
    return null!;
  }
}
