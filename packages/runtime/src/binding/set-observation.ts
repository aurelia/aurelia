import { ITaskQueue } from '../task-queue';
import { ModifyCollectionObserver } from './collection-observation';
import { IBindingCollectionObserver } from './observation';

const setProto = Set.prototype;

/**
 * Searches for observer or creates a new one associated with given set instance
 * @param taskQueue
 * @param set instance for which observer is searched
 * @returns ModifySetObserver always the same instance for any given set instance
 */
export function getSetObserver<T = any>(taskQueue: ITaskQueue, set: Set<T>): IBindingCollectionObserver {
  let observer: IBindingCollectionObserver = (<any>set).__set_observer__;

  if (!observer) {
    Reflect.defineProperty(set, '__set_observer__', {
      value: observer = new ModifySetObserver<T>(taskQueue, set),
      enumerable: false, configurable: false
    });
  }

  return observer;
}

class ModifySetObserver<T> extends ModifyCollectionObserver {
  constructor(taskQueue: ITaskQueue, set: Set<T>) {
    super(taskQueue, set);

    const observer = this;
    let proto: any = setProto;

    if (proto.add !== set.add || proto.delete !== set.delete || proto.clear !== set.clear) {
      proto = {
        add: set.add,
        delete: set.delete,
        clear: set.clear
      };
    }

    set.add = function() {
      const type = 'add';
      const oldSize = set.size;
      const methodCallResult = proto.add.apply(set, arguments);
      const hasValue = set.size === oldSize;

      if (!hasValue) {
        observer.addChangeRecord({
          type: type,
          object: set,
          value: Array.from(set).pop()
        });
      }

      return methodCallResult;
    };

    set.delete = function() {
      const hasValue = set.has(arguments[0]);
      const methodCallResult = proto.delete.apply(set, arguments);

      if (hasValue) {
        observer.addChangeRecord({
          type: 'delete',
          object: set,
          value: arguments[0]
        });
      }

      return methodCallResult;
    };

    set.clear = function() {
      const methodCallResult = proto.clear.apply(set, arguments);

      observer.addChangeRecord({
        type: 'clear',
        object: set
      });

      return methodCallResult;
    };

    return observer;
  }
}
