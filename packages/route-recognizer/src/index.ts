export interface IConfigurableRoute<T> {
  readonly path: string;
  readonly caseSensitive?: boolean;
  readonly handler: T;
}

export class Parameter {
  public constructor(
    public readonly name: string,
    public readonly isOptional: boolean,
    public readonly isStar: boolean,
    public readonly pattern: RegExp | null,
  ) { }

  public satisfiesPattern(value: string): boolean {
    if (this.pattern === null) return true;
    this.pattern.lastIndex = 0;
    return this.pattern.test(value);
  }
}

export class ConfigurableRoute<T> implements IConfigurableRoute<T> {
  public constructor(
    public readonly path: string,
    public readonly caseSensitive: boolean,
    public handler: T,
  ) { }
}

export class Endpoint<T> {
  private _residualEndpoint: Endpoint<T> | null = null;
  public get residualEndpoint(): Endpoint<T> | null { return this._residualEndpoint; }
  /** @internal */
  public set residualEndpoint(endpoint: Endpoint<T> | null) {
    if (this._residualEndpoint !== null) throw new Error('Residual endpoint is already set');
    this._residualEndpoint = endpoint;
  }

  public constructor(
    public readonly route: ConfigurableRoute<T>,
    public readonly params: readonly Parameter[],
  ) { }

  public equalsOrResidual(other: Endpoint<T> | null | undefined): boolean {
    return other != null && this === other || this._residualEndpoint === other;
  }
}

export class RecognizedRoute<T> {
  public readonly params: Readonly<Record<string, string | undefined>>;
  public readonly path: string;
  public constructor(
    public readonly endpoint: Endpoint<T>,
    path: string,
    params: Readonly<Record<string, string | undefined>>,
  ) {
    const $params: Record<string, string | undefined> = Object.create(null);
    for (const key in params) {
      const value = params[key];
      $params[key] = value != null ? decodeURIComponent(value) : value;
    }
    this.params = Object.freeze($params);

    path = path.startsWith('/') ? path.slice(1) : path;
    path = path.endsWith('/') ? path.slice(0, -1) : path;
    this.path = path;
  }
}

class Candidate<T> {
  public childRoutes: RecognizedRoute<T>[] = [];
  public head: AnyState<T>;
  public endpoint: Endpoint<T>;
  private params: Record<string, string | undefined> | null = null;
  private isConstrained: boolean = false;
  private satisfiesConstraints: boolean | null = null;
  private fullyMatches: boolean = false;

  public constructor(
    /** @internal */ public readonly chars: string[],
    private readonly states: AnyState<T>[],
    private readonly skippedStates: DynamicState<T>[],
    private readonly result: RecognizeResult<T>,
    private readonly routeRecognizer: RouteRecognizer<T>,
  ) {
    this.head = states[states.length - 1];
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    this.endpoint = this.head?.endpoint!;
  }

