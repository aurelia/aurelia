import {
  Writable, DI
} from '@aurelia/kernel';
import {
  AccessScopeExpression,
  addBinding,
  addComponent,
  PropertyBinding,
  BindingContext,
  BindingMode,
  IDOM,
  ILifecycle,
  IObserverLocator,
  IRenderLocation,
  IScope,
  ITemplate,
  IController,
  LifecycleFlags as LF,
  Scope,
  ViewFactory
} from '@aurelia/runtime';
import {
  AuDOM,
  AuDOMConfiguration,
  AuNode,
  AuNodeSequence,
  eachCartesianJoin,
  assert,
} from '@aurelia/testing';

class StubView {
  public constructor(public cached = false) {}
  public $cache() {
    this.cached = true;
  }
}

class StubTemplate {
  public constructor(public nodes = {}) {}
  public render(renderable: Partial<IController>) {
    (renderable as Writable<IController>).nodes = this.nodes as any;
  }
}

describe.skip(`ViewFactory`, function () {
  describe(`tryReturnToCache`, function () {
    const doNotOverrideVariations: [string, boolean][] = [
      [' true', true],
      ['false', false]
    ];

    const sizeVariations: [string, any, boolean][] = [
      [`  -2`,  -2,  false],
      [`  -1`,  -1,  false],
      [`   0`,   0,  false],
      [`   1`,   1,   true],
      [`'-2'`, '-2', false],
      [`'-1'`, '-1', false],
      [` '0'`,  '0', false],
      [` '1'`,  '1',  true],
      [` '*'`,  '*',  true]
    ];

    const doNotOverrideVariations2: [string, boolean][] = [
      [' true', true],
      ['false', false]
    ];

    const sizeVariations2: [string, any, boolean][] = [
      [`  -2`,  -2,  false],
      [`  -1`,  -1,  false],
      [`   0`,   0,  false],
      [`   1`,   1,   true],
      [`'-2'`, '-2', false],
      [`'-1'`, '-1', false],
      [` '0'`,  '0', false],
      [` '1'`,  '1',  true],
      [` '*'`,  '*',  true]
    ];

    const inputs: [typeof doNotOverrideVariations, typeof sizeVariations, typeof doNotOverrideVariations2, typeof sizeVariations2]
      = [doNotOverrideVariations, sizeVariations, doNotOverrideVariations2, sizeVariations2];

    eachCartesianJoin(inputs, ([text1, doNotOverride1], [text2, size2, isPositive2], [text3, doNotOverride3], [text4, size4, isPositive4]) => {
      it(`setCacheSize(${text2},${text1}) -> tryReturnToCache -> create x2 -> setCacheSize(${text4},${text3}) -> tryReturnToCache -> create x2`, function () {
        const template = new StubTemplate();
        const sut = new ViewFactory(null, template as any, DI.createContainer().get(ILifecycle));
        const view1 = new StubView();
        const view2 = new StubView();

        sut.setCacheSize(size2, doNotOverride1);

        let canCache = isPositive2;
        assert.strictEqual(sut.tryReturnToCache(view1 as any), canCache, 'sut.tryReturnToCache(view1)');
        assert.strictEqual(view1.cached, canCache, 'view1.cached');
        if (canCache) {
          const cached = sut.create();
          assert.strictEqual(cached, view1, 'cached');
          const created = sut.create();
          assert.strictEqual(created.nodes, template.nodes, 'created.nodes');
          assert.strictEqual(sut.tryReturnToCache(view1 as any), true, 'sut.tryReturnToCache(<any>view1)');

          if (size2 !== '*') {
            assert.strictEqual(sut.tryReturnToCache(view1 as any), false, 'sut.tryReturnToCache(view1) 2');
          }
        } else {
          const created = sut.create();
          assert.strictEqual(created.nodes, template.nodes, 'created.nodes');
        }

        // note: the difference in behavior between 0 (number) and '0' (string),
        // and the behavior of values lower than -1 are kind of quirky
        // probably not important enough for the overhead of an extra check, but at least worth a note
        if (size4 && ((size2 === -1 || size2 === '-1' || size2 === 0) || !doNotOverride3)) {
          canCache = isPositive4;
        }
        sut.setCacheSize(size4, doNotOverride3);

        assert.strictEqual(sut.tryReturnToCache(view2 as any), canCache, 'sut.tryReturnToCache(view2)');
        assert.strictEqual(view2.cached, canCache, 'view2.cached');
        if (canCache) {
          const cached = sut.create();
          assert.strictEqual(cached, view2, 'cached');
          const created = sut.create();
          assert.strictEqual(created.nodes, template.nodes, 'created.nodes');
          assert.strictEqual(sut.tryReturnToCache(view2 as any), true, 'sut.tryReturnToCache(<any>view2)');

          if (size2 !== '*' && size4 !== '*') {
            assert.strictEqual(sut.tryReturnToCache(view2 as any), false, 'sut.tryReturnToCache(view2) 2');
          }
        } else {
          const created = sut.create();
          assert.strictEqual(created.nodes, template.nodes, 'created.nodes');
        }

      });
    }
    );
  });
});

