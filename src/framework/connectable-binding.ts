import {sourceContext} from './call-context';
import {ObserverLocator} from './observer-locator';

const slotNames = [];
const versionSlotNames = [];

for (let i = 0; i < 100; i++) {
  slotNames.push(`_observer${i}`);
  versionSlotNames.push(`_observerVersion${i}`);
}

export abstract class ConnectableBinding {
  protected observerSlots;
  protected version;

  constructor(protected observerLocator: ObserverLocator) {}

  addObserver(observer) {
    // find the observer.
    let observerSlots = this.observerSlots === undefined ? 0 : this.observerSlots;
    let i = observerSlots;
    
    while (i-- && this[slotNames[i]] !== observer) {
      // Do nothing
    }
  
    // if we are not already observing, put the observer in an open slot and subscribe.
    if (i === -1) {
      i = 0;
      while (this[slotNames[i]]) {
        i++;
      }
      this[slotNames[i]] = observer;
      observer.subscribe(sourceContext, this);
      // increment the slot count.
      if (i === observerSlots) {
        this.observerSlots = i + 1;
      }
    }
    // set the "version" when the observer was used.
    if (this.version === undefined) {
      this.version = 0;
    }
    this[versionSlotNames[i]] = this.version;
  }
  
  observeProperty(obj, propertyName) {
    let observer = this.observerLocator.getObserver(obj, propertyName);
    this.addObserver(observer);
  }
  
  observeArray(array) {
    let observer = this.observerLocator.getArrayObserver(array);
    this.addObserver(observer);
  }
  
  unobserve(all) {
    let i = this.observerSlots;
    while (i--) {
      if (all || this[versionSlotNames[i]] !== this.version) {
        let observer = this[slotNames[i]];
        this[slotNames[i]] = null;
        if (observer) {
          observer.unsubscribe(sourceContext, this);
        }
      }
    }
  }
}