  public advance(ch: string, rest: string): void | true {
    const { chars, states, skippedStates, result, routeRecognizer } = this;
    let stateToAdd: AnyState<T> | null = null;

    let matched = false;
    const state = states[states.length - 1];

    const childrenRecognizers = routeRecognizer.children;
    const numChildrenRecognizers = childrenRecognizers.length;
    if (state.isDynamic && $process(state, null) === true) return true;

    if (state.nextStates !== null) {
      for (const nextState of state.nextStates) {
        if ($process(nextState, null) === true) return true;
      }
    }

    if (stateToAdd !== null) {
      states.push(this.head = stateToAdd);
      chars.push(ch);
      this.isConstrained = this.isConstrained
        || (stateToAdd as AnyState<T>).isDynamic
        && ((stateToAdd as AnyState<T>).segment as DynamicSegment<T>)!.isConstrained;
      if ((stateToAdd as AnyState<T>).endpoint !== null) {
        this.endpoint = (stateToAdd as AnyState<T>).endpoint!;
      }
    }

    if (!matched) {
      result.remove(this);
    }

    function $process(
      nextState: AnyState<T>,
      skippedState: DynamicState<T> | null,
    ): void | true {
      if (nextState.isMatch(ch)) {
        let childRoutes: RecognizedRoute<T>[] = [];
        let fullyMatched = false;

        if (nextState.segment?.kind === SegmentKind.residue
          && nextState.prevState?.isSeparator
          && nextState.prevState?.endpoint !== null
          && nextState.prevState.endpoint.route.path !== '' // do we need to handle this in some other way?
        ) {
          // we hit the residue segment after a definitive endpoint
          // this is a good opportunity to traverse into child recognizers
          ({ childRoutes, fullyMatched } = matchChildRoutes(rest));
        }

        if (fullyMatched) {
          matched = true;
          const candidate = new Candidate(
            chars.slice(),
            states.concat(nextState),
            skippedState === null ? skippedStates : skippedStates.concat(skippedState),
            result,
            routeRecognizer,
          );
          candidate.childRoutes = childRoutes;
          candidate.fullyMatches = fullyMatched;
          result.add(candidate);
          return true;
        }

        if (!matched) {
          matched = true;
          stateToAdd = nextState;
        } else {
          result.add(
            new Candidate(
              chars.concat(ch),
              states.concat(nextState),
              skippedState === null ? skippedStates : skippedStates.concat(skippedState),
              result,
              routeRecognizer,
            )
          );
        }
      }

      if (state.segment === null && nextState.isOptional) {
        if (nextState.nextStates !== null) {
          if (nextState.nextStates.length > 1) {
            throw createError(`${nextState.nextStates.length} nextStates`);
          }
          const separator = nextState.nextStates[0];
          if (!separator.isSeparator) {
            throw createError(`Not a separator`);
          }
          if (separator.nextStates !== null) {
            for (const $nextState of separator.nextStates) {
              if ($process($nextState, nextState) === true) return true;
            }
          }
        } else if (numChildrenRecognizers > 0 && nextState.segment?.kind === SegmentKind.dynamic) {
          if (rest.startsWith('/')) {
            const remainder = rest.slice(1);
            if (remainder.length > 0) {
              const childMatch = matchChildRoutes(remainder);
              if (childMatch.childRoutes.length > 0) {
                matched = true;
                const candidate = new Candidate(
                  chars.slice(),
                  states.concat(nextState),
                  skippedStates.concat(nextState),
                  result,
                  routeRecognizer,
                );
                candidate.childRoutes = childMatch.childRoutes;
                candidate.fullyMatches = childMatch.fullyMatched;
                result.add(candidate);
                return true;
              }
            }
          }
        }
      }

      /**
       * Attempts to match child route recognizers against the remaining path.
       * Returns the best matching child routes and whether they fully matched.
       * Also stores matched routes for later use in _getRoutes to avoid re-matching.
       * @internal
       */
      function matchChildRoutes(remainder: string): { childRoutes: RecognizedRoute<T>[]; fullyMatched: boolean } {
        if (numChildrenRecognizers === 0) return { childRoutes: [], fullyMatched: false };

        let childRoutes: RecognizedRoute<T>[] = [];
        let fullyMatched = false;
        let highestDegree = 0;
        for (const childRecognizer of childrenRecognizers) {
          const $childRoutes = childRecognizer.recognize(remainder);
          const currentDegree = $childRoutes?.length ?? 0;

          // eliminate some obvious non-matches
          if (currentDegree === 0) continue;

          const residue = $childRoutes![currentDegree - 1].params[RESIDUE];

          // Skip if the child didn't consume any of the remainder
          if (residue === remainder.replaceAll(/^\/|\/$/g, '')) continue;

          const noResidue = residue == null;
          if (currentDegree > highestDegree || noResidue) {
            highestDegree = currentDegree;
            childRoutes = $childRoutes!;

            // look at the last route from the array; if there is no residue, stop.
            // we stop at the first fully matched route(s).
            if (noResidue) {
              fullyMatched = true;
              break;
            }
          }
        }

        return { childRoutes, fullyMatched };
      }
    }
  }