// public render(renderable: Partial<IController>, host?: INode, parts?: TemplatePartDefinitions): void {
//   const nodes = (<Writable<IController>>renderable).nodes = new MockTextNodeSequence();
//   addBinding(renderable, new PropertyBinding(this.sourceExpression, nodes.firstChild, 'textContent', BindingMode.toView, this.observerLocator, this.container));
// }
// describe.skip('View', function () {
//   function runBindLifecycle(lifecycle: ILifecycle, view: IController<AuNode>, flags: LF, scope: IScope): void {
//     lifecycle.bound.begin();
//     view.bind(flags, scope);
//     lifecycle.bound.end(flags);
//   }
//   function runUnbindLifecycle(lifecycle: ILifecycle, view: IController<AuNode>, flags: LF): void {
//     lifecycle.unbound.begin();
//     view.unbind(flags);
//     lifecycle.unbound.end(flags);
//   }
//   function runAttachLifecycle(lifecycle: ILifecycle, view: IController<AuNode>, flags: LF): void {
//     lifecycle.attached.begin();
//     view.attach(flags);
//     lifecycle.attached.end(flags);
//   }
//   function runDetachLifecycle(lifecycle: ILifecycle, view: IController<AuNode>, flags: LF): void {
//     lifecycle.detached.begin();
//     view.detach(flags);
//     lifecycle.detached.end(flags);
//   }

//   interface Spec {
//     t: string;
//   }
//   interface CacheSpec extends Spec {
//     childCount: number;
//     cacheSize: number;
//   }
//   interface DuplicateOperationSpec extends Spec {
//     bindTwice: boolean;
//     duplicateBindValue: string;
//     attachTwice: boolean;
//     detachTwice: boolean;
//     unbindTwice: boolean;
//   }
//   interface BindSpec extends Spec {
//     propName: string;
//     propValue1: string;
//     lockScope1: boolean;
//     // for the bind operation in the second lifecycle, create a new scope?
//     newScopeForSecondBind: boolean;
//     propValue2: string;
//     lockScope2: boolean;
//   }
//   interface ReleaseSpec extends Spec {
//     relBeforeDetach1: boolean;
//     relBeforeEndDetach1: boolean;
//     relAfterDetach1: boolean;

//     relBeforeDetach2: boolean;
//     relBeforeEndDetach2: boolean;
//     relAfterDetach2: boolean;
//   }
//   interface FlagsSpec extends Spec {
//     bindFlags1: LF;
//     attachFlags1: LF;
//     detachFlags1: LF;
//     unbindFlags1: LF;

//     bindFlags2: LF;
//     attachFlags2: LF;
//     detachFlags2: LF;
//     unbindFlags2: LF;
//   }

