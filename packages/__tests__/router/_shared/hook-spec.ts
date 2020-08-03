/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { TaskQueuePriority } from '@aurelia/runtime';
import { setTimeoutWaiter, delayedTaskWaiter, asyncTaskWaiter, taskLoopWaiter } from './waiters';
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
          let i = -1;
          function next() {
            if (++i < count) {
              return Promise.resolve().then(next);
            }
            return getValue();
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

        await setTimeoutWaiter(ctx, 0, label);
        return getValue();
      },
    } as IHookSpec<T>,
    yieldDelayedMicroTask_1: {
      name,
      ticks: -1,
      type: 'yieldDelayedMicroTask_1',
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await delayedTaskWaiter(ctx, 1, TaskQueuePriority.microTask, label);
        return getValue();
      },
    } as IHookSpec<T>,
    yieldDelayedMacroTask_1: {
      name,
      ticks: -1,
      type: 'yieldDelayedMacroTask_1',
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await delayedTaskWaiter(ctx, 1, TaskQueuePriority.macroTask, label);
        return getValue();
      },
    } as IHookSpec<T>,
    yieldDelayedRenderTask_1: {
      name,
      ticks: -1,
      type: 'yieldDelayedRenderTask_1',
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await delayedTaskWaiter(ctx, 1, TaskQueuePriority.render, label);
        return getValue();
      },
    } as IHookSpec<T>,
    yieldAsyncMicroTask_1: {
      name,
      ticks: -1,
      type: 'yieldAsyncMicroTask_1',
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await asyncTaskWaiter(ctx, 1, TaskQueuePriority.microTask, label);
        return getValue();
      },
    } as IHookSpec<T>,
    yieldAsyncMacroTask_1: {
      name,
      ticks: -1,
      type: 'yieldAsyncMacroTask_1',
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await asyncTaskWaiter(ctx, 1, TaskQueuePriority.macroTask, label);
        return getValue();
      },
    } as IHookSpec<T>,
    yieldAsyncRenderTask_1: {
      name,
      ticks: -1,
      type: 'yieldAsyncRenderTask_1',
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await asyncTaskWaiter(ctx, 1, TaskQueuePriority.render, label);
        return getValue();
      },
    } as IHookSpec<T>,
    yieldMacroTaskLoop_1: {
      name,
      ticks: -1,
      type: 'yieldMacroTaskLoop_1',
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await taskLoopWaiter(ctx, 1, TaskQueuePriority.macroTask, label);
        return getValue();
      },
    } as IHookSpec<T>,
    yieldMacroTaskLoop_2: {
      name,
      ticks: -1,
      type: 'yieldMacroTaskLoop_2',
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await taskLoopWaiter(ctx, 2, TaskQueuePriority.macroTask, label);
        return getValue();
      },
    } as IHookSpec<T>,
    yieldRenderTaskLoop_1: {
      name,
      ticks: -1,
      type: 'yieldRenderTaskLoop_1',
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await taskLoopWaiter(ctx, 1, TaskQueuePriority.render, label);
        return getValue();
      },
    } as IHookSpec<T>,
    yieldRenderTaskLoop_2: {
      name,
      ticks: -1,
      type: 'yieldRenderTaskLoop_2',
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await taskLoopWaiter(ctx, 2, TaskQueuePriority.render, label);
        return getValue();
      },
    } as IHookSpec<T>,
  };
}

export const hookSpecsMap = {
  beforeBind: getHookSpecs('beforeBind'),
  afterBind: getHookSpecs('afterBind'),
  afterAttach: getHookSpecs('afterAttach'),
  afterAttachChildren: getHookSpecs('afterAttachChildren'),

  beforeDetach: getHookSpecs('beforeDetach'),
  beforeUnbind: getHookSpecs('beforeUnbind'),
  afterUnbind: getHookSpecs('afterUnbind'),
  afterUnbindChildren: getHookSpecs('afterUnbindChildren'),

  dispose: getHookSpecs('dispose').sync,

  canLoad: getHookSpecs('canLoad'),
  load: getHookSpecs('load'),
  canUnload: getHookSpecs('canUnload'),
  unload: getHookSpecs('unload'),
};
