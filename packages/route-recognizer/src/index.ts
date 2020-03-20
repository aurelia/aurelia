export interface IConfigurableRoute {
  readonly path: string;
  readonly caseSensitive?: boolean;
}

export class ConfigurableRoute implements IConfigurableRoute {
  public constructor(
    public readonly path: string,
    public readonly caseSensitive: boolean,
  ) {}
}

export class RouteEntry {
  public constructor(
    public readonly route: ConfigurableRoute,
    public readonly handler: unknown,
  ) {}
}

export class RouteRecognizer {
  public readonly rootState: State = new State(null, null, '');

  public add(
    route: IConfigurableRoute,
    handler: unknown,
  ): void {
    const entry = new RouteEntry(
      new ConfigurableRoute(
        route.path,
        route.caseSensitive === true,
      ),
      handler,
    );
    const { segments } = URLPath.parse(entry.route.path);
    const optionalStates: State[] = [];

    let isEmpty = true;
    let state = this.rootState;

    for (const segment of segments) {
      // Automatically normalize leading, trailing and double slashes by ignoring empty segments
      if (segment.isEmpty) {
        continue;
      }

      // Each segment always begins with a slash, so we represent this with a non-segment state
      state = state.link(null, '/');

      // Add the first part of this segment to the end of any existing optional states
      optionalStates.forEach(x => x.successors.push(state));

      let isOptional = false;
      const { value } = segment;
      switch (value.charAt(0)) {
        case ':': { // route parameter
          if (value.endsWith('?')) { // optional
            isOptional = true;
            optionalStates.push(new DynamicSegment(segment, value.slice(1, -1), true).link(state));
          } else {
            state = new DynamicSegment(segment, value.slice(1), false).link(state);
          }
          break;
        }
        case '*': { // dynamic route
          state = new StarSegment(segment, value.slice(1)).link(state);
          break;
        }
        default: { // standard path route
          state = new StaticSegment(segment, value, entry.route.caseSensitive).link(state);
          break;
        }
      }

      if (!isOptional) {
        optionalStates.length = 0;
        isEmpty = false;
      }
    }

    // A fully empty route is represented by simply a slash
    // An "all optional" path is technically empty since the current state is the provided root state
    if (isEmpty) {
      state = state.link(null, '/');
    }

    state.makeTerminal(entry);

    // Any trailing optional states need to be indicated as terminal as well
    optionalStates.forEach(x => x.makeTerminal(entry));
  }

  public recognize(path: string):
}

export class State {
  public readonly predecessor: State;
  public readonly successors: State[] = [];
  public get isTerminal(): boolean {
    return this.entry !== null;
  }
  public entry: RouteEntry | null = null;

  public constructor(
    predecessor: State | null,
    public readonly segment: ParsedSegment | null,
    public readonly value: string,
  ) {
    this.predecessor = predecessor ?? this;
  }

  public link(
    segment: ParsedSegment | null,
    value: string,
  ): State {
    const { successors } = this;
    let state = successors.find(s =>
      s.value === value &&
      s.segment?.kind === segment?.kind
    );

    if (state === void 0) {
      successors.push(state = new State(this, segment, value));

      switch (segment?.kind) {
        case SegmentKind.dynamic:
        case SegmentKind.star:
          state.successors.push(state);
      }
    }

    return state;
  }

  public makeTerminal(entry: RouteEntry): void {
    this.entry = entry;
  }

  public isMatch(ch: string): boolean {
    switch (this.segment?.kind) {
      case SegmentKind.static:
        return this.value.includes(ch);
      case SegmentKind.dynamic:
        return !this.value.includes(ch);
      case SegmentKind.star:
        return true;
      case undefined:
        // segment separators (slashes) are non-segments. We could say return ch === '/' as well, technically.
        return this.value.includes(ch);
    }
  }
}

export class URLPath {
  private constructor(
    public readonly rawURL: string,
    public readonly segments: readonly RawSegment[],
  ) {}

  public static parse(rawURL: string): URLPath {
    const parts = rawURL.split('/');
    const segments = Array(parts.length) as RawSegment[];
    const url = new URLPath(rawURL, segments);

    let prev: RawSegment | null = null;
    let cur: RawSegment;
    for (let i = 0, ii = parts.length; i < ii; ++i) {
      cur = new RawSegment(url, parts[i]);
      if (prev !== null) {
        prev.next = cur;
        cur.prev = prev;
      }
      prev = cur;
    }
    return url;
  }
}

export class RawSegment {
  public prev: RawSegment | null = null;
  public next: RawSegment | null = null;

  public readonly isEmpty: boolean;

  public constructor(
    public readonly url: URLPath,
    public readonly value: string,
  ) {
    this.isEmpty = value.length === 0;
  }
}

export type ParsedSegment = (
  StaticSegment |
  DynamicSegment |
  StarSegment
);

export const enum SegmentKind {
  star    = 1,
  dynamic = 2,
  static  = 3,
}

export class StaticSegment {
  public get kind(): SegmentKind.static { return SegmentKind.static; }

  public constructor(
    public readonly raw: RawSegment,
    public readonly value: string,
    public readonly caseSensitive: boolean,
  ) {}

  public link(state: State): State {
    const { value, value: { length } } = this;

    if (this.caseSensitive) {
      for (let i = 0; i < length; ++i) {
        state = state.link(
          /* segment */this,
          /* value   */value.charAt(i),
        );
      }
    } else {
      for (let i = 0; i < length; ++i) {
        const ch = value.charAt(i);
        state = state.link(
          /* segment */this,
          /* value   */ch.toUpperCase() + ch.toLowerCase(),
        );
      }
    }

    return state;
  }
}

export class DynamicSegment {
  public get kind(): SegmentKind.dynamic { return SegmentKind.dynamic; }

  public constructor(
    public readonly raw: RawSegment,
    public readonly name: string,
    public readonly optional: boolean,
  ) {}

  public link(state: State): State {
    return state.link(
      /* segment */this,
      /* value   */'/',
    );
  }
}

export class StarSegment {
  public get kind(): SegmentKind.star { return SegmentKind.star; }

  public constructor(
    public readonly raw: RawSegment,
    public readonly name: string,
  ) {}

  public link(state: State): State {
    return state.link(
      /* segment */this,
      /* value   */'',
    );
  }
}
