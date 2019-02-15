import { Reporter } from '@aurelia/kernel';
import { QueuedBrowserHistory } from './queued-browser-history';
export interface IHistoryEntry {
  path: string;
  fullStatePath: string;
  index?: number;
  firstEntry?: boolean; // Index might change to not require first === 0, firstEntry should be reliable
  title?: string;
  query?: string;
  parameters?: Record<string, string>;
  parameterList?: string[];
  data?: Record<string, unknown>;
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

export interface INavigationInstruction extends IHistoryEntry, INavigationFlags {
  previous?: IHistoryEntry;
}

export class HistoryBrowser {
  public currentEntry: IHistoryEntry;
  public historyEntries: IHistoryEntry[];
  public historyOffset: number;
  public replacedEntry: IHistoryEntry;

  public history: QueuedBrowserHistory;
  public location: Location;

  private activeEntry: IHistoryEntry;

  private options: IHistoryOptions;
  private isActive: boolean;

  private lastHistoryMovement: number;
  private isReplacing: boolean;
  private isRefreshing: boolean;

  constructor() {
    this.location = window.location;
    this.history = new QueuedBrowserHistory();

    this.currentEntry = null;
    this.historyEntries = null;
    this.historyOffset = null;
    this.replacedEntry = null;

    this.activeEntry = null;

    this.options = null;
    this.isActive = false;

    this.lastHistoryMovement = null;
    this.isReplacing = false;
    this.isRefreshing = false;
  }

  public activate(options?: IHistoryOptions): Promise<void> {
    if (this.isActive) {
      throw Reporter.error(0); // TODO: create error code for 'History has already been activated.'
    }

    this.isActive = true;
    this.options = { ...options };

    this.history.activate(this.pathChanged);

    return Promise.resolve().then(() => {
      this.setPath(this.getPath(), true).catch(error => { throw error; });
    });
  }

  public deactivate(): void {
    this.history.deactivate();
    this.isActive = false;
  }

  public goto(path: string, title?: string, data?: Record<string, unknown>): Promise<void> {
    this.activeEntry = {
      path: path,
      fullStatePath: null,
      title: title,
      data: data,
    };
    return this.setPath(path);
  }

  public replace(path: string, title?: string, data?: Record<string, unknown>): Promise<void> {
    this.isReplacing = true;
    this.activeEntry = {
      path: path,
      fullStatePath: null,
      title: title,
      data: data,
    };
    return this.setPath(path, true);
  }

  public async refresh(): Promise<void> {
    if (!this.currentEntry) {
      return;
    }
    this.isRefreshing = true;
    return this.replace(this.currentEntry.path, this.currentEntry.title, this.currentEntry.data);
  }

  public back(): Promise<void> {
    return this.history.go(-1);
  }

  public forward(): Promise<void> {
    return this.history.go(1);
  }

  public cancel(): Promise<void> {
    const movement = this.lastHistoryMovement;
    if (movement) {
      this.lastHistoryMovement = 0;
      return this.history.go(-movement, true);
    } else {
      return this.replace(this.replacedEntry.path, this.replacedEntry.title, this.replacedEntry.data);
    }
  }

  public async pop(): Promise<void> {
    await this.history.go(-1, true);
    const path = this.location.toString();
    const state = this.history.state;
    // TODO: Fix browser forward bug after pop on first entry
    if (!state.HistoryEntry.firstEntry) {
      await this.history.go(-1, true);
      return this.history.pushState(state, null, path);
    }
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
    this.historyEntries[this.currentEntry.index] = this.currentEntry;
    return this.setState({
      'HistoryEntries': this.historyEntries,
      'HistoryEntry': this.currentEntry,
    });
  }

  public replacePath(path: string, fullStatePath: string, entry: INavigationInstruction): Promise<void> {
    if (entry.index !== this.currentEntry.index) {
      // TODO: Store unresolved in localStorage to set if we should ever navigate back to it
      // tslint:disable-next-line:no-console
      console.warn('replacePath: entry not matching currentEntry', entry, this.currentEntry);
      return;
    }

    const newHash = `#/${path}`;
    const { pathname, search, hash } = this.location;
    // tslint:disable-next-line:possible-timing-attack
    if (newHash === hash && this.currentEntry.path === path && this.currentEntry.fullStatePath === fullStatePath) {
      return;
    }
    this.currentEntry.path = path;
    this.currentEntry.fullStatePath = fullStatePath;
    const state = {
      ...this.history.state,
      ...{
        'HistoryEntry': this.currentEntry,
        'HistoryEntries': this.historyEntries,
      }
    };
    return this.history.replaceState(state, null, `${pathname}${search}${newHash}`);
  }

  public setHash(hash: string): void {
    if (!hash.startsWith('#')) {
      hash = `#${hash}`;
    }
    this.location.hash = hash;
  }

