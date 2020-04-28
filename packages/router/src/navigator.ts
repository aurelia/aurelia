/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/typedef */
import { Reporter } from '@aurelia/kernel';
import { INavigatorInstruction, IRoute } from './interfaces';
import { Queue, QueueItem } from './queue';
import { IRouter } from './router';
import { ViewportInstruction } from './viewport-instruction';
import { Scope } from './scope';
import { INode } from '@aurelia/runtime';

export interface INavigatorStore<T extends INode> {
  length: number;
  state: Record<string, unknown>;
  go(delta?: number, suppressPopstate?: boolean): Promise<void>;
  pushNavigatorState(state: INavigatorState<T>): Promise<void>;
  replaceNavigatorState(state: INavigatorState<T>): Promise<void>;
  popNavigatorState(): Promise<void>;
}

export interface INavigatorViewer<T extends INode> {
  activate(options: INavigatorViewerOptions<T>): void;
  deactivate(): void;
}
export interface INavigatorViewerOptions<T extends INode> {
  callback(ev: INavigatorViewerEvent<T>): void;
}

export interface INavigatorViewerState {
  path: string;
  query: string;
  hash: string;
  instruction: string;
}

export interface INavigatorViewerEvent<T extends INode> extends INavigatorViewerState {
  state?: INavigatorState<T>;
}

export interface IStoredNavigatorEntry<T extends INode> {
  instruction: string | ViewportInstruction<T>[];
  fullStateInstruction: string | ViewportInstruction<T>[];
  scope?: Scope<T> | null;
  index?: number;
  firstEntry?: boolean; // Index might change to not require first === 0, firstEntry should be reliable
  route?: IRoute<T>;
  path?: string;
  title?: string;
  query?: string;
  parameters?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export interface INavigatorEntry<T extends INode> extends IStoredNavigatorEntry<T> {
  fromBrowser?: boolean;
  replacing?: boolean;
  refreshing?: boolean;
  repeating?: boolean;
  untracked?: boolean;
  historyMovement?: number;
  resolve?: ((value?: void | PromiseLike<void>) => void);
  reject?: ((value?: void | PromiseLike<void>) => void);
}

export interface INavigatorOptions<T extends INode> {
  viewer?: INavigatorViewer<T>;
  store?: INavigatorStore<T>;
  statefulHistoryLength?: number;
  callback?(instruction: INavigatorInstruction<T>): void;
  serializeCallback?(entry: IStoredNavigatorEntry<T>, entries: IStoredNavigatorEntry<T>[]): Promise<IStoredNavigatorEntry<T>>;
}

export interface INavigatorFlags {
  first?: boolean;
  new?: boolean;
  refresh?: boolean;
  forward?: boolean;
  back?: boolean;
  replace?: boolean;
}

export interface INavigatorState<T extends INode> {
  state?: Record<string, unknown>;
  entries: IStoredNavigatorEntry<T>[];
  currentEntry: IStoredNavigatorEntry<T>;
}

export class Navigator<T extends INode> {
  public currentEntry: INavigatorInstruction<T>;
  public entries: IStoredNavigatorEntry<T>[] = [];

  private readonly pendingNavigations: Queue<INavigatorInstruction<T>>;

  private options: INavigatorOptions<T> = {
    statefulHistoryLength: 0,
  };
  private isActive: boolean = false;
  private router!: IRouter<T>;
  private readonly uninitializedEntry: INavigatorInstruction<T>;

  public constructor() {
    this.uninitializedEntry = {
      instruction: 'NAVIGATOR UNINITIALIZED',
      fullStateInstruction: '',
    };
    this.currentEntry = this.uninitializedEntry;

    this.pendingNavigations = new Queue<INavigatorInstruction<T>>(this.processNavigations);
  }

  public get queued(): number {
    return this.pendingNavigations.length;
  }

  public activate(router: IRouter<T>, options?: INavigatorOptions<T>): void {
    if (this.isActive) {
      throw new Error('Navigator has already been activated');
    }

    this.isActive = true;
    this.router = router;
    this.options = { ...options };
  }

