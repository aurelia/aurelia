/* eslint-disable no-fallthrough */
import { IRouterOptionsSpec, IComponentSpec } from '../_hook-tests.spec';

function* deactivate(
  prefix: string,
  component: string,
  afterChildren: boolean,
  leave: boolean,
) {
  if (leave) {
    yield `${prefix}.${component}.leave`;
  }
  yield `${prefix}.${component}.beforeDetach`;
  yield `${prefix}.${component}.beforeUnbind`;
  yield `${prefix}.${component}.afterUnbind`;
  if (afterChildren) {
    yield `${prefix}.${component}.afterUnbindChildren`;
    yield `${prefix}.${component}.dispose`;
  }
}

function* activate(
  prefix: string,
  component: string,
  afterChildren: boolean,
  enter: boolean,
) {
  if (enter) {
    yield `${prefix}.${component}.enter`;
  }
  yield `${prefix}.${component}.beforeBind`;
  yield `${prefix}.${component}.afterBind`;
  yield `${prefix}.${component}.afterAttach`;
  if (afterChildren) {
    yield `${prefix}.${component}.afterAttachChildren`;
  }
}

function* interleave(
  ...generators: Generator<string, void>[]
) {
  while (generators.length > 0) {
    for (let i = 0, ii = generators.length; i < ii; ++i) {
      const gen = generators[i];
      const next = gen.next();
      if (next.done) {
        generators.splice(i, 1);
        --i;
        --ii;
      } else {
        yield next.value as string;
      }
    }
  }
}

export const getStopPhaseCalls = {
  *'$x -> ""'(
    prefix: string,
    $x: string,
  ) {
    yield* deactivate(prefix, $x, false, false);
    yield `${prefix}.${$x}.afterUnbindChildren`;
  },
  *'$x$0+$x$1 -> ""'(
    prefix: string,
    $x$0: string,
    $x$1: string,
    comp: IComponentSpec,
  ) {
    if ($x$0.length === 0) { return yield* getStopPhaseCalls['$x -> ""'](prefix, $x$1); }
    if ($x$1.length === 0) { return yield* getStopPhaseCalls['$x -> ""'](prefix, $x$0); }

    switch (comp.kind) {
      case 'all-async':
        yield* interleave(
          deactivate(prefix, $x$0, false, false),
          deactivate(prefix, $x$1, false, false),
        );
        yield `${prefix}.${$x$0}.afterUnbindChildren`;
        yield `${prefix}.${$x$1}.afterUnbindChildren`;
        break;
      case 'all-sync':
        // In 'stop' phase, reason the last two hooks are ordered the way they are is
        // because the controllers are linked to the parent controller in `deactivate` and so those hooks only
        // happen after everything else happened.
        // This linking does not occur in the same way when controllers are deactivated in isolation by the router.
        yield* deactivate(prefix, $x$0, false, false);
        yield* deactivate(prefix, $x$1, false, false);
        yield `${prefix}.${$x$0}.afterUnbindChildren`;
        yield `${prefix}.${$x$1}.afterUnbindChildren`;
        break;
    }
  },
  *'$x$p/$x$c -> ""'(
    prefix: string,
    $x$p: string,
    $x$c: string,
  ) {
    if ($x$c.length === 0) { return yield* getStopPhaseCalls['$x -> ""'](prefix, $x$p); }

    yield* deactivate(prefix, $x$p, false, false);
    yield* deactivate(prefix, $x$c, false, false);
    yield `${prefix}.${$x$c}.afterUnbindChildren`;
    yield `${prefix}.${$x$p}.afterUnbindChildren`;
  },
};

