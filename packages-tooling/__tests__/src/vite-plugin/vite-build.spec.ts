import { strict as assert } from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import au from '@aurelia/vite-plugin';
import { createMemoryFileSystem } from '@aurelia/plugin-conventions';
import type { Plugin } from 'vite';

describe('vite-plugin build', function () {
  it('compiles ?au-view from transformed html without mutating the bare html module', async function () {
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
    fs.writeFileSync(entryFile, 'export class App {}\n', 'utf8');
    const htmlFile = path.join(srcDir, 'app.html');
    const files = {
      'src/app.html': '<template><div>${message | identity}</div>\n<input />\n<my-input value.bind="message2"></my-input>\n</template>',
    };

    const appHtmlId = normalize(htmlFile);
    let capturedCompiledViewCode = '';

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
      resolveId(source) {
        if (source.endsWith('app.html')) {
          return appHtmlId;
        }
        return null;
      },
      load(id) {
        const normalizedId = normalize(id);
        if (normalizedId === appHtmlId) {
          return files['src/app.html'];
        }
        return null;
      }
    });

    const htmlProbe = (): Plugin => ({
      name: 'html-probe',
      enforce: 'pre',
      transform(code, id) {
        const [filePath] = id.split('?', 1);
        if (normalize(filePath) !== appHtmlId) {
          return null;
        }
        return code.replace(
          `<div>\${message | identity}</div>`,
          `<div data-html-probe="yes"><span>Mesage is:</span>\${message | identity}</div>`,
        );
      }
    });

    const captureCompiledView = (): Plugin => ({
      name: 'capture-compiled-view',
      enforce: 'post',
      transform(code, id) {
        if (normalize(id) === `${appHtmlId}?au-view`) {
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
          au({
            include: /\.(ts|js|html)$/,
            fileSystem: createMemoryFileSystem(
              files,
              root
            )
          }),
          captureCompiledView(),
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

      assert.match(capturedCompiledViewCode, /data-html-probe=\\"yes\\"/);
      assert.doesNotMatch(capturedCompiledViewCode, /<div>\$\{message \| identity\}<\/div>/);
      assert.match(generatedCode, /customElement/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
