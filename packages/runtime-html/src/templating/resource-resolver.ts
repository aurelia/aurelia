import { IContainer, IRegistry, ResourceDefinition, ResourceType } from '@aurelia/kernel';
import { CustomElementDefinition } from '../resources/custom-element';
import { CustomAttributeDefinition } from '../resources/custom-attribute';
import { BindingBehaviorDefinition } from '../resources/binding-behavior';
import { ValueConverterDefinition, ValueConverterType } from '../resources/value-converter';
import { aliasRegistration, createInterface, singletonRegistration } from '../utilities-di';
import { AppTask } from '../app-task';
import { BindingCommandDefinition, BindingCommandType } from '../resources/binding-command';

export interface IResourceDefinitionResolver {
  registerHandler(type: string, handler: ResourceHandler): void;

  resolve<K extends ResourceTypes>(container: IContainer, type: K, name: string | ResourceType):
    K extends 'element' ? CustomElementDefinition
    : K extends 'attribute' ? CustomAttributeDefinition
    : K extends 'bindingBehavior' ? BindingBehaviorDefinition
    : K extends 'valueConverter' ? ValueConverterDefinition
    : K extends 'bindingCommand' ? BindingCommandDefinition
    : never;
  resolve<T extends ResourceDefinition>(container: IContainer, type: string, name: string | ResourceType): T | null;
}
export const IResourceDefinitionResolver = createInterface<IResourceDefinitionResolver>('IResourceDefinitionResolver');

const element = 'element';
const attribute = 'attribute';
const bindingBehavior = 'bindingBehavior';
const valueConverter = 'valueConverter';
const bindingCommand = 'bindingCommand';

const ResourceTypes = {
  element,
  attribute,
  bindingBehavior,
  valueConverter,
  // todo: binding command being resource is weird
  //       maybe it could be just like attr pattern
  bindingCommand
} as const;
type ResourceTypes = typeof ResourceTypes[keyof typeof ResourceTypes];

export const defaultDefinitionResolution: IRegistry = {
  register(container: IContainer) {
    const resolver = container.get(ResourceDefinitionResolver);
    const handle = (type: string, handler: ResourceHandler) => resolver.registerHandler(type, handler);
    handle('element', (res) =>
      CustomElementDefinition.create((res as any).$au, res)
    );
    // todo: .name is likely to be wrong
    //       since it's just the class name
    handle('attribute', (res) =>
      CustomAttributeDefinition.create((res as any).$au, res)
    );
    handle('bindingBehavior', (res) =>
      BindingBehaviorDefinition.create(res.name, res)
    );
    handle('valueConverter', (res) =>
      ValueConverterDefinition.create((res as any).$au.name, res as ValueConverterType)
    );
    handle('bindingCommand', (res) =>
      BindingCommandDefinition.create(res.name, res as BindingCommandType)
    );
  }
};

export type ResourceHandler = (resource: ResourceType) => ResourceDefinition;

export class ResourceDefinitionResolver implements IResourceDefinitionResolver {
  public static register(container: IContainer) {
    container.register(
      singletonRegistration(this, this),
      aliasRegistration(this, IResourceDefinitionResolver)
    );
  }

  /** @internal */
  private readonly _cache: WeakMap<ResourceType, ResourceDefinition> = new WeakMap();
  /** @internal */
  private readonly _handlers: Record<string, ResourceHandler> = {};

  public registerHandler(type: string, handler: ResourceHandler) {
    if (this._handlers[type] != null) {
      throw new Error(`A handler for '${type}' has already been registered.`);
    }
    this._handlers[type] = handler;
  }

  public resolve<T extends ResourceDefinition, K extends string = string>(
    container: IContainer,
    type: K,
    name: string | ResourceType
  ) {
    // container shouldn't do any definition resolution/creation
    // it should simply just register as is and retrieve as is
    //
    // the resource definition resolver should be the one doing
    // the job of resolving/building the definition out of the resource classes
    const resource = typeof name === 'string' ? container.findResource!(type, name) : name;
    if (resource == null) {
      return null;
    }

    if (this._cache.has(resource)) {
      return this._cache.get(resource) as T;
    }

    const definition = this._handlers[type]?.(resource) as T ?? null;
    if (definition != null) {
      this._cache.set(resource, definition);
    }
    return definition;
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function test(r: IResourceDefinitionResolver, a: IContainer) {
  const el = r.resolve(a, 'element', 'abc');
  const res1 = el.bindables;
  const res = r.resolve(a, 'abc', 'eld');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return new res.Type();
}
