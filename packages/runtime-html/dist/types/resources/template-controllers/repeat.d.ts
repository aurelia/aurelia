import { ForOfStatement, type IsBindingBehavior } from '@aurelia/expression-parser';
import { type Collection, type IndexMap } from '@aurelia/runtime';
import { IExpressionParser } from '@aurelia/expression-parser';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../templating/view';
import { CustomAttributeStaticAuDefinition } from '../custom-attribute';
import { HydrateTemplateController } from '@aurelia/template-compiler';
import type { ISyntheticView, ICustomAttributeController, IHydratableController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../templating/controller';
type Items<C extends Collection = unknown[]> = C | undefined;
export declare class Repeat<C extends Collection = unknown[]> implements ICustomAttributeViewModel {
    static readonly $au: CustomAttributeStaticAuDefinition;
    views: ISyntheticView[];
    private _oldViews;
    forOf: ForOfStatement;
    local: string;
    readonly $controller: ICustomAttributeController<this>;
    items: Items<C>;
    key: null | string | IsBindingBehavior;
    constructor(instruction: HydrateTemplateController, parser: IExpressionParser, location: IRenderLocation, parent: IHydratableController, factory: IViewFactory);
    binding(_initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    attaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    unbinding(_initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    itemsChanged(): void;
    handleCollectionChange(collection: Collection, indexMap: IndexMap | undefined): void;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
export {};
//# sourceMappingURL=repeat.d.ts.map