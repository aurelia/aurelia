/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { TaskQueuePriority } from '@aurelia/runtime';
import { setTimeoutWaiter, delayedTaskWaiter, asyncTaskWaiter, taskLoopWaiter } from './waiters';
import { HookName } from './hook-invocation-tracker';
import { ITestRouteViewModel } from './view-models';

export interface IHookSpec<T extends HookName> {
  name: T;
  type: string;
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
      invoke(_vm, getValue) {
        return getValue();
      },
    } as IHookSpec<T>,
    async1: {
      name,
      type: 'async1',
      async invoke(_vm, getValue) {
        await Promise.resolve();
        return getValue();
      },
    } as IHookSpec<T>,
    async2: {
      name,
      type: 'async2',
      async invoke(_vm, getValue) {
        await Promise.resolve();
        await Promise.resolve();
        return getValue();
      },
    } as IHookSpec<T>,
    setTimeout_0: {
      name,
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

export const hookSpecs = {
  beforeBind: getHookSpecs('beforeBind'),
  afterBind: getHookSpecs('afterBind'),
  afterAttach: getHookSpecs('afterAttach'),
  afterAttachChildren: getHookSpecs('afterAttachChildren'),

  beforeDetach: getHookSpecs('beforeDetach'),
  beforeUnbind: getHookSpecs('beforeUnbind'),
  afterUnbind: getHookSpecs('afterUnbind'),
  afterUnbindChildren: getHookSpecs('afterUnbindChildren'),

  dispose: getHookSpecs('dispose').sync,

  canEnter: getHookSpecs('canEnter'),
  enter: getHookSpecs('enter'),
  canLeave: getHookSpecs('canLeave'),
  leave: getHookSpecs('leave'),
};
