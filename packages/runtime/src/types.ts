export interface INodeLike {
  firstChild: INode | null;
  lastChild: INode | null;
  childNodes: INode[];
}
export interface INode extends INodeLike {
  parentNode: INode | null;
  nextSibling: INode | null;
  previousSibling: INode | null;
}
export interface IView extends INodeLike {
  childNodes: INode[];
  findTargets(): INode[] | INode[];
  insertBefore(refNode: INode): void;
  appendTo(parent: INode): void;
  remove(): void;
}

export interface IOverrideContext {
  parentOverrideContext: IOverrideContext;
  bindingContext: any;
}
export interface IScope {
  bindingContext: any;
  overrideContext: IOverrideContext;
}
export interface IBindScope {
  $bind(flags: number, scope: IScope): void;
  $unbind(flags: number): void;
}
export interface IAttach {
  $attach(encapsulationSource: INode, lifecycle?: any): void;
  $detach(lifecycle?: any): void;
}
export interface IBindSelf {
  $bind(flags: number): void;
  $unbind(flags: number): void;
}

export interface IVisual extends IBindScope, IViewOwner, IAttach {
  factory: IVisualFactory;
  parent: IRenderSlot;
  onRender: any;
  renderState: any;
  animate(direction: string): void | Promise<boolean>;
  tryReturnToCache(): boolean;
}
export interface IVisualFactory {
  name: string;
  isCaching: boolean;
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
  create(): IVisual;
}
export interface IViewOwner {
  $context: any;
  $view: IView;
  $scope: IScope;
  $isBound: boolean;
  $bindable: IBindScope[];
  $attachable: IAttach[];
}
export interface IRenderSlot extends IAttach {
  children: IVisual[];
}
export interface IViewProjector {
  children:  INode[];
  onChildrenChanged(callback: () => void): void;
  provideEncapsulationSource(parentEncapsulationSource: INode): INode;
  project(view: IView): void;
}
export interface ICustomElement extends IBindSelf, IAttach, IViewOwner {
  $projector: IViewProjector;
  $isAttached: boolean;
  $hydrate(renderingEngine: any, host: INode, options?: any): void;
}
export interface ICustomAttribute extends IBindScope, IAttach {
  $isBound: boolean;
  $isAttached: boolean;
  $scope: IScope;
  $hydrate(renderingEngine: any): any;
}

