import { type Constructable } from '@aurelia/kernel';
import { IExpressionParser } from '@aurelia/expression-parser';
import { IObserverLocator } from '@aurelia/runtime';
import { IEventModifier } from './binding/listener-binding';
import { CustomElementDefinition } from './resources/custom-element';
import { CustomAttributeDefinition } from './resources/custom-attribute';
import { INode } from './dom.node';
import { ICustomElementController, IController } from './templating/controller';
import { IPlatform } from './platform';
import { IRendering } from './templating/rendering';
import type { IHydratableController } from './templating/controller';
import { AttributeBindingInstruction, HydrateAttributeInstruction, HydrateElementInstruction, HydrateLetElementInstruction, HydrateTemplateController, IInstruction, ITemplateCompiler, InterpolationInstruction, IteratorBindingInstruction, ListenerBindingInstruction, PropertyBindingInstruction, RefBindingInstruction, SetAttributeInstruction, SetClassAttributeInstruction, SetPropertyInstruction, SetStyleAttributeInstruction, SpreadTransferedBindingInstruction, SpreadValueBindingInstruction, StylePropertyBindingInstruction, TextBindingInstruction } from '@aurelia/template-compiler';
/**
 * An interface describing an instruction renderer
 * its target property will be used to match instruction types dynamically at render time
 */
export interface IRenderer {
    target: string;
    render(
    /**
     * The controller that is current invoking this renderer
     */
    renderingCtrl: IHydratableController, target: unknown, instruction: IInstruction, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
}
export declare const IRenderer: import("@aurelia/kernel").InterfaceSymbol<IRenderer>;
export declare function renderer<T extends IRenderer, C extends Constructable<T>>(target: C, context: ClassDecoratorContext): C;
export declare const SetPropertyRenderer: {
    new (): {
        readonly target: "re";
        render(renderingCtrl: IHydratableController, target: IController, instruction: SetPropertyInstruction): void;
    };
};
export declare const CustomElementRenderer: {
    new (): {
        /** @internal */ readonly _rendering: IRendering;
        readonly target: "ra";
        render(renderingCtrl: IHydratableController, target: HTMLElement, instruction: HydrateElementInstruction<Record<PropertyKey, unknown>, CustomElementDefinition>, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
export declare const CustomAttributeRenderer: {
    new (): {
        /** @internal */ readonly _rendering: IRendering;
        readonly target: "rb";
        render(renderingCtrl: IHydratableController, target: HTMLElement, instruction: HydrateAttributeInstruction<CustomAttributeDefinition>, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
export declare const TemplateControllerRenderer: {
    new (): {
        /** @internal */ readonly _rendering: IRendering;
        readonly target: "rc";
        render(renderingCtrl: IHydratableController, target: HTMLElement, instruction: HydrateTemplateController<CustomAttributeDefinition>, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
export declare const LetElementRenderer: {
    new (): {
        readonly target: "rd";
        render(renderingCtrl: IHydratableController, target: Node & ChildNode, instruction: HydrateLetElementInstruction, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
export declare const RefBindingRenderer: {
    new (): {
        readonly target: "rj";
        render(renderingCtrl: IHydratableController, target: INode, instruction: RefBindingInstruction, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
export declare const InterpolationBindingRenderer: {
    new (): {
        readonly target: "rf";
        render(renderingCtrl: IHydratableController, target: IController | HTMLElement, instruction: InterpolationInstruction, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
export declare const PropertyBindingRenderer: {
    new (): {
        readonly target: "rg";
        render(renderingCtrl: IHydratableController, target: IController, instruction: PropertyBindingInstruction, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
export declare const IteratorBindingRenderer: {
    new (): {
        readonly target: "rk";
        render(renderingCtrl: IHydratableController, target: IController, instruction: IteratorBindingInstruction, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
export declare const TextBindingRenderer: {
    new (): {
        readonly target: "ha";
        render(renderingCtrl: IHydratableController, target: ChildNode, instruction: TextBindingInstruction, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
/**
 * An interface describing configuration for listener bindings
 */
export interface IListenerBindingOptions {
    /**
     * Indicate whether listener should by default call preventDefault on all the events
     */
    prevent: boolean;
    /**
     * The error handler for listener bindings, by default, it will dispatch an event `au-event-error` on the window object
     * and if the event is not prevented, it will throw the errors caught by the listener bindings
     */
    onError: (event: Event, error: unknown) => void;
}
export declare const IListenerBindingOptions: import("@aurelia/kernel").InterfaceSymbol<IListenerBindingOptions>;
export declare const ListenerBindingRenderer: {
    new (): {
        readonly target: "hb";
        /** @internal */
        readonly _modifierHandler: IEventModifier;
        /** @internal */
        readonly _defaultOptions: IListenerBindingOptions;
        render(renderingCtrl: IHydratableController, target: HTMLElement, instruction: ListenerBindingInstruction, platform: IPlatform, exprParser: IExpressionParser): void;
    };
};
export declare const SetAttributeRenderer: {
    new (): {
        readonly target: "he";
        render(_: IHydratableController, target: HTMLElement, instruction: SetAttributeInstruction): void;
    };
};
export declare const SetClassAttributeRenderer: {
    new (): {
        readonly target: "hf";
        render(_: IHydratableController, target: HTMLElement, instruction: SetClassAttributeInstruction): void;
    };
};
export declare const SetStyleAttributeRenderer: {
    new (): {
        readonly target: "hg";
        render(_: IHydratableController, target: HTMLElement, instruction: SetStyleAttributeInstruction): void;
    };
};
export declare const StylePropertyBindingRenderer: {
    new (): {
        readonly target: "hd";
        render(renderingCtrl: IHydratableController, target: HTMLElement, instruction: StylePropertyBindingInstruction, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
export declare const AttributeBindingRenderer: {
    new (): {
        readonly target: "hc";
        render(renderingCtrl: IHydratableController, target: HTMLElement, instruction: AttributeBindingInstruction, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
export declare const SpreadRenderer: {
    new (): {
        /** @internal */ readonly _compiler: ITemplateCompiler;
        /** @internal */ readonly _rendering: IRendering;
        readonly target: "hs";
        render(renderingCtrl: IHydratableController, target: HTMLElement, instruction: SpreadTransferedBindingInstruction, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
export declare const SpreadValueRenderer: {
    new (): {
        readonly target: "svb";
        render(renderingCtrl: IHydratableController, target: ICustomElementController, instruction: SpreadValueBindingInstruction, platform: IPlatform, exprParser: IExpressionParser, observerLocator: IObserverLocator): void;
    };
};
//# sourceMappingURL=renderer.d.ts.map