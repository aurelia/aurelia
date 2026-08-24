/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { isPromise } from '@aurelia/kernel';

import type { Scope } from '@aurelia/runtime';
import type {
  Controller,
  IActivationHooks,
  IHydratedController,
} from './controller';
import type { LifecycleHooksEntry } from './lifecycle-hooks';
import { createMappedErrorMessage, ErrorNames, LifecycleSelfAwaitReason } from '../errors';

/**
 * Promoted state for a Controller lifecycle whose ownership can no longer be
 * represented by the synchronous counters alone. Promotion happens after a
 * hook yields, a failure needs a stable result, or another transition joins or
 * overlaps it. A requested opposite transition may still finish synchronously.
 *
 * One operation is shared by the initiator subtree. Each participating
 * Controller has a step that fixes its parent chain and owns its local result,
 * so callbacks never have to recover operation identity from mutable
 * Controller.parent/$initiator fields after an await.
 *
 * @internal
 */
export type LifecycleOperationKind = 'activate' | 'deactivate';
export type LifecycleOperationMode = 'running' | 'activation-cancellation' | 'settled';
export type InvocableLifecyclePhase = 'binding' | 'bound' | 'attaching' | 'attached' | 'detaching' | 'unbinding';

export interface TransitionRequest {
  readonly active: boolean;
  readonly initiator: Controller;
  readonly parent: Controller | null;
  readonly scope?: Scope | null;
}

export interface LifecycleErrorRecord {
  readonly order: number;
  readonly error: unknown;
}

export interface LifecycleOperation {
  readonly initiator: Controller;
  kind: LifecycleOperationKind;
  mode: LifecycleOperationMode;
  /** Latest requested end state; opposite requests update this instead of resetting live counters. */
  desired: TransitionRequest;
  /** Whole-operation result owned by the initiator and used as the cross-operation join target. */
  drain?: LifecycleDeferred;
  /** Stable teardown list; the public Controller list is cleared as cleanup commits. */
  teardownHead: Controller | null;
  teardownTail: Controller | null;
  /** Ancestor drain this independently initiated child operation has joined. */
  joinedInto?: Promise<void>;
}

export interface ControllerStep {
  readonly operation: LifecycleOperation;
  readonly controller: Controller;
  /** Immutable operation ancestry; unlike Controller.parent it survives unbind. */
  readonly parent: ControllerStep | null;
  /** Captured structural parent used when a later ancestor operation joins this step. */
  readonly parentController: Controller | null;
  /** Local controller/subtree result; the initiator result remains the whole-operation drain. */
  result?: LifecycleDeferred;
  firstError?: LifecycleErrorRecord;
  /** Dynamic owners defer disposal until this step has completed structural cleanup. */
  disposeRequested: boolean;
}

export interface LifecycleDeferred {
  readonly promise: Promise<void>;
  readonly resolve: () => void;
  readonly reject: (error: unknown) => void;
}

/** Internal order carrier; Controller ultimately exposes the original raw error value. */
export class OrderedLifecycleFailure {
  public constructor(
    public readonly order: number,
    public readonly error: unknown,
  ) {}
}

export class LifecycleSelfAwaitError extends Error {
  public constructor(controllerName: string, reason: LifecycleSelfAwaitReason) {
    super(createMappedErrorMessage(ErrorNames.controller_lifecycle_self_await, controllerName, reason));
  }
}

// Order is process-wide because promotion may happen only after user code has
// thrown/yielded, and nested re-entrant work must sort after the participant
// that caused it. This lets all-settled phases report the first accepted failure
// rather than the first Promise to reject.
let participantOrder = 0;
// While a hook executes synchronously, a same-operation re-entrant Controller
// call must not hand that hook the drain which is waiting for it. Nested hook
// invocation restores the previous marker on return.
let activeOperation: LifecycleOperation | undefined;
// Preserve acceptance order when a provider returns either its raw Promise or
// an aggregate Promise produced by the multi-hook path.
const promiseOrders = new WeakMap<Promise<unknown>, number>();
// Only framework-created result Promises are tagged. Exact identity is enough
// to reject direct self-awaits without wrapping/changing the public Promise.
const promiseSteps = new WeakMap<Promise<unknown>, ControllerStep>();

export const reserveLifecycleParticipant = (): number => ++participantOrder;
export const getActiveLifecycleOperation = (): LifecycleOperation | undefined => activeOperation;
export const getLifecyclePromiseOrder = (promise: Promise<unknown>): number | undefined => promiseOrders.get(promise);
export const getLifecyclePromiseStep = (promise: Promise<unknown>): ControllerStep | undefined => promiseSteps.get(promise);