export const getAsyncCalls = {
  *'$x -> ""'(
    prefix: string,
    $x: string,
  ) {
    yield `${prefix}.${$x}.canLeave`;
    yield* deactivate(prefix, $x, true, true);
  },
  *'"" -> $x'(
    prefix: string,
    $x: string,
  ) {
    yield `${prefix}.${$x}.canEnter`;
    yield* activate(prefix, $x, true, true);
  },
  *'$1 -> $2'(
    prefix: string,
    $1: string,
    $2: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ) {
    if ($1.length === 0) { return yield* getAsyncCalls['"" -> $x'](prefix, $2); }
    if ($2.length === 0) { return yield* getAsyncCalls['$x -> ""'](prefix, $1); }

    yield `${prefix}.${$1}.canLeave`;
    yield `${prefix}.${$2}.canEnter`;

    switch (opts.lifecycleStrategy) {
      case 'phased':
        yield `${prefix}.${$1}.leave`;
        yield `${prefix}.${$2}.enter`;
        break;
      case 'parallel':
        // Note: in parallel mode, the swapStrategy does affect the order in which the router hooks are invoked, but this is not necessarily part of
        // the "contract" that is fulfilled by the swapStrategy. It's just an effect of the way it's implemented, which happens to make it look like
        // the router hooks are part of the swap, but they aren't. This can easily be demonstrated by having the enter and leave hooks wait a different
        // amount of time: the activate/deactivate invocations will still be aligned.
        switch (opts.swapStrategy) {
          case 'parallel':
          case 'add-first':
            yield `${prefix}.${$2}.enter`;
            yield `${prefix}.${$1}.leave`;
            break;
          case 'remove-first':
            yield `${prefix}.${$1}.leave`;
            yield `${prefix}.${$2}.enter`;
            break;
        }
    }

    switch (opts.swapStrategy) {
      case 'parallel':
        yield* interleave(
          deactivate(prefix, $1, true, false),
          activate(prefix, $2, true, false),
        );
        break;
      case 'remove-first':
        yield* deactivate(prefix, $1, true, false);
        yield* activate(prefix, $2, true, false);
        break;
      case 'add-first':
        yield* activate(prefix, $2, true, false);
        yield* deactivate(prefix, $1, true, false);
        break;
    }
  },
  *'"" -> $x$0+$x$1'(
    prefix: string,
    $x$0: string,
    $x$1: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ) {
    if ($x$0.length === 0) { return yield* getAsyncCalls['"" -> $x'](prefix, $x$1); }
    if ($x$1.length === 0) { return yield* getAsyncCalls['"" -> $x'](prefix, $x$0); }

    yield `${prefix}.${$x$0}.canEnter`;
    yield `${prefix}.${$x$1}.canEnter`;
    yield* interleave(
      activate(prefix, $x$0, true, true),
      activate(prefix, $x$1, true, true),
    );
  },
  *'$x$0+$x$1 -> ""'(
    prefix: string,
    $x$0: string,
    $x$1: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ) {
    if ($x$0.length === 0) { return yield* getAsyncCalls['$x -> ""'](prefix, $x$1); }
    if ($x$1.length === 0) { return yield* getAsyncCalls['$x -> ""'](prefix, $x$0); }

    yield `${prefix}.${$x$0}.canLeave`;
    yield `${prefix}.${$x$1}.canLeave`;
    yield* interleave(
      deactivate(prefix, $x$0, false, true),
      deactivate(prefix, $x$1, false, true),
    );
    yield `${prefix}.${$x$0}.afterUnbindChildren`;
    yield `${prefix}.${$x$1}.afterUnbindChildren`;
    yield `${prefix}.${$x$1}.dispose`;
    yield `${prefix}.${$x$0}.dispose`;
  },
  *'$1$0+$1$1 -> $2$0+$2$1'(
    prefix: string,
    $1$0: string,
    $1$1: string,
    $2$0: string,
    $2$1: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ) {
    if ($1$0 === $2$0) { return yield* getAsyncCalls['$1 -> $2'](prefix, $1$1, $2$1, opts, comp); }
    if ($1$1 === $2$1) { return yield* getAsyncCalls['$1 -> $2'](prefix, $1$0, $2$0, opts, comp); }
    if ($1$0.length === 0) {
      if ($1$1.length === 0) { return yield* getAsyncCalls['"" -> $x$0+$x$1'](prefix, $2$0, $2$1, opts, comp); }
      if ($2$1.length === 0) { return yield* getAsyncCalls['$1 -> $2'](prefix, $1$1, $2$0, opts, comp); }
    } else if ($1$1.length === 0 && $2$0.length === 0) {
      return yield* getAsyncCalls['$1 -> $2'](prefix, $1$0, $2$1, opts, comp);
    }

    if ($1$0.length > 0) { yield `${prefix}.${$1$0}.canLeave`; }
    if ($1$1.length > 0) { yield `${prefix}.${$1$1}.canLeave`; }
    if ($2$0.length > 0) { yield `${prefix}.${$2$0}.canEnter`; }
    if ($2$1.length > 0) { yield `${prefix}.${$2$1}.canEnter`; }

    switch (opts.lifecycleStrategy) {
      case 'phased':
        if ($1$0.length > 0) { yield `${prefix}.${$1$0}.leave`; }
        if ($1$1.length > 0) { yield `${prefix}.${$1$1}.leave`; }
        if ($2$0.length > 0) { yield `${prefix}.${$2$0}.enter`; }
        if ($2$1.length > 0) { yield `${prefix}.${$2$1}.enter`; }
        break;
      case 'parallel':
        switch (opts.swapStrategy) {
          case 'parallel':
          case 'add-first':
            if ($2$0.length > 0) { yield `${prefix}.${$2$0}.enter`; }
            if ($2$1.length > 0) { yield `${prefix}.${$2$1}.enter`; }
            if ($1$0.length > 0) { yield `${prefix}.${$1$0}.leave`; }
            if ($1$1.length > 0) { yield `${prefix}.${$1$1}.leave`; }
            break;
          case 'remove-first':
            if ($1$0.length > 0) { yield `${prefix}.${$1$0}.leave`; }
            if ($1$1.length > 0) { yield `${prefix}.${$1$1}.leave`; }
            if ($2$0.length > 0) { yield `${prefix}.${$2$0}.enter`; }
            if ($2$1.length > 0) { yield `${prefix}.${$2$1}.enter`; }
            break;
        }
    }

    switch (opts.swapStrategy) {
      case 'parallel':
        if ($1$0.length === 0) {
          yield* interleave(
            activate(prefix, $2$0, true, false),
            deactivate(prefix, $1$1, true, false),
            activate(prefix, $2$1, true, false),
          );
        } else if ($1$1.length === 0) {
          yield* interleave(
            activate(prefix, $2$1, true, false),
            deactivate(prefix, $1$0, true, false),
            activate(prefix, $2$0, true, false),
          );
        } else if ($2$0.length === 0) {
          yield* interleave(
            deactivate(prefix, $1$0, true, false),
            deactivate(prefix, $1$1, true, false),
            activate(prefix, $2$1, true, false),
          );
        }else if ($2$1.length === 0) {
          yield* interleave(
            deactivate(prefix, $1$0, true, false),
            activate(prefix, $2$0, true, false),
            deactivate(prefix, $1$1, true, false),
          );
        }  else {
          yield* interleave(
            deactivate(prefix, $1$0, true, false),
            activate(prefix, $2$0, true, false),
            deactivate(prefix, $1$1, true, false),
            activate(prefix, $2$1, true, false),
          );
        }
        break;
      case 'remove-first':
        if ($1$0.length === 0) {
          yield* interleave(
            deactivate(prefix, $1$1, true, false),
            activate(prefix, $2$0, true, false),
          );
          yield* activate(prefix, $2$1, true, false);
        } else if ($1$1.length === 0) {
          yield* interleave(
            deactivate(prefix, $1$0, true, false),
            activate(prefix, $2$1, true, false),
          );
          yield* activate(prefix, $2$0, true, false);
        } else if ($2$0.length === 0) {
          yield* interleave(
            deactivate(prefix, $1$0, true, false),
            deactivate(prefix, $1$1, true, false),
          );
          yield* activate(prefix, $2$1, true, false);
        } else if ($2$1.length === 0) {
          yield* interleave(
            deactivate(prefix, $1$0, true, false),
            deactivate(prefix, $1$1, true, false),
          );
          yield* activate(prefix, $2$0, true, false);
        } else {
          yield* interleave(
            deactivate(prefix, $1$0, true, false),
            deactivate(prefix, $1$1, true, false),
          );
          yield* interleave(
            activate(prefix, $2$0, true, false),
            activate(prefix, $2$1, true, false),
          );
        }
        break;
      case 'add-first':
        if ($2$0.length === 0) {
          yield* interleave(
            activate(prefix, $2$1, true, false),
            deactivate(prefix, $1$0, true, false),
          );
          yield* deactivate(prefix, $1$1, true, false);
        } else if ($2$1.length === 0) {
          yield* interleave(
            activate(prefix, $2$0, true, false),
            deactivate(prefix, $1$1, true, false),
          );
          yield* deactivate(prefix, $1$0, true, false);
        } else if ($1$0.length === 0) {
          yield* interleave(
            activate(prefix, $2$0, true, false),
            activate(prefix, $2$1, true, false),
          );
          yield* deactivate(prefix, $1$1, true, false);
        } else if ($1$1.length === 0) {
          yield* interleave(
            activate(prefix, $2$0, true, false),
            activate(prefix, $2$1, true, false),
          );
          yield* deactivate(prefix, $1$0, true, false);
        } else {
          yield* interleave(
            activate(prefix, $2$0, true, false),
            activate(prefix, $2$1, true, false),
          );
          yield* interleave(
            deactivate(prefix, $1$0, true, false),
            deactivate(prefix, $1$1, true, false),
          );
        }
        break;
    }
  },
  *'"" -> $x$p/$x$c'(
    prefix: string,
    $x$p: string,
    $x$c: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ) {
    if ($x$c.length === 0) { return yield* getAsyncCalls['"" -> $x'](prefix, $x$p); }

    switch (opts.resolutionStrategy) {
      case 'static':
        switch (opts.lifecycleStrategy) {
          case 'phased':
            yield `${prefix}.${$x$p}.canEnter`;
            yield `${prefix}.${$x$c}.canEnter`;
            yield `${prefix}.${$x$p}.enter`;
            yield `${prefix}.${$x$c}.enter`;

            yield* activate(prefix, $x$p, false, false);
            yield* activate(prefix, $x$c, true, false);
            yield `${prefix}.${$x$p}.afterAttachChildren`;
            break;
          case 'parallel':
            yield `${prefix}.${$x$p}.canEnter`;
            yield `${prefix}.${$x$c}.canEnter`;

            yield* activate(prefix, $x$p, false, true);

            yield `${prefix}.${$x$c}.enter`;
            yield* activate(prefix, $x$c, true, false);
            yield `${prefix}.${$x$p}.afterAttachChildren`;
            break;
        }
        break;
      case 'dynamic':
        yield `${prefix}.${$x$p}.canEnter`;
        yield* activate(prefix, $x$p, true, true);

        yield `${prefix}.${$x$c}.canEnter`;
        yield* activate(prefix, $x$c, true, true);
        break;
    }
  },
  *'$1$p/$1$c -> $2$p/$2$c'(
    prefix: string,
    $1$p: string,
    $1$c: string,
    $2$p: string,
    $2$c: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ) {
    if ($1$p === $2$p) { return yield* getAsyncCalls['$1 -> $2'](prefix, $1$c, $2$c, opts, comp); }

    switch (opts.resolutionStrategy) {
      case 'static':
        switch (opts.lifecycleStrategy) {
          case 'phased':
            if ($1$c.length > 0) { yield `${prefix}.${$1$c}.canLeave`; }

            yield `${prefix}.${$1$p}.canLeave`;
            yield `${prefix}.${$2$p}.canEnter`;

            if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }
            if ($1$c.length > 0) { yield `${prefix}.${$1$c}.leave`; }

            yield `${prefix}.${$1$p}.leave`;
            yield `${prefix}.${$2$p}.enter`;

            if ($2$c.length > 0) { yield `${prefix}.${$2$c}.enter`; }

            switch (opts.swapStrategy) {
              // resolution: static, lifecycle: phased, swap: parallel
              case 'parallel':
                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, false); }

                yield* interleave(
                  deactivate(prefix, $1$p, true, false),
                  (function* () {
                    yield* activate(prefix, $2$p, false, false);

                    if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, false); }

                    yield `${prefix}.${$2$p}.afterAttachChildren`;
                  })(),
                );
                break;
              // resolution: static, lifecycle: phased, swap: remove-first
              case 'remove-first':
                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, false); }

                yield* deactivate(prefix, $1$p, true, false);
                yield* activate(prefix, $2$p, false, false);

                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, false); }

                yield `${prefix}.${$2$p}.afterAttachChildren`;
                break;
              // resolution: static, lifecycle: phased, swap: add-first
              case 'add-first':
                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, false); }

                yield* activate(prefix, $2$p, false, false);

                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, false); }

                yield `${prefix}.${$2$p}.afterAttachChildren`;
                yield* deactivate(prefix, $1$p, true, false);
                break;
            }
            break;
          case 'parallel':
            if ($1$c.length > 0) { yield `${prefix}.${$1$c}.canLeave`; }

            yield `${prefix}.${$1$p}.canLeave`;
            yield `${prefix}.${$2$p}.canEnter`;

            if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }

            switch (opts.swapStrategy) {
              // resolution: static, lifecycle: parallel, swap: parallel
              case 'parallel':
                yield `${prefix}.${$2$p}.enter`;

                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, true); }

                yield `${prefix}.${$1$p}.leave`;
                yield* interleave(
                  deactivate(prefix, $1$p, true, false),
                  (function* () {
                    yield* activate(prefix, $2$p, false, false);

                    if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }

                    yield `${prefix}.${$2$p}.afterAttachChildren`;
                  })(),
                );
                break;
              // resolution: static, lifecycle: parallel, swap: remove-first
              case 'remove-first':
                if ($1$c.length > 0) {
                  yield `${prefix}.${$1$c}.leave`;
                  yield `${prefix}.${$2$p}.enter`;
                  yield* deactivate(prefix, $1$c, true, false);
                  yield `${prefix}.${$1$p}.leave`;
                } else {
                  yield `${prefix}.${$1$p}.leave`;
                  yield `${prefix}.${$2$p}.enter`;
                }

                yield* deactivate(prefix, $1$p, true, false);
                yield* activate(prefix, $2$p, false, false);

                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }

                yield `${prefix}.${$2$p}.afterAttachChildren`;
                break;
              // resolution: static, lifecycle: parallel, swap: add-first
              case 'add-first':
                yield `${prefix}.${$2$p}.enter`;

                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, true); }

                yield `${prefix}.${$1$p}.leave`;
                yield* activate(prefix, $2$p, false, false);

                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }

                yield `${prefix}.${$2$p}.afterAttachChildren`;
                yield* deactivate(prefix, $1$p, true, false);
                break;
            }
            break;
        }
        break;
      case 'dynamic':
        switch (opts.lifecycleStrategy) {
          case 'phased':
            if ($1$c.length > 0) { yield `${prefix}.${$1$c}.canLeave`; }

            yield `${prefix}.${$1$p}.canLeave`;
            yield `${prefix}.${$2$p}.canEnter`;

            if ($1$c.length > 0) { yield `${prefix}.${$1$c}.leave`; }

            yield `${prefix}.${$1$p}.leave`;
            yield `${prefix}.${$2$p}.enter`;

            switch (opts.swapStrategy) {
              // resolution: dynamic, lifecycle: phased, swap: parallel
              case 'parallel':
                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, false); }

                yield* interleave(
                  deactivate(prefix, $1$p, true, false),
                  activate(prefix, $2$p, true, false),
                );

                if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }
                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }
                break;
              // resolution: dynamic, lifecycle: phased, swap: remove-first
              case 'remove-first':
                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, false); }

                yield* deactivate(prefix, $1$p, true, false);
                yield* activate(prefix, $2$p, true, false);

                if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }
                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }
                break;
              // resolution: dynamic, lifecycle: phased, swap: add-first
              case 'add-first':
                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, false); }

                yield* activate(prefix, $2$p, true, false);
                yield* deactivate(prefix, $1$p, true, false);

                if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }
                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }
                break;
            }
            break;
          case 'parallel':
            if ($1$c.length > 0) { yield `${prefix}.${$1$c}.canLeave`; }

            yield `${prefix}.${$1$p}.canLeave`;
            yield `${prefix}.${$2$p}.canEnter`;

            switch (opts.swapStrategy) {
              // resolution: dynamic, lifecycle: parallel, swap: parallel
              case 'parallel':
                yield `${prefix}.${$2$p}.enter`;

                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, true); }

                yield `${prefix}.${$1$p}.leave`;

                yield* interleave(
                  deactivate(prefix, $1$p, true, false),
                  activate(prefix, $2$p, true, false),
                );

                if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }
                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }
                break;
              // resolution: dynamic, lifecycle: parallel, swap: remove-first
              case 'remove-first':
                if ($1$c.length > 0) {
                  yield `${prefix}.${$1$c}.leave`;
                  yield `${prefix}.${$2$p}.enter`;
                  yield* deactivate(prefix, $1$c, true, false);
                  yield `${prefix}.${$1$p}.leave`;
                } else {
                  yield `${prefix}.${$1$p}.leave`;
                  yield `${prefix}.${$2$p}.enter`;
                }

                yield* deactivate(prefix, $1$p, true, false);
                yield* activate(prefix, $2$p, true, false);

                if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }
                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }
                break;
              // resolution: dynamic, lifecycle: parallel, swap: add-first
              case 'add-first':
                yield `${prefix}.${$2$p}.enter`;

                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, true); }

                yield `${prefix}.${$1$p}.leave`;
                yield* activate(prefix, $2$p, true, false);
                yield* deactivate(prefix, $1$p, true, false);

                if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }
                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }
                break;
            }
            break;
        }
        break;
    }
  },
};

