import { ChildProcess, fork } from 'child_process';
import { join } from 'path';
import { BenchOptions, Data, Measurement } from './shared';

async function main() {
  const options = await BenchOptions.createFromCliArgs();
  const storage = options.storage;

  console.debug('active options:', options.toString());

  const errors: string[] = [];
  let $res: () => void;
  const promise = new Promise<void>((res) => $res = res);

  const childProcesses: ChildProcess[] = [];
  const benchCore = join(__dirname, 'start-app-and-bench');

  for (const framework of options.frameworks) {
    const cp = fork(benchCore);
    childProcesses.push(cp);
    cp.send({ framework, iterations: options.iterations });
    cp.on('message', addMeasurements);
    cp.on('exit', (exitCode: number) => {
      if (exitCode !== 0) {
        errors.push(framework.name);
      }
      childProcesses.splice(childProcesses.indexOf(cp), 1);
      if (childProcesses.length === 0) {
        $res();
      }
    });
  }
  await promise;

  let persistenceFailed = false;
  try {
    await storage.persist();
  } catch {
    persistenceFailed = true;
  }
  const hasFrameworkFailures = errors.length > 0;
  if (hasFrameworkFailures) {
    console.error(`Benchmarking failed for the following frameworks\n${errors.join('\n')}`);
  }
  if (hasFrameworkFailures || persistenceFailed) {
    process.exit(1);
  }

  function addMeasurements(measurements: Data<Measurement>[]) {
    storage.addMeasurements(...measurements);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
