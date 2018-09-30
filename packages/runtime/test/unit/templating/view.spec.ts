import { ViewFactory } from '../../../src';
import { expect } from 'chai';

describe(`ViewFactory`, () => {
  describe(`canReturnToCache`, () => {
    it(`returns false by default`, () => {
      const sut = new ViewFactory(null, null);
      expect(sut.canReturnToCache(null)).to.be.false;
    });

    it(`returns false when cache is null`, () => {
      const sut = new ViewFactory(null, null);
      sut['cache'] = null;
      expect(sut.canReturnToCache(null)).to.be.false;
    });

    it(`returns false when cache size is zero`, () => {
      const sut = new ViewFactory(null, null);
      sut['cache'] = [];
      expect(sut.canReturnToCache(null)).to.be.false;
    });

    it(`returns false when cache is full`, () => {
      const sut = new ViewFactory(null, null);
      sut['cache'] = Array(10);
      sut['cacheSize'] = 10;
      expect(sut.canReturnToCache(null)).to.be.false;
    });

    it(`returns true when cache has room`, () => {
      const sut = new ViewFactory(null, null);
      sut['cache'] = Array(0);
      sut['cacheSize'] = 10;
      expect(sut.canReturnToCache(null)).to.be.true;
    });
  });

  describe(`setCacheSize`, () => {
    describe(`doNotOverride=true`, () => {
      it(`understands star`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize('*', true);
        expect(sut['cacheSize']).to.equal(Number.MAX_VALUE);
        expect(sut['cache']).to.deep.equal([]);
        expect(sut['isCaching']).to.be.true;
      });

      it(`understands string`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize(<any>'10', true);
        expect(sut['cacheSize']).to.equal(10);
        expect(sut['cache']).to.deep.equal([]);
        expect(sut['isCaching']).to.be.true;
      });

      it(`understands > 0 number`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize(10, true);
        expect(sut['cacheSize']).to.equal(10);
        expect(sut['cache']).to.deep.equal([]);
        expect(sut['isCaching']).to.be.true;
      });

      it(`ignores 0`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize(0, true);
        expect(sut['cacheSize']).to.equal(-1);
        expect(sut['cache']).to.be.null;
        expect(sut['isCaching']).to.be.false;
      });

      it(`ignores -1`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize(-1, true);
        expect(sut['cacheSize']).to.equal(-1);
        expect(sut['cache']).to.be.null;
        expect(sut['isCaching']).to.be.false;
      });

      it(`ignores -2`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize(-1, true);
        expect(sut['cacheSize']).to.equal(-1);
        expect(sut['cache']).to.be.null;
        expect(sut['isCaching']).to.be.false;
      });

      it(`does not override if already set`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize(1, true);
        sut.setCacheSize('*', true);
        expect(sut['cacheSize']).to.equal(1);
        expect(sut['cache']).to.deep.equal([]);
        expect(sut['isCaching']).to.be.true;
      });
    });

    describe(`doNotOverride=false`, () => {
      it(`understands star`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize('*', false);
        expect(sut['cacheSize']).to.equal(Number.MAX_VALUE);
        expect(sut['cache']).to.deep.equal([]);
        expect(sut['isCaching']).to.be.true;
      });

      it(`understands string`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize(<any>'10', false);
        expect(sut['cacheSize']).to.equal(10);
        expect(sut['cache']).to.deep.equal([]);
        expect(sut['isCaching']).to.be.true;
      });

      it(`understands > 0 number`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize(10, false);
        expect(sut['cacheSize']).to.equal(10);
        expect(sut['cache']).to.deep.equal([]);
        expect(sut['isCaching']).to.be.true;
      });

      it(`ignores 0`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize(0, false);
        expect(sut['cacheSize']).to.equal(-1);
        expect(sut['cache']).to.be.null;
        expect(sut['isCaching']).to.be.false;
      });

      it(`ignores -1`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize(-1, false);
        expect(sut['cacheSize']).to.equal(-1);
        expect(sut['cache']).to.be.null;
        expect(sut['isCaching']).to.be.false;
      });

      it(`ignores -2`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize(-1, false);
        expect(sut['cacheSize']).to.equal(-1);
        expect(sut['cache']).to.be.null;
        expect(sut['isCaching']).to.be.false;
      });

      it(`does not override if already set`, () => {
        const sut = new ViewFactory(null, null);
        sut.setCacheSize(1, false);
        sut.setCacheSize('*', false);
        expect(sut['cacheSize']).to.equal(Number.MAX_VALUE);
        expect(sut['cache']).to.deep.equal([]);
        expect(sut['isCaching']).to.be.true;
      });
    });
  });

  class MockView {
    constructor(public cached = false) {}
    public $cache() {
      this.cached = true;
    }
  }
  describe(`tryReturnToCache`, () => {
    it(`returns false and does not cache when cache is not set`, () => {
      const sut = new ViewFactory(null, null);
      const view = new MockView();
      expect(sut.tryReturnToCache(<any>view)).to.be.false;
      expect(view.cached).to.be.false;
    });
    it(`returns false and does not cache when cache is full`, () => {
      const sut = new ViewFactory(null, null);
      sut.setCacheSize(1, true);
      const view1 = new MockView();
      sut.tryReturnToCache(<any>view1);
      const view2 = new MockView();
      expect(sut.tryReturnToCache(<any>view2)).to.be.false;
      expect(view2.cached).to.be.false;
    });

    it(`returns true and caches when can return to cache`, () => {
      const sut = new ViewFactory(null, null);
      sut.setCacheSize(10, true);
      const view1 = new MockView();
      const view2 = new MockView();
      expect(sut.tryReturnToCache(<any>view1)).to.be.true;
      expect(view1.cached).to.be.true;
      expect(sut.tryReturnToCache(<any>view2)).to.be.true;
      expect(view2.cached).to.be.true;

      expect(sut.create()).to.equal(view2);
      expect(sut.create()).to.equal(view1);
      expect(() => sut.create()).to.throw;
    });
  });
});
