import { DI } from '@aurelia/kernel';
import { INode } from '../dom';
import { AttachLifecycle, DetachLifecycle, IAttach } from './lifecycle';
import { IEmulatedShadowSlot, ShadowDOMEmulation } from './shadow-dom';
import { IContentView } from './view';
import { IVisual, MotionDirection } from './visual';

/*@internal*/
export function appendVisualToContainer(visual: IVisual) {
  const parent = visual.parent as RenderSlotImplementation;
  visual.$view.appendTo(parent.anchor);
}

/*@internal*/
export function addVisual(visual: IVisual) {
  const parent = visual.parent as RenderSlotImplementation;
  visual.$view.insertBefore(parent.anchor);
}

/*@internal*/
export function project_addVisual(visual: IVisual) {
  const parent = visual.parent as RenderSlotImplementation;

  ShadowDOMEmulation.distributeView(visual.$view, parent.slots, parent);
  parent.logicalView.insertVisualChildBefore(visual, parent.anchor);

  visual.$view.remove = () => {
    ShadowDOMEmulation.undistributeView(visual.$view, parent.slots, parent);
    parent.logicalView.removeVisualChild(visual);
  };
}

/*@internal*/
export function insertVisual(visual: IVisual) {
  visual.$view.insertBefore(visual.parent.children[visual.renderState].$view.firstChild);
  visual.onRender = (visual.parent as RenderSlotImplementation).addVisualCore;
}

/*@internal*/
export function project_insertVisual(visual: IVisual) {
  const parent = visual.parent as RenderSlotImplementation;
  const index = visual.renderState;

  ShadowDOMEmulation.distributeView(visual.$view, parent.slots, parent, index);
  parent.logicalView.insertVisualChildBefore(visual, parent.children[index].$view.firstChild);
  visual.onRender = (visual.parent as RenderSlotImplementation).addVisualCore;

  visual.$view.remove = () => {
    ShadowDOMEmulation.undistributeView(visual.$view, parent.slots, parent);
    parent.logicalView.removeVisualChild(visual);
  };
}

export enum SwapOrder {
  before = 'before',
  with = 'with',
  after = 'after'
}

export const IRenderSlot = DI.createInterface<IRenderSlot>().noDefault();

/**
 * Represents a slot or location within the DOM to which views can be added and removed.
 * Manages the view lifecycle for its children.
 */
export interface IRenderSlot extends IAttach {
  children: ReadonlyArray<IVisual>;

 /**
  * Adds a view to the slot.
  * @param visual The view to add.
  * @return May return a promise if the view addition triggered an animation.
  */
  add(visual: IVisual): void | Promise<boolean>;

 /**
  * Inserts a view into the slot.
  * @param index The index to insert the view at.
  * @param visual The view to insert.
  * @return May return a promise if the view insertion triggered an animation.
  */
 insert(index: number, visual: IVisual): void | Promise<boolean>;

 /**
  * Moves a view across the slot.
  * @param sourceIndex The index the view is currently at.
  * @param targetIndex The index to insert the view at.
  */
  move(sourceIndex: number, targetIndex: number): void;

 /**
  * Replaces the existing view slot children with the new visual.
  * @param newVisual The visual to swap in.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if an animation was triggered.
  */
  swap(newVisual: IVisual, strategy: SwapOrder, returnToCache?: boolean, skipAnimation?: boolean): void | IVisual[] | Promise<any>;

 /**
  * Removes a view from the slot.
  * @param visual The view to remove.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removal triggered an animation.
  */
  remove(visual: IVisual, returnToCache?: boolean, skipAnimation?: boolean): IVisual | Promise<IVisual>;

 /**
  * Removes a view an a specified index from the slot.
  * @param index The index to remove the view at.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removal triggered an animation.
  */
  removeAt(index: number, returnToCache?: boolean, skipAnimation?: boolean): IVisual | Promise<IVisual>;

 /**
  * Removes all views from the slot.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removals triggered an animation.
  */
  removeAll(returnToCache?: boolean, skipAnimation?: boolean): void | IVisual[] | Promise<IVisual[]>;

 /**
  * Removes many views from the slot.
  * @param visualsToRemove The array of views to remove.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removal triggered an animation.
  */
  removeMany(visualsToRemove: IVisual[], returnToCache?: boolean, skipAnimation?: boolean): void | IVisual[] | Promise<IVisual[]>;

  /** @internal */ projectTo(slots: Record<string, IEmulatedShadowSlot>): void;
}

export const RenderSlot = {
  create(anchor: INode, anchorIsContainer: boolean): IRenderSlot {
    return new RenderSlotImplementation(anchor, anchorIsContainer);
  }
};

/*@internal*/
export class RenderSlotImplementation implements IRenderSlot {
  private $isAttached = false;
  public addVisualCore: (visual: IVisual) => void;
  private insertVisualCore: (visual: IVisual) => void;
  private encapsulationSource: INode = null;

  public children: IVisual[] = [];
  /** @internal */ public slots: Record<string, IEmulatedShadowSlot> = null;
  /** @internal */ public logicalView: IContentView = null;

  constructor(public anchor: INode, anchorIsContainer: boolean) {
    (anchor as any).$slot = this; // Usage: Shadow DOM Emulation
    (anchor as any).$isContentProjectionSource = false; // Usage: Shadow DOM Emulation

    this.addVisualCore = anchorIsContainer ? appendVisualToContainer : addVisual;
    this.insertVisualCore = insertVisual;
  }

  public add(visual: IVisual) {
    visual.parent = this;
    visual.onRender = this.addVisualCore;
    this.children.push(visual);

    if (this.$isAttached) {
      visual.$attach(this.encapsulationSource);
      return visual.animate(MotionDirection.enter);
    }
  }

