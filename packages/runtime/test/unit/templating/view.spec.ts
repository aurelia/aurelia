import { ViewFactory } from '../../../src';
import { expect } from 'chai';
import { eachCartesianJoin } from '../../../../../scripts/test-lib';

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
