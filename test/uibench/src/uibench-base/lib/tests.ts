import {UpdateHandler} from "./uibench";
import {AppState, HomeState, TableState, AnimState, TreeState} from "./state";
import {animAdvanceEach, treeCreate, tableFilterBy, tableActivateEach, treeTransform} from "./actions";
import {reverse} from "./tree_transformers";

function tableTests(onUpdate: UpdateHandler): void {
  const state = tableActivateEach(new AppState(
    "table",
    new HomeState(),
    TableState.create(2, 2),
    AnimState.create(0),
    TreeState.create([0])), 2);

  state.table.items[0].id = 300;
  state.table.items[1].id = 301;

  onUpdate(state, "update");

  const table = document.getElementsByClassName("Table");
  if (table.length !== 1) {
    throw new Error("Spec test failed: table with Table className doesn't exists");
  }

  const rows = document.getElementsByClassName("TableRow");
  if (rows.length !== 2) {
    throw new Error("Spec test failed: invalid number of TableRows");
  }
  if (rows[0].getAttribute("data-id") !== "300") {
    throw new Error("Spec test failed: invalid data-id attribute in the TableRow");
  }
  if (rows[1].className.indexOf("active") === -1) {
    throw new Error("Spec test failed: TableRow should have active className when it is activated");
  }

  const cells = document.getElementsByClassName("TableCell");
  if (cells.length !== 6) {
    throw new Error("Spec test failed: invalid number of TableCells");
  }
  if (cells[0].textContent !== "#300") {
    throw new Error("Spec test failed: invalid textContent in the id TableCell");
  }
  if (cells[1].textContent !== "0") {
    throw new Error("Spec test failed: invalid textContent in the data TableCell");
  }
  if (cells[2].textContent !== "3") {
    throw new Error("Spec test failed: invalid textContent in the data TableCell");
  }
  const logFn = console.log;
  let clicked = false;
  console.log = function() {
    clicked = true;
  };
  (cells[1] as HTMLElement).click();
  console.log = logFn;
  if (clicked === false) {
    throw new Error("Spec test failed: TableCell doesn't have onClick event listener that prints to the console");
  }
}

function animTests(onUpdate: UpdateHandler): void {
  let state = new AppState(
    "anim",
    new HomeState(),
    TableState.create(0, 0),
    AnimState.create(2),
    TreeState.create([0]));

  state.anim.items[0].id = 100;
  state.anim.items[1].id = 101;

  state = animAdvanceEach(state, 2);

  onUpdate(state, "update");

  const anim = document.getElementsByClassName("Anim");
  if (anim.length !== 1) {
    throw new Error("Spec test failed: div with Anim className doesn't exists");
  }
  const boxes = document.getElementsByClassName("AnimBox");
  if (boxes.length !== 2) {
    throw new Error("Spec test failed: invalid number of AnimBoxes");
  }
  if (boxes[0].getAttribute("data-id") !== "100") {
    throw new Error("Spec test failed: invalid data-id attribute in the AnimBox");
  }
  if ((boxes[0] as HTMLElement).style.borderRadius !== "0px") {
    throw new Error("Spec test failed: invalid borderRadius style in the AnimBox");
  }
  if ((boxes[1] as HTMLElement).style.borderRadius !== "1px") {
    throw new Error("Spec test failed: invalid borderRadius style in the AnimBox");
  }
  if (!(boxes[0] as HTMLElement).style.background) {
    throw new Error("Spec test failed: invalid background style in the AnimBox");
  }
}

function treeTests(onUpdate: UpdateHandler): void {
  const state = new AppState(
    "tree",
    new HomeState(),
    TableState.create(0, 0),
    AnimState.create(0),
    TreeState.create([1, 2]));

  state.tree.root.children![0].children![0].id = 2081;
  state.tree.root.children![0].children![1].id = 2082;

  onUpdate(state, "update");

  const tree = document.getElementsByClassName("Tree");
  if (tree.length !== 1) {
    throw new Error("Spec test failed: div with Tree className doesn't exists");
  }

  const treeNodes = document.getElementsByClassName("TreeNode");
  if (treeNodes.length !== 2) {
    throw new Error("Spec test failed: invalid number of TreeNodes");
  }

  const treeLeafs = document.getElementsByClassName("TreeLeaf");
  if (treeLeafs.length !== 2) {
    throw new Error("Spec test failed: invalid number of TreeLeafs");
  }
  if (treeLeafs[0].textContent !== "2081") {
    throw new Error("Spec test failed: invalid textContent in the TreeLeaf");
  }
  if (treeLeafs[1].textContent !== "2082") {
    throw new Error("Spec test failed: invalid textContent in the TreeLeaf");
  }
}