  /** @internal */
  public _finalize(): boolean {
    function collectSkippedStates(
      skippedStates: DynamicState<T>[],
      state: AnyState<T>,
    ): void {
      const nextStates = state.nextStates;
      if (nextStates !== null) {
        if (nextStates.length === 1 && nextStates[0].segment === null) {
          collectSkippedStates(skippedStates, nextStates[0]);
        } else {
          for (const nextState of nextStates) {
            if (nextState.isOptional && nextState.endpoint !== null) {
              skippedStates.push(nextState);
              if (nextState.nextStates !== null) {
                for (const $nextState of nextState.nextStates) {
                  collectSkippedStates(skippedStates, $nextState);
                }
              }
              break;
            }
          }
        }
      }
    }
    collectSkippedStates(this.skippedStates, this.head);
    if (!this.isConstrained) return true;
    this._getParams();
    return this.satisfiesConstraints!;
  }

  /** @internal */
  public _getParams(): Record<string, string | undefined> {
    let params = this.params;
    if (params != null) return params;
    const { states, chars, endpoint } = this;

    params = {};
    this.satisfiesConstraints = true;
    // First initialize all properties with undefined so they all exist (even if they're not filled, e.g. non-matched optional params)
    for (const param of endpoint.params) {
      params[param.name] = void 0;
    }

    for (let i = 0, ii = states.length; i < ii; ++i) {
      const state = states[i];
      if (state.isDynamic) {
        const segment = state.segment;
        const name = segment.name;
        if (params[name] === void 0) {
          params[name] = chars[i];
        } else {
          params[name] += chars[i];
        }

        // check for constraint if this state's segment is constrained
        // and the state is the last dynamic state in a series of dynamic states.
        // null fallback is used, as a star segment can also be a dynamic segment, but without a pattern.
        const checkConstraint = state.isConstrained
          && !Object.is(states[i + 1]?.segment, segment);

        if (!checkConstraint) continue;

        this.satisfiesConstraints = this.satisfiesConstraints && state.satisfiesConstraint(params[name]!);
      }
    }

    if (this.satisfiesConstraints) {
      this.params = params;
    }
    return params;
  }

