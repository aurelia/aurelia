import { readdir, readFile, Dirent } from 'fs';
import { join } from 'path';
import { Package } from './package.json';
import project from './project';
import { createLogger } from './logger';

const opts = {
  encoding: 'utf8',
  withFileTypes: true,
} as const;

function include(dirent: Dirent): boolean {
  switch (dirent.name) {
    case 'node_modules':
    case '.git':
      return false;
    default:
      return true;
  }
}

const log = createLogger('check-dependencies');

function run(baseDir: string): void {
  type Node = {
    readonly name: string;
    hydrate(): void;
    collect(result: Map<string, Node>): void;
    findMissing(): Map<string, Node>;
  };

  const nodes = new Map<string, Node>();

  function addNode(path: string, pkg: Package): void {
    const name = pkg.name;
    if (name === void 0) {
      log(`WARNING: no package name at ${path}`);
      return;
    }

    if (nodes.has(name)) {
      log(`WARNING: duplicate package name ${name} at ${path}`);
    }

    const depNames = pkg.dependencies === void 0 ? [] : Object.keys(pkg.dependencies);
    const deps = new Map<string, Node>();

    function hydrate(): void {
      for (const depName of depNames) {
        if (nodes.has(depName)) {
          deps.set(depName, nodes.get(depName));
        }
      }
    }
    function findMissing(): Map<string, Node> {
      const indirectDeps = collect(new Map());
      for (const dep of deps.values()) {
        indirectDeps.delete(dep.name);
      }
      return indirectDeps;
    }
    function collect(result: Map<string, Node>): Map<string, Node> {
      for (const dep of deps.values()) {
        if (!result.has(dep.name)) {
          result.set(dep.name, dep);
        }
        dep.collect(result);
      }
      return result;
    }

    nodes.set(name, {
      name,
      hydrate,
      findMissing,
      collect,
    });
  }

  function analyze(): void {
    for (const node of nodes.values()) {
      node.hydrate();
    }

    for (const node of nodes.values()) {
      const missingDeps = node.findMissing();
      if (missingDeps.size === 0) {
        log(`${node.name} - OK`);
      } else {
        const missingDepNames = Array.from(missingDeps.keys()).map(function (name) {
          return `\n    "${name}": "^${project.pkg.version}",`;
        });
        log(`${node.name} - Missing deps:${missingDepNames.join('')}`);
      }
    }
  }

  let stack = 0;
  function push(): void {
    ++stack;
  }
  function pop(): void {
    if (--stack === 0) {
      analyze();
    }
  }

  function walk(dir: string): void {
    push();

    readdir(dir, opts, function (err, dirents) {
      if (err !== null) {
        throw err;
      }

      dirents = dirents.filter(include);
      for (const dirent of dirents) {
        const path = join(dir, dirent.name);
        if (dirent.isFile()) {
          if (dirent.name === 'package.json') {
            push();

            readFile(path, function (_err, data) {
              if (err !== null) {
                throw err;
              }

              addNode(path, JSON.parse(data.toString('utf8')));

              pop();
            });
          }
        } else if (dirent.isDirectory()) {
          walk(path);
        }
      }

      pop();
    });
  }

  walk(baseDir);
}

run(project.path);
