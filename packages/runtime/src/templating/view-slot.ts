import { DI } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../dom';
import { AttachLifecycle, DetachLifecycle, IAttach } from './lifecycle';
import { IView, MotionDirection } from './view';

/*@internal*/
export function appendViewToContainer(view: IView) {
  const parent = view.parent as ViewSlotImplementation;
  view.$nodes.appendTo(parent.location);
}

/*@internal*/
export function addView(view: IView) {
  const parent = view.parent as ViewSlotImplementation;
  view.$nodes.insertBefore(parent.location);
}

/*@internal*/
export function insertView(view: IView) {
  view.$nodes.insertBefore(view.parent.children[view.renderState].$nodes.firstChild);
  view.onRender = (view.parent as ViewSlotImplementation).addViewCore;
}

export enum SwapOrder {
  before = 'before',
  with = 'with',
  after = 'after'
}

export const IViewSlot = DI.createInterface<IViewSlot>().noDefault();

/**
 * Represents a slot or location within the DOM to which views can be added and removed.
 * Manages the view lifecycle for its children.
 */
export interface IViewSlot extends IAttach {
  children: ReadonlyArray<IView>;

 /**
  * Adds a view to the slot.
  * @param view The view to add.
  * @return May return a promise if the view addition triggered an animation.
  */
  add(view: IView): void | Promise<boolean>;

 /**
  * Inserts a view into the slot.
  * @param index The index to insert the view at.
  * @param view The view to insert.
  * @return May return a promise if the view insertion triggered an animation.
  */
 insert(index: number, view: IView): void | Promise<boolean>;

 /**
  * Moves a view across the slot.
  * @param sourceIndex The index the view is currently at.
  * @param targetIndex The index to insert the view at.
  */
  move(sourceIndex: number, targetIndex: number): void;

 /**
  * Replaces the existing view slot children with the new view.
  * @param newView The view to swap in.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if an animation was triggered.
  */
  swap(newView: IView, strategy: SwapOrder, returnToCache?: boolean, skipAnimation?: boolean): void | IView[] | Promise<any>;

 /**
  * Removes a view from the slot.
  * @param view The view to remove.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removal triggered an animation.
  */
  remove(view: IView, returnToCache?: boolean, skipAnimation?: boolean): IView | Promise<IView>;

 /**
  * Removes a view an a specified index from the slot.
  * @param index The index to remove the view at.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removal triggered an animation.
  */
  removeAt(index: number, returnToCache?: boolean, skipAnimation?: boolean): IView | Promise<IView>;

 /**
  * Removes all views from the slot.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removals triggered an animation.
  */
  removeAll(returnToCache?: boolean, skipAnimation?: boolean): void | IView[] | Promise<IView[]>;

 /**
  * Removes many views from the slot.
  * @param viewsToRemove The array of views to remove.
  * @param skipAnimation Should the removal animation be skipped?
  * @return May return a promise if the view removal triggered an animation.
  */
  removeMany(viewsToRemove: IView[], returnToCache?: boolean, skipAnimation?: boolean): void | IView[] | Promise<IView[]>;
}

export const ViewSlot = {
  create(location: IRenderLocation, locationIsContainer: boolean = false): IViewSlot {
    return new ViewSlotImplementation(location, locationIsContainer);
  }
};

/*@internal*/
export class ViewSlotImplementation implements IViewSlot {
  public children: IView[] = [];
  public addViewCore: (view: IView) => void;

  private $isAttached: boolean = false;
  private insertViewCore: (view: IView) => void;
  private encapsulationSource: INode = null;

  constructor(public location: IRenderLocation, locationIsContainer: boolean) {
    this.addViewCore = locationIsContainer ? appendViewToContainer : addView;
    this.insertViewCore = insertView;
  }

  public add(view: IView) {
    view.parent = this;
    view.onRender = this.addViewCore;
    this.children.push(view);

    if (this.$isAttached) {
      view.$attach(this.encapsulationSource);
      return view.animate(MotionDirection.enter);
    }
  }

  public insert(index: number, view: IView) {
    const children = this.children;
    const length = children.length;

    if ((index === 0 && length === 0) || index >= length) {
      return this.add(view);
    }

    view.parent = this;
    children.splice(index, 0, view);

    if (this.$isAttached) {
      view.onRender = this.insertViewCore;
      view.renderState = index + 1; // We've already added this to the children, so we need to bump the index to get the right dom node.
      view.$attach(this.encapsulationSource);
      return view.animate(MotionDirection.enter);
    } else {
      view.onRender = this.addViewCore;
    }
  }

  public move(sourceIndex: number, targetIndex: number) {
    if (sourceIndex === targetIndex) {
      return;
    }

    const children = this.children;
    const view = children[sourceIndex];

    children.splice(sourceIndex, 1);
    children.splice(targetIndex, 0, view);

    if (this.$isAttached) {
      view.$nodes.remove();
      view.renderState = targetIndex;
      this.insertViewCore(view);
    }
  }

  public swap(newView: IView, strategy: SwapOrder = SwapOrder.after, returnToCache?: boolean, skipAnimation?: boolean) {
    const remove = () => this.removeAll(returnToCache, skipAnimation);
    const add = () => this.add(newView);

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

  public remove(view: IView, returnToCache?: boolean, skipAnimation?: boolean): IView | Promise<IView> {
    return this.removeAt(this.children.indexOf(view), returnToCache, skipAnimation);
  }

  public removeAt(index: number, returnToCache?: boolean, skipAnimation?: boolean): IView | Promise<IView> {
    const view = this.children[index];
    this.children.splice(index, 1);

    const detachAndReturn = () => {
      if (this.$isAttached) {
        view.$detach();
      }

      if (returnToCache) {
        view.tryReturnToCache();
      }

      return view;
    };

    if (!skipAnimation && this.$isAttached) {
      const animation = view.animate(MotionDirection.enter);
      if (animation) {
        return animation.then(detachAndReturn);
      }
    }

    return detachAndReturn();
  }

  public removeAll(returnToCache?: boolean, skipAnimation?: boolean): void | IView[] | Promise<IView[]> {
    return this.removeMany(this.children, returnToCache, skipAnimation);
  }

  public removeMany(viewsToRemove: IView[], returnToCache?: boolean, skipAnimation?: boolean): void | IView[] | Promise<IView[]> {
    const children = this.children;
    const ii = viewsToRemove.length;
    const rmPromises = [];
    const lifecycle = DetachLifecycle.start(this);

    if (viewsToRemove === children) {
      this.children = [];
    } else {
      for (let i = 0; i < ii; ++i) {
        const index = children.indexOf(viewsToRemove[i]);
        if (index >= 0) {
          children.splice(index, 1);
        }
      }
    }

    if (this.$isAttached) {
      viewsToRemove.forEach(child => {
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
          viewsToRemove[i].tryReturnToCache();
        }
      }

      return viewsToRemove;
    };

    if (rmPromises.length > 0) {
      return Promise.all(rmPromises).then(finalizeRemoval);
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
}
