import { Writable } from '@aurelia/kernel';
import { ConfigurableRoute, Endpoint, RecognizedRoute, RouteRecognizer, Parameter, RESIDUE } from '@aurelia/route-recognizer';
import { assert } from '@aurelia/testing';

describe('router/route-recognizer.spec.ts', function () {

  interface RecognizeSpec {
    routes: [string, Parameter[]][];
    tests: [string, string | null, Record<string, string> | null][];
  }

  const recognizeSpecs: RecognizeSpec[] = [
    // #region 1-depth static routes
    {
      routes: [
        ['', []]
      ],
      tests: [
        ['',   '',   null],
        ['a',  null, null],
      ],
    },
    {
      routes: [
        ['a', []]
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
        ['', []],
        ['a', []],
      ],
      tests: [
        ['',   '',   null],
        ['a',  'a',  null],
        ['b',  null, null],
        ['aa', null, null],
      ],
    },
    {
      routes: [
        ['aa', []],
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
        ['aaa', []],
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
        ['a',[]],
        ['aa',[]],
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
        ['a', []],
        ['aaa', []],
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
        ['aa', []],
        ['aaa', []],
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
        ['a', []],
        ['aa', []],
        ['aaa', []],
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
        ['a/a', []],
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
        ['', []],
        ['a/a', []],
      ],
      tests: [
        ['',    '',    null],
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
        ['aa/a', []],
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
        ['a/aa', []],
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
        ['aa/aa', []],
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
        ['a/a', []],
        ['aa/a', []],
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
        ['a/a', []],
        ['a/aa', []],
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
        ['a/a', []],
        ['aa/aa', []],
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
        ['a/a', []],
        ['aa/a', []],
        ['aa/aa', []],
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
        ['a/a', []],
        ['a/aa', []],
        ['aa/aa', []],
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
        ['a/a', []],
        ['aa/a', []],
        ['a/aa', []],
        ['aa/aa', []],
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
        ['a', []],
        ['aa', []],
        ['aaa', []],
        ['a/a', []],
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
        ['', []],
        ['a', []],
        ['aa', []],
        ['aaa', []],
        ['a/a', []],
      ],
      tests: [
        ['',    '',    null],
        ['a',   'a',   null],
        ['aa',  'aa',  null],
        ['aaa', 'aaa', null],
        ['a/a', 'a/a', null],
      ],
    },
    {
      routes: [
        ['a', []],
        ['aa', []],
        ['aaa', []],
        ['aa/a', []],
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
        ['a', []],
        ['aa', []],
        ['aaa', []],
        ['a/aa', []],
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
        ['a', []],
        ['aa', []],
        ['aaa', []],
        ['aa/aa', []],
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
        ['a', []],
        ['aa', []],
        ['aaa', []],
        ['a/a', []],
        ['aa/a', []],
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
        ['a', []],
        ['aa', []],
        ['aaa', []],
        ['a/a', []],
        ['a/aa', []],
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
        ['a', []],
        ['aa', []],
        ['aaa', []],
        ['a/a', []],
        ['aa/aa', []],
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
        ['a', []],
        ['aa', []],
        ['aaa', []],
        ['a/a', []],
        ['aa/a', []],
        ['aa/aa', []],
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
        ['a', []],
        ['aa', []],
        ['aaa', []],
        ['a/a', []],
        ['a/aa', []],
        ['aa/aa', []],
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
        ['a', []],
        ['aa', []],
        ['aaa', []],
        ['a/a', []],
        ['aa/a', []],
        ['a/aa', []],
        ['aa/aa', []],
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
        [':1', [new Parameter('1', false, false, null)]],
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
        ['', []],
        [':1', [new Parameter('1', false, false, null)]],
      ],
      tests: [
        ['',    '',   null],
        ['a',   ':1', { 1: 'a' }],
        ['b',   ':1', { 1: 'b' }],
        ['aa',  ':1', { 1: 'aa' }],
        ['a/a', null, null],
      ],
    },
    {
      routes: [
        [':1', [new Parameter('1', false, false, null)]],
        ['a', []],
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
        [':1', [new Parameter('1', false, false, null)]],
        ['a', []],
        ['aa', []],
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
        [':1', [new Parameter('1', false, false, null)]],
        ['a', []],
        ['aaa', []],
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
        [':1', [new Parameter('1', false, false, null)]],
        ['aa', []],
        ['aaa', []],
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
        [':1', [new Parameter('1', false, false, null)]],
        ['a', []],
        ['aa', []],
        ['aaa', []],
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
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/a', []],
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
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/a', []],
        ['aa/a', []],
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
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
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
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['a/aa', []],
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
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
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
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['aa/a', []],
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
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['a/aa', []],
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
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['a/aa', []],
        ['aa/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        [':1/aa', [new Parameter('1', false, false, null)]],
        ['a/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/a', []],
        ['aa/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        [':1/aa', [new Parameter('1', false, false, null)]],
        ['a/a', []],
        ['aa/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
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
        [':1/:2',[new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        ['a/:2',[new Parameter('2', false, false, null)]],
        ['aa/:2',[new Parameter('2', false, false, null)]],
        ['a/a',[]],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['a/aa', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['aa/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['a/aa', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        [':1/aa', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['aa/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        [':1/aa', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['aa/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['aa/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        [':1/aa', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['aa/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['aa/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['aa/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        [':1/aa', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['aa/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['aa/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['a/aa', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        [':1/aa', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['a/aa', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['aa/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['a/aa', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        [':1/aa', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['aa/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['a/aa', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['a/aa', []],
        ['aa/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        [':1/aa', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['a/aa', []],
        ['aa/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['aa/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['a/aa', []],
        ['aa/a', []],
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
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        [':1/aa', [new Parameter('1', false, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['aa/:2', [new Parameter('2', false, false, null)]],
        ['a/a', []],
        ['a/aa', []],
        ['aa/a', []],
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
    {
      routes: [
        [':1?', [new Parameter('1', true, false, null)]],
      ],
      tests: [
        ['',    ':1?', { 1: void 0 }],
        ['a',   ':1?', { 1: 'a' }],
        ['aa',  ':1?', { 1: 'aa' }],
        ['aaa', ':1?', { 1: 'aaa' }],
        ['a/a', null,  null],
      ],
    },
    // #region 2-depth optional dynamic routes
    // d/s
    {
      routes: [
        [':1?/a', [new Parameter('1', true, false, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',      null,    null],
        ['a',     ':1?/a', { 1: void 0 }],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  null,    null],
        ['aa/a',  ':1?/a', { 1: 'aa' }],
        ['aa/aa', null,    null],
        ['a/a/a', null,    null],
      ],
    },
    {
      routes: [
        [':1?/a', [new Parameter('1', true, false, null)]],
        ['a/a', []],
        ['aa/a', []],
      ],
      tests: [
        ['',      null,    null],
        ['a',     ':1?/a', { 1: void 0 }],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  null,    null],
        ['aa/a',  'aa/a',  null],
        ['aaa/a', ':1?/a', { 1: 'aaa' }],
        ['aa/aa', null,    null],
        ['a/a/a', null,    null],
      ],
    },
    // s/d
    {
      routes: [
        ['a/:2?',[new Parameter('2', true, false, null)]],
        ['a/a',[]],
      ],
      tests: [
        ['',      null,    null],
        ['a',     'a/:2?', { 2: void 0 }],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  'a/:2?', { 2: 'aa' }],
        ['aa/a',  null,    null],
        ['aa/aa', null,    null],
        ['a/a/a', null,    null],
      ],
    },
    {
      routes: [
        ['a/:2?' ,[new Parameter('2', true, false, null)]],
        ['a/a' ,[]],
        ['a/aa' ,[]],
      ],
      tests: [
        ['',      null,    null],
        ['a',     'a/:2?', { 2: void 0 }],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  'a/aa',  null],
        ['a/aaa', 'a/:2?', { 2: 'aaa' }],
        ['aa/a',  null,    null],
        ['aa/aa', null,    null],
        ['a/a/a', null,    null],
      ],
    },
    // d/s + s/d
    {
      routes: [
        [':1?/a', [new Parameter('1', true, false, null)]],
        ['a/:2?', [new Parameter('2', true, false, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',      null,    null],
        ['a',     'a/:2?', { 2: void 0 }],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  'a/:2?', { 2: 'aa' }],
        ['aa/a',  ':1?/a', { 1: 'aa' }],
        ['a/a/a', null,    null],
      ],
    },
    {
      routes: [
        [':1?/a', [new Parameter('1', true, false, null)]],
        ['a/:2?', [new Parameter('2', true, false, null)]],
        ['a/a', []],
        ['aa/a', []],
      ],
      tests: [
        ['',      null,    null],
        ['a',     'a/:2?', { 2: void 0 }],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  'a/:2?', { 2: 'aa' }],
        ['aa/a',  'aa/a',  null],
        ['aaa/a', ':1?/a', { 1: 'aaa' }],
        ['a/a/a', null,    null],
      ],
    },
    {
      routes: [
        [':1?/a', [new Parameter('1', true, false, null)]],
        ['a/:2?', [new Parameter('2', true, false, null)]],
        ['a/a', []],
        ['a/aa', []],
      ],
      tests: [
        ['',      null,    null],
        ['a',     'a/:2?', { 2: void 0 }],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  'a/aa',  null],
        ['a/aaa', 'a/:2?', { 2: 'aaa' }],
        ['aa/a',  ':1?/a', { 1: 'aa' }],
        ['a/a/a', null,    null],
      ],
    },
    {
      routes: [
        [':1?/a', [new Parameter('1', true, false, null)]],
        ['a/:2?', [new Parameter('2', true, false, null)]],
        ['a/a', []],
        ['a/aa', []],
        ['aa/a', []],
      ],
      tests: [
        ['',      null,    null],
        ['a',     'a/:2?', { 2: void 0 }],
        ['aa',    null,    null],
        ['aaa',   null,    null],
        ['a/a',   'a/a',   null],
        ['a/aa',  'a/aa',  null],
        ['a/aaa', 'a/:2?', { 2: 'aaa' }],
        ['aa/a',  'aa/a',  null],
        ['aaa/a', ':1?/a', { 1: 'aaa' }],
        ['a/a/a', null,    null],
      ],
    },
    // d/d + d/s + s/s
    {
      routes: [
        [':1?/:2?', [new Parameter('1', true, false, null), new Parameter('2', true, false, null)]],
        [':1?/a', [new Parameter('1', true, false, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',      ':1?/:2?', { 1: void 0, 2: void 0 }],
        ['a',     ':1?/a',   { 1: void 0 }],
        ['aa',    ':1?/:2?', { 1: 'aa', 2: void 0 }],
        ['aaa',   ':1?/:2?', { 1: 'aaa', 2: void 0 }],
        ['a/a',   'a/a',     null],
        ['a/aa',  ':1?/:2?', { 1: 'a', 2: 'aa' }],
        ['aa/a',  ':1?/a',   { 1: 'aa' }],
        ['aa/aa', ':1?/:2?', { 1: 'aa', 2: 'aa' }],
        ['a/a/a', null,      null],
      ],
    },
    // d/d + d/s*2 + s/s
    {
      routes: [
        [':1?/:2?', [new Parameter('1', true, false, null), new Parameter('2', true, false, null)]],
        [':1?/a', [new Parameter('1', true, false, null)]],
        [':1?/aa', [new Parameter('1', true, false, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',       ':1?/:2?', { 1: void 0, 2: void 0 }],
        ['a',      ':1?/a',   { 1: void 0 }],
        ['aa',     ':1?/aa',  { 1: void 0 }],
        ['aaa',    ':1?/:2?', { 1: 'aaa', 2: void 0 }],
        ['a/a',    'a/a',     null],
        ['a/aa',   ':1?/aa',  { 1: 'a' }],
        ['a/aaa',  ':1?/:2?', { 1: 'a', 2: 'aaa' }],
        ['aa/a',   ':1?/a',   { 1: 'aa' }],
        ['aa/aa',  ':1?/aa',  { 1: 'aa' }],
        ['aa/aaa', ':1?/:2?', { 1: 'aa', 2: 'aaa' }],
        ['a/a/a',  null,      null],
      ],
    },
    // d/d + d/s + s/s*2
    {
      routes: [
        [':1?/:2?', [new Parameter('1', true, false, null), new Parameter('2', true, false, null)]],
        [':1?/a', [new Parameter('1', true, false, null)]],
        ['a/a', []],
        ['aa/a', []],
      ],
      tests: [
        ['',      ':1?/:2?', { 1: void 0, 2: void 0 }],
        ['a',     ':1?/a',   { 1: void 0 }],
        ['aa',    ':1?/:2?', { 1: 'aa', 2: void 0 }],
        ['aaa',   ':1?/:2?', { 1: 'aaa', 2: void 0 }],
        ['a/a',   'a/a',     null],
        ['a/aa',  ':1?/:2?', { 1: 'a', 2: 'aa' }],
        ['aa/a',  'aa/a',    null],
        ['aaa/a', ':1?/a',   { 1: 'aaa' }],
        ['aa/aa', ':1?/:2?', { 1: 'aa', 2: 'aa' }],
        ['a/a/a', null,      null],
      ],
    },
    // d/d + d/s*2 + s/s*2
    {
      routes: [
        [':1?/:2?', [new Parameter('1', true, false, null), new Parameter('2', true, false, null)]],
        [':1?/a', [new Parameter('1', true, false, null)]],
        [':1?/aa', [new Parameter('1', true, false, null)]],
        ['a/a', []],
        ['aa/a', []],
      ],
      tests: [
        ['',       ':1?/:2?', { 1: void 0, 2: void 0 }],
        ['a',      ':1?/a',   { 1: void 0 }],
        ['aa',     ':1?/aa',  { 1: void 0 }],
        ['aaa',    ':1?/:2?', { 1: 'aaa', 2: void 0 }],
        ['a/a',    'a/a',     null],
        ['a/aa',   ':1?/aa',  { 1: 'a' }],
        ['a/aaa',  ':1?/:2?', { 1: 'a', 2: 'aaa' }],
        ['aa/a',   'aa/a',    null],
        ['aaa/a',  ':1?/a',   { 1: 'aaa' }],
        ['aa/aa',  ':1?/aa',  { 1: 'aa' }],
        ['aa/aaa', ':1?/:2?', { 1: 'aa', 2: 'aaa' }],
        ['a/a/a',  null,      null],
      ],
    },
    // d/d + s/d + s/s
    {
      routes: [
        [':1?/:2?', [new Parameter('1', true, false, null), new Parameter('2', true, false, null)]],
        ['a/:2?', [new Parameter('2', true, false, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',      ':1?/:2?', { 1: void 0, 2: void 0 }],
        ['a',     'a/:2?',   { 2: void 0 }],
        ['aa',    ':1?/:2?', { 1: 'aa', 2: void 0 }],
        ['aaa',   ':1?/:2?', { 1: 'aaa', 2: void 0 }],
        ['a/a',   'a/a',     null],
        ['a/aa',  'a/:2?',   { 2: 'aa' }],
        ['aa/a',  ':1?/:2?', { 1: 'aa', 2: 'a' }],
        ['aa/aa', ':1?/:2?', { 1: 'aa', 2: 'aa' }],
        ['a/a/a', null,      null],
      ],
    },
    // d/d + s/d*2 + s/s
    {
      routes: [
        [':1?/:2?', [new Parameter('1', true, false, null), new Parameter('2', true, false, null)]],
        ['a/:2?', [new Parameter('2', true, false, null)]],
        ['aa/:2?', [new Parameter('2', true, false, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',       ':1?/:2?', { 1: void 0, 2: void 0 }],
        ['a',      'a/:2?',   { 2: void 0 }],
        ['aa',     'aa/:2?',  { 2: void 0 }],
        ['aaa',    ':1?/:2?', { 1: 'aaa', 2: void 0 }],
        ['a/a',    'a/a',     null],
        ['a/aa',   'a/:2?',   { 2: 'aa' }],
        ['aa/a',   'aa/:2?',  { 2: 'a' }],
        ['aa/aa',  'aa/:2?',  { 2: 'aa' }],
        ['aaa/aa', ':1?/:2?', { 1: 'aaa', 2: 'aa' }],
        ['a/a/a',  null,      null],
      ],
    },
    // d/d + s/d + s/s*2
    {
      routes: [
        [':1?/:2?', [new Parameter('1', true, false, null), new Parameter('2', true, false, null)]],
        ['a/:2?', [new Parameter('2', true, false, null)]],
        ['a/a', []],
        ['a/aa', []],
      ],
      tests: [
        ['',      ':1?/:2?', { 1: void 0, 2: void 0 }],
        ['a',     'a/:2?',   { 2: void 0 }],
        ['aa',    ':1?/:2?', { 1: 'aa', 2: void 0 }],
        ['aaa',   ':1?/:2?', { 1: 'aaa', 2: void 0 }],
        ['a/a',   'a/a',     null],
        ['a/aa',  'a/aa',    null],
        ['a/aaa', 'a/:2?',   { 2: 'aaa' }],
        ['aa/a',  ':1?/:2?', { 1: 'aa', 2: 'a' }],
        ['aa/aa', ':1?/:2?', { 1: 'aa', 2: 'aa' }],
        ['a/a/a', null,      null],
      ],
    },
    // d/d + s/d*2 + s/s*2
    {
      routes: [
        [':1?/:2?', [new Parameter('1', true, false, null), new Parameter('2', true, false, null)]],
        ['a/:2?', [new Parameter('2', true, false, null)]],
        ['aa/:2?', [new Parameter('2', true, false, null)]],
        ['a/a', []],
        ['a/aa', []],
      ],
      tests: [
        ['',       ':1?/:2?', { 1: void 0, 2: void 0 }],
        ['a',      'a/:2?',   { 2: void 0 }],
        ['aa',     'aa/:2?',  { 2: void 0 }],
        ['aaa',    ':1?/:2?', { 1: 'aaa', 2: void 0 }],
        ['a/a',    'a/a',     null],
        ['a/aa',   'a/aa',    null],
        ['a/aaa',  'a/:2?',   { 2: 'aaa' }],
        ['aa/a',   'aa/:2?',  { 2: 'a' }],
        ['aa/aa',  'aa/:2?',  { 2: 'aa' }],
        ['aaa/aa', ':1?/:2?', { 1: 'aaa', 2: 'aa' }],
        ['a/a/a',  null,      null],
      ],
    },
    // d/d + d/s + s/d + s/s
    {
      routes: [
        [':1?/:2?', [new Parameter('1', true, false, null), new Parameter('2', true, false, null)]],
        [':1?/a', [new Parameter('1', true, false, null)]],
        ['a/:2?', [new Parameter('2', true, false, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',      ':1?/:2?', { 1: void 0, 2: void 0 }],
        ['a',     'a/:2?',   { 2: void 0 }],
        ['aa',    ':1?/:2?', { 1: 'aa', 2: void 0 }],
        ['aaa',   ':1?/:2?', { 1: 'aaa', 2: void 0 }],
        ['a/a',   'a/a',     null],
        ['a/aa',  'a/:2?',   { 2: 'aa' }],
        ['aa/a',  ':1?/a',   { 1: 'aa' }],
        ['aa/aa', ':1?/:2?', { 1: 'aa', 2: 'aa' }],
        ['a/a/a', null,      null],
      ],
    },
    // d/d + d/s*2 + s/d + s/s
    {
      routes: [
        [':1?/:2?', [new Parameter('1', true, false, null), new Parameter('2', true, false, null)]],
        [':1?/a', [new Parameter('1', true, false, null)]],
        [':1?/aa', [new Parameter('1', true, false, null)]],
        ['a/:2?', [new Parameter('2', true, false, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',       ':1?/:2?', { 1: void 0, 2: void 0 }],
        ['a',      'a/:2?',   { 2: void 0 }],
        ['aa',     ':1?/aa',  { 1: void 0 }],
        ['aaa',    ':1?/:2?', { 1: 'aaa', 2: void 0 }],
        ['a/a',    'a/a',     null],
        ['a/aa',   'a/:2?',   { 2: 'aa' }],
        ['aa/a',   ':1?/a',   { 1: 'aa' }],
        ['aa/aa',  ':1?/aa',  { 1: 'aa' }],
        ['aa/aaa', ':1?/:2?', { 1: 'aa', 2: 'aaa' }],
        ['a/a/a',  null,      null],
      ],
    },
    // d/d + d/s + s/d*2 + s/s
    {
      routes: [
        [':1?/:2?', [new Parameter('1', true, false, null), new Parameter('2', true, false, null)]],
        [':1?/a', [new Parameter('1', true, false, null)]],
        ['a/:2?', [new Parameter('2', true, false, null)]],
        ['aa/:2?', [new Parameter('2', true, false, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',       ':1?/:2?', { 1: void 0, 2: void 0 }],
        ['a',      'a/:2?',   { 2: void 0 }],
        ['aa',     'aa/:2?',  { 2: void 0 }],
        ['aaa',    ':1?/:2?', { 1: 'aaa', 2: void 0 }],
        ['a/a',    'a/a',     null],
        ['a/aa',   'a/:2?',   { 2: 'aa' }],
        ['aa/a',   'aa/:2?',  { 2: 'a' }],
        ['aa/aa',  'aa/:2?',  { 2: 'aa' }],
        ['aaa/aa', ':1?/:2?', { 1: 'aaa', 2: 'aa' }],
        ['a/a/a',  null,      null],
      ],
    },
    // d/d + d/s*2 + s/d*2 + s/s
    {
      routes: [
        [':1?/:2?', [new Parameter('1', true, false, null), new Parameter('2', true, false, null)]],
        [':1?/a', [new Parameter('1', true, false, null)]],
        [':1?/aa', [new Parameter('1', true, false, null)]],
        ['a/:2?', [new Parameter('2', true, false, null)]],
        ['aa/:2?', [new Parameter('2', true, false, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',        ':1?/:2?', { 1: void 0, 2: void 0 }],
        ['a',       'a/:2?',   { 2: void 0 }],
        ['aa',      'aa/:2?',  { 2: void 0 }],
        ['aaa',     ':1?/:2?', { 1: 'aaa', 2: void 0 }],
        ['a/a',     'a/a',     null],
        ['a/aa',    'a/:2?',   { 2: 'aa' }],
        ['aa/a',    'aa/:2?',  { 2: 'a' }],
        ['aa/aa',   'aa/:2?',  { 2: 'aa' }],
        ['aa/aaa',  'aa/:2?',  { 2: 'aaa' }],
        ['aaa/aa',  ':1?/aa',  { 1: 'aaa' }],
        ['aaa/aaa', ':1?/:2?', { 1: 'aaa', 2: 'aaa' }],
        ['a/a/a',   null,      null],
      ],
    },
    // #endregion
    // #region 1-depth star routes
    {
      routes: [
        ['*1', [new Parameter('1', true, true, null)]],
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
        ['', []],
        ['*1', [new Parameter('1', true, true, null)]],
      ],
      tests: [
        ['',      '',   null],
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
        ['*1', [new Parameter('1', true, true, null)]],
        ['a', []],
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
        ['*1', [new Parameter('1', true, true, null)]],
        ['a', []],
        ['aa', []],
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
        ['*1', [new Parameter('1', true, true, null)]],
        ['a', []],
        ['aaa', []],
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
        ['*1', [new Parameter('1', true, true, null)]],
        ['aa', []],
        ['aaa', []],
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
        ['*1', [new Parameter('1', true, true, null)]],
        ['a', []],
        ['aa', []],
        ['aaa', []],
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
        ['*1', [new Parameter('1', true, true, null)]],
        [':1', [new Parameter('1', false, false, null)]],
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
        ['*1', [new Parameter('1', true, true, null)]],
        [':1', [new Parameter('1', false, false, null)]],
        ['a', []],
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
        ['*1', [new Parameter('1', true, true, null)]],
        [':1', [new Parameter('1', false, false, null)]],
        ['a', []],
        ['aa', []],
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
        ['*1', [new Parameter('1', true, true, null)]],
        [':1', [new Parameter('1', false, false, null)]],
        ['a', []],
        ['aaa', []],
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
        ['*1', [new Parameter('1', true, true, null)]],
        [':1', [new Parameter('1', false, false, null)]],
        ['aa', []],
        ['aaa', []],
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
        ['*1', [new Parameter('1', true, true, null)]],
        [':1', [new Parameter('1', false, false, null)]],
        ['a', []],
        ['aa', []],
        ['aaa', []],
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
        ['*1/a', [new Parameter('1', true, true, null)]],
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
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['a/a', []],
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
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['a/a', []],
        ['aa/a', []],
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
        ['a/*2', [new Parameter('2', true, true, null)]],
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
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
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
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
        ['a/aa', []],
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
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['a/*2', [new Parameter('2', true, true, null)]],
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
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
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
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
        ['aa/a', []],
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
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
        ['a/aa', []],
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
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
        ['a/aa', []],
        ['aa/a', []],
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
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
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
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
        ['*1/a', [new Parameter('1', true, true, null)]],
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
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['a/a', []],
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
        ['aa/a/aa', '*1/*2', { 1: 'aa', 2: 'a/aa' }],
      ],
    },
    // d/d + d/s*2 + s/s
    {
      routes: [
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['*1/aa', [new Parameter('1', true, true, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',         null,     null],
        ['a',        null,     null],
        ['aa',       null,     null],
        ['aaa',      null,     null],
        ['a/a',      'a/a',    null],
        ['a/aa',     '*1/aa',  { 1: 'a' }],
        ['a/aaa',    '*1/*2',  { 1: 'a', 2: 'aaa' }],
        ['aa/a',     '*1/a',   { 1: 'aa' }],
        ['aa/aa',    '*1/aa',  { 1: 'aa' }],
        ['aa/aaa',   '*1/*2',  { 1: 'aa', 2: 'aaa' }],
        ['a/a/a',    '*1/a',   { 1: 'a/a' }],
        ['a/aa/a',   '*1/a',   { 1: 'a/aa' }],
        ['a/a/aa',   '*1/aa',  { 1: 'a/a' }],
        ['a/a/aaa',  '*1/*2',  { 1: 'a', 2: 'a/aaa' }],
        ['aa/a/a',   '*1/a',   { 1: 'aa/a' }],
        ['aa/aa/a',  '*1/a',   { 1: 'aa/aa' }],
        ['aa/a/aa',  '*1/aa',  { 1: 'aa/a' }],
        ['aa/a/aaa', '*1/*2',  { 1: 'aa', 2: 'a/aaa' }],
      ],
    },
    // d/d + d/s + s/s*2
    {
      routes: [
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['a/a', []],
        ['aa/a', []],
      ],
      tests: [
        ['',        null,    null],
        ['a',       null,    null],
        ['aa',      null,    null],
        ['aaa',     null,    null],
        ['a/a',     'a/a',   null],
        ['aa/a',    'aa/a',  null],
        ['a/aa',    '*1/*2', { 1: 'a', 2: 'aa' }],
        ['aa/aa',   '*1/*2', { 1: 'aa', 2: 'aa' }],
        ['a/a/a',   '*1/a',  { 1: 'a/a' }],
        ['a/aa/a',  '*1/a',  { 1: 'a/aa' }],
        ['a/a/aa',  '*1/*2', { 1: 'a', 2: 'a/aa' }],
        ['aa/a/a',  '*1/a',  { 1: 'aa/a' }],
        ['aa/aa/a', '*1/a',  { 1: 'aa/aa' }],
        ['aa/a/aa', '*1/*2', { 1: 'aa', 2: 'a/aa' }],
      ],
    },
    // d/d + d/s*2 + s/s*2
    {
      routes: [
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['*1/aa', [new Parameter('1', true, true, null)]],
        ['a/a', []],
        ['aa/a', []],
      ],
      tests: [
        ['',         null,    null],
        ['a',        null,    null],
        ['aa',       null,    null],
        ['aaa',      null,    null],
        ['a/a',      'a/a',   null],
        ['aa/a',     'aa/a',  null],
        ['a/aa',     '*1/aa', { 1: 'a' }],
        ['a/aaa',    '*1/*2', { 1: 'a', 2: 'aaa' }],
        ['aa/aa',    '*1/aa', { 1: 'aa' }],
        ['aa/aaa',   '*1/*2', { 1: 'aa', 2: 'aaa' }],
        ['a/a/a',    '*1/a',  { 1: 'a/a' }],
        ['a/aa/a',   '*1/a',  { 1: 'a/aa' }],
        ['a/a/aa',   '*1/aa', { 1: 'a/a' }],
        ['a/a/aaa',  '*1/*2', { 1: 'a', 2: 'a/aaa' }],
        ['aa/a/a',   '*1/a',  { 1: 'aa/a' }],
        ['aa/aa/a',  '*1/a',  { 1: 'aa/aa' }],
        ['aa/a/aa',  '*1/aa', { 1: 'aa/a' }],
        ['aa/a/aaa', '*1/*2', { 1: 'aa', 2: 'a/aaa' }],
      ],
    },
    // d/d + s/d + s/s
    {
      routes: [
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',        null,    null],
        ['a',       null,    null],
        ['aa',      null,    null],
        ['aaa',     null,    null],
        ['a/a',     'a/a',   null],
        ['aa/a',    '*1/*2', { 1: 'aa', 2: 'a' }],
        ['a/aa',    'a/*2',  { 2: 'aa' }],
        ['aa/aa',   '*1/*2', { 1: 'aa', 2: 'aa' }],
        ['a/a/a',   'a/*2',  { 2: 'a/a' }],
        ['a/aa/a',  'a/*2',  { 2: 'aa/a' }],
        ['aa/a/a',  '*1/*2', { 1: 'aa', 2: 'a/a' }],
        ['a/a/aa',  'a/*2',  { 2: 'a/aa' }],
        ['a/aa/aa', 'a/*2',  { 2: 'aa/aa' }],
        ['aa/a/aa', '*1/*2', { 1: 'aa', 2: 'a/aa' }],
      ],
    },
    // d/d + s/d*2 + s/s
    {
      routes: [
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['aa/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',         null,    null],
        ['a',        null,    null],
        ['aa',       null,    null],
        ['aaa',      null,    null],
        ['a/a',      'a/a',   null],
        ['aa/a',     'aa/*2', { 2: 'a' }],
        ['aaa/a',    '*1/*2', { 1: 'aaa', 2: 'a' }],
        ['a/aa',     'a/*2',  { 2: 'aa' }],
        ['aa/aa',    'aa/*2', { 2: 'aa' }],
        ['aaa/aa',   '*1/*2', { 1: 'aaa', 2: 'aa' }],
        ['a/a/a',    'a/*2',  { 2: 'a/a' }],
        ['a/aa/a',   'a/*2',  { 2: 'aa/a' }],
        ['aa/a/a',   'aa/*2', { 2: 'a/a' }],
        ['aaa/a/a',  '*1/*2', { 1: 'aaa', 2: 'a/a' }],
        ['a/a/aa',   'a/*2',  { 2: 'a/aa' }],
        ['a/aa/aa',  'a/*2',  { 2: 'aa/aa' }],
        ['aa/a/aa',  'aa/*2', { 2: 'a/aa' }],
        ['aaa/a/aa', '*1/*2', { 1: 'aaa', 2: 'a/aa' }],
      ],
    },
    // d/d + s/d + s/s*2
    {
      routes: [
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
        ['a/aa', []],
      ],
      tests: [
        ['',        null,    null],
        ['a',       null,    null],
        ['aa',      null,    null],
        ['aaa',     null,    null],
        ['a/a',     'a/a',   null],
        ['a/aa',    'a/aa',  null],
        ['aa/a',    '*1/*2', { 1: 'aa', 2: 'a' }],
        ['aa/aa',   '*1/*2', { 1: 'aa', 2: 'aa' }],
        ['a/a/a',   'a/*2',  { 2: 'a/a' }],
        ['a/aa/a',  'a/*2',  { 2: 'aa/a' }],
        ['aa/a/a',  '*1/*2', { 1: 'aa', 2: 'a/a' }],
        ['a/a/aa',  'a/*2',  { 2: 'a/aa' }],
        ['a/aa/aa', 'a/*2',  { 2: 'aa/aa' }],
        ['aa/a/aa', '*1/*2', { 1: 'aa', 2: 'a/aa' }],
      ],
    },
    // d/d + s/d*2 + s/s*2
    {
      routes: [
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['aa/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
        ['a/aa', []],
      ],
      tests: [
        ['',         null,    null],
        ['a',        null,    null],
        ['aa',       null,    null],
        ['aaa',      null,    null],
        ['a/a',      'a/a',   null],
        ['a/aa',     'a/aa',  null],
        ['aa/a',     'aa/*2', { 2: 'a' }],
        ['aaa/a',    '*1/*2', { 1: 'aaa', 2: 'a' }],
        ['aa/aa',    'aa/*2', { 2: 'aa' }],
        ['aaa/aa',   '*1/*2', { 1: 'aaa', 2: 'aa' }],
        ['a/a/a',    'a/*2',  { 2: 'a/a' }],
        ['a/aa/a',   'a/*2',  { 2: 'aa/a' }],
        ['aa/a/a',   'aa/*2', { 2: 'a/a' }],
        ['aaa/a/a',  '*1/*2', { 1: 'aaa', 2: 'a/a' }],
        ['a/a/aa',   'a/*2',  { 2: 'a/aa' }],
        ['a/aa/aa',  'a/*2',  { 2: 'aa/aa' }],
        ['aa/a/aa',  'aa/*2', { 2: 'a/aa' }],
        ['aaa/a/aa', '*1/*2', { 1: 'aaa', 2: 'a/aa' }],
      ],
    },
    // d/d + d/s + s/d + s/s
    {
      routes: [
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',         null,    null],
        ['a',        null,    null],
        ['aa',       null,    null],
        ['aaa',      null,    null],
        ['a/a',      'a/a',   null],
        ['aa/a',     '*1/a',  { 1: 'aa' }],
        ['a/aa',     'a/*2',  { 2: 'aa' }],
        ['aa/aa',    '*1/*2', { 1: 'aa', 2: 'aa' }],
        ['a/a/a',    'a/*2',  { 2: 'a/a' }],
        ['aa/a/a',   '*1/a',  { 1: 'aa/a' }],
        ['a/aa/a',   'a/*2',  { 2: 'aa/a' }],
        ['aa/aa/a',  '*1/a',  { 1: 'aa/aa' }],
        ['a/a/aa',   'a/*2',  { 2: 'a/aa' }],
        ['aa/a/aa',  '*1/*2', { 1: 'aa', 2: 'a/aa' }],
        ['a/aa/aa',  'a/*2',  { 2: 'aa/aa' }],
        ['aa/aa/aa', '*1/*2', { 1: 'aa', 2: 'aa/aa' }],
      ],
    },
    // d/d + d/s*2 + s/d + s/s
    {
      routes: [
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['*1/aa', [new Parameter('1', true, true, null)]],
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',          null,    null],
        ['a',         null,    null],
        ['aa',        null,    null],
        ['aaa',       null,    null],
        ['a/a',       'a/a',   null],
        ['aa/a',      '*1/a',  { 1: 'aa' }],
        ['a/aa',      'a/*2',  { 2: 'aa' }],
        ['aa/aa',     '*1/aa', { 1: 'aa' }],
        ['aa/aaa',    '*1/*2', { 1: 'aa', 2: 'aaa' }],
        ['a/a/a',     'a/*2',  { 2: 'a/a' }],
        ['aa/a/a',    '*1/a',  { 1: 'aa/a' }],
        ['a/aa/a',    'a/*2',  { 2: 'aa/a' }],
        ['aa/aa/a',   '*1/a',  { 1: 'aa/aa' }],
        ['a/a/aa',    'a/*2',  { 2: 'a/aa' }],
        ['a/aa/aa',   'a/*2',  { 2: 'aa/aa' }],
        ['aa/a/aa',   '*1/aa', { 1: 'aa/a' }],
        ['aa/a/aaa',  '*1/*2', { 1: 'aa', 2: 'a/aaa' }],
        ['aa/aa/aa',  '*1/aa', { 1: 'aa/aa' }],
        ['aa/aa/aaa', '*1/*2', { 1: 'aa', 2: 'aa/aaa' }],
      ],
    },
    // d/d + d/s + s/d*2 + s/s
    {
      routes: [
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['aa/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',          null,    null],
        ['a',         null,    null],
        ['aa',        null,    null],
        ['aaa',       null,    null],
        ['a/a',       'a/a',   null],
        ['aa/a',      'aa/*2', { 2: 'a' }],
        ['aaa/a',     '*1/a',  { 1: 'aaa' }],
        ['a/aa',      'a/*2',  { 2: 'aa' }],
        ['aa/aa',     'aa/*2', { 2: 'aa' }],
        ['aaa/aa',    '*1/*2', { 1: 'aaa', 2: 'aa' }],
        ['a/a/a',     'a/*2',  { 2: 'a/a' }],
        ['aa/a/a',    'aa/*2', { 2: 'a/a' }],
        ['aaa/a/a',   '*1/a',  { 1: 'aaa/a' }],
        ['a/aa/a',    'a/*2',  { 2: 'aa/a' }],
        ['aa/aa/a',   'aa/*2', { 2: 'aa/a' }],
        ['aaa/aa/a',  '*1/a',  { 1: 'aaa/aa' }],
        ['a/a/aa',    'a/*2',  { 2: 'a/aa' }],
        ['a/aa/aa',   'a/*2',  { 2: 'aa/aa' }],
        ['aa/a/aa',   'aa/*2', { 2: 'a/aa' }],
        ['aaa/a/aa',  '*1/*2', { 1: 'aaa', 2: 'a/aa' }],
        ['aa/aa/aa',  'aa/*2', { 2: 'aa/aa' }],
        ['aaa/aa/aa', '*1/*2', { 1: 'aaa', 2: 'aa/aa' }],
      ],
    },
    // d/d + d/s*2 + s/d*2 + s/s
    {
      routes: [
        ['*1/*2', [new Parameter('1', true, true, null), new Parameter('2', true, true, null)]],
        ['*1/a', [new Parameter('1', true, true, null)]],
        ['*1/aa', [new Parameter('1', true, true, null)]],
        ['a/*2', [new Parameter('2', true, true, null)]],
        ['aa/*2', [new Parameter('2', true, true, null)]],
        ['a/a', []],
      ],
      tests: [
        ['',           null,    null],
        ['a',          null,    null],
        ['aa',         null,    null],
        ['aaa',        null,    null],
        ['a/a',        'a/a',   null],
        ['aa/a',       'aa/*2', { 2: 'a' }],
        ['aaa/a',      '*1/a',  { 1: 'aaa' }],
        ['a/aa',       'a/*2',  { 2: 'aa' }],
        ['aa/aa',      'aa/*2', { 2: 'aa' }],
        ['aaa/aa',     '*1/aa', { 1: 'aaa' }],
        ['aaa/aaa',    '*1/*2', { 1: 'aaa', 2: 'aaa' }],
        ['a/a/a',      'a/*2',  { 2: 'a/a' }],
        ['aa/a/a',     'aa/*2', { 2: 'a/a' }],
        ['aaa/a/a',    '*1/a',  { 1: 'aaa/a' }],
        ['a/aa/a',     'a/*2',  { 2: 'aa/a' }],
        ['aa/aa/a',    'aa/*2', { 2: 'aa/a' }],
        ['aaa/aa/a',   '*1/a',  { 1: 'aaa/aa' }],
        ['a/a/aa',     'a/*2',  { 2: 'a/aa' }],
        ['a/aa/aa',    'a/*2',  { 2: 'aa/aa' }],
        ['aa/a/aa',    'aa/*2', { 2: 'a/aa' }],
        ['aaa/a/aa',   '*1/aa', { 1: 'aaa/a' }],
        ['aaa/a/aaa',  '*1/*2', { 1: 'aaa', 2: 'a/aaa' }],
        ['aa/aa/aa',   'aa/*2', { 2: 'aa/aa' }],
        ['aaa/aa/aa',  '*1/aa', { 1: 'aaa/aa' }],
        ['aaa/aa/aaa', '*1/*2', { 1: 'aaa', 2: 'aa/aaa' }],
      ],
    },
    // #endregion
    // #region complex combinations
    // TODO(fkleuver): this is not done yet. Plenty of edge cases still to be added (esp. with dynamic vs optional dynamic with star segments, etc)
    {
      routes: [
        ['a', []],
        ['a/a', []],
        ['a/a/a', []],
        ['a/a/aa', []],
        ['a/a/:3', [new Parameter('3', false, false, null)]],
        ['a/a/:3?/a', [new Parameter('3', true, false, null)]],
        ['a/a/:3?/aa', [new Parameter('3', true, false, null)]],
        ['a/aa', []],
        ['a/aa/a', []],
        ['a/aa/aa', []],
        ['a/aa/:3', [new Parameter('3', false, false, null)]],
        ['a/aa/:3?/a', [new Parameter('3', true, false, null)]],
        ['a/aa/:3?/aa', [new Parameter('3', true, false, null)]],
        ['a/:2', [new Parameter('2', false, false, null)]],
        ['a/:2/a', [new Parameter('2', false, false, null)]],
        ['a/:2/aa', [new Parameter('2', false, false, null)]],
        ['a/:2/:3', [new Parameter('2', false, false, null), new Parameter('3', false, false, null)]],
        ['a/:2/:3?/a', [new Parameter('2', false, false, null), new Parameter('3', true, false, null)]],
        ['a/:2/:3?/aa', [new Parameter('2', false, false, null), new Parameter('3', true, false, null)]],
        ['aa', []],
        ['aa/a', []],
        ['aa/a/a', []],
        ['aa/a/aa', []],
        ['aa/a/:3', [new Parameter('3', false, false, null)]],
        ['aa/a/:3?/a', [new Parameter('3', true, false, null)]],
        ['aa/a/:3?/aa', [new Parameter('3', true, false, null)]],
        ['aa/aa', []],
        ['aa/aa/a', []],
        ['aa/aa/aa', []],
        ['aa/aa/:3', [new Parameter('3', false, false, null)]],
        ['aa/aa/:3?/a', [new Parameter('3', true, false, null)]],
        ['aa/aa/:3?/aa', [new Parameter('3', true, false, null)]],
        ['aa/:2', [new Parameter('2', false, false, null)]],
        ['aa/:2/a', [new Parameter('2', false, false, null)]],
        ['aa/:2/aa', [new Parameter('2', false, false, null)]],
        ['aa/:2/:3', [new Parameter('2', false, false, null), new Parameter('3', false, false, null)]],
        ['aa/:2/:3?/a', [new Parameter('2', false, false, null), new Parameter('3', true, false, null)]],
        ['aa/:2/:3?/aa', [new Parameter('2', false, false, null), new Parameter('3', true, false, null)]],
        [':1', [new Parameter('1', false, false, null)]],
        [':1/a', [new Parameter('1', false, false, null)]],
        [':1/a/a', [new Parameter('1', false, false, null)]],
        [':1/a/aa', [new Parameter('1', false, false, null)]],
        [':1/a/:3', [new Parameter('1', false, false, null), new Parameter('3', false, false, null)]],
        [':1/a/:3?/a', [new Parameter('1', false, false, null), new Parameter('3', true, false, null)]],
        [':1/a/:3?/aa', [new Parameter('1', false, false, null), new Parameter('3', true, false, null)]],
        [':1/aa', [new Parameter('1', false, false, null)]],
        [':1/aa/a', [new Parameter('1', false, false, null)]],
        [':1/aa/aa', [new Parameter('1', false, false, null)]],
        [':1/aa/:3', [new Parameter('1', false, false, null), new Parameter('3', false, false, null)]],
        [':1/aa/:3?/a', [new Parameter('1', false, false, null), new Parameter('3', true, false, null)]],
        [':1/aa/:3?/aa', [new Parameter('1', false, false, null), new Parameter('3', true, false, null)]],
        [':1/:2', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/:2/a', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/:2/aa', [new Parameter('1', false, false, null), new Parameter('2', false, false, null)]],
        [':1/:2/:3', [new Parameter('1', false, false, null), new Parameter('2', false, false, null), new Parameter('3', false, false, null)]],
        [':1/:2/:3?/a', [new Parameter('1', false, false, null), new Parameter('2', false, false, null), new Parameter('3', true, false, null)]],
        [':1/:2/:3?/aa', [new Parameter('1', false, false, null), new Parameter('2', false, false, null), new Parameter('3', true, false, null)]],
      ],
      tests: [
        ['a',              'a',            null],
        ['a/a',            'a/a',          null],
        ['a/a/a',          'a/a/:3?/a',    { 3: void 0 }],
        ['a/a/aa',         'a/a/:3?/aa',   { 3: void 0 }],
        ['a/a/aaa',        'a/a/:3',       { 3: 'aaa' }],
        ['a/a/aaa/a',      'a/a/:3?/a',    { 3: 'aaa' }],
        ['a/a/aaa/aa',     'a/a/:3?/aa',   { 3: 'aaa' }],
        ['a/aa',           'a/aa',         null],
        ['a/aa/a',         'a/aa/:3?/a',   { 3: void 0 }],
        ['a/aa/aa',        'a/aa/:3?/aa',  { 3: void 0 }],
        ['a/aa/aaa',       'a/aa/:3',      { 3: 'aaa' }],
        ['a/aa/aaa/a',     'a/aa/:3?/a',   { 3: 'aaa' }],
        ['a/aa/aaa/aa',    'a/aa/:3?/aa',  { 3: 'aaa' }],
        ['a/aaa',          'a/:2',         { 2: 'aaa' }],
        ['a/aaa/a',        'a/:2/:3?/a',   { 2: 'aaa', 3: void 0 }],
        ['a/aaa/aa',       'a/:2/:3?/aa',  { 2: 'aaa', 3: void 0 }],
        ['a/aaa/aaa',      'a/:2/:3',      { 2: 'aaa', 3: 'aaa' }],
        ['a/aaa/aaa/a',    'a/:2/:3?/a',   { 2: 'aaa', 3: 'aaa' }],
        ['a/aaa/aaa/aa',   'a/:2/:3?/aa',  { 2: 'aaa', 3: 'aaa' }],
        ['aa',             'aa',           null],
        ['aa/a',           'aa/a',         null],
        ['aa/a/a',         'aa/a/:3?/a',   { 3: void 0 }],
        ['aa/a/aa',        'aa/a/:3?/aa',  { 3: void 0 }],
        ['aa/a/aaa',       'aa/a/:3',      { 3: 'aaa' }],
        ['aa/a/aaa/a',     'aa/a/:3?/a',   { 3: 'aaa' }],
        ['aa/a/aaa/aa',    'aa/a/:3?/aa',  { 3: 'aaa' }],
        ['aa/aa',          'aa/aa',        null],
        ['aa/aa/a',        'aa/aa/:3?/a',  { 3: void 0 }],
        ['aa/aa/aa',       'aa/aa/:3?/aa', { 3: void 0 }],
        ['aa/aa/aaa',      'aa/aa/:3',     { 3: 'aaa' }],
        ['aa/aa/aaa/a',    'aa/aa/:3?/a',  { 3: 'aaa' }],
        ['aa/aa/aaa/aa',   'aa/aa/:3?/aa', { 3: 'aaa' }],
        ['aa/aaa',         'aa/:2',        { 2: 'aaa' }],
        ['aa/aaa/a',       'aa/:2/:3?/a',  { 2: 'aaa', 3: void 0 }],
        ['aa/aaa/aa',      'aa/:2/:3?/aa', { 2: 'aaa', 3: void 0 }],
        ['aa/aaa/aaa',     'aa/:2/:3',     { 2: 'aaa', 3: 'aaa' }],
        ['aa/aaa/aaa/a',   'aa/:2/:3?/a',  { 2: 'aaa', 3: 'aaa' }],
        ['aa/aaa/aaa/aa',  'aa/:2/:3?/aa', { 2: 'aaa', 3: 'aaa' }],
        ['aaa',            ':1',           { 1: 'aaa' }],
        ['aaa/a',          ':1/a',         { 1: 'aaa' }],
        ['aaa/a/a',        ':1/a/:3?/a',   { 1: 'aaa', 3: void 0 }],
        ['aaa/a/aa',       ':1/a/:3?/aa',  { 1: 'aaa', 3: void 0 }],
        ['aaa/a/aaa',      ':1/a/:3',      { 1: 'aaa', 3: 'aaa' }],
        ['aaa/a/aaa/a',    ':1/a/:3?/a',   { 1: 'aaa', 3: 'aaa' }],
        ['aaa/a/aaa/aa',   ':1/a/:3?/aa',  { 1: 'aaa', 3: 'aaa' }],
        ['aaa/aa',         ':1/aa',        { 1: 'aaa' }],
        ['aaa/aa/a',       ':1/aa/:3?/a',  { 1: 'aaa', 3: void 0 }],
        ['aaa/aa/aa',      ':1/aa/:3?/aa', { 1: 'aaa', 3: void 0 }],
        ['aaa/aa/aaa',     ':1/aa/:3',     { 1: 'aaa', 3: 'aaa' }],
        ['aaa/aa/aaa/a',   ':1/aa/:3?/a',  { 1: 'aaa', 3: 'aaa' }],
        ['aaa/aa/aaa/aa',  ':1/aa/:3?/aa', { 1: 'aaa', 3: 'aaa' }],
        ['aaa/aaa',        ':1/:2',        { 1: 'aaa', 2: 'aaa' }],
        ['aaa/aaa/a',      ':1/:2/:3?/a',  { 1: 'aaa', 2: 'aaa', 3: void 0 }],
        ['aaa/aaa/aa',     ':1/:2/:3?/aa', { 1: 'aaa', 2: 'aaa', 3: void 0 }],
        ['aaa/aaa/aaa',    ':1/:2/:3',     { 1: 'aaa', 2: 'aaa', 3: 'aaa' }],
        ['aaa/aaa/aaa/a',  ':1/:2/:3?/a',  { 1: 'aaa', 2: 'aaa', 3: 'aaa' }],
        ['aaa/aaa/aaa/aa', ':1/:2/:3?/aa', { 1: 'aaa', 2: 'aaa', 3: 'aaa' }],
      ],
    },
    // #endregion

    // #region constrained routes
    {
      routes: [
        ['a/:id{{^\\d+$}}', [new Parameter('id', false, false, /^\d+$/)]],
        ['b/:tab{{^(foo|bar)$}}', [new Parameter('tab', false, false, /^(foo|bar)$/)]],
        ['c/:id{{^\\d+$}}?', [new Parameter('id', true, false, /^\d+$/)]],
        ['d/:id{{^\\d+$}}/:tab{{^(foo|bar)$}}?', [new Parameter('id', false, false, /^\d+$/), new Parameter('tab', true, false, /^(foo|bar)$/)]],
        ['e/:id{{^\\d+$}}?/:tab{{^(foo|bar)$}}?', [new Parameter('id', true, false, /^\d+$/), new Parameter('tab', true, false, /^(foo|bar)$/)]],
        [':id{{^\\d+$}}/f', [new Parameter('id', false, false, /^\d+$/)]],
        ['g/:id{{^\\d+$}}/h', [new Parameter('id', false, false, /^\d+$/)]],
        ['i/:tab{{foo|bar}}', [new Parameter('tab', false, false, /foo|bar/)]],
        ['j/:tab{{^(foo|bar)}}', [new Parameter('tab', false, false, /^(foo|bar)/)]],
        ['k/:tab{{(foo|bar)$}}', [new Parameter('tab', false, false, /(foo|bar)$/)]],
      ],
      tests: [
        ['a', null, null],
        ['a/42', 'a/:id{{^\\d+$}}', { id: '42' }],
        ['a/foo', null, null],
        ['a/f42', null, null],

        ['a/42f', null, null],
        ['b/foo', 'b/:tab{{^(foo|bar)$}}', { tab: 'foo' }],
        ['b/bar', 'b/:tab{{^(foo|bar)$}}', { tab: 'bar' }],
        ['b/fizz', null, null],
        ['b/foobar', null, null],
        ['b/barfoo', null, null],
        ['b/foof', null, null],
        ['b/ffoo', null, null],
        ['b/barf', null, null],
        ['b/fbar', null, null],

        ['c/42', 'c/:id{{^\\d+$}}?', { id: '42' }],
        ['c', 'c/:id{{^\\d+$}}?', { id: void 0 }],
        ['c/foo', null, null],

        ['d', null, null],
        ['d/42', 'd/:id{{^\\d+$}}/:tab{{^(foo|bar)$}}?', { id: '42', tab: void 0 }],
        ['d/42/foo', 'd/:id{{^\\d+$}}/:tab{{^(foo|bar)$}}?', { id: '42', tab: 'foo' }],
        ['d/42/bar', 'd/:id{{^\\d+$}}/:tab{{^(foo|bar)$}}?', { id: '42', tab: 'bar' }],
        ['d/foo/42', null, null],
        ['d/bar/42', null, null],

        ['e', 'e/:id{{^\\d+$}}?/:tab{{^(foo|bar)$}}?', { id: void 0, tab: void 0 }],
        ['e/42', 'e/:id{{^\\d+$}}?/:tab{{^(foo|bar)$}}?', { id: '42', tab: void 0 }],
        ['e/42/foo', 'e/:id{{^\\d+$}}?/:tab{{^(foo|bar)$}}?', { id: '42', tab: 'foo' }],
        ['e/42/bar', 'e/:id{{^\\d+$}}?/:tab{{^(foo|bar)$}}?', { id: '42', tab: 'bar' }],
        ['e/foo/42', null, null],
        ['e/bar/42', null, null],

        ['f', null, null],
        ['42/f', ':id{{^\\d+$}}/f', { id: '42' }],
        ['foo/f', null, null],
        ['f42/f', null, null],
        ['42f/f', null, null],

        ['g', null, null],
        ['g/42/h', 'g/:id{{^\\d+$}}/h', { id: '42' }],
        ['g/foo/h', null, null],
        ['g/f42/h', null, null],
        ['g/42f/h', null, null],

        ['i/foo', 'i/:tab{{foo|bar}}', { tab: 'foo' }],
        ['i/bar', 'i/:tab{{foo|bar}}', { tab: 'bar' }],
        ['i/fizz', null, null],
        ['i/foobar', 'i/:tab{{foo|bar}}', { tab: 'foobar' }],
        ['i/barfoo', 'i/:tab{{foo|bar}}', { tab: 'barfoo' }],
        ['i/foof', 'i/:tab{{foo|bar}}', { tab: 'foof' }],
        ['i/ffoo', 'i/:tab{{foo|bar}}', { tab: 'ffoo' }],
        ['i/barf', 'i/:tab{{foo|bar}}', { tab: 'barf' }],
        ['i/fbar', 'i/:tab{{foo|bar}}', { tab: 'fbar' }],

        ['k/foo', 'k/:tab{{(foo|bar)$}}', { tab: 'foo' }],
        ['k/bar', 'k/:tab{{(foo|bar)$}}', { tab: 'bar' }],
        ['k/fizz', null, null],
        ['k/foobar', 'k/:tab{{(foo|bar)$}}', { tab: 'foobar' }],
        ['k/barfoo', 'k/:tab{{(foo|bar)$}}', { tab: 'barfoo' }],
        ['k/foof', null, null],
        ['k/ffoo', 'k/:tab{{(foo|bar)$}}', { tab: 'ffoo' }],
        ['k/barf', null, null],
        ['k/fbar', 'k/:tab{{(foo|bar)$}}', { tab: 'fbar' }],
      ]
    }
    // #endregion
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
              title = `${title} reject '${path}' out of routes: [${routes.map(x => `'${x[0]}'`).join(',')}]`;

              it(title, function () {
                // Arrange
                const sut = new RouteRecognizer();
                for (const [route] of routes) {
                  sut.add({ path: route, handler: null }, false);
                }

                // Act
                const actual = sut.recognize(path);

                // Assert
                assert.strictEqual(actual, null);
              });
            } else {
              const input = `${leading}${path}${trailing}`;
              title = `${title} recognize '${input}' as '${match}' out of routes: [${routes.map(x => `'${x[0]}'`).join(',')}]`;

              it(title, function () {
                // Arrange
                const sut = new RouteRecognizer();
                for (const [route] of routes) {
                  sut.add({ path: route, handler: null }, false);
                }

                const params = { ...$params };
                const configurableRoute = new ConfigurableRoute(match, false, null);
                const endpoint = new Endpoint(configurableRoute, routes.find(([route]) => route === match)[1]);
                const expected = new RecognizedRoute(endpoint, params);

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

  for (const hasLeadingSlash of [true, false]) {
    for (const hasTrailingSlash of [true, false]) {
      for (const reverseAdd of [true, false]) {
        const $routes: [string, Parameter[], boolean][] = [
          ['', [], true],
          ['a', [], true],
          ['b/:1', [new Parameter('1', false, false, null)], true],
          ['b/:1/*2', [new Parameter('1', false, false, null), new Parameter('2', true, true, null)], false],
        ];
        const tests: [string, string | null, Record<string, string> | null][] = [
          ['b/1', 'b/:1', { 1: '1' }],
          ['b/1/2', 'b/:1/*2', { 1: '1', 2: '2' }],
          ['b/1/2/3', 'b/:1/*2', { 1: '1', 2: '2/3' }],
          ['a/1/2/3', `a/*${RESIDUE}`, { [RESIDUE]: '1/2/3' }],
        ];

        const routes = reverseAdd ? $routes.slice().reverse() : $routes;
        for (const [path, match, $params] of tests) {
          const leading = hasLeadingSlash ? '/' : '';
          const trailing = hasTrailingSlash ? '/' : '';

          let title = `should`;
          const input = `${leading}${path}${trailing}`;
          title = `${title} recognize '${input}' as '${match}' out of routes: [${routes.map(x => `'${x[0]}'`).join(',')}]`;

          it(title, function () {
            // Arrange
            const sut = new RouteRecognizer();
            for (const [route] of routes) {
              sut.add({ path: route, handler: null }, true);
            }

            for (const [route, parameters, residueAdded] of routes) {
              const endpoint = sut.getEndpoint(route);
              assert.notEqual(endpoint, null);
              assert.deepStrictEqual(endpoint.params, parameters);
              const residueEndpoint = sut.getEndpoint(`${route}/*${RESIDUE}`);
              assert.strictEqual(endpoint.residualEndpoint, residueEndpoint);
              if(residueAdded) {
                assert.notEqual(residueEndpoint, null);
              } else {
                assert.equal(residueEndpoint, null);
              }
            }

            const params = { ...$params };
            const configurableRoute = new ConfigurableRoute(match, false, null);
            let parameters: Parameter[];
            let residueEndpoint: Endpoint<any> | null = null;
            if(match.endsWith(`/*${RESIDUE}`)) {
              const $match = match.substring(0, match.length - (RESIDUE.length + 2));
              parameters = [
                ...routes.find(([route]) => route === $match)[1],
                new Parameter(RESIDUE, true, true, null),
              ];
            } else {
              const route = routes.find(([route]) => route === match);
              parameters = route[1];
              if (route[2]) {
                residueEndpoint = new Endpoint(
                  new ConfigurableRoute(`${route[0]}/*${RESIDUE}`, false, null),
                  [...parameters, new Parameter(RESIDUE, true, true, null)]
                );
              }
            }
            const endpoint = new Endpoint(configurableRoute, parameters);
            (endpoint as Writable<Endpoint<any>>).residualEndpoint = residueEndpoint;
            const expected = new RecognizedRoute(endpoint, params);

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

  for (const [route1, route2] of [
    ['', '?:1'],
    ['?:1', ''],
    ['a', 'a'],
    [':1', ':2'],
    ['*1', '*2'],
  ]) {
    it(`throws on clashing patterns: [${route1},${route2}]`, function () {
      const sut = new RouteRecognizer();
      let _err: Error | null = null;

      sut.add({ path: route1, handler: null });
      try {
        sut.add({ path: route2, handler: null });
      } catch(e) {
        _err = e;
      }

      assert.throws(() => sut.add({ path: route2, handler: null }), `Cannot add ambiguous route. The pattern '${route2}' clashes with '${route1}'`);
    });
  }
});