  public deactivate(): void {
    if (!this.isActive) {
      throw new Error('Navigator has not been activated');
    }
    this.pendingNavigations.clear();
    this.isActive = false;
  }

  public navigate(entry: INavigatorEntry<T>): Promise<void> {
    return this.pendingNavigations.enqueue(entry);
  }

  public processNavigations = (qEntry: QueueItem<INavigatorInstruction<T>>): void => {
    const entry = qEntry as INavigatorInstruction<T>;
    const navigationFlags: INavigatorFlags = {};

    if (this.currentEntry === this.uninitializedEntry) { // Refresh or first entry
      this.loadState();
      if (this.currentEntry !== this.uninitializedEntry) {
        navigationFlags.refresh = true;
      } else {
        navigationFlags.first = true;
        navigationFlags.new = true;
        // TODO: Should this really be created here? Shouldn't it be in the viewer?
        this.currentEntry = {
          index: 0,
          instruction: '',
          fullStateInstruction: '',
          // path: this.options.viewer.getPath(true),
          // fromBrowser: null,
        };
        this.entries = [];
      }
    }
    if (entry.index !== void 0 && !entry.replacing && !entry.refreshing) { // History navigation
      entry.historyMovement = entry.index - (this.currentEntry.index !== void 0 ? this.currentEntry.index : 0);
      entry.instruction = this.entries[entry.index] !== void 0 && this.entries[entry.index] !== null ? this.entries[entry.index].fullStateInstruction : entry.fullStateInstruction;
      entry.replacing = true;
      if (entry.historyMovement > 0) {
        navigationFlags.forward = true;
      } else if (entry.historyMovement < 0) {
        navigationFlags.back = true;
      }
    } else if (entry.refreshing || navigationFlags.refresh) { // Refreshing
      entry.index = this.currentEntry.index;
    } else if (entry.replacing) { // Replacing
      navigationFlags.replace = true;
      navigationFlags.new = true;
      entry.index = this.currentEntry.index;
    } else { // New entry
      navigationFlags.new = true;
      entry.index = this.currentEntry.index !== void 0 ? this.currentEntry.index + 1 : this.entries.length;
    }
    this.invokeCallback(entry, navigationFlags, this.currentEntry);
  };

  public refresh(): Promise<void> {
    const entry = this.currentEntry;
    if (entry === this.uninitializedEntry) {
      return Promise.reject();
    }
    entry.replacing = true;
    entry.refreshing = true;
    return this.navigate(entry);
  }

  public go(movement: number): Promise<void> {
    const newIndex = (this.currentEntry.index !== undefined ? this.currentEntry.index : 0) + movement;
    if (newIndex >= this.entries.length) {
      return Promise.reject();
    }
    const entry = this.entries[newIndex];
    return this.navigate(entry);
  }

  public setEntryTitle(title: string): Promise<void> {
    this.currentEntry.title = title;
    return this.saveState();
  }

  public get titles(): string[] {
    if (this.currentEntry == this.uninitializedEntry) {
      return [];
    }
    const index = this.currentEntry.index !== void 0 ? this.currentEntry.index : 0;
    return this.entries.slice(0, index + 1).filter((value) => !!value.title).map((value) => value.title ? value.title : '');
  }

  public getState(): INavigatorState<T> {
    const state = this.options.store ? { ...this.options.store.state } : {};
    const entries = (state.entries || []) as IStoredNavigatorEntry<T>[];
    const currentEntry = (state.currentEntry || this.uninitializedEntry) as IStoredNavigatorEntry<T>;
    return { state, entries, currentEntry };
  }

  public loadState(): void {
    const state = this.getState();
    this.entries = state.entries;
    this.currentEntry = state.currentEntry;
  }

