import { Benchmark, benchmarks } from './benchmarks';
import * as fs from 'fs';
import * as yargs from 'yargs';
import { config, FrameworkData, initializeFrameworks, BenchmarkError, ErrorsAndWarning, BenchmarkOptions } from './common';
import { fork } from 'child_process';
import { executeBenchmark } from './forkedBenchmarkRunner';

function forkedRun(frameworks: FrameworkData[], frameworkName: string, keyed: boolean, benchmarkName: string, benchmarkOptions: BenchmarkOptions): Promise<ErrorsAndWarning> {
  if (config.FORK_CHROMEDRIVER) {
    return new Promise(function (resolve, reject) {
      const forked = fork('dist/forkedBenchmarkRunner.js');
      if (config.LOG_DEBUG) console.log("forked child process");
      forked.send({ config, frameworks, keyed, frameworkName, benchmarkName, benchmarkOptions });
      forked.on('message', (msg) => {
        if (config.LOG_DEBUG) console.log("main process got message from child", msg);
        resolve(msg);
      });
    });
  } else {
    return executeBenchmark(frameworks, keyed, frameworkName, benchmarkName, benchmarkOptions);
  }
}

async function runBench(runFrameworks: FrameworkData[], benchmarkNames: string[]) {
  const errors: BenchmarkError[] = [];
  const warnings: string[] = [];

  const runBenchmarks = benchmarks.filter(b => benchmarkNames.some(name => b.id.toLowerCase().includes(name)));

  let restart: string; // 'rx-domh-rxjs-v0.0.2-keyed';
  const index = runFrameworks.findIndex(f => f.fullNameWithKeyedAndVersion===restart);
  if (index>-1) {
    runFrameworks = runFrameworks.slice(index);
  }

  console.log("Frameworks that will be benchmarked", runFrameworks.map(f => f.fullNameWithKeyedAndVersion));
  console.log("Benchmarks that will be run", runBenchmarks.map(b => b.id));

  const data: [[FrameworkData, Benchmark]] = [] as any;
  for (let i = 0; i < runFrameworks.length; i++) {
    for (let j = 0; j < runBenchmarks.length; j++) {
      data.push([runFrameworks[i], runBenchmarks[j]]);
    }
  }

  for (let i = 0; i < data.length; i++) {
    const framework = data[i][0];
    const benchmark = data[i][1];

    const benchmarkOptions: BenchmarkOptions = {
      port: config.PORT.toFixed(),
      remoteDebuggingPort: config.REMOTE_DEBUGGING_PORT,
      chromePort: config.CHROME_PORT,
      headless: args.headless,
      chromeBinaryPath: args.chromeBinary,
      numIterationsForCPUBenchmarks: config.REPEAT_RUN,
      numIterationsForMemBenchmarks: config.REPEAT_RUN_MEM,
      numIterationsForStartupBenchmark: config.REPEAT_RUN_STARTUP
    };

    try {
      const errorsAndWarnings: ErrorsAndWarning = await forkedRun(runFrameworks, framework.name, framework.keyed, benchmark.id, benchmarkOptions);
      errors.splice(errors.length, 0, ...errorsAndWarnings.errors);
      warnings.splice(warnings.length, 0, ...errorsAndWarnings.warnings);
    } catch (err) {
      console.log(`Error executing benchmark ${framework.name} and benchmark ${benchmark.id}`);
    }
  }

  if (warnings.length > 0) {
    console.log("================================");
    console.log("The following warnings were logged:");
    console.log("================================");

    warnings.forEach(e => {
      console.log(e);
    });
  }

  if (errors.length > 0) {
    console.log("================================");
    console.log("The following benchmarks failed:");
    console.log("================================");

    errors.forEach(e => {
      console.log(`[${e.imageFile}]`);
      console.log(e.exception);
      console.log();
    });
    throw new Error("Benchmarking failed with errors");
  }
}

const allArgs = process.argv.length<=2 ? [] : process.argv.slice(2,process.argv.length);
// if no --option is passed we interpret the arguments as directory names that should be ru-run

const args = yargs(process.argv)
  .usage("$0 [--framework Framework1 Framework2 ...] [--benchmark Benchmark1 Benchmark2 ...] [--count n] [--exitOnError] \n or: $0 [directory1] [directory2] .. [directory3]")
  .help('help')
  .default('check', 'false')
  .default('fork', 'true')
  .boolean('noResults')
  .default('exitOnError', 'false')
  .default('count', Number.MAX_SAFE_INTEGER)
  .default('port', config.PORT)
  .string('chromeBinary')
  .string('chromeDriver')
  .boolean('headless')
  .array("framework").array("benchmark").argv;

const runBenchmarksFromDirectoryNamesArgs = !args.framework;

async function main() {

  const runBenchmarks = (args.benchmark && args.benchmark.length > 0 ? args.benchmark : [""]).map(v => v.toString());
  let runFrameworks: FrameworkData[];
  if (runBenchmarksFromDirectoryNamesArgs) {
    console.log("MODE: Directory names. Using arguments as the directory names to be re-run.");
    const matchesDirectoryArg = (directoryName: string) => allArgs.some(arg => arg==directoryName);
    runFrameworks = await initializeFrameworks(matchesDirectoryArg);
  } else {
    console.log("MODE: Classic command line options.");
    const frameworkNames = (args.framework && args.framework.length > 0 ? args.framework : [""]).map(v => v.toString());
    const frameworks = await initializeFrameworks();
    runFrameworks = frameworks.filter(f => frameworkNames.some(name => f.fullNameWithKeyedAndVersion.includes(name)));
  }
  const count = Number(args.count);
  config.PORT = Number(args.port);
  if (count < Number.MAX_SAFE_INTEGER) config.REPEAT_RUN = count;
  config.REPEAT_RUN_MEM = Math.min(count, config.REPEAT_RUN_MEM);
  config.REPEAT_RUN_STARTUP = Math.min(count, config.REPEAT_RUN_STARTUP);
  config.FORK_CHROMEDRIVER = args.fork === 'true';
  config.WRITE_RESULTS = !args.noResults;

  console.log(args, "no-results", args.noResults, config.WRITE_RESULTS);

  const exitOnError = args.exitOnError === 'true';

  config.EXIT_ON_ERROR = exitOnError;

  console.log("fork chromedriver process?", config.FORK_CHROMEDRIVER);

  if (!fs.existsSync(config.RESULTS_DIRECTORY))
    fs.mkdirSync(config.RESULTS_DIRECTORY);

  if (args.help) {
    yargs.showHelp();
  } else {
    return runBench(runFrameworks, runBenchmarks);
  }
}

main().then(_ => {
  console.log("successful run");
}).catch(error => {
  console.log("run was not completely sucessful", error);
});
