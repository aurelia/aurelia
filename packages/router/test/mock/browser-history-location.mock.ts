export class MockBrowserHistoryLocation {
  public changeCallback?: () => void;

  private readonly states: Record<string, unknown>[] = [{}];
  private readonly paths: string[] = [''];
  private index: number = 0;

  get length(): number {
    return this.states.length;
  }
  get state(): Record<string, unknown> {
    return this.states[this.index];
  }
  get path(): string {
    return this.paths[this.index];
  }

  get pathname(): string {
    const parts = this.parts;
    // parts.shift();
    return parts.shift();
  }
  get search(): string {
    const parts = this.parts;
    // if (parts.shift()) {
    //   parts.shift();
    // }
    parts.shift();
    const part: string = parts.shift();
    return part !== undefined ? `?${part}` : '';
  }
  get hash(): string {
    const parts = this.parts;
    // if (!parts.shift()) {
    //   parts.shift();
    // }
    parts.shift();
    parts.shift();
    const part: string = parts.shift();
    return part !== undefined ? `#${part}` : '';
  }
  set hash(value: string) {
    if (value.startsWith('#')) {
      value = value.substring(1);
    }
    const parts = this.parts;
    // const hashFirst = parts.shift();
    let path = parts.shift();
    // if (hashFirst) {
    //   parts.shift();
    //   path += `#${value}`;
    //   const part = parts.shift();
    //   if (part !== undefined) {
    //     path += `?${part}`;
    //   }
    // } else {
    const part = parts.shift();
    if (part !== undefined) {
        path += `?${part}`;
      }
    parts.shift();
    path += `#${value}`;
    // }

    this.pushState({}, null, path);
    this.notifyChange();
  }

  // TODO: Fix a better split
  private get parts(): string[] {
    const parts = [];
    const ph = this.path.split('#');
    if (ph.length > 1) {
      parts.unshift(ph.pop());
    } else {
      parts.unshift(undefined);
    }
    const pq = ph[0].split('?');
    if (pq.length > 1) {
      parts.unshift(pq.pop());
    } else {
      parts.unshift(undefined);
    }
    parts.unshift(pq[0]);
    // const parts: (string | boolean)[] = this.path.split(/[#?]/);
    // let search = this.path.indexOf('?') >= 0 ? this.path.indexOf('?') : 99999;
    // let hash = this.path.indexOf('#') >= 0 ? this.path.indexOf('#') : 99999;
    // parts.unshift(hash < search);
    return parts;
  }

  public pushState(data: Record<string, unknown>, title: string, path: string) {
    this.states.splice(this.index + 1);
    this.paths.splice(this.index + 1);
    this.states.push(data);
    this.paths.push(path);
    this.index++;
  }

  public replaceState(data: Record<string, unknown>, title: string, path: string) {
    this.states[this.index] = data;
    this.paths[this.index] = path;
  }

  public go(movement: number) {
    const newIndex = this.index + movement;
    if (newIndex >= 0 && newIndex < this.states.length) {
      this.index = newIndex;
      this.notifyChange();
    }
  }

  private notifyChange() {
    if (this.changeCallback) {
      console.log('MOCK: notifyChange', this.path, this.state);
      this.changeCallback();
    }
  }
}
