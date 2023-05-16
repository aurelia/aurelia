import { IContainer, IRegistry } from '@aurelia/kernel';

import { VirtualRepeat } from './virtual-repeat';
import { CollectionStrategyLocator } from './collection-strategy';
import { ScrollerObserverLocator } from './scroller-observer';
import { DefaultDomRenderer } from './virtual-repeat-dom-renderer';

export const DefaultVirtualizationConfiguration: IRegistry = {
  register(container: IContainer): IContainer {
    return container.register(
      ScrollerObserverLocator,
      CollectionStrategyLocator,
      DefaultDomRenderer,
      VirtualRepeat,
    );
  }
};