export const getSyncCalls = {
  *'$x -> ""'(
    prefix: string,
    $x: string,
  ) {
    yield `${prefix}.${$x}.canLeave`;
    yield* deactivate(prefix, $x, true, true);
  },
  *'"" -> $x'(
    prefix: string,
    $x: string,
  ) {
    yield `${prefix}.${$x}.canEnter`;
    yield* activate(prefix, $x, true, true);
  },
  *'$1 -> $2'(
    prefix: string,
    $1: string,
    $2: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ) {
    if ($1.length === 0) { return yield* getSyncCalls['"" -> $x'](prefix, $2); }
    if ($2.length === 0) { return yield* getSyncCalls['$x -> ""'](prefix, $1); }

    yield `${prefix}.${$1}.canLeave`;
    yield `${prefix}.${$2}.canEnter`;

    switch (opts.lifecycleStrategy) {
      case 'phased':
        yield `${prefix}.${$1}.leave`;
        yield `${prefix}.${$2}.enter`;

        switch (opts.swapStrategy) {
          case 'parallel':
          case 'remove-first':
            yield* deactivate(prefix, $1, true, false);
            yield* activate(prefix, $2, true, false);
            return;
          case 'add-first':
            yield* activate(prefix, $2, true, false);
            yield* deactivate(prefix, $1, true, false);
            return;
        }
      case 'parallel':
        // Note: in parallel mode, the swapStrategy does affect the order in which the router hooks are invoked, but this is not necessarily part of
        // the "contract" that is fulfilled by the swapStrategy. It's just an effect of the way it's implemented, which happens to make it look like
        // the router hooks are part of the swap, but they aren't. This can easily be demonstrated by having the enter and leave hooks wait a different
        // amount of time: the activate/deactivate invocations will still be aligned.
        switch (opts.swapStrategy) {
          case 'parallel':
            yield `${prefix}.${$2}.enter`;
            yield* deactivate(prefix, $1, true, true);
            yield* activate(prefix, $2, true, false);
            return;
          case 'add-first':
            yield* activate(prefix, $2, true, true);
            yield `${prefix}.${$1}.leave`;
            yield* deactivate(prefix, $1, true, false);
            return;
          case 'remove-first':
            yield* deactivate(prefix, $1, true, true);
            yield* activate(prefix, $2, true, true);
            return;
        }
    }
  },
  *'"" -> $x$0+$x$1'(
    prefix: string,
    $x$0: string,
    $x$1: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ) {
    if ($x$0.length === 0) { return yield* getSyncCalls['"" -> $x'](prefix, $x$1); }
    if ($x$1.length === 0) { return yield* getSyncCalls['"" -> $x'](prefix, $x$0); }

    switch (opts.lifecycleStrategy) {
      case 'phased':
        yield `${prefix}.${$x$0}.canEnter`;
        yield `${prefix}.${$x$1}.canEnter`;
        yield `${prefix}.${$x$0}.enter`;
        yield `${prefix}.${$x$1}.enter`;

        yield* activate(prefix, $x$0, true, false);
        yield* activate(prefix, $x$1, true, false);
        break;
      case 'parallel':
        yield `${prefix}.${$x$0}.canEnter`;
        yield `${prefix}.${$x$1}.canEnter`;

        yield* activate(prefix, $x$0, true, true);
        yield* activate(prefix, $x$1, true, true);
        break;
    }
  },
  *'$1$0+$1$1 -> $2$0+$2$1'(
    prefix: string,
    $1$0: string,
    $1$1: string,
    $2$0: string,
    $2$1: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ) {
    if ($1$0 === $2$0) { return yield* getSyncCalls['$1 -> $2'](prefix, $1$1, $2$1, opts, comp); }
    if ($1$1 === $2$1) { return yield* getSyncCalls['$1 -> $2'](prefix, $1$0, $2$0, opts, comp); }

    if ($1$0.length === 0) {
      if ($1$1.length === 0) { return yield* getSyncCalls['"" -> $x$0+$x$1'](prefix, $2$0, $2$1, opts, comp); }
      if ($2$1.length === 0) { return yield* getSyncCalls['"" -> $x$0+$x$1'](prefix, $2$0, $1$1, opts, comp); }
    }

    if ($1$1.length === 0) {
      if ($2$0.length === 0) { return yield* getSyncCalls['$1 -> $2'](prefix, $1$0, $2$1, opts, comp); }
      if ($1$0.length === 0) { return yield* getSyncCalls['"" -> $x$0+$x$1'](prefix, $2$0, $2$1, opts, comp); }
    }

    if ($1$0.length > 0) { yield `${prefix}.${$1$0}.canLeave`; }
    if ($1$1.length > 0) { yield `${prefix}.${$1$1}.canLeave`; }
    if ($2$0.length > 0) { yield `${prefix}.${$2$0}.canEnter`; }
    if ($2$1.length > 0) { yield `${prefix}.${$2$1}.canEnter`; }

    switch (opts.lifecycleStrategy) {
      case 'phased':
        if ($1$0.length > 0) { yield `${prefix}.${$1$0}.leave`; }
        if ($1$1.length > 0) { yield `${prefix}.${$1$1}.leave`; }
        if ($2$0.length > 0) { yield `${prefix}.${$2$0}.enter`; }
        if ($2$1.length > 0) { yield `${prefix}.${$2$1}.enter`; }

        switch (opts.swapStrategy) {
          case 'parallel':
            if ($1$1.length === 0) {
              if ($2$1.length > 0) { yield* activate(prefix, $2$1, true, false); }
              if ($1$0.length > 0) { yield* deactivate(prefix, $1$0, true, false); }
              if ($2$0.length > 0) { yield* activate(prefix, $2$0, true, false); }
            } else {
              if ($1$0.length > 0) { yield* deactivate(prefix, $1$0, true, false); }
              if ($2$0.length > 0) { yield* activate(prefix, $2$0, true, false); }
              if ($1$1.length > 0) { yield* deactivate(prefix, $1$1, true, false); }
              if ($2$1.length > 0) { yield* activate(prefix, $2$1, true, false); }
            }
            break;
          case 'remove-first':
            if ($1$0.length > 0) { yield* deactivate(prefix, $1$0, true, false); }
            if ($1$1.length > 0) { yield* deactivate(prefix, $1$1, true, false); }
            if ($2$0.length > 0) { yield* activate(prefix, $2$0, true, false); }
            if ($2$1.length > 0) { yield* activate(prefix, $2$1, true, false); }
            break;
          case 'add-first':
            if ($2$0.length > 0) { yield* activate(prefix, $2$0, true, false); }
            if ($2$1.length > 0) { yield* activate(prefix, $2$1, true, false); }
            if ($1$0.length > 0) { yield* deactivate(prefix, $1$0, true, false); }
            if ($1$1.length > 0) { yield* deactivate(prefix, $1$1, true, false); }
            break;
        }
        break;
      case 'parallel':
        switch (opts.swapStrategy) {
          case 'parallel':
            if ($1$0.length === 0) {
              yield* activate(prefix, $2$0, true, true);
              yield `${prefix}.${$2$1}.enter`;
              yield* deactivate(prefix, $1$1, true, true);
              yield* activate(prefix, $2$1, true, false);
            } else if ($1$1.length === 0) {
              yield `${prefix}.${$2$0}.enter`;
              yield* activate(prefix, $2$1, true, true);
              yield* deactivate(prefix, $1$0, true, true);
              yield* activate(prefix, $2$0, true, false);
            } else if ($2$0.length === 0) {
              yield `${prefix}.${$2$1}.enter`;
              yield* deactivate(prefix, $1$0, true, true);
              yield* deactivate(prefix, $1$1, true, true);
              yield* activate(prefix, $2$1, true, false);
            } else if ($2$1.length === 0) {
              yield `${prefix}.${$2$0}.enter`;
              yield* deactivate(prefix, $1$0, true, true);
              yield* activate(prefix, $2$0, true, false);
              yield* deactivate(prefix, $1$1, true, true);
            } else {
              yield `${prefix}.${$2$0}.enter`;
              yield `${prefix}.${$2$1}.enter`;
              yield* deactivate(prefix, $1$0, true, true);
              yield* activate(prefix, $2$0, true, false);
              yield* deactivate(prefix, $1$1, true, true);
              yield* activate(prefix, $2$1, true, false);
            }
            break;
          case 'remove-first':
            if ($1$0.length > 0) { yield* deactivate(prefix, $1$0, true, true); }
            if ($1$1.length > 0) { yield* deactivate(prefix, $1$1, true, true); }
            if ($2$0.length > 0) { yield* activate(prefix, $2$0, true, true); }
            if ($2$1.length > 0) { yield* activate(prefix, $2$1, true, true); }
            break;
          case 'add-first':
            if ($2$0.length > 0) { yield* activate(prefix, $2$0, true, true); }
            if ($2$1.length > 0) { yield* activate(prefix, $2$1, true, true); }
            if ($1$0.length > 0) { yield* deactivate(prefix, $1$0, true, true); }
            if ($1$1.length > 0) { yield* deactivate(prefix, $1$1, true, true); }
            break;
        }
        break;
    }
  },
  *'"" -> $x$p/$x$c'(
    prefix: string,
    $x$p: string,
    $x$c: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ) {
    if ($x$c.length === 0) { return yield* getSyncCalls['"" -> $x'](prefix, $x$p); }

    switch (opts.resolutionStrategy) {
      case 'static':
        switch (opts.lifecycleStrategy) {
          case 'phased':
            yield `${prefix}.${$x$p}.canEnter`;
            yield `${prefix}.${$x$c}.canEnter`;
            yield `${prefix}.${$x$p}.enter`;
            yield `${prefix}.${$x$c}.enter`;

            yield* activate(prefix, $x$p, false, false);
            yield* activate(prefix, $x$c, true, false);
            yield `${prefix}.${$x$p}.afterAttachChildren`;
            break;
          case 'parallel':
            yield `${prefix}.${$x$p}.canEnter`;
            yield `${prefix}.${$x$c}.canEnter`;

            yield* activate(prefix, $x$p, false, true);
            yield* activate(prefix, $x$c, true, true);
            yield `${prefix}.${$x$p}.afterAttachChildren`;
            break;
        }
        break;
      case 'dynamic':
        yield `${prefix}.${$x$p}.canEnter`;
        yield* activate(prefix, $x$p, true, true);

        yield `${prefix}.${$x$c}.canEnter`;
        yield* activate(prefix, $x$c, true, true);
        break;
    }
  },
  *'$x$p/$x$c -> ""'(
    prefix: string,
    $x$p: string,
    $x$c: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ) {
    if ($x$c.length === 0) { return yield* getSyncCalls['$x -> ""'](prefix, $x$p); }

    yield `${prefix}.${$x$c}.canLeave`;
    yield `${prefix}.${$x$p}.canLeave`;
    yield `${prefix}.${$x$c}.leave`;
    yield `${prefix}.${$x$p}.leave`;

    yield* deactivate(prefix, $x$c, true, false);
    yield* deactivate(prefix, $x$p, true, false);
  },
  *'$1$p/$1$c -> $2$p/$2$c'(
    prefix: string,
    $1$p: string,
    $1$c: string,
    $2$p: string,
    $2$c: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ) {
    if ($1$p === $2$p) { return yield* getSyncCalls['$1 -> $2'](prefix, $1$c, $2$c, opts, comp); }

    switch (opts.resolutionStrategy) {
      case 'static':
        switch (opts.lifecycleStrategy) {
          case 'phased':
            if ($1$c.length > 0) { yield `${prefix}.${$1$c}.canLeave`; }

            yield `${prefix}.${$1$p}.canLeave`;
            yield `${prefix}.${$2$p}.canEnter`;

            if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }
            if ($1$c.length > 0) { yield `${prefix}.${$1$c}.leave`; }

            yield `${prefix}.${$1$p}.leave`;
            yield `${prefix}.${$2$p}.enter`;

            if ($2$c.length > 0) { yield `${prefix}.${$2$c}.enter`; }

            switch (opts.swapStrategy) {
              case 'parallel':
              case 'remove-first':
                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, false); }

                yield* deactivate(prefix, $1$p, true, false);
                yield* activate(prefix, $2$p, false, false);

                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, false); }

                yield `${prefix}.${$2$p}.afterAttachChildren`;
                break;
              case 'add-first':
                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, false); }

                yield* activate(prefix, $2$p, false, false);

                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, false); }

                yield `${prefix}.${$2$p}.afterAttachChildren`;
                yield* deactivate(prefix, $1$p, true, false);
                break;
            }
            break;
          case 'parallel':
            if ($1$c.length > 0) { yield `${prefix}.${$1$c}.canLeave`; }

            yield `${prefix}.${$1$p}.canLeave`;
            yield `${prefix}.${$2$p}.canEnter`;

            if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }

            switch (opts.swapStrategy) {
              case 'parallel':
                yield `${prefix}.${$2$p}.enter`;

                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, true); }

                yield* deactivate(prefix, $1$p, true, true);
                yield* activate(prefix, $2$p, false, false);

                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }

                yield `${prefix}.${$2$p}.afterAttachChildren`;
                break;
              case 'remove-first':
                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, true); }

                yield* deactivate(prefix, $1$p, true, true);
                yield* activate(prefix, $2$p, false, true);

                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }

                yield `${prefix}.${$2$p}.afterAttachChildren`;
                break;
              case 'add-first':
                yield `${prefix}.${$2$p}.enter`;

                if ($1$c.length > 0) {
                  yield* deactivate(prefix, $1$c, true, true);
                  yield `${prefix}.${$1$p}.leave`;
                  yield* activate(prefix, $2$p, false, false);

                  if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }

                  yield `${prefix}.${$2$p}.afterAttachChildren`;
                  yield* deactivate(prefix, $1$p, true, false);
                } else {
                  yield* activate(prefix, $2$p, false, false);

                  if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }

                  yield `${prefix}.${$2$p}.afterAttachChildren`;
                  yield* deactivate(prefix, $1$p, true, true);
                }

                break;
            }
        }
        break;
      case 'dynamic':
        switch (opts.lifecycleStrategy) {
          case 'phased':
            if ($1$c.length > 0) { yield `${prefix}.${$1$c}.canLeave`; }

            yield `${prefix}.${$1$p}.canLeave`;
            yield `${prefix}.${$2$p}.canEnter`;

            if ($1$c.length > 0) { yield `${prefix}.${$1$c}.leave`; }

            yield `${prefix}.${$1$p}.leave`;
            yield `${prefix}.${$2$p}.enter`;

            switch (opts.swapStrategy) {
              case 'parallel':
              case 'remove-first':
                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, false); }

                yield* deactivate(prefix, $1$p, true, false);
                yield* activate(prefix, $2$p, true, false);

                if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }
                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }
                break;
              case 'add-first':
                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, false); }

                yield* activate(prefix, $2$p, true, false);
                yield* deactivate(prefix, $1$p, true, false);

                if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }
                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }
                break;
            }
            break;
          case 'parallel':
            if ($1$c.length > 0) { yield `${prefix}.${$1$c}.canLeave`; }
            yield `${prefix}.${$1$p}.canLeave`;
            yield `${prefix}.${$2$p}.canEnter`;

            switch (opts.swapStrategy) {
              case 'parallel':
                yield `${prefix}.${$2$p}.enter`;

                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, true); }

                yield* deactivate(prefix, $1$p, true, true);
                yield* activate(prefix, $2$p, true, false);

                if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }
                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }
                break;
              case 'remove-first':
                if ($1$c.length > 0) { yield `${prefix}.${$1$c}.leave`; }
                if ($1$c.length > 0) { yield* deactivate(prefix, $1$c, true, false); }

                yield* deactivate(prefix, $1$p, true, true);
                yield* activate(prefix, $2$p, true, true);

                if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }
                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }
                break;
              case 'add-first':
                yield `${prefix}.${$2$p}.enter`;

                if ($1$c.length > 0) {
                  yield* deactivate(prefix, $1$c, true, true);
                  yield `${prefix}.${$1$p}.leave`;
                  yield* activate(prefix, $2$p, true, false);
                  yield* deactivate(prefix, $1$p, true, false);
                } else {
                  yield* activate(prefix, $2$p, true, false);
                  yield* deactivate(prefix, $1$p, true, true);
                }

                if ($2$c.length > 0) { yield `${prefix}.${$2$c}.canEnter`; }
                if ($2$c.length > 0) { yield* activate(prefix, $2$c, true, true); }
                break;
            }
            break;
        }
        break;
    }
  },
};

export const getCalls = {
  'all-sync': getSyncCalls,
  'all-async': getAsyncCalls,
};
