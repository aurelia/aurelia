import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import au from '@aurelia/vite-plugin';

describe('vite-plugin standard decorators', function () {
  function getHook<T extends Function>(hook: T | { handler: T } | undefined): T | undefined {
    if (hook == null) return void 0;
    return typeof hook === 'function' ? hook : hook.handler;
  }

  function createFixture(useDefineForClassFields?: boolean) {
    const root = fs.mkdtempSync(path.join(fs.realpathSync.native(path.resolve('.')), '.tmp-au-vite-decorators-'));
    const srcDir = path.join(root, 'src');
    const tsFile = path.join(srcDir, 'subject.ts');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(root, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        ...(useDefineForClassFields === void 0 ? {} : { useDefineForClassFields }),
      },
      include: ['src'],
    }), 'utf8');
    return { root, srcDir, tsFile };
  }

  function getDecoratorPlugin(options: Parameters<typeof au>[0] = {}) {
    const plugin = au({
      standardDecoratorInclude: /\.[cm]?[jt]sx?$/,
      ...options,
    }).find(candidate => candidate.name === 'aurelia:standard-decorators');
    assert.ok(plugin);
    return plugin;
  }

  function enableForVite8(plugin: ReturnType<typeof getDecoratorPlugin>) {
    getHook(plugin.configResolved)?.call({}, { oxc: {} } as unknown as import('vite').ResolvedConfig);
  }

  function createTransformContext() {
    const watchedFiles: string[] = [];
    return {
      watchedFiles,
      context: {
        addWatchFile(id: string) {
          watchedFiles.push(id);
        },
      },
    };
  }

  async function transform(
    plugin: ReturnType<typeof getDecoratorPlugin>,
    code: string,
    id: string,
  ) {
    const { context, watchedFiles } = createTransformContext();
    const result = await getHook(plugin.transform)?.call(context, code, id);
    return { result: typeof result === 'string' ? { code: result, map: null } : result, watchedFiles };
  }

  function importCode(root: string, code: string) {
    const outputPath = path.join(root, `output-${Date.now()}-${Math.random().toString(16).slice(2)}.mjs`);
    fs.writeFileSync(outputPath, code, 'utf8');
    const serialized = execFileSync(process.execPath, [
      '--input-type=module',
      '--eval',
      `import(process.argv[1]).then(module => process.stdout.write(JSON.stringify(
        module,
        (_key, value) => value === undefined ? '__AU_UNDEFINED__' : value,
      )))`,
      pathToFileURL(outputPath).href,
    ], {
      cwd: root,
      encoding: 'utf8',
    });
    return restoreUndefined(JSON.parse(serialized));
  }

  function restoreUndefined(value: any): any {
    if (value == null || typeof value !== 'object') {
      return value;
    }
    for (const key of Object.keys(value)) {
      value[key] = value[key] === '__AU_UNDEFINED__' ? void 0 : restoreUndefined(value[key]);
    }
    return value;
  }

  it('places convention processing immediately before standard decorator lowering', function () {
    const plugins = au();

    assert.deepEqual(
      plugins.map(plugin => plugin.name),
      ['aurelia:dev-alias', 'au2', 'aurelia:standard-decorators'],
    );
    assert.equal(plugins[1].enforce, 'pre');
    assert.equal(plugins[2].enforce, 'pre');
  });

  it('creates an isolated standard decorator plugin for each worker bundle', function () {
    const plugin = getDecoratorPlugin();
    const config = getHook(plugin.config)?.call(
      {},
      {},
      { command: 'build', mode: 'production' },
    ) as import('vite').UserConfig;
    const createWorkerPlugins = config?.worker?.plugins;
    assert.ok(createWorkerPlugins);

    const first = createWorkerPlugins()[0] as import('vite').Plugin;
    const second = createWorkerPlugins()[0] as import('vite').Plugin;
    assert.equal(first.name, 'aurelia:standard-decorators');
    assert.equal(first.enforce, 'pre');
    assert.notEqual(first, second);
    assert.equal(first.config, void 0);
  });

  it('is inactive by default on Vite 7', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin();
    getHook(plugin.configResolved)?.call({}, {} as import('vite').ResolvedConfig);

    try {
      const { result } = await transform(plugin, '@dec export class Subject {}', fixture.tsFile);
      assert.equal(result, void 0);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('lowers decorators added by conventions by default on Vite 8', async function () {
    const fixture = createFixture();
    const htmlFile = path.join(fixture.srcDir, 'subject.html');
    fs.writeFileSync(htmlFile, '<template>Hello</template>', 'utf8');
    const plugins = au({
      include: /\.(?:ts|html)$/,
      standardDecoratorInclude: /\.ts$/,
    });
    const conventionPlugin = plugins[1];
    const decoratorPlugin = plugins[2];
    getHook(conventionPlugin.configResolved)?.call({}, {
      command: 'build',
    } as import('vite').ResolvedConfig);
    enableForVite8(decoratorPlugin);

    try {
      const conventionResult = await getHook(conventionPlugin.transform)?.call(
        {},
        'export class Subject {}\n',
        fixture.tsFile,
      );
      const conventionCode = typeof conventionResult === 'string' ? conventionResult : conventionResult?.code;
      assert.match(String(conventionCode), /@customElement/);

      const { result } = await transform(decoratorPlugin, String(conventionCode), fixture.tsFile);
      assert.ok(result);
      assert.doesNotMatch(result.code, /@customElement/);
      assert.match(result.code, /@swc\/helpers\/_\/_apply_decs_2311/);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('rejects post-convention processing on Vite 8 unless transformation is explicitly disabled', function () {
    const plugin = getDecoratorPlugin({ pre: false });
    assert.throws(
      () => enableForVite8(plugin),
      /`pre: false` cannot be used with standard decorator transformation/,
    );

    const disabledPlugin = getDecoratorPlugin({
      pre: false,
      transformStandardDecorators: false,
    });
    assert.doesNotThrow(() => enableForVite8(disabledPlugin));
  });

  it('does not apply convention-only filters to standard decorator lowering', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({
      include: /\.html$/,
      transformStandardDecorators: true,
    });

    try {
      const { result } = await transform(plugin, '@dec class Subject {}', fixture.tsFile);
      assert.ok(result);
      assert.doesNotMatch(result.code, /@dec/);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('resolves the default decorator filter from the Vite project root', async function () {
    const fixture = createFixture();
    const plugin = au({ transformStandardDecorators: true })
      .find(candidate => candidate.name === 'aurelia:standard-decorators');
    assert.ok(plugin);
    getHook(plugin.configResolved)?.call({}, {
      root: fixture.root,
      command: 'build',
      oxc: {},
      build: { rollupOptions: {} },
      worker: {},
    } as unknown as import('vite').ResolvedConfig);

    try {
      const { result } = await transform(plugin, '@dec class Subject {}', fixture.tsFile);
      assert.ok(result);
      assert.doesNotMatch(result.code, /@dec/);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  if (process.platform === 'win32') {
    it('does not rewrite decorator module ids to a different Windows drive', async function () {
      const currentDrive = process.cwd()[0].toUpperCase();
      const otherDrive = currentDrive === 'Z' ? 'Y' : 'Z';
      const moduleId = `${otherDrive}:\\src\\subject.ts`;
      const plugin = getDecoratorPlugin({
        standardDecoratorInclude: new RegExp(`^${otherDrive}:[\\\\/]`),
        transformStandardDecorators: true,
      });

      const { result } = await transform(plugin, '@dec class Subject {}', moduleId);
      assert.ok(result);
      assert.doesNotMatch(result.code, /@dec/);
    });
  }

  const classFieldSemanticsSource = `
function decorateField(_value, _context) {
  return value => value;
}
class Base {
  set value(value) {
    this.setterValue = value;
  }
}
class Subject extends Base {
  @decorateField value: string = 'initialized';
}
const subject = new Subject();
export const observation = {
  own: Object.hasOwn(subject, 'value'),
  setterValue: subject.setterValue,
  value: subject.value,
};
`;

  for (const useDefineForClassFields of [false, true, void 0]) {
    const expectedDefineSemantics = useDefineForClassFields ?? true;
    const setting = useDefineForClassFields === void 0 ? 'omitted with an ES2022 target' : String(useDefineForClassFields);
    it(`preserves TypeScript class field semantics when useDefineForClassFields is ${setting}`, async function () {
      const fixture = createFixture(useDefineForClassFields);
      const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });

      try {
        const { result, watchedFiles } = await transform(plugin, classFieldSemanticsSource, fixture.tsFile);
        assert.ok(result);
        assert.deepEqual(watchedFiles, [path.join(fixture.root, 'tsconfig.json').replaceAll('\\', '/')]);

        const module = await importCode(fixture.root, result.code);
        assert.deepEqual(
          module.observation,
          expectedDefineSemantics
            ? { own: true, setterValue: void 0, value: 'initialized' }
            : { own: false, setterValue: 'initialized', value: void 0 },
        );
      } finally {
        fs.rmSync(fixture.root, { recursive: true, force: true });
      }
    });
  }

  it('uses define semantics for future TypeScript targets', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    fs.writeFileSync(path.join(fixture.root, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {
        target: 'ES2026',
      },
      include: ['src'],
    }), 'utf8');

    try {
      const { result } = await transform(plugin, classFieldSemanticsSource, fixture.tsFile);
      assert.ok(result);

      const module = await importCode(fixture.root, result.code);
      assert.deepEqual(module.observation, {
        own: true,
        setterValue: void 0,
        value: 'initialized',
      });
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('uses the referenced TypeScript project that owns a source file', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    const solutionPath = path.join(fixture.root, 'tsconfig.json');
    const appProjectPath = path.join(fixture.root, 'tsconfig.app.JSON');
    fs.writeFileSync(solutionPath, JSON.stringify({
      files: [],
      references: [{ path: './tsconfig.app.JSON' }],
    }), 'utf8');
    fs.writeFileSync(appProjectPath, JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        useDefineForClassFields: false,
      },
      include: ['src'],
    }), 'utf8');

    try {
      const { result, watchedFiles } = await transform(plugin, classFieldSemanticsSource, fixture.tsFile);
      assert.ok(result);
      assert.deepEqual(watchedFiles, [
        solutionPath.replaceAll('\\', '/'),
        appProjectPath.replaceAll('\\', '/'),
      ]);

      const module = await importCode(fixture.root, result.code);
      assert.deepEqual(module.observation, {
        own: false,
        setterValue: 'initialized',
        value: void 0,
      });
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  const importPreservationSource = `
import { Marker } from './side-effect.mjs';
function dec(value) {
  return value;
}
@dec class Subject {
  value!: Marker;
}
export const sideEffectCount = globalThis.sideEffectCount;
`;

  it('preserves value imports requested by verbatimModuleSyntax', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    fs.writeFileSync(path.join(fixture.root, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        verbatimModuleSyntax: true,
      },
      include: ['src'],
    }), 'utf8');
    fs.writeFileSync(
      path.join(fixture.root, 'side-effect.mjs'),
      'globalThis.sideEffectCount = (globalThis.sideEffectCount ?? 0) + 1;\nexport class Marker {}\n',
      'utf8',
    );

    try {
      const { result } = await transform(plugin, importPreservationSource, fixture.tsFile);
      assert.ok(result);
      assert.match(result.code, /from ['"]\.\/side-effect\.mjs['"]/);

      const module = await importCode(fixture.root, result.code);
      assert.equal(module.sideEffectCount, 1);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  for (const [option, value] of [
    ['preserveValueImports', true],
    ['importsNotUsedAsValues', 'preserve'],
    ['importsNotUsedAsValues', 'error'],
  ] as const) {
    it(`honors the deprecated ${option} import-preservation setting`, async function () {
      const fixture = createFixture();
      const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
      fs.writeFileSync(path.join(fixture.root, 'tsconfig.json'), JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          [option]: value,
        },
        include: ['src'],
      }), 'utf8');

      try {
        const { result } = await transform(plugin, importPreservationSource, fixture.tsFile);
        assert.ok(result);
        assert.match(result.code, /from ['"]\.\/side-effect\.mjs['"]/);
      } finally {
        fs.rmSync(fixture.root, { recursive: true, force: true });
      }
    });
  }

  it('retains mutable TypeScript enum member reads', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    const source = `
function dec(value) {
  return value;
}
enum MutableEnum {
  Value = 1,
}
@dec class Subject {}
Object.assign(MutableEnum, { Value: 7 });
export const value = MutableEnum.Value;
`;

    try {
      const { result } = await transform(plugin, source, fixture.tsFile);
      assert.ok(result);

      const module = await importCode(fixture.root, result.code);
      assert.equal(module.value, 7);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('initializes decorated fields after super in a derived class', async function () {
    const fixture = createFixture(false);
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    const source = `
function provideDefault(_value, _context) {
  return value => value ?? 'decorated';
}
class Base {
  constructor() {
    this.baseInitialized = true;
  }
}
class Subject extends Base {
  @provideDefault #value: string;
  get value() {
    return this.#value;
  }
}
const subject = new Subject();
export const observation = {
  baseInitialized: subject.baseInitialized,
  value: subject.value,
};
`;

    try {
      const { result } = await transform(plugin, source, fixture.tsFile);
      assert.ok(result);

      const module = await importCode(fixture.root, result.code);
      assert.deepEqual(module.observation, {
        baseInitialized: true,
        value: 'decorated',
      });
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('supports standard decorator replacement, initializers, metadata, stacking, and private/static members', async function () {
    const fixture = createFixture(true);
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    const source = `
const calls = [];
function mark(label) {
  return function (value, context) {
    calls.push('decorate:' + label + ':' + context.kind);
    context.metadata[label] = context.name;
    context.addInitializer(function () {
      calls.push('initialize:' + label);
    });
    if (context.kind === 'field') {
      return initial => label + ':' + initial;
    }
    if (context.kind === 'method') {
      return function (...args) {
        return label + ':' + value.call(this, ...args);
      };
    }
    if (context.kind === 'getter') {
      return function () {
        return label + ':' + value.call(this);
      };
    }
    if (context.kind === 'accessor') {
      return {
        init(initial) {
          return initial + 1;
        },
      };
    }
  };
}
@mark('class')
class Subject {
  @mark('outer') @mark('inner') field = 'value';
  @mark('method') method() {
    return 'value';
  }
  @mark('getter') get getter() {
    return 'value';
  }
  @mark('accessor') accessor count = 1;
  @mark('private') #secret = 'secret';
  @mark('static') static value = 'static';
  readSecret() {
    return this.#secret;
  }
}
const subject = new Subject();
const metadataKey = Symbol.metadata ?? Symbol.for('Symbol.metadata');
export const observation = {
  field: subject.field,
  method: subject.method(),
  getter: subject.getter,
  count: subject.count,
  secret: subject.readSecret(),
  staticValue: Subject.value,
  metadata: Subject[metadataKey],
  calls,
};
`;

    try {
      const { result } = await transform(plugin, source, fixture.tsFile);
      assert.ok(result);

      const module = await importCode(fixture.root, result.code);
      assert.equal(module.observation.field, 'inner:outer:value');
      assert.equal(module.observation.method, 'method:value');
      assert.equal(module.observation.getter, 'getter:value');
      assert.equal(module.observation.count, 2);
      assert.equal(module.observation.secret, 'private:secret');
      assert.equal(module.observation.staticValue, 'static:static');
      assert.equal(module.observation.metadata.class, 'Subject');
      assert.equal(module.observation.metadata.inner, 'field');
      assert.ok(module.observation.calls.includes('initialize:class'));
      assert.ok(module.observation.calls.includes('initialize:private'));
      assert.ok(
        module.observation.calls.indexOf('decorate:inner:field')
        < module.observation.calls.indexOf('decorate:outer:field'),
      );
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('parses decorator-before-export JavaScript and preserves JSX for Oxc', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({
      transformStandardDecorators: true,
      include: /\.(?:jsx|tsx)$/,
    });
    const jsxFile = path.join(fixture.srcDir, 'subject.jsx');
    const source = `
function increment(_value, _context) {
  return { init(value) { return value + 1; } };
}
@((value) => value) export class Subject {
  @increment accessor value = 1;
  render() {
    return <div>{this.value}</div>;
  }
}
`;

    try {
      const { result } = await transform(plugin, source, jsxFile);
      assert.ok(result);
      assert.match(result.code, /<div>/);
      assert.doesNotMatch(result.code, /React\.createElement/);
      assert.doesNotMatch(result.code, /@\(\(/);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('preserves implicit TSX factory imports for Oxc', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({
      transformStandardDecorators: true,
      include: /\.tsx$/,
    });
    const tsxFile = path.join(fixture.srcDir, 'subject.tsx');
    const source = `
import { createElement } from './jsx-factory';
function mark(value) {
  return value;
}
@mark class Subject {
  render() {
    return <div>factory import</div>;
  }
}
`;

    try {
      const { result } = await transform(plugin, source, tsxFile);
      assert.ok(result);
      assert.match(result.code, /import \{ createElement \} from ['"]\.\/jsx-factory['"]/);
      assert.match(result.code, /<div>/);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('keeps decorator helpers inline for CommonJS modules', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.cjs$/ });
    const commonJsFile = path.join(fixture.srcDir, 'subject.cjs');
    const source = `
function mark(value, context) {
  context.addInitializer(function () {
    this.decorated = true;
  });
}
@mark class Subject {}
process.stdout.write(String(Subject.decorated));
`;

    try {
      const { result } = await transform(plugin, source, commonJsFile);
      assert.ok(result);
      assert.doesNotMatch(result.code, /@swc\/helpers/);
      assert.doesNotMatch(result.code, /^import /m);

      const outputPath = path.join(fixture.root, 'output.cjs');
      fs.writeFileSync(outputPath, result.code, 'utf8');
      assert.equal(execFileSync(process.execPath, [outputPath], { encoding: 'utf8' }), 'true');
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('keeps decorator helpers inline for CommonJS TypeScript modules', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.cts$/ });
    const commonJsFile = path.join(fixture.srcDir, 'subject.cts');
    const source = `
function mark(value, _context) {
  return value;
}
@mark class Subject {}
export = Subject;
`;

    try {
      const { result } = await transform(plugin, source, commonJsFile);
      assert.ok(result);
      assert.doesNotMatch(result.code, /@swc\/helpers/);
      assert.doesNotMatch(result.code, /^import /m);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('keeps decorator helpers inline when a build externalization policy could intercept them', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    getHook(plugin.configResolved)?.call({}, {
      command: 'build',
      oxc: {},
      build: {
        lib: false,
        rollupOptions: {
          external: () => true,
        },
      },
      worker: {},
    } as unknown as import('vite').ResolvedConfig);

    try {
      const { result } = await transform(
        plugin,
        'function dec(value) { return value; }\n@dec export class Subject {}',
        fixture.tsFile,
      );
      assert.ok(result);
      assert.doesNotMatch(result.code, /@swc\/helpers/);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('recognizes secondary decorator helpers in static external lists', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    getHook(plugin.configResolved)?.call({}, {
      command: 'build',
      oxc: {},
      build: {
        lib: false,
        rollupOptions: {
          external: ['@swc/helpers/_/_identity'],
        },
      },
      worker: {},
    } as unknown as import('vite').ResolvedConfig);

    try {
      const { result } = await transform(
        plugin,
        'function dec(value) { return value; }\n@dec class Subject { static value = 1; }',
        fixture.tsFile,
      );
      assert.ok(result);
      assert.doesNotMatch(result.code, /@swc\/helpers/);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  for (const [label, external] of [
    ['a helper subpath', ['@swc/helpers/_/_apply_decs_2311']],
    ['the helper package', ['@swc/helpers']],
    ['all dependencies', true],
  ] as const) {
    it(`keeps decorator helpers inline when SSR externalizes ${label}`, async function () {
      const fixture = createFixture();
      const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
      getHook(plugin.configResolved)?.call({}, {
        command: 'serve',
        oxc: {},
        ssr: { external },
      } as unknown as import('vite').ResolvedConfig);

      try {
        const { result } = await transform(
          plugin,
          'function dec(value) { return value; }\n@dec export class Subject {}',
          fixture.tsFile,
        );
        assert.ok(result);
        assert.doesNotMatch(result.code, /@swc\/helpers/);
      } finally {
        fs.rmSync(fixture.root, { recursive: true, force: true });
      }
    });
  }

  it('keeps decorator helpers inline for environment-level externalization', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    getHook(plugin.configResolved)?.call({}, {
      command: 'serve',
      oxc: {},
      environments: {
        ssr: {
          resolve: {
            external: ['@swc/helpers'],
          },
        },
      },
    } as unknown as import('vite').ResolvedConfig);

    try {
      const { result } = await transform(
        plugin,
        'function dec(value) { return value; }\n@dec export class Subject {}',
        fixture.tsFile,
      );
      assert.ok(result);
      assert.doesNotMatch(result.code, /@swc\/helpers/);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('shares decorator helpers in library builds without a matching externalization policy', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    getHook(plugin.configResolved)?.call({}, {
      command: 'build',
      oxc: {},
      build: {
        lib: { entry: fixture.tsFile },
        rollupOptions: {
          external: [],
        },
      },
      worker: {},
    } as unknown as import('vite').ResolvedConfig);

    try {
      const { result } = await transform(
        plugin,
        'function dec(value) { return value; }\n@dec export class Subject {}',
        fixture.tsFile,
      );
      assert.ok(result);
      assert.match(result.code, /@swc\/helpers\/_\/_apply_decs_2311/);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('rejects TypeScript legacy decorator settings with project and source guidance', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    fs.writeFileSync(path.join(fixture.root, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
      include: ['src'],
    }), 'utf8');

    try {
      await assert.rejects(
        () => transform(plugin, 'function dec() {}\n@dec class Subject {}', fixture.tsFile),
        error => {
          assert.match(String(error), /experimentalDecorators/);
          assert.match(String(error), /emitDecoratorMetadata/);
          assert.match(String(error), /subject\.ts/);
          assert.match(String(error), /tsconfig\.json/);
          assert.match(String(error), /transformStandardDecorators: false/);
          return true;
        },
      );
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('rejects custom Oxc TypeScript and decorator transforms with migration guidance', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    getHook(plugin.configResolved)?.call({}, {
      root: fixture.root,
      command: 'build',
      oxc: {
        include: /\.ts$/,
        decorator: {
          legacy: true,
        },
        typescript: {
          onlyRemoveTypeImports: true,
        },
      },
      build: { rollupOptions: {} },
      worker: {},
    } as unknown as import('vite').ResolvedConfig);

    try {
      await assert.rejects(
        () => transform(plugin, 'function dec() {}\n@dec class Subject {}', fixture.tsFile),
        error => {
          assert.match(String(error), /oxc\.typescript\.onlyRemoveTypeImports/);
          assert.match(String(error), /oxc\.decorator\.legacy/);
          assert.match(String(error), /oxc\.include/);
          assert.match(String(error), /subject\.ts/);
          assert.match(String(error), /transformStandardDecorators: false/);
          return true;
        },
      );
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('allows TypeScript-only Oxc settings for decorated JavaScript', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.js$/ });
    const jsFile = path.join(fixture.srcDir, 'subject.js');
    getHook(plugin.configResolved)?.call({}, {
      root: fixture.root,
      command: 'build',
      oxc: {
        typescript: {
          onlyRemoveTypeImports: true,
        },
      },
      build: { rollupOptions: {} },
      worker: {},
    } as unknown as import('vite').ResolvedConfig);

    try {
      const { result } = await transform(plugin, 'function dec() {}\n@dec class Subject {}', jsFile);
      assert.ok(result);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('rejects disabled Oxc for decorated modules with custom-compiler guidance', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.tsx$/ });
    const tsxFile = path.join(fixture.srcDir, 'subject.tsx');
    getHook(plugin.configResolved)?.call({}, {
      root: fixture.root,
      command: 'build',
      oxc: false,
      build: { rollupOptions: {} },
      worker: {},
    } as unknown as import('vite').ResolvedConfig);

    try {
      await assert.rejects(
        () => transform(plugin, 'function dec() {}\n@dec class Subject { render() { return <div />; } }', tsxFile),
        error => {
          assert.match(String(error), /oxc: false/);
          assert.match(String(error), /transformStandardDecorators: false/);
          return true;
        },
      );
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('skips transport imports and decorator-like comments but transforms worker sources', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });

    try {
      const raw = await transform(plugin, '@dec class Subject {}', `${fixture.tsFile}?raw`);
      const worker = await transform(plugin, '@dec class Subject {}', `${fixture.tsFile}?worker`);
      const comment = await transform(plugin, '/** @decorator */\nexport class Subject {}', fixture.tsFile);
      assert.equal(raw.result, void 0);
      assert.ok(worker.result);
      assert.doesNotMatch(worker.result.code, /@dec/);
      assert.equal(comment.result, void 0);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('retains bundler directives and legal comments in decorated modules', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    const source = `
/*! retained-license */
function dec(value) {
  return value;
}
const modulePath = './subject.js';
export const load = () => import(/* @vite-ignore */ modulePath);
function createValue() {
  return {};
}
export const value = /*#__PURE__*/ createValue();
@dec export class Subject {}
`;

    try {
      const { result } = await transform(plugin, source, fixture.tsFile);
      assert.ok(result);
      assert.match(result.code, /\/\*! retained-license \*\//);
      assert.match(result.code, /\/\* @vite-ignore \*\//);
      assert.match(result.code, /\/\*#__PURE__\*\//);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('returns an original-source map and resolves shared helpers from the plugin dependency', async function () {
    const fixture = createFixture();
    const plugin = getDecoratorPlugin({ transformStandardDecorators: true, include: /\.ts$/ });
    const source = 'function dec(value) { return value; }\n@dec export class Subject {}\n';

    try {
      const { result } = await transform(plugin, source, `${fixture.tsFile}?v=1`);
      assert.ok(result);
      const map = typeof result.map === 'string' ? JSON.parse(result.map) : result.map;
      assert.ok(map.sources.some((sourceName: string) => sourceName.endsWith('subject.ts')));
      assert.deepEqual(map.sourcesContent, [source]);

      const helperId = result.code.match(/from "(@swc\/helpers\/_\/[^"]+)"/)?.[1];
      assert.ok(helperId);
      const helperPath = await getHook(plugin.resolveId)?.call({}, helperId, fixture.tsFile, {});
      assert.equal(typeof helperPath, 'string');
      assert.equal(fs.existsSync(helperPath as string), true);
      assert.match(helperPath as string, /@swc[\\/]helpers[\\/]esm[\\/]/);

      const traversal = await getHook(plugin.resolveId)?.call(
        {},
        '@swc/helpers/_/..\\package',
        fixture.tsFile,
        {},
      );
      assert.equal(traversal, null);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });
});
