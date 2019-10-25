(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./lifecycle", "./lifecycle-task", "./observation/observer-locator", "./renderer", "./resources/binding-behaviors/binding-mode", "./resources/binding-behaviors/debounce", "./resources/binding-behaviors/signals", "./resources/binding-behaviors/throttle", "./resources/custom-attributes/flags", "./resources/custom-attributes/if", "./resources/custom-attributes/repeat", "./resources/custom-attributes/replaceable", "./resources/custom-attributes/with", "./resources/value-converters/sanitize", "./resources/value-converters/view", "./templating/view", "./scheduler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const lifecycle_1 = require("./lifecycle");
    const lifecycle_task_1 = require("./lifecycle-task");
    const observer_locator_1 = require("./observation/observer-locator");
    const renderer_1 = require("./renderer");
    const binding_mode_1 = require("./resources/binding-behaviors/binding-mode");
    const debounce_1 = require("./resources/binding-behaviors/debounce");
    const signals_1 = require("./resources/binding-behaviors/signals");
    const throttle_1 = require("./resources/binding-behaviors/throttle");
    const flags_1 = require("./resources/custom-attributes/flags");
    const if_1 = require("./resources/custom-attributes/if");
    const repeat_1 = require("./resources/custom-attributes/repeat");
    const replaceable_1 = require("./resources/custom-attributes/replaceable");
    const with_1 = require("./resources/custom-attributes/with");
    const sanitize_1 = require("./resources/value-converters/sanitize");
    const view_1 = require("./resources/value-converters/view");
    const view_2 = require("./templating/view");
    const scheduler_1 = require("./scheduler");
    exports.IObserverLocatorRegistration = observer_locator_1.ObserverLocator;
    exports.ILifecycleRegistration = lifecycle_1.Lifecycle;
    exports.IRendererRegistration = renderer_1.Renderer;
    exports.IStartTaskManagerRegistration = lifecycle_task_1.StartTaskManager;
    exports.IViewLocatorRegistration = view_2.ViewLocator;
    exports.IClockRegistration = scheduler_1.Clock;
    /**
     * Default implementations for the following interfaces:
     * - `IObserverLocator`
     * - `ILifecycle`
     * - `IRenderer`
     * - `IStartTaskManager`
     * - `IViewLocator`
     * - `IClockRegistration`
     * - `ISchedulerRegistration`
     */
    exports.DefaultComponents = [
        exports.IObserverLocatorRegistration,
        exports.ILifecycleRegistration,
        exports.IRendererRegistration,
        exports.IStartTaskManagerRegistration,
        exports.IViewLocatorRegistration,
        exports.IClockRegistration,
    ];
    exports.FrequentMutationsRegistration = flags_1.FrequentMutations;
    exports.InfrequentMutationsRegistration = flags_1.InfrequentMutations;
    exports.ObserveShallowRegistration = flags_1.ObserveShallow;
    exports.IfRegistration = if_1.If;
    exports.ElseRegistration = if_1.Else;
    exports.RepeatRegistration = repeat_1.Repeat;
    exports.ReplaceableRegistration = replaceable_1.Replaceable;
    exports.WithRegistration = with_1.With;
    exports.SanitizeValueConverterRegistration = sanitize_1.SanitizeValueConverter;
    exports.ViewValueConverterRegistration = view_1.ViewValueConverter;
    exports.DebounceBindingBehaviorRegistration = debounce_1.DebounceBindingBehavior;
    exports.OneTimeBindingBehaviorRegistration = binding_mode_1.OneTimeBindingBehavior;
    exports.ToViewBindingBehaviorRegistration = binding_mode_1.ToViewBindingBehavior;
    exports.FromViewBindingBehaviorRegistration = binding_mode_1.FromViewBindingBehavior;
    exports.SignalBindingBehaviorRegistration = signals_1.SignalBindingBehavior;
    exports.ThrottleBindingBehaviorRegistration = throttle_1.ThrottleBindingBehavior;
    exports.TwoWayBindingBehaviorRegistration = binding_mode_1.TwoWayBindingBehavior;
    /**
     * Default resources:
     * - Template controllers (`if`/`else`, `repeat`, `replaceable`, `with`)
     * - Value Converters (`sanitize`)
     * - Binding Behaviors (`oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`)
     */
    exports.DefaultResources = [
        exports.FrequentMutationsRegistration,
        exports.InfrequentMutationsRegistration,
        exports.ObserveShallowRegistration,
        exports.IfRegistration,
        exports.ElseRegistration,
        exports.RepeatRegistration,
        exports.ReplaceableRegistration,
        exports.WithRegistration,
        exports.SanitizeValueConverterRegistration,
        exports.ViewValueConverterRegistration,
        exports.DebounceBindingBehaviorRegistration,
        exports.OneTimeBindingBehaviorRegistration,
        exports.ToViewBindingBehaviorRegistration,
        exports.FromViewBindingBehaviorRegistration,
        exports.SignalBindingBehaviorRegistration,
        exports.ThrottleBindingBehaviorRegistration,
        exports.TwoWayBindingBehaviorRegistration
    ];
    exports.CallBindingRendererRegistration = renderer_1.CallBindingRenderer;
    exports.CustomAttributeRendererRegistration = renderer_1.CustomAttributeRenderer;
    exports.CustomElementRendererRegistration = renderer_1.CustomElementRenderer;
    exports.InterpolationBindingRendererRegistration = renderer_1.InterpolationBindingRenderer;
    exports.IteratorBindingRendererRegistration = renderer_1.IteratorBindingRenderer;
    exports.LetElementRendererRegistration = renderer_1.LetElementRenderer;
    exports.PropertyBindingRendererRegistration = renderer_1.PropertyBindingRenderer;
    exports.RefBindingRendererRegistration = renderer_1.RefBindingRenderer;
    exports.SetPropertyRendererRegistration = renderer_1.SetPropertyRenderer;
    exports.TemplateControllerRendererRegistration = renderer_1.TemplateControllerRenderer;
    /**
     * Default renderers for:
     * - PropertyBinding: `bind`, `one-time`, `to-view`, `from-view`, `two-way`
     * - IteratorBinding: `for`
     * - CallBinding: `call`
     * - RefBinding: `ref`
     * - InterpolationBinding: `${}`
     * - SetProperty
     * - `customElement` hydration
     * - `customAttribute` hydration
     * - `templateController` hydration
     * - `let` element hydration
     */
    exports.DefaultRenderers = [
        exports.PropertyBindingRendererRegistration,
        exports.IteratorBindingRendererRegistration,
        exports.CallBindingRendererRegistration,
        exports.RefBindingRendererRegistration,
        exports.InterpolationBindingRendererRegistration,
        exports.SetPropertyRendererRegistration,
        exports.CustomElementRendererRegistration,
        exports.CustomAttributeRendererRegistration,
        exports.TemplateControllerRendererRegistration,
        exports.LetElementRendererRegistration
    ];
    /**
     * A DI configuration object containing environment/runtime-agnostic registrations:
     * - `DefaultComponents`
     * - `DefaultResources`
     * - `DefaultRenderers`
     */
    exports.RuntimeConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return container.register(...exports.DefaultComponents, ...exports.DefaultResources, ...exports.DefaultRenderers);
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            return this.register(kernel_1.DI.createContainer());
        }
    };
});
//# sourceMappingURL=configuration.js.map