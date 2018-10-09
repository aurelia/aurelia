import { spy } from 'sinon';
import { PLATFORM } from '@aurelia/kernel';
import { NodeSequence } from './../../../src/dom';
import { ObserverLocator } from './../../../src/binding/observer-locator';
import {
  noViewTemplate,
  ITemplate,
  IScope,
  BindingContext,
  ViewFactory,
  View,
  DetachLifecycleController,
  IViewFactory,
  BindingFlags,
  IView,
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
  ChangeSet,
  Scope
} from '../../../src';
import { expect } from 'chai';
import { eachCartesianJoin, eachCartesianJoinFactory } from '../../../../../scripts/test-lib';
import { MockTextNodeTemplate } from '../mock';

class StubView {
  constructor(public cached = false) {}
  public $cache() {
    this.cached = true;
  }
}

class StubTemplate {
  constructor(public nodes = {}) {}
  public createFor() {
    return this.nodes;
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
            expect(cached).to.equal(view1);
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes);
            expect(sut.tryReturnToCache(<any>view1)).to.be.true;

            if (size2 !== '*') {
              expect(sut.tryReturnToCache(<any>view1)).to.equal(false, 'sut.tryReturnToCache(view1) 2');
            }
          } else {
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes);
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
            expect(cached).to.equal(view2);
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes);
            expect(sut.tryReturnToCache(<any>view2)).to.be.true;

            if (size2 !== '*' && size4 !== '*') {
              expect(sut.tryReturnToCache(<any>view2)).to.equal(false, 'sut.tryReturnToCache(view2) 2');
            }
          } else {
            const created = sut.create();
            expect(created.$nodes).to.equal(template.nodes);
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
    [string, IView, ITemplate, IViewFactory, IChangeSet, boolean],
    [string, BindingFlags, IScope],
    [string, (sut: IView) => void],
    [string, IRenderLocation],
    [string, (sut: IView) => void],
    [string, INode, IAttachLifecycleController],
    [string, (sut: IView) => void],
    [string, (sut: IView) => void],
    [string, IDetachLifecycleController],
    [string, (sut: IView) => void],
    [string, BindingFlags],
    [string, (sut: IView) => void],
    void
  >(
    [
      [
        () => {
          const cs = new ChangeSet();
          const factory = new ViewFactory('foo', noViewTemplate);
          factory.setCacheSize('*', true);
          return [` noViewTemplate, viewFactory(cache=true )`, factory.create(), noViewTemplate, factory, cs, true];
        },
        () => {
          const cs = new ChangeSet();
          const factory = new ViewFactory('foo', noViewTemplate);
          return [` noViewTemplate, viewFactory(cache=false)`, factory.create(), noViewTemplate, factory, cs, false];
        },
        () => {
          const cs = new ChangeSet();
          const template = new MockTextNodeTemplate(expressions.text, new ObserverLocator(cs, null, null, null)) as any;
          const factory = new ViewFactory('foo', <any>template);
          factory.setCacheSize('*', true);
          return [`textNodeTemplate, viewFactory(cache=true )`, factory.create(), template, factory, cs, true];
        },
        () => {
          const cs = new ChangeSet();
          const template = new MockTextNodeTemplate(expressions.text, new ObserverLocator(cs, null, null, null)) as any;
          const factory = new ViewFactory('foo', <any>template);
          return [`textNodeTemplate, viewFactory(cache=false)`, factory.create(), template, factory, cs, false];
        },
        () => {
          const cs = new ChangeSet();
          const template = new MockTextNodeTemplate(expressions.text, new ObserverLocator(cs, null, null, null)) as any;
          const factory = new ViewFactory('foo', <any>template);
          const child = factory.create();
          const sut = factory.create();
          sut.$attachables.push(child);
          sut.$bindables.push(child);
          factory.setCacheSize('*', true);
          return [`textNodeTemplate, viewFactory(cache=true )`, sut, template, factory, cs, true];
        },
        () => {
          const cs = new ChangeSet();
          const template = new MockTextNodeTemplate(expressions.text, new ObserverLocator(cs, null, null, null)) as any;
          const factory = new ViewFactory('foo', <any>template);
          const child = factory.create();
          const sut = factory.create();
          sut.$attachables.push(child);
          sut.$bindables.push(child);
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

          expect(sut.$scope).to.equal(scope);
          expect(sut.$isBound).to.be.true;
          if (sut.$nodes.firstChild) {
            expect(sut.$nodes.firstChild['textContent']).to.equal('');
          }

          // TODO: verify short-circuit if already bound (now we can only tell by debugging or looking at the coverage report, not very clean)
          sut.$bind(flags, scope);

          const newScope = Scope.create({text:'foo'}, null);
          sut.$bind(flags, newScope);

          expect(sut.$scope).to.equal(newScope);
          expect(sut.$isBound).to.be.true;
        }],
        ([$11, $12, $13, $14, cs], [$21, flags, scope]) => [`$bind+flush`, (sut) => {
          sut.$bind(flags, scope);

          expect(sut.$scope).to.equal(scope);
          expect(sut.$isBound).to.be.true;
          if (sut.$nodes.firstChild) {
            expect(sut.$nodes.firstChild['textContent']).to.equal('');
            cs.flushChanges();
            expect(sut.$nodes.firstChild['textContent']).to.equal('foo');
            if (sut.$attachables.length) {
              expect(sut.$attachables[0]['$nodes'].firstChild['textContent']).to.equal('foo');
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
            expect(() => sut.mount(location)).to.throw(/60/);
          } else {
            sut.mount(location);

            expect(sut['location']).to.equal(location);
            if (sut.$nodes === NodeSequence.empty) {
              expect(sut['requiresNodeAdd']).to.be.false;
            } else {
              expect(sut['requiresNodeAdd']).to.be.true;
            }
            if (sut.$attachables.length) {
              expect(sut.$attachables[0]['location']).to.be.undefined;
            }

            expect(location.parentNode['textContent']).to.equal('');
            expect(location.parentNode.childNodes.length).to.equal(1);
            expect(location.parentNode.childNodes[0].childNodes.length).to.equal(0);
          }
        }]
      ],
      [
        () => {
          const encapsulationSource = document.createElement('div');
          return [`AttachLifecycle(div, none)`, encapsulationSource, Lifecycle.beginAttach(encapsulationSource, LifecycleFlags.none)]
        }
      ],
      [
        () => [`   noop`, PLATFORM.noop],
        ([$11, $12, template, $14, cs], $2, $3, [$41, location], $5, [$61, source, lifecycle]) => [`$attach`, (sut) => {
          lifecycle.attach(sut).end();

          expect(sut.$isAttached).to.be.true;
          //expect(sut['$encapsulationSource']).to.equal(source);
          if (sut.$attachables.length) {
            expect(sut.$attachables[0].$isAttached).to.be.true;
            //expect(sut.$attachables[0]['$encapsulationSource']).to.equal(source);
          }

          if (location.parentNode) {
            if (template === noViewTemplate || !sut['location']) {
              expect(location.parentNode.childNodes.length).to.equal(1);
              expect(location.parentNode['textContent']).to.equal('');
            } else {
              expect(location.parentNode.childNodes.length).to.equal(2);
              if (cs.size > 0 || !sut.$isBound) {
                expect(location.parentNode['textContent']).to.equal('');
              } else {
                expect(location.parentNode['textContent']).to.equal('foo');
              }
            }
          }

          // verify short-circuit if already attached
          //const src = sut['$encapsulationSource'];
          sut['$encapsulationSource'] = null;
          sut.$attach(source, <any>lifecycle);
          expect(sut['$encapsulationSource']).to.be.null;
          //sut['$encapsulationSource'] = src;
        }]
      ],
      [
        () => [`   noop`, PLATFORM.noop],
        ([$11, $12, $13, $14, $15, cache], $2, $3, $4, $5, $6, $7) => [`release`, (sut) => {
          expect(sut.release()).to.equal(cache);
        }]
      ],
      [
        () => [`DetachLifecycle(none)`, new DetachLifecycleController(LifecycleFlags.none)]
      ],
      [
        () => [`   noop`, PLATFORM.noop],
        ([$11, $12, template, factory, cs, cache], $2, $3, [$41, location], $5, [$61, source], [$71, attach], [$81, release], [$91, lifecycle]) => [`$detach`, (sut) => {
          lifecycle.detach(sut).end();

          expect(sut.$isAttached).to.be.false;
          if (attach === PLATFORM.noop) {
            //expect(sut['$encapsulationSource']).to.be.undefined;

            // verify short-circuit if already detached
            const s = spy(lifecycle, <any>'queueRemoveNodes');
            sut.$detach(<any>lifecycle);
            expect(s).not.to.have.been.called;
            s.restore();
          } else {
            //expect(sut['$encapsulationSource']).to.equal(source);
          }
          if (sut.$attachables.length) {
            expect(sut.$attachables[0].$isAttached).to.be.false;
            if (attach === PLATFORM.noop) {
              //expect(sut.$attachables[0]['$encapsulationSource']).to.be.undefined;
            } else {
              //expect(sut.$attachables[0]['$encapsulationSource']).to.equal(source);
            }
          }

          if (location.parentNode) {
            expect(location.parentNode.childNodes.length).to.equal(1);
            expect(location.parentNode['textContent']).to.equal('');
          }
          if (cache && release !== PLATFORM.noop) {
            expect(factory['cache'][0]).to.equal(sut);
          } else if (factory['cache'] !== null) {
            expect(factory['cache'][0]).not.to.equal(sut);
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

          expect(sut.$isBound).to.be.false;
          expect(sut.$scope).to.be.null;
          if (sut.$attachables.length) {
            expect(sut.$attachables[0]['$isBound']).to.be.false;
            expect(sut.$attachables[0]['$scope']).to.be.null;
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
