import {WebDriver, logging} from 'selenium-webdriver';
import {BenchmarkType, Benchmark, benchmarks, fileName, LighthouseData} from './benchmarks';
import {setUseShadowRoot, buildDriver} from './webdriverAccess';
import * as fs from 'fs';
import * as path from 'path';
import {TConfig, config as defaultConfig, JSONResult, FrameworkData, BenchmarkError, ErrorsAndWarning, BenchmarkOptions} from './common';
import * as R from 'ramda';
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
// necessary to launch without specifiying a path
const chromedriver: any = require('chromedriver');
const jStat: any = require('jstat').jStat;

let config: TConfig = defaultConfig;

interface Timingresult {
  type: string;
  ts: number;
  dur?: number;
  end?: number;
  mem?: number;
  evt?: any;
}

function extractRelevantEvents(entries: logging.Entry[]) {
  const filteredEvents: Timingresult[] = [];
  const protocolEvents: any[] = [];
  entries.forEach(x => {
    const e = JSON.parse(x.message).message;
    if (config.LOG_DETAILS) console.log(JSON.stringify(e));
    if (e.method === 'Tracing.dataCollected') {
      protocolEvents.push(e);
    }
    if (e.method && (e.method.startsWith('Page') || e.method.startsWith('Network'))) {
      protocolEvents.push(e);
    } else if (e.params.name==='EventDispatch') {
      if (e.params.args.data.type==="click") {
        if (config.LOG_TIMELINE) console.log("CLICK ",JSON.stringify(e));
        filteredEvents.push({type:'click', ts: +e.params.ts, dur: +e.params.dur, end: +e.params.ts+e.params.dur});
      }
    } else if (e.params.name==='TimeStamp' &&
            (e.params.args.data.message==='afterBenchmark' || e.params.args.data.message==='finishedBenchmark' || e.params.args.data.message==='runBenchmark' || e.params.args.data.message==='initBenchmark')) {
      filteredEvents.push({type: e.params.args.data.message, ts: +e.params.ts, dur: 0, end: +e.params.ts});
      if (config.LOG_TIMELINE) console.log("TIMESTAMP ",JSON.stringify(e));
    } else if (e.params.name==='navigationStart') {
      filteredEvents.push({type:'navigationStart', ts: +e.params.ts, dur: 0, end: +e.params.ts});
      if (config.LOG_TIMELINE) console.log("NAVIGATION START ",JSON.stringify(e));
    } else if (e.params.name==='Paint') {
      if (config.LOG_TIMELINE) console.log("PAINT ",JSON.stringify(e));
      filteredEvents.push({type:'paint', ts: +e.params.ts, dur: +e.params.dur, end: +e.params.ts+e.params.dur, evt: JSON.stringify(e)});
      // } else if (e.params.name==='Rasterize') {
      //     console.log("RASTERIZE ",JSON.stringify(e));
      //     filteredEvents.push({type:'paint', ts: +e.params.ts, dur: +e.params.dur, end: +e.params.ts+e.params.dur, evt: JSON.stringify(e)});
      // } else if (e.params.name==='CompositeLayers') {
      //     console.log("COMPOSITE ",JSON.stringify(e));
      //     filteredEvents.push({type:'paint', ts: +e.params.ts, dur: +e.params.dur, end: +e.params.ts, evt: JSON.stringify(e)});
      // } else if (e.params.name==='Layout') {
      //     console.log("LAYOUT ",JSON.stringify(e));
      //     filteredEvents.push({type:'paint', ts: +e.params.ts, dur: +e.params.dur, end: e.params.ts, evt: JSON.stringify(e)});
      // } else if (e.params.name==='UpdateLayerTree') {
      //     console.log("UPDATELAYER ",JSON.stringify(e));
      //     filteredEvents.push({type:'paint', ts: +e.params.ts, dur: +e.params.dur, end: +e.params.ts+e.params.dur, evt: JSON.stringify(e)});
    } else if (e.params.name==='MajorGC' && e.params.args.usedHeapSizeAfter) {
      filteredEvents.push({type:'gc', ts: +e.params.ts, end:+e.params.ts, mem: Number(e.params.args.usedHeapSizeAfter)/1024/1024});
      if (config.LOG_TIMELINE) console.log("GC ",JSON.stringify(e));
    }
  });
  return {filteredEvents, protocolEvents};
}

