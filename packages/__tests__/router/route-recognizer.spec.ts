import { ConfigurableRoute, RouteRecognizer } from '@aurelia/router';
import { assert, eachCartesianJoin } from '@aurelia/testing';

const staticRoute = {'path': 'static', 'handler': {'name': 'static'}};
const dynamicRoute = {'path': 'dynamic/:id', 'handler': {'name': 'dynamic'}};
const optionalRoute = {'path': 'optional/:id?', 'handler': {'name': 'optional'}};
const multiNameRoute = {'path': 'static', 'handler': {'name': ['static-multiple', 'static-multiple-alias']}};

describe('route sut', function () {
  interface Spec {
    t: string;
  }
  interface RouteSpec extends Spec {
    t: string;
    route: ConfigurableRoute;
    isDynamic: boolean;
    path: string;
    params: Record<string, string>;
  }

  const routeSpecs: RouteSpec[] = [
    {
      t: 'empty path routes',
      route: {
        path: '',
        handler: { name: 'static' }
      },
      isDynamic: false,
      path: '/',
      params: {}
    },
    {
      t: 'static routes',
      route: staticRoute,
      isDynamic: false,
      path: '/static',
      params: {}
    },
    {
      t: 'dynamic routes',
      route: dynamicRoute,
      isDynamic: true,
      path: '/dynamic/test',
      params: { id: 'test' }
    },
    {
      t: 'multi-segment dynamic routes',
      route: {
        path: 'dynamic/:id/:other',
        handler: { name: 'dynamic' }
      },
      isDynamic: true,
      path: '/dynamic/foo/bar',
      params: { id: 'foo', other: 'bar' }
    },
    {
      t: 'duplicate dynamic routes',
      route: {
        path: 'dynamic/:id/:id',
        handler: { name: 'dynamic' }
      },
      isDynamic: true,
      path: '/dynamic/foo/foo',
      params: { id: 'foo' }
    },
    {
      t: 'star routes',
      route: {
        path: 'star/*path',
        handler: { name: 'star' }
      },
      isDynamic: true,
      path: '/star/test/path',
      params: { path: 'test/path' }
    },
    {
      t: 'dynamic star routes',
      route: {
        path: 'dynamic/:id/star/*path',
        handler: { name: 'star' }
      },
      isDynamic: true,
      path: '/dynamic/foo/star/test/path',
      params: { id: 'foo', path: 'test/path' }
    },
    {
      t: 'optional parameter routes',
      route: {
        path: 'param/:id?/edit',
        handler: { name: 'dynamic' }
      },
      isDynamic: true,
      path: '/param/42/edit',
      params: { id: '42' }
    },
    {
      t: 'missing optional parameter routes',
      route: {
        path: 'param/:id?/edit',
        handler: { name: 'dynamic' }
      },
      isDynamic: true,
      path: '/param/edit',
      params: { id: undefined }
    },
    {
      t: 'multiple optional parameters routes',
      route: {
        path: 'param/:x?/edit/:y?',
        handler: { name: 'dynamic' }
      },
      isDynamic: true,
      path: '/param/edit/42',
      params: { x: undefined, y: '42' }
    },
    {
      t: 'ambiguous optional parameters routes',
      route: {
        path: 'pt/:x?/:y?',
        handler: { name: 'dynamic' }
      },
      isDynamic: true,
      path: '/pt/7',
      params: { x: '7', y: undefined }
    },
    {
      t: 'empty optional parameters routes',
      route: {
        path: ':x?/:y?',
        handler: { name: 'dynamic' }
      },
      isDynamic: true,
      path: '/',
      params: { x: undefined, y: undefined }
    },
    {
      t: 'almost empty optional parameter routes',
      route: {
        path: ':x?',
        handler: { name: 'dynamic' }
      },
      isDynamic: true,
      path: '/42',
      params: { x: '42' }
    }
  ];

  it('should reject unknown routes', function () {
    const sut = new RouteRecognizer();

    assert.strictEqual(sut.hasRoute('static'), false, `sut.hasRoute('static')`);
    assert.throws(() => sut.handlersFor('static'), void 0, `() => sut.handlersFor('static')`);
    assert.throws(() => sut.generate('static'), void 0, `() => sut.generate('static')`);
    assert.strictEqual(sut.recognize('/notfound'), undefined, `sut.recognize('/notfound')`);
  });

  it('should reject default parameter values', function () {
    const sut = new RouteRecognizer();

    assert.throws(() => sut.add([{'path': 'user/:id=1', 'handler': {}}]), void 0, `() => sut.add([{'path': 'user/:id=1', 'handler': {}}])`);
  });

  it('should register unnamed routes', function () {
    const sut = new RouteRecognizer();
    sut.add([{'path': 'b', 'handler': {}}]);

    assert.deepStrictEqual(sut.names, {}, `sut.names`);
    assert.strictEqual(!!sut.recognize('/b'), true, `!!sut.recognize('/b')`);
  });

  eachCartesianJoin([routeSpecs], function(routeSpec) {
    it(`should recognize - ${routeSpec.t}`, function () {
      const { route, path, isDynamic, params } = routeSpec;
      const sut = new RouteRecognizer();
      sut.add([route]);

      const result = sut.recognize(path);
      assert.strictEqual(!!result, true, `!!result`);
      assert.strictEqual(result.length, 1, `result.length`);
      assert.strictEqual(result[0].handler, route.handler, `result[0].handler`);
      assert.strictEqual(result[0].isDynamic, isDynamic, `result[0].isDynamic`);
      assert.deepStrictEqual(result[0].params, params, `result[0].params`);
    });

    it(`is case insensitive by default - ${routeSpec.t}`, function () {
      const { route, path, isDynamic, params } = routeSpec;
      const sut = new RouteRecognizer();
      sut.add([route]);

      const result = sut.recognize(path.toUpperCase());
      assert.strictEqual(!!result, true, `!!result`);
      assert.strictEqual(result.length, 1, `result.length`);
      assert.strictEqual(result[0].handler, route.handler, `result[0].handler`);
      assert.strictEqual(result[0].isDynamic, isDynamic, `result[0].isDynamic`);
      Object.keys(result[0].params).forEach((property) => {
        if (params[property] === undefined) {
          return;
        }
        assert.strictEqual(result[0].params[property].toUpperCase(), params[property].toUpperCase(), `result[0].params[property].toUpperCase()`);
      });
    });

    it(`should generate - ${routeSpec.t}`, function () {
      const { route, path, params } = routeSpec;
      const sut = new RouteRecognizer();
      sut.add([route]);

      assert.strictEqual(sut.generate(route.handler.name as string, params), path, `sut.generate(route.handler.name as string, params)`);
    });
  });

  it('should require dynamic segment parameters when generating', function () {
    const sut = new RouteRecognizer();
    sut.add([dynamicRoute]);

    assert.throws(() => sut.generate('dynamic'), void 0, `() => sut.generate('dynamic')`);
    assert.throws(() => sut.generate('dynamic', {}), void 0, `() => sut.generate('dynamic', {})`);
    assert.throws(() => sut.generate('dynamic', { id: null }), void 0, `() => sut.generate('dynamic', { id: null })`);
  });

  it('should generate URIs with extra parameters added to the query string', function () {
    const sut = new RouteRecognizer();
    sut.add([staticRoute]);
    sut.add([dynamicRoute]);

    assert.strictEqual(sut.generate('static'), '/static', `sut.generate('static')`);
    assert.strictEqual(sut.generate('static', {}), '/static', `sut.generate('static', {})`);
    assert.strictEqual(sut.generate('static', { id: 1 }), '/static?id=1', `sut.generate('static', { id: 1 })`);

    assert.strictEqual(sut.generate('dynamic', { id: 1 }), '/dynamic/1', `sut.generate('dynamic', { id: 1 })`);
    assert.strictEqual(sut.generate('dynamic', { id: 1, test: 2 }), '/dynamic/1?test=2', `sut.generate('dynamic', { id: 1, test: 2 })`);
  });

  it('should find handlers by route name', function () {
    const sut = new RouteRecognizer();
    sut.add([staticRoute]);

    assert.strictEqual(sut.hasRoute('static'), true, `sut.hasRoute('static')`);
    assert.strictEqual(sut.handlersFor('static')[0].handler, staticRoute.handler, `sut.handlersFor('static')[0].handler`);
  });

  it('should find a handler by multiple names', function () {
    const sut = new RouteRecognizer();
    sut.add([multiNameRoute]);

    assert.strictEqual(
      sut.handlersFor('static-multiple')[0].handler,
      sut.handlersFor('static-multiple-alias')[0].handler
    );
  });

  it('should distinguish between dynamic and static parts', function () {
    const sut = new RouteRecognizer();
    const similarRoute = { 'path': 'optionalToo/:id?', 'handler': { 'name': 'similar' }};
    sut.add([optionalRoute, similarRoute]);

    const result = sut.recognize('optionalToo');
    assert.strictEqual(result.length, 1, `result.length`);
    assert.strictEqual(result[0].handler.name, 'similar', `result[0].handler.name`);
  });

  it('can set case sensitive route and fails', function () {
    const sut = new RouteRecognizer();
    const routeTest = {
      t: 'case sensitive route',
      route: { 'path': 'CasE/InSeNsItIvE', 'handler': { 'name': 'static' }, 'caseSensitive': true },
      isDynamic: false,
      path: 'CasE/iNsEnSiTiVe',
      params: {}
    };
    sut.add([routeTest.route]);

    const result = sut.recognize(routeTest.path);
    assert.strictEqual(result, undefined, `result`);
  });
});
