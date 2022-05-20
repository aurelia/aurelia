import { IContainer, Registration } from '@aurelia/kernel';
import { IReducer, IRegistrableReducer } from './interfaces';

// export interface IStateAction<Type = unknown, Payload = unknown> {
//   type: Type;
//   payload: Payload;
// }

const reducerSymbol = '__reducer__';
export const Reducer = Object.freeze({
  define<T extends IReducer>(reducer: T): IRegistrableReducer {
    function registry(state: any, actionType: unknown, ...params: any[]): unknown {
      return reducer(state, actionType, ...params);
    }
    registry[reducerSymbol] = true;
    registry.register = function (c: IContainer) {
      Registration.instance(IReducer, reducer).register(c);
    };

    return registry as unknown as IRegistrableReducer;
  },

  isType: <T>(r: unknown): r is IReducer<T> => typeof r === 'function' && reducerSymbol in r,
});
