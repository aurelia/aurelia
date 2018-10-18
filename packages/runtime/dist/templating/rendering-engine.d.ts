import { IContainer, Immutable } from '@aurelia/kernel';
import { IChangeSet } from '../binding/change-set';
import { IEventManager } from '../binding/event-manager';
import { IExpressionParser } from '../binding/expression-parser';
import { IObserverLocator } from '../binding/observer-locator';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import { ICustomElement, ICustomElementType } from './custom-element';
import { ITemplateDefinition, TemplateDefinition } from './instructions';
import { IRenderContext } from './render-context';
import { IRenderer } from './renderer';
import { ITemplate } from './template';
import { ITemplateCompiler } from './template-compiler';
import { IViewFactory } from './view';
export interface IRenderingEngine {
    getElementTemplate(definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate;
    getViewFactory(source: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory;
    applyRuntimeBehavior(type: ICustomAttributeType, instance: ICustomAttribute): void;
    applyRuntimeBehavior(type: ICustomElementType, instance: ICustomElement): void;
    createRenderer(context: IRenderContext): IRenderer;
}
export declare const IRenderingEngine: import("@aurelia/kernel/dist/di").InterfaceSymbol<IRenderingEngine>;
export declare class RenderingEngine implements IRenderingEngine {
    private container;
    private changeSet;
    private observerLocator;
    private eventManager;
    private parser;
    private templateLookup;
    private factoryLookup;
    private behaviorLookup;
    private compilers;
    constructor(container: IContainer, changeSet: IChangeSet, observerLocator: IObserverLocator, eventManager: IEventManager, parser: IExpressionParser, templateCompilers: ITemplateCompiler[]);
    getElementTemplate(definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate;
    getViewFactory(definition: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory;
    applyRuntimeBehavior(type: ICustomAttributeType | ICustomElementType, instance: ICustomAttribute | ICustomElement): void;
    createRenderer(context: IRenderContext): IRenderer;
    private factoryFromSource;
    private templateFromSource;
}
//# sourceMappingURL=rendering-engine.d.ts.map