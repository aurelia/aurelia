import { IContainer, Registration } from '@aurelia/kernel';
import { IReducerAction, IRegistrableReducer } from './interfaces';

// export interface IStateAction<Type = unknown, Payload = unknown> {
//   type: Type;
//   payload: Payload;
// }

const reducerActionName = '__reducer__';
export const Action = Object.freeze(new class {
  public define<T extends IReducerAction>(action: T): IRegistrableReducer;
  public define<T extends IReducerAction>(name: string, action: T): IRegistrableReducer;
  public define<T extends IReducerAction>(actionOrName: string | T, action?: T): IRegistrableReducer {
    const reg: [string | T, T] = typeof actionOrName === 'string'
      ? [actionOrName, action!]
      : [actionOrName, actionOrName];
    const $action = reg[1];
    function registry(state: any, ...params: any[]): unknown {
      return $action(state, ...params);
    }
    registry[reducerActionName] = true;
    registry.register = function (c: IContainer) {
      Registration.instance(IReducerAction, reg).register(c);
    };

    return registry as unknown as IRegistrableReducer;
  }

  public isType = <T>(r: unknown): r is IReducerAction<T> => typeof r === 'function' && reducerActionName in r;
}()) as {
  define<T extends IReducerAction>(action: T): IRegistrableReducer;
  define<T extends IReducerAction>(name: string, action: T): IRegistrableReducer;
  define<T extends IReducerAction>(actionOrName: string | T, action?: T): IRegistrableReducer;
  isType<T extends object>(r: unknown): r is IReducerAction<T>;
};
