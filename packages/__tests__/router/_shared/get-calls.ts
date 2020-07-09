import { IRouterOptionsSpec, IComponentSpec } from '../_hook-tests.spec';

function deactivate(
  prefix: string,
  component: string,
): string[] {
  return [
    `${prefix}.${component}.beforeDetach`,
    `${prefix}.${component}.beforeUnbind`,
    `${prefix}.${component}.afterUnbind`,
  ];
}

function activate(
  prefix: string,
  component: string,
): string[] {
  return [
    `${prefix}.${component}.beforeBind`,
    `${prefix}.${component}.afterBind`,
    `${prefix}.${component}.afterAttach`,
  ];
}

function interleave(
  ...arrs: string[][]
): string[] {
  const result: string[] = [];
  while (arrs.length > 0) {
    for (let i = 0, ii = arrs.length; i < ii; ++i) {
      const arr = arrs[i];
      result.push(arr.shift());
      if (arr.length === 0) {
        arrs.splice(i, 1);
        --i;
        --ii;
      }
    }
  }
  return result;
}
export const getStopPhaseCalls = {
  '$x -> ""'(
    prefix: string,
    $x: string,
  ): string[] {
    return [
      ...deactivate(prefix, $x),
      `${prefix}.${$x}.afterUnbindChildren`,
    ];
  },
  '$x$0+$x$1 -> ""'(
    prefix: string,
    $x$0: string,
    $x$1: string,
    comp: IComponentSpec,
  ): string[] {
    if ($x$0 === '') {
      return getStopPhaseCalls['$x -> ""'](prefix, $x$1);
    }

    if ($x$1 === '') {
      return getStopPhaseCalls['$x -> ""'](prefix, $x$0);
    }

    switch (comp.kind) {
      case 'all-async':
        return [
          ...interleave(
            deactivate(prefix, $x$0),
            deactivate(prefix, $x$1),
          ),
          `${prefix}.${$x$0}.afterUnbindChildren`,
          `${prefix}.${$x$1}.afterUnbindChildren`,
        ];
      case 'all-sync':
        // In 'stop' phase, reason the last two hooks are ordered the way they are is
        // because the controllers are linked to the parent controller in `deactivate` and so those hooks only
        // happen after everything else happened.
        // This linking does not occur in the same way when controllers are deactivated in isolation by the router.
        return [
          ...deactivate(prefix, $x$0),
          ...deactivate(prefix, $x$1),
          `${prefix}.${$x$0}.afterUnbindChildren`,
          `${prefix}.${$x$1}.afterUnbindChildren`,
        ];
    }
  },
  '$x$p/$x$c -> ""'(
    prefix: string,
    $x$p: string,
    $x$c: string,
  ): string[] {
    if ($x$c === '') {
      return getStopPhaseCalls['$x -> ""'](prefix, $x$p);
    }

    return [
      ...deactivate(prefix, $x$p),
      ...deactivate(prefix, $x$c),
      `${prefix}.${$x$c}.afterUnbindChildren`,
      `${prefix}.${$x$p}.afterUnbindChildren`,
    ];
  },
};

