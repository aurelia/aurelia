const TableAlphabetLength = 10;
const TableAlphabets = [
  "0123456789",
  "3057846291",
  "8356294107",
  "0861342795",
];

export class HomeState {
  clone(): HomeState {
    return this;
  }
}

export class TableItemState {
  id: number;
  active: boolean;
  props: string[];

  constructor(id: number, active: boolean, props: string[]) {
    this.id = id;
    this.active = active;
    this.props = props;
  }

  clone(): TableItemState {
    return new TableItemState(this.id, this.active, this.props.slice(0));
  }

  static _nextId = 0;
  static create(active: boolean, props: string[]): TableItemState {
    return new TableItemState(TableItemState._nextId++, active, props);
  }
}

export class TableState {
  items: TableItemState[];

  constructor(items: TableItemState[]) {
    this.items = items;
  }

  clone(): TableState {
    return new TableState(this.items.map((i) => i.clone()));
  }

  static create(rows: number, cols: number): TableState {
    const items = [] as TableItemState[];
    for (let i = 0; i < rows; i++) {
      const props = [] as string[];

      for (let j = 0; j < cols; j++) {
        let str = "";
        let n = i;

        const alphabet = TableAlphabets[j];

        while (n >= TableAlphabetLength) {
          str += alphabet[n % TableAlphabetLength];
          n = n / TableAlphabetLength | 0;
        }
        str += alphabet[n % TableAlphabetLength];

        props.push(str);
      }
      items.push(TableItemState.create(false, props));
    }
    return new TableState(items);
  }
}

export class AnimBoxState {
  id: number;
  time: number;

  constructor(id: number, time: number) {
    this.id = id;
    this.time = time;
  }

  clone(): AnimBoxState {
    return new AnimBoxState(this.id, this.time);
  }

  static _nextId = 0;
  static create(time: number): AnimBoxState {
    return new AnimBoxState(AnimBoxState._nextId++, time);
  }
}

export class AnimState {
  items: AnimBoxState[];

  constructor(items: AnimBoxState[]) {
    this.items = items;
  }

  clone(): AnimState {
    return new AnimState(this.items.map((i) => i.clone()));
  }

  static create(count: number): AnimState {
    const items = [] as AnimBoxState[];
    for (let i = 0; i < count; i++) {
      items.push(AnimBoxState.create(0));
    }
    return new AnimState(items);
  }
}

export class TreeNodeState {
  id: number;
  container: boolean;
  children: TreeNodeState[] | null;

  constructor(id: number, container: boolean, children: TreeNodeState[] | null) {
    this.id = id;
    this.container = container;
    this.children = children;
  }

  clone(): TreeNodeState {
    return new TreeNodeState(this.id, this.container,
      this.children ? this.children.map((i) => i.clone()) : this.children);
  }

  static _nextId = 0;
  static create(container: boolean, children: TreeNodeState[] | null): TreeNodeState {
    return new TreeNodeState(TreeNodeState._nextId++, container, children);
  }
}

export class TreeState {
  root: TreeNodeState;

  constructor(root: TreeNodeState) {
    this.root = root;
  }

  clone(): TreeState {
    return new TreeState(this.root.clone());
  }

  static create(hierarchy: number[]): TreeState {
    function _create(depth: number): TreeNodeState[] {
      const count = hierarchy[depth];
      const children = [] as TreeNodeState[];

      if (depth === (hierarchy.length - 1)) {
        for (let i = 0; i < count; i++) {
          children.push(TreeNodeState.create(false, null));
        }
      } else {
        for (let i = 0; i < count; i++) {
          children.push(TreeNodeState.create(true, _create(depth + 1)));
        }
      }
      return children;
    }

    return new TreeState(TreeNodeState.create(true, _create(0)));
  }
}

export class AppState {
  location: string;
  home: HomeState;
  table: TableState;
  anim: AnimState;
  tree: TreeState;

  constructor(location: string, home: HomeState, table: TableState, anim: AnimState, tree: TreeState) {
    this.location = location;
    this.home = home;
    this.table = table;
    this.anim = anim;
    this.tree = tree;
  }

  clone(): AppState {
    return new AppState(this.location, this.home.clone(), this.table.clone(), this.anim.clone(), this.tree.clone());
  }
}