//   const cacheSpecs: CacheSpec[] = [
//     { t: ' 1', cacheSize: 0, childCount: 0 },
//     { t: ' 2', cacheSize: 0, childCount: 1 },
//     { t: ' 3', cacheSize: 0, childCount: 2 },
//     { t: ' 4', cacheSize: 1, childCount: 0 },
//     { t: ' 5', cacheSize: 1, childCount: 1 },
//     { t: ' 6', cacheSize: 1, childCount: 2 }
//   ];

//   const duplicateOperationSpecs: DuplicateOperationSpec[] = [
//     { t: '1', bindTwice: false, duplicateBindValue: '0', attachTwice: false, detachTwice: false, unbindTwice: false },
//     { t: '2', bindTwice: true,  duplicateBindValue: '0', attachTwice: true,  detachTwice: true,  unbindTwice: true  }
//   ];

//   const bindSpecs: BindSpec[] = [
//     { t: '1', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: false,  lockScope2: false, newScopeForSecondBind: false },
//     { t: '2', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: false,  lockScope2: false, newScopeForSecondBind: true  },
//     { t: '3', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: false,  lockScope2: true,  newScopeForSecondBind: false },
//     { t: '4', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: false,  lockScope2: true,  newScopeForSecondBind: true  },
//     { t: '5', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: true,   lockScope2: false, newScopeForSecondBind: false },
//     { t: '6', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: true,   lockScope2: false, newScopeForSecondBind: true  },
//     { t: '7', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: true,   lockScope2: true,  newScopeForSecondBind: false },
//     { t: '8', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: true,   lockScope2: true,  newScopeForSecondBind: true  },
//   ];

//   const relSpecs: ReleaseSpec[] = [
//     { t: ' 1', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: false },
//     { t: ' 2', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: true  },
//     { t: ' 3', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: true,  relAfterDetach2: false },
//     { t: ' 4', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: true,  relBeforeEndDetach2: false, relAfterDetach2: false },
//     { t: ' 5', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: true,  relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: false },
//     { t: ' 6', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: true,  relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: true  },
//     { t: ' 7', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: true,  relBeforeDetach2: false, relBeforeEndDetach2: true,  relAfterDetach2: false },
//     { t: ' 8', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: true,  relBeforeDetach2: true,  relBeforeEndDetach2: false, relAfterDetach2: false },
//     { t: ' 9', relBeforeDetach1: false, relBeforeEndDetach1: true,  relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: false },
//     { t: '10', relBeforeDetach1: false, relBeforeEndDetach1: true,  relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: true  },
//     { t: '11', relBeforeDetach1: false, relBeforeEndDetach1: true,  relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: true,  relAfterDetach2: false },
//     { t: '12', relBeforeDetach1: false, relBeforeEndDetach1: true,  relAfterDetach1: false, relBeforeDetach2: true,  relBeforeEndDetach2: false, relAfterDetach2: false },
//     { t: '13', relBeforeDetach1: true,  relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: false },
//     { t: '14', relBeforeDetach1: true,  relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: true  },
//     { t: '15', relBeforeDetach1: true,  relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: true,  relAfterDetach2: false },
//     { t: '16', relBeforeDetach1: true,  relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: true,  relBeforeEndDetach2: false, relAfterDetach2: false },
//   ];

//   const none = LF.none;
//   const start = LF.fromStartTask;
//   const stop = LF.fromStopTask;
//   const bind = LF.fromBind;
//   const attach = LF.fromAttach;
//   const detach = LF.fromDetach;
//   const unbind = LF.fromUnbind;
//   const startBind = start | bind;
//   const startAttach = start | attach;
//   const stopDetach = stop | detach;
//   const stopUnbind = stop | unbind;
//   const bindUnbind = bind | unbind;

