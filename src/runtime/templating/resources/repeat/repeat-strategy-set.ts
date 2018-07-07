import {createFullOverrideContext, updateOverrideContexts} from './override-contexts';
import { IRepeatStrategy } from './repeat-strategy';
import { IObserverLocator } from '../../../binding/observer-locator';
import { IRepeater } from './repeater';
import { BindingContext } from '../../../binding/binding-context';

/* @internal */
export class SetRepeatStrategy<T = any> implements IRepeatStrategy<Set<T>> {
  constructor(private observerLocator: IObserverLocator) {}

  handles(items: any): boolean {
    return items instanceof Set;
  }

  getCollectionObserver(items: Set<T>) {
    return this.observerLocator.getSetObserver(items);
  }

  instanceChanged(repeat: IRepeater, items: Set<T>): void {
    const removePromise = repeat.removeAllVisuals(true, !repeat.visualsRequireLifecycle);
    
    if (removePromise instanceof Promise) {
      removePromise.then(() => this.standardProcessItems(repeat, items));
      return;
    }

    this.standardProcessItems(repeat, items);
  }

  private standardProcessItems(repeat: IRepeater, items: Set<T>) {
    let index = 0;

    items.forEach(value => {
      const overrideContext = createFullOverrideContext(repeat, value, index, items.size);
      repeat.addVisualWithScope(BindingContext.createScopeFromOverride(overrideContext));
      ++index;
    });
  }

  instanceMutated(repeat: IRepeater, set: Set<T>, records: any): void {
    const rmPromises = [];

    for (let i = 0, ii = records.length; i < ii; ++i) {
      const record = records[i];
      const value = record.value;

      switch (record.type) {
        case 'add':
          const size = Math.max(set.size - 1, 0);
          const overrideContext = createFullOverrideContext(repeat, value, size, set.size);
          repeat.insertVisualWithScope(size, BindingContext.createScopeFromOverride(overrideContext));
          break;
        case 'delete':
          const removeIndex = this.getViewIndexByValue(repeat, value);
          const viewOrPromise = repeat.removeVisual(removeIndex, true, !repeat.visualsRequireLifecycle);

          if (viewOrPromise instanceof Promise) {
            rmPromises.push(viewOrPromise);
          }

          break;
        case 'clear':
          repeat.removeAllVisuals(true, !repeat.visualsRequireLifecycle);
          break;
        default:
          continue;
      }
    }

    if (rmPromises.length > 0) {
      Promise.all(rmPromises).then(() => updateOverrideContexts(repeat.visuals(), 0));
    } else {
      updateOverrideContexts(repeat.visuals(), 0);
    }
  }

  private getViewIndexByValue(repeat: IRepeater, value) {
    for (let i = 0, ii = repeat.visualCount(); i < ii; ++i) {
      const child = repeat.visualAt(i);

      if (child.$scope.bindingContext[repeat.local] === value) {
        return i;
      }
    }

    return undefined;
  }
}
