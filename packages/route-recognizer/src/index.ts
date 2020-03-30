import { IQueryParams, parseQueryString } from './parse-querystring';

/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

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
  public head: AnyState<T>;
  public endpoint: Endpoint<T>;

  public constructor(
    private readonly chars: string[],
    private readonly states: AnyState<T>[],
    private readonly result: RecognizeResult<T>,
  ) {
    this.head = states[states.length - 1];
    this.endpoint = this.head?.endpoint!;
  }

  public advance(ch: string): void {
    const { chars, states, result } = this;
    let stateToAdd: AnyState<T> | null = null;

    let matchCount = 0;
    const state = states[states.length - 1];

    function $process(nextState: AnyState<T>): void {
      if (nextState.isMatch(ch)) {
        if (++matchCount === 1) {
          stateToAdd = nextState;
        } else {
          result.add(new StateChain(chars.concat(ch), states.concat(nextState), result));
        }
      }

      if (nextState.isOptional && nextState.nextStates !== null) {
        const separator = nextState.nextStates[0];
        if (separator.nextStates !== null) {
          for (const $nextState of separator.nextStates) {
            $process($nextState);
          }
        }
      }
    }

    if (state.isDynamic) {
      $process(state);
    }
    if (state.nextStates !== null) {
      for (const nextState of state.nextStates) {
        $process(nextState);
      }
    }

    if (stateToAdd !== null) {
      states.push(this.head = stateToAdd);
      chars.push(ch);
      if ((stateToAdd as AnyState<T>).endpoint !== null) {
        this.endpoint = (stateToAdd as AnyState<T>).endpoint!;
      }
    }

    if (matchCount === 0) {
      result.remove(this);
    }
  }

  public getParams(): Record<string, string | undefined> {
    const { states, chars, endpoint } = this;

    const params: Record<string, string | undefined> = {};
    // First initialize all properties with undefined so they all exist (even if they're not filled, e.g. non-matched optional params)
    for (const name of endpoint.paramNames) {
      params[name] = void 0;
    }

    for (let i = 0, ii = states.length; i < ii; ++i) {
      const state = states[i];
      if (state.isDynamic) {
        const name = state.segment.name;
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

function hasEndpoint<T>(chain: StateChain<T>): boolean {
  return chain.head.endpoint !== null;
}

function compareChains<T>(a: StateChain<T>, b: StateChain<T>): -1 | 1 | 0 {
  return a.head.compareTo(b.head);
}

class RecognizeResult<T> {
  private readonly chains: StateChain<T>[] = [];

  public get isEmpty(): boolean {
    return this.chains.length === 0;
  }

  public constructor(
    rootState: SeparatorState<T>,
  ) {
    this.chains = [new StateChain([''], [rootState], this)];
  }

  public getSolution(): StateChain<T> | null {
    const solutions = this.chains.filter(hasEndpoint);
    if (solutions.length === 0) {
      return null;
    }

    solutions.sort(compareChains);

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
  public readonly rootState: SeparatorState<T> = new State(null, null, '') as SeparatorState<T>;

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
    const paramNames: string[] = [];

    let state = this.rootState as AnyState<T>;

    for (const part of parts) {
      // Each segment always begins with a slash, so we represent this with a non-segment state
      state = state.append(null, '/');

      switch (part.charAt(0)) {
        case ':': { // route parameter
          const isOptional = part.endsWith('?');
          const name = isOptional ? part.slice(1, -1) : part.slice(1);
          paramNames.push(name);
          state = new DynamicSegment<T>(name, isOptional).appendTo(state);
          break;
        }
        case '*': { // dynamic route
          const name = part.slice(1);
          paramNames.push(name);
          state = new StarSegment<T>(name).appendTo(state);
          break;
        }
        default: { // standard path route
          state = new StaticSegment<T>(part, $route.caseSensitive).appendTo(state);
          break;
        }
      }
    }

    const endpoint = new Endpoint<T>($route, paramNames);

    state.setEndpoint(endpoint);
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

    const { endpoint } = solution;
    const params = solution.getParams();
    const isDynamic = solution.endpoint.paramNames.length > 0;

    return new RecognizedRoute<T>(
      endpoint,
      params,
      queryParams,
      isDynamic,
      '',
    );
  }
}

type StaticSegmentState<T> = State<T> & {
  readonly isSeparator: false;
  readonly isDynamic: false;
  readonly isOptional: false;

  readonly prevState: StaticSegmentState<T> | SeparatorState<T>;
  readonly segment: StaticSegment<T>;
};

type DynamicSegmentState<T> = State<T> & {
  readonly isSeparator: false;
  readonly isDynamic: true;
  readonly isOptional: true | false;

  readonly prevState: SeparatorState<T>;
  readonly segment: DynamicSegment<T>;
};

type StarSegmentState<T> = State<T> & {
  readonly isSeparator: false;
  readonly isDynamic: true;
  readonly isOptional: false;

  readonly prevState: SeparatorState<T>;
  readonly segment: StarSegment<T>;
};

type SeparatorState<T> = State<T> & {
  readonly isSeparator: true;
  readonly isDynamic: false;
  readonly isOptional: false;

  readonly path: null;
  readonly segment: null;
};

type AnyState<T> = (
  StaticSegmentState<T> |
  DynamicSegmentState<T> |
  StarSegmentState<T> |
  SeparatorState<T>
);

type SegmentToState<S, T> = (
  S extends StaticSegment<T> ? StaticSegmentState<T> :
  S extends DynamicSegment<T> ? DynamicSegmentState<T> :
  S extends StarSegment<T> ? StarSegmentState<T> :
  S extends null ? SeparatorState<T> :
  never
);

class State<T> {
  public nextStates: AnyState<T>[] | null = null;
  public readonly isSeparator: boolean;
  public readonly isDynamic: boolean;
  public readonly isOptional: boolean;

  private _scores: readonly number[] | undefined = void 0;
  public get scores(): readonly number[] {
    let scores = this._scores as number[];
    if (scores === void 0) {
      scores = this._scores = [];
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let state: State<T> | null = this;
      while (state !== null) {
        if (state.segment !== null) {
          scores.unshift(state.segment.kind);
        }
        state = state.prevState;
      }
    }
    return scores;
  }

  public endpoint: Endpoint<T> | null = null;
  public readonly length: number;

  public constructor(
    public readonly prevState: AnyState<T> | null,
    public readonly segment: AnySegment<T> | null,
    public readonly value: string,
  ) {
    switch (segment?.kind) {
      case SegmentKind.dynamic:
        this.length = prevState!.length + 1;
        this.isSeparator = false;
        this.isDynamic = true;
        this.isOptional = segment.optional;
        break;
      case SegmentKind.star:
        this.length = prevState!.length + 1;
        this.isSeparator = false;
        this.isDynamic = true;
        this.isOptional = false;
        break;
      case SegmentKind.static:
        this.length = prevState!.length + 1;
        this.isSeparator = false;
        this.isDynamic = false;
        this.isOptional = false;
        break;
      case undefined:
        this.length = prevState === null ? 0 : prevState.length;
        this.isSeparator = true;
        this.isDynamic = false;
        this.isOptional = false;
        break;
    }
  }

  public append<S extends AnySegment<T> | null>(
    segment: S,
    value: string,
  ): SegmentToState<S, T> {
    let state: AnyState<T> | undefined;
    let nextStates = this.nextStates;
    if (nextStates === null) {
      state = void 0;
      nextStates = this.nextStates = [];
    } else if (segment === null) {
      state = nextStates.find(s => s.value === value);
    } else {
      state = nextStates.find(s => s.segment?.equals(segment!));
    }

    if (state === void 0) {
      nextStates.push(state = new State(this as AnyState<T>, segment, value) as AnyState<T>);
    }

    return state as SegmentToState<S, T>;
  }

  public setEndpoint(
    this: AnyState<T>,
    endpoint: Endpoint<T>,
  ): void {
    this.endpoint = endpoint;
    if (this.isOptional) {
      this.prevState.setEndpoint(endpoint);
      if (this.prevState.isSeparator && this.prevState.prevState !== null) {
        this.prevState.prevState.setEndpoint(endpoint);
      }
    }
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
  public compareTo(b: AnyState<T>): -1 | 1 | 0 {
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

function isNotEmpty(segment: string): boolean {
  return segment.length > 0;
}

type Segments = readonly string[];
function parsePath(path: string): Segments {
  // Normalize leading, trailing and double slashes by ignoring empty segments
  return path.split('/').filter(isNotEmpty);
}

type AnySegment<T> = (
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

  public constructor(
    public readonly value: string,
    public readonly caseSensitive: boolean,
  ) {}

  public appendTo(state: AnyState<T>): StaticSegmentState<T> {
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

    return state as StaticSegmentState<T>;
  }

  public equals(b: AnySegment<T>): boolean {
    return (
      b.kind === SegmentKind.static &&
      b.caseSensitive === this.caseSensitive &&
      b.value === this.value
    );
  }
}

class DynamicSegment<T> {
  public get kind(): SegmentKind.dynamic { return SegmentKind.dynamic; }

  public constructor(
    public readonly name: string,
    public readonly optional: boolean,
  ) {}

  public appendTo(state: AnyState<T>): DynamicSegmentState<T> {
    state = state.append(
      /* segment */this,
      /* value   */'/',
    );

    return state;
  }

  public equals(b: AnySegment<T>): boolean {
    return (
      b.kind === SegmentKind.dynamic &&
      b.optional === this.optional &&
      b.name === this.name
    );
  }
}

class StarSegment<T> {
  public get kind(): SegmentKind.star { return SegmentKind.star; }

  public constructor(
    public readonly name: string,
  ) {}

  public appendTo(state: AnyState<T>): StarSegmentState<T> {
    state = state.append(
      /* segment */this,
      /* value   */'',
    );

    return state;
  }

  public equals(b: AnySegment<T>): boolean {
    return (
      b.kind === SegmentKind.star &&
      b.name === this.name
    );
  }
}