//   const flagsSpecs: FlagsSpec[] = [
//     { t: '1', bindFlags1: none,       attachFlags1: none,        detachFlags1: none,       unbindFlags1: none,       bindFlags2: none,       attachFlags2: none,        detachFlags2: none,       unbindFlags2: none       },
//     { t: '2', bindFlags1: bind,       attachFlags1: attach,      detachFlags1: detach,     unbindFlags1: unbind,     bindFlags2: bind,       attachFlags2: attach,      detachFlags2: detach,     unbindFlags2: unbind     },
//     { t: '3', bindFlags1: bindUnbind, attachFlags1: attach,      detachFlags1: detach,     unbindFlags1: bindUnbind, bindFlags2: bindUnbind, attachFlags2: attach,      detachFlags2: detach,     unbindFlags2: bindUnbind },
//     { t: '4', bindFlags1: start,      attachFlags1: start,       detachFlags1: stop,       unbindFlags1: stop,       bindFlags2: start,      attachFlags2: start,       detachFlags2: stop,       unbindFlags2: stop       },
//     { t: '5', bindFlags1: startBind,  attachFlags1: startAttach, detachFlags1: stopDetach, unbindFlags1: stopUnbind, bindFlags2: startBind,  attachFlags2: startAttach, detachFlags2: stopDetach, unbindFlags2: stopUnbind },
//     { t: '6', bindFlags1: startBind,  attachFlags1: startAttach, detachFlags1: detach,     unbindFlags1: unbind,     bindFlags2: bind,       attachFlags2: attach,      detachFlags2: stopDetach, unbindFlags2: stopUnbind },
//   ];

//   const inputs: [CacheSpec[], DuplicateOperationSpec[], BindSpec[], ReleaseSpec[], FlagsSpec[]]
//     = [cacheSpecs, duplicateOperationSpecs, bindSpecs, relSpecs, flagsSpecs];

//   eachCartesianJoin(inputs, (cacheSpec, duplicateOpSpec, bindSpec, relSpec, flagsSpec) => {
//     it(`verify view behavior - cacheSpec ${cacheSpec.t}, duplicateOpSpec ${duplicateOpSpec.t}, bindSpec ${bindSpec.t}, relSpec ${relSpec.t}, flagsSpec ${flagsSpec.t}`, function () {
//       const { childCount, cacheSize } = cacheSpec;
//       const { bindTwice, duplicateBindValue, attachTwice, detachTwice, unbindTwice } = duplicateOpSpec;
//       const { propName, propValue1, lockScope1, newScopeForSecondBind, propValue2, lockScope2 } = bindSpec;
//       const { relBeforeDetach1, relBeforeEndDetach1, relAfterDetach1, relBeforeDetach2, relBeforeEndDetach2, relAfterDetach2 } = relSpec;
//       const { bindFlags1, attachFlags1, detachFlags1, unbindFlags1, bindFlags2, attachFlags2, detachFlags2, unbindFlags2 } = flagsSpec;

//       let firstBindInitialValue: string;
//       let firstBindFinalValue: string;
//       let secondBindInitialValue: string;
//       let secondBindFinalValue: string;

//       /**
//        * Notes on binding assertions
//        *
//        * There are 3 values the text binding can get:
//        * - propValue1 (assigned on first bind operation)
//        * - propValue2 (assigned on second bind operation)
//        * - duplicatedBindValue (assigned on the duplicated bind on both the first and second bind operations)
//        *
//        * And there are 4 booleans affecting the bind operations:
//        * - lockScope1 (perform `lockScope` on the first bind operation)
//        * - lockScope2 (perform `lockScope` on the second bind operation)
//        * - bindTwice (binds a second time on each bind operation, resulting in a total of 4 bind operations)
//        * - newScopeForSecondBind (creates a new scope for both the second and duplicated bind operations)
//        *
//        * If `newScopeForSecondBind` is true, a new scope is created with a new binding context that
//        * holds the appropriate value. If it is false, the appropriate value is instead assigned directly
//        * to the binding context on the existing scope.
//        *
//        * These combinations effectively test (almost) every possible scenario regarding binding a view:
//        *
//        * 1 During first bind, binding a view that is already bound (applies to `bindTwice` scenarios):
//        *   1.3 And the scope is locked, then nothing will happen regardless of the new scope you pass in.
//        *   1.2 And pass a different scope, then the view is unbound and bound again with the new scope.
//        *   1.1 And pass the same scope, then nothing will happen (changes in bindingContext will not propagate)
//        *
//        * The assigned value during first bind is stored in variable `firstBindFinalValue`
//        *
//        * 2 During second bind, binding a view that is not yet bound
//        *   2.1 And the scope was locked during first bind
//        *       2.1.1 And the scope is locked again during second bind, then any value/scope will propagate
//        *       2.1.2 And the scope is not locked during second bind
//        *             2.1.2.1 And pass a different scope, then nothing will happen regardless of the new scope
//        *             2.1.2.2 And assign a new value on the same scope, then that new value will propagate
//        *   2.2 And the scope was not locked during first bind, then any value/scope will propagate
//        *
//        * The assigned value during second bind is stored in variable `secondBindInitialValue`
//        *
//        * 3 During second bind, binding a view that is already bound (applies to `bindTwice` scenarios)
//        *   3.1 And the scope was locked during either first or second bind, then nothing will happen regardless of scope/value
//        *   3.2 And the scope was neither locked during first nor second bind
//        *       3.2.1 And pass in a different scope, then the view is unbound and bound again with the new scope
//        *       3.2.2 And pass in the same scope, then nothing will happen
//        */
//       firstBindInitialValue = propValue1;

