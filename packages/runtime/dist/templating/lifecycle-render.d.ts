import { TemplateDefinition } from '../definitions';
import { INode } from '../dom';
import { IRenderingEngine, ITemplate } from '../rendering-engine';
import { ICustomElementType } from '../resources/custom-element';
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
//# sourceMappingURL=lifecycle-render.d.ts.map