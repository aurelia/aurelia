import { IBindScope } from "../binding/observation";
import { AttachLifecycle, DetachLifecycle } from "./lifecycle";
import { IViewOwner } from "./view";
import { IElementComponent } from "./component";
import { DI } from "../di";

export type RenderCallback = (visual: IVisual, owner: any, index?: number) => void;

export enum MotionDirection {
  enter = 'enter',
  leave = 'leave'
}

export interface IVisual extends IBindScope, IViewOwner { 
  readonly factory: IVisualFactory;
  animate(direction: MotionDirection): void | Promise<boolean>;
  tryReturnToCache(): boolean;
  $attach(lifecycle: AttachLifecycle | null, render: RenderCallback, owner: any, index?: number);
  $detach(lifecycle?: DetachLifecycle);
}

export type VisualWithCentralComponent = IVisual & { component: IElementComponent };

export interface IVisualFactory {
  readonly name: string;
  readonly isCaching: boolean;
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
  create(): IVisual;
}

export const IVisualFactory = DI.createInterface<IVisualFactory>();
