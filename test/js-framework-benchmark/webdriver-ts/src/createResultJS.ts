import * as _ from 'lodash';
import * as fs from 'fs';
import {JSONResult, initializeFrameworks} from './common';
import {benchmarks, fileName, BenchmarkInfo} from './benchmarks';

async function main() {
  const frameworks = await initializeFrameworks();

  const results: Map<string, Map<string, JSONResult>> = new Map();

  let resultJS = "import {RawResult} from './Common';\n\nexport let results: RawResult[]=[";

  const allBenchmarks: BenchmarkInfo[] = [];

  const jsonResult: {framework: string; benchmark: string; values: number[]}[] = [];

  benchmarks.forEach((benchmark, bIdx) => {
    const r = benchmark.resultKinds ? benchmark.resultKinds() : [benchmark];
    r.forEach((benchmarkInfo) => {
      allBenchmarks.push(benchmarkInfo);
    });
  });

  frameworks.forEach((framework, fIdx) => {
    allBenchmarks.forEach((benchmarkInfo) => {
      const name = `${fileName(framework, benchmarkInfo)}`;
      const file = `./results/${name}`;
      if (fs.existsSync(file)) {
        const data: JSONResult = JSON.parse(fs.readFileSync(file, {
          encoding:'utf-8'
        }));
        if (data.values.some(v => v==null)) console.log(`Found null value for ${framework.fullNameWithKeyedAndVersion} and benchmark ${benchmarkInfo.id}`);
        const result = {f:data.framework, b:data.benchmark, v:data.values.filter(v => v!=null)};
        const resultNice = {framework:data.framework, benchmark:data.benchmark, values:data.values.filter(v => v!=null)};
        resultJS += `\n${JSON.stringify(result)},`;
        jsonResult.push(resultNice);
      } else {
        console.log("MISSING FILE",file);
      }
    });
  });

  resultJS += '];\n';
  resultJS += `export let frameworks = ${JSON.stringify(frameworks.map(f => ({name: f.fullNameWithKeyedAndVersion, keyed: f.keyed})))};\n`;
  resultJS += `export let benchmarks = ${JSON.stringify(allBenchmarks)};\n`;

  fs.writeFileSync('../webdriver-ts-results/src/results.ts', resultJS, {encoding: 'utf-8'});
  fs.writeFileSync('./results.json', JSON.stringify(jsonResult), {encoding: 'utf-8'});

}

main().catch(e => {console.log("error processing results",e); process.exit(1);});
