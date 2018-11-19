import { CustomElementResource, ICustomElementResource, ITemplateDefinition, IResourceType, ICustomElementType, buildTemplateDefinition, ICustomElement, State, Hooks } from '@aurelia/runtime';
import { Constructable, Reporter, Writable, Registration, IContainer } from '@aurelia/kernel';
import { $attachElement, $cacheElement, $detachElement, $mountElement, $unmountElement } from './lifecycle-attach';
import { $bindAttribute, $bindElement, $bindView, $unbindAttribute, $unbindElement, $unbindView } from './lifecycle-bind';
import { $hydrateElement } from './hydrate-element-override';

type PartialCustomElementType<T> = T & Partial<IResourceType<ITemplateDefinition, unknown, Constructable>>;

/*@internal*/
export function registerElement(this: ICustomElementType, container: IContainer): void {
  const resourceKey = this.kind.keyFrom(this.description.name);
  container.register(Registration.transient(resourceKey, this));
}

CustomElementResource.define = function define<T>(this: ICustomElementResource, nameOrDefinition: string | ITemplateDefinition, ctor: PartialCustomElementType<T> = null): T & ICustomElementType {
  if (!nameOrDefinition) {
    throw Reporter.error(70);
  }
  const Type = (ctor === null ? class HTMLOnlyElement { /* HTML Only */ } : ctor) as T & Writable<ICustomElementType>;
  const description = buildTemplateDefinition(<ICustomElementType><unknown>Type, nameOrDefinition);
  const proto: any = Type.prototype as Writable<ICustomElement>;

  Type.kind = CustomElementResource;
  Type.description = description;
  Type.register = registerElement;

  proto.$hydrate = $hydrateElement;
  proto.$bind = $bindElement;
  proto.$attach = $attachElement;
  proto.$detach = $detachElement;
  proto.$unbind = $unbindElement;
  proto.$cache = $cacheElement;

  proto.$prevBind = null;
  proto.$nextBind = null;
  proto.$prevAttach = null;
  proto.$nextAttach = null;

  proto.$nextUnbindAfterDetach = null;

  proto.$scope = null;
  proto.$hooks = 0;
  proto.$state = State.needsMount;

  proto.$bindableHead = null;
  proto.$bindableTail = null;
  proto.$attachableHead = null;
  proto.$attachableTail = null;

  proto.$mount = $mountElement;
  proto.$unmount = $unmountElement;

  proto.$nextMount = null;
  proto.$nextUnmount = null;

  proto.$projector = null;

  if ('flush' in proto) {
    proto.$nextFlush = null;
  }

  if ('binding' in proto) proto.$hooks |= Hooks.hasBinding;
  if ('bound' in proto) {
    proto.$hooks |= Hooks.hasBound;
    proto.$nextBound = null;
  }

  if ('unbinding' in proto) proto.$hooks |= Hooks.hasUnbinding;
  if ('unbound' in proto) {
    proto.$hooks |= Hooks.hasUnbound;
    proto.$nextUnbound = null;
  }

  if ('render' in proto) proto.$hooks |= Hooks.hasRender;
  if ('created' in proto) proto.$hooks |= Hooks.hasCreated;
  if ('attaching' in proto) proto.$hooks |= Hooks.hasAttaching;
  if ('attached' in proto) {
    proto.$hooks |= Hooks.hasAttached;
    proto.$nextAttached = null;
  }
  if ('detaching' in proto) proto.$hooks |= Hooks.hasDetaching;
  if ('caching' in proto) proto.$hooks |= Hooks.hasCaching;
  if ('detached' in proto) {
    proto.$hooks |= Hooks.hasDetached;
    proto.$nextDetached = null;
  }

  return <ICustomElementType & T>Type;
}

