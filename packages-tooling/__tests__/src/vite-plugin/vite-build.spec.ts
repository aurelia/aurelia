import { strict as assert } from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { minify } from 'html-minifier-terser';
import au from '@aurelia/vite-plugin';
import { createMemoryFileSystem } from '@aurelia/plugin-conventions';
import type { Plugin } from 'vite';

describe('vite-plugin build', function () {
  it('builds html.au.ts from source html while the bare html keeps flowing through the html pipeline', async function () {
    this.timeout(20000);

    const tempBase = path.resolve('.tmp-vite-build');
    fs.mkdirSync(tempBase, { recursive: true });
    const root = fs.mkdtempSync(path.join(tempBase, 'case-'));
    // eslint-disable-next-line no-eval
    const { build } = await (eval(`import('vite')`) as Promise<typeof import('vite')>);
    const normalize = (value: string) => value.replace(/\\/g, '/');
    const srcDir = path.join(root, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    const entryFile = path.join(srcDir, 'app.ts');
    fs.writeFileSync(entryFile, 'import * as appTemplateModule from \'./app.html\';\nexport const appTemplate = appTemplateModule.default;\nexport class App {}\n', 'utf8');
    const htmlFile = path.join(srcDir, 'app.html');
    const files = {
      'src/app.html': '<template><import from="./my-input.html"></import><div>${message | identity}</div>\n<input />\n<my-input value.bind="message2"></my-input>\n</template>',
      'src/my-input.html': '<template><div>input</div></template>',
    };

    const appHtmlId = normalize(htmlFile);
    const appHtmlModuleId = `${appHtmlId}.au.ts`;
    let capturedCompiledViewCode = '';
    let htmlProbeHits = 0;
    let htmlMinifyHits = 0;

    const externalizeAurelia = (): Plugin => ({
      name: 'externalize-aurelia',
      resolveId(source) {
        if (source.startsWith('@aurelia/')) {
          return { id: source, external: true };
        }
        return null;
      }
    });

    const memorySource = (): Plugin => ({
      name: 'memory-source',
      resolveId(source, importer) {
        if (source === './app.html' && importer != null && normalize(importer) === appHtmlModuleId) {
          return appHtmlId;
        }
        if (source.endsWith('app.html')) {
          return appHtmlId;
        }
        const normalizedMyInputId = normalize(path.join(srcDir, 'my-input.html'));
        if (source.endsWith('my-input.html')) {
          return normalizedMyInputId;
        }
        return null;
      },
      load(id) {
        const normalizedId = normalize(id);
        if (normalizedId === appHtmlId) {
          return files['src/app.html'];
        }
        if (normalizedId === normalize(path.join(srcDir, 'my-input.html'))) {
          return files['src/my-input.html'];
        }
        return null;
      }
    });

    const htmlProbe = (): Plugin => ({
      name: 'html-probe',
      enforce: 'pre',
      transform(code, id) {
        if (normalize(id) !== appHtmlId) {
          return null;
        }
        htmlProbeHits++;
        return code.replace(
          `<div>\${message | identity}</div>`,
          `<div data-html-probe="yes"><span>Mesage is:</span>\${message | identity}</div>`,
        );
      }
    });

    const minifyHtml = (): Plugin => ({
      name: 'html-minify',
      async transform(code, id) {
        if (!normalize(id).endsWith('.html')) {
          return null;
        }
        if (normalize(id) === appHtmlId) {
          htmlMinifyHits++;
        }
        return minify(code, {
          collapseWhitespace: true,
          removeComments: true,
        });
      }
    });

    const captureCompiledModules = (): Plugin => ({
      name: 'capture-compiled-modules',
      enforce: 'post',
      transform(code, id) {
        const normalizedId = normalize(id);
        if (normalizedId === appHtmlModuleId) {
          capturedCompiledViewCode = code;
        }
        return null;
      }
    });

    try {
      const result = await build({
        root,
        logLevel: 'silent',
        plugins: [
          externalizeAurelia(),
          memorySource(),
          htmlProbe(),
          minifyHtml(),
          au({
            include: /\.(ts|js|html)$/,
            fileSystem: createMemoryFileSystem(files, root)
          }),
          captureCompiledModules(),
        ],
        build: {
          write: false,
          minify: false,
          lib: {
            entry: entryFile,
            formats: ['es'],
            fileName: 'bundle',
          },
        },
      });

      const outputs = Array.isArray(result) ? result : [result];
      const generatedCode = outputs
        .flatMap(output => 'output' in output ? output.output : [])
        .map(file => ('code' in file ? file.code : ''))
        .join('\n');

      assert.match(capturedCompiledViewCode, /import \* as __au2Template from "\.\/app\.html";/);
      assert.match(capturedCompiledViewCode, /import \* as d0 from "\.\/my-input\.html\.au\.ts";/);
      assert.equal(htmlProbeHits, 1);
      assert.equal(htmlMinifyHits, 1);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
