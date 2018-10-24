import { spy } from 'sinon';
import { PLATFORM, Writable } from '../../../kernel/src/index';
import {
  noViewTemplate,
  ITemplate,
  IScope,
  BindingContext,
  IViewFactory,
  IView,
  DetachLifecycleController,
  ViewFactory,
  BindingFlags,
  View,
  IAttachLifecycle,
  INode,
  AttachLifecycleController,
  LifecycleFlags,
  IDetachLifecycle,
  Lifecycle,
  IAttachLifecycleController,
  IDetachLifecycleController,
  IRenderLocation,
  INodeSequence,
  AccessScope,
  IChangeSet,
  LinkedChangeList,
  Scope,
  IRenderable,
  addBindable,
  addAttachable,
  LifecycleState,
  ObserverLocator,
  NodeSequence,
  INodeSequenceFactory
} from '../../src';
import { expect } from 'chai';
import { eachCartesianJoin, eachCartesianJoinFactory } from '../../../../scripts/test-lib';
import { MockTextNodeTemplate } from '../unit/mock';

class StubView {
  constructor(public cached = false) {}
  public $cache() {
    this.cached = true;
  }
}

class StubTemplate {
  constructor(public nodes = {}) {}
  public render(renderable: Partial<IRenderable>) {
    (<Writable<IRenderable>>renderable).$nodes = <any>this.nodes;
  }
}

