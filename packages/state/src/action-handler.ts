import { IContainer, Registration } from '@aurelia/kernel';
import { IActionHandler, IRegistrableReducer } from './interfaces';

const actionHandlerSymbol = '__reducer__';
export const ActionHandler = Object.freeze({
  define<T extends IActionHandler>(reducer: T): IRegistrableReducer {
    function registry(state: any, action: unknown, ...params: any[]): unknown {
      return reducer(state, action, ...params);
    }
    registry[actionHandlerSymbol] = true;
    registry.register = function (c: IContainer) {
      Registration.instance(IActionHandler, reducer).register(c);
    };

    return registry as unknown as IRegistrableReducer;
  },

  isType: <T>(r: unknown): r is IActionHandler<T> => typeof r === 'function' && actionHandlerSymbol in r,
});
