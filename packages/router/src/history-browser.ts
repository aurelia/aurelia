export interface IHistoryEntry {
  path: string;
  fullStatePath: string;
  index?: number;
  title?: string;
  query?: string;
  parameters?: Record<string, string>;
  parameterList?: string[];
  data?: Record<string, unknown>;
}

export interface IHistoryOptions {
  callback?: Function;
}

export interface INavigationFlags {
  isFirst?: boolean;
  isNew?: boolean;
  isRefresh?: boolean;
  isForward?: boolean;
  isBack?: boolean;
  isReplace?: boolean;
  isCancel?: boolean;
}

export interface INavigationInstruction extends IHistoryEntry, INavigationFlags { }

export class HistoryBrowser {
  public currentEntry: IHistoryEntry;
  public historyEntries: IHistoryEntry[];
  public historyOffset: number;
  public replacedEntry: IHistoryEntry;

  public history: History;
  public location: Location;

  private activeEntry: IHistoryEntry = null;

  private options: IHistoryOptions;
  private isActive: boolean = false;

  private lastHistoryMovement: number;
  private cancelRedirectHistoryMovement: number;
  private isCancelling: boolean = false;
  private isReplacing: boolean = false;
  private isRefreshing: boolean = false;

  constructor() {
    this.location = window.location;
    this.history = window.history;
  }

  public activate(options?: IHistoryOptions): Promise<void> {
    if (this.isActive) {
      throw new Error('History has already been activated.');
    }

    this.isActive = true;
    this.options = { ...options };

    window.addEventListener('popstate', this.pathChanged);

    return Promise.resolve().then(() => {
      this.setPath(this.getPath(), true);
    });
  }

  public deactivate(): void {
    window.removeEventListener('popstate', this.pathChanged);
    this.isActive = false;
  }

  public goto(path: string, title?: string, data?: Record<string, unknown>): void {
    this.activeEntry = {
      path: path,
      fullStatePath: null,
      title: title,
      data: data,
    };
    this.setPath(path);
  }

  public replace(path: string, title?: string, data?: Record<string, unknown>): void {
    this.isReplacing = true;
    this.activeEntry = {
      path: path,
      fullStatePath: null,
      title: title,
      data: data,
    };
    this.setPath(path, true);
  }
  public redirect(path: string, title?: string, data?: Record<string, unknown>): void {
    // This makes sure we can cancel redirects from both pushes and replaces
    this.cancelRedirectHistoryMovement = this.lastHistoryMovement + 1;
    this.replace(path, title, data);
  }

  public refresh(): void {
    if (!this.currentEntry) {
      return;
    }
    this.isRefreshing = true;
    this.replace(this.currentEntry.path, this.currentEntry.title, this.currentEntry.data);
  }

  public back(): void {
    this.history.go(-1);
  }

  public forward(): void {
    this.history.go(1);
  }

  public cancel(): void {
    this.isCancelling = true;
    const movement = this.lastHistoryMovement || this.cancelRedirectHistoryMovement;
    if (movement) {
      this.history.go(-movement);
    } else {
      this.replace(this.replacedEntry.path, this.replacedEntry.title, this.replacedEntry.data);
    }
  }

  public setState(key: string | Record<string, unknown>, value?: Record<string, unknown>): void {
    const { pathname, search, hash } = this.location;
    let state = { ...this.history.state };
    if (typeof key === 'string') {
      state[key] = JSON.parse(JSON.stringify(value));
    } else {
      state = { ...state, ...JSON.parse(JSON.stringify(key)) };
    }
    this.history.replaceState(state, null, `${pathname}${search}${hash}`);
  }

  public getState(key: string): Record<string, unknown> {
    const state = { ...this.history.state };
    return state[key];
  }

  public setEntryTitle(title: string): void {
    this.currentEntry.title = title;
    this.historyEntries[this.currentEntry.index] = this.currentEntry;
    this.setState({
      'HistoryEntries': this.historyEntries,
      'HistoryEntry': this.currentEntry,
    });
  }

