import { IContainer, Registration } from '@aurelia/kernel';
import { IActionHandler, IRegistrableAction } from './interfaces';

const actionHandlerSymbol = '__au_ah__';
export const ActionHandler = Object.freeze({
  define<T extends IActionHandler>(actionHandler: T): IRegistrableAction {
    function registry(state: any, action: unknown): unknown {
      return actionHandler(state, action);
    }
    registry[actionHandlerSymbol] = true;
    registry.register = function (c: IContainer) {
      Registration.instance(IActionHandler, actionHandler).register(c);
    };

    return registry as unknown as IRegistrableAction;
  },

  isType: <T>(r: unknown): r is IActionHandler<T> => typeof r === 'function' && actionHandlerSymbol in r,
});
