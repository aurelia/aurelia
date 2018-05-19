import { createFullOverrideContext, updateOverrideContexts, updateOverrideContext } from './override-contexts';
import { mergeSplice } from '../../binding/array-change-records';
import { IRepeatStrategy } from './repeat-strategy';
import { IObserverLocator } from '../../binding/observer-locator';
import { IRepeater } from './repeater';
import { BindingContext } from '../../binding/binding-context';

interface IArrayStorageOnRepeater {
  __array: any[];
  __queuedSplices: any[];
}

function indexOf(array: any[], item: any, matcher: (a: any, b: any) => boolean, startIndex: number = 0) {
  if (matcher) {
    const length = array.length;
  
    for (let index = startIndex; index < length; index++) {
      if (matcher(array[index], item)) {
        return index;
      }
    }
  
    return -1;
  }

  // native indexOf is more performant than a for loop
  return array.indexOf(item);
}

/* @internal */
export class ArrayRepeatStrategy<T = any> implements IRepeatStrategy<T[]> {
  constructor(private observerLocator: IObserverLocator) {}

  handles(items: any): boolean {
    return items instanceof Array;
  }

  getCollectionObserver(items: T[]) {
    return this.observerLocator.getArrayObserver(items);
  }

  instanceChanged(repeat: IRepeater, items: T[]): void {
    const itemsLength = items.length;

    // if the new instance does not contain any items,
    // just remove all views and don't do any further processing
    if (!items || itemsLength === 0) {
      repeat.removeAllVisuals(true, !repeat.visualsRequireLifecycle);
      return;
    }

    const children = repeat.visuals();
    const viewsLength = children.length;

    // likewise, if we previously didn't have any views,
    // simply make them and return
    if (viewsLength === 0) {
      this.standardProcessInstanceChanged(repeat, items);
      return;
    }

    if (repeat.visualsRequireLifecycle) {
      const childrenSnapshot = children.slice(0);
      const itemNameInBindingContext = repeat.local;
      const matcher = repeat.matcher;

      // the cache of the current state (it will be transformed along with the views to keep track of indicies)
      let itemsPreviouslyInViews = [];
      const viewsToRemove = [];

      for (let index = 0; index < viewsLength; index++) {
        const view = childrenSnapshot[index];
        const oldItem = view.$scope.bindingContext[itemNameInBindingContext];

        if (indexOf(items, oldItem, matcher) === -1) {
          // remove the item if no longer in the new instance of items
          viewsToRemove.push(view);
        } else {
          // or add the item to the cache list
          itemsPreviouslyInViews.push(oldItem);
        }
      }

      let updateViews;
      let removePromise;

      if (itemsPreviouslyInViews.length > 0) {
        removePromise = repeat.removeVisuals(viewsToRemove, true, !repeat.visualsRequireLifecycle);
        updateViews = () => {
          // update views (create new and move existing)
          for (let index = 0; index < itemsLength; index++) {
            const item = items[index];
            const indexOfView = indexOf(itemsPreviouslyInViews, item, matcher, index);
            let view;

            if (indexOfView === -1) { // create views for new items
              const overrideContext = createFullOverrideContext(repeat, items[index], index, itemsLength);
              repeat.insertVisualWithScope(index, BindingContext.createScopeFromOverride(overrideContext));
              // reflect the change in our cache list so indicies are valid
              itemsPreviouslyInViews.splice(index, 0, undefined);
            } else if (indexOfView === index) { // leave unchanged items
              view = children[indexOfView];
              itemsPreviouslyInViews[indexOfView] = undefined;
            } else { // move the element to the right place
              view = children[indexOfView];
              repeat.moveVisual(indexOfView, index);
              itemsPreviouslyInViews.splice(indexOfView, 1);
              itemsPreviouslyInViews.splice(index, 0, undefined);
            }

            if (view) {
              updateOverrideContext(view.overrideContext, index, itemsLength);
            }
          }

          // remove extraneous elements in case of duplicates,
          // also update binding contexts if objects changed using the matcher function
          this.inPlaceProcessItems(repeat, items);
        };
      } else {
        // if all of the items are different, remove all and add all from scratch
        removePromise = repeat.removeAllVisuals(true, !repeat.visualsRequireLifecycle);
        updateViews = () => this.standardProcessInstanceChanged(repeat, items);
      }

      if (removePromise instanceof Promise) {
        removePromise.then(updateViews);
      } else {
        updateViews();
      }
    } else {
      // no lifecycle needed, use the fast in-place processing
      this.inPlaceProcessItems(repeat, items);
    }
  }

  private standardProcessInstanceChanged(repeat: IRepeater, items: T[]) {
    for (let i = 0, ii = items.length; i < ii; i++) {
      const overrideContext = createFullOverrideContext(repeat, items[i], i, ii);
      repeat.addVisualWithScope(BindingContext.createScopeFromOverride(overrideContext));
    }
  }

