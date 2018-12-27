import {
  Writable
} from '@aurelia/kernel';
import { expect } from 'chai';
import {
  eachCartesianJoin
} from '../../../../scripts/test-lib';
import {
  AccessScope,
  addAttachable,
  addBindable,
  Binding,
  BindingContext,
  BindingMode,
  IDOM,
  ILifecycle,
  IObserverLocator,
  IRenderable,
  IRenderLocation,
  ITemplate,
  IView,
  Lifecycle,
  LifecycleFlags,
  Scope,
  ViewFactory
} from '../../src/index';
import {
  AuDOM,
  AuDOMConfiguration,
  AuNode,
  AuNodeSequence
} from '../au-dom';

class StubView {
  constructor(public cached = false) {}
  public $cache() {
    this.cached = true;
  }
}

class StubTemplate {
  constructor(public nodes = {}) {}
  public render(renderable: Partial<IRenderable>) {
    (renderable as Writable<IRenderable>).$nodes = this.nodes as any;
  }
}

describe(`ViewFactory`, () => {
  describe(`tryReturnToCache`, () => {
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
        it(`setCacheSize(${text2},${text1}) -> tryReturnToCache -> create x2 -> setCacheSize(${text4},${text3}) -> tryReturnToCache -> create x2`, () => {
          const template = new StubTemplate();
          const sut = new ViewFactory(null, template as any, new Lifecycle());
          const view1 = new StubView();
          const view2 = new StubView();

          sut.setCacheSize(size2, doNotOverride1);

          let canCache = isPositive2;
          expect(sut.tryReturnToCache(view1 as any)).to.equal(canCache, 'sut.tryReturnToCache(view1)');
          expect(view1.cached).to.equal(canCache, 'view1.cached');
          if (canCache) {
            const cached = sut.create();
            expect(cached).to.equal(view1, 'cached');
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes, 'created.$nodes');
            expect(sut.tryReturnToCache(view1 as any)).to.equal(true, 'sut.tryReturnToCache(<any>view1)');

            if (size2 !== '*') {
              expect(sut.tryReturnToCache(view1 as any)).to.equal(false, 'sut.tryReturnToCache(view1) 2');
            }
          } else {
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes, 'created.$nodes');
          }

          // note: the difference in behavior between 0 (number) and '0' (string),
          // and the behavior of values lower than -1 are kind of quirky
          // probably not important enough for the overhead of an extra check, but at least worth a note
          if (size4 && ((size2 === -1 || size2 === '-1' || size2 === 0) || !doNotOverride3)) {
            canCache = isPositive4;
          }
          sut.setCacheSize(size4, doNotOverride3);

          expect(sut.tryReturnToCache(view2 as any)).to.equal(canCache, 'sut.tryReturnToCache(view2)');
          expect(view2.cached).to.equal(canCache, 'view2.cached');
          if (canCache) {
            const cached = sut.create();
            expect(cached).to.equal(view2, 'cached');
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes, 'created.$nodes');
            expect(sut.tryReturnToCache(view2 as any)).to.equal(true, 'sut.tryReturnToCache(<any>view2)');

            if (size2 !== '*' && size4 !== '*') {
              expect(sut.tryReturnToCache(view2 as any)).to.equal(false, 'sut.tryReturnToCache(view2) 2');
            }
          } else {
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes, 'created.$nodes');
          }

        });
      }
    );
  });
});

