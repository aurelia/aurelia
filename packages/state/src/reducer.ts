import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';

// export interface IStateAction<Type = unknown, Payload = unknown> {
//   type: Type;
//   payload: Payload;
// }

export type IReducerAction<T> = (state: T | Promise<T>, ...params: any) => T | Promise<T>;
export const IReducerAction = DI.createInterface<IReducerAction<object>>('IReducerAction');

export type IRegistrableReducer = IReducerAction<any> & IRegistry;

const reducerActionName = '__reducer__';
export const Action = Object.freeze(new class {
  public define<T extends IReducerAction<object>>(action: T): T & IRegistry;
  public define<T extends IReducerAction<object>>(name: string, action: T): T & IRegistry;
  public define<T extends IReducerAction<object>>(actionOrName: string | T, action?: T): T & IRegistry {
    const reg: [string | T, T] = typeof actionOrName === 'string'
      ? [actionOrName, action!]
      : [actionOrName, actionOrName];
    const $action = reg[1];
    function registry(state: object, ...params: any[]): unknown {
      return $action(state, ...params);
    }
    registry[reducerActionName] = true;
    registry.register = function (c: IContainer) {
      Registration.instance(IReducerAction, reg).register(c);
    };

    return registry as unknown as T & IRegistry;
  }

  public isType = <T extends object>(r: unknown): r is IReducerAction<T> => typeof r === 'function' && reducerActionName in r;
}());
