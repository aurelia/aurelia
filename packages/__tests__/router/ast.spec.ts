/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { assert } from '@aurelia/testing';
import { RouteExpression, AST } from '@aurelia/router';
import { emptyObject } from '@aurelia/kernel';

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

describe('route-expression', function () {
  const specs = {};

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

  const noViewport = new ViewportExpression('', '');
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

          specs[`/${raw}`] = new RouteExpression(
            `/${raw}`,
            true,
            new SegmentExpression(raw, component, action, viewport, scoped),
            emptyObject,
            null,
            false,
          );
          specs[`/(${raw})`] = new RouteExpression(
            `/(${raw})`,
            true,
            new SegmentGroupExpression(
              `(${raw})`,
              new SegmentExpression(raw, component, action, viewport, scoped),
            ),
            emptyObject,
            null,
            false,
          );

          specs[`/${raw}/${raw}`] = new RouteExpression(
            `/${raw}/${raw}`,
            true,
            new ScopedSegmentExpression(
              `${raw}/${raw}`,
              new SegmentExpression(raw, component, action, viewport, scoped),
              new SegmentExpression(raw, component, action, viewport, scoped),
            ),
            emptyObject,
            null,
            false,
          );

          specs[`/${raw}+${raw}`] = new RouteExpression(
            `/${raw}+${raw}`,
            true,
            new CompositeSegmentExpression(
              `${raw}+${raw}`,
              [
                new SegmentExpression(raw, component, action, viewport, scoped),
                new SegmentExpression(raw, component, action, viewport, scoped),
              ],
              false,
            ),
            emptyObject,
            null,
            false,
          );
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

  x['-'] = new SegmentExpression('-', comp['-'], noAction,  noViewport, true);
  x['a'] = new SegmentExpression('a', comp['a'], noAction,  noViewport, true);
  x['b'] = new SegmentExpression('b', comp['b'], noAction,  noViewport, true);
  x['c'] = new SegmentExpression('c', comp['c'], noAction,  noViewport, true);
  x['d'] = new SegmentExpression('d', comp['d'], noAction,  noViewport, true);

  x['+a'] = new CompositeSegmentExpression('+a', [x['a']], true);
  x['+b'] = new CompositeSegmentExpression('+b', [x['b']], true);
  x['+c'] = new CompositeSegmentExpression('+c', [x['c']], true);
  x['+d'] = new CompositeSegmentExpression('+d', [x['d']], true);

  x['(a)'] = new SegmentGroupExpression('(a)', x['a']);
  x['(b)'] = new SegmentGroupExpression('(b)', x['b']);
  x['(c)'] = new SegmentGroupExpression('(c)', x['c']);
  x['(d)'] = new SegmentGroupExpression('(d)', x['d']);

  x['(+a)'] = new SegmentGroupExpression('(+a)', x['+a']);
  x['(+b)'] = new SegmentGroupExpression('(+b)', x['+b']);
  x['(+c)'] = new SegmentGroupExpression('(+c)', x['+c']);
  x['(+d)'] = new SegmentGroupExpression('(+d)', x['+d']);

  x['+(a)'] = new CompositeSegmentExpression('+(a)', [x['(a)']], true);
  x['+(b)'] = new CompositeSegmentExpression('+(b)', [x['(b)']], true);
  x['+(c)'] = new CompositeSegmentExpression('+(c)', [x['(c)']], true);
  x['+(d)'] = new CompositeSegmentExpression('+(d)', [x['(d)']], true);

  x['(a)+b'] = new CompositeSegmentExpression('(a)+b', [x['(a)'], x['b']], false);
  x['a+(b)'] = new CompositeSegmentExpression('a+(b)', [x['a'], x['(b)']], false);

  x['+(a)+b'] = new CompositeSegmentExpression('+(a)+b', [x['(a)'], x['b']], true);
  x['+a+(b)'] = new CompositeSegmentExpression('+a+(b)', [x['a'], x['(b)']], true);

  x['a+b'] = new CompositeSegmentExpression('a+b', [x['a'], x['b']], false);
  x['b+c'] = new CompositeSegmentExpression('b+c', [x['b'], x['c']], false);
  x['c+d'] = new CompositeSegmentExpression('c+d', [x['c'], x['d']], false);

  x['+a+b'] = new CompositeSegmentExpression('+a+b', [x['a'], x['b']], true);
  x['+b+c'] = new CompositeSegmentExpression('+b+c', [x['b'], x['c']], true);
  x['+c+d'] = new CompositeSegmentExpression('+c+d', [x['c'], x['d']], true);

  x['(a)/b'] = new ScopedSegmentExpression('(a)/b', x['(a)'], x['b']);
  x['a/(b)'] = new ScopedSegmentExpression('a/(b)', x['a'], x['(b)']);

  x['+(a)/b'] = new CompositeSegmentExpression('+(a)/b', [x['(a)/b']], true);
  x['+a/(b)'] = new CompositeSegmentExpression('+a/(b)', [x['a/(b)']], true);

  x['a/b'] = new ScopedSegmentExpression('a/b', x['a'], x['b']);
  x['b/c'] = new ScopedSegmentExpression('b/c', x['b'], x['c']);
  x['c/d'] = new ScopedSegmentExpression('c/d', x['c'], x['d']);

  x['+a/b'] = new CompositeSegmentExpression('+a/b', [x['a/b']], true);
  x['+b/c'] = new CompositeSegmentExpression('+b/c', [x['b/c']], true);
  x['+c/d'] = new CompositeSegmentExpression('+c/d', [x['c/d']], true);

  x['(a+b)'] = new SegmentGroupExpression('(a+b)', x['a+b']);
  x['(b+c)'] = new SegmentGroupExpression('(b+c)', x['b+c']);
  x['(c+d)'] = new SegmentGroupExpression('(c+d)', x['c+d']);

  x['(a/b)'] = new SegmentGroupExpression('(a/b)', x['a/b']);
  x['(b/c)'] = new SegmentGroupExpression('(b/c)', x['b/c']);
  x['(c/d)'] = new SegmentGroupExpression('(c/d)', x['c/d']);

  x['+(a+b)'] = new CompositeSegmentExpression('+(a+b)', [x['(a+b)']], true);
  x['+(b+c)'] = new CompositeSegmentExpression('+(b+c)', [x['(b+c)']], true);
  x['+(c+d)'] = new CompositeSegmentExpression('+(c+d)', [x['(c+d)']], true);

  x['a+b+c']   = new CompositeSegmentExpression('a+b+c',   [x['a'],     x['b'],     x['c'], ], false);
  x['(a+b)+c'] = new CompositeSegmentExpression('(a+b)+c', [x['(a+b)'], x['c'],             ], false);
  x['a+(b+c)'] = new CompositeSegmentExpression('a+(b+c)', [x['a'],     x['(b+c)'],         ], false);
  x['a/b+c']   = new CompositeSegmentExpression('a/b+c',   [x['a/b'],   x['c'],             ], false);
  x['(a/b)+c'] = new CompositeSegmentExpression('(a/b)+c', [x['(a/b)'], x['c'],             ], false);
  x['a+b/c']   = new CompositeSegmentExpression('a+b/c',   [x['a'],     x['b/c'],           ], false);
  x['a+(b/c)'] = new CompositeSegmentExpression('a+(b/c)', [x['a'],     x['(b/c)'],         ], false);

  x['+a+b+c']   = new CompositeSegmentExpression('+a+b+c',   [x['a'],     x['b'],     x['c'], ], true);
  x['+(a+b)+c'] = new CompositeSegmentExpression('+(a+b)+c', [x['(a+b)'], x['c'],             ], true);
  x['+a+(b+c)'] = new CompositeSegmentExpression('+a+(b+c)', [x['a'],     x['(b+c)'],         ], true);
  x['+a/b+c']   = new CompositeSegmentExpression('+a/b+c',   [x['a/b'],   x['c'],             ], true);
  x['+(a/b)+c'] = new CompositeSegmentExpression('+(a/b)+c', [x['(a/b)'], x['c'],             ], true);
  x['+a+b/c']   = new CompositeSegmentExpression('+a+b/c',   [x['a'],     x['b/c'],           ], true);
  x['+a+(b/c)'] = new CompositeSegmentExpression('+a+(b/c)', [x['a'],     x['(b/c)'],         ], true);

  x['b+c+d']   = new CompositeSegmentExpression('b+c+d',   [x['b'],     x['c'],     x['d'], ], false);
  x['(b+c)+d'] = new CompositeSegmentExpression('(b+c)+d', [x['(b+c)'], x['d'],             ], false);
  x['b+(c+d)'] = new CompositeSegmentExpression('b+(c+d)', [x['b'],     x['(c+d)'],         ], false);
  x['b/c+d']   = new CompositeSegmentExpression('b/c+d',   [x['b/c'],   x['d'],             ], false);
  x['(b/c)+d'] = new CompositeSegmentExpression('(b/c)+d', [x['(b/c)'], x['d'],             ], false);
  x['b+c/d']   = new CompositeSegmentExpression('b+c/d',   [x['b'],     x['c/d'],           ], false);
  x['b+(c/d)'] = new CompositeSegmentExpression('b+(c/d)', [x['b'],     x['(c/d)'],         ], false);

  x['a/b/c']   = new ScopedSegmentExpression('a/b/c',   x['a'],     x['b/c']);
  x['a/(b/c)'] = new ScopedSegmentExpression('a/(b/c)', x['a'],     x['(b/c)']);
  x['a/(b+c)'] = new ScopedSegmentExpression('a/(b+c)', x['a'],     x['(b+c)']);
  x['(a/b)/c'] = new ScopedSegmentExpression('(a/b)/c', x['(a/b)'], x['c']);
  x['(a+b)/c'] = new ScopedSegmentExpression('(a+b)/c', x['(a+b)'], x['c']);

  x['+a/b/c']   = new CompositeSegmentExpression('+a/b/c',   [x['a/b/c']],   true);
  x['+a/(b/c)'] = new CompositeSegmentExpression('+a/(b/c)', [x['a/(b/c)']], true);
  x['+a/(b+c)'] = new CompositeSegmentExpression('+a/(b+c)', [x['a/(b+c)']], true);
  x['+(a/b)/c'] = new CompositeSegmentExpression('+(a/b)/c', [x['(a/b)/c']], true);
  x['+(a+b)/c'] = new CompositeSegmentExpression('+(a+b)/c', [x['(a+b)/c']], true);

  x['b/c/d']   = new ScopedSegmentExpression('b/c/d',   x['b'],     x['c/d']);
  x['b/(c/d)'] = new ScopedSegmentExpression('b/(c/d)', x['b'],     x['(c/d)']);
  x['b/(c+d)'] = new ScopedSegmentExpression('b/(c+d)', x['b'],     x['(c+d)']);
  x['(b/c)/d'] = new ScopedSegmentExpression('(b/c)/d', x['(b/c)'], x['d']);
  x['(b+c)/d'] = new ScopedSegmentExpression('(b+c)/d', x['(b+c)'], x['d']);

  x['(a+b+c)']   = new SegmentGroupExpression('(a+b+c)',   x['a+b+c']);
  x['((a+b)+c)'] = new SegmentGroupExpression('((a+b)+c)', x['(a+b)+c']);
  x['(a+(b+c))'] = new SegmentGroupExpression('(a+(b+c))', x['a+(b+c)']);
  x['(a/b+c)']   = new SegmentGroupExpression('(a/b+c)',   x['a/b+c']);
  x['((a/b)+c)'] = new SegmentGroupExpression('((a/b)+c)', x['(a/b)+c']);
  x['(a+b/c)']   = new SegmentGroupExpression('(a+b/c)',   x['a+b/c']);
  x['(a+(b/c))'] = new SegmentGroupExpression('(a+(b/c))', x['a+(b/c)']);

  x['(b+c+d)']   = new SegmentGroupExpression('(b+c+d)',   x['b+c+d']);
  x['((b+c)+d)'] = new SegmentGroupExpression('((b+c)+d)', x['(b+c)+d']);
  x['(b+(c+d))'] = new SegmentGroupExpression('(b+(c+d))', x['b+(c+d)']);
  x['(b/c+d)']   = new SegmentGroupExpression('(b/c+d)',   x['b/c+d']);
  x['((b/c)+d)'] = new SegmentGroupExpression('((b/c)+d)', x['(b/c)+d']);
  x['(b+c/d)']   = new SegmentGroupExpression('(b+c/d)',   x['b+c/d']);
  x['(b+(c/d))'] = new SegmentGroupExpression('(b+(c/d))', x['b+(c/d)']);

  x['(a/b/c)']   = new SegmentGroupExpression('(a/b/c)',   x['a/b/c']);
  x['(a/(b/c))'] = new SegmentGroupExpression('(a/(b/c))', x['a/(b/c)']);
  x['(a/(b+c))'] = new SegmentGroupExpression('(a/(b+c))', x['a/(b+c)']);
  x['((a/b)/c)'] = new SegmentGroupExpression('((a/b)/c)', x['(a/b)/c']);
  x['((a+b)/c)'] = new SegmentGroupExpression('((a+b)/c)', x['(a+b)/c']);

  x['(b/c/d)']   = new SegmentGroupExpression('(b/c/d)',   x['b/c/d']);
  x['(b/(c/d))'] = new SegmentGroupExpression('(b/(c/d))', x['b/(c/d)']);
  x['(b/(c+d))'] = new SegmentGroupExpression('(b/(c+d))', x['b/(c+d)']);
  x['((b/c)/d)'] = new SegmentGroupExpression('((b/c)/d)', x['(b/c)/d']);
  x['((b+c)/d)'] = new SegmentGroupExpression('((b+c)/d)', x['(b+c)/d']);

  x['a+b+c+d']     = new CompositeSegmentExpression('a+b+c+d',     [x['a'],         x['b'],         x['c'],     x['d'], ], false);
  x['(a+b)+c+d']   = new CompositeSegmentExpression('(a+b)+c+d',   [x['(a+b)'],     x['c'],         x['d'],             ], false);
  x['a+(b+c)+d']   = new CompositeSegmentExpression('a+(b+c)+d',   [x['a'],         x['(b+c)'],     x['d'],             ], false);
  x['a+b+(c+d)']   = new CompositeSegmentExpression('a+b+(c+d)',   [x['a'],         x['b'],         x['(c+d)'],         ], false);
  x['(a+b)+(c+d)'] = new CompositeSegmentExpression('(a+b)+(c+d)', [x['(a+b)'],     x['(c+d)'],                         ], false);
  x['(a+b+c)+d']   = new CompositeSegmentExpression('(a+b+c)+d',   [x['(a+b+c)'],   x['d'],                             ], false);
  x['((a+b)+c)+d'] = new CompositeSegmentExpression('((a+b)+c)+d', [x['((a+b)+c)'], x['d'],                             ], false);
  x['(a+(b+c))+d'] = new CompositeSegmentExpression('(a+(b+c))+d', [x['(a+(b+c))'], x['d'],                             ], false);
  x['a+(b+c+d)']   = new CompositeSegmentExpression('a+(b+c+d)',   [x['a'],         x['(b+c+d)'],                       ], false);
  x['a+((b+c)+d)'] = new CompositeSegmentExpression('a+((b+c)+d)', [x['a'],         x['((b+c)+d)'],                     ], false);
  x['a+(b+(c+d))'] = new CompositeSegmentExpression('a+(b+(c+d))', [x['a'],         x['(b+(c+d))'],                     ], false);

  x['a/b+c+d']     = new CompositeSegmentExpression('a/b+c+d',     [x['a/b'],       x['c'],         x['d'],             ], false);
  x['(a/b)+c+d']   = new CompositeSegmentExpression('(a/b)+c+d',   [x['(a/b)'],     x['c'],         x['d'],             ], false);
  x['a/(b+c)+d']   = new CompositeSegmentExpression('a/(b+c)+d',   [x['a/(b+c)'],   x['d'],                             ], false);
  x['a/b+(c+d)']   = new CompositeSegmentExpression('a/b+(c+d)',   [x['a/b'],       x['(c+d)'],                         ], false);
  x['(a/b)+(c+d)'] = new CompositeSegmentExpression('(a/b)+(c+d)', [x['(a/b)'],     x['(c+d)'],                         ], false);
  x['(a/b+c)+d']   = new CompositeSegmentExpression('(a/b+c)+d',   [x['(a/b+c)'],   x['d'],                             ], false);
  x['((a/b)+c)+d'] = new CompositeSegmentExpression('((a/b)+c)+d', [x['((a/b)+c)'], x['d'],                             ], false);
  x['(a/(b+c))+d'] = new CompositeSegmentExpression('(a/(b+c))+d', [x['(a/(b+c))'], x['d'],                             ], false);

  x['a+b/c+d']     = new CompositeSegmentExpression('a+b/c+d',     [x['a'],         x['b/c'],       x['d'],             ], false);
  x['(a+b)/c+d']   = new CompositeSegmentExpression('(a+b)/c+d',   [x['(a+b)/c'],   x['d'],                             ], false);
  x['a+(b/c)+d']   = new CompositeSegmentExpression('a+(b/c)+d',   [x['a'],         x['(b/c)'],     x['d'],             ], false);
  x['a+b/(c+d)']   = new CompositeSegmentExpression('a+b/(c+d)',   [x['a'],         x['b/(c+d)'],                       ], false);
  x['(a+b/c)+d']   = new CompositeSegmentExpression('(a+b/c)+d',   [x['(a+b/c)'],   x['d'],                             ], false);
  x['((a+b)/c)+d'] = new CompositeSegmentExpression('((a+b)/c)+d', [x['((a+b)/c)'], x['d'],                             ], false);
  x['(a+(b/c))+d'] = new CompositeSegmentExpression('(a+(b/c))+d', [x['(a+(b/c))'], x['d'],                             ], false);
  x['a+(b/c+d)']   = new CompositeSegmentExpression('a+(b/c+d)',   [x['a'],         x['(b/c+d)'],                       ], false);
  x['a+((b/c)+d)'] = new CompositeSegmentExpression('a+((b/c)+d)', [x['a'],         x['((b/c)+d)'],                     ], false);
  x['a+(b/(c+d))'] = new CompositeSegmentExpression('a+(b/(c+d))', [x['a'],         x['(b/(c+d))'],                     ], false);

  x['a+b+c/d']     = new CompositeSegmentExpression('a+b+c/d',     [x['a'],         x['b'],         x['c/d'],           ], false);
  x['(a+b)+c/d']   = new CompositeSegmentExpression('(a+b)+c/d',   [x['(a+b)'],     x['c/d'],                           ], false);
  x['a+(b+c)/d']   = new CompositeSegmentExpression('a+(b+c)/d',   [x['a'],         x['(b+c)/d'],                       ], false);
  x['a+b+(c/d)']   = new CompositeSegmentExpression('a+b+(c/d)',   [x['a'],         x['b'],         x['(c/d)'],         ], false);
  x['(a+b)+(c/d)'] = new CompositeSegmentExpression('(a+b)+(c/d)', [x['(a+b)'],     x['(c/d)'],                         ], false);
  x['a+(b+c/d)']   = new CompositeSegmentExpression('a+(b+c/d)',   [x['a'],         x['(b+c/d)'],                       ], false);
  x['a+((b+c)/d)'] = new CompositeSegmentExpression('a+((b+c)/d)', [x['a'],         x['((b+c)/d)'],                     ], false);
  x['a+(b+(c/d))'] = new CompositeSegmentExpression('a+(b+(c/d))', [x['a'],         x['(b+(c/d))'],                     ], false);

  x['a/b+c/d']     = new CompositeSegmentExpression('a/b+c/d',     [x['a/b'],       x['c/d'],       ], false);
  x['(a/b)+c/d']   = new CompositeSegmentExpression('(a/b)+c/d',   [x['(a/b)'],     x['c/d'],       ], false);
  x['a/b+(c/d)']   = new CompositeSegmentExpression('a/b+(c/d)',   [x['a/b'],       x['(c/d)'],     ], false);
  x['(a/b)+(c/d)'] = new CompositeSegmentExpression('(a/b)+(c/d)', [x['(a/b)'],     x['(c/d)'],     ], false);

  x['a/b/c+d']     = new CompositeSegmentExpression('a/b/c+d',     [x['a/b/c'],     x['d'],         ], false);
  x['(a/b)/c+d']   = new CompositeSegmentExpression('(a/b)/c+d',   [x['(a/b)/c'],   x['d'],         ], false);
  x['a/(b/c)+d']   = new CompositeSegmentExpression('a/(b/c)+d',   [x['a/(b/c)'],   x['d'],         ], false);
  x['(a/b/c)+d']   = new CompositeSegmentExpression('(a/b/c)+d',   [x['(a/b/c)'],   x['d'],         ], false);
  x['((a/b)/c)+d'] = new CompositeSegmentExpression('((a/b)/c)+d', [x['((a/b)/c)'], x['d'],         ], false);
  x['(a/(b/c))+d'] = new CompositeSegmentExpression('(a/(b/c))+d', [x['(a/(b/c))'], x['d'],         ], false);

  x['a+b/c/d']     = new CompositeSegmentExpression('a+b/c/d',     [x['a'],         x['b/c/d'],     ], false);
  x['a+(b/c)/d']   = new CompositeSegmentExpression('a+(b/c)/d',   [x['a'],         x['(b/c)/d'],   ], false);
  x['a+b/(c/d)']   = new CompositeSegmentExpression('a+b/(c/d)',   [x['a'],         x['b/(c/d)'],   ], false);
  x['a+(b/c/d)']   = new CompositeSegmentExpression('a+(b/c/d)',   [x['a'],         x['(b/c/d)'],   ], false);
  x['a+((b/c)/d)'] = new CompositeSegmentExpression('a+((b/c)/d)', [x['a'],         x['((b/c)/d)'], ], false);
  x['a+(b/(c/d))'] = new CompositeSegmentExpression('a+(b/(c/d))', [x['a'],         x['(b/(c/d))'], ], false);

  x['a/b/c/d']     = new ScopedSegmentExpression('a/b/c/d',     x['a'],         x['b/c/d']);
  x['(a/b)/c/d']   = new ScopedSegmentExpression('(a/b)/c/d',   x['(a/b)'],     x['c/d']);
  x['a/(b/c)/d']   = new ScopedSegmentExpression('a/(b/c)/d',   x['a'],         x['(b/c)/d']);
  x['a/b/(c/d)']   = new ScopedSegmentExpression('a/b/(c/d)',   x['a'],         x['b/(c/d)']);
  x['(a/b)/(c/d)'] = new ScopedSegmentExpression('(a/b)/(c/d)', x['(a/b)'],     x['(c/d)']);
  x['(a/b/c)/d']   = new ScopedSegmentExpression('(a/b/c)/d',   x['(a/b/c)'],   x['d']);
  x['((a/b)/c)/d'] = new ScopedSegmentExpression('((a/b)/c)/d', x['((a/b)/c)'], x['d']);
  x['(a/(b/c))/d'] = new ScopedSegmentExpression('(a/(b/c))/d', x['(a/(b/c))'], x['d']);
  x['a/(b/c/d)']   = new ScopedSegmentExpression('a/(b/c/d)',   x['a'],         x['(b/c/d)']);
  x['a/((b/c)/d)'] = new ScopedSegmentExpression('a/((b/c)/d)', x['a'],         x['((b/c)/d)']);
  x['a/(b/(c/d))'] = new ScopedSegmentExpression('a/(b/(c/d))', x['a'],         x['(b/(c/d))']);

  x['(a+b)/c/d']   = new ScopedSegmentExpression('(a+b)/c/d',   x['(a+b)'],     x['c/d']);
  x['(a+b)/(c/d)'] = new ScopedSegmentExpression('(a+b)/(c/d)', x['(a+b)'],     x['(c/d)']);
  x['(a+b/c)/d']   = new ScopedSegmentExpression('(a+b/c)/d',   x['(a+b/c)'],   x['d']);
  x['((a+b)/c)/d'] = new ScopedSegmentExpression('((a+b)/c)/d', x['((a+b)/c)'], x['d']);
  x['(a+(b/c))/d'] = new ScopedSegmentExpression('(a+(b/c))/d', x['(a+(b/c))'], x['d']);

  x['a/(b+c)/d']   = new ScopedSegmentExpression('a/(b+c)/d',   x['a'],         x['(b+c)/d']);
  x['(a/b+c)/d']   = new ScopedSegmentExpression('(a/b+c)/d',   x['(a/b+c)'],   x['d']);
  x['((a/b)+c)/d'] = new ScopedSegmentExpression('((a/b)+c)/d', x['((a/b)+c)'], x['d']);
  x['(a/(b+c))/d'] = new ScopedSegmentExpression('(a/(b+c))/d', x['(a/(b+c))'], x['d']);
  x['a/(b+c/d)']   = new ScopedSegmentExpression('a/(b+c/d)',   x['a'],         x['(b+c/d)']);
  x['a/((b+c)/d)'] = new ScopedSegmentExpression('a/((b+c)/d)', x['a'],         x['((b+c)/d)']);
  x['a/(b+(c/d))'] = new ScopedSegmentExpression('a/(b+(c/d))', x['a'],         x['(b+(c/d))']);

  x['a/b/(c+d)']   = new ScopedSegmentExpression('a/b/(c+d)',   x['a'],         x['b/(c+d)']);
  x['(a/b)/(c+d)'] = new ScopedSegmentExpression('(a/b)/(c+d)', x['(a/b)'],     x['(c+d)']);
  x['a/(b/c+d)']   = new ScopedSegmentExpression('a/(b/c+d)',   x['a'],         x['(b/c+d)']);
  x['a/((b/c)+d)'] = new ScopedSegmentExpression('a/((b/c)+d)', x['a'],         x['((b/c)+d)']);
  x['a/(b/(c+d))'] = new ScopedSegmentExpression('a/(b/(c+d))', x['a'],         x['(b/(c+d))']);

  x['(a+b)/(c+d)'] = new ScopedSegmentExpression('(a+b)/(c+d)', x['(a+b)'],     x['(c+d)']);

  x['(a+b+c)/d']   = new ScopedSegmentExpression('(a+b+c)/d',   x['(a+b+c)'],   x['d']);
  x['((a+b)+c)/d'] = new ScopedSegmentExpression('((a+b)+c)/d', x['((a+b)+c)'], x['d']);
  x['(a+(b+c))/d'] = new ScopedSegmentExpression('(a+(b+c))/d', x['(a+(b+c))'], x['d']);

  x['a/(b+c+d)']   = new ScopedSegmentExpression('a/(b+c+d)',   x['a'],         x['(b+c+d)']);
  x['a/((b+c)+d)'] = new ScopedSegmentExpression('a/((b+c)+d)', x['a'],         x['((b+c)+d)']);
  x['a/(b+(c+d))'] = new ScopedSegmentExpression('a/(b+(c+d))', x['a'],         x['(b+(c+d))']);

  for (const path in x) {
    const route = x[path];
    specs[`/${route.raw}`] = new RouteExpression(`/${route.raw}`, true, route, emptyObject, null, false);
  }

  for (const path in specs) {
    const expected = specs[path];
    it(path, function () {
      const actual = RouteExpression.parse(path, false);
      assert.deepStrictEqual(actual, expected);
    });
  }

  for (const path of ['/', ...terminal.map(t => `/${t}`)]) {
    it(`throws on empty component name '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(path, false);
        },
        regex(`Expected component name`),
      );
    });
  }

  for (const path of ['/a.', ...terminal.map(t => `/a.${t}`)]) {
    it(`throws on empty method name '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(path, false);
        },
        regex(`Expected method name`),
      );
    });
  }

  for (const path of ['/a@', ...terminal.map(t => `/a@${t}`)]) {
    it(`throws on empty viewport name '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(path, false);
        },
        regex(`Expected viewport name`),
      );
    });
  }

  for (const path of ['/a(', '/a.x(', ...terminal.flatMap(t => [`/a(${t}`, `/a.x(${t}`])]) {
    it(`throws on empty parameter key '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(path, false);
        },
        regex(`Expected parameter key`),
      );
    });
  }

  for (const path of ['/a(1=', '/a.x(1=', ...terminal.flatMap(t => [`/a(1=${t}`, `/a.x(1=${t}`])]) {
    it(`throws on empty parameter value '${path}'`, function () {
      assert.throws(
        function () {
          RouteExpression.parse(path, false);
        },
        regex(`Expected parameter value`),
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
        regex(`Expected ')'`),
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
        regex(`Unexpected '${path.slice(-1)}'`),
      );
    });
  }
});

function regex(str: string): RegExp {
  return new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}
