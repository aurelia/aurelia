import { IContainer, Registration } from '@aurelia/kernel';
import { IReducer, IRegistrableReducer } from './interfaces';

// export interface IStateAction<Type = unknown, Payload = unknown> {
//   type: Type;
//   payload: Payload;
// }

const reducerSymbol = '__reducer__';
export const Reducer = Object.freeze(new class {
  public define<T extends IReducer>(action: T): IRegistrableReducer;
  public define<T extends IReducer>(type: unknown, action: T): IRegistrableReducer;
  public define<T extends IReducer>(actionOrType: string | T, action?: T): IRegistrableReducer {
    const reg: [unknown, T] = typeof actionOrType === 'string'
      ? [actionOrType, action!]
      : [actionOrType, actionOrType];
    const $action = reg[1];
    function registry(state: any, actionType: unknown, ...params: any[]): unknown {
      return $action(state, actionType, ...params);
    }
    registry[reducerSymbol] = true;
    registry.register = function (c: IContainer) {
      Registration.instance(IReducer, reg).register(c);
    };

    return registry as unknown as IRegistrableReducer;
  }

  public isType = <T>(r: unknown): r is IReducer<T> => typeof r === 'function' && reducerSymbol in r;
}()) as {
  define<T extends IReducer>(action: T): IRegistrableReducer;
  define<T extends IReducer>(name: string, action: T): IRegistrableReducer;
  define<T extends IReducer>(actionOrName: string | T, action?: T): IRegistrableReducer;
  isType<T extends object>(r: unknown): r is IReducer<T>;
};
