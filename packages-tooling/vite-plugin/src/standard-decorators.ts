import { createFilter, FilterPattern } from '@rollup/pluginutils';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import type { Options as SwcOptions, ParserConfig, Program } from '@swc/wasm';
import type { Plugin, ResolvedConfig } from 'vite';
import { ProjectConfig } from './project-config';

const defaultInclude = 'src/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}';
const scriptExtension = /\.[cm]?[jt]sx?$/i;
const declarationExtension = /\.d\.[cm]?ts$/i;
const transportQuery = /(?:^|&)(?:raw|url|inline)(?:[=&]|$)/;
const swcHelperPrefix = '@swc/helpers/_/';
const swcHelperProbeIds = [
  '@swc/helpers/_/_apply_decs_2311',
  '@swc/helpers/_/_check_private_redeclaration',
  '@swc/helpers/_/_class_private_field_init',
  '@swc/helpers/_/_class_private_field_get',
  '@swc/helpers/_/_class_private_field_set',
  '@swc/helpers/_/_identity',
] as const;
const customCompilerGuidance =
  'Set `transformStandardDecorators: false` and provide a compatible pre-Oxc transform if this syntax is handled by another compiler.';
const pluginRequire = createRequire(import.meta.url);

let swcModule: Promise<typeof import('@swc/wasm')> | undefined;
let swcHelpersPath: string | undefined;

type StandardDecoratorParserConfig = ParserConfig & { autoAccessors?: boolean };
type StandardDecoratorTransformConfig =
  NonNullable<NonNullable<SwcOptions['jsc']>['transform']>
  & {
    decoratorVersion: '2023-11';
    tsEnumIsMutable: boolean;
  };
type SwcTarget = NonNullable<NonNullable<SwcOptions['jsc']>['target']>;

interface UnsupportedOxcOptions {
  general: string[];
  typescript: string[];
}

export interface StandardDecoratorPluginOptions {
  include?: FilterPattern;
  exclude?: FilterPattern;
  pre: boolean;
  transformStandardDecorators?: boolean;
}

