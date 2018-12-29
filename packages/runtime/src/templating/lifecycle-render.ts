import { PLATFORM, Tracer, Writable } from '@aurelia/kernel';
import { IElementHydrationOptions, TemplateDefinition } from '../definitions';
import { IDOM, INode } from '../dom';
import { Hooks } from '../lifecycle';
import { Scope } from '../observation/binding-context';
import { IRenderingEngine, ITemplate } from '../rendering-engine';
import { ICustomAttribute, ICustomAttributeType } from '../resources/custom-attribute';
import { ICustomElement, ICustomElementType, IProjectorLocator } from '../resources/custom-element';

const slice = Array.prototype.slice;

export interface IElementTemplateProvider {
  getElementTemplate(renderingEngine: IRenderingEngine, customElementType: ICustomElementType): ITemplate;
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
  render?(host: INode, parts: Record<string, TemplateDefinition>): IElementTemplateProvider | void;
}

/** @internal */
export function $hydrateAttribute(this: Writable<ICustomAttribute>, renderingEngine: IRenderingEngine): void {
  if (Tracer.enabled) { Tracer.enter(`${this['constructor'].name}.$hydrateAttribute`, slice.call(arguments)); }
  const Type = this.constructor as ICustomAttributeType;

  renderingEngine.applyRuntimeBehavior(Type, this);

  if (this.$hooks & Hooks.hasCreated) {
    this.created();
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $hydrateElement(this: Writable<ICustomElement>, dom: IDOM, projectorLocator: IProjectorLocator, renderingEngine: IRenderingEngine, host: INode, options: IElementHydrationOptions = PLATFORM.emptyObject): void {
  if (Tracer.enabled) { Tracer.enter(`${this['constructor'].name}.$hydrateElement`, slice.call(arguments)); }
  const Type = this.constructor as ICustomElementType;
  const description = Type.description;

  this.$scope = Scope.create(this, null);
  this.$host = host;
  this.$projector = projectorLocator.getElementProjector(dom, this, host, description);

  renderingEngine.applyRuntimeBehavior(Type, this);

  if (this.$hooks & Hooks.hasRender) {
    const result = this.render(host, options.parts);

    if (result && 'getElementTemplate' in result) {
      const template = result.getElementTemplate(renderingEngine, Type);
      template.render(this, host, options.parts);
    }
  } else {
    const template = renderingEngine.getElementTemplate(dom, description, Type);
    template.render(this, host, options.parts);
  }

  if (this.$hooks & Hooks.hasCreated) {
    this.created();
  }
  if (Tracer.enabled) { Tracer.leave(); }
}
