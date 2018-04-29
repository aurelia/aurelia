import { Animator } from './animator';
import { ShadowDOMEmulation, IEmulatedShadowSlot } from './shadow-dom';
import { IVisual } from './view-engine';
import { IScope } from '../binding/binding-context';
import { IBindScope } from '../binding/observation';
import { Reporter } from '../reporter';
import { IAttach, AttachContext, DetachContext } from './lifecycle';
import { DI } from '../di';
import { INode } from '../dom';

function appendVisualToContainer(visual: IVisual, owner: RenderSlotImplementation) {
  visual.$view.appendTo(owner.anchor);
}

function addVisualToList(visual: IVisual, owner: RenderSlotImplementation) {
  visual.$view.insertBefore(owner.anchor);
}

function projectAddVisualToList(visual: IVisual, owner: RenderSlotImplementation) {
  visual.$view.remove = () => ShadowDOMEmulation.undistributeView(visual.$view, owner.slots, owner);
  ShadowDOMEmulation.distributeView(visual.$view, owner.slots, owner);
}

function insertVisualAtIndex(visual: IVisual, owner: RenderSlotImplementation, index: number) {
  visual.$view.insertBefore(owner.children[index].$view.firstChild);
}

function projectInsertVisualAtIndex(visual: IVisual, owner: RenderSlotImplementation, index: number) {
  visual.$view.remove = () => ShadowDOMEmulation.undistributeView(visual.$view, owner.slots, owner);
  ShadowDOMEmulation.distributeView(visual.$view, owner.slots, owner, index);
}

function removeView(visual: IVisual, owner: RenderSlotImplementation) {
  visual.$view.remove();
}

function projectRemoveView(visual: IVisual, owner: RenderSlotImplementation) {
  ShadowDOMEmulation.undistributeView(visual.$view, owner.slots, owner);
}

export type SwapOrder = 'before' | 'with' | 'after';

export const IRenderSlot = DI.createInterface('IRenderSlot');

/**
* Represents a slot or location within the DOM to which views can be added and removed.
* Manages the view lifecycle for its children.
*/
export interface IRenderSlot extends IAttach {
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

class RenderSlotImplementation implements IRenderSlot {
  private $isAttached = false;
  private addVisualCore: (visual: IVisual, owner: RenderSlotImplementation) => void;
  private insertVisualCore: (visual: IVisual, owner: RenderSlotImplementation, index: number) => void;
  private removeViewCore: (visual: IVisual, owner: RenderSlotImplementation) => void;

  /** @internal */ public children: IVisual[] = [];
  /** @internal */ public slots: Record<string, IEmulatedShadowSlot> = null;

  constructor(public anchor: INode, anchorIsContainer: boolean) {
    (<any>anchor).$slot = this; // Usage: Shadow DOM Emulation
    (<any>anchor).$isContentProjectionSource = false; // Usage: Shadow DOM Emulation

    this.addVisualCore = anchorIsContainer ? appendVisualToContainer : addVisualToList;
    this.insertVisualCore = insertVisualAtIndex;
    this.removeViewCore = removeView;
  }

  add(visual: IVisual) {
    this.children.push(visual);

    if (this.$isAttached) {
      visual.$attach(null, this.addVisualCore, this);
      return visual.animate('enter');
    }
  }

  insert(index: number, visual: IVisual) {
    const children = this.children;
    const length = children.length;

    if ((index === 0 && length === 0) || index >= length) {
      return this.add(visual);
    }

    children.splice(index, 0, visual);

    if (this.$isAttached) {
      visual.$attach(null, this.insertVisualCore, this, index);
      return visual.animate('enter');
    }
  }

  move(sourceIndex: number, targetIndex: number) {
    if (sourceIndex === targetIndex) {
      return;
    }

    const children = this.children;
    const visual = children[sourceIndex];

    children.splice(sourceIndex, 1);
    children.splice(targetIndex, 0, visual);

    if (this.$isAttached) {
      this.removeViewCore(visual, this);
      this.insertVisualCore(visual, this, targetIndex);
    }
  }

  swap(newVisual: IVisual, strategy: SwapOrder = 'after', returnToCache?: boolean, skipAnimation?: boolean) {
    const remove = () => this.removeAll(returnToCache, skipAnimation);
    const add = () => this.add(newVisual);

    switch(strategy) {
      case 'before':
        const beforeAddResult = add();
        return (beforeAddResult instanceof Promise ? beforeAddResult.then(() => <any>remove()) : remove()); 
      case 'with':
        const withAddResult = add();
        const withRemoveResult = remove();
        return (withAddResult instanceof Promise || withRemoveResult instanceof Promise)
          ? Promise.all(<any>[withAddResult, withRemoveResult]).then(x => x[1])
          : withRemoveResult;
      case 'after':
        const afterRemoveResult = remove();
        return (afterRemoveResult instanceof Promise ? afterRemoveResult.then(() => <any>add()) : add());
    }
  }

  remove(visual: IVisual, returnToCache?: boolean, skipAnimation?: boolean): IVisual | Promise<IVisual> {
    return this.removeAt(this.children.indexOf(visual), returnToCache, skipAnimation);
  }

  removeAt(index: number, returnToCache?: boolean, skipAnimation?: boolean): IVisual | Promise<IVisual> {
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
      const animation = visual.animate('leave');
      if (animation) {
        return animation.then(() => detachAndReturn());
      }
    }

    return detachAndReturn();
  }

  removeAll(returnToCache?: boolean, skipAnimation?: boolean): void | IVisual[] | Promise<IVisual[]> {
    return this.removeMany(this.children, returnToCache, skipAnimation);
  }

  removeMany(visualsToRemove: IVisual[], returnToCache?: boolean, skipAnimation?: boolean): void | IVisual[] | Promise<IVisual[]> {
    const children = this.children;
    const ii = visualsToRemove.length;
    const rmPromises = [];
    const context = DetachContext.open(this);

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
          child.$detach(context);
          return;
        }
  
        const animation = child.animate('leave');
  
        if (animation) {
          rmPromises.push(animation.then(() => child.$detach(context)));
        } else {
          child.$detach(context);
        }
      });
    }

    const finalizeRemoval = () => {
      context.close();

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

  $attach(context: AttachContext): void {
    if (this.$isAttached) {
      return;
    }

    const children = this.children;

    for (let i = 0, ii = children.length; i < ii; ++i) {
      const child = children[i];
      child.$attach(context, this.addVisualCore, this);
      child.animate('enter');
    }

    this.$isAttached = true;
  }

  $detach(context: DetachContext): void {
    if (this.$isAttached) {
      const children = this.children;
      
      for (let i = 0, ii = children.length; i < ii; ++i) {
        children[i].$detach(context);
      }

      this.$isAttached = false;
    }
  }

  projectTo(slots: Record<string, IEmulatedShadowSlot>): void {
    this.slots = slots;
    this.addVisualCore = projectAddVisualToList;
    this.insertVisualCore = projectInsertVisualAtIndex;
    this.removeViewCore = projectRemoveView;

    if (this.$isAttached) {
      const children = this.children;
      
      for (let i = 0, ii = children.length; i < ii; ++i) {
        projectAddVisualToList(children[i], this);
      }
    }
  }
}
