import { createFullOverrideContext, updateOverrideContexts } from './override-contexts';
import { IRepeatStrategy } from './repeat-strategy';
import { IRepeater } from './repeater';
import { BindingContext } from '../../../binding/binding-context';

/* @internal */
export class NumberRepeatStrategy implements IRepeatStrategy<number> {
  handles(items: any): boolean {
    return typeof items === 'number';
  }

  instanceChanged(repeat: IRepeater, value: number): void {
    let removePromise = repeat.removeAllVisuals(true, !repeat.visualsRequireLifecycle);
    
    if (removePromise instanceof Promise) {
      removePromise.then(() => this.standardProcessItems(repeat, value));
      return;
    }

    this.standardProcessItems(repeat, value);
  }

  instanceMutated(repeat: IRepeater, items: number, changes: any): void { }

  getCollectionObserver() { return null; }

  private standardProcessItems(repeat: IRepeater, value: number) {
    value = Math.floor(value);

    const childrenLength = repeat.visualCount();
    let viewsToRemove = childrenLength - value;

    if (viewsToRemove > 0) {
      if (viewsToRemove > childrenLength) {
        viewsToRemove = childrenLength;
      }

      for (let i = 0, ii = viewsToRemove; i < ii; ++i) {
        repeat.removeVisual(childrenLength - (i + 1), true, !repeat.visualsRequireLifecycle);
      }

      return;
    }

    for (let i = childrenLength, ii = value; i < ii; ++i) {
      let overrideContext = createFullOverrideContext(repeat, i, i, ii);
      repeat.addVisualWithScope(BindingContext.createScopeFromOverride(overrideContext));
    }

    updateOverrideContexts(repeat.visuals(), 0);
  }
}
