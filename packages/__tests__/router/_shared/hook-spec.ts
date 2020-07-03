/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { TaskQueuePriority } from '@aurelia/runtime';
import { setTimeoutWaiter, delayedTaskWaiter, asyncTaskWaiter, taskLoopWaiter } from './waiters';
import { HookName } from './hook-invocation-tracker';
import { ITestRouteViewModel } from './view-models';

export interface IHookSpec<T extends HookName> {
  invoke(
    vm: ITestRouteViewModel,
    getValue: () => ReturnType<ITestRouteViewModel[T]>,
  ): ReturnType<ITestRouteViewModel[T]>;
}

function getHookSpecs<T extends HookName>(name: T) {
  return {
    sync: {
      invoke(_vm, getValue) {
        return getValue();
      },
      toString() {
        return `${name}.sync`;
      },
    } as IHookSpec<T>,
    async1: {
      async invoke(_vm, getValue) {
        await Promise.resolve();
        return getValue();
      },
      toString() {
        return `${name}.async1`;
      },
    } as IHookSpec<T>,
    async2: {
      async invoke(_vm, getValue) {
        await Promise.resolve();
        await Promise.resolve();
        return getValue();
      },
      toString() {
        return `${name}.async2`;
      },
    } as IHookSpec<T>,
    setTimeout_0: {
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await setTimeoutWaiter(ctx, 0, label);
        return getValue();
      },
      toString() {
        return `${name}.setTimeout_0`;
      },
    } as IHookSpec<T>,
    yieldDelayedMicroTask_1: {
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await delayedTaskWaiter(ctx, 1, TaskQueuePriority.microTask, label);
        return getValue();
      },
      toString() {
        return `${name}.yieldDelayedMicroTask_1`;
      },
    } as IHookSpec<T>,
    yieldDelayedMacroTask_1: {
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await delayedTaskWaiter(ctx, 1, TaskQueuePriority.macroTask, label);
        return getValue();
      },
      toString() {
        return `${name}.yieldDelayedMacroTask_1`;
      },
    } as IHookSpec<T>,
    yieldDelayedRenderTask_1: {
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await delayedTaskWaiter(ctx, 1, TaskQueuePriority.render, label);
        return getValue();
      },
      toString() {
        return `${name}.yieldDelayedRenderTask_1`;
      },
    } as IHookSpec<T>,
    yieldAsyncMicroTask_1: {
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await asyncTaskWaiter(ctx, 1, TaskQueuePriority.microTask, label);
        return getValue();
      },
      toString() {
        return `${name}.yieldAsyncMicroTask_1`;
      },
    } as IHookSpec<T>,
    yieldAsyncMacroTask_1: {
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await asyncTaskWaiter(ctx, 1, TaskQueuePriority.macroTask, label);
        return getValue();
      },
      toString() {
        return `${name}.yieldAsyncMacroTask_1`;
      },
    } as IHookSpec<T>,
    yieldAsyncRenderTask_1: {
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await asyncTaskWaiter(ctx, 1, TaskQueuePriority.render, label);
        return getValue();
      },
      toString() {
        return `${name}.yieldAsyncRenderTask_1`;
      },
    } as IHookSpec<T>,
    yieldMacroTaskLoop_1: {
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await taskLoopWaiter(ctx, 1, TaskQueuePriority.macroTask, label);
        return getValue();
      },
      toString() {
        return `${name}.yieldMacroTaskLoop_1`;
      },
    } as IHookSpec<T>,
    yieldMacroTaskLoop_2: {
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await taskLoopWaiter(ctx, 2, TaskQueuePriority.macroTask, label);
        return getValue();
      },
      toString() {
        return `${name}.yieldMacroTaskLoop_2`;
      },
    } as IHookSpec<T>,
    yieldRenderTaskLoop_1: {
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await taskLoopWaiter(ctx, 1, TaskQueuePriority.render, label);
        return getValue();
      },
      toString() {
        return `${name}.yieldRenderTaskLoop_1`;
      },
    } as IHookSpec<T>,
    yieldRenderTaskLoop_2: {
      async invoke(vm, getValue) {
        const ctx = vm.$controller.context;
        const label = `${vm.name}.${name}`;

        await taskLoopWaiter(ctx, 2, TaskQueuePriority.render, label);
        return getValue();
      },
      toString() {
        return `${name}.yieldRenderTaskLoop_2`;
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
