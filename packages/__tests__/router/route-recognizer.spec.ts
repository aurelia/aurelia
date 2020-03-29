import { ConfigurableRoute, Endpoint, RecognizedRoute, RouteRecognizer } from '@aurelia/route-recognizer';
import { assert } from '@aurelia/testing';

describe(RouteRecognizer.name, function () {
  interface QuerySpec {
    keyValuePairs: [string, string][];
    queryParams: Record<string, string>;
    queryString: string;
  }

  interface RecognizeSpec {
    routes: string[];
    tests: [string, string | null, Record<string, string> | null][];
  }

  const querySpecs: QuerySpec[] = [
    {
      keyValuePairs: [],
      queryParams: {},
      queryString: ''
    },
  ];

  const recognizeSpecs: RecognizeSpec[] = [
    // #region 1-depth static routes
    {
      routes: [
        'a',
      ],
      tests: [
        ['',   null, null],
        ['a',  'a',  null],
        ['b',  null, null],
        ['aa', null, null],
      ],
    },
    {
      routes: [
        'aa',
      ],
      tests: [
        ['',    null, null],
        ['a',   null, null],
        ['aa',  'aa', null],
        ['ab',  null, null],
        ['ba',  null, null],
        ['aaa', null, null],
      ],
    },
    {
      routes: [
        'aaa',
      ],
      tests: [
        ['',     null,  null],
        ['a',    null,  null],
        ['aa',   null,  null],
        ['aaa',  'aaa', null],
        ['aab',  null,  null],
        ['baa',  null,  null],
        ['aba',  null,  null],
        ['aaaa', null,  null],
      ],
    },
    {
      routes: [
        'a',
        'aa',
      ],
      tests: [
        ['',    null, null],
        ['a',   'a',  null],
        ['aa',  'aa', null],
        ['aaa', null, null],
      ],
    },
    {
      routes: [
        'a',
        'aaa',
      ],
      tests: [
        ['',     null,  null],
        ['a',    'a',   null],
        ['aa',   null,  null],
        ['aaa',  'aaa', null],
        ['aaaa', null,  null],
      ],
    },
    {
      routes: [
        'aa',
        'aaa',
      ],
      tests: [
        ['',     null,  null],
        ['a',    null,  null],
        ['aa',   'aa',  null],
        ['aaa',  'aaa', null],
        ['aaaa', null,  null],
      ],
    },
    {
      routes: [
        'a',
        'aa',
        'aaa',
      ],
      tests: [
        ['',     null,  null],
        ['a',    'a',   null],
        ['aa',   'aa',  null],
        ['aaa',  'aaa', null],
        ['aaaa', null,  null],
      ],
    },
    // #endregion
    // #region 2-depth static routes
    {
      routes: [
        'a/a',
      ],
      tests: [
        ['',    null,  null],
        ['a',   null,  null],
        ['aa',  null,  null],
        ['aaa', null,  null],
        ['a/a', 'a/a', null],
        ['a/b', null,  null],
        ['b/a', null,  null],
      ],
    },
    {
      routes: [
        'aa/a',
      ],
      tests: [
        ['',      null,   null],
        ['a',     null,   null],
        ['aa',    null,   null],
        ['aaa',   null,   null],
        ['aaaa',  null,   null],
        ['a/a',   null,   null],
        ['aa/a',  'aa/a', null],
        ['a/aa',  null,   null],
      ],
    },
    {
      routes: [
        'a/aa',
      ],
      tests: [
        ['',     null,   null],
        ['a',    null,   null],
        ['aa',   null,   null],
        ['aaa',  null,   null],
        ['aaaa', null,   null],
        ['a/a',  null,   null],
        ['aa/a', null,   null],
        ['a/aa', 'a/aa', null],
      ],
    },
    {
      routes: [
        'aa/aa',
      ],
      tests: [
        ['',      null,    null],
        ['a',     null,    null],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['aaaa',  null,    null],
        ['aaaaa', null,    null],
        ['a/a',   null,    null],
        ['aa/a',  null,    null],
        ['a/aa',  null,    null],
        ['aa/aa', 'aa/aa', null],
      ],
    },
    {
      routes: [
        'a/a',
        'aa/a',
      ],
      tests: [
        ['',      null,   null],
        ['a',     null,   null],
        ['aa',    null,   null],
        ['aaa',   null,   null],
        ['aaaa',  null,   null],
        ['a/a',   'a/a',  null],
        ['aa/a',  'aa/a', null],
        ['a/aa',  null,   null],
      ],
    },
    {
      routes: [
        'a/a',
        'a/aa',
      ],
      tests: [
        ['',      null,   null],
        ['a',     null,   null],
        ['aa',    null,   null],
        ['aaa',   null,   null],
        ['aaaa',  null,   null],
        ['a/a',   'a/a',  null],
        ['aa/a',  null,   null],
        ['a/aa',  'a/aa', null],
      ],
    },
    {
      routes: [
        'a/a',
        'aa/aa',
      ],
      tests: [
        ['',      null,    null],
        ['a',     null,    null],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['aaaa',  null,    null],
        ['aaaaa', null,    null],
        ['a/a',   'a/a',   null],
        ['aa/a',  null,    null],
        ['a/aa',  null,    null],
        ['aa/aa', 'aa/aa', null],
      ],
    },
    {
      routes: [
        'a/a',
        'aa/a',
        'aa/aa',
      ],
      tests: [
        ['',      null,    null],
        ['a',     null,    null],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['aaaa',  null,    null],
        ['aaaaa', null,    null],
        ['a/a',   'a/a',   null],
        ['aa/a',  'aa/a',  null],
        ['a/aa',  null,    null],
        ['aa/aa', 'aa/aa', null],
      ],
    },
    {
      routes: [
        'a/a',
        'a/aa',
        'aa/aa',
      ],
      tests: [
        ['',      null,    null],
        ['a',     null,    null],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['aaaa',  null,    null],
        ['aaaaa', null,    null],
        ['a/a',   'a/a',   null],
        ['aa/a',  null,    null],
        ['a/aa',  'a/aa',  null],
        ['aa/aa', 'aa/aa', null],
      ],
    },
    {
      routes: [
        'a/a',
        'aa/a',
        'a/aa',
        'aa/aa',
      ],
      tests: [
        ['',      null,    null],
        ['a',     null,    null],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['aaaa',  null,    null],
        ['aaaaa', null,    null],
        ['a/a',   'a/a',   null],
        ['aa/a',  'aa/a',  null],
        ['a/aa',  'a/aa',  null],
        ['aa/aa', 'aa/aa', null],
      ],
    },
    // #endregion
    // #region mixed 1,2-depth static routes
    {
      routes: [
        'a',
        'aa',
        'aaa',
        'a/a',
      ],
      tests: [
        ['',    null,  null],
        ['a',   'a',   null],
        ['aa',  'aa',  null],
        ['aaa', 'aaa', null],
        ['a/a', 'a/a', null],
      ],
    },
    {
      routes: [
        'a',
        'aa',
        'aaa',
        'aa/a',
      ],
      tests: [
        ['',      null,   null],
        ['a',     'a',    null],
        ['aa',    'aa',   null],
        ['aaa',   'aaa',  null],
        ['aaaa',  null,   null],
        ['a/a',   null,   null],
        ['aa/a',  'aa/a', null],
        ['a/aa',  null,   null],
      ],
    },
    {
      routes: [
        'a',
        'aa',
        'aaa',
        'a/aa',
      ],
      tests: [
        ['',     null,   null],
        ['a',    'a',    null],
        ['aa',   'aa',   null],
        ['aaa',  'aaa',  null],
        ['aaaa', null,   null],
        ['a/a',  null,   null],
        ['aa/a', null,   null],
        ['a/aa', 'a/aa', null],
      ],
    },
    {
      routes: [
        'a',
        'aa',
        'aaa',
        'aa/aa',
      ],
      tests: [
        ['',      null,    null],
        ['a',     'a',     null],
        ['aa',    'aa',    null],
        ['aaa',   'aaa',   null],
        ['aaaa',  null,    null],
        ['aaaaa', null,    null],
        ['a/a',   null,    null],
        ['aa/a',  null,    null],
        ['a/aa',  null,    null],
        ['aa/aa', 'aa/aa', null],
      ],
    },
    {
      routes: [
        'a',
        'aa',
        'aaa',
        'a/a',
        'aa/a',
      ],
      tests: [
        ['',      null,   null],
        ['a',     'a',    null],
        ['aa',    'aa',   null],
        ['aaa',   'aaa',  null],
        ['aaaa',  null,   null],
        ['a/a',   'a/a',  null],
        ['aa/a',  'aa/a', null],
        ['a/aa',  null,   null],
      ],
    },
    {
      routes: [
        'a',
        'aa',
        'aaa',
        'a/a',
        'a/aa',
      ],
      tests: [
        ['',      null,   null],
        ['a',     'a',    null],
        ['aa',    'aa',   null],
        ['aaa',   'aaa',  null],
        ['aaaa',  null,   null],
        ['a/a',   'a/a',  null],
        ['aa/a',  null,   null],
        ['a/aa',  'a/aa', null],
      ],
    },
    {
      routes: [
        'a',
        'aa',
        'aaa',
        'a/a',
        'aa/aa',
      ],
      tests: [
        ['',      null,    null],
        ['a',     'a',     null],
        ['aa',    'aa',    null],
        ['aaa',   'aaa',   null],
        ['aaaa',  null,    null],
        ['aaaaa', null,    null],
        ['a/a',   'a/a',   null],
        ['aa/a',  null,    null],
        ['a/aa',  null,    null],
        ['aa/aa', 'aa/aa', null],
      ],
    },
    {
      routes: [
        'a',
        'aa',
        'aaa',
        'a/a',
        'aa/a',
        'aa/aa',
      ],
      tests: [
        ['',      null,    null],
        ['a',     'a',     null],
        ['aa',    'aa',    null],
        ['aaa',   'aaa',   null],
        ['aaaa',  null,    null],
        ['aaaaa', null,    null],
        ['a/a',   'a/a',   null],
        ['aa/a',  'aa/a',  null],
        ['a/aa',  null,    null],
        ['aa/aa', 'aa/aa', null],
      ],
    },
    {
      routes: [
        'a',
        'aa',
        'aaa',
        'a/a',
        'a/aa',
        'aa/aa',
      ],
      tests: [
        ['',      null,    null],
        ['a',     'a',     null],
        ['aa',    'aa',    null],
        ['aaa',   'aaa',   null],
        ['aaaa',  null,    null],
        ['aaaaa', null,    null],
        ['a/a',   'a/a',   null],
        ['aa/a',  null,    null],
        ['a/aa',  'a/aa',  null],
        ['aa/aa', 'aa/aa', null],
      ],
    },
    {
      routes: [
        'a',
        'aa',
        'aaa',
        'a/a',
        'aa/a',
        'a/aa',
        'aa/aa',
      ],
      tests: [
        ['',      null,    null],
        ['a',     'a',     null],
        ['aa',    'aa',    null],
        ['aaa',   'aaa',   null],
        ['aaaa',  null,    null],
        ['aaaaa', null,    null],
        ['a/a',   'a/a',   null],
        ['aa/a',  'aa/a',  null],
        ['a/aa',  'a/aa',  null],
        ['aa/aa', 'aa/aa', null],
      ],
    },
    // #endregion
    // #region 1-depth dynamic routes
    {
      routes: [
        ':1',
      ],
      tests: [
        ['',    null, null],
        ['a',   ':1', { 1: 'a' }],
        ['b',   ':1', { 1: 'b' }],
        ['aa',  ':1', { 1: 'aa' }],
        ['a/a', null, null],
      ],
    },
    {
      routes: [
        ':1',
        'a',
      ],
      tests: [
        ['',    null, null],
        ['a',   'a',  null],
        ['b',   ':1', { 1: 'b' }],
        ['aa',  ':1', { 1: 'aa' }],
        ['a/a', null, null],
      ],
    },
    {
      routes: [
        ':1',
        'a',
        'aa',
      ],
      tests: [
        ['',    null, null],
        ['a',   'a',  null],
        ['b',   ':1', { 1: 'b' }],
        ['aa',  'aa', null],
        ['aaa', ':1', { 1: 'aaa' }],
        ['a/a', null, null],
      ],
    },
    {
      routes: [
        ':1',
        'a',
        'aaa',
      ],
      tests: [
        ['',     null,  null],
        ['a',    'a',   null],
        ['aa',   ':1',  { 1: 'aa' }],
        ['aaa',  'aaa', null],
        ['aaaa', ':1',  { 1: 'aaaa' }],
        ['a/a',  null,  null],
      ],
    },
    {
      routes: [
        ':1',
        'aa',
        'aaa',
      ],
      tests: [
        ['',     null,  null],
        ['a',    ':1',  { 1: 'a' }],
        ['aa',   'aa',  null],
        ['aaa',  'aaa', null],
        ['aaaa', ':1',  { 1: 'aaaa' }],
        ['a/a',  null,  null],
      ],
    },
    {
      routes: [
        ':1',
        'a',
        'aa',
        'aaa',
      ],
      tests: [
        ['',     null,  null],
        ['a',    'a',   null],
        ['aa',   'aa',  null],
        ['aaa',  'aaa', null],
        ['aaaa', ':1',  { 1: 'aaaa' }],
        ['a/a',  null,  null],
      ],
    },
    // #endregion
    // #region 2-depth dynamic routes
    // d/s
    {
      routes: [
        ':1/a',
        'a/a',
      ],
      tests: [
        ['',      null,   null],
        ['a',     null,   null],
        ['aa',    null,   null],
        ['aaa',   null,   null],
        ['a/a',   'a/a',  null],
        ['a/aa',  null,   null],
        ['aa/a',  ':1/a', { 1: 'aa' }],
        ['aa/aa', null,   null],
        ['a/a/a', null,   null],
      ],
    },
    {
      routes: [
        ':1/a',
        'a/a',
        'aa/a',
      ],
      tests: [
        ['',      null,   null],
        ['a',     null,   null],
        ['aa',    null,   null],
        ['aaa',   null,   null],
        ['a/a',   'a/a',  null],
        ['a/aa',  null,   null],
        ['aa/a',  'aa/a', null],
        ['aaa/a', ':1/a', { 1: 'aaa' }],
        ['aa/aa', null,   null],
        ['a/a/a', null,   null],
      ],
    },
    // s/d
    {
      routes: [
        'a/:2',
        'a/a',
      ],
      tests: [
        ['',      null,   null],
        ['a',     null,   null],
        ['aa',    null,   null],
        ['aaa',   null,   null],
        ['a/a',   'a/a',  null],
        ['a/aa',  'a/:2', { 2: 'aa' }],
        ['aa/a',  null,   null],
        ['aa/aa', null,   null],
        ['a/a/a', null,   null],
      ],
    },
    {
      routes: [
        'a/:2',
        'a/a',
        'a/aa',
      ],
      tests: [
        ['',      null,   null],
        ['a',     null,   null],
        ['aa',    null,   null],
        ['aaa',   null,   null],
        ['a/a',   'a/a',  null],
        ['a/aa',  'a/aa', null],
        ['a/aaa', 'a/:2', { 2: 'aaa' }],
        ['aa/a',  null,   null],
        ['aa/aa', null,   null],
        ['a/a/a', null,   null],
      ],
    },
    // d/s + s/d
    {
      routes: [
        ':1/a',
        'a/:2',
        'a/a',
      ],
      tests: [
        ['',      null,   null],
        ['a',     null,   null],
        ['aa',    null,   null],
        ['aaa',   null,   null],
        ['a/a',   'a/a',  null],
        ['a/aa',  'a/:2', { 2: 'aa' }],
        ['aa/a',  ':1/a', { 1: 'aa' }],
        ['a/a/a', null,   null],
      ],
    },
    {
      routes: [
        ':1/a',
        'a/:2',
        'a/a',
        'aa/a',
      ],
      tests: [
        ['',      null,   null],
        ['a',     null,   null],
        ['aa',    null,   null],
        ['aaa',   null,   null],
        ['a/a',   'a/a',  null],
        ['a/aa',  'a/:2', { 2: 'aa' }],
        ['aa/a',  'aa/a', null],
        ['aaa/a', ':1/a', { 1: 'aaa' }],
        ['a/a/a', null,   null],
      ],
    },
    {
      routes: [
        ':1/a',
        'a/:2',
        'a/a',
        'a/aa',
      ],
      tests: [
        ['',      null,   null],
        ['a',     null,   null],
        ['aa',    null,   null],
        ['aaa',   null,   null],
        ['a/a',   'a/a',  null],
        ['a/aa',  'a/aa', null],
        ['a/aaa', 'a/:2', { 2: 'aaa' }],
        ['aa/a',  ':1/a', { 1: 'aa' }],
        ['a/a/a', null,   null],
      ],
    },
    {
      routes: [
        ':1/a',
        'a/:2',
        'a/a',
        'a/aa',
        'aa/a',
      ],
      tests: [
        ['',      null,   null],
        ['a',     null,   null],
        ['aa',    null,   null],
        ['aaa',   null,   null],
        ['a/a',   'a/a',  null],
        ['a/aa',  'a/aa', null],
        ['a/aaa', 'a/:2', { 2: 'aaa' }],
        ['aa/a',  'aa/a', null],
        ['aaa/a', ':1/a', { 1: 'aaa' }],
        ['a/a/a', null,   null],
      ],
    },
    // d/d + d/s + s/s
    {
      routes: [
        ':1/:2',
        ':1/a',
        'a/a',
      ],
      tests: [
        ['',      null,    null],
        ['a',     null,    null],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  ':1/:2', { 1: 'a', 2: 'aa' }],
        ['aa/a',  ':1/a',  { 1: 'aa' }],
        ['aa/aa', ':1/:2', { 1: 'aa', 2: 'aa' }],
        ['a/a/a', null,    null],
      ],
    },
    // d/d + d/s*2 + s/s
    {
      routes: [
        ':1/:2',
        ':1/a',
        ':1/aa',
        'a/a',
      ],
      tests: [
        ['',       null,    null],
        ['a',      null,    null],
        ['aa',     null,    null],
        ['aaa',    null,    null],
        ['a/a',    'a/a',   null],
        ['a/aa',   ':1/aa', { 1: 'a' }],
        ['a/aaa',  ':1/:2', { 1: 'a', 2: 'aaa' }],
        ['aa/a',   ':1/a',  { 1: 'aa' }],
        ['aa/aa',  ':1/aa', { 1: 'aa' }],
        ['aa/aaa', ':1/:2', { 1: 'aa', 2: 'aaa' }],
        ['a/a/a',  null,    null],
      ],
    },
    // d/d + d/s + s/s*2
    {
      routes: [
        ':1/:2',
        ':1/a',
        'a/a',
        'aa/a',
      ],
      tests: [
        ['',      null,    null],
        ['a',     null,    null],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  ':1/:2', { 1: 'a', 2: 'aa' }],
        ['aa/a',  'aa/a',  null],
        ['aaa/a', ':1/a',  { 1: 'aaa' }],
        ['aa/aa', ':1/:2', { 1: 'aa', 2: 'aa' }],
        ['a/a/a', null,    null],
      ],
    },
    // d/d + d/s*2 + s/s*2
    {
      routes: [
        ':1/:2',
        ':1/a',
        ':1/aa',
        'a/a',
        'aa/a',
      ],
      tests: [
        ['',       null,    null],
        ['a',      null,    null],
        ['aa',     null,    null],
        ['aaa',    null,    null],
        ['a/a',    'a/a',   null],
        ['a/aa',   ':1/aa', { 1: 'a' }],
        ['a/aaa',  ':1/:2', { 1: 'a', 2: 'aaa' }],
        ['aa/a',   'aa/a',  null],
        ['aaa/a',  ':1/a',  { 1: 'aaa' }],
        ['aa/aa',  ':1/aa', { 1: 'aa' }],
        ['aa/aaa', ':1/:2', { 1: 'aa', 2: 'aaa' }],
        ['a/a/a',  null,    null],
      ],
    },
    // d/d + s/d + s/s
    {
      routes: [
        ':1/:2',
        'a/:2',
        'a/a',
      ],
      tests: [
        ['',      null,    null],
        ['a',     null,    null],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  'a/:2',  { 2: 'aa' }],
        ['aa/a',  ':1/:2', { 1: 'aa', 2: 'a' }],
        ['aa/aa', ':1/:2', { 1: 'aa', 2: 'aa' }],
        ['a/a/a', null,    null],
      ],
    },
    // d/d + s/d*2 + s/s
    {
      routes: [
        ':1/:2',
        'a/:2',
        'aa/:2',
        'a/a',
      ],
      tests: [
        ['',       null,    null],
        ['a',      null,    null],
        ['aa',     null,    null],
        ['aaa',    null,    null],
        ['a/a',    'a/a',   null],
        ['a/aa',   'a/:2',  { 2: 'aa' }],
        ['aa/a',   'aa/:2', { 2: 'a' }],
        ['aa/aa',  'aa/:2', { 2: 'aa' }],
        ['aaa/aa', ':1/:2', { 1: 'aaa', 2: 'aa' }],
        ['a/a/a',  null,    null],
      ],
    },
    // d/d + s/d + s/s*2
    {
      routes: [
        ':1/:2',
        'a/:2',
        'a/a',
        'a/aa',
      ],
      tests: [
        ['',      null,    null],
        ['a',     null,    null],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  'a/aa',  null],
        ['a/aaa', 'a/:2',  { 2: 'aaa' }],
        ['aa/a',  ':1/:2', { 1: 'aa', 2: 'a' }],
        ['aa/aa', ':1/:2', { 1: 'aa', 2: 'aa' }],
        ['a/a/a', null,    null],
      ],
    },
    // d/d + s/d*2 + s/s*2
    {
      routes: [
        ':1/:2',
        'a/:2',
        'aa/:2',
        'a/a',
        'a/aa',
      ],
      tests: [
        ['',       null,    null],
        ['a',      null,    null],
        ['aa',     null,    null],
        ['aaa',    null,    null],
        ['a/a',    'a/a',   null],
        ['a/aa',   'a/aa',  null],
        ['a/aaa',  'a/:2',  { 2: 'aaa' }],
        ['aa/a',   'aa/:2', { 2: 'a' }],
        ['aa/aa',  'aa/:2', { 2: 'aa' }],
        ['aaa/aa', ':1/:2', { 1: 'aaa', 2: 'aa' }],
        ['a/a/a',  null,    null],
      ],
    },
    // d/d + d/s + s/d + s/s
    {
      routes: [
        ':1/:2',
        ':1/a',
        'a/:2',
        'a/a',
      ],
      tests: [
        ['',      null,    null],
        ['a',     null,    null],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  'a/:2',  { 2: 'aa' }],
        ['aa/a',  ':1/a',  { 1: 'aa' }],
        ['aa/aa', ':1/:2', { 1: 'aa', 2: 'aa' }],
        ['a/a/a', null,    null],
      ],
    },
    // d/d + d/s*2 + s/d + s/s
    {
      routes: [
        ':1/:2',
        ':1/a',
        ':1/aa',
        'a/:2',
        'a/a',
      ],
      tests: [
        ['',       null,    null],
        ['a',      null,    null],
        ['aa',     null,    null],
        ['aaa',    null,    null],
        ['a/a',    'a/a',   null],
        ['a/aa',   'a/:2',  { 2: 'aa' }],
        ['aa/a',   ':1/a',  { 1: 'aa' }],
        ['aa/aa',  ':1/aa', { 1: 'aa' }],
        ['aa/aaa', ':1/:2', { 1: 'aa', 2: 'aaa' }],
        ['a/a/a',  null,    null],
      ],
    },
    // d/d + d/s + s/d*2 + s/s
    {
      routes: [
        ':1/:2',
        ':1/a',
        'a/:2',
        'aa/:2',
        'a/a',
      ],
      tests: [
        ['',       null,    null],
        ['a',      null,    null],
        ['aa',     null,    null],
        ['aaa',    null,    null],
        ['a/a',    'a/a',   null],
        ['a/aa',   'a/:2',  { 2: 'aa' }],
        ['aa/a',   'aa/:2', { 2: 'a' }],
        ['aa/aa',  'aa/:2', { 2: 'aa' }],
        ['aaa/aa', ':1/:2', { 1: 'aaa', 2: 'aa' }],
        ['a/a/a',  null,    null],
      ],
    },
    // d/d + d/s*2 + s/d*2 + s/s
    {
      routes: [
        ':1/:2',
        ':1/a',
        ':1/aa',
        'a/:2',
        'aa/:2',
        'a/a',
      ],
      tests: [
        ['',        null,    null],
        ['a',       null,    null],
        ['aa',      null,    null],
        ['aaa',     null,    null],
        ['a/a',     'a/a',   null],
        ['a/aa',    'a/:2',  { 2: 'aa' }],
        ['aa/a',    'aa/:2', { 2: 'a' }],
        ['aa/aa',   'aa/:2', { 2: 'aa' }],
        ['aa/aaa',  'aa/:2', { 2: 'aaa' }],
        ['aaa/aa',  ':1/aa', { 1: 'aaa' }],
        ['aaa/aaa', ':1/:2', { 1: 'aaa', 2: 'aaa' }],
        ['a/a/a',   null,    null],
      ],
    },
    // d/d + d/s + s/d + s/s*2 #1
    {
      routes: [
        ':1/:2',
        ':1/a',
        'a/:2',
        'a/a',
        'aa/a',
      ],
      tests: [
        ['',      null,    null],
        ['a',     null,    null],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  'a/:2',  { 2: 'aa' }],
        ['aa/a',  'aa/a',  null],
        ['aa/aa', ':1/:2', { 1: 'aa', 2: 'aa' }],
        ['aaa/a', ':1/a',  { 1: 'aaa' }],
        ['a/a/a', null,    null],
      ],
    },
    // d/d + d/s*2 + s/d + s/s*2 #1
    {
      routes: [
        ':1/:2',
        ':1/a',
        ':1/aa',
        'a/:2',
        'a/a',
        'aa/a',
      ],
      tests: [
        ['',       null,    null],
        ['a',      null,    null],
        ['aa',     null,    null],
        ['aaa',    null,    null],
        ['a/a',    'a/a',   null],
        ['a/aa',   'a/:2',  { 2: 'aa' }],
        ['aa/a',   'aa/a',  null],
        ['aa/aa',  ':1/aa', { 1: 'aa' }],
        ['aa/aaa', ':1/:2', { 1: 'aa', 2: 'aaa' }],
        ['aaa/a',  ':1/a',  { 1: 'aaa' }],
        ['a/a/a',  null,    null],
      ],
    },
    // d/d + d/s + s/d*2 + s/s*2 #1
    {
      routes: [
        ':1/:2',
        ':1/a',
        'a/:2',
        'aa/:2',
        'a/a',
        'aa/a',
      ],
      tests: [
        ['',       null,    null],
        ['a',      null,    null],
        ['aa',     null,    null],
        ['aaa',    null,    null],
        ['a/a',    'a/a',   null],
        ['a/aa',   'a/:2',  { 2: 'aa' }],
        ['aa/a',   'aa/a',  null],
        ['aa/aa',  'aa/:2', { 2: 'aa' }],
        ['aaa/a',  ':1/a',  { 1: 'aaa' }],
        ['aaa/aa', ':1/:2', { 1: 'aaa', 2: 'aa' }],
        ['a/a/a',  null,    null],
      ],
    },
    // d/d + d/s*2 + s/d*2 + s/s*2 #1
    {
      routes: [
        ':1/:2',
        ':1/a',
        ':1/aa',
        'a/:2',
        'aa/:2',
        'a/a',
        'aa/a',
      ],
      tests: [
        ['',        null,    null],
        ['a',       null,    null],
        ['aa',      null,    null],
        ['aaa',     null,    null],
        ['a/a',     'a/a',   null],
        ['a/aa',    'a/:2',  { 2: 'aa' }],
        ['aa/a',    'aa/a',  null],
        ['aa/aa',   'aa/:2', { 2: 'aa' }],
        ['aa/aaa',  'aa/:2', { 2: 'aaa' }],
        ['aaa/a',   ':1/a',  { 1: 'aaa' }],
        ['aaa/aa',  ':1/aa', { 1: 'aaa' }],
        ['aaa/aaa', ':1/:2', { 1: 'aaa', 2: 'aaa' }],
        ['a/a/a',   null,    null],
      ],
    },
    // d/d + d/s + s/d + s/s*2 #2
    {
      routes: [
        ':1/:2',
        ':1/a',
        'a/:2',
        'a/a',
        'a/aa',
      ],
      tests: [
        ['',      null,    null],
        ['a',     null,    null],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  'a/aa',  null],
        ['a/aaa', 'a/:2',  { 2: 'aaa' }],
        ['aa/a',  ':1/a',  { 1: 'aa' }],
        ['aa/aa', ':1/:2', { 1: 'aa', 2: 'aa' }],
        ['a/a/a', null,    null],
      ],
    },
    // d/d + d/s*2 + s/d + s/s*2 #2
    {
      routes: [
        ':1/:2',
        ':1/a',
        ':1/aa',
        'a/:2',
        'a/a',
        'a/aa',
      ],
      tests: [
        ['',       null,    null],
        ['a',      null,    null],
        ['aa',     null,    null],
        ['aaa',    null,    null],
        ['a/a',    'a/a',   null],
        ['a/aa',   'a/aa',  null],
        ['a/aaa',  'a/:2',  { 2: 'aaa' }],
        ['aa/a',   ':1/a',  { 1: 'aa' }],
        ['aa/aa',  ':1/aa', { 1: 'aa' }],
        ['aa/aaa', ':1/:2', { 1: 'aa', 2: 'aaa' }],
        ['a/a/a',  null,    null],
      ],
    },
    // d/d + d/s + s/d*2 + s/s*2 #2
    {
      routes: [
        ':1/:2',
        ':1/a',
        'a/:2',
        'aa/:2',
        'a/a',
        'a/aa',
      ],
      tests: [
        ['',       null,    null],
        ['a',      null,    null],
        ['aa',     null,    null],
        ['aaa',    null,    null],
        ['a/a',    'a/a',   null],
        ['a/aa',   'a/aa',  null],
        ['a/aaa',  'a/:2',  { 2: 'aaa' }],
        ['aa/a',   'aa/:2', { 2: 'a' }],
        ['aa/aa',  'aa/:2', { 2: 'aa' }],
        ['aaa/a',  ':1/a',  { 1: 'aaa' }],
        ['aaa/aa', ':1/:2', { 1: 'aaa', 2: 'aa' }],
        ['a/a/a',  null,    null],
      ],
    },
    // d/d + d/s*2 + s/d*2 + s/s*2 #2
    {
      routes: [
        ':1/:2',
        ':1/a',
        ':1/aa',
        'a/:2',
        'aa/:2',
        'a/a',
        'a/aa',
      ],
      tests: [
        ['',        null,    null],
        ['a',       null,    null],
        ['aa',      null,    null],
        ['aaa',     null,    null],
        ['a/a',     'a/a',   null],
        ['a/aa',    'a/aa',  null],
        ['a/aaa',   'a/:2',  { 2: 'aaa' }],
        ['aa/a',    'aa/:2', { 2: 'a' }],
        ['aa/aa',   'aa/:2', { 2: 'aa' }],
        ['aa/aaa',  'aa/:2', { 2: 'aaa' }],
        ['aaa/a',   ':1/a',  { 1: 'aaa' }],
        ['aaa/aa',  ':1/aa', { 1: 'aaa' }],
        ['aaa/aaa', ':1/:2', { 1: 'aaa', 2: 'aaa' }],
        ['a/a/a',   null,    null],
      ],
    },
    // d/d + d/s + s/d + s/s*3
    {
      routes: [
        ':1/:2',
        ':1/a',
        'a/:2',
        'a/a',
        'a/aa',
        'aa/a',
      ],
      tests: [
        ['',      null,    null],
        ['a',     null,    null],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  'a/aa',  null],
        ['a/aaa', 'a/:2',  { 2: 'aaa' }],
        ['aa/a',  'aa/a',  null],
        ['aa/aa', ':1/:2', { 1: 'aa', 2: 'aa' }],
        ['aaa/a', ':1/a',  { 1: 'aaa' }],
        ['a/a/a', null,    null],
      ],
    },
    // d/d + d/s*2 + s/d + s/s*3
    {
      routes: [
        ':1/:2',
        ':1/a',
        ':1/aa',
        'a/:2',
        'a/a',
        'a/aa',
        'aa/a',
      ],
      tests: [
        ['',       null,    null],
        ['a',      null,    null],
        ['aa',     null,    null],
        ['aaa',    null,    null],
        ['a/a',    'a/a',   null],
        ['a/aa',   'a/aa',  null],
        ['a/aaa',  'a/:2',  { 2: 'aaa' }],
        ['aa/a',   'aa/a',  null],
        ['aa/aa',  ':1/aa', { 1: 'aa' }],
        ['aa/aaa', ':1/:2', { 1: 'aa', 2: 'aaa' }],
        ['aaa/a',  ':1/a',  { 1: 'aaa' }],
        ['a/a/a',  null,    null],
      ],
    },
    // d/d + d/s + s/d*2 + s/s*3
    {
      routes: [
        ':1/:2',
        ':1/a',
        'a/:2',
        'aa/:2',
        'a/a',
        'a/aa',
        'aa/a',
      ],
      tests: [
        ['',       null,    null],
        ['a',      null,    null],
        ['aa',     null,    null],
        ['aaa',    null,    null],
        ['a/a',    'a/a',   null],
        ['a/aa',   'a/aa',  null],
        ['a/aaa',  'a/:2',  { 2: 'aaa' }],
        ['aa/a',   'aa/a',  null],
        ['aa/aa',  'aa/:2', { 2: 'aa' }],
        ['aaa/a',  ':1/a',  { 1: 'aaa' }],
        ['aaa/aa', ':1/:2', { 1: 'aaa', 2: 'aa' }],
        ['a/a/a',  null,    null],
      ],
    },
    // d/d + d/s*2 + s/d*2 + s/s*3
    {
      routes: [
        ':1/:2',
        ':1/a',
        ':1/aa',
        'a/:2',
        'aa/:2',
        'a/a',
        'a/aa',
        'aa/a',
      ],
      tests: [
        ['',        null,    null],
        ['a',       null,    null],
        ['aa',      null,    null],
        ['aaa',     null,    null],
        ['a/a',     'a/a',   null],
        ['a/aa',    'a/aa',  null],
        ['a/aaa',   'a/:2',  { 2: 'aaa' }],
        ['aa/a',    'aa/a',  null],
        ['aa/aa',   'aa/:2', { 2: 'aa' }],
        ['aa/aaa',  'aa/:2', { 2: 'aaa' }],
        ['aaa/a',   ':1/a',  { 1: 'aaa' }],
        ['aaa/aa',  ':1/aa', { 1: 'aaa' }],
        ['aaa/aaa', ':1/:2', { 1: 'aaa', 2: 'aaa' }],
        ['a/a/a',   null,    null],
      ],
    },
    // #endregion
    // #region 1-depth star routes
    {
      routes: [
        '*1',
      ],
      tests: [
        ['',      null, null],
        ['a',     '*1', { 1: 'a' }],
        ['aa',    '*1', { 1: 'aa' }],
        ['a/a',   '*1', { 1: 'a/a' }],
        ['aa/a',  '*1', { 1: 'aa/a' }],
        ['a/aa',  '*1', { 1: 'a/aa' }],
        ['aa/aa', '*1', { 1: 'aa/aa' }],
        ['a/a/a', '*1', { 1: 'a/a/a' }],
      ],
    },
    {
      routes: [
        '*1',
        'a',
      ],
      tests: [
        ['',      null, null],
        ['a',     'a',  null],
        ['aa',    '*1', { 1: 'aa' }],
        ['a/a',   '*1', { 1: 'a/a' }],
        ['aa/a',  '*1', { 1: 'aa/a' }],
        ['a/aa',  '*1', { 1: 'a/aa' }],
        ['aa/aa', '*1', { 1: 'aa/aa' }],
        ['a/a/a', '*1', { 1: 'a/a/a' }],
      ],
    },
    {
      routes: [
        '*1',
        'a',
        'aa',
      ],
      tests: [
        ['',      null, null],
        ['a',     'a',  null],
        ['aa',    'aa', null],
        ['aaa',   '*1', { 1: 'aaa' }],
        ['a/a',   '*1', { 1: 'a/a' }],
        ['aa/a',  '*1', { 1: 'aa/a' }],
        ['a/aa',  '*1', { 1: 'a/aa' }],
        ['aa/aa', '*1', { 1: 'aa/aa' }],
        ['a/a/a', '*1', { 1: 'a/a/a' }],
      ],
    },
    {
      routes: [
        '*1',
        'a',
        'aaa',
      ],
      tests: [
        ['',      null,  null],
        ['a',     'a',   null],
        ['aa',    '*1',  { 1: 'aa' }],
        ['aaa',   'aaa', null],
        ['aaaa',  '*1',  { 1: 'aaaa' }],
        ['a/a',   '*1',  { 1: 'a/a' }],
        ['aa/a',  '*1',  { 1: 'aa/a' }],
        ['a/aa',  '*1',  { 1: 'a/aa' }],
        ['aa/aa', '*1',  { 1: 'aa/aa' }],
        ['a/a/a', '*1',  { 1: 'a/a/a' }],
      ],
    },
    {
      routes: [
        '*1',
        'aa',
        'aaa',
      ],
      tests: [
        ['',      null,  null],
        ['a',     '*1',  { 1: 'a' }],
        ['aa',    'aa',  null],
        ['aaa',   'aaa', null],
        ['aaaa',  '*1',  { 1: 'aaaa' }],
        ['a/a',   '*1',  { 1: 'a/a' }],
        ['aa/a',  '*1',  { 1: 'aa/a' }],
        ['a/aa',  '*1',  { 1: 'a/aa' }],
        ['aa/aa', '*1',  { 1: 'aa/aa' }],
        ['a/a/a', '*1',  { 1: 'a/a/a' }],
      ],
    },
    {
      routes: [
        '*1',
        'a',
        'aa',
        'aaa',
      ],
      tests: [
        ['',      null,  null],
        ['a',     'a',   null],
        ['aa',    'aa',  null],
        ['aaa',   'aaa', null],
        ['aaaa',  '*1',  { 1: 'aaaa' }],
        ['a/a',   '*1',  { 1: 'a/a' }],
        ['aa/a',  '*1',  { 1: 'aa/a' }],
        ['a/aa',  '*1',  { 1: 'a/aa' }],
        ['aa/aa', '*1',  { 1: 'aa/aa' }],
        ['a/a/a', '*1',  { 1: 'a/a/a' }],
      ],
    },
    // #endregion
    // #region 1-depth star + dynamic routes
    {
      routes: [
        '*1',
        ':1',
      ],
      tests: [
        ['',      null, null],
        ['a',     ':1', { 1: 'a' }],
        ['aa',    ':1', { 1: 'aa' }],
        ['a/a',   '*1', { 1: 'a/a' }],
        ['aa/a',  '*1', { 1: 'aa/a' }],
        ['a/aa',  '*1', { 1: 'a/aa' }],
        ['aa/aa', '*1', { 1: 'aa/aa' }],
        ['a/a/a', '*1', { 1: 'a/a/a' }],
      ],
    },
    {
      routes: [
        '*1',
        ':1',
        'a',
      ],
      tests: [
        ['',      null, null],
        ['a',     'a',  null],
        ['aa',    ':1', { 1: 'aa' }],
        ['a/a',   '*1', { 1: 'a/a' }],
        ['aa/a',  '*1', { 1: 'aa/a' }],
        ['a/aa',  '*1', { 1: 'a/aa' }],
        ['aa/aa', '*1', { 1: 'aa/aa' }],
        ['a/a/a', '*1', { 1: 'a/a/a' }],
      ],
    },
    {
      routes: [
        '*1',
        ':1',
        'a',
        'aa',
      ],
      tests: [
        ['',      null, null],
        ['a',     'a',  null],
        ['aa',    'aa', null],
        ['aaa',   ':1', { 1: 'aaa' }],
        ['a/a',   '*1', { 1: 'a/a' }],
        ['aa/a',  '*1', { 1: 'aa/a' }],
        ['a/aa',  '*1', { 1: 'a/aa' }],
        ['aa/aa', '*1', { 1: 'aa/aa' }],
        ['a/a/a', '*1', { 1: 'a/a/a' }],
      ],
    },
    {
      routes: [
        '*1',
        ':1',
        'a',
        'aaa',
      ],
      tests: [
        ['',      null,  null],
        ['a',     'a',   null],
        ['aa',    ':1',  { 1: 'aa' }],
        ['aaa',   'aaa', null],
        ['aaaa',  ':1',  { 1: 'aaaa' }],
        ['a/a',   '*1',  { 1: 'a/a' }],
        ['aa/a',  '*1',  { 1: 'aa/a' }],
        ['a/aa',  '*1',  { 1: 'a/aa' }],
        ['aa/aa', '*1',  { 1: 'aa/aa' }],
        ['a/a/a', '*1',  { 1: 'a/a/a' }],
      ],
    },
    {
      routes: [
        '*1',
        ':1',
        'aa',
        'aaa',
      ],
      tests: [
        ['',      null,  null],
        ['a',     ':1',  { 1: 'a' }],
        ['aa',    'aa',  null],
        ['aaa',   'aaa', null],
        ['aaaa',  ':1',  { 1: 'aaaa' }],
        ['a/a',   '*1',  { 1: 'a/a' }],
        ['aa/a',  '*1',  { 1: 'aa/a' }],
        ['a/aa',  '*1',  { 1: 'a/aa' }],
        ['aa/aa', '*1',  { 1: 'aa/aa' }],
        ['a/a/a', '*1',  { 1: 'a/a/a' }],
      ],
    },
    {
      routes: [
        '*1',
        ':1',
        'a',
        'aa',
        'aaa',
      ],
      tests: [
        ['',      null,  null],
        ['a',     'a',   null],
        ['aa',    'aa',  null],
        ['aaa',   'aaa', null],
        ['aaaa',  ':1',  { 1: 'aaaa' }],
        ['a/a',   '*1',  { 1: 'a/a' }],
        ['aa/a',  '*1',  { 1: 'aa/a' }],
        ['a/aa',  '*1',  { 1: 'a/aa' }],
        ['aa/aa', '*1',  { 1: 'aa/aa' }],
        ['a/a/a', '*1',  { 1: 'a/a/a' }],
      ],
    },
    // #endregion
    // #region 2-depth dynamic routes
    // d/s
    {
      routes: [
        '*1/a',
      ],
      tests: [
        ['',       null,   null],
        ['a',      null,   null],
        ['aa',     null,   null],
        ['aaa',    null,   null],
        ['a/a',    '*1/a', { 1: 'a' }],
        ['a/aa',   null,   null],
        ['aa/a',   '*1/a', { 1: 'aa' }],
        ['aa/aa',  null,   null],
        ['a/a/a',  '*1/a', { 1: 'a/a' }],
        ['aa/a/a', '*1/a', { 1: 'aa/a' }],
        ['a/aa/a', '*1/a', { 1: 'a/aa' }],
        ['a/a/aa',  null,  null],
      ],
    },
    {
      routes: [
        '*1/a',
        'a/a',
      ],
      tests: [
        ['',       null,   null],
        ['a',      null,   null],
        ['aa',     null,   null],
        ['aaa',    null,   null],
        ['a/a',    'a/a',  null],
        ['a/aa',   null,   null],
        ['aa/a',   '*1/a', { 1: 'aa' }],
        ['aa/aa',  null,   null],
        ['a/a/a',  '*1/a', { 1: 'a/a' }],
        ['aa/a/a', '*1/a', { 1: 'aa/a' }],
        ['a/aa/a', '*1/a', { 1: 'a/aa' }],
        ['a/a/aa',  null,  null],
      ],
    },
    {
      routes: [
        '*1/a',
        'a/a',
        'aa/a',
      ],
      tests: [
        ['',       null,   null],
        ['a',      null,   null],
        ['aa',     null,   null],
        ['aaa',    null,   null],
        ['a/a',    'a/a',  null],
        ['a/aa',   null,   null],
        ['aa/a',   'aa/a', null],
        ['aaa/a',  '*1/a', { 1: 'aaa' }],
        ['aa/aa',  null,   null],
        ['a/a/a',  '*1/a', { 1: 'a/a' }],
        ['aa/a/a', '*1/a', { 1: 'aa/a' }],
        ['a/aa/a', '*1/a', { 1: 'a/aa' }],
        ['a/a/aa',  null,  null],
      ],
    },
    // s/d
    {
      routes: [
        'a/*2',
      ],
      tests: [
        ['',       null,   null],
        ['a',      null,   null],
        ['aa',     null,   null],
        ['aaa',    null,   null],
        ['a/a',    'a/*2', { 2: 'a' }],
        ['a/aa',   'a/*2', { 2: 'aa' }],
        ['aa/a',   null,   null],
        ['aa/aa',  null,   null],
        ['a/a/a',  'a/*2', { 2: 'a/a' }],
        ['aa/a/a', null,   null],
      ],
    },
    {
      routes: [
        'a/*2',
        'a/a',
      ],
      tests: [
        ['',       null,   null],
        ['a',      null,   null],
        ['aa',     null,   null],
        ['aaa',    null,   null],
        ['a/a',    'a/a',  null],
        ['a/aa',   'a/*2', { 2: 'aa' }],
        ['aa/a',   null,   null],
        ['aa/aa',  null,   null],
        ['a/a/a',  'a/*2', { 2: 'a/a' }],
        ['a/aa/a', 'a/*2', { 2: 'aa/a' }],
        ['a/a/aa', 'a/*2', { 2: 'a/aa' }],
        ['aa/a/a', null,   null],
      ],
    },
    {
      routes: [
        'a/*2',
        'a/a',
        'a/aa',
      ],
      tests: [
        ['',       null,   null],
        ['a',      null,   null],
        ['aa',     null,   null],
        ['aaa',    null,   null],
        ['a/a',    'a/a',  null],
        ['a/aa',   'a/aa', null],
        ['a/aaa',  'a/*2', { 2: 'aaa' }],
        ['aa/a',   null,   null],
        ['aa/aa',  null,   null],
        ['a/a/a',  'a/*2', { 2: 'a/a' }],
        ['a/aa/a', 'a/*2', { 2: 'aa/a' }],
        ['a/a/aa', 'a/*2', { 2: 'a/aa' }],
        ['aa/a/a', null,   null],
      ],
    },
    // d/s + s/d
    {
      routes: [
        '*1/a',
        'a/*2',
      ],
      tests: [
        ['',        null,   null],
        ['a',       null,   null],
        ['aa',      null,   null],
        ['aaa',     null,   null],
        ['a/a',     'a/*2', { 2: 'a' }],
        ['a/aa',    'a/*2', { 2: 'aa' }],
        ['aa/a',    '*1/a', { 1: 'aa' }],
        ['aa/aa',   null,   null],
        ['a/a/a',   'a/*2', { 2: 'a/a' }],
        ['a/aa/a',  'a/*2', { 2: 'aa/a' }],
        ['a/a/aa',  'a/*2', { 2: 'a/aa' }],
        ['aa/a/a',  '*1/a', { 1: 'aa/a' }],
        ['aa/a/aa', null,   null],
      ],
    },
    {
      routes: [
        '*1/a',
        'a/*2',
        'a/a',
      ],
      tests: [
        ['',        null,   null],
        ['a',       null,   null],
        ['aa',      null,   null],
        ['aaa',     null,   null],
        ['a/a',     'a/a',  null],
        ['a/aa',    'a/*2', { 2: 'aa' }],
        ['aa/a',    '*1/a', { 1: 'aa' }],
        ['aa/aa',   null,   null],
        ['a/a/a',   'a/*2', { 2: 'a/a' }],
        ['a/aa/a',  'a/*2', { 2: 'aa/a' }],
        ['a/a/aa',  'a/*2', { 2: 'a/aa' }],
        ['aa/a/a',  '*1/a', { 1: 'aa/a' }],
        ['aa/a/aa', null,   null],
      ],
    },
    {
      routes: [
        '*1/a',
        'a/*2',
        'a/a',
        'aa/a',
      ],
      tests: [
        ['',        null,   null],
        ['a',       null,   null],
        ['aa',      null,   null],
        ['aaa',     null,   null],
        ['a/a',     'a/a',  null],
        ['a/aa',    'a/*2', { 2: 'aa' }],
        ['aa/a',    'aa/a', null],
        ['aaa/a',   '*1/a', { 1: 'aaa' }],
        ['aa/aa',   null,   null],
        ['a/a/a',   'a/*2', { 2: 'a/a' }],
        ['a/aa/a',  'a/*2', { 2: 'aa/a' }],
        ['a/a/aa',  'a/*2', { 2: 'a/aa' }],
        ['aa/a/a',  '*1/a', { 1: 'aa/a' }],
        ['aa/a/aa', null,   null],
      ],
    },
    {
      routes: [
        '*1/a',
        'a/*2',
        'a/a',
        'a/aa',
      ],
      tests: [
        ['',        null,   null],
        ['a',       null,   null],
        ['aa',      null,   null],
        ['aaa',     null,   null],
        ['a/a',     'a/a',  null],
        ['a/aa',    'a/aa', null],
        ['a/aaa',   'a/*2', { 2: 'aaa' }],
        ['aa/a',    '*1/a', { 1: 'aa' }],
        ['aa/aa',   null,   null],
        ['a/a/a',   'a/*2', { 2: 'a/a' }],
        ['a/aa/a',  'a/*2', { 2: 'aa/a' }],
        ['a/a/aa',  'a/*2', { 2: 'a/aa' }],
        ['aa/a/a',  '*1/a', { 1: 'aa/a' }],
        ['aa/a/aa', null,   null],
      ],
    },
    {
      routes: [
        '*1/a',
        'a/*2',
        'a/a',
        'a/aa',
        'aa/a',
      ],
      tests: [
        ['',        null,   null],
        ['a',       null,   null],
        ['aa',      null,   null],
        ['aaa',     null,   null],
        ['a/a',     'a/a',  null],
        ['a/aa',    'a/aa', null],
        ['a/aaa',   'a/*2', { 2: 'aaa' }],
        ['aa/a',    'aa/a', null],
        ['aaa/a',   '*1/a', { 1: 'aaa' }],
        ['aa/aa',   null,   null],
        ['a/a/a',   'a/*2', { 2: 'a/a' }],
        ['a/aa/a',  'a/*2', { 2: 'aa/a' }],
        ['a/a/aa',  'a/*2', { 2: 'a/aa' }],
        ['aa/a/a',  '*1/a', { 1: 'aa/a' }],
        ['aa/a/aa', null,   null],
      ],
    },
    // d/d
    {
      routes: [
        '*1/*2',
      ],
      tests: [
        ['',        null,    null],
        ['a',       null,    null],
        ['aa',      null,    null],
        ['aaa',     null,    null],
        ['a/a',     '*1/*2', { 1: 'a', 2: 'a' }],
        ['a/aa',    '*1/*2', { 1: 'a', 2: 'aa' }],
        ['aa/a',    '*1/*2', { 1: 'aa', 2: 'a' }],
        ['aa/aa',   '*1/*2', { 1: 'aa', 2: 'aa' }],
        ['a/a/a',   '*1/*2', { 1: 'a', 2: 'a/a' }],
        ['a/aa/a',  '*1/*2', { 1: 'a', 2: 'aa/a' }],
        ['a/a/aa',  '*1/*2', { 1: 'a', 2: 'a/aa' }],
        ['aa/a/a',  '*1/*2', { 1: 'aa', 2: 'a/a' }],
        ['aa/aa/a', '*1/*2', { 1: 'aa', 2: 'aa/a' }],
        ['aa/a/aa', '*1/*2', { 1: 'aa', 2: 'a/aa' }],
      ],
    },
    // d/d + d/s
    {
      routes: [
        '*1/*2',
        '*1/a',
      ],
      tests: [
        ['',        null,    null],
        ['a',       null,    null],
        ['aa',      null,    null],
        ['aaa',     null,    null],
        ['a/a',     '*1/a',  { 1: 'a' }],
        ['a/aa',    '*1/*2', { 1: 'a', 2: 'aa' }],
        ['aa/a',    '*1/a',  { 1: 'aa' }],
        ['aa/aa',   '*1/*2', { 1: 'aa', 2: 'aa' }],
        ['a/a/a',   '*1/a',  { 1: 'a/a' }],
        ['a/aa/a',  '*1/a',  { 1: 'a/aa' }],
        ['a/a/aa',  '*1/*2', { 1: 'a', 2: 'a/aa' }],
        ['aa/a/a',  '*1/a',  { 1: 'aa/a' }],
        ['aa/aa/a', '*1/a',  { 1: 'aa/aa' }],
        ['aa/a/aa', '*1/*2', { 1: 'aa', 2: 'a/aa' }],
      ],
    },
    // d/d + d/s + s/s
    {
      routes: [
        '*1/*2',
        '*1/a',
        'a/a',
      ],
      tests: [
        ['',        null,    null],
        ['a',       null,    null],
        ['aa',      null,    null],
        ['aaa',     null,    null],
        ['a/a',     'a/a',   null],
        ['a/aa',    '*1/*2', { 1: 'a', 2: 'aa' }],
        ['aa/a',    '*1/a',  { 1: 'aa' }],
        ['aa/aa',   '*1/*2', { 1: 'aa', 2: 'aa' }],
        ['a/a/a',   '*1/a',  { 1: 'a/a' }],
        ['a/aa/a',  '*1/a',  { 1: 'a/aa' }],
        ['a/a/aa',  '*1/*2', { 1: 'a', 2: 'a/aa' }],
        ['aa/a/a',  '*1/a',  { 1: 'aa/a' }],
        ['aa/aa/a', '*1/a',  { 1: 'aa/aa' }],
        ['aa/a/aa', '*1/*2', { 1: 'aa', 2: 'a/aa' }], // NOTE: this use case is not well-defined: should the bigger part go to the first or the second param?
      ],
    },
    // {
    //   routes: [
    //     '/a/b/c/d',
    //     '/a/b/c/:d',
    //     '/a/b/:c/:d',
    //     '/a/:b/:c/:d',
    //     '/a/b/:c/d',
    //     '/a/:b/:c/d',
    //     '/a/:b/c/d',
    //     '/a/:b/c/:d',
    //   ],
    //   tests: [
    //     ['a/b/c/d',    '/a/b/c/d',    {}                           ],
    //     ['a/b/c/c',    '/a/b/c/:d',   { d: 'c' }                   ],
    //     ['a/b/b/d',    '/a/b/:c/d',   { c: 'b' }                   ],
    //     ['a/a/c/d',    '/a/:b/c/d',   { b: 'a' }                   ],
    //     ['a/b/c/dd',   '/a/b/c/:d',   { d: 'dd' }                  ],
    //     ['a/b/cc/d',   '/a/b/:c/d',   { c: 'cc' }                  ],
    //     ['a/bb/c/d',   '/a/:b/c/d',   { b: 'bb' }                  ],
    //     ['a/bb/cc/d',  '/a/:b/:c/d',  { b: 'bb', c: 'cc' }         ],
    //     ['a/bb/c/dd',  '/a/:b/c/:d',  { b: 'bb', d: 'dd' }         ],
    //     ['a/b/cc/dd',  '/a/b/:c/:d',  { c: 'cc', d: 'dd' }         ],
    //     ['a/bb/cc/dd', '/a/:b/:c/:d', { b: 'bb', c: 'cc', d: 'dd' }],
    //   ],
    // },
  ];

  for (const hasLeadingSlash of [true, false]) {
    for (const hasTrailingSlash of [true, false]) {
      for (const reverseAdd of [true, false]) {
        for (const { tests, routes: $routes } of recognizeSpecs) {
          const routes = reverseAdd ? $routes.slice().reverse() : $routes;
          for (const [path, match, $params] of tests) {
            const leading = hasLeadingSlash ? '/' : '';
            const trailing = hasTrailingSlash ? '/' : '';

            let title = `should`;
            if (match === null) {
              title = `${title} reject '${path}' out of routes: [${routes.map(x => `'${x}'`).join(',')}]`;

              it(title, function () {
                // Arrange
                const sut = new RouteRecognizer();

                // Act
                const actual = sut.recognize(path);

                // Assert
                assert.strictEqual(actual, null);
              });
            } else {
              for (const { keyValuePairs, queryString, queryParams } of querySpecs) {
                const query = keyValuePairs.length > 0
                  ? `?${keyValuePairs.map(pair => pair.join('=')).join('&')}`
                  : '';
                const input = `${leading}${path}${trailing}${query}`;
                title = `${title} recognize '${input}' as '${match}' out of routes: [${routes.map(x => `'${x}'`).join(',')}]`;

                it(title, function () {
                  // Arrange
                  const sut = new RouteRecognizer();
                  for (const route of routes) {
                    sut.add({ path: route, handler: null });
                  }

                  const params = $params ?? {};
                  const paramNames = Object.keys(params);
                  const configurableRoute = new ConfigurableRoute(match, false, null);
                  const endpoint = new Endpoint(configurableRoute, paramNames);
                  const isDynamic = paramNames.length > 0;
                  const expected = new RecognizedRoute(endpoint, params, queryParams, isDynamic, queryString);

                  // Act
                  const actual1 = sut.recognize(path);
                  const actual2 = sut.recognize(path);

                  // Assert
                  assert.deepStrictEqual(actual1, actual2, `consecutive calls should return the same result`);
                  assert.deepStrictEqual(actual1, expected);
                });
              }
            }
          }
        }
      }
    }
  }
});

