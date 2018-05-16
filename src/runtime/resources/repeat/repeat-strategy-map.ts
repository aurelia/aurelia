import {createFullOverrideContext, updateOverrideContexts} from './override-contexts';
import { IRepeatStrategy } from './repeat-strategy';
import { IRepeater } from './repeater';
import { ObserverLocator } from '../../binding/observer-locator';
import { IOverrideContext, BindingContext } from '../../binding/binding-context';
import { IVisual } from '../../templating/view-engine';

/* @internal */
export class MapRepeatStrategy<T = any, K = any> implements IRepeatStrategy<Map<T, K>> {
  handles(items: any): boolean {
    return items instanceof Map
  }

  getCollectionObserver(items: Map<T, K>) {
    return ObserverLocator.getMapObserver(items);
  }

  instanceChanged(repeat: IRepeater, items: Map<T, K>): void {
    const removePromise = repeat.removeAllVisuals(true, !repeat.visualsRequireLifecycle);
    
    if (removePromise instanceof Promise) {
      removePromise.then(() => this.standardProcessItems(repeat, items));
      return;
    }

    this.standardProcessItems(repeat, items);
  }

  private standardProcessItems(repeat: IRepeater, items: Map<T, K>) {
    let index = 0;

    items.forEach((value, key) => {
      const overrideContext = createFullOverrideContext(repeat, value, index, items.size, key);
      repeat.addVisualWithScope(BindingContext.createScopeFromOverride(overrideContext));
      ++index;
    });
  }

  instanceMutated(repeat: IRepeater, map: Map<T, K>, records: any): void {
    const rmPromises: Promise<any>[] = [];
    let overrideContext: IOverrideContext;
    let removeIndex: number;
    let viewOrPromise: IVisual | Promise<any>;

    for (let i = 0, ii = records.length; i < ii; ++i) {
      const record = records[i];
      const key = record.key;

      switch (record.type) {
        case 'update':
          removeIndex = this.getViewIndexByKey(repeat, key);
          viewOrPromise = repeat.removeVisual(removeIndex, true, !repeat.visualsRequireLifecycle);

          if (viewOrPromise instanceof Promise) {
            rmPromises.push(viewOrPromise);
          }

          overrideContext = createFullOverrideContext(repeat, map.get(key), removeIndex, map.size, key);
          repeat.insertVisualWithScope(removeIndex, BindingContext.createScopeFromOverride(overrideContext));
          break;
        case 'add':
          const addIndex = repeat.visualCount() <= map.size - 1 ? repeat.visualCount() : map.size - 1;
          overrideContext = createFullOverrideContext(repeat, map.get(key), addIndex, map.size, key);
          repeat.insertVisualWithScope(map.size - 1, BindingContext.createScopeFromOverride(overrideContext));
          break;
        case 'delete':
          if (record.oldValue === undefined) { 
            return; 
          }

          removeIndex = this.getViewIndexByKey(repeat, key);
          viewOrPromise = repeat.removeVisual(removeIndex, true, !repeat.visualsRequireLifecycle);

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

  private getViewIndexByKey(repeat: IRepeater, key) {
    for (let i = 0, ii = repeat.visualCount(); i < ii; ++i) {
      const child = repeat.visualAt(i);

      if (child.$scope.bindingContext[repeat.key] === key) {
        return i;
      }
    }

    return undefined;
  }
}
