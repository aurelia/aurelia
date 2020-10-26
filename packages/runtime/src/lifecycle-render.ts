import { IServiceLocator, PLATFORM, Profiler, Tracer, Writable } from '@aurelia/kernel';
import { IElementHydrationOptions, TemplateDefinition } from '../definitions';
import { IDOM, INode } from '../dom';
import { Hooks, LifecycleFlags } from '../flags';
import { Scope } from '../observation/binding-context';
import { ProxyObserver } from '../observation/proxy-observer';
import { IRenderingEngine, ITemplate } from '../rendering-engine';
import { ICustomAttribute, ICustomAttributeType } from '../resources/custom-attribute';
import { ICustomElement, ICustomElementType, IProjectorLocator } from '../resources/custom-element';

const slice = Array.prototype.slice;

const { enter, leave } = Profiler.createTimer('RenderLifecycle');

export interface IElementTemplateProvider {
  getElementTemplate(renderingEngine: IRenderingEngine, customElementType: ICustomElementType | null, parentContext: IServiceLocator): ITemplate;
}

export interface ILifecycleRender {
  /**
   * Only applies to `@customElement`. This hook is not invoked for `@customAttribute`s
   *
   * Called during `$hydrate`, after `this.$scope` and `this.$projector` are set.
   *
   * If this hook is implemented, it will be used instead of `renderingEngine.getElementTemplate`.
   * This allows you to completely override the default rendering behavior.
   *
   * It is the responsibility of the implementer to:
   * - Populate `this.$bindables` with any Bindings, child Views, custom elements and custom attributes
   * - Populate `this.$attachables` with any child Views, custom elements and custom attributes
   * - Populate `this.$nodes` with the nodes that need to be appended to the host
   * - Populate `this.$context` with the RenderContext / Container scoped to this instance
   *
   * @param host The DOM node that declares this custom element
   * @param parts Replaceable parts, if any
   *
   * @returns Either an implementation of `IElementTemplateProvider`, or void
   *
   * @description
   * This is the first "hydrate" lifecycle hook. It happens only once per instance (contrary to bind/attach
   * which can happen many times per instance), though it can happen many times per type (once for each instance)
   */
  render?(flags: LifecycleFlags, host: INode, parts: Record<string, TemplateDefinition>, parentContext: IServiceLocator): IElementTemplateProvider | void;
}

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $hydrateAttribute(this: Writable<ICustomAttribute>, flags: LifecycleFlags, parentContext: IServiceLocator): void {
  if (Profiler.enabled) { enter(); }
  const Type = this.constructor as ICustomAttributeType;
  if (Tracer.enabled) { Tracer.enter(Type.description.name, '$hydrate', slice.call(arguments)); }
  const description = Type.description;

  flags |= description.strategy;
  const renderingEngine = parentContext.get(IRenderingEngine);

  let bindingContext: typeof this;
  if (flags & LifecycleFlags.proxyStrategy) {
    bindingContext = ProxyObserver.getOrCreate(this).proxy;
  } else {
    bindingContext = this;
  }

  renderingEngine.applyRuntimeBehavior(flags, Type, this);

  if (this.$hooks & Hooks.hasCreated) {
    bindingContext.created(flags);
  }
  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $hydrateElement(this: Writable<ICustomElement>, flags: LifecycleFlags, parentContext: IServiceLocator, host: INode, options: IElementHydrationOptions = PLATFORM.emptyObject): void {
  if (Profiler.enabled) { enter(); }
  const Type = this.constructor as ICustomElementType;
  if (Tracer.enabled) { Tracer.enter(Type.description.name, '$hydrate', slice.call(arguments)); }
  const description = Type.description;

  flags |= description.strategy;
  const projectorLocator = parentContext.get(IProjectorLocator);
  const renderingEngine = parentContext.get(IRenderingEngine);
  const dom = parentContext.get(IDOM);

  let bindingContext: typeof this;
  if (flags & LifecycleFlags.proxyStrategy) {
    bindingContext = ProxyObserver.getOrCreate(this).proxy;
  } else {
    bindingContext = this;
  }

  this.$scope = Scope.create(flags, bindingContext, null);
  this.$host = host;
  this.$projector = projectorLocator.getElementProjector(dom, this, host, description);

  renderingEngine.applyRuntimeBehavior(flags, Type, this);

  if (this.$hooks & Hooks.hasRender) {
    const result = this.render(flags, host, options.parts, parentContext);

    if (result && 'getElementTemplate' in result) {
      const template = result.getElementTemplate(renderingEngine, Type, parentContext);
      template.render(this, host, options.parts);
    }
  } else {
    const template = renderingEngine.getElementTemplate(dom, description, parentContext, Type);
    template.render(this, host, options.parts);
  }

  if (this.$hooks & Hooks.hasCreated) {
    bindingContext.created(flags);
  }
  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }
}