// describe('query strings', function () {
//   it('should parse query strings', function () {
//     const parse = parseQueryString;

//     assert.deepStrictEqual(parse(''), {}, `parse('')`);
//     assert.deepStrictEqual(parse('='), {}, `parse('=')`);
//     assert.deepStrictEqual(parse('&'), {}, `parse('&')`);
//     assert.deepStrictEqual(parse('?'), {}, `parse('?')`);

//     assert.deepStrictEqual(parse('a'), { 1: true }, `parse('a')`);
//     assert.deepStrictEqual(parse('a&b'), { 1: true, b: true }, `parse('a&b')`);
//     assert.deepStrictEqual(parse('a='), { 1: '' }, `parse('a=')`);
//     assert.deepStrictEqual(parse('a=&b='), { 1: '', b: '' }, `parse('a=&b=')`);

//     assert.deepStrictEqual(parse('a=b'), { 1: 'b' }, `parse('a=b')`);
//     assert.deepStrictEqual(parse('a=b&c=d'), { 1: 'b', c: 'd' }, `parse('a=b&c=d')`);
//     assert.deepStrictEqual(parse('a=b&&c=d'), { 1: 'b', c: 'd' }, `parse('a=b&&c=d')`);
//     assert.deepStrictEqual(parse('a=b&a=c'), { 1: ['b', 'c'] }, `parse('a=b&a=c')`);

