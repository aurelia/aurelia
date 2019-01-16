import { Writable } from '@aurelia/kernel';
import { expect } from 'chai';
import {
  eachCartesianJoin
} from '../../../../../scripts/test-lib';
import {
  AccessScope,
  addBindable,
  Binding,
  BindingContext,
  BindingIdentifier,
  BindingMode,
  ForOfStatement,
  IDOM,
  ILifecycle,
  IObservedArray,
  IObserverLocator,
  IRenderable,
  IScope,
  ITemplate,
  LifecycleFlags,
  ProxyObserver,
  Repeat,
  Scope
} from '../../../src/index';
import { RuntimeBehavior } from '../../../src/rendering-engine';
import { ViewFactory } from '../../../src/templating/view';
import {
  AuDOM,
  AuDOMConfiguration,
  AuNode,
  AuNodeSequence
} from '../../au-dom';

describe(`Repeat`, () => {
  function runBindLifecycle(lifecycle: ILifecycle, sut: Repeat<IObservedArray, AuNode>, flags: LifecycleFlags, scope: IScope): void {
    lifecycle.beginBind();
    sut.$bind(flags, scope);
    lifecycle.endBind(flags);
  }
  function runUnbindLifecycle(lifecycle: ILifecycle, sut: Repeat<IObservedArray, AuNode>, flags: LifecycleFlags): void {
    lifecycle.beginUnbind();
    sut.$unbind(flags);
    lifecycle.endUnbind(flags);
  }
  function runAttachLifecycle(lifecycle: ILifecycle, sut: Repeat<IObservedArray, AuNode>, flags: LifecycleFlags): void {
    lifecycle.beginAttach();
    sut.$attach(flags);
    lifecycle.endAttach(flags);
  }
  function runDetachLifecycle(lifecycle: ILifecycle, sut: Repeat<IObservedArray, AuNode>, flags: LifecycleFlags): void {
    lifecycle.beginDetach();
    sut.$detach(flags);
    lifecycle.endDetach(flags);
  }

  interface Spec {
    t: string;
  }
  interface UseProxiesSpec extends Spec {
    useProxies: boolean;
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

  const useProxiesSpecs: UseProxiesSpec[] = [
    { t: '1', useProxies: false },
    { t: '2', useProxies: true  }
  ];

  const duplicateOperationSpecs: DuplicateOperationSpec[] = [
    { t: '1', bindTwice: false, newScopeForDuplicateBind: false, attachTwice: false, detachTwice: false, unbindTwice: false },
    { t: '2', bindTwice: true,  newScopeForDuplicateBind: false, attachTwice: true,  detachTwice: true,  unbindTwice: true  },
    { t: '3', bindTwice: true,  newScopeForDuplicateBind: true,  attachTwice: true,  detachTwice: true,  unbindTwice: true  }
  ];

  const bindSpecs: BindSpec[] = [
    { t: '01', items: ['a', 'b', 'c'], flush: false, mutations: [
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
    { t: '14', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'splice', start: 0, deleteCount: 1, items: ['b'] }
    ] },
    { t: '15', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'reverse' }
    ] },
    { t: '16', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'reverse' },
      { op: 'reverse' }
    ] },
    { t: '17', items: ['a', 'b', 'c'], flush: true, mutations: [
      { op: 'reverse' },
      { op: 'reverse' },
      { op: 'reverse' }
    ] },
    { t: '18', items: ['c', 'b', 'a'], flush: true, mutations: [
      { op: 'sort' }
    ] },
    { t: '19', items: ['c', 'b', 'a'], flush: true, mutations: [
      { op: 'sort' },
      { op: 'reverse' },
      { op: 'sort' }
    ] },
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

  eachCartesianJoin([useProxiesSpecs, duplicateOperationSpecs, bindSpecs, flagsSpecs], (useProxiesSpec, duplicateOperationSpec, bindSpec, flagsSpec) => {
    it(`verify repeat behavior - duplicateOperationSpec ${duplicateOperationSpec.t}, bindSpec ${bindSpec.t}, flagsSpec ${flagsSpec.t}, `, async () => {
      const { useProxies } = useProxiesSpec;
      const { bindTwice, attachTwice, detachTwice, unbindTwice, newScopeForDuplicateBind } = duplicateOperationSpec;
      const { items: $items, flush, mutations } = bindSpec;
      const { bindFlags1, attachFlags1, detachFlags1, unbindFlags1, bindFlags2, attachFlags2, detachFlags2, unbindFlags2 } = flagsSpec;

      const items = $items.slice();
      // common stuff
      const baseFlags = useProxies ? LifecycleFlags.useProxies : LifecycleFlags.none;
      const container = AuDOMConfiguration.createContainer();
      const dom = container.get<AuDOM>(IDOM);
      const observerLocator = container.get(IObserverLocator);
      const lifecycle = container.get(ILifecycle);

      const location = AuNode.createRenderLocation();
      const host = AuNode.createHost().appendChild(location.$start).appendChild(location);

      const itemTemplate: ITemplate<AuNode> = {
        renderContext: null as any,
        dom: null as any,
        render(itemRenderable) {
          const text = AuNode.createText();
          const wrapper = AuNode.createTemplate().appendChild(text);

          const nodes = new AuNodeSequence(dom, wrapper);
          const itemBinding = new Binding(new AccessScope('item'), text, 'textContent', BindingMode.toView, observerLocator, container);
          binding.persistentFlags |= baseFlags;

          (itemRenderable as Writable<typeof itemRenderable>).$nodes = nodes;
          addBindable(itemRenderable, itemBinding);
        }
      };

      const itemFactory = new ViewFactory<AuNode>(`item-view`, itemTemplate, lifecycle);

      const binding: Binding = {
        target: null,
        targetProperty: 'items',
        sourceExpression: new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items'))
      } as any;
      const renderable: IRenderable<AuNode> = {
        $bindableHead: binding
      } as any;
      let sut: Repeat<IObservedArray, AuNode>;
      if (useProxies) {
        sut = new ProxyObserver(new Repeat<IObservedArray, AuNode>(location, renderable, itemFactory)).proxy;
      } else {
        sut = new Repeat<IObservedArray, AuNode>(location, renderable, itemFactory);
      }
      binding.target = sut;

      (sut as Writable<Repeat>).$scope = null;

      const repeatBehavior = RuntimeBehavior.create(Repeat);
      repeatBehavior.applyTo(baseFlags, sut, lifecycle);

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
      expect(host.textContent).to.equal(expectedText1, 'host.textContent #1');
      if (attachTwice) {
        runAttachLifecycle(lifecycle, sut, baseFlags | attachFlags1);
        expect(host.textContent).to.equal(expectedText1, 'host.textContent #2');
      }

      applyMutations(sut, mutations);
      const expectedText2 = sut.items ? sut.items.join('') : '';

      if (flush) {
        lifecycle.processFlushQueue(baseFlags);
        expect(host.textContent).to.equal(expectedText2, 'host.textContent #3');
      } else {
        const assign = mutations.find(m => m.op === 'assign') as AssignSpec;
        if (assign) {
          expect(host.textContent).to.equal(assign.newItems.join(''), 'host.textContent #4');
        } else {
          expect(host.textContent).to.equal(expectedText1, 'host.textContent #5');
        }
      }

      runDetachLifecycle(lifecycle, sut, baseFlags | detachFlags1);
      if (detachTwice) {
        runDetachLifecycle(lifecycle, sut, baseFlags | detachFlags1);
      }

      expect(host.textContent).to.equal('', 'host.textContent #6');

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
      expect(host.textContent).to.equal(expectedText3, 'host.textContent #7');
      if (attachTwice) {
        runAttachLifecycle(lifecycle, sut, baseFlags | attachFlags2);
        expect(host.textContent).to.equal(expectedText3, 'host.textContent #8');
      }

      applyMutations(sut, mutations);
      const expectedText4 = sut.items ? sut.items.join('') : '';

      if (flush) {
        lifecycle.processFlushQueue(baseFlags);
        expect(host.textContent).to.equal(expectedText4, 'host.textContent #9');
      } else {
        const assign = mutations.find(m => m.op === 'assign') as AssignSpec;
        if (assign) {
          expect(host.textContent).to.equal(assign.newItems.join(''), 'host.textContent #10');
        } else {
          expect(host.textContent).to.equal(expectedText3, 'host.textContent #11');
        }
      }

      runDetachLifecycle(lifecycle, sut, baseFlags | detachFlags2);
      if (detachTwice) {
        runDetachLifecycle(lifecycle, sut, baseFlags | detachFlags2);
      }

      expect(host.textContent).to.equal('', 'host.textContent #12');

      runUnbindLifecycle(lifecycle, sut, baseFlags | unbindFlags2);
      if (unbindTwice) {
        runUnbindLifecycle(lifecycle, sut, baseFlags | unbindFlags2);
      }
    });
  });
});
