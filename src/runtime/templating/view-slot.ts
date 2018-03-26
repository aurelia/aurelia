import { Animator } from './animator';
import { View } from './view';
import { ShadowDOM } from './shadow-dom';
import { IAttach } from './component';
import { Scope, IBindScope } from '../binding/binding-interfaces';
import { IVisual } from './visual';

function getAnimatableElement(visual: IVisual) {
  let view = visual.$view;

  if (view['$animatableElement'] !== undefined) {
    return view['$animatableElement'];
  }

  let current = view.firstChild;

  while (current && current.nodeType !== 1) {
    current = current.nextSibling;
  }

  if (current && current.nodeType === 1) {
    return (view['$animatableElement'] = (<HTMLElement>current).classList.contains('au-animate') ? current : null);
  }

  return (view['$animatableElement'] = null);
}

/**
* Represents a slot or location within the DOM to which views can be added and removed.
* Manages the view lifecycle for its children.
*/
export class ViewSlot implements IBindScope, IAttach {
  private scope: Scope;
  private children: IVisual[] = [];
  private isBound = false;
  private isAttached = false;
  private contentSelectors = null;
  private projectToSlots;

  /**
  * Creates an instance of ViewSlot.
  * @param anchor The DOM node which will server as the anchor or container for insertion.
  * @param anchorIsContainer Indicates whether the node is a container.
  * @param animator The animator that will controll enter/leave transitions for this slot.
  */
  constructor(public anchor: Node, private anchorIsContainer: boolean, private animator: Animator = Animator.instance) {
    anchor['viewSlot'] = this;
    anchor['isContentProjectionSource'] = false;
  }

  /**
   *   Runs the animator against the first animatable element found within the view's fragment
   *   @param  visual The view to use when searching for the element.
   *   @param  direction The animation direction enter|leave.
   *   @returns An animation complete Promise or undefined if no animation was run.
   */
  animateView(visual: IVisual, direction: string = 'enter'): void | Promise<boolean> {
    let animatableElement = getAnimatableElement(visual);

    if (animatableElement !== null) {
      switch (direction) {
        case 'enter':
          return this.animator.enter(animatableElement);
        case 'leave':
          return this.animator.leave(animatableElement);
        default:
          throw new Error('Invalid animation direction: ' + direction);
      }
    }
  }

  /**
  * Binds the slot and it's children.
  */
  bind(scope: Scope): void {
    if (this.isBound) {
      if (this.scope === scope) {
        return;
      }

      this.unbind();
    }

    this.isBound = true;
    this.scope = scope = scope || this.scope;

    let children = this.children;

    for (let i = 0, ii = children.length; i < ii; ++i) {
      children[i].bind(scope);
    }
  }

  /**
  * Unbinds the slot and its children.
  */
  unbind(): void {
    if (this.isBound) {
      this.isBound = false;
      this.scope = null;

      let children = this.children;

      for (let i = 0, ii = children.length; i < ii; ++i) {
        children[i].unbind();
      }
    }
  }

  /**
  * Adds a view to the slot.
  * @param visual The view to add.
  * @return May return a promise if the view addition triggered an animation.
  */
  add(visual: IVisual): void | Promise<any> {
    if (this.anchorIsContainer) {
      visual.$view.appendTo(<Element>this.anchor);
    } else {
      visual.$view.insertBefore(this.anchor);
    }

    this.children.push(visual);

    if (this.isAttached) {
      visual.attach();
      return this.animateView(visual, 'enter');
    }
  }

  /**
  * Inserts a view into the slot.
  * @param index The index to insert the view at.
  * @param visual The view to insert.
  * @return May return a promise if the view insertion triggered an animation.
  */
  insert(index: number, visual: IVisual): void | Promise<any> {
    let children = this.children;
    let length = children.length;

    if ((index === 0 && length === 0) || index >= length) {
      return this.add(visual);
    }

    visual.$view.insertBefore(children[index].$view.firstChild);
    children.splice(index, 0, visual);

    if (this.isAttached) {
      visual.attach();
      return this.animateView(visual, 'enter');
    }
  }

  /**
   * Moves a view across the slot.
   * @param sourceIndex The index the view is currently at.
   * @param targetIndex The index to insert the view at.
   */
  move(sourceIndex, targetIndex) {
    if (sourceIndex === targetIndex) {
      return;
    }

    const children = this.children;
    const component = children[sourceIndex]
    const view = component.$view;

    view.remove();
    view.insertBefore(children[targetIndex].$view.firstChild);
    children.splice(sourceIndex, 1);
    children.splice(targetIndex, 0, component);
  }

  /**
  * Removes a view from the slot.
  * @param visual The view to remove.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removal triggered an animation.
  */
  remove(visual: IVisual, skipAnimation?: boolean): IVisual | Promise<IVisual> {
    return this.removeAt(this.children.indexOf(visual), skipAnimation);
  }