  get titles(): string[] {
    return (this.historyEntries ? this.historyEntries.slice(0, this.currentEntry.index + 1).map((value) => value.title) : []);
  }

  public pathChanged = async (): Promise<void> => {
    const path: string = this.getPath();
    const search: string = this.getSearch();
    Reporter.write(10000, 'path changed to', path, this.activeEntry, this.currentEntry);

    const navigationFlags: INavigationFlags = {};

    let previousEntry: IHistoryEntry;
    let historyEntry: IHistoryEntry = this.getState('HistoryEntry') as IHistoryEntry;
    if (this.activeEntry && this.activeEntry.path === path) { // Only happens with new history entries (including replacing ones)
      navigationFlags.isNew = true;
      const index = (this.isReplacing ? this.currentEntry.index : this.history.length - this.historyOffset);
      previousEntry = this.currentEntry;
      this.currentEntry = this.activeEntry;
      this.currentEntry.index = index;
      if (this.isReplacing) {
        this.lastHistoryMovement = 0;
        this.historyEntries[this.currentEntry.index] = this.currentEntry;
        if (this.isRefreshing) {
          navigationFlags.isRefresh = true;
          this.isRefreshing = false;
        } else {
          navigationFlags.isReplace = true;
        }
        this.isReplacing = false;
      } else {
        this.lastHistoryMovement = 1;
        this.historyEntries = this.historyEntries.slice(0, this.currentEntry.index);
        this.historyEntries.push(this.currentEntry);
      }
      await this.setState({
        'HistoryEntries': this.historyEntries,
        'HistoryOffset': this.historyOffset,
        'HistoryEntry': this.currentEntry
      });
    } else { // Refresh, history navigation, first navigation, manual navigation or cancel
      this.historyEntries = (this.historyEntries || this.getState('HistoryEntries') || []) as IHistoryEntry[];
      // tslint:disable-next-line:strict-boolean-expressions
      this.historyOffset = (this.historyOffset || this.getState('HistoryOffset') || 0) as number;
      if (!historyEntry && !this.currentEntry) {
        navigationFlags.isNew = true;
        navigationFlags.isFirst = true;
        this.historyOffset = this.history.length;
      } else if (!historyEntry) {
        navigationFlags.isNew = true;
      } else if (!this.currentEntry) {
        navigationFlags.isRefresh = true;
      } else if (this.currentEntry.index < historyEntry.index) {
        navigationFlags.isForward = true;
      } else if (this.currentEntry.index > historyEntry.index) {
        navigationFlags.isBack = true;
      }

      if (!historyEntry) {
        // TODO: max history length of 50, find better new index
        historyEntry = {
          path: path,
          fullStatePath: null,
          index: this.history.length - this.historyOffset,
          query: search,
        };
        if (navigationFlags.isFirst) {
          historyEntry.firstEntry = true;
        }
        this.historyEntries = this.historyEntries.slice(0, historyEntry.index);
        this.historyEntries.push(historyEntry);
        await this.setState({
          'HistoryEntries': this.historyEntries,
          'HistoryOffset': this.historyOffset,
          'HistoryEntry': historyEntry
        });
      }
      this.lastHistoryMovement = (this.currentEntry ? historyEntry.index - this.currentEntry.index : 0);
      previousEntry = this.currentEntry;
      this.currentEntry = historyEntry;
    }
    this.activeEntry = null;

    Reporter.write(10000, 'navigated', this.getState('HistoryEntry'), this.historyEntries, this.getState('HistoryOffset'));
    this.callback(this.currentEntry, navigationFlags, previousEntry);
  }

  private getPath(): string {
    const hash = this.location.hash.substring(1);
    return hash.split('?')[0];
  }
  private async setPath(path: string, replace: boolean = false): Promise<void> {
    // More checks, such as parameters, needed
    if (this.currentEntry && this.currentEntry.path === path && !this.isRefreshing) {
      return;
    }

    const { pathname, search } = this.location;
    const hash = `#${path}`;
    if (replace) {
      this.replacedEntry = this.currentEntry;
      await this.history.replaceState({}, null, `${pathname}${search}${hash}`);
    } else {
      // tslint:disable-next-line:no-commented-code
      // this.location.hash = hash;
      await this.history.pushState({}, null, `${pathname}${search}${hash}`);
    }
    return this.pathChanged();
  }

  private getSearch(): string {
    const hash = this.location.hash.substring(1);
    const hashSearches = hash.split('?');
    hashSearches.shift();
    return hashSearches.length > 0 ? hashSearches.shift() : '';
  }

  private callback(currentEntry: IHistoryEntry, navigationFlags: INavigationFlags, previousEntry: IHistoryEntry): void {
    const instruction: INavigationInstruction = { ...currentEntry, ...navigationFlags };
    instruction.previous = previousEntry;
    Reporter.write(10000, 'callback', currentEntry, navigationFlags);
    if (this.options.callback) {
      this.options.callback(instruction);
    }
  }
}
