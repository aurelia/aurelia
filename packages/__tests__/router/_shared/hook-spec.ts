/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { setTimeoutWaiter } from './waiters';
import { HookName } from './hook-invocation-tracker';
import { ITestRouteViewModel } from './view-models';

export interface IHookSpec<T extends HookName> {
  name: T;
  type: string;
  ticks: number;
  invoke(
    vm: ITestRouteViewModel,
    getValue: () => ReturnType<ITestRouteViewModel[T]>,
  ): ReturnType<ITestRouteViewModel[T]>;
}

function getHookSpecs<T extends HookName>(name: T) {
  return {
    sync: {
      name,
      type: 'sync',
      ticks: 0,
      invoke(_vm, getValue) {
        return getValue();
      },
    } as IHookSpec<T>,
    async(count: number) {
      return {
        name,
        type: `async${count}`,
        ticks: count,
        invoke(_vm, getValue) {
          const value = getValue();
          let i = -1;
          function next() {
            if (++i < count) {
              return Promise.resolve().then(next);
            }
            return value;
          }
          return next();
        },
      } as IHookSpec<T>;
    },
    setTimeout_0: {
      name,
      ticks: -1,
      type: 'setTimeout_0',
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        return setTimeoutWaiter(ctx, 0, label)
          .then(() => getValue() as any
        );

        // console.log('setTimeout_0 before await');
        // await setTimeoutWaiter(ctx, 0, label);
        // console.log('setTimeout_0 after await');
        // return getValue();
      },
    } as IHookSpec<T>,
  };
}

export const hookSpecsMap = {
  binding: getHookSpecs('binding'),
  afterBind: getHookSpecs('afterBind'),
  afterAttach: getHookSpecs('afterAttach'),
  afterAttachChildren: getHookSpecs('afterAttachChildren'),

  beforeDetach: getHookSpecs('beforeDetach'),
  beforeUnbind: getHookSpecs('beforeUnbind'),

  dispose: getHookSpecs('dispose').sync,

  canLoad: getHookSpecs('canLoad'),
  load: getHookSpecs('load'),
  canUnload: getHookSpecs('canUnload'),
  unload: getHookSpecs('unload'),
};
