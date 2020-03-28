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

class StateChain<T> {
  public get head(): State<T> {
    return this.states[this.states.length - 1];
  }

  public get isDynamic(): boolean {
    return this.head.path.isDynamic;
  }

  public get endpoint(): Endpoint<T> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return this.head.endpoint!;
  }

  public constructor(
    private readonly chars: string[],
    private readonly states: State<T>[],
    private readonly result: RecognizeResult<T>,
  ) {}

  public advance(ch: string): void {
    const { chars, states, result } = this;
    let stateToAdd: State<T> | null = null;

    let matchCount = 0;
    const state = states[states.length - 1];
    const nextStates = state.nextStates;
    for (const nextState of nextStates) {
      if (nextState.isMatch(ch)) {
        if (++matchCount === 1) {
          stateToAdd = nextState;
        } else {
          result.add(new StateChain([...chars, ch], [...states, nextState], result));
        }
      }
    }

    if (stateToAdd !== null) {
      states.push(stateToAdd);
      chars.push(ch);
    }

    if (matchCount === 0) {
      result.remove(this);
    }
  }

  public compareTo(b: StateChain<T>): -1 | 1 | 0 {
    return this.head.compareTo(b.head);
  }

  public getParams(): Record<string, string | undefined> {
    const params: Record<string, string | undefined> = {};

    const { states, chars } = this;
    for (let i = 0, ii = states.length; i < ii; ++i) {
      const state = states[i];
      if (state.isDynamic) {
        const name = (state.segment as StarSegment<T> | DynamicSegment<T>).name;
        if (params[name] === void 0) {
          params[name] = chars[i];
        } else {
          params[name] += chars[i];
        }
      }
    }

    return params;
  }
}

class RecognizeResult<T> {
  private readonly chains: StateChain<T>[] = [];

  public get isEmpty(): boolean {
    return this.chains.length === 0;
  }

  public constructor(
    rootState: State<T>,
  ) {
    this.chains = [new StateChain([''], [rootState], this)];
  }

  public getSolution(): StateChain<T> | null {
    const solutions = this.chains.filter(x => x.head.hasEndpoint);
    if (solutions.length === 0) {
      return null;
    }

    solutions.sort((a, b) => a.compareTo(b));

    return solutions[0];
  }

  public add(chain: StateChain<T>): void {
    this.chains.push(chain);
  }

  public remove(chain: StateChain<T>): void {
    this.chains.splice(this.chains.indexOf(chain), 1);
  }

  public advance(ch: string): void {
    const chains = this.chains.slice();

    for (const chain of chains) {
      chain.advance(ch);
    }
  }
}

export class RouteRecognizer<T> {
  public readonly rootState: State<T> = new State(null, null, '');

