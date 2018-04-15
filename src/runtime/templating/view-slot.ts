import { Animator } from './animator';
import { ShadowDOM, IShadowSlot } from './shadow-dom';
import { IVisual } from './view-engine';
import { IScope } from '../binding/binding-context';
import { IBindScope } from '../binding/observation';
import { Reporter } from '../reporter';
import { IAttach, AttachContext, DetachContext } from './lifecycle';
import { visitEachChild } from 'typescript';

function appendToContainer(visual: IVisual & { anchor: Element }) {
  visual.$view.appendTo(visual.anchor);
}

function insertBeforeAnchor(visual: IVisual & { anchor: Node}) {
  visual.$view.insertBefore(visual.anchor);
}

/**
* Represents a slot or location within the DOM to which views can be added and removed.
* Manages the view lifecycle for its children.
*/
export class ViewSlot implements IAttach {
  private $isAttached = false;
  private children: IVisual[] = [];
  private projectToSlots: Record<string, IShadowSlot> = null;
  private render: (visual: IVisual & { anchor: Node}) => void;

  /**
  * Creates an instance of ViewSlot.
  * @param anchor The DOM node which will server as the anchor or container for insertion.
  * @param anchorIsContainer Indicates whether the node is a container.
  * @param animator The animator that will controll enter/leave transitions for this slot.
  */
  constructor(public anchor: Node, anchorIsContainer: boolean) {
    (<any>anchor).viewSlot = this;
    (<any>anchor).isContentProjectionSource = false;

    this.render = anchorIsContainer ? appendToContainer : insertBeforeAnchor;
  }

  /**
   *   Runs the animator against the first animatable element found within the view's fragment
   *   @param  visual The view to use when searching for the element.
   *   @param  direction The animation direction enter|leave.
   *   @returns An animation complete Promise or undefined if no animation was run.
   */
  animate(visual: IVisual, direction: 'enter' | 'leave' = 'enter'): void | Promise<boolean> {
    const element = visual.animatableElement;

    if (element === null) {
      return;
    }

    switch (direction) {
      case 'enter':
        return Animator.enter(element);
      case 'leave':
        return Animator.leave(element);
      default:
        throw Reporter.error(4, direction);
    }
  }

  /**
  * Adds a view to the slot.
  * @param visual The view to add.
  * @return May return a promise if the view addition triggered an animation.
  */
  add(visual: IVisual) {
    this.children.push(visual);

    if (this.$isAttached) {
      (<any>visual).anchor = this.anchor;
      visual.attach(this.render);
      return this.animate(visual, 'enter');
    }
  }

  /**
  * Inserts a view into the slot.
  * @param index The index to insert the view at.
  * @param visual The view to insert.
  * @return May return a promise if the view insertion triggered an animation.
  */
  insert(index: number, visual: IVisual) {
    const children = this.children;
    const length = children.length;

    if ((index === 0 && length === 0) || index >= length) {
      return this.add(visual);
    }

    children.splice(index, 0, visual);

    if (this.$isAttached) {
      (<any>visual).anchor = children[index].$view.firstChild;
      visual.attach(this.render);
      return this.animate(visual, 'enter');
    }
  }

  /**
   * Moves a view across the slot.
   * @param sourceIndex The index the view is currently at.
   * @param targetIndex The index to insert the view at.
   */
  move(sourceIndex: number, targetIndex: number) {
    if (sourceIndex === targetIndex) {
      return;
    }

    const children = this.children;
    const visual = children[sourceIndex];
    const view = visual.$view;

    children.splice(sourceIndex, 1);
    children.splice(targetIndex, 0, visual);

    if (this.$isAttached) {
      view.remove();
      view.insertBefore(children[targetIndex].$view.firstChild);
    }
  }

  /**
  * Removes a view from the slot.
  * @param visual The view to remove.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removal triggered an animation.
  */
  remove(visual: IVisual, returnToCache?: boolean, skipAnimation?: boolean): IVisual | Promise<IVisual> {
    return this.removeAt(this.children.indexOf(visual), returnToCache, skipAnimation);
  }

    /**
  * Removes a view an a specified index from the slot.
  * @param index The index to remove the view at.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removal triggered an animation.
  */
  removeAt(index: number, returnToCache?: boolean, skipAnimation?: boolean): IVisual | Promise<IVisual> {
    const visual = this.children[index];
    this.children.splice(index, 1);

    const detachAndReturn = () => {
      if (this.$isAttached) {
        visual.detach();
      }

      if (returnToCache) {
        visual.tryReturnToCache();
      }

      return visual;
    };

    if (!skipAnimation && this.$isAttached) {
      const animation = this.animate(visual, 'leave');
      if (animation) {
        return animation.then(() => detachAndReturn());
      }
    }

    return detachAndReturn();
  }

