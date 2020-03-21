import { IQueryParams, parseQueryString } from '@aurelia/kernel';

export interface IConfigurableRoute<T> {
  readonly path: string;
  readonly caseSensitive?: boolean;
  readonly handler: T;
}

export class ConfigurableRoute<T> implements IConfigurableRoute<T> {
  public constructor(
    public readonly path: string,
    public readonly caseSensitive: boolean,
    public readonly handler: T,
  ) {}
}

export class Endpoint<T> {
  public constructor(
    public readonly route: ConfigurableRoute<T>,
    public readonly paramNames: readonly string[],
  ) {}
}

export class RecognizedRoute<T> {
  public constructor(
    public readonly endpoint: Endpoint<T>,
    public readonly params: Readonly<Record<string, string | undefined>>,
    public readonly queryParams: Readonly<IQueryParams>,
    public readonly isDynamic: boolean,
    public readonly queryString: string,
  ) {}
}

export class RouteRecognizer<T> {
  public readonly rootState: State<T> = new State(null, null, '');
  private sequenceId: number = 0;

  public add(
    routeOrRoutes: IConfigurableRoute<T> | readonly IConfigurableRoute<T>[],
  ): void {
    if (Array.isArray(routeOrRoutes)) {
      return routeOrRoutes.forEach(x => this.add(x));
    }
    const route = routeOrRoutes as IConfigurableRoute<T>;
    const $route = new ConfigurableRoute(route.path, route.caseSensitive === true, route.handler);
    const parts = parsePath($route.path);
    const optionalStates: State<T>[] = [];
    const paramNames: string[] = [];

    let isEmpty = true;
    let state = this.rootState;

    let prev: ParsedSegment<T> | null = null;

    for (const part of parts) {
      // Each segment always begins with a slash, so we represent this with a non-segment state
      state = state.append(null, '/');

      // Add the first part of this segment to the end of any existing optional states
      optionalStates.forEach(x => x.nextStates.push(state));

      let isOptional = false;
      switch (part.charAt(0)) {
        case ':': { // route parameter
          let name: string;
          if (part.endsWith('?')) { // optional
            isOptional = true;
            name = part.slice(1, -1);
            optionalStates.push((prev = new DynamicSegment(prev, name, true)).appendTo(state));
          } else {
            name = part.slice(1);
            state = (prev = new DynamicSegment(prev, name, false)).appendTo(state);
          }
          paramNames.push(name);
          break;
        }
        case '*': { // dynamic route
          const name = part.slice(1);
          paramNames.push(name);
          state = (prev = new StarSegment(prev, name)).appendTo(state);
          break;
        }
        default: { // standard path route
          state = (prev = new StaticSegment(prev, part, $route.caseSensitive)).appendTo(state);
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
      state = state.append(null, '/');
    }

    const endpoint = new Endpoint<T>($route, paramNames);

    state.setEndpoint(endpoint);

    // Any trailing optional states need to be endpoints as well
    optionalStates.forEach(x => x.setEndpoint(endpoint));
  }

  public recognize(path: string): RecognizedRoute<T> | null {
    let queryParams: IQueryParams;
    let queryString = '';

    const queryStart = path.indexOf('?');
    if (queryStart >= 0) {
      queryString = path.slice(queryStart + 1);
      path = path.slice(0, queryStart);
      queryParams = parseQueryString(queryString);
    } else {
      queryParams = {};
    }

    path = decodeURI(path);

    if (!path.startsWith('/')) {
      path = `/${path}`;
    }

    let isSlashDropped: boolean;
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
      isSlashDropped = true;
    } else {
      isSlashDropped = false;
    }

    let states = [this.rootState];
    const sequenceId = ++this.sequenceId;
    for (let i = 0, ii = path.length; i < ii; ++i) {
      const ch = path.charAt(i);
      states = states.flatMap(x => x.nextStates.filter(y => y.isMatch(sequenceId, path, ch)));
      if (states.length === 0) {
        return null;
      }
    }

    const solutions = states.filter(x => x.hasEndpoint).sort((a, b) => a.compareTo(b));
    if (solutions.length === 0) {
      return null;
    }

    const solution = solutions[0];
    const params = solution.path.getParams(path);
    const isDynamic = solution.path.isDynamic;

    return new RecognizedRoute<T>(
      solution.endpoint!,
      params,
      queryParams,
      isDynamic,
      '',
    );
  }
}

class State<T> {
  public readonly nextStates: State<T>[] = [];
  public readonly isSeparator: boolean;

  private _scores: readonly number[] | undefined = void 0;
  public get scores(): readonly number[] {
    let scores = this._scores;
    if (scores === void 0) {
      scores = this._scores = this.path.segments.map(x => x.kind);
    }
    return scores;
  }