//       if (bindTwice) {
//         if (lockScope1) { // 1.1
//           firstBindFinalValue = firstBindInitialValue;
//         } else if (newScopeForSecondBind) { // 1.2
//           firstBindFinalValue = duplicateBindValue;
//         } else { // 1.3
//           firstBindFinalValue = firstBindInitialValue;
//         }
//       } else {
//         firstBindFinalValue = firstBindInitialValue;
//       }

//       if (lockScope1) { // 2.1
//         if (lockScope2) { // 2.1.1
//           secondBindInitialValue = propValue2;
//         } else if (newScopeForSecondBind) { // 2.1.2.1
//           secondBindInitialValue = firstBindFinalValue;
//         } else { // 2.1.2.2
//           secondBindInitialValue = propValue2;
//         }
//       } else { // 2.2
//         secondBindInitialValue = propValue2;
//       }

//       if (bindTwice) {
//         if (lockScope1 || lockScope2) { // 3.1
//           secondBindFinalValue = secondBindInitialValue;
//         } else if (newScopeForSecondBind) { // 3.2.1
//           secondBindFinalValue = duplicateBindValue;
//         } else { // 3.2.2
//           secondBindFinalValue = secondBindInitialValue;
//         }
//       } else {
//         secondBindFinalValue = secondBindInitialValue;
//       }

//       // common stuff
//       const container = AuDOMConfiguration.createContainer();
//       const dom = container.get<AuDOM>(IDOM);
//       const observerLocator = container.get(IObserverLocator);
//       const lifecycle = container.get(ILifecycle);

//       // create a location for the top-level view
//       const location = AuNode.createRenderLocation();

//       // location needs a parentNode, the other purpose of the host is so we can assert
//       // its textContent to see what's mounted
//       const host = AuNode.createHost().appendChild(location.$start).appendChild(location);

//       // put the child views inside this wrapper (it will be added to the nodes of the
//       // top-level view) otherwise they won't be unmounted due to the only-root unmount guard flag
//       const childWrapper = AuNode.createTemplate();
//       const childLocs: IRenderLocation<AuNode>[] = Array(childCount);
//       for (let i = 0; i < childCount; ++i) {
//         const childLoc = childLocs[i] = AuNode.createRenderLocation();
//         childWrapper.appendChild(childLoc.$start).appendChild(childLoc);
//       }

//       // CompiledTemplate mock for the child views
//       const childTemplate: ITemplate<AuNode> = {
//         renderContext: null as any,
//         dom: null as any,
//         render(renderable) {
//           const text = AuNode.createText();
//           const wrapper = AuNode.createTemplate().appendChild(text);
//           childWrapper.appendChild(wrapper);

//           const nodes = new AuNodeSequence(dom, wrapper);
//           const binding = new PropertyBinding(new AccessScopeExpression(propName), text, 'textContent', BindingMode.oneTime, observerLocator, container);