async function fetchEventsFromPerformanceLog(driver: WebDriver): Promise<{timingResults: Timingresult[]; protocolResults: any[]}> {
  let timingResults: Timingresult[] = [];
  let protocolResults: any[] = [];
  let entries = [];
  do {
    entries = await driver.manage().logs().get(logging.Type.PERFORMANCE);
    const {filteredEvents, protocolEvents} = extractRelevantEvents(entries);
    timingResults = timingResults.concat(filteredEvents);
    protocolResults = protocolResults.concat(protocolEvents);
  } while (entries.length > 0);
  return {timingResults, protocolResults};
}

function typeEq(requiredType: string) {
  return (e: Timingresult) => e.type=== requiredType;
}
function typeNeq(requiredType: string) {
  return (e: Timingresult) => e.type !== requiredType;
}

function asString(res: Timingresult[]): string {
  return res.reduce((old, cur) => `${old}\n${JSON.stringify(cur)}`, "");
}

function extractRawValue(results: any, id: string) {
  const audits = results.audits;
  if (!audits) return null;
  const auditWithId = audits[id];
  if (typeof auditWithId === 'undefined') return null;
  if (typeof auditWithId.numericValue === 'undefined') return null;
  return auditWithId.numericValue;
}

function rmDir(dirPath: string) {
  let files: string[] = [];
  try { files = fs.readdirSync(dirPath); }
  catch(e) { console.log(`error in rmDir ${dirPath}`, e); return; }
  if (files.length > 0)
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(dirPath, files[i]);
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
      else
        rmDir(filePath);
    }
  fs.rmdirSync(dirPath);
}

async function runLighthouse(framework: FrameworkData, benchmarkOptions: BenchmarkOptions): Promise<LighthouseData> {
  const opts = {
    chromeFlags:
        [
          "--headless",
          "--no-sandbox",
          "--no-first-run",
          "--enable-automation",
          "--disable-infobars",
          "--disable-background-networking",
          "--disable-background-timer-throttling",
          "--disable-cache",
          "--disable-translate",
          "--disable-sync",
          "--disable-extensions",
          "--disable-default-apps",
          "--window-size=1200,800"
        ],
    onlyCategories: ['performance'],
    port: benchmarkOptions.remoteDebuggingPort
  };

  try {
    const options: any = {chromeFlags: opts.chromeFlags, logLevel: "info"};
    if (benchmarkOptions.chromeBinaryPath) options.chromePath = benchmarkOptions.chromeBinaryPath;
    const chrome = await chromeLauncher.launch(options);
    opts.port = chrome.port;
    let results = null;
    try {
      results = await lighthouse(`http://localhost:${benchmarkOptions.port}/${framework.uri}/`, opts, null);
      await chrome.kill();
    } catch (error) {
      console.log("error running lighthouse", error);
      await chrome.kill();
      throw error;
    }
    // console.log("lh result", results);

    const LighthouseData: LighthouseData = {
      TimeToConsistentlyInteractive: extractRawValue(results.lhr, 'interactive'),
      ScriptBootUpTtime: Math.max(16, extractRawValue(results.lhr, 'bootup-time')),
      MainThreadWorkCost: extractRawValue(results.lhr, 'mainthread-work-breakdown'),
      TotalKiloByteWeight: extractRawValue(results.lhr, 'total-byte-weight')/1024.0
    };
    return LighthouseData;
  } catch (error) {
    console.log("error running lighthouse", error);
    throw error;
  }
}

