import {
  Writable
} from '@aurelia/kernel';
import { expect } from 'chai';
import {
  eachCartesianJoin
} from '../../../../../scripts/test-lib';
import {
  AccessScope,
  addBindable,
  Binding,
  BindingContext,
  BindingMode,
  CompositionCoordinator,
  Else,
  IDOM,
  If,
  ILifecycle,
  IObserverLocator,
  IScope,
  ITemplate,
  LifecycleFlags,
  Scope } from '../../../src/index';
import { RuntimeBehavior } from '../../../src/rendering-engine';
import { ViewFactory } from '../../../src/templating/view';
import {
  AuDOM,
  AuDOMConfiguration,
  AuNode,
  AuNodeSequence
} from '../../au-dom';

describe(`If/Else`, () => {
  function runBindLifecycle(lifecycle: ILifecycle, sut: If<AuNode>, flags: LifecycleFlags, scope: IScope): void {
    lifecycle.beginBind();
    sut.$bind(flags, scope);
    lifecycle.endBind(flags);
  }
  function runUnbindLifecycle(lifecycle: ILifecycle, sut: If<AuNode>, flags: LifecycleFlags): void {
    lifecycle.beginUnbind();
    sut.$unbind(flags);
    lifecycle.endUnbind(flags);
  }
  function runAttachLifecycle(lifecycle: ILifecycle, sut: If<AuNode>, flags: LifecycleFlags): void {
    lifecycle.beginAttach();
    sut.$attach(flags);
    lifecycle.endAttach(flags);
  }
  function runDetachLifecycle(lifecycle: ILifecycle, sut: If<AuNode>, flags: LifecycleFlags): void {
    lifecycle.beginDetach();
    sut.$detach(flags);
    lifecycle.endDetach(flags);
  }

  interface Spec {
    t: string;
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
    flush1: boolean;

    newValue2: any;
    flush2: boolean;
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
    { t: '01', newValue1: false, flush1: false, newValue2: false, flush2: false },
    { t: '02', newValue1: false, flush1: false, newValue2: false, flush2: true  },
    { t: '03', newValue1: false, flush1: false, newValue2: true,  flush2: false },
    { t: '04', newValue1: false, flush1: false, newValue2: true,  flush2: true  },
    { t: '05', newValue1: false, flush1: true,  newValue2: false, flush2: false },
    { t: '06', newValue1: false, flush1: true,  newValue2: false, flush2: true  },
    { t: '07', newValue1: false, flush1: true,  newValue2: true,  flush2: false },
    { t: '08', newValue1: false, flush1: true,  newValue2: true,  flush2: true  },
    { t: '09', newValue1: true,  flush1: false, newValue2: false, flush2: false },
    { t: '10', newValue1: true,  flush1: false, newValue2: false, flush2: true  },
    { t: '11', newValue1: true,  flush1: false, newValue2: true,  flush2: false },
    { t: '12', newValue1: true,  flush1: false, newValue2: true,  flush2: true  },
    { t: '13', newValue1: true,  flush1: true,  newValue2: false, flush2: false },
    { t: '14', newValue1: true,  flush1: true,  newValue2: false, flush2: true  },
    { t: '15', newValue1: true,  flush1: true,  newValue2: true,  flush2: false },
    { t: '16', newValue1: true,  flush1: true,  newValue2: true,  flush2: true  },
  ];

  const flagsSpecs: FlagsSpec[] = [
    { t: '1', bindFlags1: none,       attachFlags1: none,        detachFlags1: none,        unbindFlags1: none,        bindFlags2: none,       attachFlags2: none,        detachFlags2: none,        unbindFlags2: none        },
    { t: '2', bindFlags1: bind,       attachFlags1: attach,      detachFlags1: detach,      unbindFlags1: unbind,      bindFlags2: bind,       attachFlags2: attach,      detachFlags2: detach,      unbindFlags2: unbind      },
    { t: '3', bindFlags1: flushBind,  attachFlags1: flushAttach, detachFlags1: flushDetach, unbindFlags1: flushUnbind, bindFlags2: flushBind,  attachFlags2: flushAttach, detachFlags2: flushDetach, unbindFlags2: flushUnbind },
    { t: '4', bindFlags1: start,      attachFlags1: start,       detachFlags1: stop,        unbindFlags1: stop,        bindFlags2: start,      attachFlags2: start,       detachFlags2: stop,        unbindFlags2: stop        },
    { t: '5', bindFlags1: startBind,  attachFlags1: startAttach, detachFlags1: stopDetach,  unbindFlags1: stopUnbind,  bindFlags2: startBind,  attachFlags2: startAttach, detachFlags2: stopDetach,  unbindFlags2: stopUnbind  }
  ];

  eachCartesianJoin([duplicateOperationSpecs, bindSpecs, mutationSpecs, flagsSpecs], (duplicateOperationSpec, bindSpec, mutationSpec, flagsSpec) => {
    it(`verify if/else behavior - duplicateOperationSpec ${duplicateOperationSpec.t}, bindSpec ${bindSpec.t}, mutationSpec ${mutationSpec.t}, flagsSpec ${flagsSpec.t}, `, async () => {
      const { bindTwice, attachTwice, detachTwice, unbindTwice, newScopeForDuplicateBind, newValueForDuplicateBind } = duplicateOperationSpec;
      const { ifPropName, elsePropName, ifText, elseText, value1, value2 } = bindSpec;
      const { newValue1, flush1, newValue2, flush2 } = mutationSpec;
      const { bindFlags1, attachFlags1, detachFlags1, unbindFlags1, bindFlags2, attachFlags2, detachFlags2, unbindFlags2 } = flagsSpec;

      // common stuff
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
        render(renderable) {
          const text = AuNode.createText();
          const wrapper = AuNode.createTemplate().appendChild(text);

          const nodes = new AuNodeSequence(dom, wrapper);
          const binding = new Binding(new AccessScope(ifPropName), text, 'textContent', BindingMode.toView, observerLocator, container);

          (renderable as Writable<typeof renderable>).$nodes = nodes;
          addBindable(renderable, binding);
        }
      };

      const elseTemplate: ITemplate<AuNode> = {
        renderContext: null as any,
        dom: null as any,
        render(renderable) {
          const text = AuNode.createText();
          const wrapper = AuNode.createTemplate().appendChild(text);

          const nodes = new AuNodeSequence(dom, wrapper);
          const binding = new Binding(new AccessScope(elsePropName), text, 'textContent', BindingMode.toView, observerLocator, container);

          (renderable as Writable<typeof renderable>).$nodes = nodes;
          addBindable(renderable, binding);
        }
      };

      const ifFactory = new ViewFactory<AuNode>('if-view', ifTemplate, lifecycle);
      const elseFactory = new ViewFactory<AuNode>('else-view', elseTemplate, lifecycle);

      const sut = new If<AuNode>(ifFactory, location, new CompositionCoordinator(lifecycle));
      const elseSut = new Else<AuNode>(elseFactory);
      elseSut.link(sut);

      (sut as Writable<If>).$scope = null;
      (elseSut as Writable<Else>).$scope = null;

      const ifBehavior = RuntimeBehavior.create(If);
      ifBehavior.applyTo(sut, lifecycle);

      const elseBehavior = RuntimeBehavior.create(Else);
      elseBehavior.applyTo(elseSut, lifecycle);

      let firstBindInitialNodesText: string;
      let firstBindFinalNodesText: string;
      let secondBindInitialNodesText: string;
      let secondBindFinalNodesText: string;
      let firstAttachInitialHostText: string;
      let firstAttachFinalHostText: string;
      let secondAttachInitialHostText: string;
      let secondAttachFinalHostText: string;

      firstBindInitialNodesText = value1 ? ifText : elseText;
      if (bindTwice) {
        firstAttachInitialHostText = newValueForDuplicateBind ? ifText : elseText;
        if ((newScopeForDuplicateBind || (bindFlags1 & LifecycleFlags.fromStartTask))) {
          firstBindFinalNodesText = newValueForDuplicateBind ? ifText : elseText;
        } else {
          firstBindFinalNodesText = firstBindInitialNodesText;
        }
      } else {
        firstBindFinalNodesText = firstBindInitialNodesText;
        firstAttachInitialHostText = value1 ? ifText : elseText;
      }
      if (flush1) {
        firstAttachFinalHostText = newValue1 ? ifText : elseText;
      } else {
        firstAttachFinalHostText = firstAttachInitialHostText;
      }

      secondBindInitialNodesText = value2 ? ifText : elseText;
      if (bindTwice) {
        secondAttachInitialHostText = newValueForDuplicateBind ? ifText : elseText;
        if ((newScopeForDuplicateBind || (bindFlags2 & LifecycleFlags.fromStartTask))) {
          secondBindFinalNodesText = newValueForDuplicateBind ? ifText : elseText;
        } else {
          secondBindFinalNodesText = secondBindInitialNodesText;
        }
      } else {
        secondBindFinalNodesText = secondBindInitialNodesText;
        secondAttachInitialHostText = value2 ? ifText : elseText;
      }
      if (flush2) {
        secondAttachFinalHostText = newValue2 ? ifText : elseText;
      } else {
        secondAttachFinalHostText = secondAttachInitialHostText;
      }

      // -- Round 1 --

      const ctx = BindingContext.create({
        [ifPropName]: ifText,
        [elsePropName]: elseText
      });
      let scope = Scope.create(ctx);

      sut.value = value1;

      runBindLifecycle(lifecycle, sut, bindFlags1, scope);
      expect(sut.coordinator['currentView'].$nodes.firstChild['textContent']).to.equal(firstBindInitialNodesText, '$nodes.textContent #1');

      // after binding the nodes should be present and already updated with the correct values
      if (bindTwice) {
        if (newScopeForDuplicateBind) {
          scope = Scope.create(ctx);
        }
        sut.value = newValueForDuplicateBind;
        runBindLifecycle(lifecycle, sut, bindFlags1, scope);
      }
      expect(sut.coordinator['currentView'].$nodes.firstChild['textContent']).to.equal(firstBindFinalNodesText, '$nodes.textContent #2');

      runAttachLifecycle(lifecycle, sut, attachFlags1);
      expect(host.textContent).to.equal(firstAttachInitialHostText, 'host.textContent #1');
      if (attachTwice) {
        runAttachLifecycle(lifecycle, sut, attachFlags1);
        expect(host.textContent).to.equal(firstAttachInitialHostText, 'host.textContent #2');
      }

      sut.value = newValue1;
      // swapping is batched so shouldn't update yet

      if (flush1) {
        lifecycle.processFlushQueue(none);
        // flushing always forces pending swaps
      }
      expect(host.textContent).to.equal(firstAttachFinalHostText, 'host.textContent #2');

      runDetachLifecycle(lifecycle, sut, detachFlags1);
      if (detachTwice) {
        runDetachLifecycle(lifecycle, sut, detachFlags1);
      }
      // host should be empty but nodes below should still be intact and up-to-date

      expect(host.textContent).to.equal('', 'host.textContent #3');

      runUnbindLifecycle(lifecycle, sut, unbindFlags1);
      if (unbindTwice) {
        runUnbindLifecycle(lifecycle, sut, unbindFlags1);
      }
      // unbind should not affect existing values but stops them from updating afterwards

      // -- Round 2 --

      sut.value = value2;

      runBindLifecycle(lifecycle, sut, bindFlags2, scope);
      expect(sut.coordinator['currentView'].$nodes.firstChild['textContent']).to.equal(secondBindInitialNodesText, '$nodes.textContent #3');
      if (bindTwice) {
        if (newScopeForDuplicateBind) {
          scope = Scope.create(ctx);
        }
        sut.value = newValueForDuplicateBind;
        runBindLifecycle(lifecycle, sut, bindFlags2, scope);
      }
      expect(sut.coordinator['currentView'].$nodes.firstChild['textContent']).to.equal(secondBindFinalNodesText, '$nodes.textContent #4');

      runAttachLifecycle(lifecycle, sut, attachFlags2);
      expect(host.textContent).to.equal(secondAttachInitialHostText, 'host.textContent #4');
      if (attachTwice) {
        runAttachLifecycle(lifecycle, sut, attachFlags2);
        expect(host.textContent).to.equal(secondAttachInitialHostText, 'host.textContent #5');
      }

      sut.value = newValue2;

      if (flush2) {
        lifecycle.processFlushQueue(none);
      }
      expect(host.textContent).to.equal(secondAttachFinalHostText, 'host.textContent #5');

      runDetachLifecycle(lifecycle, sut, detachFlags2);
      if (detachTwice) {
        runDetachLifecycle(lifecycle, sut, detachFlags2);
      }

      expect(host.textContent).to.equal('', 'host.textContent #6');

      runUnbindLifecycle(lifecycle, sut, unbindFlags2);
      if (unbindTwice) {
        runUnbindLifecycle(lifecycle, sut, unbindFlags2);
      }
    });
  });
});
