export interface IHistoryEntry {
  path: string;
  index?: number;
  title?: string;
  data?: Object;
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

export interface INavigationInstruction extends IHistoryEntry, INavigationFlags {}

export class HistoryBrowser {
  public currentEntry: IHistoryEntry;
  public historyEntries: IHistoryEntry[];
  public historyOffset: number;

  public history: any;

  private activeEntry: IHistoryEntry = null;

  private location: any;

  private options: any;
  private isActive: boolean = false;

  private lastHistoryMovement: number;
  private isCancelling: boolean = false;
  private isReplacing: boolean = false;
  private isRefreshing: boolean = false;

  private __path: string; // For development, should be removed

  constructor() {
    this.location = window.location;
    this.history = window.history;
  }

  public activate(options?: Object): void {
    if (this.isActive) {
      throw new Error('History has already been activated.');
    }

    this.isActive = true;
    this.options = Object.assign({}, options);

    window.addEventListener('popstate', this.pathChanged);
    // window.onpopstate = this.pathChanged;
    // window.onpopstate = function (event) {
    //   console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
    // };

    setTimeout(() => {
      this.setPath(this.getPath(), true);
    }, 0);
    // this.pathChanged();
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
    // this.pathChanged();
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
    this.history.go(-this.lastHistoryMovement);
  }

  public setState(key: string, value: any): void {
    const state = Object.assign({}, this.history.state);
    const { pathname, search, hash } = this.location;
    state[key] = JSON.parse(JSON.stringify(value));
    this.history.replaceState(state, null, `${pathname}${search}${hash}`);
  }

  public getState(key: string): any {
    const state = Object.assign({}, this.history.state);
    return state[key];
  }

  public setEntryTitle(title: string) {
    this.currentEntry.title = title;
    this.historyEntries[this.currentEntry.index] = this.currentEntry;
    this.setState('HistoryEntries', this.historyEntries);
    this.setState('HistoryEntry', this.currentEntry);
  }

  get titles(): string[] {
    return (this.historyEntries ? this.historyEntries.slice(0, this.currentEntry.index + 1).map((value) => value.title) : []);
  }

  private pathChanged = (): void => {
    const path: string = this.getPath();
    console.log('path changed to', path, this.activeEntry, this.currentEntry);

    const navigationFlags: INavigationFlags = {};

    let historyEntry: IHistoryEntry = this.getState('HistoryEntry');
    if (this.activeEntry && this.activeEntry.path === path) { // Only happens with new history entries (including replacing ones)
      navigationFlags.isNew = true;
      const index = (this.isReplacing ? this.currentEntry.index : this.history.length - this.historyOffset);
      this.currentEntry = this.activeEntry;
      this.currentEntry.index = index;
      if (this.isReplacing) {
        this.lastHistoryMovement = 0;
        this.historyEntries[this.currentEntry.index] = this.currentEntry;
        if (this.isRefreshing) {
          navigationFlags.isRefresh = true;
          this.isRefreshing = false;
        }
        else {
          navigationFlags.isReplace = true;
        }
        this.isReplacing = false;
      }
      else {
        this.lastHistoryMovement = 1;
        this.historyEntries = this.historyEntries.slice(0, this.currentEntry.index);
        this.historyEntries.push(this.currentEntry);
      }
      this.setState('HistoryEntries', this.historyEntries);
      this.setState('HistoryOffset', this.historyOffset);
      this.setState('HistoryEntry', this.currentEntry);
    }
    else { // Refresh, history navigation, first navigation, manual navigation or cancel
      this.historyEntries = this.historyEntries || this.getState('HistoryEntries') || [];
      this.historyOffset = this.historyOffset || this.getState('HistoryOffset') || 0;
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

    console.log('navigated', this.getState('HistoryEntry'), this.historyEntries, this.getState('HistoryOffset'));
    this.callback(this.currentEntry, navigationFlags);
  }

  private getPath(): string {
    return this.location.hash.substr(1);
    // return this.__path;
  }
  private setPath(path: string, replace: boolean = false): void {
    // More checks, such as parameters, needed
    if (this.currentEntry && this.currentEntry.path === path && !this.isRefreshing) {
      return;
    }

    const { pathname, search } = this.location;
    const hash = '#' + path;
    if (replace) {
      this.history.replaceState({}, null, `${pathname}${search}${hash}`);
    }
    else {
      // this.location.hash = hash;
      this.history.pushState({}, null, `${pathname}${search}${hash}`);
    }
    this.pathChanged();
  }
  private callback(currentEntry: Object, navigationFlags: INavigationFlags): void {
    const instruction: any = Object.assign({}, currentEntry, navigationFlags);
    console.log('callback', currentEntry, navigationFlags);
    if (this.options.callback) {
      this.options.callback(instruction);
    }
  }
}