describe(`ViewFactory`, () => {
  describe(`tryReturnToCache`, () => {
    eachCartesianJoin<
      [string, boolean],
      [string, any, boolean],
      [string, boolean],
      [string, any, boolean],
      void
    >([
        [
          [' true', true],
          ['false', false]
        ],
        [
          [`  -2`,  -2,  false],
          [`  -1`,  -1,  false],
          [`   0`,   0,  false],
          [`   1`,   1,   true],
          [`'-2'`, '-2', false],
          [`'-1'`, '-1', false],
          [` '0'`,  '0', false],
          [` '1'`,  '1',  true],
          [` '*'`,  '*',  true]
        ],
        [
          [' true', true],
          ['false', false]
        ],
        [
          [`  -2`,  -2,  false],
          [`  -1`,  -1,  false],
          [`   0`,   0,  false],
          [`   1`,   1,   true],
          [`'-2'`, '-2', false],
          [`'-1'`, '-1', false],
          [` '0'`,  '0', false],
          [` '1'`,  '1',  true],
          [` '*'`,  '*',  true]
        ]
      ],
      ([text1, doNotOverride1], [text2, size2, isPositive2], [text3, doNotOverride3], [text4, size4, isPositive4]) => {
        it(`setCacheSize(${text2},${text1}) -> tryReturnToCache -> create x2 -> setCacheSize(${text4},${text3}) -> tryReturnToCache -> create x2`, () => {
          const template = new StubTemplate()
          const sut = new ViewFactory(null, template as any);
          const view1 = new StubView();
          const view2 = new StubView();

          sut.setCacheSize(size2, doNotOverride1);

          let canCache = isPositive2;
          expect(sut.tryReturnToCache(<any>view1)).to.equal(canCache, 'sut.tryReturnToCache(view1)');
          expect(view1.cached).to.equal(canCache, 'view1.cached');
          if (canCache) {
            const cached = sut.create();
            expect(cached).to.equal(view1, 'cached');
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes, 'created.$nodes');
            expect(sut.tryReturnToCache(<any>view1)).to.equal(true, 'sut.tryReturnToCache(<any>view1)');

            if (size2 !== '*') {
              expect(sut.tryReturnToCache(<any>view1)).to.equal(false, 'sut.tryReturnToCache(view1) 2');
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

          expect(sut.tryReturnToCache(<any>view2)).to.equal(canCache, 'sut.tryReturnToCache(view2)');
          expect(view2.cached).to.equal(canCache, 'view2.cached');
          if (canCache) {
            const cached = sut.create();
            expect(cached).to.equal(view2, 'cached');
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes, 'created.$nodes');
            expect(sut.tryReturnToCache(<any>view2)).to.equal(true, 'sut.tryReturnToCache(<any>view2)');

            if (size2 !== '*' && size4 !== '*') {
              expect(sut.tryReturnToCache(<any>view2)).to.equal(false, 'sut.tryReturnToCache(view2) 2');
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

const expressions = {
  text: new AccessScope('text')
};

describe(`View`, () => {
  eachCartesianJoinFactory<
    [string, View, ITemplate, ViewFactory, IChangeSet, boolean],
    [string, BindingFlags, IScope],
    [string, (sut: View) => void],
    [string, IRenderLocation],
    [string, (sut: View) => void],
    [string, INode, IAttachLifecycleController],
    [string, (sut: View) => void],
    [string, (sut: View) => void],
    [string, IDetachLifecycleController],
    [string, (sut: View) => void],
    [string, BindingFlags],
    [string, (sut: View) => void],
    void
  >(
    [
      [
        () => {
          const cs = new LinkedChangeList();
          const factory = new ViewFactory('foo', noViewTemplate);
          factory.setCacheSize('*', true);
          return [` noViewTemplate, viewFactory(cache=true )`, <View>factory.create(), noViewTemplate, factory, cs, true];
        },
        () => {
          const cs = new LinkedChangeList();
          const factory = new ViewFactory('foo', noViewTemplate);
          return [` noViewTemplate, viewFactory(cache=false)`, <View>factory.create(), noViewTemplate, factory, cs, false];
        },
        () => {
          const cs = new LinkedChangeList();
          const template = new MockTextNodeTemplate(expressions.text, new ObserverLocator(cs, null, null, null)) as any;
          const factory = new ViewFactory('foo', <any>template);
          factory.setCacheSize('*', true);
          return [`textNodeTemplate, viewFactory(cache=true )`, <View>factory.create(), template, factory, cs, true];
        },
        () => {
          const cs = new LinkedChangeList();
          const template = new MockTextNodeTemplate(expressions.text, new ObserverLocator(cs, null, null, null)) as any;
          const factory = new ViewFactory('foo', <any>template);
          return [`textNodeTemplate, viewFactory(cache=false)`, <View>factory.create(), template, factory, cs, false];
        },
        () => {
          const cs = new LinkedChangeList();
          const template = new MockTextNodeTemplate(expressions.text, new ObserverLocator(cs, null, null, null)) as any;
          const factory = new ViewFactory('foo', <any>template);
          const child = <View>factory.create();
          const sut = <View>factory.create();
          addBindable(sut, child);
          addAttachable(sut, child);
          factory.setCacheSize('*', true);
          return [`textNodeTemplate, viewFactory(cache=true )`, sut, template, factory, cs, true];
        },
        () => {
          const cs = new LinkedChangeList();
          const template = new MockTextNodeTemplate(expressions.text, new ObserverLocator(cs, null, null, null)) as any;
          const factory = new ViewFactory('foo', <any>template);
          const child = <View>factory.create();
          const sut = <View>factory.create();
          addBindable(sut, child);
          addAttachable(sut, child);
          return [`textNodeTemplate, viewFactory(cache=false)`, sut, template, factory, cs, false];
        }
      ],
      [
        () => [`fromBind, {text:'foo'}`, BindingFlags.fromBind, Scope.create({text:'foo'}, null)]
      ],
      [
        () => [`       noop`, PLATFORM.noop],
        ($1, [$21, flags, scope]) => [`      $bind`, (sut) => {
          sut.$bind(flags, scope);

          expect(sut.$scope).to.equal(scope, 'sut.$scope');
          expect(sut).to.have.$state.isBound();
          if (sut.$nodes.firstChild) {
            expect(sut.$nodes.firstChild.textContent).to.equal('', 'sut.$nodes.firstChild.textContent');
          }

          // TODO: verify short-circuit if already bound (now we can only tell by debugging or looking at the coverage report, not very clean)
          sut.$bind(flags, scope);

          const newScope = Scope.create({text:'foo'}, null);
          sut.$bind(flags, newScope);

          expect(sut.$scope).to.equal(newScope, 'sut.$scope');
          expect(sut).to.have.$state.isBound();
        }],
        ([$11, $12, $13, $14, cs], [$21, flags, scope]) => [`$bind+flush`, (sut) => {
          sut.$bind(flags, scope);

          expect(sut.$scope).to.equal(scope, 'sut.$scope');
          expect(sut).to.have.$state.isBound();
          if (sut.$nodes.firstChild) {
            expect(sut.$nodes.firstChild.textContent).to.equal('', 'sut.$nodes.firstChild.textContent');
            cs.flushChanges();
            expect(sut.$nodes.firstChild.textContent).to.equal('foo', 'sut.$nodes.firstChild.textContent');
            if (sut.$attachableHead) {
              expect(sut.$attachableHead.$nodes.firstChild.textContent).to.equal('foo', 'sut.$attachableHead.$nodes.firstChild.textContent');
            }
          }
        }]
      ],
      [
        () => {
          const location = document.createElement('div');
          return [`div`, location]
        },
        () => {
          const host = document.createElement('div');
          const location = document.createElement('div');
          host.appendChild(location);
          return [`div`, location]
        }
      ],
      [
        () => [` noop`, PLATFORM.noop],
        ($1, $2, $3, [$41, location]) => [`mount`, (sut) => {
          if (!location.parentNode) {
            expect(() => sut.hold(location)).to.throw(/60/);
          } else {
            sut.hold(location);

            expect(sut.location).to.equal(location, 'sut.location');
            if (sut.$nodes === NodeSequence.empty) {
              // TODO uncomment this again if the currently commented logic in the view related to this is also uncommented
              //expect(sut.requiresNodeAdd).to.be.false;
            } else {
              expect(sut).to.have.$state.needsMount();
            }
            if (sut.$attachableHead) {
              expect(sut.$attachableHead.location).to.equal(undefined, 'sut.$attachableHead.location');
            }

            expect(location.parentNode.textContent).to.equal('', 'location.parentNode.textContent');
            expect(location.parentNode.childNodes.length).to.equal(1, 'location.parentNode.childNodes.length');
            expect(location.parentNode.childNodes[0].childNodes.length).to.equal(0, 'location.parentNode.childNodes[0].childNodes.length');
          }
        }]
      ],
      [
        ([$11, $12, $13, $14, changeSet]) => {
          const encapsulationSource = document.createElement('div');
          return [`AttachLifecycle(div, none)`, encapsulationSource, Lifecycle.beginAttach(changeSet, encapsulationSource, LifecycleFlags.none)]
        }
      ],
      [
        () => [`   noop`, PLATFORM.noop],
        ([$11, $12, template, $14, cs], $2, $3, [$41, location], $5, [$61, source, lifecycle]) => [`$attach`, (sut) => {
          lifecycle.attach(sut).end();

          expect(sut).to.have.$state.isAttached('sut.$isAttached');
          //expect(sut.$encapsulationSource).to.equal(source);
          if (sut.$attachableHead) {
            expect(sut.$attachableHead).to.have.$state.isAttached('sut.$attachableHead.$isAttached');
            //expect(sut.$attachableHead.$encapsulationSource).to.equal(source);
          }

          if (location.parentNode) {
            if (template === noViewTemplate || !sut.location) {
              expect(location.parentNode.childNodes.length).to.equal(1, 'location.parentNode.childNodes.length');
              expect(location.parentNode.textContent).to.equal('', 'location.parentNode.textContent');
            } else {
              expect(location.parentNode.childNodes.length).to.equal(2);
              if (cs.size > 0 || !(sut.$state & LifecycleState.isBound)) {
                expect(location.parentNode.textContent).to.equal('', 'location.parentNode.textContent');
              } else {
                expect(location.parentNode.textContent).to.equal('foo', 'location.parentNode.textContent');
              }
            }
          }

          // verify short-circuit if already attached
          //const def = sut.$encapsulationSource;
          sut.$encapsulationSource = null;
          sut.$attach(source, <any>lifecycle);
          expect(sut.$encapsulationSource).to.equal(null, 'sut.$encapsulationSource');
          //sut.$encapsulationSource = def;
        }]
      ],
      [
        () => [`   noop`, PLATFORM.noop],
        ([$11, $12, $13, $14, $15, cache], $2, $3, $4, $5, $6, $7) => [`release`, (sut) => {
          expect(sut.release()).to.equal(cache, 'sut.release()');
        }]
      ],
      [
        ([$11, $12, $13, $14, changeSet]) => [`DetachLifecycle(none)`, new DetachLifecycleController(changeSet, LifecycleFlags.none)]
      ],
      [
        () => [`   noop`, PLATFORM.noop],
        ([$11, $12, template, factory, cs, cache], $2, $3, [$41, location], $5, [$61, source], [$71, attach], [$81, release], [$91, lifecycle]) => [`$detach`, (sut) => {
          lifecycle.detach(sut).end();

          expect(sut).to.not.have.$state.isAttached('sut.$isAttached');
          if (attach === PLATFORM.noop) {
            //expect(sut.$encapsulationSource).to.be.undefined;

            // verify short-circuit if already detached
            const s = spy(lifecycle, <any>'queueUnmount');
            sut.$detach(<any>lifecycle);
            expect(s).not.to.have.been.called;
            s.restore();
          } else {
            //expect(sut.$encapsulationSource).to.equal(source);
          }
          if (sut.$attachableHead) {
            expect(sut.$attachableHead).to.not.have.$state.isAttached('sut.$attachableHead.$isAttached');
            if (attach === PLATFORM.noop) {
              //expect(sut.$attachableHead.$encapsulationSource).to.be.undefined;
            } else {
              //expect(sut.$attachableHead.$encapsulationSource).to.equal(source);
            }
          }

          if (location.parentNode) {
            expect(location.parentNode.childNodes.length).to.equal(1, 'location.parentNode.childNodes.length');
            expect(location.parentNode.textContent).to.equal('', 'location.parentNode.textContent');
          }
          if (cache && release !== PLATFORM.noop) {
            expect(factory.cache[0]).to.equal(sut, 'factory.cache[0]');
          } else if (factory.cache !== null) {
            expect(factory.cache[0]).not.to.equal(sut, 'factory.cache[0]');
          }
        }]
      ],
      [
        () => [`fromUnbind`, BindingFlags.fromBind]
      ],
      [
        () => [`   noop`, PLATFORM.noop],
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, [$111, flags]) => [`$unbind`, (sut) => {
          sut.$unbind(flags);

          expect(sut).to.not.have.$state.isBound();
          expect(sut.$scope).to.equal(null, 'sut.$scope');
          if (sut.$attachableHead) {
            expect(sut.$attachableHead).to.not.have.$state.isBound();;
            expect(sut.$attachableHead.$scope).to.equal(null, 'sut.$attachableHead.$scope');
          }
        }]
      ]
    ],
    ([t1, sut], [t2], [t3, bind], [t4], [t5, mount], [t6], [t7, attach], [t8, release], [t9], [t10, detach], [t11], [t12, unbind]) => {
      it(`create(${t1}) -> ${t3}(${t2}) -> ${t5}(${t4}) -> ${t7}(${t6}) -> ${t8}() -> ${t10}(${t9}) -> ${t12}(${t11})`, () => {
        bind(sut);
        mount(sut);
        attach(sut);
        release(sut);
        detach(sut);
        unbind(sut);
      });
    }
  );
});