  /** @internal */
  public _getRoutes(trimPrecedingSlash: boolean): RecognizedRoute<T>[] {
    let path = this.chars.join('');
    const params = this._getParams();

    const { childRoutes, endpoint } = this;

    // Remove child route paths from the consumed path
    if (childRoutes.length > 0) {
      const childPath = childRoutes.reduce((acc, route) => `${acc}/${route.path}`, '');
      path = path.slice(0, -childPath.length);
    }

    // Handle edge case: dynamic parameter that should be treated as residue
    // Example: /parent/:id/*$$residue where :id="child1" but should be residue="child1/..."
    _adjustParamToResidue(params, this.routeRecognizer);

    // Remove residue from path
    const residue = params[RESIDUE];
    if (residue != null) {
      path = path.slice(0, -residue.length);
    }

    // Normalize path slashes
    if (trimPrecedingSlash && path.startsWith('/')) {
      path = path.slice(1);
    }
    if (path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    return [new RecognizedRoute<T>(endpoint, path, params), ...childRoutes];

    /**
     * Checks if a dynamic parameter should be reinterpreted as residue for child routes.
     * This handles the edge case where a route like /:id/*$$residue has :id matching a child route.
     * @internal
     */
    function _adjustParamToResidue(params: Record<string, string | undefined>, routeRecognizer: RouteRecognizer<T>): void {
      // Only check if we haven't matched child routes yet
      if (childRoutes.length > 0) return;

      const endpointParams = endpoint.params;
      if (endpointParams.length < 2) return;

      // Check if last param is residue
      const lastParam = endpointParams[endpointParams.length - 1];
      if (lastParam.name !== RESIDUE) return;

      // Check if preceding param is a regular dynamic param
      const precedingParam = endpointParams[endpointParams.length - 2];
      if (precedingParam.isStar || precedingParam.name === RESIDUE) return;

      const paramValue = params[precedingParam.name];
      if (typeof paramValue !== 'string' || paramValue.length === 0) return;

      // Try matching child recognizers with the parameter value
      const childRecognizers = routeRecognizer.children;
      if (childRecognizers.length === 0) return;

      const existingResidue = params[RESIDUE];
      const hasExistingResidue = existingResidue != null && existingResidue.length > 0;
      const combined = hasExistingResidue ? `${paramValue}/${existingResidue}` : paramValue;

      for (const childRecognizer of childRecognizers) {
        const childRoutes = childRecognizer.recognize(combined);
        const numChildren = childRoutes?.length ?? 0;
        if (numChildren === 0) continue;

        const childResidue = childRoutes![numChildren - 1].params[RESIDUE];

        // If child consumed at least part of the combined value, adjust parameters
        if (childResidue !== combined) {
          params[RESIDUE] = combined;
          if (precedingParam.isOptional || hasExistingResidue) {
            params[precedingParam.name] = void 0;
          }
          break;
        }
      }
    }
  }

  /**
   * Compares this candidate to another candidate to determine the correct sorting order.
   *
   * This algorithm is different from `sortSolutions` in v1's route-recognizer in that it compares
   * the candidates segment-by-segment, rather than merely comparing the cumulative of segment types
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
   * @param b - The candidate to compare this to.
   * Parameter name is `b` because the method should be used like so: `states.sort((a, b) => a.compareTo(b))`.
   * This will bring the candidate with the highest score to the first position of the array.
   */
  public compareTo(b: Candidate<T>): -1 | 1 | 0 {
    const statesA = this.states;
    const statesB = b.states;

    for (let iA = 0, iB = 0, ii = Math.max(statesA.length, statesB.length); iA < ii; ++iA) {
      let stateA = statesA[iA];
      if (stateA === void 0) {
        return 1;
      }

      let stateB = statesB[iB];
      if (stateB === void 0) {
        return -1;
      }

      let segmentA = stateA.segment;
      let segmentB = stateB.segment;
      if (segmentA === null) {
        if (segmentB === null) {
          ++iB;
          continue;
        }

        if ((stateA = statesA[++iA]) === void 0) {
          return 1;
        }

        segmentA = stateA.segment!;
      } else if (segmentB === null) {
        if ((stateB = statesB[++iB]) === void 0) {
          return -1;
        }

        segmentB = stateB.segment!;
      }

      if (segmentA!.kind < segmentB!.kind) {
        return 1;
      }

      if (segmentA!.kind > segmentB!.kind) {
        return -1;
      }

      ++iB;
    }

    const skippedStatesA = this.skippedStates;
    const skippedStatesB = b.skippedStates;

    const skippedStatesALen = skippedStatesA.length;
    const skippedStatesBLen = skippedStatesB.length;

    if (skippedStatesALen < skippedStatesBLen) {
      return 1;
    }

    if (skippedStatesALen > skippedStatesBLen) {
      return -1;
    }

    for (let i = 0; i < skippedStatesALen; ++i) {
      const skippedStateA = skippedStatesA[i];
      const skippedStateB = skippedStatesB[i];

      if (skippedStateA.length < skippedStateB.length) {
        return 1;
      }

      if (skippedStateA.length > skippedStateB.length) {
        return -1;
      }
    }

    // This should only be possible with a single pattern with multiple consecutive star segments.
    // TODO: probably want to warn or even throw here, but leave it be for now.
    return 0;
  }
}

function hasEndpoint<T>(candidate: Candidate<T>): boolean {
  return candidate.head.endpoint !== null;
}

function compareChains<T>(a: Candidate<T>, b: Candidate<T>): -1 | 1 | 0 {
  return a.compareTo(b);
}

class RecognizeResult<T> {
  private readonly candidates: Candidate<T>[] = [];

