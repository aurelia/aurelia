import { DOM } from '../dom';

//Note: path and deepPath are designed to handle v0 and v1 shadow dom specs respectively
function findOriginalEventTarget(event) {
  return (event.path && event.path[0]) || (event.deepPath && event.deepPath[0]) || event.target;
}

function stopPropagation() {
  this.standardStopPropagation();
  this.propagationStopped = true;
}

function handleCapturedEvent(event) {
  event.propagationStopped = false;
  let target = findOriginalEventTarget(event);

  let orderedCallbacks = [];
  /**
   * During capturing phase, event 'bubbles' down from parent. Needs to reorder callback from root down to target
   */
  while (target) {
    if (target.capturedCallbacks) {
      let callback = target.capturedCallbacks[event.type];
      if (callback) {
        if (event.stopPropagation !== stopPropagation) {
          event.standardStopPropagation = event.stopPropagation;
          event.stopPropagation = stopPropagation;
        }
        orderedCallbacks.push(callback);
      }
    }
    target = target.parentNode;
  }
  for (let i = orderedCallbacks.length - 1; i >= 0 && !event.propagationStopped; i--) {
    let orderedCallback = orderedCallbacks[i];
    if ('handleEvent' in orderedCallback) {
      orderedCallback.handleEvent(event);
    } else {
      orderedCallback(event);
    }
  }
}

class CapturedHandlerEntry {
  count = 0;

  constructor(private eventName: string) {
    this.eventName = eventName;
  }

  increment() {
    this.count++;

    if (this.count === 1) {
      DOM.addEventListener(this.eventName, handleCapturedEvent, true);
    }
  }

  decrement() {
    this.count--;

    if (this.count === 0) {
      DOM.removeEventListener(this.eventName, handleCapturedEvent, true);
    }
  }
}

function handleDelegatedEvent(event) {
  event.propagationStopped = false;
  let target = findOriginalEventTarget(event);

  while (target && !event.propagationStopped) {
    if (target.delegatedCallbacks) {
      let callback = target.delegatedCallbacks[event.type];
      if (callback) {
        if (event.stopPropagation !== stopPropagation) {
          event.standardStopPropagation = event.stopPropagation;
          event.stopPropagation = stopPropagation;
        }
        if ('handleEvent' in callback) {
          callback.handleEvent(event);
        } else {
          callback(event);
        }
      }
    }

    target = target.parentNode;
  }
}

class DelegateHandlerEntry {
  count = 0;

  constructor(private eventName: string) {
    this.eventName = eventName;
  }

  increment() {
    this.count++;

    if (this.count === 1) {
      DOM.addEventListener(this.eventName, handleDelegatedEvent, false);
    }
  }

  decrement() {
    this.count--;

    if (this.count === 0) {
      DOM.removeEventListener(this.eventName, handleDelegatedEvent);
    }
  }
}

class DefaultEventStrategy {
  delegatedHandlers = {};
  capturedHandlers = {};

  subscribe(target, targetEvent, callback, strategy) {
    let delegatedHandlers;
    let capturedHandlers;
    let handlerEntry;

    if (strategy === delegationStrategy.bubbling) {
      delegatedHandlers = this.delegatedHandlers;
      handlerEntry = delegatedHandlers[targetEvent] || (delegatedHandlers[targetEvent] = new DelegateHandlerEntry(targetEvent));
      let delegatedCallbacks = target.delegatedCallbacks || (target.delegatedCallbacks = {});

      handlerEntry.increment();
      delegatedCallbacks[targetEvent] = callback;

      return function() {
        handlerEntry.decrement();
        delegatedCallbacks[targetEvent] = null;
      };
    }
    if (strategy === delegationStrategy.capturing) {
      capturedHandlers = this.capturedHandlers;
      handlerEntry = capturedHandlers[targetEvent] || (capturedHandlers[targetEvent] = new CapturedHandlerEntry(targetEvent));
      let capturedCallbacks = target.capturedCallbacks || (target.capturedCallbacks = {});

      handlerEntry.increment();
      capturedCallbacks[targetEvent] = callback;

      return function() {
        handlerEntry.decrement();
        capturedCallbacks[targetEvent] = null;
      };
    }

    target.addEventListener(targetEvent, callback, false);

    return function() {
      target.removeEventListener(targetEvent, callback);
    };
  }
}

interface IDelegationStrategy {
  none: 0;
  capturing: 1;
  bubbling: 2;
}

export const delegationStrategy: IDelegationStrategy = {
  none: 0,
  capturing: 1,
  bubbling: 2
};

export class EventManager {
  public static instance = new EventManager();

  elementHandlerLookup = {};
  eventStrategyLookup = {};
  defaultEventStrategy = new DefaultEventStrategy();

  constructor() {
    this.registerElementConfig({
      tagName: 'input',
      properties: {
        value: ['change', 'input'],
        checked: ['change', 'input'],
        files: ['change', 'input']
      }
    });

    this.registerElementConfig({
      tagName: 'textarea',
      properties: {
        value: ['change', 'input']
      }
    });

    this.registerElementConfig({
      tagName: 'select',
      properties: {
        value: ['change']
      }
    });

    this.registerElementConfig({
      tagName: 'content editable',
      properties: {
        value: ['change', 'input', 'blur', 'keyup', 'paste']
      }
    });

    this.registerElementConfig({
      tagName: 'scrollable element',
      properties: {
        scrollTop: ['scroll'],
        scrollLeft: ['scroll']
      }
    });
  }

  registerElementConfig(config) {
    let tagName = config.tagName.toLowerCase();
    let properties = config.properties;
    let propertyName;

    this.elementHandlerLookup[tagName] = {};

    for (propertyName in properties) {
      if (properties.hasOwnProperty(propertyName)) {
        this.registerElementPropertyConfig(tagName, propertyName, properties[propertyName]);
      }
    }
  }

  registerElementPropertyConfig(tagName, propertyName, events) {
    this.elementHandlerLookup[tagName][propertyName] = this.createElementHandler(events);
  }

  createElementHandler(events) {
    return {
      subscribe(target, callbackOrListener) {
        events.forEach(changeEvent => {
          target.addEventListener(changeEvent, callbackOrListener, false);
        });

        return function() {
          events.forEach(changeEvent => {
            target.removeEventListener(changeEvent, callbackOrListener, false);
          });
        };
      }
    };
  }

  registerElementHandler(tagName, handler) {
    this.elementHandlerLookup[tagName.toLowerCase()] = handler;
  }

  registerEventStrategy(eventName, strategy) {
    this.eventStrategyLookup[eventName] = strategy;
  }

  getElementHandler(target, propertyName) {
    let tagName;
    let lookup = this.elementHandlerLookup;

    if (target.tagName) {
      tagName = target.tagName.toLowerCase();

      if (lookup[tagName] && lookup[tagName][propertyName]) {
        return lookup[tagName][propertyName];
      }

      if (propertyName === 'textContent' || propertyName === 'innerHTML') {
        return lookup['content editable'].value;
      }

      if (propertyName === 'scrollTop' || propertyName === 'scrollLeft') {
        return lookup['scrollable element'][propertyName];
      }
    }

    return null;
  }

  addEventListener(target, targetEvent, callbackOrListener, delegate) {
    return (this.eventStrategyLookup[targetEvent] || this.defaultEventStrategy)
      .subscribe(target, targetEvent, callbackOrListener, delegate);
  }
}
