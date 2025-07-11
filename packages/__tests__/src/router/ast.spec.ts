import { assert } from '@aurelia/testing';
import {
  RouteExpression,
  CompositeSegmentExpression,
  ScopedSegmentExpression,
  SegmentGroupExpression,
  SegmentExpression,
  ComponentExpression,
  ViewportExpression,
  ParameterListExpression,
  ParameterExpression,
  NavigationOptions,
  RouterOptions,
  pathUrlParser,
} from '@aurelia/router';

const terminal = ['?', '#', '/', '+', '(', ')', '@', '!', '=', ',', '&', '\'', '~', ';'];

describe('router/ast.spec.ts', function () {
  const specs: Record<string, [RouteExpression, string]> = {};

  const emptyQuerystring: Readonly<URLSearchParams> = Object.freeze(new URLSearchParams());
  const noParams = ['', new ParameterListExpression([])] as const;
  const paramSpecs = [
    noParams,
    [
      '(1)',
      new ParameterListExpression(
        [
          new ParameterExpression('0', '1'),
        ],
      )
    ],
    [
      '($1=1)',
      new ParameterListExpression(
        [
          new ParameterExpression('$1', '1'),
        ],
      )
    ],
    [
      '(1,2)',
      new ParameterListExpression(
        [
          new ParameterExpression('0', '1'),
          new ParameterExpression('1', '2'),
        ],
      )
    ],
    [
      '($1=1,$2=2)',
      new ParameterListExpression(
        [
          new ParameterExpression('$1', '1'),
          new ParameterExpression('$2', '2'),
        ],
      )
    ],
  ] as const;

  const noViewport = ['', new ViewportExpression(null)] as const;
  const viewportSpecs = [
    noViewport,
    ['@foo', new ViewportExpression('foo')],
  ] as [string, ViewportExpression][];

  const componentSpecs = [
    ...paramSpecs.map(([raw, x]) => [`a${raw}`, new ComponentExpression('a', x)]),
  ] as [string, ComponentExpression][];

   for (const [rawComponent, component] of componentSpecs) {
    for (const [rawViewport, viewport] of viewportSpecs) {
      for (const scoped of [true, false]) {
        const raw = `${rawComponent}${rawViewport}${scoped ? '' : '!'}`;
        const url = `${rawComponent}${rawViewport}`;

        specs[`/${raw}`] = [new RouteExpression(
          true,
          new SegmentExpression(component, viewport, scoped),
          emptyQuerystring,
          null,
        ), url];
        specs[`/(${raw})`] = [new RouteExpression(
          true,
          new SegmentGroupExpression(
            new SegmentExpression(component, viewport, scoped),
          ),
          emptyQuerystring,
          null,
        ), `(${url})`];

        specs[`/${raw}/${raw}`] = [new RouteExpression(
          true,
          new ScopedSegmentExpression(
            new SegmentExpression(component, viewport, scoped),
            new SegmentExpression(component, viewport, scoped),
          ),
          emptyQuerystring,
          null,
        ), `${url}/${url}`];

        specs[`/${raw}+${raw}`] = [new RouteExpression(
          true,
          new CompositeSegmentExpression(
            [
              new SegmentExpression(component, viewport, scoped),
              new SegmentExpression(component, viewport, scoped),
            ],
          ),
          emptyQuerystring,
          null,
        ), `${url}+${url}`];

        specs[`/${raw}?foo=bar`] = [new RouteExpression(
          true,
          new SegmentExpression(component, viewport, scoped),
          Object.freeze(new URLSearchParams('foo=bar')),
          null,
        ), `${url}?foo=bar`];

        specs[`/${raw}?foo=bar&fiz=baz`] = [new RouteExpression(
          true,
          new SegmentExpression(component, viewport, scoped),
          Object.freeze(new URLSearchParams('foo=bar&fiz=baz')),
          null,
        ), `${url}?foo=bar&fiz=baz`];

        specs[`/${raw}?foo=bar1&fiz=baz&foo=bar2`] = [new RouteExpression(
          true,
          new SegmentExpression(component, viewport, scoped),
          Object.freeze(new URLSearchParams('foo=bar1&fiz=baz&foo=bar2')),
          null,
        ), `${url}?foo=bar1&fiz=baz&foo=bar2`];
      }
    }
  }

  const comp = {
    '-': new ComponentExpression('-', noParams[1]),
    'a': new ComponentExpression('a', noParams[1]),
    'b': new ComponentExpression('b', noParams[1]),
    'c': new ComponentExpression('c', noParams[1]),
    'd': new ComponentExpression('d', noParams[1]),
  };

  const x = {};

  x['-'] = [new SegmentExpression(comp['-'], noViewport[1], true), '-'];
  x['a'] = [new SegmentExpression(comp['a'], noViewport[1], true), 'a'];
  x['b'] = [new SegmentExpression(comp['b'], noViewport[1], true), 'b'];
  x['c'] = [new SegmentExpression(comp['c'], noViewport[1], true), 'c'];
  x['d'] = [new SegmentExpression(comp['d'], noViewport[1], true), 'd'];

  x['+a'] = [new CompositeSegmentExpression([x['a'][0]]), 'a'];
  x['+b'] = [new CompositeSegmentExpression([x['b'][0]]), 'b'];
  x['+c'] = [new CompositeSegmentExpression([x['c'][0]]), 'c'];
  x['+d'] = [new CompositeSegmentExpression([x['d'][0]]), 'd'];

  x['(a)'] = [new SegmentGroupExpression(x['a'][0]), '(a)'];
  x['(b)'] = [new SegmentGroupExpression(x['b'][0]), '(b)'];
  x['(c)'] = [new SegmentGroupExpression(x['c'][0]), '(c)'];
  x['(d)'] = [new SegmentGroupExpression(x['d'][0]), '(d)'];

  x['(+a)'] = [new SegmentGroupExpression(x['+a'][0]), '(a)'];
  x['(+b)'] = [new SegmentGroupExpression(x['+b'][0]), '(b)'];
  x['(+c)'] = [new SegmentGroupExpression(x['+c'][0]), '(c)'];
  x['(+d)'] = [new SegmentGroupExpression(x['+d'][0]), '(d)'];

  x['+(a)'] = [new CompositeSegmentExpression([x['(a)'][0]]), '(a)'];
  x['+(b)'] = [new CompositeSegmentExpression([x['(b)'][0]]), '(b)'];
  x['+(c)'] = [new CompositeSegmentExpression([x['(c)'][0]]), '(c)'];
  x['+(d)'] = [new CompositeSegmentExpression([x['(d)'][0]]), '(d)'];

  x['(a)+b'] = [new CompositeSegmentExpression([x['(a)'][0], x['b'][0]]), '(a)+b'];
  x['a+(b)'] = [new CompositeSegmentExpression([x['a'][0], x['(b)'][0]]), 'a+(b)'];

  x['+(a)+b'] = [new CompositeSegmentExpression([x['(a)'][0], x['b'][0]]), '(a)+b'];
  x['+a+(b)'] = [new CompositeSegmentExpression([x['a'][0], x['(b)'][0]]), 'a+(b)'];

  x['a+b'] = [new CompositeSegmentExpression([x['a'][0], x['b'][0]]), 'a+b'];
  x['b+c'] = [new CompositeSegmentExpression([x['b'][0], x['c'][0]]), 'b+c'];
  x['c+d'] = [new CompositeSegmentExpression([x['c'][0], x['d'][0]]), 'c+d'];

  x['+a+b'] = [new CompositeSegmentExpression([x['a'][0], x['b'][0]]), 'a+b'];
  x['+b+c'] = [new CompositeSegmentExpression([x['b'][0], x['c'][0]]), 'b+c'];
  x['+c+d'] = [new CompositeSegmentExpression([x['c'][0], x['d'][0]]), 'c+d'];

  x['(a)/b'] = [new ScopedSegmentExpression(x['(a)'][0], x['b'][0]), '(a)/b'];
  x['a/(b)'] = [new ScopedSegmentExpression(x['a'][0], x['(b)'][0]), 'a/(b)'];

  x['+(a)/b'] = [new CompositeSegmentExpression([x['(a)/b'][0]]), '(a)/b'];
  x['+a/(b)'] = [new CompositeSegmentExpression([x['a/(b)'][0]]), 'a/(b)'];

  x['a/b'] = [new ScopedSegmentExpression(x['a'][0], x['b'][0]), 'a/b'];
  x['b/c'] = [new ScopedSegmentExpression(x['b'][0], x['c'][0]), 'b/c'];
  x['c/d'] = [new ScopedSegmentExpression(x['c'][0], x['d'][0]), 'c/d'];

  x['+a/b'] = [new CompositeSegmentExpression([x['a/b'][0]]), 'a/b'];
  x['+b/c'] = [new CompositeSegmentExpression([x['b/c'][0]]), 'b/c'];
  x['+c/d'] = [new CompositeSegmentExpression([x['c/d'][0]]), 'c/d'];

  x['(a+b)'] = [new SegmentGroupExpression(x['a+b'][0]), '(a+b)'];
  x['(b+c)'] = [new SegmentGroupExpression(x['b+c'][0]), '(b+c)'];
  x['(c+d)'] = [new SegmentGroupExpression(x['c+d'][0]), '(c+d)'];

  x['(a/b)'] = [new SegmentGroupExpression(x['a/b'][0]), '(a/b)'];
  x['(b/c)'] = [new SegmentGroupExpression(x['b/c'][0]), '(b/c)'];
  x['(c/d)'] = [new SegmentGroupExpression(x['c/d'][0]), '(c/d)'];

  x['+(a+b)'] = [new CompositeSegmentExpression([x['(a+b)'][0]]), '(a+b)'];
  x['+(b+c)'] = [new CompositeSegmentExpression([x['(b+c)'][0]]), '(b+c)'];
  x['+(c+d)'] = [new CompositeSegmentExpression([x['(c+d)'][0]]), '(c+d)'];

  x['a+b+c']   = [new CompositeSegmentExpression([x['a'][0], x['b'][0], x['c'][0],]), 'a+b+c'];
  x['(a+b)+c'] = [new CompositeSegmentExpression([x['(a+b)'][0], x['c'][0],]), '(a+b)+c'];
  x['a+(b+c)'] = [new CompositeSegmentExpression([x['a'][0], x['(b+c)'][0],]), 'a+(b+c)'];
  x['a/b+c']   = [new CompositeSegmentExpression([x['a/b'][0], x['c'][0],]), 'a/b+c'];
  x['(a/b)+c'] = [new CompositeSegmentExpression([x['(a/b)'][0], x['c'][0],]), '(a/b)+c'];
  x['a+b/c']   = [new CompositeSegmentExpression([x['a'][0], x['b/c'][0],]), 'a+b/c'];
  x['a+(b/c)'] = [new CompositeSegmentExpression([x['a'][0], x['(b/c)'][0],]), 'a+(b/c)'];

  x['+a+b+c']   = [new CompositeSegmentExpression([x['a'][0], x['b'][0], x['c'][0],]), 'a+b+c'];
  x['+(a+b)+c'] = [new CompositeSegmentExpression([x['(a+b)'][0], x['c'][0],]), '(a+b)+c'];
  x['+a+(b+c)'] = [new CompositeSegmentExpression([x['a'][0], x['(b+c)'][0],]), 'a+(b+c)'];
  x['+a/b+c']   = [new CompositeSegmentExpression([x['a/b'][0], x['c'][0],]), 'a/b+c'];
  x['+(a/b)+c'] = [new CompositeSegmentExpression([x['(a/b)'][0], x['c'][0],]), '(a/b)+c'];
  x['+a+b/c']   = [new CompositeSegmentExpression([x['a'][0], x['b/c'][0],]), 'a+b/c'];
  x['+a+(b/c)'] = [new CompositeSegmentExpression([x['a'][0], x['(b/c)'][0],]), 'a+(b/c)'];

  x['b+c+d']   = [new CompositeSegmentExpression([x['b'][0], x['c'][0], x['d'][0],]), 'b+c+d'];
  x['(b+c)+d'] = [new CompositeSegmentExpression([x['(b+c)'][0], x['d'][0],]), '(b+c)+d'];
  x['b+(c+d)'] = [new CompositeSegmentExpression([x['b'][0], x['(c+d)'][0],]), 'b+(c+d)'];
  x['b/c+d']   = [new CompositeSegmentExpression([x['b/c'][0], x['d'][0],]), 'b/c+d'];
  x['(b/c)+d'] = [new CompositeSegmentExpression([x['(b/c)'][0], x['d'][0],]), '(b/c)+d'];
  x['b+c/d']   = [new CompositeSegmentExpression([x['b'][0], x['c/d'][0],]), 'b+c/d'];
  x['b+(c/d)'] = [new CompositeSegmentExpression([x['b'][0], x['(c/d)'][0],]), 'b+(c/d)'];

  x['a/b/c']   = [new ScopedSegmentExpression(x['a'][0], x['b/c'][0]), 'a/b/c'];
  x['a/(b/c)'] = [new ScopedSegmentExpression(x['a'][0], x['(b/c)'][0]), 'a/(b/c)'];
  x['a/(b+c)'] = [new ScopedSegmentExpression(x['a'][0], x['(b+c)'][0]), 'a/(b+c)'];
  x['(a/b)/c'] = [new ScopedSegmentExpression(x['(a/b)'][0], x['c'][0]), '(a/b)/c'];
  x['(a+b)/c'] = [new ScopedSegmentExpression(x['(a+b)'][0], x['c'][0]), '(a+b)/c'];

  x['+a/b/c']   = [new CompositeSegmentExpression([x['a/b/c'][0]]), 'a/b/c'];
  x['+a/(b/c)'] = [new CompositeSegmentExpression([x['a/(b/c)'][0]]), 'a/(b/c)'];
  x['+a/(b+c)'] = [new CompositeSegmentExpression([x['a/(b+c)'][0]]), 'a/(b+c)'];
  x['+(a/b)/c'] = [new CompositeSegmentExpression([x['(a/b)/c'][0]]), '(a/b)/c'];
  x['+(a+b)/c'] = [new CompositeSegmentExpression([x['(a+b)/c'][0]]), '(a+b)/c'];

  x['b/c/d']   = [new ScopedSegmentExpression(x['b'][0], x['c/d'][0]), 'b/c/d'];
  x['b/(c/d)'] = [new ScopedSegmentExpression(x['b'][0], x['(c/d)'][0]), 'b/(c/d)'];
  x['b/(c+d)'] = [new ScopedSegmentExpression(x['b'][0], x['(c+d)'][0]), 'b/(c+d)'];
  x['(b/c)/d'] = [new ScopedSegmentExpression(x['(b/c)'][0], x['d'][0]), '(b/c)/d'];
  x['(b+c)/d'] = [new ScopedSegmentExpression(x['(b+c)'][0], x['d'][0]), '(b+c)/d'];

  x['(a+b+c)']   = [new SegmentGroupExpression(x['a+b+c'][0]), '(a+b+c)'];
  x['((a+b)+c)'] = [new SegmentGroupExpression(x['(a+b)+c'][0]), '((a+b)+c)'];
  x['(a+(b+c))'] = [new SegmentGroupExpression(x['a+(b+c)'][0]), '(a+(b+c))'];
  x['(a/b+c)']   = [new SegmentGroupExpression(x['a/b+c'][0]), '(a/b+c)'];
  x['((a/b)+c)'] = [new SegmentGroupExpression(x['(a/b)+c'][0]), '((a/b)+c)'];
  x['(a+b/c)']   = [new SegmentGroupExpression(x['a+b/c'][0]), '(a+b/c)'];
  x['(a+(b/c))'] = [new SegmentGroupExpression(x['a+(b/c)'][0]), '(a+(b/c))'];

  x['(b+c+d)']   = [new SegmentGroupExpression(x['b+c+d'][0]), '(b+c+d)'];
  x['((b+c)+d)'] = [new SegmentGroupExpression(x['(b+c)+d'][0]), '((b+c)+d)'];
  x['(b+(c+d))'] = [new SegmentGroupExpression(x['b+(c+d)'][0]), '(b+(c+d))'];
  x['(b/c+d)']   = [new SegmentGroupExpression(x['b/c+d'][0]), '(b/c+d)'];
  x['((b/c)+d)'] = [new SegmentGroupExpression(x['(b/c)+d'][0]), '((b/c)+d)'];
  x['(b+c/d)']   = [new SegmentGroupExpression(x['b+c/d'][0]), '(b+c/d)'];
  x['(b+(c/d))'] = [new SegmentGroupExpression(x['b+(c/d)'][0]), '(b+(c/d))'];

  x['(a/b/c)']   = [new SegmentGroupExpression(x['a/b/c'][0]), '(a/b/c)'];
  x['(a/(b/c))'] = [new SegmentGroupExpression(x['a/(b/c)'][0]), '(a/(b/c))'];
  x['(a/(b+c))'] = [new SegmentGroupExpression(x['a/(b+c)'][0]), '(a/(b+c))'];
  x['((a/b)/c)'] = [new SegmentGroupExpression(x['(a/b)/c'][0]), '((a/b)/c)'];
  x['((a+b)/c)'] = [new SegmentGroupExpression(x['(a+b)/c'][0]), '((a+b)/c)'];

  x['(b/c/d)']   = [new SegmentGroupExpression(x['b/c/d'][0]), '(b/c/d)'];
  x['(b/(c/d))'] = [new SegmentGroupExpression(x['b/(c/d)'][0]), '(b/(c/d))'];
  x['(b/(c+d))'] = [new SegmentGroupExpression(x['b/(c+d)'][0]), '(b/(c+d))'];
  x['((b/c)/d)'] = [new SegmentGroupExpression(x['(b/c)/d'][0]), '((b/c)/d)'];
  x['((b+c)/d)'] = [new SegmentGroupExpression(x['(b+c)/d'][0]), '((b+c)/d)'];

  x['a+b+c+d']     = [new CompositeSegmentExpression([x['a'][0], x['b'][0], x['c'][0], x['d'][0],]), 'a+b+c+d'];
  x['(a+b)+c+d']   = [new CompositeSegmentExpression([x['(a+b)'][0], x['c'][0], x['d'][0],]), '(a+b)+c+d'];
  x['a+(b+c)+d']   = [new CompositeSegmentExpression([x['a'][0], x['(b+c)'][0], x['d'][0],]), 'a+(b+c)+d'];
  x['a+b+(c+d)']   = [new CompositeSegmentExpression([x['a'][0], x['b'][0], x['(c+d)'][0],]), 'a+b+(c+d)'];
  x['(a+b)+(c+d)'] = [new CompositeSegmentExpression([x['(a+b)'][0], x['(c+d)'][0],]), '(a+b)+(c+d)'];
  x['(a+b+c)+d']   = [new CompositeSegmentExpression([x['(a+b+c)'][0], x['d'][0],]), '(a+b+c)+d'];
  x['((a+b)+c)+d'] = [new CompositeSegmentExpression([x['((a+b)+c)'][0], x['d'][0],]), '((a+b)+c)+d'];
  x['(a+(b+c))+d'] = [new CompositeSegmentExpression([x['(a+(b+c))'][0], x['d'][0],]), '(a+(b+c))+d'];
  x['a+(b+c+d)']   = [new CompositeSegmentExpression([x['a'][0], x['(b+c+d)'][0],]), 'a+(b+c+d)'];
  x['a+((b+c)+d)'] = [new CompositeSegmentExpression([x['a'][0], x['((b+c)+d)'][0],]), 'a+((b+c)+d)'];
  x['a+(b+(c+d))'] = [new CompositeSegmentExpression([x['a'][0], x['(b+(c+d))'][0],]), 'a+(b+(c+d))'];

  x['a/b+c+d']     = [new CompositeSegmentExpression([x['a/b'][0], x['c'][0], x['d'][0],]), 'a/b+c+d'];
  x['(a/b)+c+d']   = [new CompositeSegmentExpression([x['(a/b)'][0], x['c'][0], x['d'][0],]), '(a/b)+c+d'];
  x['a/(b+c)+d']   = [new CompositeSegmentExpression([x['a/(b+c)'][0], x['d'][0],]), 'a/(b+c)+d'];
  x['a/b+(c+d)']   = [new CompositeSegmentExpression([x['a/b'][0], x['(c+d)'][0],]), 'a/b+(c+d)'];
  x['(a/b)+(c+d)'] = [new CompositeSegmentExpression([x['(a/b)'][0], x['(c+d)'][0],]), '(a/b)+(c+d)'];
  x['(a/b+c)+d']   = [new CompositeSegmentExpression([x['(a/b+c)'][0], x['d'][0],]), '(a/b+c)+d'];
  x['((a/b)+c)+d'] = [new CompositeSegmentExpression([x['((a/b)+c)'][0], x['d'][0],]), '((a/b)+c)+d'];
  x['(a/(b+c))+d'] = [new CompositeSegmentExpression([x['(a/(b+c))'][0], x['d'][0],]), '(a/(b+c))+d'];

  x['a+b/c+d']     = [new CompositeSegmentExpression([x['a'][0], x['b/c'][0], x['d'][0],]), 'a+b/c+d'];
  x['(a+b)/c+d']   = [new CompositeSegmentExpression([x['(a+b)/c'][0], x['d'][0],]), '(a+b)/c+d'];
  x['a+(b/c)+d']   = [new CompositeSegmentExpression([x['a'][0], x['(b/c)'][0], x['d'][0],]), 'a+(b/c)+d'];
  x['a+b/(c+d)']   = [new CompositeSegmentExpression([x['a'][0], x['b/(c+d)'][0],]), 'a+b/(c+d)'];
  x['(a+b/c)+d']   = [new CompositeSegmentExpression([x['(a+b/c)'][0], x['d'][0],]), '(a+b/c)+d'];
  x['((a+b)/c)+d'] = [new CompositeSegmentExpression([x['((a+b)/c)'][0], x['d'][0],]), '((a+b)/c)+d'];
  x['(a+(b/c))+d'] = [new CompositeSegmentExpression([x['(a+(b/c))'][0], x['d'][0],]), '(a+(b/c))+d'];
  x['a+(b/c+d)']   = [new CompositeSegmentExpression([x['a'][0], x['(b/c+d)'][0],]), 'a+(b/c+d)'];
  x['a+((b/c)+d)'] = [new CompositeSegmentExpression([x['a'][0], x['((b/c)+d)'][0],]), 'a+((b/c)+d)'];
  x['a+(b/(c+d))'] = [new CompositeSegmentExpression([x['a'][0], x['(b/(c+d))'][0],]), 'a+(b/(c+d))'];

  x['a+b+c/d']     = [new CompositeSegmentExpression([x['a'][0], x['b'][0], x['c/d'][0],]), 'a+b+c/d'];
  x['(a+b)+c/d']   = [new CompositeSegmentExpression([x['(a+b)'][0], x['c/d'][0],]), '(a+b)+c/d'];
  x['a+(b+c)/d']   = [new CompositeSegmentExpression([x['a'][0], x['(b+c)/d'][0],]), 'a+(b+c)/d'];
  x['a+b+(c/d)']   = [new CompositeSegmentExpression([x['a'][0], x['b'][0], x['(c/d)'][0],]), 'a+b+(c/d)'];
  x['(a+b)+(c/d)'] = [new CompositeSegmentExpression([x['(a+b)'][0], x['(c/d)'][0],]), '(a+b)+(c/d)'];
  x['a+(b+c/d)']   = [new CompositeSegmentExpression([x['a'][0], x['(b+c/d)'][0],]), 'a+(b+c/d)'];
  x['a+((b+c)/d)'] = [new CompositeSegmentExpression([x['a'][0], x['((b+c)/d)'][0],]), 'a+((b+c)/d)'];
  x['a+(b+(c/d))'] = [new CompositeSegmentExpression([x['a'][0], x['(b+(c/d))'][0],]), 'a+(b+(c/d))'];

  x['a/b+c/d']     = [new CompositeSegmentExpression([x['a/b'][0], x['c/d'][0],]), 'a/b+c/d'];
  x['(a/b)+c/d']   = [new CompositeSegmentExpression([x['(a/b)'][0], x['c/d'][0],]), '(a/b)+c/d'];
  x['a/b+(c/d)']   = [new CompositeSegmentExpression([x['a/b'][0], x['(c/d)'][0],]), 'a/b+(c/d)'];
  x['(a/b)+(c/d)'] = [new CompositeSegmentExpression([x['(a/b)'][0], x['(c/d)'][0],]), '(a/b)+(c/d)'];

  x['a/b/c+d']     = [new CompositeSegmentExpression([x['a/b/c'][0], x['d'][0],]), 'a/b/c+d'];
  x['(a/b)/c+d']   = [new CompositeSegmentExpression([x['(a/b)/c'][0], x['d'][0],]), '(a/b)/c+d'];
  x['a/(b/c)+d']   = [new CompositeSegmentExpression([x['a/(b/c)'][0], x['d'][0],]), 'a/(b/c)+d'];
  x['(a/b/c)+d']   = [new CompositeSegmentExpression([x['(a/b/c)'][0], x['d'][0],]), '(a/b/c)+d'];
  x['((a/b)/c)+d'] = [new CompositeSegmentExpression([x['((a/b)/c)'][0], x['d'][0],]), '((a/b)/c)+d'];
  x['(a/(b/c))+d'] = [new CompositeSegmentExpression([x['(a/(b/c))'][0], x['d'][0],]), '(a/(b/c))+d'];

  x['a+b/c/d']     = [new CompositeSegmentExpression([x['a'][0], x['b/c/d'][0],]), 'a+b/c/d'];
  x['a+(b/c)/d']   = [new CompositeSegmentExpression([x['a'][0], x['(b/c)/d'][0],]), 'a+(b/c)/d'];
  x['a+b/(c/d)']   = [new CompositeSegmentExpression([x['a'][0], x['b/(c/d)'][0],]), 'a+b/(c/d)'];
  x['a+(b/c/d)']   = [new CompositeSegmentExpression([x['a'][0], x['(b/c/d)'][0],]), 'a+(b/c/d)'];
  x['a+((b/c)/d)'] = [new CompositeSegmentExpression([x['a'][0], x['((b/c)/d)'][0],]), 'a+((b/c)/d)'];
  x['a+(b/(c/d))'] = [new CompositeSegmentExpression([x['a'][0], x['(b/(c/d))'][0],]), 'a+(b/(c/d))'];

  x['a/b/c/d']     = [new ScopedSegmentExpression(x['a'][0], x['b/c/d'][0]), 'a/b/c/d'];
  x['(a/b)/c/d']   = [new ScopedSegmentExpression(x['(a/b)'][0], x['c/d'][0]), '(a/b)/c/d'];
  x['a/(b/c)/d']   = [new ScopedSegmentExpression(x['a'][0], x['(b/c)/d'][0]), 'a/(b/c)/d'];
  x['a/b/(c/d)']   = [new ScopedSegmentExpression(x['a'][0], x['b/(c/d)'][0]), 'a/b/(c/d)'];
  x['(a/b)/(c/d)'] = [new ScopedSegmentExpression(x['(a/b)'][0], x['(c/d)'][0]), '(a/b)/(c/d)'];
  x['(a/b/c)/d']   = [new ScopedSegmentExpression(x['(a/b/c)'][0], x['d'][0]), '(a/b/c)/d'];
  x['((a/b)/c)/d'] = [new ScopedSegmentExpression(x['((a/b)/c)'][0], x['d'][0]), '((a/b)/c)/d'];
  x['(a/(b/c))/d'] = [new ScopedSegmentExpression(x['(a/(b/c))'][0], x['d'][0]), '(a/(b/c))/d'];
  x['a/(b/c/d)']   = [new ScopedSegmentExpression(x['a'][0], x['(b/c/d)'][0]), 'a/(b/c/d)'];
  x['a/((b/c)/d)'] = [new ScopedSegmentExpression(x['a'][0], x['((b/c)/d)'][0]), 'a/((b/c)/d)'];
  x['a/(b/(c/d))'] = [new ScopedSegmentExpression(x['a'][0], x['(b/(c/d))'][0]), 'a/(b/(c/d))'];

  x['(a+b)/c/d']   = [new ScopedSegmentExpression(x['(a+b)'][0], x['c/d'][0]), '(a+b)/c/d'];
  x['(a+b)/(c/d)'] = [new ScopedSegmentExpression(x['(a+b)'][0], x['(c/d)'][0]), '(a+b)/(c/d)'];
  x['(a+b/c)/d']   = [new ScopedSegmentExpression(x['(a+b/c)'][0], x['d'][0]), '(a+b/c)/d'];
  x['((a+b)/c)/d'] = [new ScopedSegmentExpression(x['((a+b)/c)'][0], x['d'][0]), '((a+b)/c)/d'];
  x['(a+(b/c))/d'] = [new ScopedSegmentExpression(x['(a+(b/c))'][0], x['d'][0]), '(a+(b/c))/d'];

  x['a/(b+c)/d']   = [new ScopedSegmentExpression(x['a'][0], x['(b+c)/d'][0]), 'a/(b+c)/d'];
  x['(a/b+c)/d']   = [new ScopedSegmentExpression(x['(a/b+c)'][0], x['d'][0]), '(a/b+c)/d'];
  x['((a/b)+c)/d'] = [new ScopedSegmentExpression(x['((a/b)+c)'][0], x['d'][0]), '((a/b)+c)/d'];
  x['(a/(b+c))/d'] = [new ScopedSegmentExpression(x['(a/(b+c))'][0], x['d'][0]), '(a/(b+c))/d'];
  x['a/(b+c/d)']   = [new ScopedSegmentExpression(x['a'][0], x['(b+c/d)'][0]), 'a/(b+c/d)'];
  x['a/((b+c)/d)'] = [new ScopedSegmentExpression(x['a'][0], x['((b+c)/d)'][0]), 'a/((b+c)/d)'];
  x['a/(b+(c/d))'] = [new ScopedSegmentExpression(x['a'][0], x['(b+(c/d))'][0]), 'a/(b+(c/d))'];

  x['a/b/(c+d)']   = [new ScopedSegmentExpression(x['a'][0], x['b/(c+d)'][0]), 'a/b/(c+d)'];
  x['(a/b)/(c+d)'] = [new ScopedSegmentExpression(x['(a/b)'][0], x['(c+d)'][0]), '(a/b)/(c+d)'];
  x['a/(b/c+d)']   = [new ScopedSegmentExpression(x['a'][0], x['(b/c+d)'][0]), 'a/(b/c+d)'];
  x['a/((b/c)+d)'] = [new ScopedSegmentExpression(x['a'][0], x['((b/c)+d)'][0]), 'a/((b/c)+d)'];
  x['a/(b/(c+d))'] = [new ScopedSegmentExpression(x['a'][0], x['(b/(c+d))'][0]), 'a/(b/(c+d))'];

  x['(a+b)/(c+d)'] = [new ScopedSegmentExpression(x['(a+b)'][0], x['(c+d)'][0]), '(a+b)/(c+d)'];
  x['(a+b+c)/d']   = [new ScopedSegmentExpression(x['(a+b+c)'][0], x['d'][0]), '(a+b+c)/d'];
  x['((a+b)+c)/d'] = [new ScopedSegmentExpression(x['((a+b)+c)'][0], x['d'][0]), '((a+b)+c)/d'];
  x['(a+(b+c))/d'] = [new ScopedSegmentExpression(x['(a+(b+c))'][0], x['d'][0]), '(a+(b+c))/d'];

  x['a/(b+c+d)']   = [new ScopedSegmentExpression(x['a'][0], x['(b+c+d)'][0]), 'a/(b+c+d)'];
  x['a/((b+c)+d)'] = [new ScopedSegmentExpression(x['a'][0], x['((b+c)+d)'][0]), 'a/((b+c)+d)'];
  x['a/(b+(c+d))'] = [new ScopedSegmentExpression(x['a'][0], x['(b+(c+d))'][0]), 'a/(b+(c+d))'];

  for (const path in x) {
    const [route, url] = x[path];
    specs[`/${path}`] = [new RouteExpression(true, route, emptyQuerystring, null), url];
  }

  for (const path in specs) {
    const expected = specs[path];
    it(path, function () {
      const actual = RouteExpression.parse(pathUrlParser.parse(path));
      assert.deepStrictEqual(actual, expected[0]);
      assert.strictEqual(actual.toInstructionTree(NavigationOptions.create(RouterOptions.create({}), {})).toUrl(false, pathUrlParser), expected[1]);
    });
  }

  for (const path of ['/', ...terminal.map(t => `/${t}`)]) {
    it(`throws on empty component name '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(pathUrlParser.parse(path));
        },
        /AUR3500.+component name/,
      );
    });
  }

  for (const path of ['/a@', ...terminal.map(t => `/a@${t}`)]) {
    it(`throws on empty viewport name '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(pathUrlParser.parse(path));
        },
        /AUR3500.+viewport name/,
      );
    });
  }

  for (const path of ['/a(', ...terminal.map(t => `/a(${t}`)]) {
    it(`throws on empty parameter key '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(pathUrlParser.parse(path));
        },
        /AUR3500.+parameter key/,
      );
    });
  }

  for (const path of ['/a(1=', ...terminal.map(t => `/a(1=${t}`)]) {
    it(`throws on empty parameter value '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(pathUrlParser.parse(path));
        },
        /AUR3500.+parameter value/,
      );
    });
  }

  for (const path of [
    '/(a',
    '/(a+b',
    '/(a/b',
    '/((a)',
    '/((a+b)',
    '/((a/b)',

    '/(((a))',
    '/((a)',
    '/(a+(b)',
    '/(a/(b)',
    '/((a+(b))',
    '/((a/(b))',

    '/a/(a',
    '/a/(a+b',
    '/a/(a/b',
    '/a/((a)',
    '/a/((a+b)',
    '/a/((a/b)',

    '/a+(a',
    '/a+(a+b',
    '/a+(a/b',
    '/a+((a)',
    '/a+((a+b)',
    '/a+((a/b)',

    '/(a/a',
    '/(a+b/a',
    '/(a/b/a',
    '/((a)/a',
    '/((a+b)/a',
    '/((a/b)/a',

    '/a(1',
    '/a(1=1',
    '/a(1,2',
    '/a(1=1,2=2',

    '/a(1,',
    '/a(1=1,',
    '/a(1,2,',
    '/a(1=1,2=2,',
  ]) {
    it(`throws on missing closing paren '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(pathUrlParser.parse(path));
        },
        /AUR3500.+'\)'/,
      );
    });
  }

  for (const path of [
    // '/a?',
    // '/a#',
    '/a)',
    '/a=',
    '/a,',
    '/a&',

    // '/a@c?',
    // '/a@c#',
    '/a@c)',
    '/a@c=',
    '/a@c,',
    '/a@c&',
    '/a@c(',
    '/a@c@',

    // '/a!?',
    // '/a!#',
    '/a!)',
    '/a!=',
    '/a!,',
    '/a!&',
    '/a!.',
    '/a!(',
    '/a!@',
    '/a!!',
  ]) {
    it(`throws on unexpected '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(pathUrlParser.parse(path));
        },
        new RegExp(`AUR3501.+${path.slice(-1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
      );
    });
  }
});
