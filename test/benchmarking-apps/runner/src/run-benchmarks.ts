import { ChildProcess, fork } from 'child_process';
import { join } from 'path';
import { BenchOptions, Data, Measurement } from './shared';

async function main() {
  const options = await BenchOptions.createFromCliArgs();
  const storage = options.storage;

  console.debug('active options:', options.toString());

  let $res: () => void;
  const promise = new Promise<void>((res) => $res = res);

  const childProcesses: ChildProcess[] = [];
  const benchCore = join(__dirname, 'start-app-and-bench');

  for (const framework of options.frameworks) {
    const cp = fork(benchCore);
    childProcesses.push(cp);
    cp.send({ framework, iterations: options.iterations });
    cp.on('message', addMeasurements);
    cp.on('exit', () => {
      console.log(`Done ${framework.name}`);
      childProcesses.splice(childProcesses.indexOf(cp), 1);
      if (childProcesses.length === 0) {
        $res();
      }
    });
  }
  await promise;
  await storage.persist();

  function addMeasurements(measurements: Data<Measurement>[]) {
    storage.addMeasurements(...measurements);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