async function computeResultsCPU(driver: WebDriver, benchmarkOptions: BenchmarkOptions, framework: FrameworkData, benchmark: Benchmark, warnings: string[]): Promise<number[]> {
  const entriesBrowser = await driver.manage().logs().get(logging.Type.BROWSER);
  if (config.LOG_DEBUG) console.log("browser entries", entriesBrowser);
  const perfLogEvents = (await fetchEventsFromPerformanceLog(driver));
  const filteredEvents = perfLogEvents.timingResults;

  if (config.LOG_DEBUG) console.log("filteredEvents ", asString(filteredEvents));

  let remaining  = R.dropWhile(typeEq('initBenchmark'))(filteredEvents);
  const results = [];

  while (remaining.length >0) {
    const evts = R.splitWhen(typeEq('finishedBenchmark'))(remaining);
    if (R.find(typeNeq('runBenchmark'))(evts[0]) && evts[1].length>0) {
      const eventsDuringBenchmark = R.dropWhile(typeNeq('runBenchmark'))(evts[0]);

      if (config.LOG_DEBUG) console.log("eventsDuringBenchmark ", eventsDuringBenchmark);

      const clicks = R.filter(typeEq('click'))(eventsDuringBenchmark);
      if (clicks.length !== 1) {
        console.log("exactly one click event is expected", eventsDuringBenchmark);
        throw new Error("exactly one click event is expected");
      }

      const eventsAfterClick = (R.dropWhile(typeNeq('click'))(eventsDuringBenchmark));

      if (config.LOG_DEBUG) console.log("eventsAfterClick", eventsAfterClick);

      const paints = R.filter(typeEq('paint'))(eventsAfterClick);
      if (paints.length == 0) {
        console.log("at least one paint event is expected after the click event", eventsAfterClick);
        throw new Error("at least one paint event is expected after the click event");
      }

      console.log("# of paint events ",paints.length);
      if (paints.length>2) {
        warnings.push(`For framework ${framework.name} and benchmark ${benchmark.id} the number of paint calls is higher than expected. There were ${paints.length} paints though at most 2 are expected. Please consider re-running and check the results`);
        console.log(`For framework ${framework.name} and benchmark ${benchmark.id} the number of paint calls is higher than expected. There were ${paints.length} paints though at most 2 are expected. Please consider re-running and check the results`);
      }
      paints.forEach(p => {
        console.log("duration to paint ",((p.end - clicks[0].ts)/1000.0));
      });
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const lastPaint = R.reduce((max, elem) => max.end > elem.end ? max : elem, {end: 0} as Timingresult, paints);

      const upperBoundForSoundnessCheck = (R.last(eventsDuringBenchmark).end - eventsDuringBenchmark[0].ts)/1000.0;
      const duration = (lastPaint.end - clicks[0].ts)/1000.0;

      console.log("*** duration", duration, "upper bound ", upperBoundForSoundnessCheck);
      if (duration<0) {
        console.log("soundness check failed. reported duration is less 0", asString(eventsDuringBenchmark));
        throw new Error("soundness check failed. reported duration is less 0");
      }

      if (duration > upperBoundForSoundnessCheck) {
        console.log("soundness check failed. reported duration is bigger than whole benchmark duration", asString(eventsDuringBenchmark));
        throw new Error("soundness check failed. reported duration is bigger than whole benchmark duration");
      }
      results.push(duration);
    }
    remaining = R.drop(1, evts[1]);
  }
  if (results.length !== benchmarkOptions.numIterationsForCPUBenchmarks) {
    console.log(`soundness check failed. number or results isn't ${benchmarkOptions.numIterationsForCPUBenchmarks}`, results, asString(filteredEvents));
    throw new Error(`soundness check failed. number or results isn't ${benchmarkOptions.numIterationsForCPUBenchmarks}`);
  }
  return results;
}

async function computeResultsMEM(driver: WebDriver, benchmarkOptions: BenchmarkOptions, framework: FrameworkData, benchmark: Benchmark, warnings: string[]): Promise<number> {
  const entriesBrowser = await driver.manage().logs().get(logging.Type.BROWSER);
  if (config.LOG_DEBUG) console.log("browser entries", entriesBrowser);
  const filteredEvents = (await fetchEventsFromPerformanceLog(driver)).timingResults;

  if (config.LOG_DEBUG) console.log("filteredEvents ", filteredEvents);

  let remaining  = R.dropWhile(typeEq('initBenchmark'))(filteredEvents);
  const results = [];

  while (remaining.length >0) {
    const evts = R.splitWhen(typeEq('finishedBenchmark'))(remaining);
    if (R.find(typeNeq('runBenchmark'))(evts[0]) && evts[1].length>0) {
      const eventsDuringBenchmark = R.dropWhile(typeNeq('runBenchmark'))(evts[0]);

      if (config.LOG_DEBUG) console.log("eventsDuringBenchmark ", eventsDuringBenchmark);

      const gcs = R.filter(typeEq('gc'))(eventsDuringBenchmark);

      const mem = R.last(gcs).mem;
      results.push(mem);
    }
    remaining = R.drop(1, evts[1]);
  }
  // if (results.length !== benchmarkOptions.numIterationsForMemBenchmarks) {
  if (results.length !== 1) { // benchmarkOptions.numIterationsForAllBenchmarks) {
    console.log(`soundness check failed. number or results isn't 1*`, results, asString(filteredEvents));
    throw new Error(`soundness check failed. number or results isn't 1`);
  }
  return results[0];
}

