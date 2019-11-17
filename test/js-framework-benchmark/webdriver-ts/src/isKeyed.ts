import * as yargs from 'yargs';
import {buildDriver, setUseShadowRoot, testTextContains, testTextNotContained, testElementLocatedById, clickElementById, clickElementByXPath, getTextByXPath, shadowRoot, findByXPath} from './webdriverAccess';
import {config, FrameworkData, initializeFrameworks, BenchmarkOptions} from './common';
import { WebDriver, By, WebElement } from 'selenium-webdriver';
import * as R from 'ramda';
// necessary to launch without specifiying a path
const chromedriver: any = require('chromedriver');

const args = yargs(process.argv)
  .usage("$0 [--framework Framework1 Framework2 ...] [--benchmark Benchmark1 Benchmark2 ...]")
  .help('help')
  .default('port', config.PORT)
  .string('chromeBinary')
  .string('chromeDriver')
  .boolean('headless')
  .array("framework").argv;

const allArgs = process.argv.length<=2 ? [] : process.argv.slice(2,process.argv.length);
const runBenchmarksFromDirectoryNamesArgs = !args.framework;

const init = `
window.nonKeyedDetector_reset = function () {
    window.nonKeyedDetector_tradded = 0;
    window.nonKeyedDetector_trremoved = 0;
    window.nonKeyedDetector_removedStoredTr = 0;
}

window.nonKeyedDetector_setUseShadowDom = function(useShadowDom ) {
    window.nonKeyedDetector_shadowRoot = useShadowDom;
}

window.nonKeyedDetector_instrument = function () {
    let node = document;
    if (window.nonKeyedDetector_shadowRoot) {
        let main = document.querySelector("main-element");
        if (!main) return;
        node = main.shadowRoot;
    }
    var target = node.querySelector('table.table');
    if (!target) return false;

    function countTRInNodeList(nodeList) {
        let trCount = 0;
        nodeList.forEach(n => {
            if (n.tagName==='TR') {
                trCount += 1 + countTRInNodeList(n.childNodes);
            }
        });
        return trCount;
    }

    function countSelectedTRInNodeList(nodeList) {
        let trFoundCount = 0;
        nodeList.forEach(n => {
            if (n==window.storedTr) {
                trFoundCount +=1;
            }
        });
        return trFoundCount;
    }

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                nonKeyedDetector_tradded += countTRInNodeList(mutation.addedNodes);
                nonKeyedDetector_trremoved += countTRInNodeList(mutation.removedNodes);
                nonKeyedDetector_removedStoredTr += countSelectedTRInNodeList(mutation.removedNodes)
            }
            // console.log(mutation.type, mutation.addedNodes.length, mutation.removedNodes.length, mutation);
        });
    });
    var config = { childList:true, attributes: true, subtree: true, characterData: true };

    observer.observe(target, config);
    return true;
}
window.nonKeyedDetector_result = function () {
    return {tradded: nonKeyedDetector_tradded, trremoved: nonKeyedDetector_trremoved, removedStoredTr: nonKeyedDetector_removedStoredTr};
}
window.nonKeyedDetector_storeTr = function () {
    let node = document;
    if (window.nonKeyedDetector_shadowRoot) {
        let main = document.querySelector("main-element");
        if (main) node = main.shadowRoot;
    }
    window.storedTr = node.querySelector('tr:nth-child(2)');
}
window.nonKeyedDetector_reset();
`;

function isKeyedRun(result: any): boolean {
  return (result.tradded>=1000 && result.trremoved>0 && result.removedStoredTr>0);
}
function isKeyedRemove(result: any): boolean {
  return (result.removedStoredTr>0);
}
function isKeyedSwapRow(result: any): boolean {
  return (result.tradded>0 && result.trremoved>0);
}

async function assertChildNodes(elem: WebElement, expectedNodes: string[], message: string) {
  const elements = await elem.findElements(By.css("*"));
  const allNodes = await Promise.all(elements.map(e => e.getTagName()));
  if (!R.equals(allNodes,expectedNodes)) {
    console.log(`ERROR in html structure for ${message}`);
    console.log("  expected:", expectedNodes);
    console.log("  actual  :", allNodes);
    return false;
  }
  return true;
}

async function assertClassesContained(elem: WebElement, expectedClassNames: string[], message: string) {
  const actualClassNames = (await elem.getAttribute("class")).split(" ");
  if (!expectedClassNames.every(expected => actualClassNames.includes(expected))) {
    console.log(`css class not correct. Expected for ${message} to be ${expectedClassNames} but was ${actualClassNames}`);
    return false;
  }
  return true;
}

