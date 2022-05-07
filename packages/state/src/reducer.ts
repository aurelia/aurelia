import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';

export interface IStateAction<Type = unknown, Payload = unknown> {
  type: Type;
  payload: Payload;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IReducer = <A extends IStateAction<any, any>>(state: any, action: A) => unknown;
export const IReducer = DI.createInterface<IReducer>('IReducer');

export type IRegistrableReducer = IReducer & IRegistry;

const reducerSymbol = '__reducer__';
export const Reducer = {
  define<T extends IReducer>(reducer: T): T & IRegistry {
    function registry(state: object, action: IStateAction): unknown {
      return reducer(state, action);
    }
    registry[reducerSymbol] = true;
    registry.register = function (c: IContainer) {
      Registration.instance(IReducer, reducer).register(c);
    };

    return registry as unknown as T & IRegistry;
  },
  isType: (r: unknown) => typeof r === 'function' && reducerSymbol in r,
};