async function forceGC(framework: FrameworkData, driver: WebDriver): Promise<any> {
  if (framework.name.startsWith("angular-v4")) {
    // workaround for window.gc for angular 4 - closure rewrites windows.gc");
    await driver.executeScript("window.Angular4PreservedGC();");
  } else {
    for (let i=0;i<5;i++) {
      await driver.executeScript("window.gc();");
    }
  }
}

async function snapMemorySize(driver: WebDriver): Promise<number> {
  // currently needed due to https://github.com/krausest/js-framework-benchmark/issues/538
  const heapSnapshot: any = await driver.executeScript(":takeHeapSnapshot");
  const nodeFields: any = heapSnapshot.snapshot.meta.node_fields;
  const nodes: any = heapSnapshot.nodes;

  let k = nodeFields.indexOf("self_size");

  let selfSize = 0;
  for(let l = nodes.length, d = nodeFields.length; k < l; k += d) {
    selfSize += nodes[k];
  }

  const memory = selfSize / 1024.0 / 1024.0;
  return memory;
}

async function runBenchmark(driver: WebDriver, benchmark: Benchmark, framework: FrameworkData): Promise<any> {
  await benchmark.run(driver, framework);
  if (config.LOG_PROGRESS) console.log("after run ",benchmark.id, benchmark.type, framework.name);
  if (benchmark.type === BenchmarkType.MEM) {
    await forceGC(framework, driver);
  }
}

async function afterBenchmark(driver: WebDriver, benchmark: Benchmark, framework: FrameworkData): Promise<any> {
  if (benchmark.after) {
    await benchmark.after(driver, framework);
    if (config.LOG_PROGRESS) console.log("after benchmark ",benchmark.id, benchmark.type, framework.name);
  }
}

async function initBenchmark(driver: WebDriver, benchmark: Benchmark, framework: FrameworkData): Promise<any> {
  await benchmark.init(driver, framework);
  if (config.LOG_PROGRESS) console.log("after initialized ",benchmark.id, benchmark.type, framework.name);
  if (benchmark.type === BenchmarkType.MEM) {
    await forceGC(framework, driver);
  }
}

interface Result<T> {
  framework: FrameworkData;
  results: T[];
  benchmark: Benchmark;
}

function writeResult<T>(res: Result<T>) {
  if (!config.WRITE_RESULTS) return;
  const benchmark = res.benchmark;
  const framework = res.framework.name;
  const keyed = res.framework.keyed;
  let type = null;

  switch (benchmark.type) {
    case BenchmarkType.CPU: type = "cpu"; break;
    case BenchmarkType.MEM: type = "memory"; break;
    case BenchmarkType.STARTUP: type = "startup"; break;
  }

  for (const resultKind of benchmark.resultKinds()) {
    const data = benchmark.extractResult(res.results, resultKind);
    const s = jStat(data);
    console.log(`result ${fileName(res.framework, resultKind)} min ${s.min()} max ${s.max()} mean ${s.mean()} median ${s.median()} stddev ${s.stdev(true)}`);
    const result: JSONResult = {
      "framework": res.framework.fullNameWithKeyedAndVersion,
      "keyed": keyed,
      "benchmark": resultKind.id,
      "type": type,
      "min": s.min(),
      "max": s.max(),
      "mean": s.mean(),
      "median": s.median(),
      "geometricMean": s.geomean(),
      "standardDeviation": s.stdev(true),
      "values": data
    };
    fs.writeFileSync(`${config.RESULTS_DIRECTORY}/${fileName(res.framework, resultKind)}`, JSON.stringify(result), {encoding: "utf8"});
  }
}

async function registerError(driver: WebDriver, framework: FrameworkData, benchmark: Benchmark, error: string): Promise<BenchmarkError> {
  const fileName = `error-${framework.name}-${benchmark.id}.png`;
  console.error("Benchmark failed",error);
  const image = await driver.takeScreenshot();
  console.error(`Writing screenshot ${fileName}`);
  fs.writeFileSync(fileName, image, {encoding: 'base64'});
  return {imageFile: fileName, exception: error};
}