  public insert(index: number, visual: IVisual) {
    const children = this.children;
    const length = children.length;

    if ((index === 0 && length === 0) || index >= length) {
      return this.add(visual);
    }

    visual.parent = this;
    children.splice(index, 0, visual);

    if (this.$isAttached) {
      visual.onRender = this.insertVisualCore;
      visual.renderState = index + 1; // We've already added this to the children, so we need to bump the index to get the right dom node.
      visual.$attach(this.encapsulationSource);
      return visual.animate(MotionDirection.enter);
    } else {
      visual.onRender = this.addVisualCore;
    }
  }

  public move(sourceIndex: number, targetIndex: number) {
    if (sourceIndex === targetIndex) {
      return;
    }

    const children = this.children;
    const visual = children[sourceIndex];

    children.splice(sourceIndex, 1);
    children.splice(targetIndex, 0, visual);

    if (this.$isAttached) {
      visual.$view.remove();
      visual.renderState = targetIndex;
      this.insertVisualCore(visual);
    }
  }

  public swap(newVisual: IVisual, strategy: SwapOrder = SwapOrder.after, returnToCache?: boolean, skipAnimation?: boolean) {
    const remove = () => this.removeAll(returnToCache, skipAnimation);
    const add = () => this.add(newVisual);

    switch(strategy) {
      case SwapOrder.before:
        const beforeAddResult = add();
        return (beforeAddResult instanceof Promise ? beforeAddResult.then(() => <any>remove()) : remove()); 
      case SwapOrder.with:
        const withAddResult = add();
        const withRemoveResult = remove();
        return (withAddResult instanceof Promise || withRemoveResult instanceof Promise)
          ? Promise.all(<any>[withAddResult, withRemoveResult]).then(x => x[1])
          : withRemoveResult;
      case SwapOrder.after:
        const afterRemoveResult = remove();
        return (afterRemoveResult instanceof Promise ? afterRemoveResult.then(() => <any>add()) : add());
    }
  }

  public remove(visual: IVisual, returnToCache?: boolean, skipAnimation?: boolean): IVisual | Promise<IVisual> {
    return this.removeAt(this.children.indexOf(visual), returnToCache, skipAnimation);
  }

  public removeAt(index: number, returnToCache?: boolean, skipAnimation?: boolean): IVisual | Promise<IVisual> {
    const visual = this.children[index];
    this.children.splice(index, 1);

    const detachAndReturn = () => {
      if (this.$isAttached) {
        visual.$detach();
      }

      if (returnToCache) {
        visual.tryReturnToCache();
      }

      return visual;
    };

    if (!skipAnimation && this.$isAttached) {
      const animation = visual.animate(MotionDirection.enter);
      if (animation) {
        return animation.then(() => detachAndReturn());
      }
    }

    return detachAndReturn();
  }

  public removeAll(returnToCache?: boolean, skipAnimation?: boolean): void | IVisual[] | Promise<IVisual[]> {
    return this.removeMany(this.children, returnToCache, skipAnimation);
  }

  public removeMany(visualsToRemove: IVisual[], returnToCache?: boolean, skipAnimation?: boolean): void | IVisual[] | Promise<IVisual[]> {
    const children = this.children;
    const ii = visualsToRemove.length;
    const rmPromises = [];
    const lifecycle = DetachLifecycle.start(this);

    if (visualsToRemove === children) {
      this.children = [];
    } else {
      for (let i = 0; i < ii; ++i) {
        const index = children.indexOf(visualsToRemove[i]);
        if (index >= 0) {
          children.splice(index, 1);
        }
      }
    }

    if (this.$isAttached) {
      visualsToRemove.forEach(child => {
        if (skipAnimation) {
          child.$detach(lifecycle);
          return;
        }
  
        const animation = child.animate(MotionDirection.enter);
  
        if (animation) {
          rmPromises.push(animation.then(() => child.$detach(lifecycle)));
        } else {
          child.$detach(lifecycle);
        }
      });
    }

    const finalizeRemoval = () => {
      lifecycle.end(this);

      if (returnToCache) {
        for (let i = 0; i < ii; ++i) {
          visualsToRemove[i].tryReturnToCache();
        }
      }

      return visualsToRemove;
    };

    if (rmPromises.length > 0) {
      return Promise.all(rmPromises).then(() => finalizeRemoval());
    }

    return finalizeRemoval();
  }

  public $attach(encapsulationSource: INode, lifecycle: AttachLifecycle): void {
    if (this.$isAttached) {
      return;
    }

    const children = this.children;

    for (let i = 0, ii = children.length; i < ii; ++i) {
      const child = children[i];
      child.$attach(encapsulationSource, lifecycle);
      child.animate(MotionDirection.enter);
    }

    this.$isAttached = true;
    this.encapsulationSource = encapsulationSource;
  }

  public $detach(lifecycle: DetachLifecycle): void {
    if (this.$isAttached) {
      const children = this.children;
      
      for (let i = 0, ii = children.length; i < ii; ++i) {
        children[i].$detach(lifecycle);
      }

      this.$isAttached = false;
      this.encapsulationSource = null;
    }
  }

  public projectTo(slots: Record<string, IEmulatedShadowSlot>): void {
    this.slots = slots;
    this.addVisualCore = project_addVisual;
    this.insertVisualCore = project_insertVisual;

    if (this.$isAttached) {
      const children = this.children;
      
      for (let i = 0, ii = children.length; i < ii; ++i) {
        let child = children[i];
        child.onRender = project_addVisual;
        project_addVisual(child);
      }
    }
  }
}
