import { IScope } from '../binding/binding-context';
import { IBindScope } from '../binding/observation';
import { IRenderLocation } from '../dom';
import { IAttach } from './lifecycle';
import { IRenderable } from './renderable';
export declare type RenderCallback = (view: IView) => void;
export interface IView extends IBindScope, IRenderable, IAttach {
    readonly factory: IViewFactory;
    mount(location: IRenderLocation): void;
    release(): boolean;
    lockScope(scope: IScope): void;
}
export interface IViewFactory {
    readonly name: string;
    readonly isCaching: boolean;
    setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
    create(): IView;
}
export declare const IViewFactory: import("@aurelia/kernel/dist/di").InterfaceSymbol<IViewFactory>;
//# sourceMappingURL=view.d.ts.map