  private inPlaceProcessItems(repeat: IRepeater, items: T[]) {
    const itemsLength = items.length;
    let viewsLength = repeat.visualCount();

    // remove unneeded views.
    while (viewsLength > itemsLength) {
      viewsLength--;
      repeat.removeVisual(viewsLength, true, !repeat.visualsRequireLifecycle);
    }

    // avoid repeated evaluating the property-getter for the "local" property.
    const local = repeat.local;

    // re-evaluate bindings on existing views.
    for (let i = 0; i < viewsLength; i++) {
      const view = repeat.visualAt(i);
      const last = i === itemsLength - 1;
      const middle = i !== 0 && !last;
      const scope = view.$scope;
      const bindingContext = scope.bindingContext;
      const overrideContext = scope.overrideContext;

      // any changes to the binding context?
      if (bindingContext[local] === items[i]
        && (<any>overrideContext).$middle === middle
        && (<any>overrideContext).$last === last) {
        // no changes. continue...
        continue;
      }

      // update the binding context and refresh the bindings.
      bindingContext[local] = items[i];
      (<any>overrideContext).$middle = middle;
      (<any>overrideContext).$last = last;

      repeat.updateBindings(view);
    }

    // add new views
    for (let i = viewsLength; i < itemsLength; i++) {
      const overrideContext = createFullOverrideContext(repeat, items[i], i, itemsLength);
      repeat.addVisualWithScope(BindingContext.createScopeFromOverride(overrideContext));
    }
  }

  instanceMutated(repeat: IRepeater & IArrayStorageOnRepeater, array: T[], splices: any[]): void {
    if (repeat.__queuedSplices) {
      for (let i = 0, ii = splices.length; i < ii; ++i) {
        const {index, removed, addedCount} = splices[i];
        mergeSplice(repeat.__queuedSplices, index, removed, addedCount);
      }

      // Array.prototype.slice is used here to clone the array
      repeat.__array = array.slice(0);
      return;
    }

    // Array.prototype.slice is used here to clone the array
    const maybePromise = this.runSplices(repeat, array.slice(0), splices);

    if (maybePromise instanceof Promise) {
      let queuedSplices = repeat.__queuedSplices = [];

      const runQueuedSplices = () => {
        if (!queuedSplices.length) {
          repeat.__queuedSplices = undefined;
          repeat.__array = undefined;
          return;
        }

        const nextPromise = this.runSplices(repeat, repeat.__array, queuedSplices) || Promise.resolve();
        queuedSplices = repeat.__queuedSplices = [];
        nextPromise.then(runQueuedSplices);
      };

      maybePromise.then(runQueuedSplices);
    }
  }

  /**
  * Run a normalised set of splices against the viewSlot children.
  * @param repeat The repeat instance.
  * @param array The modified array.
  * @param splices Records of array changes.
  * @return {Promise|undefined} A promise if animations have to be run.
  * @pre The splices must be normalised so as:
  *  * Any item added may not be later removed.
  *  * Removals are ordered by asending index
  */
  private runSplices(repeat: IRepeater, array: T[], splices: any[]) {
    const rmPromises = [];
    let removeDelta = 0;

    for (let i = 0, ii = splices.length; i < ii; ++i) {
      const splice = splices[i];
      const removed = splice.removed;

      for (let j = 0, jj = removed.length; j < jj; ++j) {
        // the rmPromises.length correction works due to the ordered removal precondition
        const viewOrPromise = repeat.removeVisual(splice.index + removeDelta + rmPromises.length, true);
        
        if (viewOrPromise instanceof Promise) {
          rmPromises.push(viewOrPromise);
        }
      }

      removeDelta -= splice.addedCount;
    }

    if (rmPromises.length > 0) {
      return Promise.all(rmPromises).then(() => {
        const spliceIndexLow = this.handleAddedSplices(repeat, array, splices);
        updateOverrideContexts(repeat.visuals(), spliceIndexLow);
      });
    }

    const spliceIndexLow = this.handleAddedSplices(repeat, array, splices);
    updateOverrideContexts(repeat.visuals(), spliceIndexLow);

    return undefined;
  }

  private handleAddedSplices(repeat: IRepeater, array: T[], splices: any[]) {
    const arrayLength = array.length;
    let spliceIndex: number;
    let spliceIndexLow: number;
    
    for (let i = 0, ii = splices.length; i < ii; ++i) {
      const splice = splices[i];
      const end = splice.index + splice.addedCount;
      let addIndex = spliceIndex = splice.index;

      if (typeof spliceIndexLow === 'undefined' || spliceIndexLow === null || spliceIndexLow > splice.index) {
        spliceIndexLow = spliceIndex;
      }

      for (; addIndex < end; ++addIndex) {
        const overrideContext = createFullOverrideContext(repeat, array[addIndex], addIndex, arrayLength);
        repeat.insertVisualWithScope(addIndex, BindingContext.createScopeFromOverride(overrideContext));
      }
    }

    return spliceIndexLow;
  }
}