//           (renderable as Writable<typeof renderable>).nodes = nodes;
//           addBinding(renderable, binding);
//         }
//       };
//       const childFactory = new ViewFactory<AuNode>('child', childTemplate, lifecycle);
//       // keep track of the child views because we need to do manually hold/release them
//       // during the appropriate lifecycles (normally a template controller would do this)
//       const childSuts: IController<AuNode>[] = Array(childCount);

//       // CompiledTemplate mock for the top-level view (sut)
//       const rootTemplate: ITemplate<AuNode> = {
//         renderContext: null as any,
//         dom: null as any,
//         render(renderable) {
//           const text = AuNode.createText();
//           const wrapper = AuNode.createTemplate().appendChild(text).appendChild(childWrapper);
//           const nodes = new AuNodeSequence(dom, wrapper);
//           const binding = new PropertyBinding(new AccessScopeExpression(propName), text, 'textContent', BindingMode.oneTime, observerLocator, container);

//           (renderable as Writable<typeof renderable>).nodes = nodes;
//           addBinding(renderable, binding);

//           for (let i = 0; i < childCount; ++i) {
//             const child = childSuts[i] = childFactory.create();
//             child.hold(childLocs[i]);
//             addComponent(renderable, child);
//           }
//         }
//       };

//       const factory = new ViewFactory<AuNode>('root', rootTemplate, lifecycle);
//       factory.setCacheSize(cacheSize, false);
//       const sut = factory.create();

//       // - Round 1 - bind

//       const scope1 = Scope.create(LF.none, BindingContext.create(LF.none, propName, propValue1));
//       if (lockScope1) {
//         sut.lockScope(scope1);
//       }
//       sut.hold(location);

//       runBindLifecycle(lifecycle, sut, bindFlags1, scope1);

//       assert.strictEqual(sut.nodes.childNodes[0].textContent, firstBindInitialValue, 'sut.nodes.childNodes[0].textContent #1');

//       if (bindTwice) {
//         let newScope: Scope;
//         if (newScopeForSecondBind) {
//           newScope = Scope.create(LF.none, BindingContext.create(LF.none, propName, duplicateBindValue));
//         } else {
//           scope1.bindingContext[propName] = duplicateBindValue;
//           newScope = scope1;
//         }
//         runBindLifecycle(lifecycle, sut, bindFlags1, newScope);
//       }

//       assert.strictEqual(sut.nodes.childNodes[0].textContent, firstBindFinalValue, 'sut.nodes.childNodes[0].textContent #2');

//       // - Round 1 - attach

//       runAttachLifecycle(lifecycle, sut, attachFlags1);
//       if (attachTwice) {
//         runAttachLifecycle(lifecycle, sut, attachFlags1);
//       }

//       assert.strictEqual(host.textContent, firstBindFinalValue.repeat(1 + childCount), 'host.textContent #1');

//       // - Round 1 - detach

//       lifecycle.detached.begin();
//       if (relBeforeDetach1) {
//         sut.release(detachFlags1);
//         assert.strictEqual(host.textContent, firstBindFinalValue.repeat(1 + childCount), 'host.textContent #2');
//       }
//       sut.detach(detachFlags1);
//       if (relBeforeEndDetach1) {
//         sut.release(detachFlags1);
//         assert.strictEqual(host.textContent, '', 'host.textContent #3');
//       }
//       lifecycle.detached.end(detachFlags1);
//       if (relAfterDetach1) {
//         sut.release(detachFlags1);
//       }
//       if (cacheSize > 0) {
//         if (relBeforeDetach1 || relBeforeEndDetach1) {
//           assert.strictEqual(factory['cache'].length, 1, `factory['cache'].length`);
//           assert.strictEqual(factory.create(), sut, `factory.create()`);
//         } else {
//           assert.strictEqual(factory['cache'].length, 0, `factory['cache'].length`);
//         }
//       }
//       if (detachTwice) {
//         lifecycle.detached.begin();
//         if (relBeforeDetach1) {
//           sut.release(detachFlags1);
//         }
//         sut.detach(detachFlags1);
//         if (relBeforeEndDetach1) {
//           sut.release(detachFlags1);
//         }
//         lifecycle.detached.end(detachFlags1);
//         if (relAfterDetach1) {
//           sut.release(detachFlags1);
//         }
//       }

