import { Writable } from '@aurelia/kernel';
import {
  AccessScopeExpression,
  addBinding,
  PropertyBinding,
  BindingContext,
  BindingIdentifier,
  BindingMode,
  BindingStrategy,
  ForOfStatement,
  IDOM,
  ILifecycle,
  IObservedArray,
  IObserverLocator,
  IController,
  IScope,
  ITemplate,
  LifecycleFlags,
  ProxyObserver,
  Repeat,
  Scope,
  ViewFactory,
  Controller,
  IScheduler,
} from '@aurelia/runtime';
import {
  AuDOM,
  AuDOMConfiguration,
  AuNode,
  AuNodeSequence,
  eachCartesianJoin,
  assert,
} from '@aurelia/testing';

describe(`Repeat`, function () {
  function runBindLifecycle(lifecycle: ILifecycle, sut: Repeat<IObservedArray, AuNode>, flags: LifecycleFlags, scope: IScope): void {
    lifecycle.bound.begin();
    sut.$controller.bind(flags, scope);
    lifecycle.bound.end(flags);
  }
  function runUnbindLifecycle(lifecycle: ILifecycle, sut: Repeat<IObservedArray, AuNode>, flags: LifecycleFlags): void {
    lifecycle.unbound.begin();
    sut.$controller.unbind(flags);
    lifecycle.unbound.end(flags);
  }
  function runAttachLifecycle(lifecycle: ILifecycle, sut: Repeat<IObservedArray, AuNode>, flags: LifecycleFlags): void {
    lifecycle.attached.begin();
    sut.$controller.attach(flags);
    lifecycle.attached.end(flags);
  }
  function runDetachLifecycle(lifecycle: ILifecycle, sut: Repeat<IObservedArray, AuNode>, flags: LifecycleFlags): void {
    lifecycle.detached.begin();
    sut.$controller.detach(flags);
    lifecycle.detached.end(flags);
  }

  interface Spec {
    t: string;
  }
  interface StrategySpec extends Spec {
    strategy: BindingStrategy;
  }
  interface DuplicateOperationSpec extends Spec {
    bindTwice: boolean;
    newScopeForDuplicateBind: boolean;
    attachTwice: boolean;
    detachTwice: boolean;
    unbindTwice: boolean;
  }
  interface ChangeSpec {
    op: 'change';
    changes: { index: number; newValue: unknown }[];
  }
  interface AssignSpec {
    op: 'assign';
    newItems: unknown[];
  }
  interface PopSpec {
    op: 'pop';
    count: number;
  }
  interface UnshiftSpec {
    op: 'unshift';
    items: unknown[];
  }
  interface ShiftSpec {
    op: 'shift';
    count: number;
  }
  interface PushSpec {
    op: 'push';
    items: unknown[];
  }
  interface SpliceSpec {
    op: 'splice';
    start: number;
    deleteCount?: number;
    items?: unknown[];
  }
  interface ReverseSpec {
    op: 'reverse';
  }
  interface SortSpec {
    op: 'sort';
    fn?(a: unknown, b: unknown): number;
  }
  type MutationSpec = ChangeSpec | AssignSpec | PopSpec | UnshiftSpec | ShiftSpec | PushSpec | SpliceSpec | ReverseSpec | SortSpec;
  interface BindSpec extends Spec {
    items: unknown[];
    mutations: MutationSpec[];
    flush: boolean;
  }
  interface FlagsSpec extends Spec {
    bindFlags1: LifecycleFlags;
    attachFlags1: LifecycleFlags;
    detachFlags1: LifecycleFlags;
    unbindFlags1: LifecycleFlags;

    bindFlags2: LifecycleFlags;
    attachFlags2: LifecycleFlags;
    detachFlags2: LifecycleFlags;
    unbindFlags2: LifecycleFlags;
  }

  function applyMutations(sut: Repeat<IObservedArray, AuNode>, specs: MutationSpec[]): void {
    let spec: MutationSpec;
    let i = 0;
    const len = specs.length;
    for (; i < len; ++i) {
      spec = specs[i];
      switch (spec.op) {
        case 'change':
          for (const change of spec.changes) {
            sut.items[change.index] = change.newValue;
          }
          break;
        case 'assign':
          sut.items = spec.newItems.slice();
          break;
        case 'pop':
          {
            let j = 0;
            for (; j < spec.count; ++j) {
              sut.items.pop();
            }
          }
          break;
        case 'shift':
          {
            let j = 0;
            for (; j < spec.count; ++j) {
              sut.items.shift();
            }
          }
          break;
        case 'unshift':
          sut.items.unshift(...spec.items);
          break;
        case 'push':
          sut.items.push(...spec.items);
          break;
        case 'splice':
          sut.items.splice(spec.start, spec.deleteCount, ...(spec.items ? spec.items : []));
          break;
        case 'reverse':
          sut.items.reverse();
          break;
        case 'sort':
          sut.items.sort(spec.fn);
      }
    }

  }

  const strategySpecs: StrategySpec[] = [
    { t: '1', strategy: BindingStrategy.getterSetter },
    { t: '2', strategy: BindingStrategy.proxies },
  ];

  const duplicateOperationSpecs: DuplicateOperationSpec[] = [
    { t: '1', bindTwice: false, newScopeForDuplicateBind: false, attachTwice: false, detachTwice: false, unbindTwice: false },
    { t: '2', bindTwice: true,  newScopeForDuplicateBind: false, attachTwice: true,  detachTwice: true,  unbindTwice: true  },
    { t: '3', bindTwice: true,  newScopeForDuplicateBind: true,  attachTwice: true,  detachTwice: true,  unbindTwice: true  }
  ];

  const bindSpecs: BindSpec[] = [
    { t: '01', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'assign', newItems: ['d', 'e', 'f'] }
    ] },
    { t: '02', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'assign', newItems: ['a', 'b', 'c'] }
    ] },
    { t: '03', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'assign', newItems: ['a', 'b', 'c'] },
      { op: 'assign', newItems: ['d', 'e', 'f'] }
    ] },
    { t: '04', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'push', items: ['d', 'e', 'f'] }
    ] },
    { t: '05', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'push', items: ['d', 'e', 'f'] },
      { op: 'push', items: ['d', 'e', 'f'] }
    ] },
    { t: '06', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'push', items: ['d', 'e', 'f'] },
      { op: 'assign', newItems: [] },
      { op: 'push', items: ['d', 'e', 'f'] }
    ] },
    { t: '07', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'unshift', items: ['d', 'e', 'f'] }
    ] },
    { t: '08', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'pop', count: 1 }
    ] },
    { t: '09', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'pop', count: 3 }
    ] },
    { t: '10', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'shift', count: 1 }
    ] },
    { t: '11', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'shift', count: 3 }
    ] },
    { t: '12', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'pop', count: 1 },
      { op: 'shift', count: 1 }
    ] },
    { t: '13', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'splice', start: 0, deleteCount: 1, items: ['a'] }
    ] },
    { t: '15', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'splice', start: 0, deleteCount: 1, items: ['b'] }
    ] },
    { t: '16', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 1, items: [] }
    ] },
    { t: '17', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 1, items: [] }
    ] },
    { t: '18', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 1, items: ['z'] }
    ] },
    { t: '19', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 2, items: [] }
    ] },
    { t: '20', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 2, items: ['z'] }
    ] },
    { t: '21', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 2, items: ['y', 'z'] }
    ] },
    { t: '22', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 2, items: ['x', 'y', 'z'] }
    ] },
    { t: '23', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 3, items: [] }
    ] },
    { t: '24', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 3, items: ['z'] }
    ] },
    { t: '25', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 3, items: ['y', 'z'] }
    ] },
    { t: '26', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 3, items: ['x', 'y', 'z'] }
    ] },
    { t: '27', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 2, deleteCount: 1, items: [] }
    ] },
    { t: '28', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 2, deleteCount: 1, items: ['z'] }
    ] },
    { t: '29', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 2, deleteCount: 2, items: [] }
    ] },
    { t: '30', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 2, deleteCount: 2, items: ['z'] }
    ] },
    { t: '31', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 2, deleteCount: 2, items: ['y', 'z'] }
    ] },
    { t: '32', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 2, deleteCount: 2, items: ['x', 'y', 'z'] }
    ] },
    { t: '33', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 2, deleteCount: 3, items: [] }
    ] },
    { t: '34', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 2, deleteCount: 3, items: ['z'] }
    ] },
    { t: '35', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 2, deleteCount: 3, items: ['y', 'z'] }
    ] },
    { t: '36', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 2, deleteCount: 3, items: ['x', 'y', 'z'] }
    ] },
    { t: '37', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'shift', count: 1 }
    ] },
    { t: '38', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'shift', count: 2 }
    ] },
    { t: '39', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'shift', count: 3 }
    ] },
    { t: '40', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'shift', count: 1 },
      { op: 'push', items: ['g'] }
    ] },
    { t: '41', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'shift', count: 2 },
      { op: 'push', items: ['g'] }
    ] },
    { t: '42', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'shift', count: 3 },
      { op: 'push', items: ['g'] }
    ] },
    { t: '43', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'shift', count: 1 },
      { op: 'push', items: ['g', 'h'] }
    ] },
    { t: '44', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'shift', count: 2 },
      { op: 'push', items: ['g', 'h'] }
    ] },
    { t: '45', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'shift', count: 3 },
      { op: 'push', items: ['g', 'h'] }
    ] },
    { t: '46', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'reverse' }
    ] },
    { t: '47', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'reverse' },
      { op: 'reverse' }
    ] },
    { t: '48', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'reverse' },
      { op: 'reverse' },
      { op: 'reverse' }
    ] },
    { t: '49', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'reverse' }
    ] },
    { t: '50', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'reverse' },
      { op: 'reverse' }
    ] },
    { t: '51', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'reverse' },
      { op: 'reverse' },
      { op: 'reverse' }
    ] },
    { t: '52', items: ['c', 'b', 'a'], flush: true, mutations: [
      { op: 'sort' }
    ] },
    { t: '53', items: ['c', 'b', 'a'], flush: true, mutations: [
      { op: 'sort' },
      { op: 'reverse' },
      { op: 'sort' }
    ] },
    { t: '54', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 1, items: [] },
    ] },
    { t: '55', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 1, items: [] },
      { op: 'splice', start: 5, deleteCount: 1, items: [] },
    ] },
    { t: '56', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 2, items: [] },
      { op: 'splice', start: 3, deleteCount: 1, items: [] },
    ] },
    { t: '57', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 2, items: [] },
    ] },
    { t: '58', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 2, items: [] },
      { op: 'splice', start: 5, deleteCount: 1, items: [] },
    ] },
    { t: '59', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 1, items: [] },
      { op: 'reverse' },
    ] },
    { t: '60', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 1, items: [] },
      { op: 'splice', start: 5, deleteCount: 1, items: [] },
      { op: 'reverse' },
    ] },
    { t: '61', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 2, items: [] },
      { op: 'splice', start: 3, deleteCount: 1, items: [] },
      { op: 'reverse' },
    ] },
    { t: '62', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 2, items: [] },
      { op: 'reverse' },
    ] },
    { t: '63', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 2, items: [] },
      { op: 'splice', start: 5, deleteCount: 1, items: [] },
      { op: 'reverse' },
    ] },
    { t: '64', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'reverse' },
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 1, items: [] },
    ] },
    { t: '65', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'reverse' },
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 1, items: [] },
      { op: 'splice', start: 5, deleteCount: 1, items: [] },
    ] },
    { t: '66', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'reverse' },
      { op: 'splice', start: 1, deleteCount: 2, items: [] },
      { op: 'splice', start: 3, deleteCount: 1, items: [] },
    ] },
    { t: '67', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'reverse' },
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 2, items: [] },
    ] },
    { t: '68', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'reverse' },
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 2, items: [] },
      { op: 'splice', start: 5, deleteCount: 1, items: [] },
    ] },
    { t: '69', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'assign', newItems: [] }
    ] },
    { t: '70', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'assign', newItems: ['d', 'e', 'f'] }
    ] },
    { t: '71', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'push', items: ['d', 'e', 'f'] }
    ] },
    { t: '72', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'shift', count: 3 },
      { op: 'push', items: ['d', 'e', 'f'] }
    ] },
    { t: '73', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'push', items: ['d', 'e', 'f'] },
      { op: 'shift', count: 3 }
    ] },
    { t: '74', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'shift', count: 3 },
      { op: 'push', items: ['d', 'e', 'f'] },
      { op: 'pop', count: 3 },
    ] },
    { t: '75', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'push', items: ['d', 'e', 'f'] },
      { op: 'shift', count: 3 },
      { op: 'pop', count: 3 },
    ] },
    { t: '76', items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flush: true, mutations: [
      { op: 'shift', count: 3 },
      { op: 'pop', count: 3 },
      { op: 'push', items: ['d', 'e', 'f'] }
    ] },
    { t: '77', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'unshift', items: ['d', 'e', 'f'] },
      { op: 'assign', newItems: [] },
      { op: 'unshift', items: ['g', 'h', 'i'] }
    ] },
    { t: '78', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'pop', count: 1 },
      { op: 'assign', newItems: ['d', 'e', 'f'] },
      { op: 'pop', count: 1 }
    ] },
    { t: '79', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'pop', count: 3 },
      { op: 'assign', newItems: ['d', 'e', 'f', 'g', 'h', 'i'] },
      { op: 'pop', count: 3 }
    ] },
    { t: '80', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'shift', count: 1 },
      { op: 'assign', newItems: ['d', 'e', 'f'] },
      { op: 'shift', count: 1 }
    ] },
    { t: '81', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'shift', count: 3 },
      { op: 'assign', newItems: ['d', 'e', 'f', 'g', 'h', 'i'] },
      { op: 'shift', count: 3 },
    ] },
    { t: '82', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'pop', count: 1 },
      { op: 'shift', count: 1 },
      { op: 'assign', newItems: ['d', 'e', 'f', 'g', 'h', 'i'] },
      { op: 'pop', count: 1 },
      { op: 'shift', count: 1 }
    ] },
    { t: '83', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'assign', newItems: [] },
      { op: 'push', items: ['g', 'h', 'i', 'j', 'k', 'l'] },
      { op: 'push', items: ['m', 'n', 'o', 'p', 'q', 'r'] }
    ] },
    { t: '84', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'push', items: ['g', 'h', 'i', 'j', 'k', 'l'] },
      { op: 'assign', newItems: [] },
      { op: 'push', items: ['m', 'n', 'o', 'p', 'q', 'r'] }
    ] },
    { t: '85', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'push', items: ['g', 'h', 'i', 'j', 'k', 'l'] },
      { op: 'push', items: ['m', 'n', 'o', 'p', 'q', 'r'] },
      { op: 'assign', newItems: [] },
    ] },
    { t: '86', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'push', items: ['g', 'h', 'i', 'j', 'k', 'l'] },
      { op: 'push', items: ['m', 'n', 'o', 'p', 'q', 'r'] },
      { op: 'assign', newItems: ['c', 'd', 'e'] },
    ] },
    { t: '87', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 1, items: [] },
      { op: 'splice', start: 5, deleteCount: 1, items: [] },
      { op: 'assign', newItems: [] },
      { op: 'push', items: ['g', 'h', 'i', 'j', 'k', 'l'] },
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 1, items: [] },
      { op: 'splice', start: 5, deleteCount: 1, items: [] },
      { op: 'push', items: ['m', 'n', 'o', 'p', 'q', 'r'] }
    ] },
    { t: '88', items: ['a', 'b', 'c', 'd', 'e', 'f'], flush: true, mutations: [
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 1, items: [] },
      { op: 'splice', start: 5, deleteCount: 1, items: [] },
      { op: 'assign', newItems: ['g', 'h', 'i', 'j', 'k', 'l'] },
      { op: 'splice', start: 1, deleteCount: 1, items: [] },
      { op: 'splice', start: 3, deleteCount: 1, items: [] },
      { op: 'splice', start: 5, deleteCount: 1, items: [] },
      { op: 'push', items: ['m', 'n', 'o', 'p', 'q', 'r'] }
    ] }
  ];

  const none = LifecycleFlags.none;
  const fromFlush = LifecycleFlags.fromFlush;
  const start = LifecycleFlags.fromStartTask;
  const stop = LifecycleFlags.fromStopTask;
  const bind = LifecycleFlags.fromBind;
  const attach = LifecycleFlags.fromAttach;
  const detach = LifecycleFlags.fromDetach;
  const unbind = LifecycleFlags.fromUnbind;
  const flushBind = fromFlush | bind;
  const flushAttach = fromFlush | attach;
  const flushDetach = fromFlush | detach;
  const flushUnbind = fromFlush | unbind;
  const startBind = start | bind;
  const startAttach = start | attach;
  const stopDetach = stop | detach;
  const stopUnbind = stop | unbind;

  const flagsSpecs: FlagsSpec[] = [
    { t: '1', bindFlags1: none,       attachFlags1: none,        detachFlags1: none,        unbindFlags1: none,        bindFlags2: none,       attachFlags2: none,        detachFlags2: none,        unbindFlags2: none        },
    { t: '2', bindFlags1: bind,       attachFlags1: attach,      detachFlags1: detach,      unbindFlags1: unbind,      bindFlags2: bind,       attachFlags2: attach,      detachFlags2: detach,      unbindFlags2: unbind      },
    { t: '3', bindFlags1: flushBind,  attachFlags1: flushAttach, detachFlags1: flushDetach, unbindFlags1: flushUnbind, bindFlags2: flushBind,  attachFlags2: flushAttach, detachFlags2: flushDetach, unbindFlags2: flushUnbind },
    { t: '4', bindFlags1: start,      attachFlags1: start,       detachFlags1: stop,        unbindFlags1: stop,        bindFlags2: start,      attachFlags2: start,       detachFlags2: stop,        unbindFlags2: stop        },
    { t: '5', bindFlags1: startBind,  attachFlags1: startAttach, detachFlags1: stopDetach,  unbindFlags1: stopUnbind,  bindFlags2: startBind,  attachFlags2: startAttach, detachFlags2: stopDetach,  unbindFlags2: stopUnbind  }
  ];

  eachCartesianJoin(
    [strategySpecs, duplicateOperationSpecs, bindSpecs, flagsSpecs],
    (strategySpec, duplicateOperationSpec, bindSpec, flagsSpec) => {
      it(`verify repeat behavior - strategySpec ${strategySpec.t}, duplicateOperationSpec ${duplicateOperationSpec.t}, bindSpec ${bindSpec.t}, flagsSpec ${flagsSpec.t}, `, function () {
        const { strategy } = strategySpec;
        const { bindTwice, attachTwice, detachTwice, unbindTwice, newScopeForDuplicateBind } = duplicateOperationSpec;
        const { items: $items, flush, mutations } = bindSpec;
        const { bindFlags1, attachFlags1, detachFlags1, unbindFlags1, bindFlags2, attachFlags2, detachFlags2, unbindFlags2 } = flagsSpec;

        const items = $items.slice();
        // common stuff
        const baseFlags: LifecycleFlags = strategy as unknown as LifecycleFlags;
        const proxies = (strategy & BindingStrategy.proxies) > 0;
        const container = AuDOMConfiguration.createContainer();
        const dom = container.get<AuDOM>(IDOM);
        const observerLocator = container.get(IObserverLocator);
        const lifecycle = container.get(ILifecycle);
        const scheduler = container.get(IScheduler);

        const location = AuNode.createRenderLocation();
        const host = AuNode.createHost().appendChild(location.$start).appendChild(location);

        const itemTemplate: ITemplate<AuNode> = {
          renderContext: null as any,
          dom: null as any,
          definition: null as any,
          render(itemRenderable) {
            const text = AuNode.createText();
            const wrapper = AuNode.createTemplate().appendChild(text);

            const nodes = new AuNodeSequence(dom, wrapper);
            const itemBinding = new PropertyBinding(new AccessScopeExpression('item'), text, 'textContent', BindingMode.toView, observerLocator, container);
            binding.persistentFlags |= strategy;

            (itemRenderable as Writable<typeof itemRenderable>).nodes = nodes;
            addBinding(itemRenderable, itemBinding);
          }
        };

        const itemFactory = new ViewFactory<AuNode>(`item-view`, itemTemplate, lifecycle);

        const binding: PropertyBinding = {
          target: null,
          targetProperty: 'items',
          sourceExpression: new ForOfStatement(new BindingIdentifier('item'), new AccessScopeExpression('items'))
        } as any;
        const renderable: IController<AuNode> = {
          bindings: [binding]
        } as any;
        let sut: Repeat<IObservedArray, AuNode>;
        if (proxies) {
          const raw = new Repeat<IObservedArray, AuNode>(location, renderable, itemFactory);
          sut = new ProxyObserver(raw).proxy;
          raw.$controller = Controller.forCustomAttribute(sut, container);
        } else {
          sut = new Repeat<IObservedArray, AuNode>(location, renderable, itemFactory);
          sut.$controller = Controller.forCustomAttribute(sut, container);
        }
        binding.target = sut as any;

        // -- Round 1 --
        let scope = Scope.create(baseFlags, BindingContext.create(baseFlags));

        sut.items = items;
        const expectedText1 = sut.items ? sut.items.join('') : '';

        runBindLifecycle(lifecycle, sut, baseFlags | bindFlags1, scope);

        if (bindTwice) {
          if (newScopeForDuplicateBind) {
            scope = Scope.create(baseFlags, scope.bindingContext);
          }
          runBindLifecycle(lifecycle, sut, baseFlags | bindFlags1, scope);
        }

        runAttachLifecycle(lifecycle, sut, baseFlags | attachFlags1);

        assert.strictEqual(host.textContent, expectedText1, 'host.textContent #1');
        if (attachTwice) {
          runAttachLifecycle(lifecycle, sut, baseFlags | attachFlags1);

          assert.strictEqual(host.textContent, expectedText1, 'host.textContent #2');
        }

        applyMutations(sut, mutations);
        const expectedText2 = sut.items ? sut.items.join('') : '';

        if (flush) {
          scheduler.getRenderTaskQueue().flush();

          assert.strictEqual(host.textContent, expectedText2, 'host.textContent #3');
        } else {
          const assign = mutations.find(m => m.op === 'assign') as AssignSpec;

          if (assign) {
            assert.strictEqual(host.textContent, assign.newItems.join(''), 'host.textContent #4');
          } else {
            assert.strictEqual(host.textContent, expectedText1, 'host.textContent #5');
          }
        }

        runDetachLifecycle(lifecycle, sut, baseFlags | detachFlags1);
        if (detachTwice) {
          runDetachLifecycle(lifecycle, sut, baseFlags | detachFlags1);
        }

        assert.strictEqual(host.textContent, '', 'host.textContent #6');

        runUnbindLifecycle(lifecycle, sut, baseFlags | unbindFlags1);
        if (unbindTwice) {
          runUnbindLifecycle(lifecycle, sut, baseFlags | unbindFlags1);
        }

        // -- Round 2 --

        sut.items = items;
        const expectedText3 = sut.items ? sut.items.join('') : '';

        runBindLifecycle(lifecycle, sut, baseFlags | bindFlags2, scope);
        if (bindTwice) {
          if (newScopeForDuplicateBind) {
            scope = Scope.create(baseFlags, scope.bindingContext);
          }
          runBindLifecycle(lifecycle, sut, baseFlags | bindFlags2, scope);
        }

        runAttachLifecycle(lifecycle, sut, baseFlags | attachFlags2);

        assert.strictEqual(host.textContent, expectedText3, 'host.textContent #7');
        if (attachTwice) {
          runAttachLifecycle(lifecycle, sut, baseFlags | attachFlags2);

          assert.strictEqual(host.textContent, expectedText3, 'host.textContent #8');
        }

        applyMutations(sut, mutations);
        const expectedText4 = sut.items ? sut.items.join('') : '';

        if (flush) {
          scheduler.getRenderTaskQueue().flush();

          assert.strictEqual(host.textContent, expectedText4, 'host.textContent #9');
        } else {
          const assign = mutations.find(m => m.op === 'assign') as AssignSpec;

          if (assign) {
            assert.strictEqual(host.textContent, assign.newItems.join(''), 'host.textContent #10');
          } else {
            assert.strictEqual(host.textContent, expectedText3, 'host.textContent #11');
          }
        }

        runDetachLifecycle(lifecycle, sut, baseFlags | detachFlags2);
        if (detachTwice) {
          runDetachLifecycle(lifecycle, sut, baseFlags | detachFlags2);
        }

        assert.strictEqual(host.textContent, '', 'host.textContent #12');

        runUnbindLifecycle(lifecycle, sut, baseFlags | unbindFlags2);
        if (unbindTwice) {
          runUnbindLifecycle(lifecycle, sut, baseFlags | unbindFlags2);
        }
      });
    });
});
