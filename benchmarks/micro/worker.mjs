import { parentPort, workerData } from 'node:worker_threads';
import { pathToFileURL } from 'node:url';
import { consumeSink } from './measure.mjs';

const baseModule = await import(pathToFileURL(workerData.basePath));
const candidateModule = await import(pathToFileURL(workerData.candidatePath));
const benchmarkCase = await import(new URL(`./cases/${workerData.caseName}.mjs`, import.meta.url));

const results = benchmarkCase.run(baseModule, candidateModule);
consumeSink();
parentPort.postMessage(results);
