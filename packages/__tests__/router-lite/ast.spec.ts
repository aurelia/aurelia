import { assert } from '@aurelia/testing';
import { RouteExpression, AST, NavigationOptions, RouterOptions } from '@aurelia/router-lite';

const {
  CompositeSegmentExpression,
  ScopedSegmentExpression,
  SegmentGroupExpression,
  SegmentExpression,
  ComponentExpression,
  ActionExpression,
  ViewportExpression,
  ParameterListExpression,
  ParameterExpression,
} = AST;

const terminal = ['?', '#', '/', '+', '(', ')', '.', '@', '!', '=', ',', '&', '\'', '~', ';'];

describe('router-lite/ast.spec.ts', function () {
  const specs: Record<string, [RouteExpression, string]> = {};

  const emptyQuerystring: Readonly<URLSearchParams> = Object.freeze(new URLSearchParams());
  const noParams = new ParameterListExpression('', []);
  const paramSpecs = [
    noParams,
    new ParameterListExpression(
      '(1)',
      [
        new ParameterExpression('1', '0', '1'),
      ],
    ),
    new ParameterListExpression(
      '($1=1)',
      [
        new ParameterExpression('$1=1', '$1', '1'),
      ],
    ),
    new ParameterListExpression(
      '(1,2)',
      [
        new ParameterExpression('1', '0', '1'),
        new ParameterExpression('2', '1', '2'),
      ],
    ),
    new ParameterListExpression(
      '($1=1,$2=2)',
      [
        new ParameterExpression('$1=1', '$1', '1'),
        new ParameterExpression('$2=2', '$2', '2'),
      ],
    ),
  ];

  const noViewport = new ViewportExpression('', null);
  const viewportSpecs = [
    noViewport,
    new ViewportExpression('@foo', 'foo'),
  ];

  const componentSpecs = [
    ...paramSpecs.map(x => new ComponentExpression(`a${x.raw}`, 'a', x)),
  ];

  const noAction = new ActionExpression('', '', noParams);
  const actionSpecs = [
    noAction,
    ...paramSpecs.map(x => new ActionExpression(`.x${x.raw}`, 'x', x)),
  ];

  for (const component of componentSpecs) {
    for (const viewport of viewportSpecs) {
      for (const action of actionSpecs) {
        for (const scoped of [true, false]) {
          const raw = `${component.raw}${action.raw}${viewport.raw}${scoped ? '' : '!'}`;
          const url = `${component.raw}${viewport.raw}`;

          specs[`/${raw}`] = [new RouteExpression(
            `/${raw}`,
            true,
            new SegmentExpression(raw, component, action, viewport, scoped),
            emptyQuerystring,
            null,
            false,
          ), url];
          specs[`/(${raw})`] = [new RouteExpression(
            `/(${raw})`,
            true,
            new SegmentGroupExpression(
              `(${raw})`,
              new SegmentExpression(raw, component, action, viewport, scoped),
            ),
            emptyQuerystring,
            null,
            false,
          ), `(${url})`];

          specs[`/${raw}/${raw}`] = [new RouteExpression(
            `/${raw}/${raw}`,
            true,
            new ScopedSegmentExpression(
              `${raw}/${raw}`,
              new SegmentExpression(raw, component, action, viewport, scoped),
              new SegmentExpression(raw, component, action, viewport, scoped),
            ),
            emptyQuerystring,
            null,
            false,
          ), `${url}/${url}`];

          specs[`/${raw}+${raw}`] = [new RouteExpression(
            `/${raw}+${raw}`,
            true,
            new CompositeSegmentExpression(
              `${raw}+${raw}`,
              [
                new SegmentExpression(raw, component, action, viewport, scoped),
                new SegmentExpression(raw, component, action, viewport, scoped),
              ],
            ),
            emptyQuerystring,
            null,
            false,
          ), `${url}+${url}`];

          specs[`/${raw}?foo=bar`] = [new RouteExpression(
            `/${raw}`,
            true,
            new SegmentExpression(raw, component, action, viewport, scoped),
            Object.freeze(new URLSearchParams('foo=bar')),
            null,
            false,
          ), `${url}?foo=bar`];

          specs[`/${raw}?foo=bar&fiz=baz`] = [new RouteExpression(
            `/${raw}`,
            true,
            new SegmentExpression(raw, component, action, viewport, scoped),
            Object.freeze(new URLSearchParams('foo=bar&fiz=baz')),
            null,
            false,
          ), `${url}?foo=bar&fiz=baz`];

          specs[`/${raw}?foo=bar1&fiz=baz&foo=bar2`] = [new RouteExpression(
            `/${raw}`,
            true,
            new SegmentExpression(raw, component, action, viewport, scoped),
            Object.freeze(new URLSearchParams('foo=bar1&fiz=baz&foo=bar2')),
            null,
            false,
          ), `${url}?foo=bar1&fiz=baz&foo=bar2`];
        }
      }
    }
  }

  const comp = {
    '-': new ComponentExpression('-', '-', noParams),
    'a': new ComponentExpression('a', 'a', noParams),
    'b': new ComponentExpression('b', 'b', noParams),
    'c': new ComponentExpression('c', 'c', noParams),
    'd': new ComponentExpression('d', 'd', noParams),
  };

  const x = {};

  x['-'] = [new SegmentExpression('-', comp['-'], noAction,  noViewport, true), '-'];
  x['a'] = [new SegmentExpression('a', comp['a'], noAction,  noViewport, true), 'a'];
  x['b'] = [new SegmentExpression('b', comp['b'], noAction,  noViewport, true), 'b'];
  x['c'] = [new SegmentExpression('c', comp['c'], noAction,  noViewport, true), 'c'];
  x['d'] = [new SegmentExpression('d', comp['d'], noAction,  noViewport, true), 'd'];

  x['+a'] = [new CompositeSegmentExpression('+a', [x['a'][0]]), 'a'];
  x['+b'] = [new CompositeSegmentExpression('+b', [x['b'][0]]), 'b'];
  x['+c'] = [new CompositeSegmentExpression('+c', [x['c'][0]]), 'c'];
  x['+d'] = [new CompositeSegmentExpression('+d', [x['d'][0]]), 'd'];

  x['(a)'] = [new SegmentGroupExpression('(a)', x['a'][0]), '(a)'];
  x['(b)'] = [new SegmentGroupExpression('(b)', x['b'][0]), '(b)'];
  x['(c)'] = [new SegmentGroupExpression('(c)', x['c'][0]), '(c)'];
  x['(d)'] = [new SegmentGroupExpression('(d)', x['d'][0]), '(d)'];

  x['(+a)'] = [new SegmentGroupExpression('(+a)', x['+a'][0]), '(a)'];
  x['(+b)'] = [new SegmentGroupExpression('(+b)', x['+b'][0]), '(b)'];
  x['(+c)'] = [new SegmentGroupExpression('(+c)', x['+c'][0]), '(c)'];
  x['(+d)'] = [new SegmentGroupExpression('(+d)', x['+d'][0]), '(d)'];

  x['+(a)'] = [new CompositeSegmentExpression('+(a)', [x['(a)'][0]]), '(a)'];
  x['+(b)'] = [new CompositeSegmentExpression('+(b)', [x['(b)'][0]]), '(b)'];
  x['+(c)'] = [new CompositeSegmentExpression('+(c)', [x['(c)'][0]]), '(c)'];
  x['+(d)'] = [new CompositeSegmentExpression('+(d)', [x['(d)'][0]]), '(d)'];

  x['(a)+b'] = [new CompositeSegmentExpression('(a)+b', [x['(a)'][0], x['b'][0]]), '(a)+b'];
  x['a+(b)'] = [new CompositeSegmentExpression('a+(b)', [x['a'][0], x['(b)'][0]]), 'a+(b)'];

  x['+(a)+b'] = [new CompositeSegmentExpression('+(a)+b', [x['(a)'][0], x['b'][0]]), '(a)+b'];
  x['+a+(b)'] = [new CompositeSegmentExpression('+a+(b)', [x['a'][0], x['(b)'][0]]), 'a+(b)'];

  x['a+b'] = [new CompositeSegmentExpression('a+b', [x['a'][0], x['b'][0]]), 'a+b'];
  x['b+c'] = [new CompositeSegmentExpression('b+c', [x['b'][0], x['c'][0]]), 'b+c'];
  x['c+d'] = [new CompositeSegmentExpression('c+d', [x['c'][0], x['d'][0]]), 'c+d'];

  x['+a+b'] = [new CompositeSegmentExpression('+a+b', [x['a'][0], x['b'][0]]), 'a+b'];
  x['+b+c'] = [new CompositeSegmentExpression('+b+c', [x['b'][0], x['c'][0]]), 'b+c'];
  x['+c+d'] = [new CompositeSegmentExpression('+c+d', [x['c'][0], x['d'][0]]), 'c+d'];

  x['(a)/b'] = [new ScopedSegmentExpression('(a)/b', x['(a)'][0], x['b'][0]), '(a)/b'];
  x['a/(b)'] = [new ScopedSegmentExpression('a/(b)', x['a'][0], x['(b)'][0]), 'a/(b)'];

  x['+(a)/b'] = [new CompositeSegmentExpression('+(a)/b', [x['(a)/b'][0]]), '(a)/b'];
  x['+a/(b)'] = [new CompositeSegmentExpression('+a/(b)', [x['a/(b)'][0]]), 'a/(b)'];

  x['a/b'] = [new ScopedSegmentExpression('a/b', x['a'][0], x['b'][0]), 'a/b'];
  x['b/c'] = [new ScopedSegmentExpression('b/c', x['b'][0], x['c'][0]), 'b/c'];
  x['c/d'] = [new ScopedSegmentExpression('c/d', x['c'][0], x['d'][0]), 'c/d'];

  x['+a/b'] = [new CompositeSegmentExpression('+a/b', [x['a/b'][0]]), 'a/b'];
  x['+b/c'] = [new CompositeSegmentExpression('+b/c', [x['b/c'][0]]), 'b/c'];
  x['+c/d'] = [new CompositeSegmentExpression('+c/d', [x['c/d'][0]]), 'c/d'];

  x['(a+b)'] = [new SegmentGroupExpression('(a+b)', x['a+b'][0]), '(a+b)'];
  x['(b+c)'] = [new SegmentGroupExpression('(b+c)', x['b+c'][0]), '(b+c)'];
  x['(c+d)'] = [new SegmentGroupExpression('(c+d)', x['c+d'][0]), '(c+d)'];

  x['(a/b)'] = [new SegmentGroupExpression('(a/b)', x['a/b'][0]), '(a/b)'];
  x['(b/c)'] = [new SegmentGroupExpression('(b/c)', x['b/c'][0]), '(b/c)'];
  x['(c/d)'] = [new SegmentGroupExpression('(c/d)', x['c/d'][0]), '(c/d)'];

  x['+(a+b)'] = [new CompositeSegmentExpression('+(a+b)', [x['(a+b)'][0]]), '(a+b)'];
  x['+(b+c)'] = [new CompositeSegmentExpression('+(b+c)', [x['(b+c)'][0]]), '(b+c)'];
  x['+(c+d)'] = [new CompositeSegmentExpression('+(c+d)', [x['(c+d)'][0]]), '(c+d)'];

  x['a+b+c']   = [new CompositeSegmentExpression('a+b+c',   [x['a'][0],     x['b'][0],     x['c'][0],   ]), 'a+b+c'];
  x['(a+b)+c'] = [new CompositeSegmentExpression('(a+b)+c', [x['(a+b)'][0], x['c'][0],                  ]), '(a+b)+c'];
  x['a+(b+c)'] = [new CompositeSegmentExpression('a+(b+c)', [x['a'][0],     x['(b+c)'][0],              ]), 'a+(b+c)'];
  x['a/b+c']   = [new CompositeSegmentExpression('a/b+c',   [x['a/b'][0],   x['c'][0],                  ]), 'a/b+c'];
  x['(a/b)+c'] = [new CompositeSegmentExpression('(a/b)+c', [x['(a/b)'][0], x['c'][0],                  ]), '(a/b)+c'];
  x['a+b/c']   = [new CompositeSegmentExpression('a+b/c',   [x['a'][0],     x['b/c'][0],                ]), 'a+b/c'];
  x['a+(b/c)'] = [new CompositeSegmentExpression('a+(b/c)', [x['a'][0],     x['(b/c)'][0],              ]), 'a+(b/c)'];

  x['+a+b+c']   = [new CompositeSegmentExpression('+a+b+c',   [x['a'][0],     x['b'][0],     x['c'][0], ]), 'a+b+c'];
  x['+(a+b)+c'] = [new CompositeSegmentExpression('+(a+b)+c', [x['(a+b)'][0], x['c'][0],                ]), '(a+b)+c'];
  x['+a+(b+c)'] = [new CompositeSegmentExpression('+a+(b+c)', [x['a'][0],     x['(b+c)'][0],            ]), 'a+(b+c)'];
  x['+a/b+c']   = [new CompositeSegmentExpression('+a/b+c',   [x['a/b'][0],   x['c'][0],                ]), 'a/b+c'];
  x['+(a/b)+c'] = [new CompositeSegmentExpression('+(a/b)+c', [x['(a/b)'][0], x['c'][0],                ]), '(a/b)+c'];
  x['+a+b/c']   = [new CompositeSegmentExpression('+a+b/c',   [x['a'][0],     x['b/c'][0],              ]), 'a+b/c'];
  x['+a+(b/c)'] = [new CompositeSegmentExpression('+a+(b/c)', [x['a'][0],     x['(b/c)'][0],            ]), 'a+(b/c)'];

  x['b+c+d']   = [new CompositeSegmentExpression('b+c+d',   [x['b'][0],     x['c'][0],     x['d'][0],   ]), 'b+c+d'];
  x['(b+c)+d'] = [new CompositeSegmentExpression('(b+c)+d', [x['(b+c)'][0], x['d'][0],                  ]), '(b+c)+d'];
  x['b+(c+d)'] = [new CompositeSegmentExpression('b+(c+d)', [x['b'][0],     x['(c+d)'][0],              ]), 'b+(c+d)'];
  x['b/c+d']   = [new CompositeSegmentExpression('b/c+d',   [x['b/c'][0],   x['d'][0],                  ]), 'b/c+d'];
  x['(b/c)+d'] = [new CompositeSegmentExpression('(b/c)+d', [x['(b/c)'][0], x['d'][0],                  ]), '(b/c)+d'];
  x['b+c/d']   = [new CompositeSegmentExpression('b+c/d',   [x['b'][0],     x['c/d'][0],                ]), 'b+c/d'];
  x['b+(c/d)'] = [new CompositeSegmentExpression('b+(c/d)', [x['b'][0],     x['(c/d)'][0],              ]), 'b+(c/d)'];

  x['a/b/c']   = [new ScopedSegmentExpression('a/b/c',   x['a'][0],     x['b/c'][0]),   'a/b/c'];
  x['a/(b/c)'] = [new ScopedSegmentExpression('a/(b/c)', x['a'][0],     x['(b/c)'][0]), 'a/(b/c)'];
  x['a/(b+c)'] = [new ScopedSegmentExpression('a/(b+c)', x['a'][0],     x['(b+c)'][0]), 'a/(b+c)'];
  x['(a/b)/c'] = [new ScopedSegmentExpression('(a/b)/c', x['(a/b)'][0], x['c'][0]),     '(a/b)/c'];
  x['(a+b)/c'] = [new ScopedSegmentExpression('(a+b)/c', x['(a+b)'][0], x['c'][0]),     '(a+b)/c'];

  x['+a/b/c']   = [new CompositeSegmentExpression('+a/b/c',   [x['a/b/c'][0]]), 'a/b/c'];
  x['+a/(b/c)'] = [new CompositeSegmentExpression('+a/(b/c)', [x['a/(b/c)'][0]]), 'a/(b/c)'];
  x['+a/(b+c)'] = [new CompositeSegmentExpression('+a/(b+c)', [x['a/(b+c)'][0]]), 'a/(b+c)'];
  x['+(a/b)/c'] = [new CompositeSegmentExpression('+(a/b)/c', [x['(a/b)/c'][0]]), '(a/b)/c'];
  x['+(a+b)/c'] = [new CompositeSegmentExpression('+(a+b)/c', [x['(a+b)/c'][0]]), '(a+b)/c'];

  x['b/c/d']   = [new ScopedSegmentExpression('b/c/d',   x['b'][0],     x['c/d'][0]),   'b/c/d'];
  x['b/(c/d)'] = [new ScopedSegmentExpression('b/(c/d)', x['b'][0],     x['(c/d)'][0]), 'b/(c/d)'];
  x['b/(c+d)'] = [new ScopedSegmentExpression('b/(c+d)', x['b'][0],     x['(c+d)'][0]), 'b/(c+d)'];
  x['(b/c)/d'] = [new ScopedSegmentExpression('(b/c)/d', x['(b/c)'][0], x['d'][0]),     '(b/c)/d'];
  x['(b+c)/d'] = [new ScopedSegmentExpression('(b+c)/d', x['(b+c)'][0], x['d'][0]),     '(b+c)/d'];

  x['(a+b+c)']   = [new SegmentGroupExpression('(a+b+c)',   x['a+b+c'][0]),   '(a+b+c)'];
  x['((a+b)+c)'] = [new SegmentGroupExpression('((a+b)+c)', x['(a+b)+c'][0]), '((a+b)+c)'];
  x['(a+(b+c))'] = [new SegmentGroupExpression('(a+(b+c))', x['a+(b+c)'][0]), '(a+(b+c))'];
  x['(a/b+c)']   = [new SegmentGroupExpression('(a/b+c)',   x['a/b+c'][0]),   '(a/b+c)'];
  x['((a/b)+c)'] = [new SegmentGroupExpression('((a/b)+c)', x['(a/b)+c'][0]), '((a/b)+c)'];
  x['(a+b/c)']   = [new SegmentGroupExpression('(a+b/c)',   x['a+b/c'][0]),   '(a+b/c)'];
  x['(a+(b/c))'] = [new SegmentGroupExpression('(a+(b/c))', x['a+(b/c)'][0]), '(a+(b/c))'];

  x['(b+c+d)']   = [new SegmentGroupExpression('(b+c+d)',   x['b+c+d'][0]),   '(b+c+d)'];
  x['((b+c)+d)'] = [new SegmentGroupExpression('((b+c)+d)', x['(b+c)+d'][0]), '((b+c)+d)'];
  x['(b+(c+d))'] = [new SegmentGroupExpression('(b+(c+d))', x['b+(c+d)'][0]), '(b+(c+d))'];
  x['(b/c+d)']   = [new SegmentGroupExpression('(b/c+d)',   x['b/c+d'][0]),   '(b/c+d)'];
  x['((b/c)+d)'] = [new SegmentGroupExpression('((b/c)+d)', x['(b/c)+d'][0]), '((b/c)+d)'];
  x['(b+c/d)']   = [new SegmentGroupExpression('(b+c/d)',   x['b+c/d'][0]),   '(b+c/d)'];
  x['(b+(c/d))'] = [new SegmentGroupExpression('(b+(c/d))', x['b+(c/d)'][0]), '(b+(c/d))'];

  x['(a/b/c)']   = [new SegmentGroupExpression('(a/b/c)',   x['a/b/c'][0]),   '(a/b/c)'];
  x['(a/(b/c))'] = [new SegmentGroupExpression('(a/(b/c))', x['a/(b/c)'][0]), '(a/(b/c))'];
  x['(a/(b+c))'] = [new SegmentGroupExpression('(a/(b+c))', x['a/(b+c)'][0]), '(a/(b+c))'];
  x['((a/b)/c)'] = [new SegmentGroupExpression('((a/b)/c)', x['(a/b)/c'][0]), '((a/b)/c)'];
  x['((a+b)/c)'] = [new SegmentGroupExpression('((a+b)/c)', x['(a+b)/c'][0]), '((a+b)/c)'];

  x['(b/c/d)']   = [new SegmentGroupExpression('(b/c/d)',   x['b/c/d'][0]),   '(b/c/d)'];
  x['(b/(c/d))'] = [new SegmentGroupExpression('(b/(c/d))', x['b/(c/d)'][0]), '(b/(c/d))'];
  x['(b/(c+d))'] = [new SegmentGroupExpression('(b/(c+d))', x['b/(c+d)'][0]), '(b/(c+d))'];
  x['((b/c)/d)'] = [new SegmentGroupExpression('((b/c)/d)', x['(b/c)/d'][0]), '((b/c)/d)'];
  x['((b+c)/d)'] = [new SegmentGroupExpression('((b+c)/d)', x['(b+c)/d'][0]), '((b+c)/d)'];

  x['a+b+c+d']     = [new CompositeSegmentExpression('a+b+c+d',     [x['a'][0],         x['b'][0],         x['c'][0],     x['d'][0], ]), 'a+b+c+d'];
  x['(a+b)+c+d']   = [new CompositeSegmentExpression('(a+b)+c+d',   [x['(a+b)'][0],     x['c'][0],         x['d'][0],                ]), '(a+b)+c+d'];
  x['a+(b+c)+d']   = [new CompositeSegmentExpression('a+(b+c)+d',   [x['a'][0],         x['(b+c)'][0],     x['d'][0],                ]), 'a+(b+c)+d'];
  x['a+b+(c+d)']   = [new CompositeSegmentExpression('a+b+(c+d)',   [x['a'][0],         x['b'][0],         x['(c+d)'][0],            ]), 'a+b+(c+d)'];
  x['(a+b)+(c+d)'] = [new CompositeSegmentExpression('(a+b)+(c+d)', [x['(a+b)'][0],     x['(c+d)'][0],                               ]), '(a+b)+(c+d)'];
  x['(a+b+c)+d']   = [new CompositeSegmentExpression('(a+b+c)+d',   [x['(a+b+c)'][0],   x['d'][0],                                   ]), '(a+b+c)+d'];
  x['((a+b)+c)+d'] = [new CompositeSegmentExpression('((a+b)+c)+d', [x['((a+b)+c)'][0], x['d'][0],                                   ]), '((a+b)+c)+d'];
  x['(a+(b+c))+d'] = [new CompositeSegmentExpression('(a+(b+c))+d', [x['(a+(b+c))'][0], x['d'][0],                                   ]), '(a+(b+c))+d'];
  x['a+(b+c+d)']   = [new CompositeSegmentExpression('a+(b+c+d)',   [x['a'][0],         x['(b+c+d)'][0],                             ]), 'a+(b+c+d)'];
  x['a+((b+c)+d)'] = [new CompositeSegmentExpression('a+((b+c)+d)', [x['a'][0],         x['((b+c)+d)'][0],                           ]), 'a+((b+c)+d)'];
  x['a+(b+(c+d))'] = [new CompositeSegmentExpression('a+(b+(c+d))', [x['a'][0],         x['(b+(c+d))'][0],                           ]), 'a+(b+(c+d))'];

  x['a/b+c+d']     = [new CompositeSegmentExpression('a/b+c+d',     [x['a/b'][0],       x['c'][0],         x['d'][0],                ]), 'a/b+c+d'];
  x['(a/b)+c+d']   = [new CompositeSegmentExpression('(a/b)+c+d',   [x['(a/b)'][0],     x['c'][0],         x['d'][0],                ]), '(a/b)+c+d'];
  x['a/(b+c)+d']   = [new CompositeSegmentExpression('a/(b+c)+d',   [x['a/(b+c)'][0],   x['d'][0],                                   ]), 'a/(b+c)+d'];
  x['a/b+(c+d)']   = [new CompositeSegmentExpression('a/b+(c+d)',   [x['a/b'][0],       x['(c+d)'][0],                               ]), 'a/b+(c+d)'];
  x['(a/b)+(c+d)'] = [new CompositeSegmentExpression('(a/b)+(c+d)', [x['(a/b)'][0],     x['(c+d)'][0],                               ]), '(a/b)+(c+d)'];
  x['(a/b+c)+d']   = [new CompositeSegmentExpression('(a/b+c)+d',   [x['(a/b+c)'][0],   x['d'][0],                                   ]), '(a/b+c)+d'];
  x['((a/b)+c)+d'] = [new CompositeSegmentExpression('((a/b)+c)+d', [x['((a/b)+c)'][0], x['d'][0],                                   ]), '((a/b)+c)+d'];
  x['(a/(b+c))+d'] = [new CompositeSegmentExpression('(a/(b+c))+d', [x['(a/(b+c))'][0], x['d'][0],                                   ]), '(a/(b+c))+d'];

  x['a+b/c+d']     = [new CompositeSegmentExpression('a+b/c+d',     [x['a'][0],         x['b/c'][0],       x['d'][0],                ]), 'a+b/c+d'];
  x['(a+b)/c+d']   = [new CompositeSegmentExpression('(a+b)/c+d',   [x['(a+b)/c'][0],   x['d'][0],                                   ]), '(a+b)/c+d'];
  x['a+(b/c)+d']   = [new CompositeSegmentExpression('a+(b/c)+d',   [x['a'][0],         x['(b/c)'][0],     x['d'][0],                ]), 'a+(b/c)+d'];
  x['a+b/(c+d)']   = [new CompositeSegmentExpression('a+b/(c+d)',   [x['a'][0],         x['b/(c+d)'][0],                             ]), 'a+b/(c+d)'];
  x['(a+b/c)+d']   = [new CompositeSegmentExpression('(a+b/c)+d',   [x['(a+b/c)'][0],   x['d'][0],                                   ]), '(a+b/c)+d'];
  x['((a+b)/c)+d'] = [new CompositeSegmentExpression('((a+b)/c)+d', [x['((a+b)/c)'][0], x['d'][0],                                   ]), '((a+b)/c)+d'];
  x['(a+(b/c))+d'] = [new CompositeSegmentExpression('(a+(b/c))+d', [x['(a+(b/c))'][0], x['d'][0],                                   ]), '(a+(b/c))+d'];
  x['a+(b/c+d)']   = [new CompositeSegmentExpression('a+(b/c+d)',   [x['a'][0],         x['(b/c+d)'][0],                             ]), 'a+(b/c+d)'];
  x['a+((b/c)+d)'] = [new CompositeSegmentExpression('a+((b/c)+d)', [x['a'][0],         x['((b/c)+d)'][0],                           ]), 'a+((b/c)+d)'];
  x['a+(b/(c+d))'] = [new CompositeSegmentExpression('a+(b/(c+d))', [x['a'][0],         x['(b/(c+d))'][0],                           ]), 'a+(b/(c+d))'];

  x['a+b+c/d']     = [new CompositeSegmentExpression('a+b+c/d',     [x['a'][0],         x['b'][0],         x['c/d'][0],              ]), 'a+b+c/d'];
  x['(a+b)+c/d']   = [new CompositeSegmentExpression('(a+b)+c/d',   [x['(a+b)'][0],     x['c/d'][0],                                 ]), '(a+b)+c/d'];
  x['a+(b+c)/d']   = [new CompositeSegmentExpression('a+(b+c)/d',   [x['a'][0],         x['(b+c)/d'][0],                             ]), 'a+(b+c)/d'];
  x['a+b+(c/d)']   = [new CompositeSegmentExpression('a+b+(c/d)',   [x['a'][0],         x['b'][0],         x['(c/d)'][0],            ]), 'a+b+(c/d)'];
  x['(a+b)+(c/d)'] = [new CompositeSegmentExpression('(a+b)+(c/d)', [x['(a+b)'][0],     x['(c/d)'][0],                               ]), '(a+b)+(c/d)'];
  x['a+(b+c/d)']   = [new CompositeSegmentExpression('a+(b+c/d)',   [x['a'][0],         x['(b+c/d)'][0],                             ]), 'a+(b+c/d)'];
  x['a+((b+c)/d)'] = [new CompositeSegmentExpression('a+((b+c)/d)', [x['a'][0],         x['((b+c)/d)'][0],                           ]), 'a+((b+c)/d)'];
  x['a+(b+(c/d))'] = [new CompositeSegmentExpression('a+(b+(c/d))', [x['a'][0],         x['(b+(c/d))'][0],                           ]), 'a+(b+(c/d))'];

  x['a/b+c/d']     = [new CompositeSegmentExpression('a/b+c/d',     [x['a/b'][0],       x['c/d'][0],       ]), 'a/b+c/d'];
  x['(a/b)+c/d']   = [new CompositeSegmentExpression('(a/b)+c/d',   [x['(a/b)'][0],     x['c/d'][0],       ]), '(a/b)+c/d'];
  x['a/b+(c/d)']   = [new CompositeSegmentExpression('a/b+(c/d)',   [x['a/b'][0],       x['(c/d)'][0],     ]), 'a/b+(c/d)'];
  x['(a/b)+(c/d)'] = [new CompositeSegmentExpression('(a/b)+(c/d)', [x['(a/b)'][0],     x['(c/d)'][0],     ]), '(a/b)+(c/d)'];

  x['a/b/c+d']     = [new CompositeSegmentExpression('a/b/c+d',     [x['a/b/c'][0],     x['d'][0],         ]), 'a/b/c+d'];
  x['(a/b)/c+d']   = [new CompositeSegmentExpression('(a/b)/c+d',   [x['(a/b)/c'][0],   x['d'][0],         ]), '(a/b)/c+d'];
  x['a/(b/c)+d']   = [new CompositeSegmentExpression('a/(b/c)+d',   [x['a/(b/c)'][0],   x['d'][0],         ]), 'a/(b/c)+d'];
  x['(a/b/c)+d']   = [new CompositeSegmentExpression('(a/b/c)+d',   [x['(a/b/c)'][0],   x['d'][0],         ]), '(a/b/c)+d'];
  x['((a/b)/c)+d'] = [new CompositeSegmentExpression('((a/b)/c)+d', [x['((a/b)/c)'][0], x['d'][0],         ]), '((a/b)/c)+d'];
  x['(a/(b/c))+d'] = [new CompositeSegmentExpression('(a/(b/c))+d', [x['(a/(b/c))'][0], x['d'][0],         ]), '(a/(b/c))+d'];

  x['a+b/c/d']     = [new CompositeSegmentExpression('a+b/c/d',     [x['a'][0],         x['b/c/d'][0],     ]), 'a+b/c/d'];
  x['a+(b/c)/d']   = [new CompositeSegmentExpression('a+(b/c)/d',   [x['a'][0],         x['(b/c)/d'][0],   ]), 'a+(b/c)/d'];
  x['a+b/(c/d)']   = [new CompositeSegmentExpression('a+b/(c/d)',   [x['a'][0],         x['b/(c/d)'][0],   ]), 'a+b/(c/d)'];
  x['a+(b/c/d)']   = [new CompositeSegmentExpression('a+(b/c/d)',   [x['a'][0],         x['(b/c/d)'][0],   ]), 'a+(b/c/d)'];
  x['a+((b/c)/d)'] = [new CompositeSegmentExpression('a+((b/c)/d)', [x['a'][0],         x['((b/c)/d)'][0], ]), 'a+((b/c)/d)'];
  x['a+(b/(c/d))'] = [new CompositeSegmentExpression('a+(b/(c/d))', [x['a'][0],         x['(b/(c/d))'][0], ]), 'a+(b/(c/d))'];

  x['a/b/c/d']     = [new ScopedSegmentExpression('a/b/c/d',     x['a'][0],         x['b/c/d'][0]),     'a/b/c/d'];
  x['(a/b)/c/d']   = [new ScopedSegmentExpression('(a/b)/c/d',   x['(a/b)'][0],     x['c/d'][0]),       '(a/b)/c/d'];
  x['a/(b/c)/d']   = [new ScopedSegmentExpression('a/(b/c)/d',   x['a'][0],         x['(b/c)/d'][0]),   'a/(b/c)/d'];
  x['a/b/(c/d)']   = [new ScopedSegmentExpression('a/b/(c/d)',   x['a'][0],         x['b/(c/d)'][0]),   'a/b/(c/d)'];
  x['(a/b)/(c/d)'] = [new ScopedSegmentExpression('(a/b)/(c/d)', x['(a/b)'][0],     x['(c/d)'][0]),     '(a/b)/(c/d)'];
  x['(a/b/c)/d']   = [new ScopedSegmentExpression('(a/b/c)/d',   x['(a/b/c)'][0],   x['d'][0]),         '(a/b/c)/d'];
  x['((a/b)/c)/d'] = [new ScopedSegmentExpression('((a/b)/c)/d', x['((a/b)/c)'][0], x['d'][0]),         '((a/b)/c)/d'];
  x['(a/(b/c))/d'] = [new ScopedSegmentExpression('(a/(b/c))/d', x['(a/(b/c))'][0], x['d'][0]),         '(a/(b/c))/d'];
  x['a/(b/c/d)']   = [new ScopedSegmentExpression('a/(b/c/d)',   x['a'][0],         x['(b/c/d)'][0]),   'a/(b/c/d)'];
  x['a/((b/c)/d)'] = [new ScopedSegmentExpression('a/((b/c)/d)', x['a'][0],         x['((b/c)/d)'][0]), 'a/((b/c)/d)'];
  x['a/(b/(c/d))'] = [new ScopedSegmentExpression('a/(b/(c/d))', x['a'][0],         x['(b/(c/d))'][0]), 'a/(b/(c/d))'];

  x['(a+b)/c/d']   = [new ScopedSegmentExpression('(a+b)/c/d',   x['(a+b)'][0],     x['c/d'][0]),   '(a+b)/c/d'];
  x['(a+b)/(c/d)'] = [new ScopedSegmentExpression('(a+b)/(c/d)', x['(a+b)'][0],     x['(c/d)'][0]), '(a+b)/(c/d)'];
  x['(a+b/c)/d']   = [new ScopedSegmentExpression('(a+b/c)/d',   x['(a+b/c)'][0],   x['d'][0]),     '(a+b/c)/d'];
  x['((a+b)/c)/d'] = [new ScopedSegmentExpression('((a+b)/c)/d', x['((a+b)/c)'][0], x['d'][0]),     '((a+b)/c)/d'];
  x['(a+(b/c))/d'] = [new ScopedSegmentExpression('(a+(b/c))/d', x['(a+(b/c))'][0], x['d'][0]),     '(a+(b/c))/d'];

  x['a/(b+c)/d']   = [new ScopedSegmentExpression('a/(b+c)/d',   x['a'][0],         x['(b+c)/d'][0]),   'a/(b+c)/d'];
  x['(a/b+c)/d']   = [new ScopedSegmentExpression('(a/b+c)/d',   x['(a/b+c)'][0],   x['d'][0]),         '(a/b+c)/d'];
  x['((a/b)+c)/d'] = [new ScopedSegmentExpression('((a/b)+c)/d', x['((a/b)+c)'][0], x['d'][0]),         '((a/b)+c)/d'];
  x['(a/(b+c))/d'] = [new ScopedSegmentExpression('(a/(b+c))/d', x['(a/(b+c))'][0], x['d'][0]),         '(a/(b+c))/d'];
  x['a/(b+c/d)']   = [new ScopedSegmentExpression('a/(b+c/d)',   x['a'][0],         x['(b+c/d)'][0]),   'a/(b+c/d)'];
  x['a/((b+c)/d)'] = [new ScopedSegmentExpression('a/((b+c)/d)', x['a'][0],         x['((b+c)/d)'][0]), 'a/((b+c)/d)'];
  x['a/(b+(c/d))'] = [new ScopedSegmentExpression('a/(b+(c/d))', x['a'][0],         x['(b+(c/d))'][0]), 'a/(b+(c/d))'];

  x['a/b/(c+d)']   = [new ScopedSegmentExpression('a/b/(c+d)',   x['a'][0],         x['b/(c+d)'][0]),   'a/b/(c+d)'];
  x['(a/b)/(c+d)'] = [new ScopedSegmentExpression('(a/b)/(c+d)', x['(a/b)'][0],     x['(c+d)'][0]),     '(a/b)/(c+d)'];
  x['a/(b/c+d)']   = [new ScopedSegmentExpression('a/(b/c+d)',   x['a'][0],         x['(b/c+d)'][0]),   'a/(b/c+d)'];
  x['a/((b/c)+d)'] = [new ScopedSegmentExpression('a/((b/c)+d)', x['a'][0],         x['((b/c)+d)'][0]), 'a/((b/c)+d)'];
  x['a/(b/(c+d))'] = [new ScopedSegmentExpression('a/(b/(c+d))', x['a'][0],         x['(b/(c+d))'][0]), 'a/(b/(c+d))'];

  x['(a+b)/(c+d)'] = [new ScopedSegmentExpression('(a+b)/(c+d)', x['(a+b)'][0],     x['(c+d)'][0]), '(a+b)/(c+d)'];

  x['(a+b+c)/d']   = [new ScopedSegmentExpression('(a+b+c)/d',   x['(a+b+c)'][0],   x['d'][0]), '(a+b+c)/d'];
  x['((a+b)+c)/d'] = [new ScopedSegmentExpression('((a+b)+c)/d', x['((a+b)+c)'][0], x['d'][0]), '((a+b)+c)/d'];
  x['(a+(b+c))/d'] = [new ScopedSegmentExpression('(a+(b+c))/d', x['(a+(b+c))'][0], x['d'][0]), '(a+(b+c))/d'];

  x['a/(b+c+d)']   = [new ScopedSegmentExpression('a/(b+c+d)',   x['a'][0],         x['(b+c+d)'][0]),   'a/(b+c+d)'];
  x['a/((b+c)+d)'] = [new ScopedSegmentExpression('a/((b+c)+d)', x['a'][0],         x['((b+c)+d)'][0]), 'a/((b+c)+d)'];
  x['a/(b+(c+d))'] = [new ScopedSegmentExpression('a/(b+(c+d))', x['a'][0],         x['(b+(c+d))'][0]), 'a/(b+(c+d))'];

  for (const path in x) {
    const [route, url] = x[path];
    specs[`/${route.raw}`] = [new RouteExpression(`/${route.raw}`, true, route, emptyQuerystring, null, false), url];
  }

  for (const path in specs) {
    const expected = specs[path];
    it(path, function () {
      const actual = RouteExpression.parse(path, false);
      assert.deepStrictEqual(actual, expected[0]);
      assert.strictEqual(actual.toInstructionTree(NavigationOptions.create(RouterOptions.create({}), {})).toUrl(false, false), expected[1]);
    });
  }

  for (const path of ['/', ...terminal.map(t => `/${t}`)]) {
    it(`throws on empty component name '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(path, false);
        },
        /AUR3500.+component name/,
      );
    });
  }

  for (const path of ['/a.', ...terminal.map(t => `/a.${t}`)]) {
    it(`throws on empty method name '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(path, false);
        },
        /AUR3500.+method name/,
      );
    });
  }

  for (const path of ['/a@', ...terminal.map(t => `/a@${t}`)]) {
    it(`throws on empty viewport name '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(path, false);
        },
        /AUR3500.+viewport name/,
      );
    });
  }

  for (const path of ['/a(', '/a.x(', ...terminal.flatMap(t => [`/a(${t}`, `/a.x(${t}`])]) {
    it(`throws on empty parameter key '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(path, false);
        },
        /AUR3500.+parameter key/,
      );
    });
  }

  for (const path of ['/a(1=', '/a.x(1=', ...terminal.flatMap(t => [`/a(1=${t}`, `/a.x(1=${t}`])]) {
    it(`throws on empty parameter value '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(path, false);
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
    '/a.x(1',
    '/a.x(1=1',
    '/a.x(1,2',
    '/a.x(1=1,2=2',

    '/a(1,',
    '/a(1=1,',
    '/a(1,2,',
    '/a(1=1,2=2,',

    '/a.x(1,',
    '/a.x(1=1,',
    '/a.x(1,2,',
    '/a.x(1=1,2=2,',
  ]) {
    it(`throws on missing closing paren '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(path, false);
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

    // '/a.b?',
    // '/a.b#',
    '/a.b)',
    '/a.b=',
    '/a.b,',
    '/a.b&',
    '/a.b.',

    // '/a@c?',
    // '/a@c#',
    '/a@c)',
    '/a@c=',
    '/a@c,',
    '/a@c&',
    '/a@c.',
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
          RouteExpression.parse(path, false);
        },
        new RegExp(`AUR3501.+${path.slice(-1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
      );
    });
  }
});