  public get isEmpty(): boolean {
    return this.candidates.length === 0;
  }

  public constructor(
    rootState: SeparatorState<T>,
    routeRecognizer: RouteRecognizer<T>,
  ) {
    this.candidates = [new Candidate([''], [rootState], [], this, routeRecognizer)];
  }

  public getSolution(): Candidate<T> | null {
    const candidates = this.candidates.filter(x => hasEndpoint(x) && x._finalize());
    if (candidates.length === 0) {
      return null;
    }

    candidates.sort(compareChains);

    return candidates[0];
  }

  public add(candidate: Candidate<T>): void {
    this.candidates.push(candidate);
  }

  public remove(candidate: Candidate<T>): void {
    this.candidates.splice(this.candidates.indexOf(candidate), 1);
  }

  public advance(ch: string, rest: string): void | true {
    const candidates = this.candidates.slice();

    for (const candidate of candidates) {
      const fullyProcessed = candidate.advance(ch, rest);
      if (fullyProcessed === true) return fullyProcessed;
    }
  }
}

/**
 * Reserved parameter name that's used when registering a route with residual star segment (catch-all).
 */
export const RESIDUE = '$$residue' as const;

const routeParameterPattern = /^:(?<name>[^?\s{}]+)(?:\{\{(?<constraint>.+)\}\})?(?<optional>\?)?$/g;

export class RouteRecognizer<T> {
  private readonly rootState: SeparatorState<T> = new State(null, null, '') as SeparatorState<T>;
  private readonly cache: Map<string, RecognizedRoute<T>[] | null> = new Map<string, RecognizedRoute<T>[] | null>();
  private readonly endpointLookup: Map<string, Endpoint<T>> = new Map<string, Endpoint<T>>();
  /** @internal */ public readonly children: RouteRecognizer<T>[] = [];

  public add(routeOrRoutes: IConfigurableRoute<T> | readonly IConfigurableRoute<T>[], addResidue: boolean = false): void {
    let params: readonly Parameter[];
    let endpoint: Endpoint<T>;
    if (routeOrRoutes instanceof Array) {
      for (const route of routeOrRoutes) {
        endpoint = this.$add(route, false);
        params = endpoint.params;
        // add residue iff the last parameter is not a star segment.
        if (!addResidue || (params[params.length - 1]?.isStar ?? false)) continue;
        endpoint.residualEndpoint = this.$add({ ...route, path: `${route.path}/*${RESIDUE}` }, true);
      }
    } else {
      endpoint = this.$add(routeOrRoutes, false);
      params = endpoint.params;
      // add residue iff the last parameter is not a star segment.
      if (addResidue && !(params[params.length - 1]?.isStar ?? false)) {
        endpoint.residualEndpoint = this.$add({ ...routeOrRoutes, path: `${routeOrRoutes.path}/*${RESIDUE}` }, true);
      }
    }

    // Clear the cache whenever there are state changes, because the recognizeResults could be arbitrarily different as a result
    this.cache.clear();
  }

