import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import * as istanbul from 'istanbul';
import project from './project';

const opts = { dir: project.coverage.path };

function combine(output: string): void {
  const collector = new istanbul.Collector();
  const coveragePaths = ['kernel', 'runtime', 'jit']
    .map(p => join(project.coverage.path, p, 'coverage-final.json'));

  for (const coveragePath of coveragePaths) {
    if (existsSync(coveragePath)) {
      const json = JSON.parse(readFileSync(coveragePath, 'utf8'));
      collector.add(json);
    }
  }
  istanbul.Report.create(output, opts).writeReport(collector);
}

combine(process.argv.slice(2, 3)[0]);

