import { Reporter } from '@aurelia/kernel';
import { INavigatorInstruction } from './interfaces';
import { Queue, QueueItem } from './queue';

export interface INavigatorStore {
  length: number;
  state: Record<string, unknown>;
  go(delta?: number, suppressPopstate?: boolean): Promise<void>;
  pushNavigatorState(state: INavigatorState): Promise<void>;
  replaceNavigatorState(state: INavigatorState): Promise<void>;
  popNavigatorState(): Promise<void>;
}

export interface INavigatorViewer {
  activate(callback: (ev?: INavigatorViewerEvent) => void): void;
  deactivate(): void;
}

export interface INavigatorViewerEvent {
  event: PopStateEvent;
  state?: INavigatorState;
  path: string;
  data: string;
  hash: string;
  instruction: string;
}

export interface IStoredNavigatorEntry {
  instruction: string;
  fullStateInstruction: string;
  index?: number;
  firstEntry?: boolean; // Index might change to not require first === 0, firstEntry should be reliable
  path?: string;
  title?: string;
  query?: string;
  parameters?: Record<string, string>;
  parameterList?: string[];
  data?: Record<string, unknown>;
}

export interface INavigatorEntry extends IStoredNavigatorEntry {
  fromBrowser?: boolean;
  replacing?: boolean;
  refreshing?: boolean;
  repeating?: boolean;
  untracked?: boolean;
  historyMovement?: number;
  resolve?: ((value?: void | PromiseLike<void>) => void);
  reject?: ((value?: void | PromiseLike<void>) => void);
}

export interface INavigatorOptions {
  viewer?: INavigatorViewer;
  store?: INavigatorStore;
  callback?(instruction: INavigatorInstruction): void;
}

export interface INavigatorFlags {
  first?: boolean;
  new?: boolean;
  refresh?: boolean;
  forward?: boolean;
  back?: boolean;
  replace?: boolean;
}

export interface INavigatorState {
  state?: Record<string, unknown>;
  entries: IStoredNavigatorEntry[];
  currentEntry: IStoredNavigatorEntry;
}

export class Navigator {
  public currentEntry: INavigatorInstruction = null;
  public entries: IStoredNavigatorEntry[] = null;

  private readonly pendingNavigations: Queue<INavigatorInstruction>;

  private options: INavigatorOptions = null;
  private isActive: boolean = false;

  constructor() {
    this.pendingNavigations = new Queue<INavigatorInstruction>(this.processNavigations);
  }

  public get queued(): number {
    return this.pendingNavigations.length;
  }

  public activate(options?: INavigatorOptions): void {
    if (this.isActive) {
      throw new Error('Navigator has already been activated');
    }

    this.isActive = true;
    this.options = { ...options };
  }

  public deactivate(): void {
    if (!this.isActive) {
      throw new Error('Navigator has not been activated');
    }
    this.pendingNavigations.clear();
    this.isActive = false;
  }

  public navigate(entry: INavigatorEntry): Promise<void> {
    return this.pendingNavigations.enqueue(entry);
  }

  public processNavigations = (qEntry: QueueItem<INavigatorInstruction>): void => {
    const entry = qEntry as INavigatorInstruction;
    const navigationFlags: INavigatorFlags = {};

    if (!this.currentEntry) { // Refresh or first entry
      this.loadState();
      if (this.currentEntry) {
        navigationFlags.refresh = true;
      } else {
        navigationFlags.first = true;
        navigationFlags.new = true;
        // TODO: Should this really be created here? Shouldn't it be in the viewer?
        this.currentEntry = {
          index: 0,
          instruction: null,
          fullStateInstruction: null,
          // path: this.options.viewer.getPath(true),
          // fromBrowser: null,
        };
        this.entries = [];
      }
    }
    if (entry.index !== undefined && !entry.replacing && !entry.refreshing) { // History navigation
      entry.historyMovement = entry.index - this.currentEntry.index;
      entry.instruction = entry.fullStateInstruction;
      entry.replacing = true;
      if (entry.historyMovement > 0) {
        navigationFlags.forward = true;
      } else if (entry.historyMovement < 0) {
        navigationFlags.back = true;
      }
    } else { // New entry
      navigationFlags.new = true;
      entry.index = (entry.replacing ? entry.index : this.entries.length);
    }
    this.invokeCallback(entry, navigationFlags, this.currentEntry);
  }

  public refresh(): Promise<void> {
    const entry = this.currentEntry;
    if (!entry) {
      return Promise.reject();
    }
    entry.replacing = true;
    entry.refreshing = true;
    return this.navigate(entry);
  }

  public go(movement: number): Promise<void> {
    const newIndex = this.currentEntry.index + movement;
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

  get titles(): string[] {
    return (this.entries ? this.entries.slice(0, this.currentEntry.index + 1).map((value) => value.title) : []);
  }

  public getState(): INavigatorState {
    const state = { ...this.options.store.state };
    const entries = (state.entries || []) as IStoredNavigatorEntry[];
    const currentEntry = state.currentEntry as IStoredNavigatorEntry;
    return { state, entries, currentEntry };
  }

  public loadState(): void {
    const state = this.getState();
    this.entries = state.entries || [];
    this.currentEntry = state.currentEntry;
  }

  public saveState(push: boolean = false): Promise<void> {
    const storedEntry = this.toStorableEntry(this.currentEntry);
    this.entries[storedEntry.index] = storedEntry;
    const state: INavigatorState = {
      entries: this.entries,
      currentEntry: storedEntry,
    };
    if (push) {
      return this.options.store.pushNavigatorState(state);
    } else {
      return this.options.store.replaceNavigatorState(state);
    }
  }

  public toStorableEntry(entry: INavigatorInstruction): IStoredNavigatorEntry {
    const {
      previous,
      fromBrowser,
      replacing,
      refreshing,
      untracked,
      historyMovement,
      navigation,

      resolve,
      reject,

      ...storableEntry } = entry;
    return storableEntry;
  }

  public async finalize(instruction: INavigatorInstruction): Promise<void> {
    this.currentEntry = instruction;
    if (this.currentEntry.untracked) {
      if (instruction.fromBrowser) {
        await this.options.store.popNavigatorState();
      }
      this.currentEntry.index--;
      this.entries[this.currentEntry.index] = this.toStorableEntry(this.currentEntry);
      await this.saveState();
    } else if (this.currentEntry.replacing) {
      this.entries[this.currentEntry.index] = this.toStorableEntry(this.currentEntry);
      await this.saveState();
    } else { // New entry (add and discard later entries)
      this.entries = this.entries.slice(0, this.currentEntry.index);
      this.entries.push(this.toStorableEntry(this.currentEntry));
      await this.saveState(true);
    }
    this.currentEntry.resolve();
  }

  public async cancel(instruction: INavigatorInstruction): Promise<void> {
    if (instruction.fromBrowser) {
      if (instruction.navigation.new) {
        await this.options.store.popNavigatorState();
      } else {
        await this.options.store.go(-instruction.historyMovement, true);
      }
    }
    this.currentEntry.resolve();
  }

  private invokeCallback(entry: INavigatorEntry, navigationFlags: INavigatorFlags, previousEntry: INavigatorEntry): void {
    const instruction: INavigatorInstruction = { ...entry };
    instruction.navigation = navigationFlags;
    instruction.previous = this.toStorableEntry(previousEntry);
    Reporter.write(10000, 'callback', instruction, instruction.previous, this.entries);
    if (this.options.callback) {
      this.options.callback(instruction);
    }
  }
}