//     assert.deepStrictEqual(parse('a=b&c=d='), { 1: 'b', c: 'd' }, `parse('a=b&c=d=')`);
//     assert.deepStrictEqual(parse('a=b&c=d=='), { 1: 'b', c: 'd' }, `parse('a=b&c=d==')`);

//     assert.deepStrictEqual(parse('a=%26'), { 1: '&' }, `parse('a=%26')`);
//     assert.deepStrictEqual(parse('%26=a'), { '&': 'a' }, `parse('%26=a')`);
//     assert.deepStrictEqual(parse('%26[]=b&%26[]=c'), { '&': ['b', 'c'] }, `parse('%26[]=b&%26[]=c')`);

//     assert.deepStrictEqual(parse('a[b]=c&a[d]=e'), {1: {b: 'c', d: 'e'}}, `parse('a[b]=c&a[d]=e')`);
//     assert.deepStrictEqual(parse('a[b][c][d]=e'), {1: {b: {c: {d: 'e'}}}}, `parse('a[b][c][d]=e')`);
//     assert.deepStrictEqual(parse('a[b][]=c&a[b][]=d&a[b][2][]=f&a[b][2][]=g'), {1: {b: ['c', 'd', ['f', 'g']]}}, `parse('a[b][]=c&a[b][]=d&a[b][2][]=f&a[b][2][]=g')`);
//     assert.deepStrictEqual(parse('a[0]=b'), {1: ['b']}, `parse('a[0]=b')`);
//   });
// });