  public add(
    routeOrRoutes: IConfigurableRoute<T> | readonly IConfigurableRoute<T>[],
  ): void {
    if (routeOrRoutes instanceof Array) {
      for (const route of routeOrRoutes) {
        this.add(route);
      }
    }
    const route = routeOrRoutes as IConfigurableRoute<T>;
    const $route = new ConfigurableRoute(route.path, route.caseSensitive === true, route.handler);
    const parts = parsePath($route.path);
    const optionalStates: State<T>[] = [];
    const paramNames: string[] = [];

    let isEmpty = true;
    let state = this.rootState;

    let prevSegment: ParsedSegment<T> | null = null;

    for (const part of parts) {
      // Each segment always begins with a slash, so we represent this with a non-segment state
      state = state.append(null, '/');

      // Add the first part of this segment to the end of any existing optional states
      for (const optionalState of optionalStates) {
        optionalState.nextStates.push(state);
      }

      let isOptional = false;
      switch (part.charAt(0)) {
        case ':': { // route parameter
          let name: string;
          if (part.endsWith('?')) { // optional
            isOptional = true;
            name = part.slice(1, -1);
            prevSegment = new DynamicSegment(prevSegment, name, true);
            const nextState = prevSegment.appendTo(state);
            optionalStates.push(nextState);
          } else {
            name = part.slice(1);
            prevSegment = new DynamicSegment(prevSegment, name, false);
            state = prevSegment.appendTo(state);
          }
          paramNames.push(name);
          break;
        }
        case '*': { // dynamic route
          const name = part.slice(1);
          paramNames.push(name);
          prevSegment = new StarSegment(prevSegment, name);
          state = prevSegment.appendTo(state);
          break;
        }
        default: { // standard path route
          prevSegment = new StaticSegment(prevSegment, part, $route.caseSensitive);
          state = prevSegment.appendTo(state);
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
    for (const optionalState of optionalStates) {
      optionalState.setEndpoint(endpoint);
    }
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

    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    const result = new RecognizeResult(this.rootState);
    for (let i = 0, ii = path.length; i < ii; ++i) {
      const ch = path.charAt(i);
      result.advance(ch);

      if (result.isEmpty) {
        return null;
      }
    }

    const solution = result.getSolution();
    if (solution === null) {
      return null;
    }

    const params = solution.getParams();
    const isDynamic = solution.isDynamic;

    return new RecognizedRoute<T>(
      solution.endpoint,
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
  public readonly isDynamic: boolean;

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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return this.segment!.path;
  }

  public constructor(
    public readonly prevState: State<T> | null,
    public readonly segment: ParsedSegment<T> | null,
    public readonly value: string,
  ) {
    switch (segment?.kind) {
      case SegmentKind.dynamic:
      case SegmentKind.star:
        this.isSeparator = false;
        this.isDynamic = true;
        break;
      case SegmentKind.static:
        this.isSeparator = false;
        this.isDynamic = false;
        break;
      case undefined:
        this.isSeparator = true;
        this.isDynamic = false;
        break;
    }
  }

  public append(
    segment: ParsedSegment<T> | null,
    value: string,
  ): State<T> {
    const { nextStates } = this;
    let state = nextStates.find(s => s.value === value && s.segment?.kind === segment?.kind);

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
    ch: string,
  ): boolean {
    const segment = this.segment;
    switch (segment?.kind) {
      case SegmentKind.dynamic:
        return !this.value.includes(ch);
      case SegmentKind.star:
        return true;
      case SegmentKind.static:
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
  public compareTo(b: State<T>): -1 | 1 | 0 {
    const scoresA = this.scores;
    const scoresB = b.scores;

    const scoresALen = scoresA.length;
    const scoresBLen = scoresB.length;
    for (let i = 0, ii = Math.min(scoresALen, scoresBLen); i < ii; ++i) {
      const scoreA = scoresA[i];
      const scoreB = scoresB[i];
      if (scoreA < scoreB) {
        return 1;
      }
      if (scoreA > scoreB) {
        return -1;
      }
    }

    // Everything up to this point is identical in score, so the pattern with more segments wins.
    // This could happen with e.g. `foo/*path` vs. `foo/*path/bar`, where the path `foo/baz/bar` would match both patterns.
    // In this case, `foo/*path/bar` should win because a smaller portion of path is matched by the star segment.
    if (scoresALen < scoresBLen) {
      return 1;
    }
    if (scoresALen > scoresBLen) {
      return -1;
    }

    // This should only be possible with a single pattern with multiple consecutive star segments.
    // TODO: probably want to warn or even throw here, but leave it be for now.
    return 0;
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

  public append(segment: ParsedSegment<T>): ParsedPath<T> {
    return new ParsedPath([...this.segments, segment]);
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
}

class DynamicSegment<T> {
  public get kind(): SegmentKind.dynamic { return SegmentKind.dynamic; }
  public readonly path: ParsedPath<T>;

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
}

class StarSegment<T> {
  public get kind(): SegmentKind.star { return SegmentKind.star; }
  public readonly path: ParsedPath<T>;

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
}
