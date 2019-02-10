import { expect } from 'chai';
import { ConfigurableRoute, RouteRecognizer } from '../../src/index';
import { eachCartesianJoin } from '../util';

const staticRoute = {'path': 'static', 'handler': {'name': 'static'}};
const dynamicRoute = {'path': 'dynamic/:id', 'handler': {'name': 'dynamic'}};
const optionalRoute = {'path': 'optional/:id?', 'handler': {'name': 'optional'}};
const multiNameRoute = {'path': 'static', 'handler': {'name': ['static-multiple', 'static-multiple-alias']}};

describe('route sut', function() {
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

  it('should reject unknown routes', function() {
    const sut = new RouteRecognizer();

    expect(sut.hasRoute('static')).to.equal(false);
    expect(() => sut.handlersFor('static')).to.throw();
    expect(() => sut.generate('static')).to.throw();
    expect(sut.recognize('/notfound')).to.equal(undefined);
  });

  it('should reject default parameter values', function() {
    const sut = new RouteRecognizer();

    expect(() => sut.add([{'path': 'user/:id=1', 'handler': {}}])).to.throw();
  });

  it('should register unnamed routes', function() {
    const sut = new RouteRecognizer();
    sut.add([{'path': 'b', 'handler': {}}]);

    expect(sut.names).to.deep.equal({});
    expect(!!sut.recognize('/b')).to.equal(true);
  });

  eachCartesianJoin([routeSpecs], function(routeSpec) {
    it(`should recognize - ${routeSpec.t}`, function() {
      const { route, path, isDynamic, params } = routeSpec;
      const sut = new RouteRecognizer();
      sut.add([route]);

      const result = sut.recognize(path);
      expect(!!result).to.equal(true);
      expect(result.length).to.equal(1);
      expect(result[0].handler).to.equal(route.handler);
      expect(result[0].isDynamic).to.equal(isDynamic);
      expect(result[0].params).to.deep.equal(params);
    });

    it(`is case insensitive by default - ${routeSpec.t}`, function() {
      const { route, path, isDynamic, params } = routeSpec;
      const sut = new RouteRecognizer();
      sut.add([route]);

      const result = sut.recognize(path.toUpperCase());
      expect(!!result).to.equal(true);
      expect(result.length).to.equal(1);
      expect(result[0].handler).to.equal(route.handler);
      expect(result[0].isDynamic).to.equal(isDynamic);
      Object.keys(result[0].params).forEach((property) => {
        if (params[property] === undefined) {
          return;
        }
        expect(result[0].params[property].toUpperCase()).to.equal(params[property].toUpperCase());
      });
    });

    it(`should generate - ${routeSpec.t}`, function() {
      const { route, path, params } = routeSpec;
      const sut = new RouteRecognizer();
      sut.add([route]);

      expect(sut.generate(route.handler.name as string, params)).to.equal(path);
    });
  });

  it('should require dynamic segment parameters when generating', function() {
    const sut = new RouteRecognizer();
    sut.add([dynamicRoute]);

    expect(() => sut.generate('dynamic')).to.throw();
    expect(() => sut.generate('dynamic', {})).to.throw();
    expect(() => sut.generate('dynamic', { id: null })).to.throw();
  });

  it('should generate URIs with extra parameters added to the query string', function() {
    const sut = new RouteRecognizer();
    sut.add([staticRoute]);
    sut.add([dynamicRoute]);

    expect(sut.generate('static')).to.equal('/static');
    expect(sut.generate('static', {})).to.equal('/static');
    expect(sut.generate('static', { id: 1 })).to.equal('/static?id=1');

    expect(sut.generate('dynamic', { id: 1 })).to.equal('/dynamic/1');
    expect(sut.generate('dynamic', { id: 1, test: 2 })).to.equal('/dynamic/1?test=2');
  });

  it('should find handlers by route name', function() {
    const sut = new RouteRecognizer();
    sut.add([staticRoute]);

    expect(sut.hasRoute('static')).to.equal(true);
    expect(sut.handlersFor('static')[0].handler).to.equal(staticRoute.handler);
  });

  it('should find a handler by multiple names', function() {
    const sut = new RouteRecognizer();
    sut.add([multiNameRoute]);

    expect(sut.handlersFor('static-multiple')[0].handler)
      .to.equal(sut.handlersFor('static-multiple-alias')[0].handler);
  });

  it('should distinguish between dynamic and static parts', function() {
    const sut = new RouteRecognizer();
    const similarRoute = { 'path': 'optionalToo/:id?', 'handler': { 'name': 'similar' }};
    sut.add([optionalRoute, similarRoute]);

    const result = sut.recognize('optionalToo');
    expect(result.length).to.equal(1);
    expect(result[0].handler.name).to.equal('similar');
  });

  it('can set case sensitive route and fails', function() {
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
    expect(result).to.equal(undefined);
  });
});
