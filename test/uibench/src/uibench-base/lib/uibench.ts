import {AppState, HomeState, TableState, AnimState, TreeState} from "./state";
import {animAdvanceEach, switchTo, tableCreate, treeCreate, tableSortBy, tableFilterBy, tableActivateEach,
  treeTransform} from "./actions";
import {reverse, insertFirst, insertLast, removeFirst, removeLast, moveFromEndToStart,
  moveFromStartToEnd, snabbdomWorstCase} from "./tree_transformers";
import {specTest, scuTest, recyclingTest, preserveStateTest} from "./tests";

declare global {
  interface Console {
    timeStamp(name: string): void;
  }

  interface Performance {
    memory: any;
  }
}

// performance.now() polyfill
// https://gist.github.com/paulirish/5438650
// prepare base perf object
if (typeof window.performance === "undefined") {
  // window.performance = {};
}
if (!window.performance.now) {
  let nowOffset = Date.now();
  if (window.performance.timing && window.performance.timing.navigationStart) {
    nowOffset = window.performance.timing.navigationStart;
  }
  window.performance.now = function now() {
    return Date.now() - nowOffset;
  };
}

export class TestCase {
  name: string;
  from: AppState;
  to: AppState;

  constructor(name: string, from: AppState, to: AppState) {
    this.name = name;
    this.from = from;
    this.to = to;
  }
}

function testCase(name: string, from: AppState, to: AppState): TestCase {
  return new TestCase(name, from, to);
}

export interface Config {
  tests: TestCase[] | null;
  iterations: number;
  name: string;
  version: string;
  report: boolean;
  mobile: boolean;
  disableSCU: boolean;
  enableDOMRecycling: boolean;
  filter: string | null;
  fullRenderTime: boolean;
  timelineMarks: boolean;
  disableChecks: boolean;
  startDelay: number;
}

export const config = {
  tests: null,
  iterations: 5,
  name: "unnamed",
  version: "0.0.0",
  report: false,
  mobile: false,
  disableSCU: false,
  enableDOMRecycling: false,
  filter: null,
  fullRenderTime: false,
  timelineMarks: false,
  disableChecks: false,
  startDelay: 0,
} as Config;

const timing = {
  start: 0,
  run: 0,
  firstRender: 0,
};

const memory = {
  initial: performance.memory === undefined ? 0 : performance.memory.usedJSHeapSize,
  start: 0,
  max: 0,
};

