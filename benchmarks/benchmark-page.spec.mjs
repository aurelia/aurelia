import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import { startSynchronousApplication } from './utils/start-application.mjs';

void describe('benchmark application startup', () => {
  void it('keeps immediate app hydration inside the cold compilation timing boundary', async () => {
    const moduleUrl = source => `data:text/javascript,${encodeURIComponent(source)}`;
    const frameworkUrl = moduleUrl(`
      export const events = [];
      export const StandardConfiguration = {};
      export const CustomElement = { define(_definition, Type) { events.push('define'); return Type; } };
      export class Aurelia {
        register() { events.push('register'); return this; }
        app() { events.push('compile'); return this; }
        start() { events.push('start'); }
      }
    `);
    const source = (await readFile(new URL('app-template-compilation/index.js', import.meta.url), 'utf8'))
      .replace("'@aurelia/runtime-html'", JSON.stringify(frameworkUrl))
      .replace("import { ExpressionParser } from '@aurelia/expression-parser';", 'const ExpressionParser = class {};')
      .replace("'../utils/start-application.mjs'", `'${new URL('utils/start-application.mjs', import.meta.url).href}'`);
    const { prepareCompilationApplication } = await import(moduleUrl(source));
    const { events } = await import(frameworkUrl);
    const start = prepareCompilationApplication({}, [{ title: 'static', path: 'M0 0', text: 'plain' }]);
    assert.deepEqual(events, ['define', 'register']);
    start();
    assert.deepEqual(events, ['define', 'register', 'compile', 'start']);
  });

  void it('returns the application after synchronous startup', () => {
    const events = [];
    const application = {
      start() {
        events.push('start');
      },
    };

    assert.equal(startSynchronousApplication(application), application);
    assert.deepEqual(events, ['start']);
  });

  void it('rejects asynchronous startup', () => {
    const application = { start: () => Promise.resolve() };
    assert.throws(
      () => startSynchronousApplication(application),
      /Benchmark application startup must remain synchronous/,
    );
  });
});