export const isLifecycleOperationJoinedInto = (
  operation: LifecycleOperation,
  promise: Promise<unknown>,
): boolean => {
  // Each join points at the ancestor operation's tagged drain. Follow those
  // immutable ownership edges so nested independent owners cannot hide a cycle
  // behind the immediate parent drain.
  let joinedInto = operation.joinedInto;
  while (joinedInto !== void 0) {
    if (joinedInto === promise) {
      return true;
    }
    // `joinedInto` is only assigned an operation drain, and every drain is
    // tagged by createLifecycleDeferred while the operation still owns it.
    const ancestorStep = promiseSteps.get(joinedInto)!;
    joinedInto = ancestorStep.operation.joinedInto;
  }
  return false;
};

export const createLifecycleDeferred = (step: ControllerStep): LifecycleDeferred => {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // Step identity enables exact self-await detection without wrapping the
  // public result and changing its timing or identity.
  promiseSteps.set(promise, step);
  return { promise, resolve, reject };
};

export const recordStepError = (
  source: ControllerStep,
  order: number,
  error: unknown,
): void => {
  const record: LifecycleErrorRecord = {
    order,
    error,
  };
  // Cache the first relevant error at every subtree boundary. This is what
  // allows a descendant result to settle before the stronger initiator drain.
  let step: ControllerStep | null = source;
  while (step !== null) {
    if (step.firstError === void 0 || order < step.firstError.order) {
      step.firstError = record;
    }
    step = step.parent;
  }
};

export const getOperationError = (step: ControllerStep): LifecycleErrorRecord | undefined => step.firstError;

type ActivationHookEntry =
  | LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'binding'>
  | LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'bound'>
  | LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'attaching'>
  | LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'attached'>
  | LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'detaching'>
  | LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'unbinding'>;

interface OrderedLifecycleValue {
  readonly order: number;
  readonly value: unknown;
}

/** Value wrapper so accepted async siblings can quiesce before a synchronous failure is reported. */
class SynchronousLifecycleError {
  public constructor(public readonly error: unknown) {}
}

export function invokeControllerPhase(
  controller: Controller,
  phase: InvocableLifecyclePhase,
  initiator: IHydratedController,
  parent: IHydratedController | null,
  operation: LifecycleOperation | undefined,
): void | Promise<void> {
  // Controller's phase dispatch excludes synthetic views before reaching this
  // helper; only custom-element and custom-attribute controllers own hooks.
  const hooks = controller.lifecycleHooks![phase] as readonly ActivationHookEntry[] | undefined;
  const hookCount = hooks?.length ?? 0;
  const hasVmHook = hasControllerVmHook(controller, phase);
  const count = hookCount + (hasVmHook ? 1 : 0);
  if (count === 0) return;

  const firstOrder = reserveLifecycleParticipant();
  const previous = activeOperation;
  activeOperation = operation;
  try {
    if (count === 1) {
      // Preserve the exact Promise and synchronous fast path for the common
      // one-hook case. Wrapping it would add a tick to every async hook.
      try {
        const result = hookCount === 1
          ? invokeControllerLifecycleHook(controller, phase, hooks![0], initiator, parent)
          : invokeControllerVmHook(controller, phase, initiator, parent);
        if (isPromise(result) && isControllerOperationPromise(controller, result)) {
          throw new LifecycleSelfAwaitError(controller.name, LifecycleSelfAwaitReason.operation);
        }
        if (isPromise(result)) promiseOrders.set(result, firstOrder);
        return result;
      } catch (error) {
        throw new OrderedLifecycleFailure(firstOrder, error);
      }
    }

    const values: OrderedLifecycleValue[] = Array(count);
    let accepted = 0;
    for (let i = 0; i < hookCount; ++i) {
      const order = i === 0 ? firstOrder : reserveLifecycleParticipant();
      try {
        let value: unknown = invokeControllerLifecycleHook(controller, phase, hooks![i], initiator, parent);
        if (isPromise(value) && isControllerOperationPromise(controller, value)) {
          value = new SynchronousLifecycleError(
            new LifecycleSelfAwaitError(controller.name, LifecycleSelfAwaitReason.operation),
          );
        }
        values[accepted++] = { order, value };
        // A synchronous failure stops admission of later providers. Promises
        // returned by providers already called still settle before it surfaces.
        if (value instanceof SynchronousLifecycleError) return settleLifecycleValues(values, accepted);
      } catch (error) {
        values[accepted++] = { order, value: new SynchronousLifecycleError(error) };
        return settleLifecycleValues(values, accepted);
      }
    }
    if (hasVmHook) {
      const order = hookCount === 0 ? firstOrder : reserveLifecycleParticipant();
      try {
        let value: unknown = invokeControllerVmHook(controller, phase, initiator, parent);
        if (isPromise(value) && isControllerOperationPromise(controller, value)) {
          value = new SynchronousLifecycleError(
            new LifecycleSelfAwaitError(controller.name, LifecycleSelfAwaitReason.operation),
          );
        }
        values[accepted++] = { order, value };
      } catch (error) {
        values[accepted++] = { order, value: new SynchronousLifecycleError(error) };
      }
    }
    return settleLifecycleValues(values, accepted);
  } finally {
    activeOperation = previous;
  }
}