function parseQueryString(a: string[]): { [key: string]: string } {
  if (a.length === 0) {
    return {};
  }
  const b = {} as { [key: string]: string };
  for (let i = 0; i < a.length; ++i) {
    const p = a[i].split("=", 2);
    if (p.length === 1) {
      b[p[0]] = "";
    } else {
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
  }
  return b;
}

function scuClone(state: AppState): AppState {
  if (config.disableSCU) {
    state = state.clone();
  }
  return state;
}

export function init(name: string, version: string): Config {
  config.name = name;
  config.version = version;

  const qs = parseQueryString(window.location.search.substr(1).split("&"));
  if (qs["i"] !== undefined) {
    config.iterations = parseInt(qs["i"], 10);
  }
  if (qs["name"] !== undefined) {
    config.name = qs["name"];
  }
  if (qs["version"] !== undefined) {
    config.version = qs["version"];
  }
  if (qs["report"] !== undefined) {
    config.report = true;
  }
  if (qs["mobile"] !== undefined) {
    config.mobile = true;
  }
  if (qs["disableSCU"] !== undefined) {
    config.disableSCU = true;
  }
  if (qs["enableDOMRecycling"] !== undefined) {
    config.enableDOMRecycling = true;
  }
  if (qs["filter"] !== undefined) {
    config.filter = qs["filter"];
  }
  if (qs["fullRenderTime"] !== undefined) {
    config.fullRenderTime = true;
  }
  if (qs["timelineMarks"] !== undefined) {
    config.timelineMarks = true;
  }
  if (qs["disableChecks"] !== undefined) {
    config.disableChecks = true;
  }
  if (qs["startDelay"] !== undefined) {
    config.startDelay = parseInt(qs["startDelay"], 10);
  }

  return config;
}

function initTests() {
  const initial = new AppState(
    "home",
    new HomeState(),
    TableState.create(0, 0),
    AnimState.create(config.mobile ? 30 : 100),
    TreeState.create([0])
  );
  let initialTable = switchTo(initial, "table");
  let initialAnim = switchTo(initial, "anim");
  let initialTree = switchTo(initial, "tree");

  if (config.disableSCU) {
    initialTable = initialTable.clone();
    initialAnim = initialAnim.clone();
    initialTree = initialTree.clone();
  }

  if (config.mobile) {
    let table30_4 = tableCreate(initialTable, 30, 4);
    let table15_4 = tableCreate(initialTable, 15, 4);
    let table30_2 = tableCreate(initialTable, 30, 2);
    let table15_2 = tableCreate(initialTable, 15, 2);

    let tree50   = treeCreate(initialTree, [50]);
    let tree5_10 = treeCreate(initialTree, [5, 10]);
    let tree10_5 = treeCreate(initialTree, [10, 5]);
    let tree10_10_10_2 = treeCreate(initialTree, [10, 10, 10, 2]);
    let tree2__9 = treeCreate(initialTree, [2, 2, 2, 2, 2, 2, 2, 2, 2]);

    if (config.disableSCU) {
      table30_4 = table30_4.clone();
      table15_4 = table15_4.clone();
      table30_2 = table30_2.clone();
      table15_2 = table15_2.clone();

      tree50 = tree50.clone();
      tree5_10 = tree5_10.clone();
      tree10_5 = tree10_5.clone();
    }

    config.tests = [
      testCase("table/[30,4]/render", initialTable, scuClone(table30_4)),
      testCase("table/[15,4]/render", initialTable, scuClone(table15_4)),
      testCase("table/[30,2]/render", initialTable, scuClone(table30_2)),
      testCase("table/[15,2]/render", initialTable, scuClone(table15_2)),

      testCase("table/[30,4]/removeAll", table30_4, scuClone(initialTable)),
      testCase("table/[15,4]/removeAll", table15_4, scuClone(initialTable)),
      testCase("table/[30,2]/removeAll", table30_2, scuClone(initialTable)),
      testCase("table/[15,2]/removeAll", table15_2, scuClone(initialTable)),

      testCase("table/[30,4]/sort/0", table30_4, scuClone(tableSortBy(table30_4, 0))),
      testCase("table/[15,4]/sort/0", table15_4, scuClone(tableSortBy(table15_4, 0))),
      testCase("table/[30,2]/sort/0", table30_2, scuClone(tableSortBy(table30_2, 0))),
      testCase("table/[15,2]/sort/0", table15_2, scuClone(tableSortBy(table15_2, 0))),

      testCase("table/[30,4]/sort/1", table30_4, scuClone(tableSortBy(table30_4, 1))),
      testCase("table/[15,4]/sort/1", table15_4, scuClone(tableSortBy(table15_4, 1))),
      testCase("table/[30,2]/sort/1", table30_2, scuClone(tableSortBy(table30_2, 1))),
      testCase("table/[15,2]/sort/1", table15_2, scuClone(tableSortBy(table15_2, 1))),

      testCase("table/[30,4]/filter/8", table30_4, scuClone(tableFilterBy(table30_4, 8))),
      testCase("table/[15,4]/filter/8", table15_4, scuClone(tableFilterBy(table15_4, 8))),
      testCase("table/[30,2]/filter/8", table30_2, scuClone(tableFilterBy(table30_2, 8))),
      testCase("table/[15,2]/filter/8", table15_2, scuClone(tableFilterBy(table15_2, 8))),

      testCase("table/[30,4]/filter/4", table30_4, scuClone(tableFilterBy(table30_4, 4))),
      testCase("table/[15,4]/filter/4", table15_4, scuClone(tableFilterBy(table15_4, 4))),
      testCase("table/[30,2]/filter/4", table30_2, scuClone(tableFilterBy(table30_2, 4))),
      testCase("table/[15,2]/filter/4", table15_2, scuClone(tableFilterBy(table15_2, 4))),

      testCase("table/[30,4]/filter/2", table30_4, scuClone(tableFilterBy(table30_4, 2))),
      testCase("table/[15,4]/filter/2",  table15_4,  scuClone(tableFilterBy(table15_4, 2))),
      testCase("table/[30,2]/filter/2", table30_2, scuClone(tableFilterBy(table30_2, 2))),
      testCase("table/[15,2]/filter/2",  table15_2,  scuClone(tableFilterBy(table15_2, 2))),

      testCase("table/[30,4]/activate/8", table30_4, scuClone(tableActivateEach(table30_4, 8))),
      testCase("table/[15,4]/activate/8", table15_4, scuClone(tableActivateEach(table15_4, 8))),
      testCase("table/[30,2]/activate/8", table30_2, scuClone(tableActivateEach(table30_2, 8))),
      testCase("table/[15,2]/activate/8", table15_2, scuClone(tableActivateEach(table15_2, 8))),

      testCase("table/[30,4]/activate/4", table30_4, scuClone(tableActivateEach(table30_4, 4))),
      testCase("table/[15,4]/activate/4", table15_4, scuClone(tableActivateEach(table15_4, 4))),
      testCase("table/[30,2]/activate/4", table30_2, scuClone(tableActivateEach(table30_2, 4))),
      testCase("table/[15,2]/activate/4", table15_2, scuClone(tableActivateEach(table15_2, 4))),

      testCase("table/[30,4]/activate/2", table30_4, scuClone(tableActivateEach(table30_4, 2))),
      testCase("table/[15,4]/activate/2", table15_4, scuClone(tableActivateEach(table15_4, 2))),
      testCase("table/[30,2]/activate/2", table30_2, scuClone(tableActivateEach(table30_2, 2))),
      testCase("table/[15,2]/activate/2", table15_2, scuClone(tableActivateEach(table15_2, 2))),

      testCase("anim/30/8", initialAnim, scuClone(animAdvanceEach(initialAnim, 8))),
      testCase("anim/30/4", initialAnim, scuClone(animAdvanceEach(initialAnim, 4))),
      testCase("anim/30/2", initialAnim, scuClone(animAdvanceEach(initialAnim, 2))),

      testCase("tree/[50]/render", initialTree, scuClone(tree50)),
      testCase("tree/[5,10]/render", initialTree, scuClone(tree5_10)),
      testCase("tree/[10,5]/render", initialTree, scuClone(tree10_5)),
      testCase("tree/[2,2,2,2,2,2,2,2,2]/render", initialTree, scuClone(tree2__9)),

      testCase("tree/[50]/removeAll", tree50, scuClone(initialTree)),
      testCase("tree/[5,10]/removeAll", tree5_10, scuClone(initialTree)),
      testCase("tree/[10,5]/removeAll", tree10_5, scuClone(initialTree)),
      testCase("tree/[2,2,2,2,2,2,2,2,2]/removeAll", tree2__9, scuClone(initialTree)),

      testCase("tree/[50]/[reverse]", tree50, scuClone(treeTransform(tree50, [reverse]))),
      testCase("tree/[5,10]/[reverse]", tree5_10, scuClone(treeTransform(tree5_10, [reverse]))),
      testCase("tree/[10,5]/[reverse]", tree10_5, scuClone(treeTransform(tree10_5, [reverse]))),

      testCase("tree/[50]/[insertFirst(1)]", tree50, scuClone(treeTransform(tree50, [insertFirst(1)]))),
      testCase("tree/[5,10]/[insertFirst(1)]", tree5_10, scuClone(treeTransform(tree5_10, [insertFirst(1)]))),
      testCase("tree/[10,5]/[insertFirst(1)]", tree10_5, scuClone(treeTransform(tree10_5, [insertFirst(1)]))),

      testCase("tree/[50]/[insertLast(1)]", tree50, scuClone(treeTransform(tree50, [insertLast(1)]))),
      testCase("tree/[5,10]/[insertLast(1)]", tree5_10, scuClone(treeTransform(tree5_10, [insertLast(1)]))),
      testCase("tree/[10,5]/[insertLast(1)]", tree10_5, scuClone(treeTransform(tree10_5, [insertLast(1)]))),

      testCase("tree/[50]/[removeFirst(1)]", tree50, scuClone(treeTransform(tree50, [removeFirst(1)]))),
      testCase("tree/[5,10]/[removeFirst(1)]", tree5_10, scuClone(treeTransform(tree5_10, [removeFirst(1)]))),
      testCase("tree/[10,5]/[removeFirst(1)]", tree10_5, scuClone(treeTransform(tree10_5, [removeFirst(1)]))),

      testCase("tree/[50]/[removeLast(1)]", tree50, scuClone(treeTransform(tree50, [removeLast(1)]))),
      testCase("tree/[5,10]/[removeLast(1)]", tree5_10, scuClone(treeTransform(tree5_10, [removeLast(1)]))),
      testCase("tree/[10,5]/[removeLast(1)]", tree10_5, scuClone(treeTransform(tree10_5, [removeLast(1)]))),

      testCase("tree/[50]/[moveFromEndToStart(1)]", tree50,
        scuClone(treeTransform(tree50, [moveFromEndToStart(1)]))),
      testCase("tree/[5,10]/[moveFromEndToStart(1)]", tree5_10,
        scuClone(treeTransform(tree5_10, [moveFromEndToStart(1)]))),
      testCase("tree/[10,5]/[moveFromEndToStart(1)]", tree10_5,
        scuClone(treeTransform(tree10_5, [moveFromEndToStart(1)]))),

      testCase("tree/[50]/[moveFromStartToEnd(1)]", tree50,
        scuClone(treeTransform(tree50, [moveFromStartToEnd(1)]))),
      testCase("tree/[5,10]/[moveFromStartToEnd(1)]", tree5_10,
        scuClone(treeTransform(tree5_10, [moveFromStartToEnd(1)]))),
      testCase("tree/[10,5]/[moveFromStartToEnd(1)]", tree10_5,
        scuClone(treeTransform(tree10_5, [moveFromStartToEnd(1)]))),

      // special use case that should trigger worst case scenario for kivi library
      testCase("tree/[50]/[kivi_worst_case]", tree50, scuClone(
        treeTransform(treeTransform(treeTransform(tree50, [removeFirst(1)]), [removeLast(1)]), [reverse]))),

      // special use case that should trigger worst case scenario for snabbdom library
      testCase("tree/[50]/[snabbdom_worst_case]", tree50, scuClone(
        treeTransform(tree50, [snabbdomWorstCase]))),

      // special use case that should trigger worst case scenario for react library
      testCase("tree/[50]/[react_worst_case]", tree50, scuClone(
        treeTransform(treeTransform(treeTransform(tree50,
         [removeFirst(1)]),
         [removeLast(1)]),
         [moveFromEndToStart(1)]))),

      // special use case that should trigger worst case scenario for virtual-dom library
      testCase("tree/[50]/[virtual_dom_worst_case]", tree50,
        scuClone(treeTransform(tree50, [moveFromStartToEnd(2)]))),

      // test case with large amount of vnodes to test diff overhead
      testCase("tree/[10,10,10,2]/no_change", tree10_10_10_2, scuClone(tree10_10_10_2)),

      testCase("tree/[2,2,2,2,2,2,2,2]/no_change", tree2__9, scuClone(tree2__9)),
    ];
  } else {
    let table100_4 = tableCreate(initialTable, 100, 4);
    let table50_4 = tableCreate(initialTable, 50, 4);
    let table100_2 = tableCreate(initialTable, 100, 2);
    let table50_2 = tableCreate(initialTable, 50, 2);

    let tree500 = treeCreate(initialTree, [500]);
    let tree50_10 = treeCreate(initialTree, [50, 10]);
    let tree10_50 = treeCreate(initialTree, [10, 50]);
    let tree5_100 = treeCreate(initialTree, [5, 100]);
    let tree10__4 = treeCreate(initialTree, [10, 10, 10, 10]);
    let tree2__10 = treeCreate(initialTree, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);

    if (config.disableSCU) {
      table100_4 = table100_4.clone();
      table50_4 = table50_4.clone();
      table100_2 = table100_2.clone();
      table50_2 = table50_2.clone();

      tree500 = tree500.clone();
      tree50_10 = tree50_10.clone();
      tree10_50 = tree10_50.clone();
      tree5_100 = tree5_100.clone();
    }

    config.tests = [
      testCase("table/[100,4]/render", initialTable, scuClone(table100_4)),
      testCase("table/[50,4]/render", initialTable, scuClone(table50_4)),
      testCase("table/[100,2]/render", initialTable, scuClone(table100_2)),
      testCase("table/[50,2]/render", initialTable, scuClone(table50_2)),

      testCase("table/[100,4]/removeAll", table100_4, scuClone(initialTable)),
      testCase("table/[50,4]/removeAll", table50_4, scuClone(initialTable)),
      testCase("table/[100,2]/removeAll", table100_2, scuClone(initialTable)),
      testCase("table/[50,2]/removeAll", table50_2, scuClone(initialTable)),

      testCase("table/[100,4]/sort/0", table100_4, scuClone(tableSortBy(table100_4, 0))),
      testCase("table/[50,4]/sort/0", table50_4, scuClone(tableSortBy(table50_4, 0))),
      testCase("table/[100,2]/sort/0", table100_2, scuClone(tableSortBy(table100_2, 0))),
      testCase("table/[50,2]/sort/0", table50_2, scuClone(tableSortBy(table50_2, 0))),

      testCase("table/[100,4]/sort/1", table100_4, scuClone(tableSortBy(table100_4, 1))),
      testCase("table/[50,4]/sort/1", table50_4, scuClone(tableSortBy(table50_4, 1))),
      testCase("table/[100,2]/sort/1", table100_2, scuClone(tableSortBy(table100_2, 1))),
      testCase("table/[50,2]/sort/1", table50_2, scuClone(tableSortBy(table50_2, 1))),

      testCase("table/[100,4]/filter/32", table100_4, scuClone(tableFilterBy(table100_4, 32))),
      testCase("table/[50,4]/filter/32", table50_4, scuClone(tableFilterBy(table50_4, 32))),
      testCase("table/[100,2]/filter/32", table100_2, scuClone(tableFilterBy(table100_2, 32))),
      testCase("table/[50,2]/filter/32", table50_2, scuClone(tableFilterBy(table50_2, 32))),

      testCase("table/[100,4]/filter/16", table100_4, scuClone(tableFilterBy(table100_4, 16))),
      testCase("table/[50,4]/filter/16", table50_4, scuClone(tableFilterBy(table50_4, 16))),
      testCase("table/[100,2]/filter/16", table100_2, scuClone(tableFilterBy(table100_2, 16))),
      testCase("table/[50,2]/filter/16", table50_2, scuClone(tableFilterBy(table50_2, 16))),

      testCase("table/[100,4]/filter/8", table100_4, scuClone(tableFilterBy(table100_4, 8))),
      testCase("table/[50,4]/filter/8", table50_4, scuClone(tableFilterBy(table50_4, 8))),
      testCase("table/[100,2]/filter/8", table100_2, scuClone(tableFilterBy(table100_2, 8))),
      testCase("table/[50,2]/filter/8", table50_2, scuClone(tableFilterBy(table50_2, 8))),

      testCase("table/[100,4]/filter/4", table100_4, scuClone(tableFilterBy(table100_4, 4))),
      testCase("table/[50,4]/filter/4", table50_4, scuClone(tableFilterBy(table50_4, 4))),
      testCase("table/[100,2]/filter/4", table100_2, scuClone(tableFilterBy(table100_2, 4))),
      testCase("table/[50,2]/filter/4", table50_2, scuClone(tableFilterBy(table50_2, 4))),

      testCase("table/[100,4]/activate/32", table100_4, scuClone(tableActivateEach(table100_4, 32))),
      testCase("table/[50,4]/activate/32", table50_4, scuClone(tableActivateEach(table50_4, 32))),
      testCase("table/[100,2]/activate/32", table100_2, scuClone(tableActivateEach(table100_2, 32))),
      testCase("table/[50,2]/activate/32", table50_2, scuClone(tableActivateEach(table50_2, 32))),

      testCase("table/[100,4]/activate/16", table100_4, scuClone(tableActivateEach(table100_4, 16))),
      testCase("table/[50,4]/activate/16", table50_4, scuClone(tableActivateEach(table50_4, 16))),
      testCase("table/[100,2]/activate/16", table100_2, scuClone(tableActivateEach(table100_2, 16))),
      testCase("table/[50,2]/activate/16", table50_2, scuClone(tableActivateEach(table50_2, 16))),

      testCase("table/[100,4]/activate/8", table100_4, scuClone(tableActivateEach(table100_4, 8))),
      testCase("table/[50,4]/activate/8", table50_4, scuClone(tableActivateEach(table50_4, 8))),
      testCase("table/[100,2]/activate/8", table100_2, scuClone(tableActivateEach(table100_2, 8))),
      testCase("table/[50,2]/activate/8", table50_2, scuClone(tableActivateEach(table50_2, 8))),

      testCase("table/[100,4]/activate/4", table100_4, scuClone(tableActivateEach(table100_4, 4))),
      testCase("table/[50,4]/activate/4", table50_4, scuClone(tableActivateEach(table50_4, 4))),
      testCase("table/[100,2]/activate/4", table100_2, scuClone(tableActivateEach(table100_2, 4))),
      testCase("table/[50,2]/activate/4", table50_2, scuClone(tableActivateEach(table50_2, 4))),

      testCase("anim/100/32", initialAnim, scuClone(animAdvanceEach(initialAnim, 32))),
      testCase("anim/100/16", initialAnim, scuClone(animAdvanceEach(initialAnim, 16))),
      testCase("anim/100/8", initialAnim, scuClone(animAdvanceEach(initialAnim, 8))),
      testCase("anim/100/4", initialAnim, scuClone(animAdvanceEach(initialAnim, 4))),

      testCase("tree/[500]/render", initialTree, scuClone(tree500)),
      testCase("tree/[50,10]/render", initialTree, scuClone(tree50_10)),
      testCase("tree/[10,50]/render", initialTree, scuClone(tree10_50)),
      testCase("tree/[5,100]/render", initialTree, scuClone(tree5_100)),
      testCase("tree/[2,2,2,2,2,2,2,2,2,2]/render", initialTree, scuClone(tree2__10)),

      testCase("tree/[500]/removeAll", tree500, scuClone(initialTree)),
      testCase("tree/[50,10]/removeAll", tree50_10, scuClone(initialTree)),
      testCase("tree/[10,50]/removeAll", tree10_50, scuClone(initialTree)),
      testCase("tree/[5,100]/removeAll", tree5_100, scuClone(initialTree)),
      testCase("tree/[2,2,2,2,2,2,2,2,2,2]/removeAll", tree2__10, scuClone(initialTree)),

      testCase("tree/[500]/[reverse]", tree500, scuClone(treeTransform(tree500, [reverse]))),
      testCase("tree/[50,10]/[reverse]", tree50_10, scuClone(treeTransform(tree50_10, [reverse]))),
      testCase("tree/[10,50]/[reverse]", tree10_50, scuClone(treeTransform(tree10_50, [reverse]))),
      testCase("tree/[5,100]/[reverse]", tree5_100, scuClone(treeTransform(tree5_100, [reverse]))),

      testCase("tree/[500]/[insertFirst(1)]", tree500, scuClone(treeTransform(tree500, [insertFirst(1)]))),
      testCase("tree/[50,10]/[insertFirst(1)]", tree50_10, scuClone(treeTransform(tree50_10, [insertFirst(1)]))),
      testCase("tree/[10,50]/[insertFirst(1)]", tree10_50, scuClone(treeTransform(tree10_50, [insertFirst(1)]))),
      testCase("tree/[5,100]/[insertFirst(1)]", tree5_100, scuClone(treeTransform(tree5_100, [insertFirst(1)]))),

      testCase("tree/[500]/[insertLast(1)]", tree500, scuClone(treeTransform(tree500, [insertLast(1)]))),
      testCase("tree/[50,10]/[insertLast(1)]", tree50_10, scuClone(treeTransform(tree50_10, [insertLast(1)]))),
      testCase("tree/[10,50]/[insertLast(1)]", tree10_50, scuClone(treeTransform(tree10_50, [insertLast(1)]))),
      testCase("tree/[5,100]/[insertLast(1)]", tree5_100, scuClone(treeTransform(tree5_100, [insertLast(1)]))),

      testCase("tree/[500]/[removeFirst(1)]", tree500, scuClone(treeTransform(tree500, [removeFirst(1)]))),
      testCase("tree/[50,10]/[removeFirst(1)]", tree50_10, scuClone(treeTransform(tree50_10, [removeFirst(1)]))),
      testCase("tree/[10,50]/[removeFirst(1)]", tree10_50, scuClone(treeTransform(tree10_50, [removeFirst(1)]))),
      testCase("tree/[5,100]/[removeFirst(1)]", tree5_100, scuClone(treeTransform(tree5_100, [removeFirst(1)]))),

      testCase("tree/[500]/[removeLast(1)]", tree500, scuClone(treeTransform(tree500, [removeLast(1)]))),
      testCase("tree/[50,10]/[removeLast(1)]", tree50_10, scuClone(treeTransform(tree50_10, [removeLast(1)]))),
      testCase("tree/[10,50]/[removeLast(1)]", tree10_50, scuClone(treeTransform(tree10_50, [removeLast(1)]))),
      testCase("tree/[5,100]/[removeLast(1)]", tree5_100, scuClone(treeTransform(tree5_100, [removeLast(1)]))),

      testCase("tree/[500]/[moveFromEndToStart(1)]", tree500,
        scuClone(treeTransform(tree500, [moveFromEndToStart(1)]))),
      testCase("tree/[50,10]/[moveFromEndToStart(1)]", tree50_10,
        scuClone(treeTransform(tree50_10, [moveFromEndToStart(1)]))),
      testCase("tree/[10,50]/[moveFromEndToStart(1)]", tree10_50,
        scuClone(treeTransform(tree10_50, [moveFromEndToStart(1)]))),
      testCase("tree/[5,100]/[moveFromEndToStart(1)]", tree5_100,
        scuClone(treeTransform(tree5_100, [moveFromEndToStart(1)]))),

      testCase("tree/[500]/[moveFromStartToEnd(1)]", tree500,
        scuClone(treeTransform(tree500, [moveFromStartToEnd(1)]))),
      testCase("tree/[50,10]/[moveFromStartToEnd(1)]", tree50_10,
        scuClone(treeTransform(tree50_10, [moveFromStartToEnd(1)]))),
      testCase("tree/[10,50]/[moveFromStartToEnd(1)]", tree10_50,
        scuClone(treeTransform(tree10_50, [moveFromStartToEnd(1)]))),
      testCase("tree/[5,100]/[moveFromStartToEnd(1)]", tree5_100,
        scuClone(treeTransform(tree5_100, [moveFromStartToEnd(1)]))),

      // special use case that should trigger worst case scenario for kivi library
      testCase("tree/[500]/[kivi_worst_case]", tree500, scuClone(
        treeTransform(treeTransform(treeTransform(tree500, [removeFirst(1)]), [removeLast(1)]), [reverse]))),

      // special use case that should trigger worst case scenario for snabbdom library
      testCase("tree/[500]/[snabbdom_worst_case]", tree500, scuClone(
        treeTransform(tree500, [snabbdomWorstCase]))),

      // special use case that should trigger worst case scenario for react library
      testCase("tree/[500]/[react_worst_case]", tree500, scuClone(
        treeTransform(treeTransform(treeTransform(tree500,
         [removeFirst(1)]),
         [removeLast(1)]),
         [moveFromEndToStart(1)]))),

      // special use case that should trigger worst case scenario for virtual-dom library
      testCase("tree/[500]/[virtual_dom_worst_case]", tree500,
        scuClone(treeTransform(tree500, [moveFromStartToEnd(2)]))),

      // test case with large amount of vnodes to test diff overhead
      testCase("tree/[10,10,10,10]/no_change", tree10__4, scuClone(tree10__4)),
      testCase("tree/[2,2,2,2,2,2,2,2,2,2]/no_change", tree2__10, scuClone(tree2__10)),
    ];
  }
}

let macrotasks = [] as (() => void)[];

window.addEventListener("message", function(e) {
  if (e.source === window && e.data === "uibench-macrotask") {
    const tasks = macrotasks;
    macrotasks = [];
    for (let i = 0; i < tasks.length; i++) {
      tasks[i]();
    }
  }
});

function scheduleMacrotask(cb: () => void): void {
  if (macrotasks.length === 0) {
    window.postMessage("uibench-macrotask", "*");
  }
  macrotasks.push(cb);
}


export type Result = {[name: string]: number[]};
export type UpdateHandler = (state: AppState, type: "init" | "update") => void;
export type FinishHandler = (result: Result) => void;
export type ProgressHandler = (progress: number) => void;

class Executor {
  iterations: number;
  groups: TestCase[];
  onUpdate: UpdateHandler;
  onFinish: FinishHandler;
  onProgress: ProgressHandler;

  private _samples: Result;
  private _state: "init" | "update" | "measure_time";
  private _currentGroup: number;
  private _currentIteration: number;
  private _startTime: number;

  constructor(iterations: number, groups: TestCase[], onUpdate: UpdateHandler, onFinish: FinishHandler,
      onProgress: ProgressHandler) {
    this.iterations = iterations;
    this.groups = groups;
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onProgress = onProgress;

    this._samples = {};
    this._state = "init";
    this._currentGroup = 0;
    this._currentIteration = 0;
    this._startTime = 0;
  }

  run(): void {
    this._next();
  }

  private _next = () => {
    const group = this.groups[this._currentGroup];
    if (this._state === "init") {
      if (config.timelineMarks) {
        console.timeStamp(`init ${group.name}`);
      }
      this.onUpdate(group.from, "init");
      this._state = "update";
      if (memory.initial !== 0) {
        memory.max = Math.max(memory.max, performance.memory.usedJSHeapSize);
      }
      requestAnimationFrame(this._next);
    } else if (this._state === "update") {
      if (config.timelineMarks) {
        console.timeStamp(`update ${group.name}`);
      }
      this._startTime = window.performance.now();
      this.onUpdate(group.to, "update");
      this._state = "measure_time";
      if (config.fullRenderTime) {
        scheduleMacrotask(this._next);
      } else {
        this._next();
      }
    } else { // this._state === "measure_time"
      const t = window.performance.now() - this._startTime;
      if (config.timelineMarks) {
        console.timeStamp(`measure_time ${group.name}`);
      }
      if (memory.start !== 0) {
        memory.max = Math.max(memory.max, performance.memory.usedJSHeapSize);
      }

      this.onProgress(
        (this._currentIteration * this.groups.length + this._currentGroup) / (this.groups.length * this.iterations));

      let samples = this._samples[group.name];
      if (samples === undefined) {
        samples = this._samples[group.name] = [];
      }
      samples.push(t);

      this._state = "init";
      this._currentGroup++;
      if (this._currentGroup < this.groups.length) {
        requestAnimationFrame(this._next);
      } else {
        this._currentIteration++;
        if (this._currentIteration < this.iterations) {
          this._currentGroup = 0;
          requestAnimationFrame(this._next);
        } else {
          this.onFinish(this._samples);
          this.onProgress(1);
        }
      }
    }
  }
}

function firstRenderTime(onUpdate: UpdateHandler, done: () => void): void {
  const state = new AppState(
    "table",
    new HomeState(),
    config.mobile ? TableState.create(30, 4) : TableState.create(100, 4),
    AnimState.create(0),
    TreeState.create([0]));

  const t = performance.now();
  onUpdate(state, "init");

  function finish() {
    timing.firstRender = performance.now() - t;
    done();
  }

  if (config.fullRenderTime) {
    scheduleMacrotask(finish);
  } else {
    finish();
  }
}

export function run(onUpdate: UpdateHandler, onFinish: FinishHandler, filter?: string | null): void {
  timing.run = performance.now();
  if (memory.initial !== 0) {
    memory.start = performance.memory.usedJSHeapSize;
  }

  firstRenderTime(onUpdate, () => {
    if (!config.disableChecks) {
      specTest(onUpdate);
    }
    scuTest(onUpdate, (scuSupported) => {
      recyclingTest(onUpdate, (recyclingEnabled) => {
        preserveStateTest(onUpdate, (preserveState) => {
          initTests();
          let tests = config.tests;
          let name = config.name;

          filter = filter || config.filter;

          if (tests && filter) {
            tests = tests.filter((t) => t.name.indexOf(filter as string) !== -1);
          }

          const progressBar = document.createElement("div");
          progressBar.className = "ProgressBar";
          const progressBarInner = document.createElement("div");
          progressBarInner.className = "ProgressBar_inner";
          progressBarInner.style.width = "0";
          document.body.appendChild(progressBar);
          progressBar.appendChild(progressBarInner);

          function run() {
            const e = new Executor(config.iterations, tests as TestCase[], onUpdate,
              (samples) => {
                onFinish(samples);
                if (config.report) {
                  window.opener.postMessage({
                    "type": "report",
                    "data": {
                      "name": name,
                      "version": config.version,
                      "flags": {
                        "fullRenderTime": config.fullRenderTime,
                        "preserveState": preserveState,
                        "scu": scuSupported && !config.disableSCU,
                        "recycling": recyclingEnabled,
                        "disableChecks": config.disableChecks,
                      },
                      "timing": timing,
                      "memory": memory,
                      "iterations": config.iterations,
                      "samples": samples,
                    },
                  }, "*");
                }
              },
              (progress) => {
                progressBarInner.style.width = `${Math.round(progress * 100)}%`;
              });
            e.run();
          }

          if (tests) {
            if (config.startDelay > 0) {
              setTimeout(run, config.startDelay);
            } else {
              run();
            }
          } else {
            onFinish({});
          }
        });
      });
    });
  });
}

timing.start = performance.now();
