import * as path from 'path';
import * as fs from 'fs';
import * as istanbul from 'istanbul';


const root = path.resolve(__dirname, '..');
const targetDir = path.join(root, 'coverage');
const opts = { dir: targetDir };

function combine(output: string): void {
  const collector = new istanbul.Collector();
  const covDir = path.resolve(__dirname, '..', 'coverage');
  const coveragePaths = ['kernel', 'runtime', 'jit'].map(p => path.join(covDir, p, 'coverage-final.json'));
  for (const coveragePath of coveragePaths) {
    if (fs.existsSync(coveragePath)) {
      const json = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      collector.add(json);
    }
  }
  istanbul.Report.create(output, opts).writeReport(collector);
}

combine(process.argv.slice(2, 3)[0]);

