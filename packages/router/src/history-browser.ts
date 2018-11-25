export interface IHistoryEntry {
  path: string;
  index?: number;
  title?: string;
  data?: Object;
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

  private activeEntry: IHistoryEntry = null;

  private location: Location;

  private options: IHistoryOptions;
  private isActive: boolean = false;

  private lastHistoryMovement: number;
  private cancelRedirectHistoryMovement: number;
  private isCancelling: boolean = false;
  private isReplacing: boolean = false;
  private isRefreshing: boolean = false;

  private __path: string; // For development, should be removed

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

  public goto(path: string, title?: string, data?: Object): void {
    this.activeEntry = {
      path: path,
      title: title,
      data: data,
    };
    this.setPath(path);
  }

  public replace(path: string, title?: string, data?: Object): void {
    this.isReplacing = true;
    this.activeEntry = {
      path: path,
      title: title,
      data: data,
    };
    this.setPath(path, true);
  }
  public redirect(path: string, title?: string, data?: Object): void {
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

  public setState(key: string, value: Object): void {
    const state = { ...this.history.state };
    const { pathname, search, hash } = this.location;
    state[key] = JSON.parse(JSON.stringify(value));
    this.history.replaceState(state, null, `${pathname}${search}${hash}`);
  }

  public getState(key: string): Object {
    const state = { ...this.history.state };
    return state[key];
  }

  public setEntryTitle(title: string): void {
    this.currentEntry.title = title;
    this.historyEntries[this.currentEntry.index] = this.currentEntry;
    this.setState('HistoryEntries', this.historyEntries);
    this.setState('HistoryEntry', this.currentEntry);
  }

  public replacePath(path: string): void {
    const state = { ...this.history.state };
    const { pathname, search } = this.location;
    this.history.replaceState(state, null, `${pathname}${search}#/${path}`);
  }

  get titles(): string[] {
    return (this.historyEntries ? this.historyEntries.slice(0, this.currentEntry.index + 1).map((value) => value.title) : []);
  }

  private pathChanged = (): void => {
    const path: string = this.getPath();
    // tslint:disable-next-line:no-console
    console.log('path changed to', path, this.activeEntry, this.currentEntry);

    const navigationFlags: INavigationFlags = {};

    let historyEntry: IHistoryEntry = <IHistoryEntry>this.getState('HistoryEntry');
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
      this.setState('HistoryEntries', this.historyEntries);
      this.setState('HistoryOffset', this.historyOffset);
      this.setState('HistoryEntry', this.currentEntry);
    } else { // Refresh, history navigation, first navigation, manual navigation or cancel
      this.historyEntries = <IHistoryEntry[]>(this.historyEntries || this.getState('HistoryEntries') || []);
      this.historyOffset = <number>(this.historyOffset || this.getState('HistoryOffset') || 0);
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
        historyEntry = {
          path: path,
          index: this.history.length - this.historyOffset,
        };
        this.historyEntries = this.historyEntries.slice(0, historyEntry.index);
        this.historyEntries.push(historyEntry);
        this.setState('HistoryEntries', this.historyEntries);
        this.setState('HistoryOffset', this.historyOffset);
        this.setState('HistoryEntry', historyEntry);
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
    return this.location.hash.substr(1);
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
  private callback(currentEntry: IHistoryEntry, navigationFlags: INavigationFlags): void {
    const instruction: INavigationInstruction = { ...currentEntry, ...navigationFlags };
    // tslint:disable-next-line:no-console
    console.log('callback', currentEntry, navigationFlags);
    if (this.options.callback) {
      this.options.callback(instruction);
    }
  }
}