// switch (opts.swapStrategy) {
//   case 'parallel':
//   case 'remove-first':
//   case 'add-first':
// }
export const getCalls = {
  '$x -> ""'(
    prefix: string,
    $x: string,
  ): string[] {
    return [
      `${prefix}.${$x}.canLeave`,
      `${prefix}.${$x}.leave`,

      ...deactivate(prefix, $x),
      `${prefix}.${$x}.afterUnbindChildren`,
      `${prefix}.${$x}.dispose`,
    ];
  },
  '"" -> $x'(
    prefix: string,
    $x: string,
  ): string[] {
    return [
      `${prefix}.${$x}.canEnter`,
      `${prefix}.${$x}.enter`,

      ...activate(prefix, $x),
      `${prefix}.${$x}.afterAttachChildren`,
    ];
  },
  '$1 -> $2'(
    prefix: string,
    $1: string,
    $2: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ): string[] {
    if ($1 === '') {
      return getCalls['"" -> $x'](prefix, $2);
    }

    if ($2 === '') {
      return getCalls['$x -> ""'](prefix, $1);
    }

    const routerHooks = [
      `${prefix}.${$1}.canLeave`,
      `${prefix}.${$2}.canEnter`,
      `${prefix}.${$1}.leave`,
      `${prefix}.${$2}.enter`,
    ];
    switch (comp.kind) {
      case 'all-async':
        switch (opts.swapStrategy) {
          case 'parallel':
            return [
              ...routerHooks,
              ...interleave(
                deactivate(prefix, $1),
                activate(prefix, $2),
              ),
              `${prefix}.${$1}.afterUnbindChildren`,
              `${prefix}.${$2}.afterAttachChildren`,
              `${prefix}.${$1}.dispose`,
            ];
          case 'remove-first':
            return [
              ...routerHooks,
              ...deactivate(prefix, $1),
              `${prefix}.${$1}.afterUnbindChildren`,
              `${prefix}.${$1}.dispose`,
              ...activate(prefix, $2),
              `${prefix}.${$2}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,
              ...activate(prefix, $2),
              `${prefix}.${$2}.afterAttachChildren`,
              ...deactivate(prefix, $1),
              `${prefix}.${$1}.afterUnbindChildren`,
              `${prefix}.${$1}.dispose`,
            ];
        }
        break;
      case 'all-sync':
        switch (opts.swapStrategy) {
          case 'parallel':
          case 'remove-first':
            return [
              ...routerHooks,
              ...deactivate(prefix, $1),
              `${prefix}.${$1}.afterUnbindChildren`,
              `${prefix}.${$1}.dispose`,
              ...activate(prefix, $2),
              `${prefix}.${$2}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,
              ...activate(prefix, $2),
              `${prefix}.${$2}.afterAttachChildren`,
              ...deactivate(prefix, $1),
              `${prefix}.${$1}.afterUnbindChildren`,
              `${prefix}.${$1}.dispose`,
            ];
        }
    }
  },
  '"" -> $x$0+$x$1'(
    prefix: string,
    $x$0: string,
    $x$1: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ): string[] {
    if ($x$0 === '') {
      return getCalls['"" -> $x'](prefix, $x$1);
    }

    if ($x$1 === '') {
      return getCalls['"" -> $x'](prefix, $x$0);
    }

    const routerHooks = [
      `${prefix}.${$x$0}.canEnter`,
      `${prefix}.${$x$1}.canEnter`,
      `${prefix}.${$x$0}.enter`,
      `${prefix}.${$x$1}.enter`,
    ];
    switch (comp.kind) {
      case 'all-async':
        return [
          ...routerHooks,
          ...interleave(
            activate(prefix, $x$0),
            activate(prefix, $x$1),
          ),
          `${prefix}.${$x$0}.afterAttachChildren`,
          `${prefix}.${$x$1}.afterAttachChildren`,
        ];
      case 'all-sync':
        return [
          ...routerHooks,
          ...activate(prefix, $x$0),
          `${prefix}.${$x$0}.afterAttachChildren`,
          ...activate(prefix, $x$1),
          `${prefix}.${$x$1}.afterAttachChildren`,
        ];
    }
  },
  '$x$0+$x$1 -> ""'(
    prefix: string,
    $x$0: string,
    $x$1: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ): string[] {
    if ($x$0 === '') {
      return getCalls['$x -> ""'](prefix, $x$1);
    }

    if ($x$1 === '') {
      return getCalls['$x -> ""'](prefix, $x$0);
    }

    const routerHooks = [
      `${prefix}.${$x$0}.canLeave`,
      `${prefix}.${$x$1}.canLeave`,
      `${prefix}.${$x$0}.leave`,
      `${prefix}.${$x$1}.leave`,
    ];
    switch (comp.kind) {
      case 'all-async':
        return [
          ...routerHooks,
          ...interleave(
            deactivate(prefix, $x$0),
            deactivate(prefix, $x$1),
          ),
          `${prefix}.${$x$0}.afterUnbindChildren`,
          `${prefix}.${$x$1}.afterUnbindChildren`,
          `${prefix}.${$x$1}.dispose`,
          `${prefix}.${$x$0}.dispose`,
        ];
      case 'all-sync':
        return [
          ...routerHooks,
          ...deactivate(prefix, $x$0),
          `${prefix}.${$x$0}.afterUnbindChildren`,
          `${prefix}.${$x$0}.dispose`,
          ...deactivate(prefix, $x$1),
          `${prefix}.${$x$1}.afterUnbindChildren`,
          `${prefix}.${$x$1}.dispose`,
        ];
    }
  },
  '$1$0+$1$1 -> $2$0'(
    prefix: string,
    $1$0: string,
    $1$1: string,
    $2$0: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ): string[] {
    const routerHooks = [
      `${prefix}.${$1$0}.canLeave`,
      `${prefix}.${$1$1}.canLeave`,
      `${prefix}.${$2$0}.canEnter`,
      `${prefix}.${$1$0}.leave`,
      `${prefix}.${$1$1}.leave`,
      `${prefix}.${$2$0}.enter`,
    ];
    switch (comp.kind) {
      case 'all-async':
        switch (opts.swapStrategy) {
          case 'parallel':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...deactivate(prefix, $1$0),
                  `${prefix}.${$1$0}.afterUnbindChildren`,
                  `${prefix}.${$1$0}.dispose`,
                ],
                [
                  ...activate(prefix, $2$0),
                  `${prefix}.${$2$0}.afterAttachChildren`,
                ],
                [
                  ...deactivate(prefix, $1$1),
                  `${prefix}.${$1$1}.afterUnbindChildren`,
                  `${prefix}.${$1$1}.dispose`,
                ],
              ),
            ];
          case 'remove-first':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...deactivate(prefix, $1$1),
                  `${prefix}.${$1$1}.afterUnbindChildren`,
                  `${prefix}.${$1$1}.dispose`,
                ],
                [
                  ...deactivate(prefix, $1$0),
                  `${prefix}.${$1$0}.afterUnbindChildren`,
                  `${prefix}.${$1$0}.dispose`,
                ],
              ),
              ...activate(prefix, $2$0),
              `${prefix}.${$2$0}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...activate(prefix, $2$0),
                  `${prefix}.${$2$0}.afterAttachChildren`,
                ],
                [
                  ...deactivate(prefix, $1$1),
                  `${prefix}.${$1$1}.afterUnbindChildren`,
                  `${prefix}.${$1$1}.dispose`,
                ],
              ),
              ...deactivate(prefix, $1$0),
              `${prefix}.${$1$0}.afterUnbindChildren`,
              `${prefix}.${$1$0}.dispose`,
            ];
        }
        break;
      case 'all-sync':
        switch (opts.swapStrategy) {
          case 'parallel':
            return [
              ...routerHooks,
              ...deactivate(prefix, $1$0),
              `${prefix}.${$1$0}.afterUnbindChildren`,
              `${prefix}.${$1$0}.dispose`,
              ...activate(prefix, $2$0),
              `${prefix}.${$2$0}.afterAttachChildren`,
              ...deactivate(prefix, $1$1),
              `${prefix}.${$1$1}.afterUnbindChildren`,
              `${prefix}.${$1$1}.dispose`,
            ];
          case 'remove-first':
            return [
              ...routerHooks,
              ...deactivate(prefix, $1$1),
              `${prefix}.${$1$1}.afterUnbindChildren`,
              `${prefix}.${$1$1}.dispose`,
              ...deactivate(prefix, $1$0),
              `${prefix}.${$1$0}.afterUnbindChildren`,
              `${prefix}.${$1$0}.dispose`,
              ...activate(prefix, $2$0),
              `${prefix}.${$2$0}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,
              ...activate(prefix, $2$0),
              `${prefix}.${$2$0}.afterAttachChildren`,
              ...deactivate(prefix, $1$0),
              `${prefix}.${$1$0}.afterUnbindChildren`,
              `${prefix}.${$1$0}.dispose`,
              ...deactivate(prefix, $1$1),
              `${prefix}.${$1$1}.afterUnbindChildren`,
              `${prefix}.${$1$1}.dispose`,
            ];
        }
    }
  },
  '$1$0+$1$1 -> $2$1'(
    prefix: string,
    $1$0: string,
    $1$1: string,
    $2$1: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ): string[] {
    const routerHooks = [
      `${prefix}.${$1$0}.canLeave`,
      `${prefix}.${$1$1}.canLeave`,
      `${prefix}.${$2$1}.canEnter`,
      `${prefix}.${$1$0}.leave`,
      `${prefix}.${$1$1}.leave`,
      `${prefix}.${$2$1}.enter`,
    ];
    switch (comp.kind) {
      case 'all-async':
        switch (opts.swapStrategy) {
          case 'parallel':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...deactivate(prefix, $1$0),
                  `${prefix}.${$1$0}.afterUnbindChildren`,
                  `${prefix}.${$1$0}.dispose`,
                ],
                [
                  ...deactivate(prefix, $1$1),
                  `${prefix}.${$1$1}.afterUnbindChildren`,
                  `${prefix}.${$1$1}.dispose`,
                ],
                [
                  ...activate(prefix, $2$1),
                  `${prefix}.${$2$1}.afterAttachChildren`,
                ],
              ),
            ];
          case 'remove-first':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...deactivate(prefix, $1$0),
                  `${prefix}.${$1$0}.afterUnbindChildren`,
                  `${prefix}.${$1$0}.dispose`,
                ],
                [
                  ...deactivate(prefix, $1$1),
                  `${prefix}.${$1$1}.afterUnbindChildren`,
                  `${prefix}.${$1$1}.dispose`,
                ],
              ),
              ...activate(prefix, $2$1),
              `${prefix}.${$2$1}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...deactivate(prefix, $1$0),
                  `${prefix}.${$1$0}.afterUnbindChildren`,
                  `${prefix}.${$1$0}.dispose`,
                ],
                [
                  ...activate(prefix, $2$1),
                  `${prefix}.${$2$1}.afterAttachChildren`,
                ],
              ),
              ...deactivate(prefix, $1$1),
              `${prefix}.${$1$1}.afterUnbindChildren`,
              `${prefix}.${$1$1}.dispose`,
            ];
        }
        break;
      case 'all-sync':
        switch (opts.swapStrategy) {
          case 'parallel':
          case 'remove-first':
            return [
              ...routerHooks,
              ...deactivate(prefix, $1$0),
              `${prefix}.${$1$0}.afterUnbindChildren`,
              `${prefix}.${$1$0}.dispose`,
              ...deactivate(prefix, $1$1),
              `${prefix}.${$1$1}.afterUnbindChildren`,
              `${prefix}.${$1$1}.dispose`,
              ...activate(prefix, $2$1),
              `${prefix}.${$2$1}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,
              ...deactivate(prefix, $1$0),
              `${prefix}.${$1$0}.afterUnbindChildren`,
              `${prefix}.${$1$0}.dispose`,
              ...activate(prefix, $2$1),
              `${prefix}.${$2$1}.afterAttachChildren`,
              ...deactivate(prefix, $1$1),
              `${prefix}.${$1$1}.afterUnbindChildren`,
              `${prefix}.${$1$1}.dispose`,
            ];
        }
    }
  },
  '$1$0 -> $2$0+$2$1'(
    prefix: string,
    $1$0: string,
    $2$0: string,
    $2$1: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ): string[] {
    const routerHooks = [
      `${prefix}.${$1$0}.canLeave`,
      `${prefix}.${$2$0}.canEnter`,
      `${prefix}.${$2$1}.canEnter`,
      `${prefix}.${$1$0}.leave`,
      `${prefix}.${$2$0}.enter`,
      `${prefix}.${$2$1}.enter`,
    ];
    switch (comp.kind) {
      case 'all-async':
        switch (opts.swapStrategy) {
          case 'parallel':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...activate(prefix, $2$1),
                  `${prefix}.${$2$1}.afterAttachChildren`,
                ],
                [
                  ...deactivate(prefix, $1$0),
                  `${prefix}.${$1$0}.afterUnbindChildren`,
                  `${prefix}.${$1$0}.dispose`,
                ],
                [
                  ...activate(prefix, $2$0),
                  `${prefix}.${$2$0}.afterAttachChildren`,
                ],
              ),
            ];
          case 'remove-first':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...deactivate(prefix, $1$0),
                  `${prefix}.${$1$0}.afterUnbindChildren`,
                  `${prefix}.${$1$0}.dispose`,
                ],
                [
                  ...activate(prefix, $2$1),
                  `${prefix}.${$2$1}.afterAttachChildren`,
                ],
              ),
              ...activate(prefix, $2$0),
              `${prefix}.${$2$0}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...activate(prefix, $2$1),
                  `${prefix}.${$2$1}.afterAttachChildren`,
                ],
                [
                  ...activate(prefix, $2$0),
                  `${prefix}.${$2$0}.afterAttachChildren`,
                ],
              ),
              ...deactivate(prefix, $1$0),
              `${prefix}.${$1$0}.afterUnbindChildren`,
              `${prefix}.${$1$0}.dispose`,
            ];
        }
        break;
      case 'all-sync':
        switch (opts.swapStrategy) {
          case 'parallel':
            return [
              ...routerHooks,
              ...activate(prefix, $2$1),
              `${prefix}.${$2$1}.afterAttachChildren`,
              ...deactivate(prefix, $1$0),
              `${prefix}.${$1$0}.afterUnbindChildren`,
              `${prefix}.${$1$0}.dispose`,
              ...activate(prefix, $2$0),
              `${prefix}.${$2$0}.afterAttachChildren`,
            ];
          case 'remove-first':
            return [
              ...routerHooks,
              ...deactivate(prefix, $1$0),
              `${prefix}.${$1$0}.afterUnbindChildren`,
              `${prefix}.${$1$0}.dispose`,
              ...activate(prefix, $2$0),
              `${prefix}.${$2$0}.afterAttachChildren`,
              ...activate(prefix, $2$1),
              `${prefix}.${$2$1}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,
              ...activate(prefix, $2$1),
              `${prefix}.${$2$1}.afterAttachChildren`,
              ...activate(prefix, $2$0),
              `${prefix}.${$2$0}.afterAttachChildren`,
              ...deactivate(prefix, $1$0),
              `${prefix}.${$1$0}.afterUnbindChildren`,
              `${prefix}.${$1$0}.dispose`,
            ];
        }
    }
  },
  '$1$1 -> $2$0+$2$1'(
    prefix: string,
    $1$1: string,
    $2$0: string,
    $2$1: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ): string[] {
    const routerHooks = [
      `${prefix}.${$1$1}.canLeave`,
      `${prefix}.${$2$0}.canEnter`,
      `${prefix}.${$2$1}.canEnter`,
      `${prefix}.${$1$1}.leave`,
      `${prefix}.${$2$0}.enter`,
      `${prefix}.${$2$1}.enter`,
    ];
    switch (comp.kind) {
      case 'all-async':
        switch (opts.swapStrategy) {
          case 'parallel':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...activate(prefix, $2$0),
                  `${prefix}.${$2$0}.afterAttachChildren`,
                ],
                [
                  ...deactivate(prefix, $1$1),
                  `${prefix}.${$1$1}.afterUnbindChildren`,
                  `${prefix}.${$1$1}.dispose`,
                ],
                [
                  ...activate(prefix, $2$1),
                  `${prefix}.${$2$1}.afterAttachChildren`,
                ],
              ),
            ];
          case 'remove-first':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...activate(prefix, $2$0),
                  `${prefix}.${$2$0}.afterAttachChildren`,
                ],
                [
                  ...deactivate(prefix, $1$1),
                  `${prefix}.${$1$1}.afterUnbindChildren`,
                  `${prefix}.${$1$1}.dispose`,
                ],
              ),
              ...activate(prefix, $2$1),
              `${prefix}.${$2$1}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...activate(prefix, $2$0),
                  `${prefix}.${$2$0}.afterAttachChildren`,
                ],
                [
                  ...activate(prefix, $2$1),
                  `${prefix}.${$2$1}.afterAttachChildren`,
                ],
              ),
              ...deactivate(prefix, $1$1),
              `${prefix}.${$1$1}.afterUnbindChildren`,
              `${prefix}.${$1$1}.dispose`,
            ];
        }
        break;
      case 'all-sync':
        switch (opts.swapStrategy) {
          case 'parallel':
          case 'remove-first':
            return [
              ...routerHooks,
              ...activate(prefix, $2$0),
              `${prefix}.${$2$0}.afterAttachChildren`,
              ...deactivate(prefix, $1$1),
              `${prefix}.${$1$1}.afterUnbindChildren`,
              `${prefix}.${$1$1}.dispose`,
              ...activate(prefix, $2$1),
              `${prefix}.${$2$1}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,
              ...activate(prefix, $2$0),
              `${prefix}.${$2$0}.afterAttachChildren`,
              ...activate(prefix, $2$1),
              `${prefix}.${$2$1}.afterAttachChildren`,
              ...deactivate(prefix, $1$1),
              `${prefix}.${$1$1}.afterUnbindChildren`,
              `${prefix}.${$1$1}.dispose`,
            ];
        }
    }
  },
  '$1$0+$1$1 -> $2$0+$2$1'(
    prefix: string,
    $1$0: string,
    $1$1: string,
    $2$0: string,
    $2$1: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ): string[] {
    if ($1$0 === $2$0) {
      return getCalls['$1 -> $2'](prefix, $1$1, $2$1, opts, comp);
    }

    if ($1$1 === $2$1) {
      return getCalls['$1 -> $2'](prefix, $1$0, $2$0, opts, comp);
    }

    if ($1$0 === '') {
      if ($1$1 === '') {
        return getCalls['"" -> $x$0+$x$1'](prefix, $2$0, $2$1, opts, comp);
      }
      if ($2$1 === '') {
        return getCalls['"" -> $x$0+$x$1'](prefix, $2$0, $1$1, opts, comp);
      }

      return getCalls['$1$1 -> $2$0+$2$1'](prefix, $1$1, $2$0, $2$1, opts, comp);
    }

    if ($1$1 === '') {
      return getCalls['$1$0 -> $2$0+$2$1'](prefix, $1$0, $2$0, $2$1, opts, comp);
    }

    if ($2$0 === '') {
      if ($1$1 === '') {
        return getCalls['$x$0+$x$1 -> ""'](prefix, $1$0, $2$1, opts, comp);
      }
      if ($2$1 === '') {
        return getCalls['$x$0+$x$1 -> ""'](prefix, $1$0, $1$1, opts, comp);
      }

      return getCalls['$1$0+$1$1 -> $2$1'](prefix, $1$0, $1$1, $2$1, opts, comp);
    }

    if ($2$1 === '') {
      return getCalls['$1$0+$1$1 -> $2$0'](prefix, $1$0, $1$1, $2$0, opts, comp);
    }

    const routerHooks = [
      `${prefix}.${$1$0}.canLeave`,
      `${prefix}.${$1$1}.canLeave`,
      `${prefix}.${$2$0}.canEnter`,
      `${prefix}.${$2$1}.canEnter`,
      `${prefix}.${$1$0}.leave`,
      `${prefix}.${$1$1}.leave`,
      `${prefix}.${$2$0}.enter`,
      `${prefix}.${$2$1}.enter`,
    ];
    switch (comp.kind) {
      case 'all-async':
        switch (opts.swapStrategy) {
          case 'parallel':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...deactivate(prefix, $1$0),
                  `${prefix}.${$1$0}.afterUnbindChildren`,
                  `${prefix}.${$1$0}.dispose`,
                ],
                [
                  ...activate(prefix, $2$0),
                  `${prefix}.${$2$0}.afterAttachChildren`,
                ],
                [
                  ...deactivate(prefix, $1$1),
                  `${prefix}.${$1$1}.afterUnbindChildren`,
                  `${prefix}.${$1$1}.dispose`,
                ],
                [
                  ...activate(prefix, $2$1),
                  `${prefix}.${$2$1}.afterAttachChildren`,
                ],
              ),
            ];
          case 'remove-first':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...deactivate(prefix, $1$0),
                  `${prefix}.${$1$0}.afterUnbindChildren`,
                  `${prefix}.${$1$0}.dispose`,
                ],
                [
                  ...deactivate(prefix, $1$1),
                  `${prefix}.${$1$1}.afterUnbindChildren`,
                  `${prefix}.${$1$1}.dispose`,
                ],
              ),
              ...interleave(
                [
                  ...activate(prefix, $2$0),
                  `${prefix}.${$2$0}.afterAttachChildren`,
                ],
                [
                  ...activate(prefix, $2$1),
                  `${prefix}.${$2$1}.afterAttachChildren`,
                ],
              ),
            ];
          case 'add-first':
            return [
              ...routerHooks,
              ...interleave(
                [
                  ...activate(prefix, $2$0),
                  `${prefix}.${$2$0}.afterAttachChildren`,
                ],
                [
                  ...activate(prefix, $2$1),
                  `${prefix}.${$2$1}.afterAttachChildren`,
                ],
              ),
              ...interleave(
                [
                  ...deactivate(prefix, $1$0),
                  `${prefix}.${$1$0}.afterUnbindChildren`,
                  `${prefix}.${$1$0}.dispose`,
                ],
                [
                  ...deactivate(prefix, $1$1),
                  `${prefix}.${$1$1}.afterUnbindChildren`,
                  `${prefix}.${$1$1}.dispose`,
                ],
              ),
            ];
        }
        break;
      case 'all-sync':
        switch (opts.swapStrategy) {
          case 'parallel':
          case 'remove-first':
            return [
              ...routerHooks,
              ...deactivate(prefix, $1$0),
              `${prefix}.${$1$0}.afterUnbindChildren`,
              `${prefix}.${$1$0}.dispose`,
              ...activate(prefix, $2$0),
              `${prefix}.${$2$0}.afterAttachChildren`,
              ...deactivate(prefix, $1$1),
              `${prefix}.${$1$1}.afterUnbindChildren`,
              `${prefix}.${$1$1}.dispose`,
              ...activate(prefix, $2$1),
              `${prefix}.${$2$1}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,
              ...activate(prefix, $2$0),
              `${prefix}.${$2$0}.afterAttachChildren`,
              ...deactivate(prefix, $1$0),
              `${prefix}.${$1$0}.afterUnbindChildren`,
              `${prefix}.${$1$0}.dispose`,
              ...activate(prefix, $2$1),
              `${prefix}.${$2$1}.afterAttachChildren`,
              ...deactivate(prefix, $1$1),
              `${prefix}.${$1$1}.afterUnbindChildren`,
              `${prefix}.${$1$1}.dispose`,
            ];
        }
    }
  },
  '"" -> $x$p/$x$c'(
    prefix: string,
    $x$p: string,
    $x$c: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ): string[] {
    if ($x$c === '') {
      return getCalls['"" -> $x'](prefix, $x$p);
    }

    switch (opts.resolutionStrategy) {
      case 'static':
        return [
          `${prefix}.${$x$p}.canEnter`,
          `${prefix}.${$x$c}.canEnter`,
          `${prefix}.${$x$p}.enter`,
          `${prefix}.${$x$c}.enter`,

          ...activate(prefix, $x$p),
          ...activate(prefix, $x$c),
          `${prefix}.${$x$c}.afterAttachChildren`,
          `${prefix}.${$x$p}.afterAttachChildren`,
        ];
      case 'dynamic':
        return [
          `${prefix}.${$x$p}.canEnter`,
          `${prefix}.${$x$p}.enter`,

          ...activate(prefix, $x$p),
          `${prefix}.${$x$p}.afterAttachChildren`,

          `${prefix}.${$x$c}.canEnter`,
          `${prefix}.${$x$c}.enter`,

          ...activate(prefix, $x$c),
          `${prefix}.${$x$c}.afterAttachChildren`,
        ];
    }
  },
  '$x$p/$x$c -> ""'(
    prefix: string,
    $x$p: string,
    $x$c: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ): string[] {
    if ($x$c === '') {
      return getCalls['$x -> ""'](prefix, $x$p);
    }

    return [
      `${prefix}.${$x$c}.canLeave`,
      `${prefix}.${$x$p}.canLeave`,
      `${prefix}.${$x$c}.leave`,
      `${prefix}.${$x$p}.leave`,

      ...deactivate(prefix, $x$c),
      `${prefix}.${$x$c}.afterUnbindChildren`,
      `${prefix}.${$x$c}.dispose`,

      ...deactivate(prefix, $x$p),
      `${prefix}.${$x$p}.afterUnbindChildren`,
      `${prefix}.${$x$p}.dispose`,
    ];
  },
  '$1$p/$1$c -> $2$p'(
    prefix: string,
    $1$p: string,
    $1$c: string,
    $2$p: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ): string[] {
    if ($2$p === '') {
      return getCalls['$x$p/$x$c -> ""'](prefix, $1$p, $1$c, opts, comp);
    }

    const routerHooks = [
      `${prefix}.${$1$c}.canLeave`,
      `${prefix}.${$1$p}.canLeave`,
      `${prefix}.${$2$p}.canEnter`,
      `${prefix}.${$1$c}.leave`,
      `${prefix}.${$1$p}.leave`,
      `${prefix}.${$2$p}.enter`,
    ];
    switch (opts.swapStrategy) {
      case 'parallel':
        switch (comp.kind) {
          case 'all-async':
            return [
              ...routerHooks,
              ...deactivate(prefix, $1$c),
              `${prefix}.${$1$c}.afterUnbindChildren`,
              `${prefix}.${$1$c}.dispose`,
              ...interleave(
                [
                  ...deactivate(prefix, $1$p),
                  `${prefix}.${$1$p}.afterUnbindChildren`,
                  `${prefix}.${$1$p}.dispose`,
                ],
                [
                  ...activate(prefix, $2$p),
                  `${prefix}.${$2$p}.afterAttachChildren`,
                ],
              ),
            ];
          case 'all-sync':
            return [
              ...routerHooks,
              ...deactivate(prefix, $1$c),
              `${prefix}.${$1$c}.afterUnbindChildren`,
              `${prefix}.${$1$c}.dispose`,
              ...deactivate(prefix, $1$p),
              `${prefix}.${$1$p}.afterUnbindChildren`,
              `${prefix}.${$1$p}.dispose`,
              ...activate(prefix, $2$p),
              `${prefix}.${$2$p}.afterAttachChildren`,
            ];
        }
        break;
      case 'remove-first':
        return [
          ...routerHooks,
          ...deactivate(prefix, $1$c),
          `${prefix}.${$1$c}.afterUnbindChildren`,
          `${prefix}.${$1$c}.dispose`,
          ...deactivate(prefix, $1$p),
          `${prefix}.${$1$p}.afterUnbindChildren`,
          `${prefix}.${$1$p}.dispose`,
          ...activate(prefix, $2$p),
          `${prefix}.${$2$p}.afterAttachChildren`,
        ];
      case 'add-first':
        return [
          ...routerHooks,
          ...deactivate(prefix, $1$c),
          `${prefix}.${$1$c}.afterUnbindChildren`,
          `${prefix}.${$1$c}.dispose`,
          ...activate(prefix, $2$p),
          `${prefix}.${$2$p}.afterAttachChildren`,
          ...deactivate(prefix, $1$p),
          `${prefix}.${$1$p}.afterUnbindChildren`,
          `${prefix}.${$1$p}.dispose`,
        ];
    }
  },
  '$1$p -> $2$p/$2$c'(
    prefix: string,
    $1$p: string,
    $2$p: string,
    $2$c: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ): string[] {
    if ($2$c === '') {
      return getCalls['$1 -> $2'](prefix, $1$p, $2$p, opts, comp);
    }

    if ($1$p === '') {
      return getCalls['"" -> $x$p/$x$c'](prefix, $2$p, $2$c, opts, comp);
    }

    switch (opts.resolutionStrategy) {
      case 'static': {
        const routerHooks = [
          `${prefix}.${$1$p}.canLeave`,
          `${prefix}.${$2$p}.canEnter`,
          `${prefix}.${$2$c}.canEnter`,
          `${prefix}.${$1$p}.leave`,
          `${prefix}.${$2$p}.enter`,
          `${prefix}.${$2$c}.enter`,
        ];
        switch (opts.swapStrategy) {
          case 'parallel':
            switch (comp.kind) {
              case 'all-async':
                return [
                  ...routerHooks,

                  ...interleave(
                    [
                      ...deactivate(prefix, $1$p),
                      `${prefix}.${$1$p}.afterUnbindChildren`,
                      `${prefix}.${$1$p}.dispose`,
                    ],
                    [
                      ...activate(prefix, $2$p),
                      ...activate(prefix, $2$c),
                    ],
                  ),
                  `${prefix}.${$2$c}.afterAttachChildren`,
                  `${prefix}.${$2$p}.afterAttachChildren`,
                ];
              case 'all-sync':
                return [
                  ...routerHooks,

                  ...deactivate(prefix, $1$p),
                  `${prefix}.${$1$p}.afterUnbindChildren`,
                  `${prefix}.${$1$p}.dispose`,
                  ...activate(prefix, $2$p),
                  ...activate(prefix, $2$c),
                  `${prefix}.${$2$c}.afterAttachChildren`,
                  `${prefix}.${$2$p}.afterAttachChildren`,
                ];
            }
            break;
          case 'remove-first':
            return [
              ...routerHooks,

              ...deactivate(prefix, $1$p),
              `${prefix}.${$1$p}.afterUnbindChildren`,
              `${prefix}.${$1$p}.dispose`,
              ...activate(prefix, $2$p),
              ...activate(prefix, $2$c),
              `${prefix}.${$2$c}.afterAttachChildren`,
              `${prefix}.${$2$p}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,

              ...activate(prefix, $2$p),
              ...activate(prefix, $2$c),
              `${prefix}.${$2$c}.afterAttachChildren`,
              `${prefix}.${$2$p}.afterAttachChildren`,
              ...deactivate(prefix, $1$p),
              `${prefix}.${$1$p}.afterUnbindChildren`,
              `${prefix}.${$1$p}.dispose`,
            ];
        }
        break;
      }
      case 'dynamic': {
        const routerHooks = [
          `${prefix}.${$1$p}.canLeave`,
          `${prefix}.${$2$p}.canEnter`,
          `${prefix}.${$1$p}.leave`,
          `${prefix}.${$2$p}.enter`,
        ];
        switch (opts.swapStrategy) {
          case 'parallel':
            switch (comp.kind) {
              case 'all-async':
                return [
                  ...routerHooks,
                  ...interleave(
                    [
                      ...deactivate(prefix, $1$p),
                      `${prefix}.${$1$p}.afterUnbindChildren`,
                      `${prefix}.${$1$p}.dispose`,
                    ],
                    [
                      ...activate(prefix, $2$p),
                      `${prefix}.${$2$p}.afterAttachChildren`,
                    ],
                  ),

                  `${prefix}.${$2$c}.canEnter`,
                  `${prefix}.${$2$c}.enter`,

                  ...activate(prefix, $2$c),
                  `${prefix}.${$2$c}.afterAttachChildren`,
                ];
              case 'all-sync':
                return [
                  ...routerHooks,
                  ...deactivate(prefix, $1$p),
                  `${prefix}.${$1$p}.afterUnbindChildren`,
                  `${prefix}.${$1$p}.dispose`,
                  ...activate(prefix, $2$p),
                  `${prefix}.${$2$p}.afterAttachChildren`,

                  `${prefix}.${$2$c}.canEnter`,
                  `${prefix}.${$2$c}.enter`,

                  ...activate(prefix, $2$c),
                  `${prefix}.${$2$c}.afterAttachChildren`,
                ];
            }
            break;
          case 'remove-first':
            return [
              ...routerHooks,

              ...deactivate(prefix, $1$p),
              `${prefix}.${$1$p}.afterUnbindChildren`,
              `${prefix}.${$1$p}.dispose`,
              ...activate(prefix, $2$p),
              `${prefix}.${$2$p}.afterAttachChildren`,

              `${prefix}.${$2$c}.canEnter`,
              `${prefix}.${$2$c}.enter`,

              ...activate(prefix, $2$c),
              `${prefix}.${$2$c}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,

              ...activate(prefix, $2$p),
              `${prefix}.${$2$p}.afterAttachChildren`,
              ...deactivate(prefix, $1$p),
              `${prefix}.${$1$p}.afterUnbindChildren`,
              `${prefix}.${$1$p}.dispose`,

              `${prefix}.${$2$c}.canEnter`,
              `${prefix}.${$2$c}.enter`,

              ...activate(prefix, $2$c),
              `${prefix}.${$2$c}.afterAttachChildren`,
            ];
        }
      }
    }
  },
  '$1$p/$1$c -> $2$p/$2$c'(
    prefix: string,
    $1$p: string,
    $1$c: string,
    $2$p: string,
    $2$c: string,
    opts: IRouterOptionsSpec,
    comp: IComponentSpec,
  ): string[] {
    if ($1$p === $2$p) {
      return getCalls['$1 -> $2'](prefix, $1$c, $2$c, opts, comp);
    }

    if ($1$c === '') {
      return getCalls['$1$p -> $2$p/$2$c'](prefix, $1$p, $2$p, $2$c, opts, comp);
    }

    if ($2$c === '') {
      return getCalls['$1$p/$1$c -> $2$p'](prefix, $1$p, $1$c, $2$p, opts, comp);
    }

    switch (opts.resolutionStrategy) {
      case 'static': {
        const routerHooks = [
          `${prefix}.${$1$c}.canLeave`,
          `${prefix}.${$1$p}.canLeave`,
          `${prefix}.${$2$p}.canEnter`,
          `${prefix}.${$2$c}.canEnter`,
          `${prefix}.${$1$c}.leave`,
          `${prefix}.${$1$p}.leave`,
          `${prefix}.${$2$p}.enter`,
          `${prefix}.${$2$c}.enter`,
        ];
        switch (opts.swapStrategy) {
          case 'parallel':
            switch (comp.kind) {
              case 'all-async':
                return [
                  ...routerHooks,
                  ...deactivate(prefix, $1$c),
                  `${prefix}.${$1$c}.afterUnbindChildren`,
                  `${prefix}.${$1$c}.dispose`,
                  ...interleave(
                    [
                      ...deactivate(prefix, $1$p),
                      `${prefix}.${$1$p}.afterUnbindChildren`,
                      `${prefix}.${$1$p}.dispose`
                    ],
                    [
                      ...activate(prefix, $2$p),
                      ...activate(prefix, $2$c),
                    ],
                  ),
                  `${prefix}.${$2$c}.afterAttachChildren`,
                  `${prefix}.${$2$p}.afterAttachChildren`,
                ];
              case 'all-sync':
                return [
                  ...routerHooks,
                  ...deactivate(prefix, $1$c),
                  `${prefix}.${$1$c}.afterUnbindChildren`,
                  `${prefix}.${$1$c}.dispose`,
                  ...deactivate(prefix, $1$p),
                  `${prefix}.${$1$p}.afterUnbindChildren`,
                  `${prefix}.${$1$p}.dispose`,
                  ...activate(prefix, $2$p),
                  ...activate(prefix, $2$c),
                  `${prefix}.${$2$c}.afterAttachChildren`,
                  `${prefix}.${$2$p}.afterAttachChildren`,
                ];
            }
            break;
          case 'remove-first':
            return [
              ...routerHooks,
              ...deactivate(prefix, $1$c),
              `${prefix}.${$1$c}.afterUnbindChildren`,
              `${prefix}.${$1$c}.dispose`,
              ...deactivate(prefix, $1$p),
              `${prefix}.${$1$p}.afterUnbindChildren`,
              `${prefix}.${$1$p}.dispose`,
              ...activate(prefix, $2$p),
              ...activate(prefix, $2$c),
              `${prefix}.${$2$c}.afterAttachChildren`,
              `${prefix}.${$2$p}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,
              ...deactivate(prefix, $1$c),
              `${prefix}.${$1$c}.afterUnbindChildren`,
              `${prefix}.${$1$c}.dispose`,
              ...activate(prefix, $2$p),
              ...activate(prefix, $2$c),
              `${prefix}.${$2$c}.afterAttachChildren`,
              `${prefix}.${$2$p}.afterAttachChildren`,
              ...deactivate(prefix, $1$p),
              `${prefix}.${$1$p}.afterUnbindChildren`,
              `${prefix}.${$1$p}.dispose`,
            ];
        }
        break;
      }
      case 'dynamic': {
        const routerHooks = [
          `${prefix}.${$1$c}.canLeave`,
          `${prefix}.${$1$p}.canLeave`,
          `${prefix}.${$2$p}.canEnter`,
          `${prefix}.${$1$c}.leave`,
          `${prefix}.${$1$p}.leave`,
          `${prefix}.${$2$p}.enter`,
        ];
        switch (opts.swapStrategy) {
          case 'parallel':
            switch (comp.kind) {
              case 'all-async':
                return [
                  ...routerHooks,

                  ...deactivate(prefix, $1$c),
                  `${prefix}.${$1$c}.afterUnbindChildren`,
                  `${prefix}.${$1$c}.dispose`,
                  ...interleave(
                    [
                      ...deactivate(prefix, $1$p),
                      `${prefix}.${$1$p}.afterUnbindChildren`,
                      `${prefix}.${$1$p}.dispose`,
                    ],
                    [
                      ...activate(prefix, $2$p),
                      `${prefix}.${$2$p}.afterAttachChildren`,
                    ],
                  ),

                  `${prefix}.${$2$c}.canEnter`,
                  `${prefix}.${$2$c}.enter`,

                  ...activate(prefix, $2$c),
                  `${prefix}.${$2$c}.afterAttachChildren`,
                ];
              case 'all-sync':
                return [
                  ...routerHooks,

                  ...deactivate(prefix, $1$c),
                  `${prefix}.${$1$c}.afterUnbindChildren`,
                  `${prefix}.${$1$c}.dispose`,
                  ...deactivate(prefix, $1$p),
                  `${prefix}.${$1$p}.afterUnbindChildren`,
                  `${prefix}.${$1$p}.dispose`,
                  ...activate(prefix, $2$p),
                  `${prefix}.${$2$p}.afterAttachChildren`,

                  `${prefix}.${$2$c}.canEnter`,
                  `${prefix}.${$2$c}.enter`,

                  ...activate(prefix, $2$c),
                  `${prefix}.${$2$c}.afterAttachChildren`,
                ];
            }
            break;
          case 'remove-first':
            return [
              ...routerHooks,

              ...deactivate(prefix, $1$c),
              `${prefix}.${$1$c}.afterUnbindChildren`,
              `${prefix}.${$1$c}.dispose`,
              ...deactivate(prefix, $1$p),
              `${prefix}.${$1$p}.afterUnbindChildren`,
              `${prefix}.${$1$p}.dispose`,
              ...activate(prefix, $2$p),
              `${prefix}.${$2$p}.afterAttachChildren`,

              `${prefix}.${$2$c}.canEnter`,
              `${prefix}.${$2$c}.enter`,

              ...activate(prefix, $2$c),
              `${prefix}.${$2$c}.afterAttachChildren`,
            ];
          case 'add-first':
            return [
              ...routerHooks,

              ...deactivate(prefix, $1$c),
              `${prefix}.${$1$c}.afterUnbindChildren`,
              `${prefix}.${$1$c}.dispose`,
              ...activate(prefix, $2$p),
              `${prefix}.${$2$p}.afterAttachChildren`,
              ...deactivate(prefix, $1$p),
              `${prefix}.${$1$p}.afterUnbindChildren`,
              `${prefix}.${$1$p}.dispose`,

              `${prefix}.${$2$c}.canEnter`,
              `${prefix}.${$2$c}.enter`,

              ...activate(prefix, $2$c),
              `${prefix}.${$2$c}.afterAttachChildren`,
            ];
        }
      }
    }
  },
};
