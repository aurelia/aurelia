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
  IRenderLocation
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

describe(`View`, () => {
  eachCartesianJoinFactory<
    [string, IView, ITemplate, IViewFactory, boolean],
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
          const factory = new ViewFactory('foo', noViewTemplate);
          factory.setCacheSize('*', true);
          return [`noViewTemplate, viewFactory(cache=true )`, factory.create(), noViewTemplate, factory, true];
        },
        () => {
          const factory = new ViewFactory('foo', noViewTemplate);
          return [`noViewTemplate, viewFactory(cache=false)`, factory.create(), noViewTemplate, factory, false];
        }
      ],
      [
        () => [`fromBind, {}`, BindingFlags.fromBind, BindingContext.createScope({})]
      ],
      [
        ([$11, $12, $13, sut], [$21, flags, scope]) => [`$bind`, (sut) => {
          sut.$bind(flags, scope);

          expect(sut.$scope).to.equal(scope);
          expect(sut.$isBound).to.be.true;
        }]
      ],
      [
        () => {
          const location = document.createElement('div');
          return [`div`, location]
        }
      ],
      [
        ([$11, $12, $13, sut], $2, $3, [$41, location]) => [` noop`, (sut) => {
        }],
        ([$11, $12, $13, sut], $2, $3, [$41, location]) => [`mount`, (sut) => {
          if (!location.parentNode) {
            expect(() => sut.mount(location)).to.throw(/60/);
          } else {
            sut.mount(location);
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
        ([$11, $12, $13, sut], $2, $3, $4, $5, [$61, source, lifecycle]) => [`$attach`, (sut) => {
          lifecycle.attach(sut).end();
        }]
      ],
      [
        ([$11, $12, $13, sut], $2, $3, $4, $5, $6, $7) => [`release`, (sut) => {
          sut.release();
        }]
      ],
      [
        () => [`DetachLifecycle(none)`, new DetachLifecycleController(LifecycleFlags.none)]
      ],
      [
        ([$11, $12, $13, sut], $2, $3, $4, $5, $6, $7, $8, [$91, lifecycle]) => [`$detach`, (sut) => {
          lifecycle.detach(sut).end();
        }]
      ],
      [
        () => [`fromUnbind`, BindingFlags.fromBind]
      ],
      [
        ([$11, $12, $13, sut], $2, $3, $4, $5, $6, $7, $8, $9, $10, [$111, flags]) => [`$unbind`, (sut) => {
          sut.$unbind(flags);
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