const wait = (delay = 1000) => new Promise(res => setTimeout(res, delay));

async function runCPUBenchmark(framework: FrameworkData, benchmark: Benchmark, benchmarkOptions: BenchmarkOptions): Promise<ErrorsAndWarning>
{
  const errors: BenchmarkError[] = [];
  const warnings: string[] = [];

  console.log("benchmarking ", framework, benchmark.id);
  const driver = buildDriver(benchmarkOptions);
  console.timeLog("chromedriver", "runCPU started");
  try {
    for (let i = 0; i <benchmarkOptions.numIterationsForCPUBenchmarks; i++) {
      try {
        console.timeLog("chromedriver", "before setUseShadowRoot");
        setUseShadowRoot(framework.useShadowRoot);
        console.timeLog("chromedriver", "before get");
        await driver.get(`http://localhost:${benchmarkOptions.port}/${framework.uri}/`);
        console.timeLog("chromedriver", "after get");

        // await (driver as any).sendDevToolsCommand('Network.enable');
        // await (driver as any).sendDevToolsCommand('Network.emulateNetworkConditions', {
        //     offline: false,
        //     latency: 200, // ms
        //     downloadThroughput: 780 * 1024 / 8, // 780 kb/s
        //     uploadThroughput: 330 * 1024 / 8, // 330 kb/s
        // });
        console.log("driver timerstamp *");
        await driver.executeScript("console.timeStamp('initBenchmark')");

        if (framework.name.startsWith("scarletsframe")) {
          console.log("adding sleep for scarletsframe");
          await driver.sleep(1000);
        }

        await initBenchmark(driver, benchmark, framework);
        if (benchmark.throttleCPU) {
          console.log("CPU slowdown", benchmark.throttleCPU);
          await (driver as any).sendDevToolsCommand('Emulation.setCPUThrottlingRate', {rate: benchmark.throttleCPU});
        }
        await driver.executeScript("console.timeStamp('runBenchmark')");
        await runBenchmark(driver, benchmark, framework);
        if (benchmark.throttleCPU) {
          console.log("resetting CPU slowdown");
          await (driver as any).sendDevToolsCommand('Emulation.setCPUThrottlingRate', {rate: 1});
        }
        await driver.executeScript("console.timeStamp('finishedBenchmark')");
        await afterBenchmark(driver, benchmark, framework);
        await driver.executeScript("console.timeStamp('afterBenchmark')");
      } catch (e) {
        console.log(e);
        errors.push(await registerError(driver, framework, benchmark, e));
        throw e;
      }
    }
    const results = await computeResultsCPU(driver, benchmarkOptions, framework, benchmark, warnings);
    writeResult({ framework: framework, results: results, benchmark: benchmark });
    console.log("QUIT");
    await driver.close();
    await driver.quit();
  } catch (e) {
    console.log("ERROR:", e);
    await driver.close();
    await driver.quit();
    if (config.EXIT_ON_ERROR) { throw new Error("Benchmarking failed"); }
  }
  return {errors, warnings};
}

async function runMemBenchmark(framework: FrameworkData, benchmark: Benchmark, benchmarkOptions: BenchmarkOptions): Promise<ErrorsAndWarning>
{
  const errors: BenchmarkError[] = [];
  const warnings: string[] = [];
  const allResults: number[] = [];

  console.log("benchmarking ", framework, benchmark.id);
  for (let i = 0; i <benchmarkOptions.numIterationsForMemBenchmarks; i++) {
    const driver = buildDriver(benchmarkOptions);
    try {
      setUseShadowRoot(framework.useShadowRoot);
      await driver.get(`http://localhost:${benchmarkOptions.port}/${framework.uri}/`);

      await driver.executeScript("console.timeStamp('initBenchmark')");

      if (framework.name.startsWith("scarletsframe")) {
        console.log("adding sleep for scarletsframe");
        await driver.sleep(1000);
      }

      await initBenchmark(driver, benchmark, framework);
      if (benchmark.throttleCPU) {
        console.log("CPU slowdown", benchmark.throttleCPU);
        await (driver as any).sendDevToolsCommand('Emulation.setCPUThrottlingRate', {rate: benchmark.throttleCPU});
      }
      await driver.executeScript("console.timeStamp('runBenchmark')");
      await runBenchmark(driver, benchmark, framework);
      if (benchmark.throttleCPU) {
        console.log("resetting CPU slowdown");
        await (driver as any).sendDevToolsCommand('Emulation.setCPUThrottlingRate', {rate: 1});
      }
      const snapshotSize = await snapMemorySize(driver);
      await driver.executeScript("console.timeStamp('finishedBenchmark')");
      await afterBenchmark(driver, benchmark, framework);
      await driver.executeScript("console.timeStamp('afterBenchmark')");
      const result = await computeResultsMEM(driver, benchmarkOptions, framework, benchmark, warnings);
      if (config.LOG_DETAILS) console.log("comparison of memory usage. GC log:", result,  " :takeHeapSnapshot", snapshotSize);
      allResults.push(result);
    } catch (e) {
      errors.push(await registerError(driver, framework, benchmark, e));
      console.log(e);
      throw e;
    } finally {
      await driver.close();
      await driver.quit();
    }
  }
  writeResult({ framework: framework, results: allResults, benchmark: benchmark });
  return {errors, warnings};
}