  /**
  * Removes all views from the slot.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removals triggered an animation.
  */
  removeAll(returnToCache?: boolean, skipAnimation?: boolean): void | IVisual[] | Promise<IVisual[]> {
    return this.removeMany(this.children, returnToCache, skipAnimation);
  }
  /**
  * Removes many views from the slot.
  * @param visualsToRemove The array of views to remove.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removal triggered an animation.
  */
  removeMany(visualsToRemove: IVisual[], returnToCache?: boolean, skipAnimation?: boolean): void | IVisual[] | Promise<IVisual[]> {
    const children = this.children;
    const ii = visualsToRemove.length;
    const rmPromises = [];
    const context = DetachContext.open(this);
    let i;

    if (visualsToRemove === children) {
      this.children = [];
    } else {
      for (i = 0; i < ii; ++i) {
        const index = children.indexOf(visualsToRemove[i]);
        if (index >= 0) {
          children.splice(index, 1);
        }
      }
    }

    if (this.$isAttached) {
      visualsToRemove.forEach(child => {
        if (skipAnimation) {
          child.detach(context);
          return;
        }
  
        const animation = this.animate(child, 'leave');
  
        if (animation) {
          rmPromises.push(animation.then(() => child.detach(context)));
        } else {
          child.detach(context);
        }
      });
    }

    const finalizeRemoval = () => {
      context.close();

      if (returnToCache) {
        for (i = 0; i < ii; ++i) {
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

  /**
  * Triggers the attach for the slot and its children.
  */
  attach(context: AttachContext): void {
    if (this.$isAttached) {
      return;
    }

    let children = this.children;

    for (let i = 0, ii = children.length; i < ii; ++i) {
      let child = children[i];
      (<any>child).anchor = this.anchor;
      child.attach(this.render);
      this.animate(child, 'enter');
    }

    this.$isAttached = true;
  }

  /**
  * Triggers the detach for the slot and its children.
  */
  detach(context: DetachContext): void {
    if (this.$isAttached) {
      let children = this.children;
      
      for (let i = 0, ii = children.length; i < ii; ++i) {
        children[i].detach(context);
      }

      this.$isAttached = false;
    }
  }

  projectTo(slots: Record<string, IShadowSlot>): void {
    this.projectToSlots = slots;
    this.add = this.projectionAdd;
    this.insert = this.projectionInsert;
    this.move = this.projectionMove;
    this.removeAt = this.projectionRemoveAt;
    this.removeMany = this.projectionRemoveMany;
    this.render = visual => ShadowDOM.distributeView(visual.$view, this.projectToSlots, this);

    if (this.$isAttached) {
      this.children.forEach(visual => ShadowDOM.distributeView(visual.$view, slots, this));
    }
  }

  private projectionAdd(visual: IVisual) {
    this.children.push(visual);

    if (this.$isAttached) {
      this.render = visual => ShadowDOM.distributeView(visual.$view, this.projectToSlots, this);
      visual.attach(this.render);
      return this.animate(visual, 'enter');
    }
  }

  private projectionInsert(index: number, visual: IVisual) {
    const children = this.children;
    const length = children.length;

    if ((index === 0 && length === 0) || index >= length) {
      return this.add(visual);
    }
    
    children.splice(index, 0, visual);

    if (this.$isAttached) {
      this.render = visual => ShadowDOM.distributeView(visual.$view, this.projectToSlots, this, index);
      visual.attach(this.render);
      return this.animate(visual, 'enter');
    }
  }

  private projectionMove(sourceIndex: number, targetIndex: number) {
    if (sourceIndex === targetIndex) {
      return;
    }

    const children = this.children;
    const visual = children[sourceIndex];

    children.splice(sourceIndex, 1);
    children.splice(targetIndex, 0, visual);

    if (this.$isAttached) {
      ShadowDOM.undistributeView(visual.$view, this.projectToSlots, this); //view.remove
      ShadowDOM.distributeView(visual.$view, this.projectToSlots, this, targetIndex); //view.insertBefore
    }
  }

  private projectionRemoveAt(index: number, returnToCache?: boolean, skipAnimation?: boolean) {
    let visual = this.children[index];
    this.children.splice(index, 1);

    const detachAndReturn = () => {
      if (this.$isAttached) {
        visual.$view.remove = () => ShadowDOM.undistributeView(visual.$view, this.projectToSlots, this);
        visual.detach();
      }

      if (returnToCache) {
        visual.tryReturnToCache();
      }

      return visual;
    };

    if (!skipAnimation && this.$isAttached) {
      const animation = this.animate(visual, 'leave');
      if (animation) {
        return animation.then(() => detachAndReturn());
      }
    }

    return detachAndReturn();
  }

  private projectionRemoveMany(visualsToRemove: IVisual[], returnToCache?: boolean, skipAnimation?: boolean): void | IVisual[] | Promise<IVisual[]> {
    const children = this.children;
    const ii = visualsToRemove.length;
    const rmPromises = [];
    const context = DetachContext.open(this);
    let i;

    if (visualsToRemove === children) {
      this.children = [];
    } else {
      for (i = 0; i < ii; ++i) {
        const index = children.indexOf(visualsToRemove[i]);
        if (index >= 0) {
          children.splice(index, 1);
        }
      }
    }

    if (this.$isAttached) {
      visualsToRemove.forEach(child => {
        if (skipAnimation) {
          child.$view.remove = () => ShadowDOM.undistributeView(child.$view, this.projectToSlots, this);
          child.detach(context);
          return;
        }
  
        const animation = this.animate(child, 'leave');
  
        if (animation) {
          rmPromises.push(animation.then(() => child.detach(context)));
        } else {
          child.detach(context);
        }
      });
    }

    const finalizeRemoval = () => {
      context.close();

      if (returnToCache) {
        for (i = 0; i < ii; ++i) {
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
}
