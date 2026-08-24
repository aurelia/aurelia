import { mkdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import terser from '@rollup/plugin-terser';
import { rollup } from 'rollup';
import {
  fileSize,
  getAureliaPackageName,
  hashFile,
  isPathInside,
  resolveAureliaEntry,
  toPosixPath,
} from './variant-utils.mjs';

export async function bundleBenchmarkVariant({ fixtureRoot, fixtures, installRoot, outputRoot }) {
  const variantRoot = await realpath(installRoot);
  const resolvedFixtureRoot = await realpath(fixtureRoot);
  const records = [];

  for (const fixture of fixtures) {
    const input = path.join(fixtureRoot, fixture, 'index.js');
    const outputDir = path.join(outputRoot, fixture);
    const outputFile = path.join(outputDir, 'app.js');
    const resolvedAureliaModules = new Map();
    const sourceFiles = new Set();
    await mkdir(outputDir, { recursive: true });

    const packageIsolation = {
      name: 'aurelia-benchmark-package-isolation',
      async resolveId(source) {
        const packageName = getAureliaPackageName(source);
        if (packageName === null) return null;

        // Benchmark source is shared by both variants. Forcing every Aurelia import through the
        // selected install root keeps workspace links from turning an A/A run into a mixed graph.
        const resolved = await resolveAureliaEntry(variantRoot, source);
        resolvedAureliaModules.set(source, resolved.entry);
        return resolved.entry;
      },
    };

    const build = await rollup({
      input,
      plugins: [
        packageIsolation,
        terser(),
      ],
    });

    try {
      for (const watchedFile of build.watchFiles) {
        const resolvedFile = await realpath(watchedFile);
        const normalized = toPosixPath(resolvedFile);
        if (normalized.includes('/node_modules/@aurelia/') && !isPathInside(variantRoot, resolvedFile)) {
          throw new Error(`Aurelia module escaped the selected benchmark variant: ${resolvedFile}`);
        }
        if (isPathInside(resolvedFixtureRoot, resolvedFile)) {
          sourceFiles.add(toPosixPath(path.relative(resolvedFixtureRoot, resolvedFile)));
        }
      }
      if (resolvedAureliaModules.size === 0) {
        throw new Error(`Fixture "${fixture}" did not resolve any Aurelia packages.`);
      }

      // Both variants use the same filename in separate directories. This prevents output naming
      // from becoming an accidental difference in the byte-for-byte A/A proof.
      await build.write({
        file: outputFile,
        format: 'esm',
        sourcemap: false,
      });
    } finally {
      await build.close();
    }

    records.push({
      fixture,
      file: outputFile,
      bytes: await fileSize(outputFile),
      sha256: await hashFile(outputFile),
      sourceFiles: [...sourceFiles].sort((left, right) => left.localeCompare(right)),
      resolvedAureliaModules: Object.fromEntries(
        [...resolvedAureliaModules.entries()].sort(([left], [right]) => left.localeCompare(right))
      ),
    });
  }

  return records;
}
