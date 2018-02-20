export interface IBindSelf {
  bind();
  unbind();
}
export interface IAttach {
  attach();
  detach();
}

export interface IApplyToTarget {
  applyTo(target: Element);
}

export interface IComponent extends IBindSelf, IAttach, IApplyToTarget  {
  
}
