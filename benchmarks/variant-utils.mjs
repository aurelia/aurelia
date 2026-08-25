import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

const internalPackagePrefix = '@aurelia/';
const productionDependencyFields = ['dependencies', 'optionalDependencies', 'peerDependencies'];

export const readJson = async file => JSON.parse(await readFile(file, 'utf8'));

export async function discoverWorkspacePackages(sourceRoot) {
  const rootManifest = await readJson(path.join(sourceRoot, 'package.json'));
  const workspaceEntries = Array.isArray(rootManifest.workspaces)
    ? rootManifest.workspaces
    : rootManifest.workspaces?.packages ?? [];
  const packageDirs = [];

  for (const entry of workspaceEntries) {
    if (!entry.includes('*')) {
      const packageDir = path.resolve(sourceRoot, entry);
      if (!isPathInside(sourceRoot, packageDir)) {
        throw new Error(`Workspace path "${entry}" escapes its source revision.`);
      }
      packageDirs.push(packageDir);
      continue;
    }

    if (!entry.endsWith('/*') || entry.slice(0, -2).includes('*')) {
      throw new Error(`Unsupported workspace pattern "${entry}" while preparing benchmark variants.`);
    }
    const parent = path.resolve(sourceRoot, entry.slice(0, -2));
    if (!isPathInside(sourceRoot, parent)) {
      throw new Error(`Workspace pattern "${entry}" escapes its source revision.`);
    }
    for (const child of await readdir(parent, { withFileTypes: true })) {
      if (child.isDirectory()) {
        packageDirs.push(path.join(parent, child.name));
      }
    }
  }

  const packages = new Map();
  for (const packageDir of packageDirs) {
    const manifestPath = path.join(packageDir, 'package.json');
    try {
      const manifest = await readJson(manifestPath);
      if (typeof manifest.name === 'string') {
        if (packages.has(manifest.name)) {
          throw new Error(`Workspace package name "${manifest.name}" is declared more than once.`);
        }
        packages.set(manifest.name, { dir: packageDir, manifest });
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
  return packages;
}

export function discoverInternalClosure(workspacePackages, rootPackageName) {
  const queue = [rootPackageName];
  const packages = new Map();
  const edges = new Map();

  while (queue.length > 0) {
    const packageName = queue.shift();
    if (packages.has(packageName)) continue;

    const workspacePackage = workspacePackages.get(packageName);
    if (workspacePackage === undefined) {
      throw new Error(`Internal package "${packageName}" is not present in this source revision.`);
    }

    const internalDependencies = new Set();
    const externalDependencies = new Set();
    for (const field of productionDependencyFields) {
      for (const dependencyName of Object.keys(workspacePackage.manifest[field] ?? {})) {
        if (dependencyName.startsWith(internalPackagePrefix)) {
          internalDependencies.add(dependencyName);
        } else {
          externalDependencies.add(dependencyName);
        }
      }
    }

    const bundledDependencies = workspacePackage.manifest.bundleDependencies
      ?? workspacePackage.manifest.bundledDependencies
      ?? [];
    if (bundledDependencies.length > 0) {
      throw new Error(
        `Benchmark package closure for "${packageName}" bundles dependencies: `
        + `${[...bundledDependencies].sort((left, right) => left.localeCompare(right)).join(', ')}. `
        + 'Add an explicit reproducibility policy before continuing.'
      );
    }

    if (externalDependencies.size > 0) {
      throw new Error(
        `Benchmark package closure for "${packageName}" has external production dependencies: `
        + `${[...externalDependencies].sort().join(', ')}. Add an explicit reproducibility policy before continuing.`
      );
    }

    packages.set(packageName, workspacePackage);
    edges.set(packageName, [...internalDependencies].sort((left, right) => left.localeCompare(right)));
    queue.push(...internalDependencies);
  }

  return { packages, edges };
}

export function getAureliaPackageName(specifier) {
  const match = /^(@aurelia\/[^/]+)(?:\/.*)?$/.exec(specifier);
  return match?.[1] ?? null;
}

export async function resolveAureliaEntry(installRoot, specifier) {
  const packageName = getAureliaPackageName(specifier);
  if (packageName === null) return null;

  const packageDir = await realpath(path.join(installRoot, 'node_modules', ...packageName.split('/')));
  if (!isPathInside(installRoot, packageDir)) {
    throw new Error(`Aurelia package "${specifier}" escaped its benchmark variant: ${packageDir}`);
  }
  const manifest = await readJson(path.join(packageDir, 'package.json'));
  const subpath = specifier === packageName ? '.' : `.${specifier.slice(packageName.length)}`;
  const target = selectImportTarget(manifest.exports?.[subpath])
    ?? (subpath === '.' ? manifest.module ?? manifest.main : undefined);
  if (typeof target !== 'string') {
    throw new Error(`Cannot resolve ESM export "${subpath}" from benchmark package "${packageName}".`);
  }
  if (!target.startsWith('./')) {
    throw new Error(`ESM export "${subpath}" from benchmark package "${packageName}" is not package-relative.`);
  }

  const entry = await realpath(path.resolve(packageDir, target));
  if (!isPathInside(packageDir, entry)) {
    throw new Error(`Aurelia package "${specifier}" resolved outside its package: ${entry}`);
  }
  return { packageName, packageDir, entry };
}

function selectImportTarget(target) {
  if (typeof target === 'string') return target;
  if (target === null || typeof target !== 'object') return undefined;
  if (typeof target.import === 'string') return target.import;
  if (typeof target.default === 'string') return target.default;
  if (target.import !== undefined) return selectImportTarget(target.import);
  if (target.default !== undefined) return selectImportTarget(target.default);
  return undefined;
}

export async function validateInstalledGraph(installRoot, packedPackages) {
  const lock = await readJson(path.join(installRoot, 'package-lock.json'));
  const expectedNames = new Set(packedPackages.keys());
  const actualEntries = new Map();

  for (const [lockPath, entry] of Object.entries(lock.packages ?? {})) {
    const normalizedLockPath = toPosixPath(lockPath);
    const match = /(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)$/.exec(normalizedLockPath);
    if (match === null) continue;
    const packageName = match[1];
    if (actualEntries.has(packageName)) {
      throw new Error(`Benchmark variant installed "${packageName}" more than once (${lockPath}).`);
    }
    if (normalizedLockPath !== `node_modules/${packageName}`) {
      throw new Error(`Benchmark variant nested "${packageName}" at ${lockPath}.`);
    }
    actualEntries.set(packageName, entry);
  }

  const unexpected = [...actualEntries.keys()].filter(name => !expectedNames.has(name));
  const missing = [...expectedNames].filter(name => !actualEntries.has(name));
  if (unexpected.length > 0 || missing.length > 0) {
    throw new Error(
      `Benchmark package graph mismatch. Missing: ${missing.join(', ') || '<none>'}; `
      + `unexpected: ${unexpected.join(', ') || '<none>'}.`
    );
  }

  const installed = new Map();
  for (const [packageName, packed] of packedPackages) {
    const lockEntry = actualEntries.get(packageName);
    const resolved = toPosixPath(lockEntry.resolved ?? '');
    const expectedResolved = `file:${toPosixPath(path.relative(installRoot, packed.tarball))}`;
    if (resolved !== expectedResolved) {
      throw new Error(`Benchmark package "${packageName}" did not install from ${packed.tarball}: ${resolved}`);
    }
    if (lockEntry.version !== packed.version) {
      throw new Error(
        `Benchmark package "${packageName}" installed version ${lockEntry.version}, expected ${packed.version}.`
      );
    }
    if (lockEntry.integrity !== packed.integrity) {
      throw new Error(`Benchmark package "${packageName}" lock integrity does not match its packed artifact.`);
    }

    const packageDir = path.join(installRoot, 'node_modules', ...packageName.split('/'));
    if ((await lstat(packageDir)).isSymbolicLink()) {
      throw new Error(`Benchmark package "${packageName}" is a workspace link instead of a packed artifact.`);
    }
    const packageRealpath = await realpath(packageDir);
    if (!isPathInside(installRoot, packageRealpath)) {
      throw new Error(`Benchmark package "${packageName}" escaped its variant root: ${packageRealpath}`);
    }

    const manifest = await readJson(path.join(packageDir, 'package.json'));
    if (manifest.name !== packageName || manifest.version !== packed.version) {
      throw new Error(
        `Installed benchmark package identity is ${manifest.name}@${manifest.version}, `
        + `expected ${packageName}@${packed.version}.`
      );
    }
    const resolvedEntry = await resolveAureliaEntry(installRoot, packageName);
    installed.set(packageName, {
      dir: packageRealpath,
      version: manifest.version,
      resolved,
      integrity: lockEntry.integrity,
      entry: resolvedEntry.entry,
      entrySha256: await hashFile(resolvedEntry.entry),
    });
  }
  return installed;
}

export function isPathInside(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export async function hashFile(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

export async function hashFiles(root, files) {
  const hash = createHash('sha256');
  for (const file of [...files].sort((left, right) => left.localeCompare(right))) {
    const absolute = path.resolve(root, file);
    hash.update(toPosixPath(file));
    hash.update('\0');
    hash.update(await readFile(absolute));
    hash.update('\0');
  }
  return hash.digest('hex');
}

export async function hashFileSet(root, files) {
  const sortedFiles = [...new Set(files)].sort((left, right) => left.localeCompare(right));
  const records = {};
  for (const file of sortedFiles) {
    records[toPosixPath(file)] = await hashFile(path.resolve(root, file));
  }
  return {
    sha256: await hashFiles(root, sortedFiles),
    files: records,
  };
}

export const toPosixPath = value => value.replace(/\\/g, '/');

export async function fileSize(file) {
  return (await stat(file)).size;
}
