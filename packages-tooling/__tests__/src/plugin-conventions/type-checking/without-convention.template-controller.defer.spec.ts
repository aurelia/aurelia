import { preprocessResource } from '@aurelia/plugin-conventions';
import { assertFailure, assertSuccess, createMarkupReader, prop } from './_shared';
import { nonConventionalOptions } from './without-convention.basic.spec';

describe('type-checking/without-convention.template-controller.defer', function () {
  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';

    describe(`language: ${lang}`, function () {
      function run(markup: string, expectedErrors: RegExp[] | null) {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('series', 'number[]', isTs)}
${prop('showDetails', 'boolean', isTs)}
${prop('heading', 'object', isTs)}
${prop('trigger', 'string', isTs)}
${prop('triggers', 'string[]', isTs)}
${prop('delay', 'number', isTs)}
${prop('loadChart', '() => Promise<unknown>', isTs)}
${prop('items', '{ name: string }[]', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        if (expectedErrors == null) assertSuccess(entry, result.code);
        else assertFailure(entry, result.code, expectedErrors);
      }

      describe('$defer in branches', function () {
        it('pass - $defer.error.message in defer-error', function () {
          run(`<section defer>\${series.length}</section>
<div defer-error>\${$defer.error.message}</div>`, null);
        });

        it('pass - $defer.retry()', function () {
          run(`<section defer>\${series.length}</section>
<div defer-error><button click.trigger="$defer.retry()">Retry</button></div>`, null);
        });

        it('fail - $defer.retyr()', function () {
          run(`<section defer>\${series.length}</section>
<div defer-error><button click.trigger="$defer.retyr()">Retry</button></div>`, [/Property 'retyr' does not exist/]);
        });

        // The checker cannot rewrite binary expressions (a pre-existing limitation), so the literal union is
        // asserted through member access and the diagnostic text instead of `$defer.state === '...'`.
        it('pass - $defer.state in every branch', function () {
          run(`<section defer>\${series.length}</section>
<div defer-placeholder>\${$defer.state.toUpperCase()}</div>
<div defer-loading>\${$defer.state.length}</div>
<div defer-error>\${$defer.state}</div>`, null);
        });

        it('fail - $defer.state is the state literal union', function () {
          run(`<section defer>\${series.length}</section>
<div defer-error>\${$defer.state.toFixed()}</div>`, [/Property 'toFixed' does not exist on type '"placeholder" \| "loading" \| "complete" \| "error"'/]);
        });

        it('pass - $defer in a binding on the branch element placed before the branch attribute', function () {
          run(`<section defer>\${series.length}</section>
<div data-state.bind="$defer.state" defer-error>\${$defer.error}</div>`, null);
        });

        it('fail - $defer in the deferred content', function () {
          run(`<section defer>\${$defer.state}</section>
<div defer-error>\${$defer.error}</div>`, [/Property '\$defer' does not exist/]);
        });

        it('fail - $defer outside branches', function () {
          run(`<section defer>\${series.length}</section>
<div defer-error>\${$defer.error}</div>
<div>\${$defer.state}</div>`, [/Property '\$defer' does not exist/]);
        });

        it('fail - VM typo inside a branch', function () {
          run(`<section defer>\${series.length}</section>
<div defer-error>\${$defer.error} \${seires}</div>`, [/Property 'seires' does not exist/]);
        });
      });

      describe('multi-binding values', function () {
        it('pass - when.bind, load.bind and target.bind', function () {
          run(`<section defer="on: viewport; prefetch: idle; when.bind: showDetails; target.bind: heading; load.bind: loadChart">
  \${series.length}
</section>`, null);
        });

        for (const [part, typo] of [['when.bind: showDetails', 'when.bind: showDetials'], ['load.bind: loadChart', 'load.bind: loadChrt'], ['target.bind: heading', 'target.bind: haeding']] as const) {
          it(`fail - ${typo}`, function () {
            const parts = ['on: viewport', 'when.bind: showDetails', 'target.bind: heading', 'load.bind: loadChart'].map(p => p === part ? typo : p);
            run(`<section defer="${parts.join('; ')}">\${series.length}</section>`, [new RegExp(`Property '${typo.split(': ')[1]}' does not exist`)]);
          });
        }

        it('pass - interpolated literal part', function () {
          run(`<section defer="on: \${trigger}; when.bind: showDetails">\${series.length}</section>`, null);
        });

        it('fail - interpolated literal part typo', function () {
          run(`<section defer="on: \${triger}; when.bind: showDetails">\${series.length}</section>`, [/Property 'triger' does not exist/]);
        });

        it('pass - plain defer values are left alone', function () {
          run(`<section defer>\${series.length}</section>
<section defer="viewport">\${series.length}</section>
<section defer="on: viewport">\${series.length}</section>`, null);
        });

        it('pass - defer.bind', function () {
          run(`<section defer.bind="triggers">\${series.length}</section>`, null);
        });

        it('fail - defer.bind typo', function () {
          run(`<section defer.bind="trigers">\${series.length}</section>`, [/Property 'trigers' does not exist/]);
        });

        it('pass - defer-loading="after.bind: delay; minimum: 400"', function () {
          run(`<section defer>\${series.length}</section>
<div defer-loading="after.bind: delay; minimum: 400">\${$defer.state}</div>`, null);
        });

        it('fail - defer-loading="after.bind: dealy; minimum: 400"', function () {
          run(`<section defer>\${series.length}</section>
<div defer-loading="after.bind: dealy; minimum: 400">\${$defer.state}</div>`, [/Property 'dealy' does not exist/]);
        });

        it('fail - $defer in the defer-loading bindings (evaluated in the surrounding scope)', function () {
          run(`<section defer>\${series.length}</section>
<div defer-loading="after.bind: $defer.state">loading</div>`, [/Property '\$defer' does not exist/]);
        });

        it('pass - defer-loading.bind', function () {
          run(`<section defer>\${series.length}</section>
<div defer-loading.bind="delay">loading</div>`, null);
        });

        it('fail - defer-loading.bind typo', function () {
          run(`<section defer>\${series.length}</section>
<div defer-loading.bind="dealy">loading</div>`, [/Property 'dealy' does not exist/]);
        });
      });

      describe('content scoping', function () {
        it('pass - VM property inside defer content', function () {
          run(`<section defer="on: viewport"><span>\${series.length}</span></section>`, null);
        });

        it('fail - VM property typo inside defer content', function () {
          run(`<section defer="on: viewport"><span>\${seires.length}</span></section>`, [/Property 'seires' does not exist/]);
        });

        it('pass - nested defer', function () {
          run(`<section defer>
  <div defer="when.bind: showDetails">\${series.length}</div>
  <div defer-error>\${$defer.error.message} \${delay}</div>
</section>
<div defer-error><button click.trigger="$defer.retry()">\${$defer.state}</button></div>`, null);
        });

        it('fail - nested defer', function () {
          run(`<section defer>
  <div defer="when.bind: showDetials">\${series.length}</div>
  <div defer-error>\${$defer.retyr()}</div>
</section>
<div defer-error>\${$defer.state}</div>`, [/Property 'showDetials' does not exist/, /Property 'retyr' does not exist/]);
        });

        it('pass - branch inside repeat.for resolves the repeat variable', function () {
          run(`<div repeat.for="item of items">
  <section defer>\${item.name}</section>
  <div defer-error>\${item.name.toUpperCase()} \${$defer.error.message}</div>
</div>`, null);
        });

        it('fail - branch inside repeat.for with a repeat variable typo', function () {
          run(`<div repeat.for="item of items">
  <section defer>\${item.name}</section>
  <div defer-error>\${item.nme} \${$defer.error.message}</div>
</div>`, [/Property 'nme' does not exist/]);
        });
      });
    });
  }
});
