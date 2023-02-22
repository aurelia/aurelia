import { IDisposable } from '@aurelia/kernel';
import { Collection, ExpressionType, getCollectionObserver, ICollectionSubscriber, IExpressionParser, IndexMap, IObserverLocator, ISubscriber, Scope } from '@aurelia/runtime';
import { ExpressionWatcher } from '@aurelia/runtime-html';

export class BindingEngine {
  /** @internal */
  protected static inject = [IExpressionParser, IObserverLocator];

  public constructor(
    public readonly parser: IExpressionParser,
    public readonly observerLocator: IObserverLocator,
  ) {

  }

  public propertyObserver(object: {}, prop: PropertyKey): IBindingEnginePropertyObserver {
    return {
      subscribe: (callback) => {
        const observer = this.observerLocator.getObserver(object, prop);
        const subscriber: ISubscriber = {
          handleChange: (newValue: unknown, oldValue: unknown) => callback(newValue, oldValue)
        };
        observer.subscribe(subscriber);
        return {
          dispose: () => {
            observer.unsubscribe(subscriber);
          },
        };
      },
    };
  }

  public collectionObserver(collection: Collection): IBindingEngineCollectionObserver {
    return {
      subscribe: (callback) => {
        const observer = getCollectionObserver(collection);
        const subscriber: ICollectionSubscriber = {
          handleCollectionChange: (collection, indexMap) => callback(collection, indexMap)
        };
        observer?.subscribe(subscriber);
        return {
          dispose: () => {
            observer?.unsubscribe(subscriber);
          }
        };
      }
    };
  }

  public expressionObserver(bindingContext: {}, expression: string): IBindingEngineExpressionObserver {
    const scope = Scope.create(bindingContext, {}, true);
    return {
      subscribe: callback => {
        const observer = new ExpressionWatcher(scope, null!, this.observerLocator, this.parser.parse(expression, ExpressionType.IsProperty), callback);
        observer.bind();
        return {
          dispose: () => {
            observer.unbind();
          }
        };
      }
    };
  }
}

export type IBindingEnginePropertyObserverCallback = (newValue: unknown, oldValue: unknown) => unknown;
export interface IBindingEnginePropertyObserver {
  subscribe: (callback: IBindingEnginePropertyObserverCallback) => IDisposable;
}

export type IBindingEngineCollectionObserverCallback = (collection: Collection, indexMap: IndexMap) => unknown;
export interface IBindingEngineCollectionObserver {
  subscribe: (callback: IBindingEngineCollectionObserverCallback) => IDisposable;
}

export type IBindingEngineExpressionObserverCallback = (newValue: unknown, oldValue: unknown) => unknown;
export interface IBindingEngineExpressionObserver {
  subscribe: (callback: IBindingEngineExpressionObserverCallback) => IDisposable;
}
