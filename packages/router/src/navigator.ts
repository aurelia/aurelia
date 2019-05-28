import { Reporter } from '@aurelia/kernel';
import { QueuedBrowserHistory } from './queued-browser-history';
export interface INavigationEntry {
  instruction: string;
  fullStateInstruction: string;
  index?: number;
  firstEntry?: boolean; // Index might change to not require first === 0, firstEntry should be reliable
  title?: string;
  query?: string;
  parameters?: Record<string, string>;
  parameterList?: string[];
  data?: Record<string, unknown>;
  fromBrowser: boolean;
  replacing?: boolean;
  refreshing?: boolean;
  historyMovement?: number;
}

export interface IHistoryOptions {
  callback?(instruction: INavigationInstruction): void;
}

export interface INavigationFlags {
  isFirst?: boolean;
  isNew?: boolean;
  isRefresh?: boolean;
  isForward?: boolean;
  isBack?: boolean;
  isReplace?: boolean;
  isRepeat?: boolean;
}

export interface INavigationInstruction extends INavigationEntry, INavigationFlags {
  previous?: INavigationEntry;
}

export class Navigator {
  public currentEntry: INavigationEntry;
  public entries: INavigationEntry[];

  public history: QueuedBrowserHistory;
  public location: Location;

  private options: IHistoryOptions;
  private isActive: boolean;

  private lastHistoryMovement: number;
  constructor() {
    this.location = window.location;
    this.history = new QueuedBrowserHistory();

    this.currentEntry = null;
    this.entries = null;

    this.options = null;
    this.isActive = false;

    this.lastHistoryMovement = null;
  }

  public activate(options?: IHistoryOptions): void {
    if (this.isActive) {
      throw Reporter.error(0); // TODO: create error code for 'History has already been activated.'
    }

    this.isActive = true;
    this.options = { ...options };

    // TODO: fix history connection
    // this.history.activate(this.pathChanged);
  }

  public deactivate(): void {
    this.history.deactivate();
    this.isActive = false;
  }

  public goto(path: string, title?: string, data?: Record<string, unknown>, fromBrowser: boolean = false): Promise<void> {
    const entry: INavigationEntry = {
      instruction: path,
      fullStateInstruction: null,
      title: title,
      data: data,
      fromBrowser: fromBrowser,
    };
    return this.navigateTo(entry);
  }

  public replace(path: string, title?: string, data?: Record<string, unknown>): Promise<void> {
    const entry = {
      instruction: path,
      fullStateInstruction: null,
      title: title,
      data: data,
      fromBrowser: false,
      replacing: true,
    };
    return this.navigateTo(entry);
  }

  public async refresh(): Promise<void> {
    const entry = this.currentEntry;
    if (!entry) {
      return Promise.reject();
    }
    entry.replacing = true;
    entry.refreshing = true;
    return this.navigateTo(entry);
  }

  public back(): Promise<void> {
    return this.go(-1);
  }

  public forward(): Promise<void> {
    return this.go(1);
  }

  public go(movement: number): Promise<void> {
    const newIndex = this.currentEntry.index + movement;
    if (newIndex >= this.entries.length) {
      return Promise.reject();
    }
    return this.navigateTo(this.entries[newIndex]);
  }

  public async setState(key: string | Record<string, unknown>, value?: Record<string, unknown>): Promise<void> {
    const { pathname, search, hash } = this.location;
    let state = { ...this.history.state };
    if (typeof key === 'string') {
      state[key] = JSON.parse(JSON.stringify(value));
    } else {
      state = { ...state, ...JSON.parse(JSON.stringify(key)) };
    }
    return this.history.replaceState(state, null, `${pathname}${search}${hash}`);
  }

  public getState(key: string): Record<string, unknown> {
    const state = { ...this.history.state };
    return state[key];
  }

  public setEntryTitle(title: string): Promise<void> {
    this.currentEntry.title = title;
    this.entries[this.currentEntry.index] = this.currentEntry;
    return this.setState({
      'HistoryEntries': this.entries,
      'HistoryEntry': this.currentEntry,
    });
  }

  get titles(): string[] {
    return (this.entries ? this.entries.slice(0, this.currentEntry.index + 1).map((value) => value.title) : []);
  }

  public loadState(): void {
    this.entries = (this.getState('HistoryEntries') || []) as INavigationEntry[];
    this.currentEntry = this.getState('HistoryEntry') as INavigationEntry;
  }

  public async saveState(push: boolean = false): Promise<void> {
    // TODO: Replace or push path and state (ignore change event)
    await this.setState({
      'HistoryEntries': this.entries,
      'HistoryEntry': this.currentEntry
    });
  }

  public finalize(navigation: INavigationInstruction): void {
    this.currentEntry = navigation;
    if (this.currentEntry.replacing) {
      this.entries[this.currentEntry.index] = this.currentEntry;
      this.saveState();
    } else {
      this.entries = this.entries.slice(0, this.currentEntry.index);
      this.entries.push(this.currentEntry);
      this.saveState(true);
    }
  }

  public cancel(navigation: INavigationInstruction): void {
    if (navigation.fromBrowser) {
      // TODO: Update browser history or path but ignore change event
    }
  }

  public async navigateTo(entry: INavigationEntry): Promise<void> {
    const navigationFlags: INavigationFlags = {};

    if (!this.currentEntry) { // Refresh or first entry
      this.loadState();
      if (this.currentEntry) {
        navigationFlags.isRefresh = true;
      } else {
        navigationFlags.isFirst = true;
        this.currentEntry = {
          index: 0,
          instruction: null,
          fullStateInstruction: null,
          fromBrowser: null,
        };
        this.entries = [];
      }
    }
    if (entry.index !== undefined) { // History navigation
      entry.historyMovement = entry.index - this.currentEntry.index;
      if (entry.index > 0) {
        navigationFlags.isForward = true;
      } else if (entry.index < 0) {
        navigationFlags.isBack = true;
      }
    } else { // New entry
      navigationFlags.isNew = true;
      entry.index = (entry.replacing ? entry.index : this.entries.length);
    }
    this.callback(entry, navigationFlags, this.currentEntry);
  }

  private callback(currentEntry: INavigationEntry, navigationFlags: INavigationFlags, previousEntry: INavigationEntry): void {
    const instruction: INavigationInstruction = { ...currentEntry, ...navigationFlags };
    instruction.previous = previousEntry;
    Reporter.write(10000, 'callback', currentEntry, navigationFlags);
    if (this.options.callback) {
      this.options.callback(instruction);
    }
  }
}