async function runStartupBenchmark(framework: FrameworkData, benchmark: Benchmark, benchmarkOptions: BenchmarkOptions): Promise<ErrorsAndWarning>
{
  console.log("benchmarking startup", framework, benchmark.id);

  const errors: BenchmarkError[] = [];
  const results: LighthouseData[] = [];
  for (let i = 0; i <benchmarkOptions.numIterationsForStartupBenchmark; i++) {
    try {
      results.push(await runLighthouse(framework, benchmarkOptions));
    } catch (error) {
      console.log(error);
      errors.push({imageFile: null, exception: error});
      throw error;
    }
  }
  writeResult({framework: framework, results: results, benchmark: benchmark});
  return {errors, warnings: []};
}

export async function executeBenchmark(frameworks: FrameworkData[], keyed: boolean, frameworkName: string, benchmarkName: string, benchmarkOptions: BenchmarkOptions): Promise<ErrorsAndWarning> {
  const runFrameworks = frameworks.filter(f => f.keyed === keyed).filter(f => frameworkName === f.name);
  const runBenchmarks = benchmarks.filter(b => benchmarkName === b.id);
  if (runFrameworks.length!=1) throw new Error(`Framework name ${frameworkName} is not unique`);
  if (runBenchmarks.length!=1) throw new Error(`Benchmark name ${benchmarkName} is not unique`);

  const framework = runFrameworks[0];
  const benchmark = runBenchmarks[0];

  let errorsAndWarnings: ErrorsAndWarning;
  if (benchmark.type == BenchmarkType.STARTUP) {
    errorsAndWarnings = await runStartupBenchmark(framework, benchmark, benchmarkOptions);
  } else if (benchmark.type == BenchmarkType.CPU) {
    errorsAndWarnings = await runCPUBenchmark(framework, benchmark, benchmarkOptions);
  } else {
    errorsAndWarnings = await runMemBenchmark(framework, benchmark, benchmarkOptions);
  }

  return errorsAndWarnings;
}

export async function performBenchmark(frameworks: FrameworkData[], keyed: boolean, frameworkName: string, benchmarkName: string, benchmarkOptions: BenchmarkOptions): Promise<ErrorsAndWarning> {
  const errorsAndWarnings = await executeBenchmark(frameworks, keyed, frameworkName, benchmarkName, benchmarkOptions);
  if (config.LOG_DEBUG) console.log("benchmark finished - got errors promise", errorsAndWarnings);
  process.send(errorsAndWarnings);
  process.exit(0);
  return errorsAndWarnings;
}

process.on('message', (msg) => {
  config = msg.config;
  console.log("START BENCHMARK. Write results? ", config.WRITE_RESULTS);
  if (config.LOG_DEBUG) console.log("child process got message", msg);

  const {frameworks, keyed, frameworkName, benchmarkName, benchmarkOptions}: {frameworks: FrameworkData[]; keyed: boolean; frameworkName: string; benchmarkName: string; benchmarkOptions: BenchmarkOptions} = msg;
  if (!benchmarkOptions.port) benchmarkOptions.port = config.PORT.toFixed();
  performBenchmark(frameworks, keyed, frameworkName, benchmarkName, benchmarkOptions).catch((err) => {
    console.log("error in forkedBenchmarkRunner", err);
    process.exit(1);
  });
});
