import { IRenderLocation } from '../dom';
import { IAttach, IBindScope, IMountable } from '../lifecycle';
import { IScope } from '../observation';
import { IRenderable } from './rendering-engine';
export declare type RenderCallback = (view: IView) => void;
export interface IView extends IBindScope, IRenderable, IAttach, IMountable {
    readonly cache: IViewCache;
    hold(location: IRenderLocation): void;
    release(): boolean;
    lockScope(scope: IScope): void;
}
export interface IViewFactory extends IViewCache {
    readonly name: string;
    create(): IView;
}
export interface IViewCache {
    readonly isCaching: boolean;
    setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
    canReturnToCache(view: IView): boolean;
    tryReturnToCache(view: IView): boolean;
}
export declare const IViewFactory: import("@aurelia/kernel/dist/di").InterfaceSymbol<IViewFactory>;
//# sourceMappingURL=view.d.ts.map