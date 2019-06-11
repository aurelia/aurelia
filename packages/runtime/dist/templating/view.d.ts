import { INode } from '../dom';
import { LifecycleFlags } from '../flags';
import { IController, ILifecycle, IViewFactory } from '../lifecycle';
import { ITemplate } from '../rendering-engine';
import { TemplatePartDefinitions, ITemplateDefinition } from '../definitions';
export declare class ViewFactory<T extends INode = INode> implements IViewFactory<T> {
    static maxCacheSize: number;
    isCaching: boolean;
    name: string;
    parts: TemplatePartDefinitions;
    private cache;
    private cacheSize;
    private readonly lifecycle;
    private readonly template;
    constructor(name: string, template: ITemplate<T>, lifecycle: ILifecycle);
    setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
    canReturnToCache(controller: IController<T>): boolean;
    tryReturnToCache(controller: IController<T>): boolean;
    create(flags?: LifecycleFlags): IController<T>;
    addParts(parts: Record<string, ITemplateDefinition>): void;
}
//# sourceMappingURL=view.d.ts.map