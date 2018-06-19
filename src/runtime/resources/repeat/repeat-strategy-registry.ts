import { DI } from '../../../kernel/di';
import { inject } from '../../../kernel/decorators';
import { IRepeatStrategy } from './repeat-strategy';
import { NullRepeatStrategy } from './repeat-strategy-null';
import { ArrayRepeatStrategy } from './repeat-strategy-array';
import { MapRepeatStrategy } from './repeat-strategy-map';
import { SetRepeatStrategy } from './repeat-strategy-set';
import { NumberRepeatStrategy } from './repeat-strategy-number';
import { IObserverLocator } from '../../binding/observer-locator';

export const IRepeatStrategyRegistry = DI.createInterface<IRepeatStrategyRegistry>()
  .withDefault(x => x.singleton(RepeatStrategyRegistry));

/**
* Locates the best strategy for repeating a template over different types of collections.
*/
export interface IRepeatStrategyRegistry {
   /**
  * Adds a repeat strategy to be located when repeating a template over different collection types.
  * @param strategy A repeat strategy that can iterate a specific collection type.
  */
  register(strategy: IRepeatStrategy): void;
  
  getStrategyForItems(items: any): IRepeatStrategy;
}

@inject(IObserverLocator)
class RepeatStrategyRegistry implements IRepeatStrategyRegistry {
  private strategies: IRepeatStrategy[] = [];

  constructor(observerLocator: IObserverLocator) {
    this.register(new NullRepeatStrategy());
    this.register(new ArrayRepeatStrategy(observerLocator));
    this.register(new MapRepeatStrategy(observerLocator));
    this.register(new SetRepeatStrategy(observerLocator));
    this.register(new NumberRepeatStrategy());
  }

  register(strategy: IRepeatStrategy) {
    this.strategies.push(strategy);
  }

  getStrategyForItems(items: any): IRepeatStrategy {
    let strategies = this.strategies;

    for (let i = 0, ii = strategies.length; i < ii; ++i) {
      let current = strategies[i];

      if (current.handles(items)) {
        return current;
      }
    }

    return null;
  }
}
