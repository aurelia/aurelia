export interface IBindSelf {
  bind(): void;
  unbind(): void;
}
export interface IAttach {
  attach(): void;
  detach(): void;
}

export interface IApplyToTarget {
  applyTo(target: Element): this;
}

export interface IComponent extends IBindSelf, IAttach, IApplyToTarget {

}
