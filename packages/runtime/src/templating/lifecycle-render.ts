import { PLATFORM, Profiler, Tracer, Writable } from '@aurelia/kernel';
import { IElementHydrationOptions, TemplateDefinition } from '../definitions';
import { IDOM, INode } from '../dom';
import { Hooks, LifecycleFlags } from '../flags';
import { IRenderContext } from '../lifecycle';
import { Scope } from '../observation/binding-context';
import { ProxyObserver } from '../observation/proxy-observer';
import { IRenderingEngine, ITemplate } from '../rendering-engine';
import { ICustomAttribute, ICustomAttributeType } from '../resources/custom-attribute';
import { ICustomElement, ICustomElementType, IProjectorLocator } from '../resources/custom-element';

const slice = Array.prototype.slice;

const { enter, leave } = Profiler.createTimer('RenderLifecycle');

export interface IElementTemplateProvider {
  getElementTemplate(renderingEngine: IRenderingEngine, customElementType: ICustomElementType | null, parentContext: IRenderContext | null): ITemplate;
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
  render?(flags: LifecycleFlags, host: INode, parts: Record<string, TemplateDefinition>, parentContext: IRenderContext | null): IElementTemplateProvider | void;
}

/** @internal */
export function $hydrateAttribute(
  this: Writable<ICustomAttribute>,
  flags: LifecycleFlags,
  renderingEngine: IRenderingEngine
): void {
  if (Tracer.enabled) { Tracer.enter(`${this['constructor'].name}.$hydrateAttribute`, slice.call(arguments)); }
  if (Profiler.enabled) { enter(); }
  const Type = this.constructor as ICustomAttributeType;

  renderingEngine.applyRuntimeBehavior(flags, Type, this);

  if (this.$hooks & Hooks.hasCreated) {
    this.created(flags);
  }
  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $hydrateElement(
  this: Writable<ICustomElement>,
  flags: LifecycleFlags,
  dom: IDOM,
  projectorLocator: IProjectorLocator,
  renderingEngine: IRenderingEngine,
  host: INode,
  parentContext: IRenderContext | null,
  options: IElementHydrationOptions = PLATFORM.emptyObject
): void {
  if (Tracer.enabled) { Tracer.enter(`${this['constructor'].name}.$hydrateElement`, slice.call(arguments)); }
  if (Profiler.enabled) { enter(); }
  const Type = this.constructor as ICustomElementType;
  const description = Type.description;

  let bindingContext: typeof this;
  if (flags & LifecycleFlags.useProxies) {
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
    this.created(flags);
  }
  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }
}
