import {AppState, TableState, TableItemState, AnimState, AnimBoxState, TreeState, TreeNodeState} from "./state";
import {TreeTransformer} from "./tree_transformers";

export function switchTo(state: AppState, location: string): AppState {
  if (state.location === location) {
    return state;
  } else {
    return new AppState(
      location,
      state.home,
      state.table,
      state.anim,
      state.tree
    );
  }
}

export function tableCreate(state: AppState, rows: number, cols: number): AppState {
  return new AppState(
    state.location,
    state.home,
    TableState.create(rows, cols),
    state.anim,
    state.tree
  );
}

export function tableFilterBy(state: AppState, nth: number): AppState {
  return new AppState(
    state.location,
    state.home,
    new TableState(state.table.items.filter((item, i) => (i + 1) % nth)),
    state.anim,
    state.tree
  );
}

export function tableSortBy(state: AppState, i: number): AppState {
  const newItems = state.table.items.slice();
  newItems.sort((a, b) => a.props[i].localeCompare(b.props[i]));

  return new AppState(
      state.location,
      state.home,
      new TableState(newItems),
      state.anim,
      state.tree
  );
}

export function tableActivateEach(state: AppState, nth: number): AppState {
  return new AppState(
    state.location,
    state.home,
    new TableState(state.table.items.map((item, i) => (i + 1) % nth ?
      item :
      new TableItemState(item.id, true, item.props))),
    state.anim,
    state.tree
  );
}

export function animAdvanceEach(state: AppState, nth: number): AppState {
  return new AppState(
    state.location,
    state.home,
    state.table,
    new AnimState(state.anim.items.map((item, i) => (i + 1) % nth ? item : new AnimBoxState(item.id, item.time + 1))),
    state.tree
  );
}

export function treeCreate(state: AppState, hierarchy: number[]): AppState {
  return new AppState(
    state.location,
    state.home,
    state.table,
    state.anim,
    TreeState.create(hierarchy)
  );
}

export function treeTransform(state: AppState, transformers: TreeTransformer[]): AppState {
  function transform(node: TreeNodeState, depth: number): TreeNodeState {
    const t = transformers[depth];
    if (node.children !== null) {
      const children = t(node.children);
      if (depth < (transformers.length - 1)) {
        children.map((item) => transform(item, depth + 1));
      }
      return new TreeNodeState(node.id, node.container, children);
    }
    return new TreeNodeState(node.id, node.container, null);
  }

  return new AppState(
    state.location,
    state.home,
    state.table,
    state.anim,
    new TreeState(transform(state.tree.root, 0))
  );
}