//       assert.strictEqual(host.textContent, '', 'host.textContent #4');

//       // - Round 1 - unbind

//       runUnbindLifecycle(lifecycle, sut, unbindFlags1);
//       if (unbindTwice) {
//         runUnbindLifecycle(lifecycle, sut, unbindFlags1);
//       }

//       // Round 2 - bind

//       let scope2: Scope;
//       if (newScopeForSecondBind) {
//         scope2 = Scope.create(LF.none, BindingContext.create(LF.none, propName, propValue2));
//       } else {
//         scope1.bindingContext[propName] = propValue2;
//         scope2 = scope1;
//       }
//       if (lockScope2) {
//         sut.lockScope(scope2);
//       }
//       sut.hold(location);

//       runBindLifecycle(lifecycle, sut, bindFlags2, scope2);

//       assert.strictEqual(sut.nodes.childNodes[0].textContent, secondBindInitialValue, 'sut.nodes.childNodes[0].textContent #3');

//       if (bindTwice) {
//         let newScope: Scope;
//         if (newScopeForSecondBind) {
//           newScope = Scope.create(LF.none, BindingContext.create(LF.none, propName, duplicateBindValue));
//         } else {
//           scope2.bindingContext[propName] = duplicateBindValue;
//           newScope = scope2;
//         }
//         runBindLifecycle(lifecycle, sut, bindFlags2, newScope);
//       }

//       assert.strictEqual(sut.nodes.childNodes[0].textContent, secondBindFinalValue, 'sut.nodes.childNodes[0].textContent #4');

//       // Round 2 - attach

//       runAttachLifecycle(lifecycle, sut, attachFlags2);
//       if (attachTwice) {
//         runAttachLifecycle(lifecycle, sut, attachFlags2);
//       }

//       assert.strictEqual(host.textContent, secondBindFinalValue.repeat(1 + childCount), 'host.textContent #5');

//       // Round 2 - detach

//       lifecycle.detached.begin();
//       if (relBeforeDetach2) {
//         sut.release(detachFlags2);
//         assert.strictEqual(host.textContent, secondBindFinalValue.repeat(1 + childCount), 'host.textContent #6');
//       }
//       sut.detach(detachFlags2);
//       if (relBeforeEndDetach2) {
//         sut.release(detachFlags2);
//         assert.strictEqual(host.textContent, '', 'host.textContent #7');
//       }
//       lifecycle.detached.end(detachFlags2);
//       if (relAfterDetach2) {
//         sut.release(detachFlags2);
//       }
//       if (cacheSize > 0) {
//         if (relBeforeDetach2 || relBeforeEndDetach2) {
//           assert.strictEqual(factory['cache'].length, 1, `factory['cache'].length`);
//           assert.strictEqual(factory.create(), sut, `factory.create()`);
//         } else {
//           assert.strictEqual(factory['cache'].length, 0, `factory['cache'].length`);
//         }
//       }
//       if (detachTwice) {
//         lifecycle.detached.begin();
//         if (relBeforeDetach2) {
//           sut.release(detachFlags2);
//         }
//         sut.detach(detachFlags2);
//         if (relBeforeEndDetach2) {
//           sut.release(detachFlags2);
//         }
//         lifecycle.detached.end(detachFlags2);
//         if (relAfterDetach2) {
//           sut.release(detachFlags2);
//         }
//       }

//       assert.strictEqual(host.textContent, '', 'host.textContent #8');

//       // Round 2 - unbind

//       runUnbindLifecycle(lifecycle, sut, unbindFlags2);
//       if (unbindTwice) {
//         runUnbindLifecycle(lifecycle, sut, unbindFlags2);
//       }
//     });

//   });
// });