  private _endpoint: Endpoint<T> | null = null;
  public get endpoint(): Endpoint<T> | null {
    return this._endpoint;
  }
  public get hasEndpoint(): boolean {
    return this._endpoint !== null;
  }

  public get path(): ParsedPath<T> {
    return this.segment!.path;
  }

  public constructor(
    public readonly prevState: State<T> | null,
    public readonly segment: ParsedSegment<T> | null,
    public readonly value: string,
  ) {
    this.isSeparator = segment === null;
  }

  public append(
    segment: ParsedSegment<T> | null,
    value: string,
  ): State<T> {
    const { nextStates } = this;
    let state = nextStates.find(s =>
      s.value === value &&
      s.segment?.kind === segment?.kind
    );

    if (state === void 0) {
      nextStates.push(state = new State(this, segment, value));

      switch (segment?.kind) {
        case SegmentKind.dynamic:
        case SegmentKind.star:
          state.nextStates.push(state);
      }
    }

    return state;
  }

  public setEndpoint(endpoint: Endpoint<T>): void {
    this._endpoint = endpoint;
  }

  public isMatch(
    sequenceId: number,
    path: string,
    ch: string,
  ): boolean {
    switch (this.segment?.kind) {
      case SegmentKind.static:
        return this.value.includes(ch);
      case SegmentKind.dynamic:
        if (!this.value.includes(ch)) {
          this.segment.params.record(sequenceId, path, ch);
          return true;
        }
        return false;
      case SegmentKind.star:
        this.segment.params.record(sequenceId, path, ch);
        return true;
      case undefined:
        // segment separators (slashes) are non-segments. We could say return ch === '/' as well, technically.
        return this.value.includes(ch);
    }
  }

  /**
   * Compares this state to another state to determine the correct sorting order.
   *
   * This algorithm is different from `sortSolutions` in v1's route-recognizer in that it compares
   * the solutions segment-by-segment, rather than merely comparing the cumulative of segment types
   *
   * This resolves v1's ambiguity in situations like `/foo/:id/bar` vs. `/foo/bar/:id`, which had the
   * same sorting value because they both consist of two static segments and one dynamic segment.
   *
   * With this algorithm, `/foo/bar/:id` would always be sorted first because the second segment is different,
   * and static wins over dynamic.
   *
   * ### NOTE
   * This algorithm violates some of the invariants of v1's algorithm,
   * but those invariants were arguably not very sound to begin with. Example:
   *
   * `/foo/*path/bar/baz` vs. `/foo/bar/*path1/*path2`
   * - in v1, the first would win because that match has fewer stars
   * - in v2, the second will win because there is a bigger static match at the start of the pattern
   *
   * The algorithm should be more logical and easier to reason about in v2, but it's important to be aware of
   * subtle difference like this which might surprise some users who happened to rely on this behavior from v1,
   * intentionally or unintentionally.
   *
   * @param b - The state to compare this to.
   * Parameter name is `b` because the method should be used like so: `states.sort((a, b) => a.compareTo(b))`.
   * This will bring the state with the highest score to the first position of the array.
   */
  public compareTo(b: State<T>): -1 | 1 {
    const scoresA = this.scores!;
    const scoresB = b.scores!;

    const scoresALen = scoresA.length;
    const scoresBLen = scoresB.length;
    for (let i = 0, ii = Math.min(scoresALen, scoresBLen); i < ii; ++i) {
      const scoreA = scoresA[i];
      const scoreB = scoresB[i];
      if (scoreA < scoreB) {
        return -1;
      }
      if (scoreA > scoreB) {
        return 1;
      }
    }

    // Everything up to this point is identical in score, so the pattern with more segments wins.
    // This could happen with e.g. `foo/*path` vs. `foo/*path/bar`, where the path `foo/baz/bar` would match both patterns.
    // In this case, `foo/*path/bar` should win because a smaller portion of path is matched by the star segment.
    if (scoresALen < scoresBLen) {
      return -1;
    }
    if (scoresALen > scoresBLen) {
      return 1;
    }

    // Theoretically if the lengths are the same, we are dealing with two ambiguous patterns.
    // In practice, this shouldn't be possible because dynamic and star patterns (even though they are named) are
    // represented in state by hard-coded negative match characters.
    // So, if the code reaches this point, there must be a bug somewhere in `RouteRecognizer.add`.
    throw new Error(`Ambiguous pattern: a=${this.toString()}, b=${b.toString()}. This error indicates a bug in Aurelia; please report it via GitHub.`);
  }

  public toString(): string {
    return this.path.toString();
  }
}

type Segments = readonly string[];
function parsePath(path: string): Segments {
  // Normalize leading, trailing and double slashes by ignoring empty segments
  return path.split('/').filter(x => x.length > 0);
}

class ParsedPath<T> {
  public readonly isDynamic: boolean;