// public render(renderable: Partial<IRenderable>, host?: INode, parts?: TemplatePartDefinitions): void {
//   const nodes = (<Writable<IRenderable>>renderable).$nodes = new MockTextNodeSequence();
//   addBindable(renderable, new Binding(this.sourceExpression, nodes.firstChild, 'textContent', BindingMode.toView, this.observerLocator, this.container));
// }
describe('View', () => {
  interface Spec {
    t: string;
  }
  interface CacheSpec extends Spec {
    childCount: number;
    cacheSize: number;
  }
  interface DuplicateOperationSpec extends Spec {
    bindTwice: boolean;
    duplicateBindValue: string;
    attachTwice: boolean;
    detachTwice: boolean;
    unbindTwice: boolean;
  }
  interface BindSpec extends Spec {
    propName: string;
    propValue1: string;
    lockScope1: boolean;
    // for the bind operation in the second lifecycle, create a new scope?
    newScopeForSecondBind: boolean;
    propValue2: string;
    lockScope2: boolean;
  }
  interface ReleaseSpec extends Spec {
    relBeforeDetach1: boolean;
    relBeforeEndDetach1: boolean;
    relAfterDetach1: boolean;

    relBeforeDetach2: boolean;
    relBeforeEndDetach2: boolean;
    relAfterDetach2: boolean;
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

  const cacheSpecs: CacheSpec[] = [
    { t: ' 1', cacheSize: 0, childCount: 0 },
    { t: ' 2', cacheSize: 0, childCount: 1 },
    { t: ' 3', cacheSize: 0, childCount: 2 },
    { t: ' 4', cacheSize: 1, childCount: 0 },
    { t: ' 5', cacheSize: 1, childCount: 1 },
    { t: ' 6', cacheSize: 1, childCount: 2 }
  ];

  const duplicateOperationSpecs: DuplicateOperationSpec[] = [
    { t: '1', bindTwice: false, duplicateBindValue: '0', attachTwice: false, detachTwice: false, unbindTwice: false },
    { t: '2', bindTwice: true,  duplicateBindValue: '0', attachTwice: true,  detachTwice: true,  unbindTwice: true  }
  ];

  const bindSpecs: BindSpec[] = [
    { t: '1', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: false,  lockScope2: false, newScopeForSecondBind: false },
    { t: '2', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: false,  lockScope2: false, newScopeForSecondBind: true  },
    { t: '3', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: false,  lockScope2: true,  newScopeForSecondBind: false },
    { t: '4', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: false,  lockScope2: true,  newScopeForSecondBind: true  },
    { t: '5', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: true,   lockScope2: false, newScopeForSecondBind: false },
    { t: '6', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: true,   lockScope2: false, newScopeForSecondBind: true  },
    { t: '7', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: true,   lockScope2: true,  newScopeForSecondBind: false },
    { t: '8', propName: 'foo', propValue1: '1', propValue2: '2', lockScope1: true,   lockScope2: true,  newScopeForSecondBind: true  },
  ];

  const relSpecs: ReleaseSpec[] = [
    { t: ' 1', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: false },
    { t: ' 2', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: true  },
    { t: ' 3', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: true,  relAfterDetach2: false },
    { t: ' 4', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: true,  relBeforeEndDetach2: false, relAfterDetach2: false },
    { t: ' 5', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: true,  relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: false },
    { t: ' 6', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: true,  relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: true  },
    { t: ' 7', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: true,  relBeforeDetach2: false, relBeforeEndDetach2: true,  relAfterDetach2: false },
    { t: ' 8', relBeforeDetach1: false, relBeforeEndDetach1: false, relAfterDetach1: true,  relBeforeDetach2: true,  relBeforeEndDetach2: false, relAfterDetach2: false },
    { t: ' 9', relBeforeDetach1: false, relBeforeEndDetach1: true,  relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: false },
    { t: '10', relBeforeDetach1: false, relBeforeEndDetach1: true,  relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: true  },
    { t: '11', relBeforeDetach1: false, relBeforeEndDetach1: true,  relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: true,  relAfterDetach2: false },
    { t: '12', relBeforeDetach1: false, relBeforeEndDetach1: true,  relAfterDetach1: false, relBeforeDetach2: true,  relBeforeEndDetach2: false, relAfterDetach2: false },
    { t: '13', relBeforeDetach1: true,  relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: false },
    { t: '14', relBeforeDetach1: true,  relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: false, relAfterDetach2: true  },
    { t: '15', relBeforeDetach1: true,  relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: false, relBeforeEndDetach2: true,  relAfterDetach2: false },
    { t: '16', relBeforeDetach1: true,  relBeforeEndDetach1: false, relAfterDetach1: false, relBeforeDetach2: true,  relBeforeEndDetach2: false, relAfterDetach2: false },
  ];

  const none = LifecycleFlags.none;
  const start = LifecycleFlags.fromStartTask;
  const stop = LifecycleFlags.fromStopTask;
  const bind = LifecycleFlags.fromBind;
  const attach = LifecycleFlags.fromAttach;
  const detach = LifecycleFlags.fromDetach;
  const unbind = LifecycleFlags.fromUnbind;
  const startBind = start | bind;
  const startAttach = start | attach;
  const stopDetach = stop | detach;
  const stopUnbind = stop | unbind;
  const bindUnbind = bind | unbind;

  const flagsSpecs: FlagsSpec[] = [
    { t: '1', bindFlags1: none,       attachFlags1: none,        detachFlags1: none,       unbindFlags1: none,       bindFlags2: none,       attachFlags2: none,        detachFlags2: none,       unbindFlags2: none       },
    { t: '2', bindFlags1: bind,       attachFlags1: attach,      detachFlags1: detach,     unbindFlags1: unbind,     bindFlags2: bind,       attachFlags2: attach,      detachFlags2: detach,     unbindFlags2: unbind     },
    { t: '3', bindFlags1: bindUnbind, attachFlags1: attach,      detachFlags1: detach,     unbindFlags1: bindUnbind, bindFlags2: bindUnbind, attachFlags2: attach,      detachFlags2: detach,     unbindFlags2: bindUnbind },
    { t: '4', bindFlags1: start,      attachFlags1: start,       detachFlags1: stop,       unbindFlags1: stop,       bindFlags2: start,      attachFlags2: start,       detachFlags2: stop,       unbindFlags2: stop       },
    { t: '5', bindFlags1: startBind,  attachFlags1: startAttach, detachFlags1: stopDetach, unbindFlags1: stopUnbind, bindFlags2: startBind,  attachFlags2: startAttach, detachFlags2: stopDetach, unbindFlags2: stopUnbind },
    { t: '6', bindFlags1: startBind,  attachFlags1: startAttach, detachFlags1: detach,     unbindFlags1: unbind,     bindFlags2: bind,       attachFlags2: attach,      detachFlags2: stopDetach, unbindFlags2: stopUnbind },
  ];

  const inputs: [CacheSpec[], DuplicateOperationSpec[], BindSpec[], ReleaseSpec[], FlagsSpec[]]
    = [cacheSpecs, duplicateOperationSpecs, bindSpecs, relSpecs, flagsSpecs];

  eachCartesianJoin(inputs, (cacheSpec, duplicateOpSpec, bindSpec, relSpec, flagsSpec) => {
    it(`verify view behavior - cacheSpec ${cacheSpec.t}, duplicateOpSpec ${duplicateOpSpec.t}, bindSpec ${bindSpec.t}, relSpec ${relSpec.t}, flagsSpec ${flagsSpec.t}`, () => {
      const { childCount, cacheSize } = cacheSpec;
      const { bindTwice, duplicateBindValue, attachTwice, detachTwice, unbindTwice } = duplicateOpSpec;
      const { propName, propValue1, lockScope1, newScopeForSecondBind, propValue2, lockScope2 } = bindSpec;
      const { relBeforeDetach1, relBeforeEndDetach1, relAfterDetach1, relBeforeDetach2, relBeforeEndDetach2, relAfterDetach2 } = relSpec;
      const { bindFlags1, attachFlags1, detachFlags1, unbindFlags1, bindFlags2, attachFlags2, detachFlags2, unbindFlags2 } = flagsSpec;

      let expectedText1: string;
      let expectedText2: string;

      if (bindTwice && newScopeForSecondBind && !lockScope1) {
        expectedText1 = duplicateBindValue.repeat(1 + childCount);
      } else {
        expectedText1 = propValue1.repeat(1 + childCount);
      }
      if (lockScope1 && !lockScope2) {
        if (newScopeForSecondBind) {
          expectedText2 = propValue1.repeat(1 + childCount);
        } else {
          expectedText2 = propValue2.repeat(1 + childCount);
        }
      } else {
        if (!bindTwice || lockScope2) {
          expectedText2 = propValue2.repeat(1 + childCount);
        } else if (newScopeForSecondBind && !lockScope2) {
          expectedText2 = duplicateBindValue.repeat(1 + childCount);
        } else {
          expectedText2 = propValue2.repeat(1 + childCount);
        }
      }

      // common stuff
      const container = AuDOMConfiguration.createContainer();
      const dom = container.get<AuDOM>(IDOM);
      const observerLocator = container.get(IObserverLocator);
      const lifecycle = container.get(ILifecycle);

      // create a location for the top-level view
      const location = AuNode.createRenderLocation();

      // location needs a parentNode, the other purpose of the host is so we can assert
      // its textContent to see what's mounted
      const host = AuNode.createHost().appendChild(location.$start).appendChild(location);

      // put the child views inside this wrapper (it will be added to the nodes of the
      // top-level view) otherwise they won't be unmounted due to the only-root unmount guard flag
      const childWrapper = AuNode.createTemplate();
      const childLocs: IRenderLocation<AuNode>[] = Array(childCount);
      for (let i = 0; i < childCount; ++i) {
        const childLoc = childLocs[i] = AuNode.createRenderLocation();
        childWrapper.appendChild(childLoc.$start).appendChild(childLoc);
      }

      // CompiledTemplate mock for the child views
      const childTemplate: ITemplate<AuNode> = {
        renderContext: null as any,
        dom: null as any,
        render(renderable) {
          const text = AuNode.createText();
          const wrapper = AuNode.createTemplate().appendChild(text);
          childWrapper.appendChild(wrapper);

          const nodes = new AuNodeSequence(dom, wrapper);
          const binding = new Binding(new AccessScope(propName), text, 'textContent', BindingMode.oneTime, observerLocator, container);

          (renderable as Writable<typeof renderable>).$nodes = nodes;
          addBindable(renderable, binding);
        }
      };
      const childFactory = new ViewFactory<AuNode>('child', childTemplate, lifecycle);
      // keep track of the child views because we need to do manually hold/release them
      // during the appropriate lifecycles (normally a template controller would do this)
      const childSuts: IView<AuNode>[] = Array(childCount);

      // CompiledTemplate mock for the top-level view (sut)
      const rootTemplate: ITemplate<AuNode> = {
        renderContext: null as any,
        dom: null as any,
        render(renderable) {
          const text = AuNode.createText();
          const wrapper = AuNode.createTemplate().appendChild(text).appendChild(childWrapper);
          const nodes = new AuNodeSequence(dom, wrapper);
          const binding = new Binding(new AccessScope(propName), text, 'textContent', BindingMode.oneTime, observerLocator, container);

          (renderable as Writable<typeof renderable>).$nodes = nodes;
          addBindable(renderable, binding);

          for (let i = 0; i < childCount; ++i) {
            const child = childSuts[i] = childFactory.create();
            child.hold(childLocs[i]);
            addBindable(renderable, child);
            addAttachable(renderable, child);
          }
        }
      };

      const factory = new ViewFactory<AuNode>('root', rootTemplate, lifecycle);
      factory.setCacheSize(cacheSize, false);
      const sut = factory.create();

      // - Round 1 - bind

      const scope1 = Scope.create(BindingContext.create(propName, propValue1));
      if (lockScope1) {
        sut.lockScope(scope1);
      }
      sut.hold(location);

      lifecycle.beginBind();
      sut.$bind(bindFlags1, scope1);
      lifecycle.endBind(bindFlags1);
      if (bindTwice) {
        let newScope: Scope;
        if (newScopeForSecondBind) {
          newScope = Scope.create(BindingContext.create(propName, duplicateBindValue));
        } else {
          scope1.bindingContext[propName] = duplicateBindValue;
          newScope = scope1;
        }
        lifecycle.beginBind();
        sut.$bind(bindFlags1, newScope);
        lifecycle.endBind(bindFlags1);
      }

      // - Round 1 - attach

      lifecycle.beginAttach();
      sut.$attach(attachFlags1);
      lifecycle.endAttach(attachFlags1);
      if (attachTwice) {
        lifecycle.beginAttach();
        sut.$attach(attachFlags1);
        lifecycle.endAttach(attachFlags1);
      }

      expect(host.textContent).to.equal(expectedText1, 'host.textContent #1');

      // - Round 1 - detach

      lifecycle.beginDetach();
      if (relBeforeDetach1) {
        sut.release(detachFlags1);
        expect(host.textContent).to.equal(expectedText1, 'host.textContent #2');
      }
      sut.$detach(detachFlags1);
      if (relBeforeEndDetach1) {
        sut.release(detachFlags1);
        expect(host.textContent).to.equal('', 'host.textContent #3');
      }
      lifecycle.endDetach(detachFlags1);
      if (relAfterDetach1) {
        sut.release(detachFlags1);
      }
      if (cacheSize > 0) {
        if (relBeforeDetach1 || relBeforeEndDetach1) {
          expect(factory['cache'].length).to.equal(1);
          expect(factory.create()).to.equal(sut);
        } else {
          expect(factory['cache'].length).to.equal(0);
        }
      }
      if (detachTwice) {
        lifecycle.beginDetach();
        if (relBeforeDetach1) {
          sut.release(detachFlags1);
        }
        sut.$detach(detachFlags1);
        if (relBeforeEndDetach1) {
          sut.release(detachFlags1);
        }
        lifecycle.endDetach(detachFlags1);
        if (relAfterDetach1) {
          sut.release(detachFlags1);
        }
      }

      expect(host.textContent).to.equal('', 'host.textContent #4');

      // - Round 1 - unbind

      lifecycle.beginUnbind();
      sut.$unbind(unbindFlags1);
      lifecycle.endUnbind(unbindFlags1);
      if (unbindTwice) {
        lifecycle.beginUnbind();
        sut.$unbind(unbindFlags1);
        lifecycle.endUnbind(unbindFlags1);
      }

      // Round 2 - bind

      let scope2: Scope;
      if (newScopeForSecondBind) {
        scope2 = Scope.create(BindingContext.create(propName, propValue2));
      } else {
        scope1.bindingContext[propName] = propValue2;
        scope2 = scope1;
      }
      if (lockScope2) {
        sut.lockScope(scope2);
      }
      sut.hold(location);

      lifecycle.beginBind();
      sut.$bind(bindFlags2, scope2);
      lifecycle.endBind(bindFlags2);
      if (bindTwice) {
        let newScope: Scope;
        if (newScopeForSecondBind) {
          newScope = Scope.create(BindingContext.create(propName, duplicateBindValue));
        } else {
          scope2.bindingContext[propName] = duplicateBindValue;
          newScope = scope2;
        }
        lifecycle.beginBind();
        sut.$bind(bindFlags2, newScope);
        lifecycle.endBind(bindFlags2);
      }

      // Round 2 - attach

      lifecycle.beginAttach();
      sut.$attach(attachFlags2);
      lifecycle.endAttach(attachFlags2);
      if (attachTwice) {
        lifecycle.beginAttach();
        sut.$attach(attachFlags2);
        lifecycle.endAttach(attachFlags2);
      }

      expect(host.textContent).to.equal(expectedText2, 'host.textContent #5');

      // Round 2 - detach

      lifecycle.beginDetach();
      if (relBeforeDetach2) {
        sut.release(detachFlags2);
        expect(host.textContent).to.equal(expectedText2, 'host.textContent #6');
      }
      sut.$detach(detachFlags2);
      if (relBeforeEndDetach2) {
        sut.release(detachFlags2);
        expect(host.textContent).to.equal('', 'host.textContent #7');
      }
      lifecycle.endDetach(detachFlags2);
      if (relAfterDetach2) {
        sut.release(detachFlags2);
      }
      if (cacheSize > 0) {
        if (relBeforeDetach2 || relBeforeEndDetach2) {
          expect(factory['cache'].length).to.equal(1);
          expect(factory.create()).to.equal(sut);
        } else {
          expect(factory['cache'].length).to.equal(0);
        }
      }
      if (detachTwice) {
        lifecycle.beginDetach();
        if (relBeforeDetach2) {
          sut.release(detachFlags2);
        }
        sut.$detach(detachFlags2);
        if (relBeforeEndDetach2) {
          sut.release(detachFlags2);
        }
        lifecycle.endDetach(detachFlags2);
        if (relAfterDetach2) {
          sut.release(detachFlags2);
        }
      }

      expect(host.textContent).to.equal('', 'host.textContent #8');

      // Round 2 - unbind

      lifecycle.beginUnbind();
      sut.$unbind(unbindFlags2);
      lifecycle.endUnbind(unbindFlags2);
      if (unbindTwice) {
        lifecycle.beginUnbind();
        sut.$unbind(unbindFlags2);
        lifecycle.endUnbind(unbindFlags2);
      }
    });

  });
});