export function createStandardDecoratorPlugin(
  options: StandardDecoratorPluginOptions,
  installWorkerPlugin: boolean = true,
): Plugin {
  let filter = createDecoratorFilter(options);
  const projectConfig = new ProjectConfig();
  let enabled = options.transformStandardDecorators === true;
  let useExternalHelpers = true;
  let unsupportedOxcOptions: UnsupportedOxcOptions = { general: [], typescript: [] };

  return {
    name: 'aurelia:standard-decorators',
    enforce: 'pre',

    config: installWorkerPlugin
      ? () => ({
        // Vite builds workers in an isolated plugin environment. Its supported
        // factory API also merges this instance with user-supplied worker
        // plugins and creates fresh state for each worker bundle.
        worker: {
          plugins: () => [createStandardDecoratorPlugin(options, false)],
        },
      })
      : undefined,

    configResolved(config) {
      enabled = options.transformStandardDecorators ?? isVite8(config);
      filter = createDecoratorFilter(options, config.root);
      useExternalHelpers = !shouldInlineHelpers(config);
      unsupportedOxcOptions = getUnsupportedOxcOptions(config);
      if (enabled && !options.pre) {
        throw new Error(
          '[@aurelia/vite-plugin] `pre: false` cannot be used with standard decorator transformation. ' +
          'Aurelia must apply conventions before decorators are transformed and before Vite\'s Oxc pass; ' +
          'otherwise authored field decorators can be discarded. Remove `pre: false`. If a custom compiler ' +
          'or AOT pipeline guarantees decorator-free output, set `transformStandardDecorators: false`.',
        );
      }
    },

    watchChange(id) {
      if (/\.json(?:$|[?#])/i.test(id)) {
        projectConfig.clear();
      }
    },

    async resolveId(id) {
      if (!enabled || !id.startsWith(swcHelperPrefix)) {
        return null;
      }

      const helperName = id.slice(swcHelperPrefix.length);
      if (!/^_[A-Za-z0-9_]+$/.test(helperName)) {
        return null;
      }

      try {
        // Generated imports are resolved from application modules. Anchor them
        // to our pinned dependency so strict package layouts do not require the
        // application to install @swc/helpers itself.
        swcHelpersPath ??= dirname(pluginRequire.resolve('@swc/helpers/package.json'));
        return resolve(swcHelpersPath, 'esm', `${helperName}.js`);
      } catch (error) {
        throw new Error(
          `[@aurelia/vite-plugin] Failed to resolve the SWC decorator helper ${id}: ${getErrorMessage(error)}`,
        );
      }
    },

    async transform(code, id) {
      if (!enabled || !code.includes('@')) {
        return;
      }

      const moduleId = getTransformableModuleId(id, filter);
      if (moduleId == null) {
        return;
      }

      const parser = getParser(moduleId);
      if (parser == null) {
        return;
      }

      const swc = await loadSwc();
      let program: Program;
      try {
        program = await swc.parse(code, parser);
      } catch (error) {
        throw new Error(
          `[@aurelia/vite-plugin] Failed to parse ${moduleId} while looking for standard decorators: ${getErrorMessage(error)} ${customCompilerGuidance}`,
        );
      }

      if (!hasDecorators(program)) {
        return;
      }

      const applicableOxcOptions = parser.syntax === 'typescript'
        ? [...unsupportedOxcOptions.general, ...unsupportedOxcOptions.typescript]
        : unsupportedOxcOptions.general;
      if (applicableOxcOptions.length > 0) {
        throw new Error(
          `[@aurelia/vite-plugin] Cannot transform decorators in ${moduleId} because ${applicableOxcOptions.join(' and ')} ` +
          `cannot be composed with the standard decorator bridge that runs before Vite's Oxc transform. ${customCompilerGuidance}`,
        );
      }

      const transformSettings = {
        ...await projectConfig.getTransformSettings(
          moduleId,
          parser.syntax === 'typescript',
          watchedId => this.addWatchFile(watchedId),
        ),
        // SWC cannot see that a TSX import is used implicitly as the JSX
        // factory. Preserve imports until Oxc performs the final TSX pass with
        // the project's JSX configuration.
        ...(parser.syntax === 'typescript' && parser.tsx === true
          ? { verbatimModuleSyntax: true }
          : {}),
      };
      const transformConfig: StandardDecoratorTransformConfig = {
        decoratorVersion: '2023-11',
        // Match TypeScript/Oxc: ordinary enums are mutable runtime objects and
        // member reads must not be folded across user mutations.
        tsEnumIsMutable: true,
        ...transformSettings,
        ...(isJsxParser(parser) ? { react: { runtime: 'preserve' as const } } : {}),
      };

      try {
        // SWC stores comments separately from Program. Transform the original
        // source after AST-based decorator detection so Vite directives,
        // tree-shaking annotations, and license comments are retained.
        const result = await swc.transform(code, {
          filename: moduleId,
          sourceFileName: moduleId,
          sourceMaps: true,
          inlineSourcesContent: true,
          swcrc: false,
          configFile: false,
          jsc: {
            parser,
            // The WASM package's declarations lag the transform and do not yet
            // list esnext, although the bundled compiler accepts it.
            target: 'esnext' as SwcTarget,
            // Rolldown parses .cjs/.cts as CommonJS and rejects the ESM import
            // used by external SWC helpers. Keep helpers inline for those
            // formats; ESM formats can otherwise share the pinned helper.
            externalHelpers: useExternalHelpers && !/\.(?:cjs|cts)$/i.test(moduleId),
            transform: transformConfig,
          },
        });

        return {
          code: result.code,
          map: result.map,
        };
      } catch (error) {
        throw new Error(
          `[@aurelia/vite-plugin] Failed to transform standard decorators in ${moduleId}: ${getErrorMessage(error)} ${customCompilerGuidance}`,
        );
      }
    },
  };
}

export function normalizeFilterId(
  id: string,
  cwd: string = process.cwd(),
  platform: NodeJS.Platform = process.platform,
): string {
  if (platform !== 'win32' || !/^[a-zA-Z]:/.test(id) || cwd.length === 0) {
    return id;
  }

  const cwdDrive = cwd[0];
  return id[0].toLowerCase() === cwdDrive.toLowerCase()
    ? `${cwdDrive}${id.slice(1)}`
    : id;
}

function isVite8(config: ResolvedConfig): boolean {
  // Vite 8 exposes its Oxc options on ResolvedConfig; Vite 7 does not. This
  // avoids importing Vite's ESM entry from our CommonJS plugin build.
  return 'oxc' in config;
}

function createDecoratorFilter(
  options: StandardDecoratorPluginOptions,
  root: string = process.cwd(),
): (id: unknown) => boolean {
  return createFilter(
    options.include ?? defaultInclude,
    options.exclude,
    { resolve: root },
  );
}

function shouldInlineHelpers(config: ResolvedConfig): boolean {
  if (externalizesSwcHelpers(config.ssr?.external, true)) {
    return true;
  }
  const environments = (config as ResolvedConfig & {
    environments?: Record<string, {
      build?: { rolldownOptions?: { external?: unknown } };
      resolve?: { external?: unknown };
    }>;
  }).environments;
  if (Object.values(environments ?? {}).some(environment =>
    externalizesSwcHelpers(environment.resolve?.external, true)
    || externalizesSwcHelpers(environment.build?.rolldownOptions?.external)
  )) {
    return true;
  }
  if (config.command !== 'build') {
    return false;
  }

  const build = config.build as typeof config.build & {
    rolldownOptions?: { external?: unknown };
  };
  const worker = config.worker as typeof config.worker & {
    rolldownOptions?: { external?: unknown };
  };
  const isWorker = (config as ResolvedConfig & { isWorker?: boolean }).isWorker === true;
  const externals = isWorker
    ? [worker?.rollupOptions?.external, worker?.rolldownOptions?.external]
    : [build.rollupOptions?.external, build.rolldownOptions?.external];

  // An external callback may intercept generated helpers before resolveId can
  // anchor them to this package. Static policies only require inlining when
  // they can match one of the helper IDs emitted by decorator lowering.
  return externals.some(external => externalizesSwcHelpers(external));
}

function externalizesSwcHelpers(external: unknown, matchSsrPackage: boolean = false): boolean {
  if (external === true) {
    return matchSsrPackage;
  }
  if (typeof external === 'function') {
    return true;
  }
  if (typeof external === 'string') {
    return (matchSsrPackage && external === '@swc/helpers')
      || swcHelperProbeIds.some(id => id === external);
  }
  if (external instanceof RegExp) {
    const lastIndex = external.lastIndex;
    try {
      return swcHelperProbeIds.some(id => {
        external.lastIndex = 0;
        return external.test(id);
      });
    } finally {
      external.lastIndex = lastIndex;
    }
  }
  if (Array.isArray(external)) {
    return external.some(value => externalizesSwcHelpers(value, matchSsrPackage));
  }
  return false;
}

function getUnsupportedOxcOptions(config: ResolvedConfig): UnsupportedOxcOptions {
  const oxc = (config as ResolvedConfig & {
    oxc?: false | {
      assumptions?: { setPublicClassFields?: boolean };
      decorator?: Record<string, unknown>;
      exclude?: unknown;
      include?: unknown;
      typescript?: Record<string, unknown>;
    };
  }).oxc;
  if (oxc == null) {
    return { general: [], typescript: [] };
  }
  if (oxc === false) {
    return { general: ['`oxc: false`'], typescript: [] };
  }

  const typescript = Object.keys(oxc.typescript ?? {}).map(
    option => `\`oxc.typescript.${option}\``,
  );
  const general = Object.keys(oxc.decorator ?? {}).map(
    option => `\`oxc.decorator.${option}\``,
  );
  if (oxc.include != null) {
    general.push('`oxc.include`');
  }
  if (oxc.exclude != null) {
    general.push('`oxc.exclude`');
  }
  if (oxc.assumptions?.setPublicClassFields != null) {
    general.push('`oxc.assumptions.setPublicClassFields`');
  }
  return { general, typescript };
}

function getTransformableModuleId(
  id: string,
  filter: (id: unknown) => boolean,
): string | null {
  if (id.includes('\0')) {
    return null;
  }

  const queryIndex = id.search(/[?#]/);
  const moduleId = queryIndex < 0 ? id : id.slice(0, queryIndex);
  const query = queryIndex < 0 ? '' : id.slice(queryIndex + 1);

  if (
    transportQuery.test(query)
    || moduleId.endsWith('.$au.ts')
    || declarationExtension.test(moduleId)
    || !scriptExtension.test(moduleId)
    || !filter(normalizeFilterId(moduleId))
  ) {
    return null;
  }

  return moduleId;
}

function getParser(id: string): StandardDecoratorParserConfig | null {
  const extension = id.slice(id.lastIndexOf('.')).toLowerCase();
  switch (extension) {
    case '.ts':
    case '.mts':
    case '.cts':
      return { syntax: 'typescript', decorators: true };
    case '.tsx':
      return { syntax: 'typescript', decorators: true, tsx: true };
    case '.js':
    case '.mjs':
    case '.cjs':
      return {
        syntax: 'ecmascript',
        decorators: true,
        decoratorsBeforeExport: true,
        autoAccessors: true,
      };
    case '.jsx':
      return {
        syntax: 'ecmascript',
        decorators: true,
        decoratorsBeforeExport: true,
        autoAccessors: true,
        jsx: true,
      };
    default:
      return null;
  }
}

function isJsxParser(parser: StandardDecoratorParserConfig): boolean {
  return parser.syntax === 'typescript' ? parser.tsx === true : parser.syntax === 'ecmascript' && parser.jsx === true;
}

function hasDecorators(program: Program): boolean {
  const pending: unknown[] = [program];
  const seen = new Set<object>();

  while (pending.length > 0) {
    const value = pending.pop();
    if (value == null || typeof value !== 'object' || seen.has(value)) {
      continue;
    }
    seen.add(value);

    if (Array.isArray(value)) {
      pending.push(...value);
      continue;
    }

    const record = value as Record<string, unknown>;
    if (Array.isArray(record.decorators) && record.decorators.length > 0) {
      return true;
    }

    for (const [key, child] of Object.entries(record)) {
      if (key !== 'span') {
        pending.push(child);
      }
    }
  }

  return false;
}

async function loadSwc(): Promise<typeof import('@swc/wasm')> {
  try {
    return await (swcModule ??= import('@swc/wasm'));
  } catch (error) {
    swcModule = undefined;
    throw new Error(
      '[@aurelia/vite-plugin] Failed to load the standard decorator transformer. ' +
      'Reinstall @aurelia/vite-plugin so its WebAssembly transformer dependency is available. ' +
      `${customCompilerGuidance} ${getErrorMessage(error)}`,
    );
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