  /**
  * Removes many views from the slot.
  * @param visualsToRemove The array of views to remove.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removal triggered an animation.
  */
  removeMany(visualsToRemove: IVisual[], skipAnimation?: boolean): void | IVisual[] | Promise<IVisual[]> {
    const children = this.children;
    let ii = visualsToRemove.length;
    let i;
    let rmPromises = [];

    visualsToRemove.forEach(child => {
      let view = child.$view;

      if (skipAnimation) {
        view.remove();
        return;
      }

      let animation = this.animateView(child, 'leave');

      if (animation) {
        rmPromises.push(animation.then(() => view.remove()));
      } else {
        view.remove();
      }
    });

    let removeAction = () => {
      if (this.isAttached) {
        for (i = 0; i < ii; ++i) {
          visualsToRemove[i].detach();
        }
      }

      for (i = 0; i < ii; ++i) {
        const index = children.indexOf(visualsToRemove[i]);
        if (index >= 0) {
          children.splice(index, 1);
        }
      }

      return visualsToRemove;
    };

    if (rmPromises.length > 0) {
      return Promise.all(rmPromises).then(() => removeAction());
    }

    return removeAction();
  }

  /**
  * Removes a view an a specified index from the slot.
  * @param index The index to remove the view at.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removal triggered an animation.
  */
  removeAt(index: number, skipAnimation?: boolean): IVisual | Promise<IVisual> {
    let visual = this.children[index];

    let removeAction = () => {
      index = this.children.indexOf(visual);
      visual.$view.remove();
      this.children.splice(index, 1);

      if (this.isAttached) {
        visual.detach();
      }

      return visual;
    };

    if (!skipAnimation) {
      let animation = this.animateView(visual, 'leave');
      if (animation) {
        return animation.then(() => removeAction());
      }
    }

    return removeAction();
  }

  /**
  * Removes all views from the slot.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removals triggered an animation.
  */
  removeAll(skipAnimation?: boolean): void | Promise<any> {
    let children = this.children;
    let ii = children.length;
    let i;
    let rmPromises = [];

    children.forEach(child => {
      const view = child.$view;

      if (skipAnimation) {
        view.remove();
        return;
      }

      let animation = this.animateView(child, 'leave');
      if (animation) {
        rmPromises.push(animation.then(() => view.remove()));
      } else {
        view.remove();
      }
    });

    let removeAction = () => {
      if (this.isAttached) {
        for (i = 0; i < ii; ++i) {
          children[i].detach();
        }
      }

      this.children = [];
    };

    if (rmPromises.length > 0) {
      return Promise.all(rmPromises).then(() => removeAction());
    }

    return removeAction();
  }

  /**
  * Triggers the attach for the slot and its children.
  */
  attach(): void {
    if (this.isAttached) {
      return;
    }

    this.isAttached = true;

    let children = this.children;
    for (let i = 0, ii = children.length; i < ii; ++i) {
      let child = children[i];
      child.attach();
      this.animateView(child, 'enter');
    }
  }

  /**
  * Triggers the detach for the slot and its children.
  */
  detach(): void {
    if (this.isAttached) {
      this.isAttached = false;

      let children = this.children;
      for (let i = 0, ii = children.length; i < ii; ++i) {
        children[i].detach();
      }
    }
  }

  projectTo(slots: Object): void {
    this.projectToSlots = slots;
    this.add = this._projectionAdd;
    this.insert = this._projectionInsert;
    this.move = this._projectionMove;
    this.remove = this._projectionRemove;
    this.removeAt = this._projectionRemoveAt;
    this.removeMany = this._projectionRemoveMany;
    this.removeAll = this._projectionRemoveAll;
    this.children.forEach(view => ShadowDOM.distributeView(view, slots, this));
  }

  _projectionAdd(view) {
    ShadowDOM.distributeView(view, this.projectToSlots, this);

    this.children.push(view);

    if (this.isAttached) {
      view.attached();
    }
  }

  _projectionInsert(index, view) {
    if ((index === 0 && !this.children.length) || index >= this.children.length) {
      this.add(view);
    } else {
      ShadowDOM.distributeView(view, this.projectToSlots, this, index);

      this.children.splice(index, 0, view);

      if (this.isAttached) {
        view.attached();
      }
    }
  }

  _projectionMove(sourceIndex, targetIndex) {
    if (sourceIndex === targetIndex) {
      return;
    }

    const children = this.children;
    const view = children[sourceIndex];

    ShadowDOM.undistributeView(view, this.projectToSlots, this);
    ShadowDOM.distributeView(view, this.projectToSlots, this, targetIndex);

    children.splice(sourceIndex, 1);
    children.splice(targetIndex, 0, view);
  }

  _projectionRemove(view) {
    ShadowDOM.undistributeView(view, this.projectToSlots, this);
    this.children.splice(this.children.indexOf(view), 1);

    if (this.isAttached) {
      view.detached();
    }

    return view;
  }

  _projectionRemoveAt(index: number, skipAnimation?: boolean) {
    let view = this.children[index];

    ShadowDOM.undistributeView(view, this.projectToSlots, this);
    this.children.splice(index, 1);

    if (this.isAttached) {
      view.detach();
    }

    return view;
  }

  _projectionRemoveMany(viewsToRemove, skipAnimation) {
    viewsToRemove.forEach(view => this.remove(view));
  }

  _projectionRemoveAll() {
    ShadowDOM.undistributeAll(this.projectToSlots, this);

    let children = this.children;

    if (this.isAttached) {
      for (let i = 0, ii = children.length; i < ii; ++i) {
        children[i].detach();
      }
    }

    this.children = [];
  }
}
