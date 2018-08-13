import { DI } from '@aurelia/kernel';
import { IBindScope } from '../binding/observation';
import { ICustomElement } from './custom-element';
import { IAttach } from './lifecycle';
import { IRenderable } from './renderable';
import { IViewSlot } from './view-slot';

export type RenderCallback = (view: IView) => void;

export enum MotionDirection {
  enter = 'enter',
  leave = 'leave'
}

export interface IView extends IBindScope, IRenderable, IAttach {
  readonly factory: IViewFactory;

  parent: IViewSlot;
  onRender: RenderCallback;
  renderState: any;

  animate(direction: MotionDirection): void | Promise<boolean>;
  tryReturnToCache(): boolean;
}

export type ViewWithCentralComponent = IView & { component: ICustomElement };

export interface IViewFactory {
  readonly name: string;
  readonly isCaching: boolean;
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
  create(): IView;
}

export const IViewFactory = DI.createInterface<IViewFactory>().noDefault();
