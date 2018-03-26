import {SubscriberCollection} from './subscriber-collection';

export class DirtyChecker {
  public static instance = new DirtyChecker();

  tracked = [];
  checkDelay = 120;

  addProperty(property) {
    let tracked = this.tracked;

    tracked.push(property);

    if (tracked.length === 1) {
      this.scheduleDirtyCheck();
    }
  }

  removeProperty(property) {
    let tracked = this.tracked;
    tracked.splice(tracked.indexOf(property), 1);
  }

  scheduleDirtyCheck() {
    setTimeout(() => this.check(), this.checkDelay);
  }

  check() {
    let tracked = this.tracked;
    let i = tracked.length;

    while (i--) {
      let current = tracked[i];

      if (current.isDirty()) {
        current.call();
      }
    }

    if (tracked.length) {
      this.scheduleDirtyCheck();
    }
  }
}

export class DirtyCheckProperty extends SubscriberCollection {
  oldValue;
  
  constructor(private dirtyChecker: DirtyChecker, private obj: any, private propertyName: string) {
    super();
  }

  getValue() {
    return this.obj[this.propertyName];
  }

  setValue(newValue) {
    this.obj[this.propertyName] = newValue;
  }

  call() {
    let oldValue = this.oldValue;
    let newValue = this.getValue();

    this.callSubscribers(newValue, oldValue);

    this.oldValue = newValue;
  }

  isDirty() {
    return this.oldValue !== this.obj[this.propertyName];
  }

  subscribe(context, callable) {
    if (!this.hasSubscribers()) {
      this.oldValue = this.getValue();
      this.dirtyChecker.addProperty(this);
    }
    this.addSubscriber(context, callable);
  }

  unsubscribe(context, callable) {
    if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
      this.dirtyChecker.removeProperty(this);
    }
  }
}