  public replacePath(path: string, fullStatePath: string, entry: INavigationInstruction): void {
    if (entry.index !== this.currentEntry.index) {
      // TODO: Store unresolved in localStorage to set if we should ever navigate back to it
      // tslint:disable-next-line:no-console
      console.warn('replacePath: entry not matching currentEntry', entry, this.currentEntry);
      return;
    }

    const newHash = `#/${path}`;
    const { pathname, search, hash } = this.location;
    // tslint:disable-next-line:possible-timing-attack
    if (newHash === hash) {
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
    this.history.replaceState(state, null, `${pathname}${search}${newHash}`);
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

  public pathChanged = (): void => {
    const path: string = this.getPath();
    const search: string = this.getSearch();
    // tslint:disable-next-line:no-console
    console.log('path changed to', path, this.activeEntry, this.currentEntry);

    const navigationFlags: INavigationFlags = {};

    let historyEntry: IHistoryEntry = this.getState('HistoryEntry') as IHistoryEntry;
    if (this.activeEntry && this.activeEntry.path === path) { // Only happens with new history entries (including replacing ones)
      navigationFlags.isNew = true;
      const index = (this.isReplacing ? this.currentEntry.index : this.history.length - this.historyOffset);
      this.currentEntry = this.activeEntry;
      this.currentEntry.index = index;
      if (this.isReplacing) {
        this.lastHistoryMovement = 0;
        this.historyEntries[this.currentEntry.index] = this.currentEntry;
        if (this.isCancelling) {
          navigationFlags.isCancel = true;
          this.isCancelling = false;
          // Prevent another cancel by clearing lastHistoryMovement?
        } else if (this.isRefreshing) {
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
      this.setState({
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
        this.historyEntries = this.historyEntries.slice(0, historyEntry.index);
        this.historyEntries.push(historyEntry);
        this.setState({
          'HistoryEntries': this.historyEntries,
          'HistoryOffset': this.historyOffset,
          'HistoryEntry': historyEntry
        });
      }
      this.lastHistoryMovement = (this.currentEntry ? historyEntry.index - this.currentEntry.index : 0);
      this.currentEntry = historyEntry;

      if (this.isCancelling) {
        navigationFlags.isCancel = true;
        this.isCancelling = false;
        // Prevent another cancel by clearing lastHistoryMovement?
      }
    }
    this.activeEntry = null;

    if (this.cancelRedirectHistoryMovement) {
      this.cancelRedirectHistoryMovement--;
    }

    // tslint:disable-next-line:no-console
    console.log('navigated', this.getState('HistoryEntry'), this.historyEntries, this.getState('HistoryOffset'));
    this.callback(this.currentEntry, navigationFlags);
  }

  private getPath(): string {
    const hash = this.location.hash.substr(1);
    return hash.split('?')[0];
  }
  private setPath(path: string, replace: boolean = false): void {
    // More checks, such as parameters, needed
    if (this.currentEntry && this.currentEntry.path === path && !this.isRefreshing) {
      return;
    }

    const { pathname, search } = this.location;
    const hash = `#${path}`;
    if (replace) {
      this.replacedEntry = this.currentEntry;
      this.history.replaceState({}, null, `${pathname}${search}${hash}`);
    } else {
      // tslint:disable-next-line:no-commented-code
      // this.location.hash = hash;
      this.history.pushState({}, null, `${pathname}${search}${hash}`);
    }
    this.pathChanged();
  }

  private getSearch(): string {
    const hash = this.location.hash.substr(1) || '';
    const hashSearches = hash.split('?');
    hashSearches.shift();
    return hashSearches.shift() || '';
  }

  private callback(currentEntry: IHistoryEntry, navigationFlags: INavigationFlags): void {
    const instruction: INavigationInstruction = { ...currentEntry, ...navigationFlags };
    // tslint:disable-next-line:no-console
    console.log('callback', currentEntry, navigationFlags);
    if (this.options.callback) {
      this.options.callback(instruction);
    }
  }
}