  public async saveState(push: boolean = false): Promise<void> {
    if (this.currentEntry === this.uninitializedEntry) {
      return Promise.resolve();
    }
    const storedEntry = this.toStoredEntry(this.currentEntry);
    this.entries[storedEntry.index !== undefined ? storedEntry.index : 0] = storedEntry;

    if (this.options.serializeCallback !== void 0 && this.options.statefulHistoryLength! > 0) {
      const index = this.entries.length - this.options.statefulHistoryLength!;
      for (let i = 0; i < index; i++) {
        const entry = this.entries[i];
        if (typeof entry.instruction !== 'string' || typeof entry.fullStateInstruction !== 'string') {
          this.entries[i] = await this.options.serializeCallback(entry, this.entries.slice(index));
        }
      }
    }

    if (!this.options.store) {
      return Promise.resolve();
    }
    const state: INavigatorState<T> = {
      entries: [],
      currentEntry: { ...this.toStoreableEntry(storedEntry) },
    };
    for (const entry of this.entries) {
      state.entries.push(this.toStoreableEntry(entry));
    }

    if (push) {
      return this.options.store.pushNavigatorState(state);
    } else {
      return this.options.store.replaceNavigatorState(state);
    }
  }

  public toStoredEntry(entry: INavigatorInstruction<T>): IStoredNavigatorEntry<T> {
    const {
      previous,
      fromBrowser,
      replacing,
      refreshing,
      untracked,
      historyMovement,
      navigation,
      scope,

      resolve,
      reject,

      ...storableEntry } = entry;
    return storableEntry;
  }

  public async finalize(instruction: INavigatorInstruction<T>): Promise<void> {
    this.currentEntry = instruction;
    let index = this.currentEntry.index !== undefined ? this.currentEntry.index : 0;
    if (this.currentEntry.untracked) {
      if (instruction.fromBrowser && this.options.store) {
        await this.options.store.popNavigatorState();
      }
      index--;
      this.currentEntry.index = index;
      this.entries[index] = this.toStoredEntry(this.currentEntry);
      await this.saveState();
    } else if (this.currentEntry.replacing) {
      this.entries[index] = this.toStoredEntry(this.currentEntry);
      await this.saveState();
    } else { // New entry (add and discard later entries)
      if (this.options.serializeCallback !== void 0 && this.options.statefulHistoryLength! > 0) {
        // Need to clear the instructions we discard!
        const indexPreserve = this.entries.length - this.options.statefulHistoryLength!;
        for (const entry of this.entries.slice(index)) {
          if (typeof entry.instruction !== 'string' || typeof entry.fullStateInstruction !== 'string') {
            await this.options.serializeCallback(entry, this.entries.slice(indexPreserve, index));
          }
        }
      }
      this.entries = this.entries.slice(0, index);
      this.entries.push(this.toStoredEntry(this.currentEntry));
      await this.saveState(true);
    }
    if (this.currentEntry.resolve) {
      this.currentEntry.resolve();
    }
  }

  public async cancel(instruction: INavigatorInstruction<T>): Promise<void> {
    if (instruction.fromBrowser && this.options.store) {
      if (instruction.navigation && instruction.navigation.new) {
        await this.options.store.popNavigatorState();
      } else {
        await this.options.store.go(-(instruction.historyMovement || 0), true);
      }
    }
    if (this.currentEntry.resolve) {
      this.currentEntry.resolve();
    }
  }

  private invokeCallback(entry: INavigatorEntry<T>, navigationFlags: INavigatorFlags, previousEntry: INavigatorEntry<T>): void {
    const instruction: INavigatorInstruction<T> = { ...entry };
    instruction.navigation = navigationFlags;
    instruction.previous = this.toStoredEntry(previousEntry);
    Reporter.write(10000, 'callback', instruction, instruction.previous, this.entries);
    if (this.options.callback) {
      this.options.callback(instruction);
    }
  }

  private toStoreableEntry(entry: IStoredNavigatorEntry<T>): IStoredNavigatorEntry<T> {
    const storeable: IStoredNavigatorEntry<T> = { ...entry };
    if (storeable.instruction && typeof storeable.instruction !== 'string') {
      storeable.instruction = this.router.instructionResolver.stringifyViewportInstructions(storeable.instruction);
    }
    if (storeable.fullStateInstruction && typeof storeable.fullStateInstruction !== 'string') {
      storeable.fullStateInstruction = this.router.instructionResolver.stringifyViewportInstructions(storeable.fullStateInstruction);
    }
    return storeable;
  }
}
