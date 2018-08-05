import { ITaskQueue } from '../task-queue';
import { ModifyCollectionObserver } from './collection-observation';
import { IBindingCollectionObserver } from './observation';

const mapProto = Map.prototype;

/**
 * Searches for observer or creates a new one associated with given map instance
 * @param map instance for which observer is searched
 * @returns ModifyMapObserver always the same instance for any given map instance
 */
export function getMapObserver<T = any, K = any>(taskQueue: ITaskQueue, map: Map<T, K>): IBindingCollectionObserver {
  let observer: IBindingCollectionObserver = (<any>map).__map_observer__;

  if (!observer) {
    Reflect.defineProperty(map, '__map_observer__', {
      value: observer = new ModifyMapObserver<T, K>(taskQueue, map),
      enumerable: false, configurable: false
    });
  }

  return observer;
}

class ModifyMapObserver<T = any, K = any> extends ModifyCollectionObserver {
  constructor(taskQueue: ITaskQueue, map: Map<T, K>) {
    super(taskQueue, map);

    const observer = this;
    let proto: any = mapProto;

    if (proto.set !== map.set || proto.delete !== map.delete || proto.clear !== map.clear) {
      proto = {
        set: map.set,
        delete: map.delete,
        clear: map.clear
      };
    }

    map.set = function() {
      const hasValue = map.has(arguments[0]);
      const type = hasValue ? 'update' : 'add';
      const oldValue = map.get(arguments[0]);
      const methodCallResult = proto.set.apply(map, arguments);

      if (!hasValue || oldValue !== map.get(arguments[0])) {
        observer.addChangeRecord({
          type: type,
          object: map,
          key: arguments[0],
          oldValue: oldValue
        });
      }

      return methodCallResult;
    };

    map.delete = function() {
      const hasValue = map.has(arguments[0]);
      const oldValue = map.get(arguments[0]);
      const methodCallResult = proto.delete.apply(map, arguments);

      if (hasValue) {
        observer.addChangeRecord({
          type: 'delete',
          object: map,
          key: arguments[0],
          oldValue: oldValue
        });
      }

      return methodCallResult;
    };

    map.clear = function() {
      const methodCallResult = proto.clear.apply(map, arguments);

      observer.addChangeRecord({
        type: 'clear',
        object: map
      });

      return methodCallResult;
    };
  }
}
