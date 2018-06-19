import { IRepeatStrategy } from './repeat-strategy';
import { IRepeater } from './repeater';

/* @internal */
export class NullRepeatStrategy implements IRepeatStrategy {
  handles(items): boolean {
    return items === null || items === undefined;
  }

  instanceMutated(repeat: IRepeater, items: any, changes: any): void { }
  
  instanceChanged(repeat: IRepeater, items: any): void {
    repeat.removeAllVisuals(true);
  }

  getCollectionObserver(items: any) { return null; }
}
