import {
  Writable
} from '@aurelia/kernel';
import {
  AccessScopeExpression,
  addBinding,
  PropertyBinding,
  BindingContext,
  BindingMode,
  BindingStrategy,
  Else,
  IDOM,
  If,
  ILifecycle,
  IObserverLocator,
  IScope,
  ITemplate,
  LifecycleFlags,
  ProxyObserver,
  Scope,
  ViewFactory,
  Controller,
  IController
} from '@aurelia/runtime';
import {
  AuDOM,
  AuDOMConfiguration,
  AuNode,
  AuNodeSequence,
  eachCartesianJoin,
  assert,
} from '@aurelia/testing';

describe(`If/Else`, function () {
  function runBindLifecycle(lifecycle: ILifecycle, sut: If<AuNode>, flags: LifecycleFlags, scope: IScope): void {
    lifecycle.bound.begin();
    sut.$controller.bind(flags, scope);
    lifecycle.bound.end(flags);
  }
  function runUnbindLifecycle(lifecycle: ILifecycle, sut: If<AuNode>, flags: LifecycleFlags): void {
    lifecycle.unbound.begin();
    sut.$controller.unbind(flags);
    lifecycle.unbound.end(flags);
  }
  function runAttachLifecycle(lifecycle: ILifecycle, sut: If<AuNode>, flags: LifecycleFlags): void {
    lifecycle.attached.begin();
    sut.$controller.attach(flags);
    lifecycle.attached.end(flags);
  }
  function runDetachLifecycle(lifecycle: ILifecycle, sut: If<AuNode>, flags: LifecycleFlags): void {
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
    newValueForDuplicateBind: boolean;
    attachTwice: boolean;
    detachTwice: boolean;
    unbindTwice: boolean;
  }
  interface BindSpec extends Spec {
    ifPropName: string;
    elsePropName: string;
    ifText: string;
    elseText: string;

    value1: any;
    value2: any;
  }
  interface MutationSpec extends Spec {
    newValue1: any;
    newValue2: any;
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

  const strategySpecs: StrategySpec[] = [
    { t: '1', strategy: BindingStrategy.getterSetter },
    { t: '2', strategy: BindingStrategy.proxies },
  ];

  const duplicateOperationSpecs: DuplicateOperationSpec[] = [
    { t: '1', bindTwice: false, newScopeForDuplicateBind: false, newValueForDuplicateBind: false, attachTwice: false, detachTwice: false, unbindTwice: false },
    { t: '2', bindTwice: true,  newScopeForDuplicateBind: false, newValueForDuplicateBind: false, attachTwice: true,  detachTwice: true,  unbindTwice: true  },
    { t: '3', bindTwice: true,  newScopeForDuplicateBind: true,  newValueForDuplicateBind: true,  attachTwice: true,  detachTwice: true,  unbindTwice: true  },
    { t: '4', bindTwice: true,  newScopeForDuplicateBind: false, newValueForDuplicateBind: true,  attachTwice: true,  detachTwice: true,  unbindTwice: true  },
    { t: '5', bindTwice: true,  newScopeForDuplicateBind: false, newValueForDuplicateBind: false, attachTwice: false, detachTwice: false, unbindTwice: false },
    { t: '6', bindTwice: true,  newScopeForDuplicateBind: true,  newValueForDuplicateBind: true,  attachTwice: false, detachTwice: false, unbindTwice: false },
    { t: '7', bindTwice: true,  newScopeForDuplicateBind: false, newValueForDuplicateBind: true,  attachTwice: false, detachTwice: false, unbindTwice: false }
  ];

  const bindSpecs: BindSpec[] = [
    { t: '1', ifPropName: 'ifValue', elsePropName: 'elseValue', ifText: 'foo', elseText: 'bar', value1: true,  value2: true  },
    { t: '2', ifPropName: 'ifValue', elsePropName: 'elseValue', ifText: 'foo', elseText: 'bar', value1: true,  value2: false },
    { t: '3', ifPropName: 'ifValue', elsePropName: 'elseValue', ifText: 'foo', elseText: 'bar', value1: false, value2: true  },
    { t: '4', ifPropName: 'ifValue', elsePropName: 'elseValue', ifText: 'foo', elseText: 'bar', value1: false, value2: false },
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

  const mutationSpecs: MutationSpec[] = [
    { t: '01', newValue1: false, newValue2: false, },
    { t: '02', newValue1: false, newValue2: true,  },
    { t: '03', newValue1: true,  newValue2: false, },
    { t: '04', newValue1: true,  newValue2: true,  },
  ];

  const flagsSpecs: FlagsSpec[] = [
    { t: '1', bindFlags1: none,       attachFlags1: none,        detachFlags1: none,        unbindFlags1: none,        bindFlags2: none,       attachFlags2: none,        detachFlags2: none,        unbindFlags2: none        },
    { t: '2', bindFlags1: bind,       attachFlags1: attach,      detachFlags1: detach,      unbindFlags1: unbind,      bindFlags2: bind,       attachFlags2: attach,      detachFlags2: detach,      unbindFlags2: unbind      },
    { t: '3', bindFlags1: flushBind,  attachFlags1: flushAttach, detachFlags1: flushDetach, unbindFlags1: flushUnbind, bindFlags2: flushBind,  attachFlags2: flushAttach, detachFlags2: flushDetach, unbindFlags2: flushUnbind },
    { t: '4', bindFlags1: start,      attachFlags1: start,       detachFlags1: stop,        unbindFlags1: stop,        bindFlags2: start,      attachFlags2: start,       detachFlags2: stop,        unbindFlags2: stop        },
    { t: '5', bindFlags1: startBind,  attachFlags1: startAttach, detachFlags1: stopDetach,  unbindFlags1: stopUnbind,  bindFlags2: startBind,  attachFlags2: startAttach, detachFlags2: stopDetach,  unbindFlags2: stopUnbind  }
  ];

  eachCartesianJoin(
    [strategySpecs, duplicateOperationSpecs, bindSpecs, mutationSpecs, flagsSpecs],
    (strategySpec, duplicateOperationSpec, bindSpec, mutationSpec, flagsSpec) => {
      it(`verify if/else behavior - strategySpec ${strategySpec.t}, duplicateOperationSpec ${duplicateOperationSpec.t}, bindSpec ${bindSpec.t}, mutationSpec ${mutationSpec.t}, flagsSpec ${flagsSpec.t}, `, function () {
        const { strategy } = strategySpec;
        const { bindTwice, attachTwice, detachTwice, unbindTwice, newScopeForDuplicateBind, newValueForDuplicateBind } = duplicateOperationSpec;
        const { ifPropName, elsePropName, ifText, elseText, value1, value2 } = bindSpec;
        const { newValue1, newValue2 } = mutationSpec;
        const { bindFlags1, attachFlags1, detachFlags1, unbindFlags1, bindFlags2, attachFlags2, detachFlags2, unbindFlags2 } = flagsSpec;

        // common stuff
        const baseFlags: LifecycleFlags = strategy as unknown as LifecycleFlags;
        const proxies = (strategy & BindingStrategy.proxies) > 0;
        const container = AuDOMConfiguration.createContainer();
        const dom = container.get<AuDOM>(IDOM);
        const observerLocator = container.get(IObserverLocator);
        const lifecycle = container.get(ILifecycle);

        const location = AuNode.createRenderLocation();
        const location2 = AuNode.createRenderLocation();
        const host = AuNode.createHost().appendChild(location.$start).appendChild(location).appendChild(location2.$start).appendChild(location2);

        const ifTemplate: ITemplate<AuNode> = {
          renderContext: null as any,
          dom: null as any,
          definition: null as any,
          render(controller: IController<AuNode>) {
            const text = AuNode.createText();
            const wrapper = AuNode.createTemplate().appendChild(text);

            const nodes = new AuNodeSequence(dom, wrapper);
            const binding = new PropertyBinding(new AccessScopeExpression(ifPropName), text, 'textContent', BindingMode.toView, observerLocator, container);
            binding.persistentFlags |= baseFlags;

            (controller as Writable<typeof controller>).nodes = nodes;
            addBinding(controller, binding);
          }
        };

        const elseTemplate: ITemplate<AuNode> = {
          renderContext: null as any,
          dom: null as any,
          definition: null as any,
          render(controller: IController<AuNode>) {
            const text = AuNode.createText();
            const wrapper = AuNode.createTemplate().appendChild(text);

            const nodes = new AuNodeSequence(dom, wrapper);
            const binding = new PropertyBinding(new AccessScopeExpression(elsePropName), text, 'textContent', BindingMode.toView, observerLocator, container);
            binding.persistentFlags |= baseFlags;

            (controller as Writable<typeof controller>).nodes = nodes;
            addBinding(controller, binding);
          }
        };

        const ifFactory = new ViewFactory<AuNode>('if-view', ifTemplate, lifecycle);
        const elseFactory = new ViewFactory<AuNode>('else-view', elseTemplate, lifecycle);
        let sut: If<AuNode>;
        let elseSut: Else<AuNode>;
        if (proxies) {
          sut = ProxyObserver.getOrCreate(new If<AuNode>(ifFactory, location)).proxy;
          elseSut = ProxyObserver.getOrCreate(new Else<AuNode>(elseFactory)).proxy;
        } else {
          sut = new If<AuNode>(ifFactory, location);
          elseSut = new Else<AuNode>(elseFactory);
        }
        elseSut.link(sut);
        sut.$controller = Controller.forCustomAttribute(sut, container);

        let firstBindFinalNodesText: string;
        let secondBindFinalNodesText: string;
        let firstAttachInitialHostText: string;
        let secondAttachInitialHostText: string;

        const firstBindInitialNodesText: string = value1 ? ifText : elseText;
        if (bindTwice) {
          firstAttachInitialHostText = newValueForDuplicateBind ? ifText : elseText;
          firstBindFinalNodesText = newValueForDuplicateBind ? ifText : elseText;
        } else {
          firstBindFinalNodesText = firstBindInitialNodesText;
          firstAttachInitialHostText = value1 ? ifText : elseText;
        }
        const firstAttachFinalHostText: string = newValue1 ? ifText : elseText;

        const secondBindInitialNodesText: string = value2 ? ifText : elseText;
        if (bindTwice) {
          secondAttachInitialHostText = newValueForDuplicateBind ? ifText : elseText;
          secondBindFinalNodesText = newValueForDuplicateBind ? ifText : elseText;
        } else {
          secondBindFinalNodesText = secondBindInitialNodesText;
          secondAttachInitialHostText = value2 ? ifText : elseText;
        }
        const secondAttachFinalHostText: string = newValue2 ? ifText : elseText;

        // -- Round 1 --

        const ctx = BindingContext.create(baseFlags, {
          [ifPropName]: ifText,
          [elsePropName]: elseText
        });
        let scope = Scope.create(baseFlags, ctx);

        sut.value = value1;

        runBindLifecycle(lifecycle, sut, baseFlags | bindFlags1, scope);

        assert.strictEqual(sut.view.nodes.firstChild['textContent'], firstBindInitialNodesText, '$nodes.textContent #1');

        // after binding the nodes should be present and already updated with the correct values
        if (bindTwice) {
          if (newScopeForDuplicateBind) {
            scope = Scope.create(baseFlags, ctx);
          }
          sut.value = newValueForDuplicateBind;

          runBindLifecycle(lifecycle, sut, baseFlags | bindFlags1, scope);
        }
        assert.strictEqual(sut.view.nodes.firstChild['textContent'], firstBindFinalNodesText, '$nodes.textContent #2');

        runAttachLifecycle(lifecycle, sut, baseFlags | attachFlags1);

        assert.strictEqual(host.textContent, firstAttachInitialHostText, 'host.textContent #1');
        if (attachTwice) {
          runAttachLifecycle(lifecycle, sut, baseFlags | attachFlags1);

          assert.strictEqual(host.textContent, firstAttachInitialHostText, 'host.textContent #2');
        }

        sut.value = newValue1;

        assert.strictEqual(host.textContent, firstAttachFinalHostText, 'host.textContent #2');

        runDetachLifecycle(lifecycle, sut, baseFlags | detachFlags1);
        if (detachTwice) {
          runDetachLifecycle(lifecycle, sut, baseFlags | detachFlags1);
        }
        // host should be empty but nodes below should still be intact and up-to-date

        assert.strictEqual(host.textContent, '', 'host.textContent #3');

        runUnbindLifecycle(lifecycle, sut, baseFlags | unbindFlags1);
        if (unbindTwice) {
          runUnbindLifecycle(lifecycle, sut, baseFlags | unbindFlags1);
        }
        // unbind should not affect existing values but stops them from updating afterwards

        // -- Round 2 --

        sut.value = value2;

        runBindLifecycle(lifecycle, sut, baseFlags | bindFlags2, scope);

        assert.strictEqual(sut.view.nodes.firstChild['textContent'], secondBindInitialNodesText, '$nodes.textContent #3');
        if (bindTwice) {
          if (newScopeForDuplicateBind) {
            scope = Scope.create(baseFlags, ctx);
          }
          sut.value = newValueForDuplicateBind;
          runBindLifecycle(lifecycle, sut, baseFlags | bindFlags2, scope);
        }

        assert.strictEqual(sut.view.nodes.firstChild['textContent'], secondBindFinalNodesText, '$nodes.textContent #4');

        runAttachLifecycle(lifecycle, sut, baseFlags | attachFlags2);

        assert.strictEqual(host.textContent, secondAttachInitialHostText, 'host.textContent #4');
        if (attachTwice) {
          runAttachLifecycle(lifecycle, sut, baseFlags | attachFlags2);

          assert.strictEqual(host.textContent, secondAttachInitialHostText, 'host.textContent #5');
        }

        sut.value = newValue2;

        assert.strictEqual(host.textContent, secondAttachFinalHostText, 'host.textContent #5');

        runDetachLifecycle(lifecycle, sut, baseFlags | detachFlags2);
        if (detachTwice) {
          runDetachLifecycle(lifecycle, sut, baseFlags | detachFlags2);
        }

        assert.strictEqual(host.textContent, '', 'host.textContent #6');

        runUnbindLifecycle(lifecycle, sut, baseFlags | unbindFlags2);
        if (unbindTwice) {
          runUnbindLifecycle(lifecycle, sut, baseFlags | unbindFlags2);
        }
      });
    });
});