export async function checkTRcorrect(driver: WebDriver, timeout = config.TIMEOUT): Promise<boolean> {
  const elem = await shadowRoot(driver);
  const tr = await findByXPath(elem, '//tbody/tr[1000]');
  if (!await assertChildNodes(tr, [ 'td', 'td', 'a', 'td', 'a', 'span', 'td' ], "tr")) {
    return false;
  }

  // first td
  const td1 = await findByXPath(elem, '//tbody/tr[1000]/td[1]');
  if (!await assertClassesContained(td1, ["col-md-1"], "first td")) {
    return false;
  }

  // second td
  const td2 = await findByXPath(elem, '//tbody/tr[1000]/td[2]');
  if (!await assertClassesContained(td2, ["col-md-4"], "second td")) {
    return false;
  }

  // third td
  const td3 = await findByXPath(elem, '//tbody/tr[1000]/td[3]');
  if (!await assertClassesContained(td3, ["col-md-1"], "third td")) {
    return false;
  }

  // span in third td
  const span = await findByXPath(elem, '//tbody/tr[1000]/td[3]/a/span');
  if (!await assertClassesContained(span, ["glyphicon","glyphicon-remove"], "span in a in third td")) {
    return false;
  }
  const spanAria = (await span.getAttribute("aria-hidden"));
  if ("true"!=spanAria) {
    console.log("Expected to find 'aria-hidden'=true on span in fourth td, but found ", spanAria);
    return false;
  }

  // fourth td
  const td4 = await findByXPath(elem, '//tbody/tr[1000]/td[4]');
  if (!await assertClassesContained(td4, ["col-md-6"], "fourth td")) {
    return false;
  }

  return true;
}

export async function getInnerHTML(driver: WebDriver, xpath: string, timeout = config.TIMEOUT): Promise<string> {
  let elem = await shadowRoot(driver);
  elem = await findByXPath(elem, xpath);
  return elem.getAttribute("innerHTML");
}

async function runBench(frameworkNames: string[]) {
  let runFrameworks;
  if (!runBenchmarksFromDirectoryNamesArgs) {
    const frameworks = await initializeFrameworks();
    runFrameworks = frameworks.filter(f => frameworkNames.some(name => f.fullNameWithKeyedAndVersion.includes(name)));
  } else {
    const matchesDirectoryArg = (directoryName: string) => allArgs.some(arg => arg==directoryName);
    runFrameworks = await initializeFrameworks(matchesDirectoryArg);
  }
  console.log("Frameworks that will be checked", runFrameworks.map(f => f.fullNameWithKeyedAndVersion).join(' '));

  const frameworkMap = new Map<string, FrameworkData>();

  let allCorrect = true;

  for (let i=0;i<runFrameworks.length;i++) {
    const driver = buildDriver(benchmarkOptions);
    try {
      const framework = runFrameworks[i];
      setUseShadowRoot(framework.useShadowRoot);
      await driver.get(`http://localhost:${config.PORT}/${framework.uri}/`);
      await testElementLocatedById(driver, "add");
      await clickElementById(driver,'run');
      await testTextContains(driver,'//tbody/tr[1000]/td[1]','1000');

      // check html for tr
      const htmlCorrect = await checkTRcorrect(driver);
      if (!htmlCorrect) {
        console.log(`ERROR: Framework ${framework.fullNameWithKeyedAndVersion} html is not correct`);
        allCorrect = false;
      }

      await driver.executeScript(init);
      await driver.executeScript(`window.nonKeyedDetector_setUseShadowDom(${framework.useShadowRoot});`);
      await driver.executeScript('window.nonKeyedDetector_instrument()');
      // swap
      await driver.executeScript('nonKeyedDetector_storeTr()');
      await clickElementById(driver,'swaprows');
      await testTextContains(driver,'//tbody/tr[2]/td[1]','999');
      let res = await driver.executeScript('return nonKeyedDetector_result()');
      const keyedSwap = isKeyedSwapRow(res);
      // run
      await driver.executeScript('nonKeyedDetector_storeTr()');
      await driver.executeScript('window.nonKeyedDetector_reset()');
      await clickElementById(driver,'run');
      await testTextContains(driver,'//tbody/tr[1000]/td[1]','2000');
      res = await driver.executeScript('return nonKeyedDetector_result()');
      const keyedRun =isKeyedRun(res);
      // remove
      await driver.executeScript('nonKeyedDetector_storeTr()');
      const text = await getTextByXPath(driver, `//tbody/tr[2]/td[2]/a`);
      await driver.executeScript('window.nonKeyedDetector_reset()');
      await clickElementByXPath(driver, `//tbody/tr[2]/td[3]/a/span[1]`);
      await testTextNotContained(driver, `//tbody/tr[2]/td[2]/a`, text);
      res = await driver.executeScript('return nonKeyedDetector_result()');
      const keyedRemove = isKeyedRemove(res);
      const keyed = keyedRemove && keyedRun && keyedSwap;
      console.log(`${framework.fullNameWithKeyedAndVersion} is ${
        keyed ? "keyed" : "non-keyed"} for 'run benchmark' and ${
        keyedRemove ? "keyed" : "non-keyed"} for 'remove row benchmark' ${
        keyedSwap ? "keyed" : "non-keyed"} for 'swap rows benchmark'. It'll appear as ${
        keyed ? "keyed" : "non-keyed"} in the results`);
      if (framework.keyed !== keyed) {
        console.log(`ERROR: Framework ${framework.fullNameWithKeyedAndVersion} is not correctly categorized`);
        allCorrect = false;
      }
    } catch(e) {
      console.log(`ERROR running ${runFrameworks[i].fullNameWithKeyedAndVersion}`, e);
      allCorrect = false;
    } finally {
      await driver.quit();
    }
  }
  if (!allCorrect) process.exit(1);
}

config.PORT = Number(args.port);

const runFrameworks = (args.framework && args.framework.length>0 ? args.framework : [""]).map(v => v.toString());

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
function main() {
  if (args.help) {
    yargs.showHelp();
  } else {
    runBench(runFrameworks).catch((error: Error) => { throw error; });
  }
}

main();