  private $add(route: IConfigurableRoute<T>, addResidue: boolean): Endpoint<T> {
    const path = route.path;
    const lookup = this.endpointLookup;
    if (lookup.has(path)) throw createError(`Cannot add duplicate path '${path}'.`);
    const $route = new ConfigurableRoute(path, route.caseSensitive === true, route.handler);

    // Normalize leading, trailing and double slashes by ignoring empty segments
    const parts = path === '' ? [''] : path.split('/').filter(isNotEmpty);
    const params: Parameter[] = [];

    let state = this.rootState as AnyState<T>;

    for (const part of parts) {
      // Each segment always begins with a slash, so we represent this with a non-segment state
      state = state.append(null, '/');

      switch (part.charAt(0)) {
        case ':': { // route parameter
          routeParameterPattern.lastIndex = 0;
          const match = routeParameterPattern.exec(part);
          const { name, optional } = match?.groups ?? {};
          const isOptional = optional === '?';
          if (name === RESIDUE) throw new Error(`Invalid parameter name; usage of the reserved parameter name '${RESIDUE}' is used.`);
          const constraint = match?.groups?.constraint;
          const pattern: RegExp | null = constraint != null ? new RegExp(constraint) : null;
          params.push(new Parameter(name, isOptional, false, pattern));
          state = new DynamicSegment<T>(name, isOptional, pattern).appendTo(state);
          break;
        }
        case '*': { // dynamic route
          const name = part.slice(1);
          let kind: SegmentKind.residue | SegmentKind.star;
          if (name === RESIDUE) {
            if (!addResidue) throw new Error(`Invalid parameter name; usage of the reserved parameter name '${RESIDUE}' is used.`);
            kind = SegmentKind.residue;
          } else {
            kind = SegmentKind.star;
          }
          params.push(new Parameter(name, true, true, null));
          state = new StarSegment<T>(name, kind).appendTo(state);
          break;
        }
        default: { // standard path route
          state = new StaticSegment<T>(part, $route.caseSensitive).appendTo(state);
          break;
        }
      }
    }

    const endpoint = new Endpoint<T>($route, params);

    state.setEndpoint(endpoint);
    lookup.set(path, endpoint);
    return endpoint;
  }

  public recognize(path: string): RecognizedRoute<T>[] | null {
    let result = this.cache.get(path);
    if (result === void 0) {
      this.cache.set(path, result = this.$recognize(path));
    }
    return result;
  }

  private $recognize(path: string): RecognizedRoute<T>[] | null {
    const originalPathIsWithoutPreceedingSlash = !path.startsWith('/');
    if (originalPathIsWithoutPreceedingSlash) {
      path = `/${path}`;
    }

    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    const result = new RecognizeResult(this.rootState, this);
    for (let i = 0, ii = path.length; i < ii; ++i) {
      const ch = path.charAt(i);
      const rest = path.slice(i);
      if (result.advance(ch, rest) === true) break;

      if (result.isEmpty) {
        return null;
      }
    }

    const candidate = result.getSolution();
    if (candidate === null) {
      return null;
    }

    return candidate._getRoutes(originalPathIsWithoutPreceedingSlash);
  }

  public getEndpoint(path: string): Endpoint<T> | null {
    return this.endpointLookup.get(path) ?? null;
  }

  public append(child: RouteRecognizer<T>): void {
    this.children.push(child);
    this.cache.clear();
  }
}

type StaticState<T> = State<T> & {
  readonly isSeparator: false;
  readonly isDynamic: false;
  readonly isOptional: false;

  readonly prevState: StaticState<T> | SeparatorState<T>;
  readonly segment: StaticSegment<T>;
};

type DynamicState<T> = State<T> & {
  readonly isSeparator: false;
  readonly isDynamic: true;
  readonly isOptional: true | false;

  readonly prevState: SeparatorState<T>;
  readonly segment: DynamicSegment<T>;
};

type StarState<T> = State<T> & {
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
  StaticState<T> |
  DynamicState<T> |
  StarState<T> |
  SeparatorState<T>
);

type SegmentToState<S, T> = (
  S extends StaticSegment<T> ? StaticState<T> :
  S extends DynamicSegment<T> ? DynamicState<T> :
  S extends StarSegment<T> ? StarState<T> :
  S extends null ? SeparatorState<T> :
  never
);

class State<T> {
  public nextStates: AnyState<T>[] | null = null;
  public readonly isSeparator: boolean;
  public readonly isDynamic: boolean;
  public readonly isOptional: boolean;