  public constructor(
    public readonly segments: readonly ParsedSegment<T>[],
  ) {
    this.isDynamic = segments.some(x => x.kind !== SegmentKind.static);
  }

  public getParams(path: string): Record<string, string | undefined> {
    const { segments } = this;
    const params: Record<string, string | undefined> = {};
    for (const segment of segments) {
      switch (segment.kind) {
        case SegmentKind.dynamic:
        case SegmentKind.star:
          params[segment.name] = segment.params.get(path);
          break;
      }
    }

    return params;
  }

  public append(segment: ParsedSegment<T>): ParsedPath<T> {
    return new ParsedPath([...this.segments, segment]);
  }

  public toString(): string {
    return this.segments.map(x => `/${x.toString()}`).join('');
  }
}

type ParsedSegment<T> = (
  StaticSegment<T> |
  DynamicSegment<T> |
  StarSegment<T>
);

const enum SegmentKind {
  star    = 1,
  dynamic = 2,
  static  = 3,
}

class StaticSegment<T> {
  public get kind(): SegmentKind.static { return SegmentKind.static; }
  public readonly path: ParsedPath<T>;

  public constructor(
    prev: ParsedSegment<T> | null,
    public readonly value: string,
    public readonly caseSensitive: boolean,
  ) {
    this.path = prev === null ? new ParsedPath([this]) : prev.path.append(this);
  }

  public appendTo(state: State<T>): State<T> {
    const { value, value: { length } } = this;

    if (this.caseSensitive) {
      for (let i = 0; i < length; ++i) {
        state = state.append(
          /* segment */this,
          /* value   */value.charAt(i),
        );
      }
    } else {
      for (let i = 0; i < length; ++i) {
        const ch = value.charAt(i);
        state = state.append(
          /* segment */this,
          /* value   */ch.toUpperCase() + ch.toLowerCase(),
        );
      }
    }

    return state;
  }

  /**
   * Returns a regex-like representation of this segment, mainly for debugging purposes.
   */
  public toString(): string {
    return this.caseSensitive
      ? this.value.split('').map(x => `[${x.toLowerCase()}${x.toUpperCase()}]`).join('')
      : this.value;
  }
}

class NamedParameters {
  private readonly cache: Map<string, string> = new Map();
  private path: string = '';
  private buffer: string = '';
  private sequenceId: number = 0;

  public record(
    sequenceId: number,
    path: string,
    ch: string,
  ): void {
    if (!this.cache.has(path)) {
      if (this.sequenceId === sequenceId) {
        this.buffer += ch;
      } else {
        if (this.path.length > 0) {
          this.cache.set(this.path, this.buffer);
        }
        this.sequenceId = sequenceId;
        this.path = path;
        this.buffer = ch;
      }
    }
  }

  public get(path: string): string {
    if (this.path === path) {
      return this.buffer;
    }

    const value = this.cache.get(path);
    if (value === void 0) {
      throw new Error(`Path ${path} has not been recorded yet. This error indicates a bug in Aurelia; please report it via GitHub.`);
    }

    return value;
  }
}

class DynamicSegment<T> {
  public get kind(): SegmentKind.dynamic { return SegmentKind.dynamic; }
  public readonly path: ParsedPath<T>;

  private _params: NamedParameters | null = null;
  public get params(): NamedParameters {
    return this._params ?? (this._params = new NamedParameters());
  }

  public constructor(
    prev: ParsedSegment<T> | null,
    public readonly name: string,
    public readonly optional: boolean,
  ) {
    this.path = prev === null ? new ParsedPath([this]) : prev.path.append(this);
  }

  public appendTo(state: State<T>): State<T> {
    state = state.append(
      /* segment */this,
      /* value   */'/',
    );

    return state;
  }

  /**
   * Returns a regex-like representation of this segment, mainly for debugging purposes.
   */
  public toString(): string {
    return `(?<${this.name}>[^/]+)${this.optional ? '?' : ''}`;
  }
}

class StarSegment<T> {
  public get kind(): SegmentKind.star { return SegmentKind.star; }
  public readonly path: ParsedPath<T>;

  private _params: NamedParameters | null = null;
  public get params(): NamedParameters {
    return this._params ?? (this._params = new NamedParameters());
  }

  public constructor(
    prev: ParsedSegment<T> | null,
    public readonly name: string,
  ) {
    this.path = prev === null ? new ParsedPath([this]) : prev.path.append(this);
  }

  public appendTo(state: State<T>): State<T> {
    state = state.append(
      /* segment */this,
      /* value   */'',
    );

    return state;
  }

  /**
   * Returns a regex-like representation of this segment, mainly for debugging purposes.
   */
  public toString(): string {
    return `(?<${this.name}>.+)`;
  }
}
