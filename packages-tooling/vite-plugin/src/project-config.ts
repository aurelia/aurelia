import { existsSync, statSync } from 'fs';
import { dirname, extname, join, resolve } from 'node:path';
import type { Cache, TsConfigJson, TsConfigResult } from 'get-tsconfig';

let getTsconfigModule: Promise<typeof import('get-tsconfig')> | undefined;

interface ProjectSelection {
  project: TsConfigResult;
  configPaths: string[];
}

export interface StandardDecoratorTransformSettings {
  useDefineForClassFields: boolean;
  verbatimModuleSyntax: boolean;
}

export class ProjectConfig {
  private readonly cache: Cache = new Map();

  public clear(): void {
    this.cache.clear();
  }

  public async getTransformSettings(
    id: string,
    isTypeScript: boolean,
    addWatchFile: (id: string) => void,
  ): Promise<StandardDecoratorTransformSettings> {
    // JavaScript class fields always use the standard define semantics. TypeScript
    // retains its historical assignment default when no project setting selects
    // otherwise.
    if (!isTypeScript) {
      return {
        useDefineForClassFields: true,
        verbatimModuleSyntax: false,
      };
    }

    let selection: ProjectSelection | null;
    try {
      const tsconfig = await (getTsconfigModule ??= import('get-tsconfig'));
      selection = findProjectForFile(id, tsconfig, this.cache);
    } catch (error) {
      throw new Error(
        `[@aurelia/vite-plugin] Failed to resolve the TypeScript configuration for ${id}: ${getErrorMessage(error)}`,
      );
    }

    if (selection == null) {
      return {
        useDefineForClassFields: false,
        verbatimModuleSyntax: false,
      };
    }

    for (const configPath of selection.configPaths) {
      addWatchFile(configPath);
    }
    assertStandardDecoratorConfig(id, selection.project);

    const compilerOptions = selection.project.config.compilerOptions ?? {};
    return {
      useDefineForClassFields: getUseDefineForClassFields(compilerOptions),
      verbatimModuleSyntax: getVerbatimModuleSyntax(compilerOptions),
    };
  }
}

function findProjectForFile(
  id: string,
  tsconfig: typeof import('get-tsconfig'),
  cache: Cache,
): ProjectSelection | null {
  let searchPath = id;
  let configPath = tsconfig.findTsconfig(searchPath, 'tsconfig.json', cache);

  while (configPath != null) {
    const selection = findProjectReference(id, configPath, tsconfig, cache, new Set());
    if (selection != null) {
      return selection;
    }

    const projectDirectory = dirname(configPath);
    const parentDirectory = dirname(projectDirectory);
    if (parentDirectory === projectDirectory) {
      return null;
    }
    searchPath = parentDirectory;
    configPath = tsconfig.findTsconfig(searchPath, 'tsconfig.json', cache);
  }

  return null;
}

function findProjectReference(
  id: string,
  configPath: string,
  tsconfig: typeof import('get-tsconfig'),
  cache: Cache,
  seen: Set<string>,
): ProjectSelection | null {
  const absoluteConfigPath = resolve(configPath);
  if (seen.has(absoluteConfigPath)) {
    return null;
  }
  seen.add(absoluteConfigPath);

  const config = tsconfig.parseTsconfig(absoluteConfigPath, cache);
  const project: TsConfigResult = {
    path: absoluteConfigPath.replaceAll('\\', '/'),
    config,
  };

  // TypeScript solution configs delegate ownership to their referenced
  // projects before considering their own files/include patterns.
  for (const reference of config.references ?? []) {
    const referencedPath = resolveProjectReference(absoluteConfigPath, reference.path);
    const selection = findProjectReference(id, referencedPath, tsconfig, cache, seen);
    if (selection != null) {
      return {
        project: selection.project,
        configPaths: [project.path, ...selection.configPaths],
      };
    }
  }

  if (tsconfig.createFilesMatcher(project)(id) != null) {
    return { project, configPaths: [project.path] };
  }

  return null;
}

function resolveProjectReference(configPath: string, referencePath: string): string {
  const absoluteReference = resolve(dirname(configPath), referencePath);
  if (existsSync(absoluteReference) && statSync(absoluteReference).isFile()) {
    return absoluteReference;
  }
  if (extname(absoluteReference).toLowerCase() === '.json') {
    return absoluteReference;
  }
  if (existsSync(absoluteReference) && statSync(absoluteReference).isDirectory()) {
    return join(absoluteReference, 'tsconfig.json');
  }

  const jsonPath = `${absoluteReference}.json`;
  return existsSync(jsonPath) ? jsonPath : join(absoluteReference, 'tsconfig.json');
}

function assertStandardDecoratorConfig(id: string, project: TsConfigResult): void {
  const compilerOptions: TsConfigJson.CompilerOptions = project.config.compilerOptions ?? {};
  const legacyOptions: string[] = [];

  if (compilerOptions.experimentalDecorators === true) {
    legacyOptions.push('experimentalDecorators');
  }
  if (compilerOptions.emitDecoratorMetadata === true) {
    legacyOptions.push('emitDecoratorMetadata');
  }

  if (legacyOptions.length === 0) {
    return;
  }

  const formattedOptions = legacyOptions.map(option => `\`${option}\``).join(' and ');
  throw new Error(
    `[@aurelia/vite-plugin] Cannot transform decorators in ${id} because ${project.path} enables ${formattedOptions}. ` +
    'Those options belong to TypeScript\'s legacy decorator pipeline, while Aurelia decorators use TC39 standard semantics. ' +
    `Remove ${formattedOptions}, or set \`transformStandardDecorators: false\` and provide a compatible pre-Oxc transform.`,
  );
}

function getUseDefineForClassFields(compilerOptions: TsConfigJson.CompilerOptions): boolean {
  if (compilerOptions.useDefineForClassFields != null) {
    return compilerOptions.useDefineForClassFields;
  }

  // Keep this fallback independent from get-tsconfig's finite target table so
  // future TypeScript targets retain TypeScript's ES2022+ define semantics.
  const target = compilerOptions.target?.toLowerCase();
  if (target === 'esnext') {
    return true;
  }

  const year = target?.match(/^es(\d{4})$/)?.[1];
  return year == null ? false : Number(year) >= 2022;
}

function getVerbatimModuleSyntax(compilerOptions: TsConfigJson.CompilerOptions): boolean {
  if (compilerOptions.verbatimModuleSyntax != null) {
    return compilerOptions.verbatimModuleSyntax;
  }

  // TypeScript deprecated these options in favor of verbatimModuleSyntax.
  // SWC exposes only the replacement, so preserve value imports whenever the
  // older settings requested preservation rather than silently eliding them.
  return compilerOptions.preserveValueImports === true
    || compilerOptions.importsNotUsedAsValues === 'preserve'
    || compilerOptions.importsNotUsedAsValues === 'error';
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