  public endpoint: Endpoint<T> | null = null;
  public readonly length: number;
  public readonly isConstrained: boolean = false;

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
        this.isConstrained = segment.isConstrained;
        break;
      case SegmentKind.star:
      case SegmentKind.residue:
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

  public append<S extends AnySegment<T> | null>(segment: S, value: string): SegmentToState<S, T> {
    let state: AnyState<T> | undefined;
    let nextStates = this.nextStates;
    if (nextStates === null) {
      state = void 0;
      nextStates = this.nextStates = [];
    } else if (segment === null) {
      state = nextStates.find(s => s.value === value);
    } else {
      state = nextStates.find(s => s.segment?.equals(segment));
    }

    if (state === void 0) {
      nextStates.push(state = new State(this as AnyState<T>, segment, value) as AnyState<T>);
    }

    return state as SegmentToState<S, T>;
  }

  public setEndpoint(this: AnyState<T>, endpoint: Endpoint<T>): void {
    if (this.endpoint !== null) {
      throw createError(`Cannot add ambiguous route. The pattern '${endpoint.route.path}' clashes with '${this.endpoint.route.path}'`);
    }
    this.endpoint = endpoint;
    if (this.isOptional) {
      this.prevState.setEndpoint(endpoint);
      if (this.prevState.isSeparator && this.prevState.prevState !== null) {
        this.prevState.prevState.setEndpoint(endpoint);
      }
    }
  }

  public isMatch(ch: string): boolean {
    const segment = this.segment;
    switch (segment?.kind) {
      case SegmentKind.dynamic:
        return !this.value.includes(ch);
      case SegmentKind.star:
      case SegmentKind.residue:
        return true;
      case SegmentKind.static:
      case undefined:
        // segment separators (slashes) are non-segments. We could say return ch === '/' as well, technically.
        return this.value.includes(ch);
    }
  }

  public satisfiesConstraint(value: string): boolean {
    return this.isConstrained
      ? (this.segment as DynamicSegment<T>).satisfiesPattern(value)
      : true;
  }
}

function isNotEmpty(segment: string): boolean {
  return segment.length > 0;
}

type AnySegment<T> = (
  StaticSegment<T> |
  DynamicSegment<T> |
  StarSegment<T>
);

_START_CONST_ENUM();
const enum SegmentKind {
  residue = 1, // used when default residue segment is registered.
  star = 2,
  dynamic = 3,
  static = 4,
}
_END_CONST_ENUM();

class StaticSegment<T> {
  public get kind(): SegmentKind.static { return SegmentKind.static; }

  public constructor(
    public readonly value: string,
    public readonly caseSensitive: boolean,
  ) { }

  public appendTo(state: AnyState<T>): StaticState<T> {
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

    return state as StaticState<T>;
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
  public readonly isConstrained: boolean;

  public constructor(
    public readonly name: string,
    public readonly optional: boolean,
    public readonly pattern: RegExp | null,
  ) {
    if (pattern === void 0) throw new Error(`Pattern is undefined`);
    this.isConstrained = pattern !== null;
  }

  public appendTo(state: AnyState<T>): DynamicState<T> {
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

  public satisfiesPattern(value: string): boolean {
    if (this.pattern === null) return true;
    this.pattern.lastIndex = 0;
    return this.pattern.test(value);
  }
}

class StarSegment<T> {
  public constructor(
    public readonly name: string,
    public readonly kind: SegmentKind.star | SegmentKind.residue,
  ) { }

  public appendTo(state: AnyState<T>): StarState<T> {
    state = state.append(
      /* segment */this,
      /* value   */'',
    );

    return state;
  }

  public equals(b: AnySegment<T>): boolean {
    return (
      (b.kind === SegmentKind.star || b.kind === SegmentKind.residue) &&
      b.name === this.name
    );
  }
}

const createError = (msg: string) => new Error(msg);
