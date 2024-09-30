import { IViewFactory } from '../../templating/view';
import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, IHydratableController } from '../../templating/controller';
import type { IInstruction } from '@aurelia/template-compiler';
import type { INode } from '../../dom';
import { CustomAttributeStaticAuDefinition } from '../custom-attribute';
export declare class If implements ICustomAttributeViewModel {
    static readonly $au: CustomAttributeStaticAuDefinition;
    elseFactory?: IViewFactory;
    elseView?: ISyntheticView;
    ifView?: ISyntheticView;
    view?: ISyntheticView;
    readonly $controller: ICustomAttributeController<this>;
    value: unknown;
    /**
     * `false` to always dispose the existing `view` whenever the value of if changes to false
     */
    cache: boolean;
    private pending;
    attaching(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void>;
    detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    valueChanged(newValue: unknown, oldValue: unknown): void | Promise<void>;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
export declare class Else implements ICustomAttributeViewModel {
    static readonly $au: CustomAttributeStaticAuDefinition;
    link(controller: IHydratableController, _childController: ICustomAttributeController, _target: INode, _instruction: IInstruction): void;
}
//# sourceMappingURL=if.d.ts.map