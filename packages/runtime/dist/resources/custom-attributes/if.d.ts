import { IHydrateTemplateController } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, IRenderableController } from '../../lifecycle';
import { ICompiledRenderContext } from '../../templating/render-context';
export declare class If<T extends INode = INode> implements ICustomAttributeViewModel<T> {
    private readonly ifFactory;
    private readonly location;
    readonly id: number;
    elseFactory?: IViewFactory<T>;
    elseView?: ISyntheticView<T>;
    ifView?: ISyntheticView<T>;
    view?: ISyntheticView<T>;
    readonly $controller: ICustomAttributeController<T, this>;
    value: boolean;
    constructor(ifFactory: IViewFactory<T>, location: IRenderLocation<T>);
    afterAttach(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    afterUnbind(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    valueChanged(newValue: boolean, oldValue: boolean, flags: LifecycleFlags): void;
    onCancel(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void;
    dispose(): void;
    accept(visitor: ControllerVisitor<T>): void | true;
}
export declare class Else<T extends INode = INode> {
    private readonly factory;
    readonly id: number;
    constructor(factory: IViewFactory<T>);
    link(flags: LifecycleFlags, parentContext: ICompiledRenderContext, controller: IRenderableController, _childController: ICustomAttributeController, _target: INode, _instruction: IHydrateTemplateController): void;
}
//# sourceMappingURL=if.d.ts.map