export function specTest(onUpdate: UpdateHandler): void {
  const state = new AppState(
    "table",
    new HomeState(),
    TableState.create(0, 0),
    AnimState.create(0),
    TreeState.create([0]));

  onUpdate(state, "init");

  const mainTag = document.getElementsByClassName("Main");
  if (mainTag.length !== 1) {
    throw new Error("Spec test failed: div tag with Main className doesn\"t exists");
  }

  tableTests(onUpdate);
  animTests(onUpdate);
  treeTests(onUpdate);
}

export function scuTest(onUpdate: UpdateHandler, onFinish: (scuSupported: boolean) => void): void {
  const state = new AppState(
    "table",
    new HomeState(),
    TableState.create(1, 1),
    AnimState.create(0),
    TreeState.create([0]));

  state.table.items[0].props[0] = "a";

  onUpdate(state, "init");
  let node = document.getElementsByClassName("TableCell")[1];
  if (!node || node.textContent !== "a") {
    throw new Error("SCU test failed");
  }
  state.table.items[0].props[0] = "b";
  onUpdate(state, "update");
  node = document.getElementsByClassName("TableCell")[1];
  if (!node) {
    throw new Error("SCU test failed");
  }

  let result = true;
  if (node.textContent !== "a") {
    if (node.textContent === "b") {
      result = false;
    } else {
      throw new Error("SCU test failed");
    }
  }

  window.requestAnimationFrame(() => {
    onFinish(result);
  });
}

export function recyclingTest(onUpdate: UpdateHandler, onFinish: (recyclingEnabled: boolean) => void): void {
  const initialState = new AppState(
    "tree",
    new HomeState(),
    TableState.create(0, 0),
    AnimState.create(0),
    TreeState.create([0]));
  const toState = treeCreate(initialState, [1]);

  onUpdate(initialState, "init");
  onUpdate(toState, "update");

  const a = document.getElementsByClassName("TreeLeaf")[0];
  onUpdate(initialState, "init");
  onUpdate(toState, "update");

  const b = document.getElementsByClassName("TreeLeaf")[0];

  if (!a || !b) {
    throw new Error("recycling test failed");
  }
  const result = (a === b);

  window.requestAnimationFrame(() => {
    onFinish(result);
  });
}

export function preserveStateTest(onUpdate: UpdateHandler, onFinish: (preserveState: boolean) => void): void {
  const state = "uibench_" + Math.random();

  // Check tables
  const tableInit = new AppState(
    "table",
    new HomeState(),
    TableState.create(3, 1),
    AnimState.create(0),
    TreeState.create([0]));
  const tableUpdate = tableFilterBy(tableInit, 2);

  onUpdate(tableInit, "init");
  let tableRows = document.getElementsByClassName("TableRow");
  (tableRows[2] as any)._uibenchState = state;

  onUpdate(tableUpdate, "init");

  tableRows = document.getElementsByClassName("TableRow");
  let result = (tableRows[1] as any)._uibenchState === state;

  // Check trees
  const treeInit = new AppState(
    "tree",
    new HomeState(),
    TableState.create(0, 0),
    AnimState.create(0),
    TreeState.create([2]));
  const treeUpdate = treeTransform(treeInit, [reverse]);

  onUpdate(treeInit, "init");

  let treeLeafs = document.getElementsByClassName("TreeLeaf");
  (treeLeafs[0] as any)._uibenchState = state;

  onUpdate(treeUpdate, "update");

  treeLeafs = document.getElementsByClassName("TreeLeaf");
  result = result && ((treeLeafs[1] as any)._uibenchState === state);

  window.requestAnimationFrame(() => {
    onFinish(result);
  });
}