function isControllerOperationPromise(controller: Controller, promise: Promise<unknown>): boolean {
  const controllerStep = controller._operation;
  if (
    controllerStep?.operation.kind === 'activate'
    && isLifecycleOperationJoinedInto(controllerStep.operation, promise)
  ) {
    // A separately initiated activating child can later be enrolled in an
    // ancestor operation. Once enrolled, awaiting that ancestor recreates
    // self-await across otherwise independent operation identities. Deactivation
    // performs this check after hook invocation so it preserves its established
    // local-drain rejection timing.
    return true;
  }
  const awaitedStep = getLifecyclePromiseStep(promise);
  if (controllerStep === null || awaitedStep === void 0 || awaitedStep.operation !== controllerStep.operation) {
    return false;
  }

  // Awaiting this controller's own result, or an ancestor result, creates a
  // cycle because that result cannot settle until this hook completes. A
  // dynamic owner may safely return a descendant's local result: that result
  // settles before the owner's phase participant and is therefore not a cycle.
  let current: ControllerStep | null = controllerStep;
  while (current !== null) {
    if (current === awaitedStep) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function hasControllerVmHook(controller: Controller, phase: InvocableLifecyclePhase): boolean {
  switch (phase) {
    case 'binding': return controller._vmHooks._binding;
    case 'bound': return controller._vmHooks._bound;
    case 'attaching': return controller._vmHooks._attaching;
    case 'attached': return controller._vmHooks._attached;
    case 'detaching': return controller._vmHooks._detaching;
    case 'unbinding': return controller._vmHooks._unbinding;
  }
}

function invokeControllerLifecycleHook(
  controller: Controller,
  phase: InvocableLifecyclePhase,
  entry: ActivationHookEntry,
  initiator: IHydratedController,
  parent: IHydratedController | null,
): void | Promise<void> {
  const vm = controller.viewModel!;
  switch (phase) {
    case 'binding': return (entry as LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'binding'>).instance.binding!(vm, initiator, parent!);
    case 'bound': return (entry as LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'bound'>).instance.bound!(vm, initiator, parent!);
    case 'attaching': return (entry as LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'attaching'>).instance.attaching!(vm, initiator, parent!);
    case 'attached': return (entry as LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'attached'>).instance.attached!(vm, initiator);
    case 'detaching': return (entry as LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'detaching'>).instance.detaching!(vm, initiator, parent!);
    case 'unbinding': return (entry as LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'unbinding'>).instance.unbinding!(vm, initiator, parent!);
  }
}

function invokeControllerVmHook(
  controller: Controller,
  phase: InvocableLifecyclePhase,
  initiator: IHydratedController,
  parent: IHydratedController | null,
): void | Promise<void> {
  const vm = controller.viewModel!;
  switch (phase) {
    case 'binding': return vm.binding(initiator, parent);
    case 'bound': return vm.bound(initiator, parent);
    case 'attaching': return vm.attaching(initiator, parent);
    case 'attached': return vm.attached(initiator);
    case 'detaching': return vm.detaching(initiator, parent);
    case 'unbinding': return vm.unbinding(initiator, parent);
  }
}

function settleLifecycleValues(
  values: readonly OrderedLifecycleValue[],
  length: number,
): void | Promise<void> {
  let promises: { readonly order: number; readonly promise: Promise<unknown> }[] | undefined;
  let firstOrder = Number.POSITIVE_INFINITY;
  let firstError: unknown;
  const record = (order: number, error: unknown): void => {
    if (order < firstOrder) {
      firstOrder = order;
      firstError = error;
    }
  };
  for (let i = 0; i < length; ++i) {
    const { order, value } = values[i];
    if (value instanceof SynchronousLifecycleError) record(order, value.error);
    else if (isPromise(value)) (promises ??= []).push({ order, promise: value });
  }
  const throwFirst = (): void => {
    if (firstOrder !== Number.POSITIVE_INFINITY) throw new OrderedLifecycleFailure(firstOrder, firstError);
  };
  if (promises === void 0) {
    throwFirst();
    return;
  }
  if (promises.length === 1 && firstOrder === Number.POSITIVE_INFINITY) {
    // Returning the provider Promise directly preserves legacy timing while
    // recording its participant order for the Controller observer.
    const participant = promises[0];
    promiseOrders.set(participant.promise, participant.order);
    return participant.promise as Promise<void>;
  }
  // Preserve registration-order error selection across providers that were
  // already invoked. This makes the reported error deterministic without
  // admitting more hooks after a synchronous failure.
  const result = Promise.allSettled(promises.map(x => x.promise)).then(results => {
    for (let i = 0; i < results.length; ++i) {
      const result = results[i];
      if (result.status === 'rejected') record(promises[i].order, result.reason);
    }
    throwFirst();
  });
  // The aggregate is one outer Controller participant. Any contained
  // OrderedLifecycleFailure still carries the exact provider order.
  promiseOrders.set(result, values[0].order);
  return result;
}
