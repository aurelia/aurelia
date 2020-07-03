function addIf(
  condition: boolean,
  itemsIfTrue: string[] = [],
  itemsIfFalse: string[] = [],
): string[] {
  return condition ? itemsIfTrue : itemsIfFalse;
}

export const getCalls = {
  [`$x -> ''`](
    prefix: string,
    $x: string,
    isStopPhase: boolean,
  ): string[] {
    return [
      ...addIf(
        !isStopPhase,
        [
          `${prefix}.${$x}.canLeave`,
          `${prefix}.${$x}.leave`,
        ],
      ),
      `${prefix}.${$x}.beforeDetach`,
      `${prefix}.${$x}.beforeUnbind`,
      `${prefix}.${$x}.afterUnbind`,
      `${prefix}.${$x}.afterUnbindChildren`,
      ...addIf(
        !isStopPhase,
        [
          `${prefix}.${$x}.dispose`,
        ],
      ),
    ];
  },
  [`'' -> $x`](
    prefix: string,
    $x: string,
  ): string[] {
    return [
      `${prefix}.${$x}.canEnter`,
      `${prefix}.${$x}.enter`,

      `${prefix}.${$x}.beforeBind`,
      `${prefix}.${$x}.afterBind`,
      `${prefix}.${$x}.afterAttach`,
      `${prefix}.${$x}.afterAttachChildren`,
    ];
  },
  [`$1 -> $2`](
    prefix: string,
    $1: string,
    $2: string,
  ): string[] {
    if ($1 === '') {
      return getCalls[`'' -> $x`](prefix, $2);
    }

    if ($2 === '') {
      return getCalls[`$x -> ''`](prefix, $1, false);
    }

    return [
      `${prefix}.${$1}.canLeave`,
      `${prefix}.${$2}.canEnter`,
      `${prefix}.${$1}.leave`,
      `${prefix}.${$2}.enter`,

      `${prefix}.${$2}.beforeBind`,
      `${prefix}.${$2}.afterBind`,
      `${prefix}.${$2}.afterAttach`,
      `${prefix}.${$2}.afterAttachChildren`,
      `${prefix}.${$1}.beforeDetach`,
      `${prefix}.${$1}.beforeUnbind`,
      `${prefix}.${$1}.afterUnbind`,
      `${prefix}.${$1}.afterUnbindChildren`,
      `${prefix}.${$1}.dispose`,
    ];
  },
  [`'' -> $x$0+$x$1`](
    prefix: string,
    $x$0: string,
    $x$1: string,
    async: boolean,
  ): string[] {
    if ($x$0 === '') {
      return getCalls[`'' -> $x`](prefix, $x$1);
    }

    if ($x$1 === '') {
      return getCalls[`'' -> $x`](prefix, $x$0);
    }

    return [
      `${prefix}.${$x$0}.canEnter`,
      `${prefix}.${$x$1}.canEnter`,
      `${prefix}.${$x$0}.enter`,
      `${prefix}.${$x$1}.enter`,

      ...addIf(
        async,
        [
          `${prefix}.${$x$0}.beforeBind`,
          `${prefix}.${$x$1}.beforeBind`,
          `${prefix}.${$x$0}.afterBind`,
          `${prefix}.${$x$1}.afterBind`,
          `${prefix}.${$x$0}.afterAttach`,
          `${prefix}.${$x$1}.afterAttach`,
          `${prefix}.${$x$0}.afterAttachChildren`,
          `${prefix}.${$x$1}.afterAttachChildren`,
        ],
        [
          `${prefix}.${$x$0}.beforeBind`,
          `${prefix}.${$x$0}.afterBind`,
          `${prefix}.${$x$0}.afterAttach`,
          `${prefix}.${$x$0}.afterAttachChildren`,
          `${prefix}.${$x$1}.beforeBind`,
          `${prefix}.${$x$1}.afterBind`,
          `${prefix}.${$x$1}.afterAttach`,
          `${prefix}.${$x$1}.afterAttachChildren`,
        ],
      ),
    ];
  },
  [`$x$0+$x$1 -> ''`](
    prefix: string,
    $x$0: string,
    $x$1: string,
    isStopPhase: boolean,
    async: boolean,
  ): string[] {
    if ($x$0 === '') {
      return getCalls[`$x -> ''`](prefix, $x$1, isStopPhase);
    }

    if ($x$1 === '') {
      return getCalls[`$x -> ''`](prefix, $x$0, isStopPhase);
    }

    if (isStopPhase) {
      if (async) {
        return [
          `${prefix}.${$x$0}.beforeDetach`,
          `${prefix}.${$x$1}.beforeDetach`,
          `${prefix}.${$x$0}.beforeUnbind`,
          `${prefix}.${$x$1}.beforeUnbind`,
          `${prefix}.${$x$0}.afterUnbind`,
          `${prefix}.${$x$1}.afterUnbind`,
          `${prefix}.${$x$0}.afterUnbindChildren`,
          `${prefix}.${$x$1}.afterUnbindChildren`,
        ];
      }

      // In 'stop' phase, reason the last two hooks are ordered the way they are is
      // because the controllers are linked to the parent controller in `deactivate` and so those hooks only
      // happen after everything else happened.
      // This linking does not occur in the same way when controllers are deactivated in isolation by the router.
      return [
        `${prefix}.${$x$0}.beforeDetach`,
        `${prefix}.${$x$0}.beforeUnbind`,
        `${prefix}.${$x$0}.afterUnbind`,
        `${prefix}.${$x$1}.beforeDetach`,
        `${prefix}.${$x$1}.beforeUnbind`,
        `${prefix}.${$x$1}.afterUnbind`,
        `${prefix}.${$x$0}.afterUnbindChildren`,
        `${prefix}.${$x$1}.afterUnbindChildren`,
      ];
    }

    return [
      `${prefix}.${$x$0}.canLeave`,
      `${prefix}.${$x$1}.canLeave`,
      `${prefix}.${$x$0}.leave`,
      `${prefix}.${$x$1}.leave`,

      ...addIf(
        async,
        [
          `${prefix}.${$x$0}.beforeDetach`,
          `${prefix}.${$x$1}.beforeDetach`,
          `${prefix}.${$x$0}.beforeUnbind`,
          `${prefix}.${$x$1}.beforeUnbind`,
          `${prefix}.${$x$0}.afterUnbind`,
          `${prefix}.${$x$1}.afterUnbind`,
          `${prefix}.${$x$0}.afterUnbindChildren`,
          `${prefix}.${$x$1}.afterUnbindChildren`,
          `${prefix}.${$x$1}.dispose`,
          `${prefix}.${$x$0}.dispose`,
        ],
        [
          `${prefix}.${$x$0}.beforeDetach`,
          `${prefix}.${$x$0}.beforeUnbind`,
          `${prefix}.${$x$0}.afterUnbind`,
          `${prefix}.${$x$0}.afterUnbindChildren`,
          `${prefix}.${$x$0}.dispose`,
          `${prefix}.${$x$1}.beforeDetach`,
          `${prefix}.${$x$1}.beforeUnbind`,
          `${prefix}.${$x$1}.afterUnbind`,
          `${prefix}.${$x$1}.afterUnbindChildren`,
          `${prefix}.${$x$1}.dispose`,
        ],
      ),
    ];
  },
  [`$1$0+$1$1 -> $2$0+$2$1`](
    prefix: string,
    $1$0: string,
    $1$1: string,
    $2$0: string,
    $2$1: string,
    async: boolean,
  ): string[] {
    if ($1$0 === $2$0) {
      return getCalls[`$1 -> $2`](prefix, $1$1, $2$1);
    }

    if ($1$1 === $2$1) {
      return getCalls[`$1 -> $2`](prefix, $1$0, $2$0);
    }

    if ($1$0 === '') {
      if ($1$1 === '') {
        return getCalls[`'' -> $x$0+$x$1`](prefix, $2$0, $2$1, async);
      }
      if ($2$1 === '') {
        return getCalls[`'' -> $x$0+$x$1`](prefix, $2$0, $1$1, async);
      }

      return [
        `${prefix}.${$1$1}.canLeave`,
        `${prefix}.${$2$0}.canEnter`,
        `${prefix}.${$2$1}.canEnter`,
        `${prefix}.${$1$1}.leave`,
        `${prefix}.${$2$0}.enter`,
        `${prefix}.${$2$1}.enter`,

        ...addIf(
          async,
          [
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$2$1}.afterAttachChildren`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
            `${prefix}.${$1$1}.dispose`,
          ],
          [
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$1}.afterAttachChildren`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
            `${prefix}.${$1$1}.dispose`,
          ],
        ),
      ];
    }

    if ($1$1 === '') {
      return [
        `${prefix}.${$1$0}.canLeave`,
        `${prefix}.${$2$0}.canEnter`,
        `${prefix}.${$2$1}.canEnter`,
        `${prefix}.${$1$0}.leave`,
        `${prefix}.${$2$0}.enter`,
        `${prefix}.${$2$1}.enter`,

        ...addIf(
          async,
          [
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$2$1}.afterAttachChildren`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$0}.dispose`,
          ],
          [
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$0}.dispose`,
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$1}.afterAttachChildren`,
          ],
        ),
      ];
    }

    if ($2$0 === '') {
      if ($1$1 === '') {
        return getCalls[`$x$0+$x$1 -> ''`](prefix, $1$0, $2$1, false, async);
      }
      if ($2$1 === '') {
        return getCalls[`$x$0+$x$1 -> ''`](prefix, $1$0, $1$1, false, async);
      }

      return [
        `${prefix}.${$1$0}.canLeave`,
        `${prefix}.${$1$1}.canLeave`,
        `${prefix}.${$2$1}.canEnter`,
        `${prefix}.${$1$0}.leave`,
        `${prefix}.${$1$1}.leave`,
        `${prefix}.${$2$1}.enter`,

        ...addIf(
          async,
          [
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$2$1}.afterAttachChildren`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$0}.dispose`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
            `${prefix}.${$1$1}.dispose`,
          ],
          [
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$1}.afterAttachChildren`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
            `${prefix}.${$1$1}.dispose`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$0}.dispose`,
          ],
        ),
      ];
    }

    if ($2$1 === '') {
      return [
        `${prefix}.${$1$0}.canLeave`,
        `${prefix}.${$1$1}.canLeave`,
        `${prefix}.${$2$0}.canEnter`,
        `${prefix}.${$1$0}.leave`,
        `${prefix}.${$1$1}.leave`,
        `${prefix}.${$2$0}.enter`,

        ...addIf(
          async,
          [
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
            `${prefix}.${$1$1}.dispose`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$0}.dispose`,
          ],
          [
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$0}.dispose`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
            `${prefix}.${$1$1}.dispose`,
          ],
        ),
      ];
    }

    return [
      `${prefix}.${$1$0}.canLeave`,
      `${prefix}.${$1$1}.canLeave`,
      `${prefix}.${$2$0}.canEnter`,
      `${prefix}.${$2$1}.canEnter`,
      `${prefix}.${$1$0}.leave`,
      `${prefix}.${$1$1}.leave`,
      `${prefix}.${$2$0}.enter`,
      `${prefix}.${$2$1}.enter`,

      ...addIf(
        async,
        [
          `${prefix}.${$2$0}.beforeBind`,
          `${prefix}.${$2$1}.beforeBind`,
          `${prefix}.${$2$0}.afterBind`,
          `${prefix}.${$2$1}.afterBind`,
          `${prefix}.${$2$0}.afterAttach`,
          `${prefix}.${$2$1}.afterAttach`,
          `${prefix}.${$2$0}.afterAttachChildren`,
          `${prefix}.${$2$1}.afterAttachChildren`,
          `${prefix}.${$1$0}.beforeDetach`,
          `${prefix}.${$1$1}.beforeDetach`,
          `${prefix}.${$1$0}.beforeUnbind`,
          `${prefix}.${$1$1}.beforeUnbind`,
          `${prefix}.${$1$0}.afterUnbind`,
          `${prefix}.${$1$1}.afterUnbind`,
          `${prefix}.${$1$0}.afterUnbindChildren`,
          `${prefix}.${$1$1}.afterUnbindChildren`,
          `${prefix}.${$1$0}.dispose`,
          `${prefix}.${$1$1}.dispose`,
        ],
        [
          `${prefix}.${$2$0}.beforeBind`,
          `${prefix}.${$2$0}.afterBind`,
          `${prefix}.${$2$0}.afterAttach`,
          `${prefix}.${$2$0}.afterAttachChildren`,
          `${prefix}.${$1$0}.beforeDetach`,
          `${prefix}.${$1$0}.beforeUnbind`,
          `${prefix}.${$1$0}.afterUnbind`,
          `${prefix}.${$1$0}.afterUnbindChildren`,
          `${prefix}.${$1$0}.dispose`,
          `${prefix}.${$2$1}.beforeBind`,
          `${prefix}.${$2$1}.afterBind`,
          `${prefix}.${$2$1}.afterAttach`,
          `${prefix}.${$2$1}.afterAttachChildren`,
          `${prefix}.${$1$1}.beforeDetach`,
          `${prefix}.${$1$1}.beforeUnbind`,
          `${prefix}.${$1$1}.afterUnbind`,
          `${prefix}.${$1$1}.afterUnbindChildren`,
          `${prefix}.${$1$1}.dispose`,
        ],
      ),
    ];
  },
  [`'' -> $x$p/$x$c`](
    prefix: string,
    $x$p: string,
    $x$c: string,
    strategy: 'static' | 'dynamic',
  ): string[] {
    if ($x$c === '') {
      return getCalls[`'' -> $x`](prefix, $x$p);
    }

    switch (strategy) {
      case 'static':
        return [
          `${prefix}.${$x$p}.canEnter`,
          `${prefix}.${$x$c}.canEnter`,
          `${prefix}.${$x$p}.enter`,
          `${prefix}.${$x$c}.enter`,

          `${prefix}.${$x$p}.beforeBind`,
          `${prefix}.${$x$p}.afterBind`,
          `${prefix}.${$x$p}.afterAttach`,
          `${prefix}.${$x$c}.beforeBind`,
          `${prefix}.${$x$c}.afterBind`,
          `${prefix}.${$x$c}.afterAttach`,
          `${prefix}.${$x$c}.afterAttachChildren`,
          `${prefix}.${$x$p}.afterAttachChildren`,
        ];
      case 'dynamic':
        return [
          `${prefix}.${$x$p}.canEnter`,
          `${prefix}.${$x$p}.enter`,

          `${prefix}.${$x$p}.beforeBind`,
          `${prefix}.${$x$p}.afterBind`,
          `${prefix}.${$x$p}.afterAttach`,
          `${prefix}.${$x$p}.afterAttachChildren`,

          `${prefix}.${$x$c}.canEnter`,
          `${prefix}.${$x$c}.enter`,

          `${prefix}.${$x$c}.beforeBind`,
          `${prefix}.${$x$c}.afterBind`,
          `${prefix}.${$x$c}.afterAttach`,
          `${prefix}.${$x$c}.afterAttachChildren`,
        ];
    }
  },
  [`$x$p/$x$c -> ''`](
    prefix: string,
    $x$p: string,
    $x$c: string,
    isStopPhase: boolean,
  ): string[] {
    if ($x$c === '') {
      return getCalls[`$x -> ''`](prefix, $x$p, isStopPhase);
    }

    return [
      ...addIf(
        !isStopPhase,
        [
          `${prefix}.${$x$p}.canLeave`,
          `${prefix}.${$x$c}.canLeave`,
          `${prefix}.${$x$p}.leave`,
          `${prefix}.${$x$c}.leave`,
        ],
      ),
      `${prefix}.${$x$p}.beforeDetach`,
      `${prefix}.${$x$p}.beforeUnbind`,
      `${prefix}.${$x$p}.afterUnbind`,
      `${prefix}.${$x$c}.beforeDetach`,
      `${prefix}.${$x$c}.beforeUnbind`,
      `${prefix}.${$x$c}.afterUnbind`,
      `${prefix}.${$x$c}.afterUnbindChildren`,
      `${prefix}.${$x$p}.afterUnbindChildren`,
      ...addIf(
        !isStopPhase,
        [
          `${prefix}.${$x$p}.dispose`,
          `${prefix}.${$x$c}.dispose`,
        ],
      ),
    ];
  },
  [`$1$p/$1$c -> $2$p/$2$c`](
    prefix: string,
    $1$p: string,
    $1$c: string,
    $2$p: string,
    $2$c: string,
    strategy: 'static' | 'dynamic',
  ): string[] {
    if ($1$p === $2$p) {
      return getCalls[`$1 -> $2`](prefix, $1$c, $2$c);
    }

    if ($1$c === '') {
      if ($2$c === '') {
        return getCalls[`$1 -> $2`](prefix, $1$p, $2$p);
      }

      if ($1$p === '') {
        return getCalls[`'' -> $x$p/$x$c`](prefix, $2$p, $2$c, strategy);
      }

      switch (strategy) {
        case 'static':
          return [
            `${prefix}.${$1$p}.canLeave`,
            `${prefix}.${$2$p}.canEnter`,
            `${prefix}.${$2$c}.canEnter`,
            `${prefix}.${$1$p}.leave`,
            `${prefix}.${$2$p}.enter`,
            `${prefix}.${$2$c}.enter`,

            `${prefix}.${$2$p}.beforeBind`,
            `${prefix}.${$2$p}.afterBind`,
            `${prefix}.${$2$p}.afterAttach`,
            `${prefix}.${$2$c}.beforeBind`,
            `${prefix}.${$2$c}.afterBind`,
            `${prefix}.${$2$c}.afterAttach`,
            `${prefix}.${$2$c}.afterAttachChildren`,
            `${prefix}.${$2$p}.afterAttachChildren`,
            `${prefix}.${$1$p}.beforeDetach`,
            `${prefix}.${$1$p}.beforeUnbind`,
            `${prefix}.${$1$p}.afterUnbind`,
            `${prefix}.${$1$p}.afterUnbindChildren`,
            `${prefix}.${$1$p}.dispose`,
          ];
        case 'dynamic':
          return [
            `${prefix}.${$1$p}.canLeave`,
            `${prefix}.${$2$p}.canEnter`,
            `${prefix}.${$1$p}.leave`,
            `${prefix}.${$2$p}.enter`,

            `${prefix}.${$2$p}.beforeBind`,
            `${prefix}.${$2$p}.afterBind`,
            `${prefix}.${$2$p}.afterAttach`,
            `${prefix}.${$2$p}.afterAttachChildren`,
            `${prefix}.${$1$p}.beforeDetach`,
            `${prefix}.${$1$p}.beforeUnbind`,
            `${prefix}.${$1$p}.afterUnbind`,
            `${prefix}.${$1$p}.afterUnbindChildren`,
            `${prefix}.${$1$p}.dispose`,

            `${prefix}.${$2$c}.canEnter`,
            `${prefix}.${$2$c}.enter`,

            `${prefix}.${$2$c}.beforeBind`,
            `${prefix}.${$2$c}.afterBind`,
            `${prefix}.${$2$c}.afterAttach`,
            `${prefix}.${$2$c}.afterAttachChildren`,
          ];
      }
    }

    if ($2$c === '') {
      if ($2$p === '') {
        return getCalls[`$x$p/$x$c -> ''`](prefix, $1$p, $1$c, false);
      }

      return [
        `${prefix}.${$1$p}.canLeave`,
        `${prefix}.${$1$c}.canLeave`,
        `${prefix}.${$2$p}.canEnter`,
        `${prefix}.${$1$p}.leave`,
        `${prefix}.${$1$c}.leave`,
        `${prefix}.${$2$p}.enter`,

        `${prefix}.${$2$p}.beforeBind`,
        `${prefix}.${$2$p}.afterBind`,
        `${prefix}.${$2$p}.afterAttach`,
        `${prefix}.${$2$p}.afterAttachChildren`,
        `${prefix}.${$1$p}.beforeDetach`,
        `${prefix}.${$1$p}.beforeUnbind`,
        `${prefix}.${$1$p}.afterUnbind`,
        `${prefix}.${$1$c}.beforeDetach`,
        `${prefix}.${$1$c}.beforeUnbind`,
        `${prefix}.${$1$c}.afterUnbind`,
        `${prefix}.${$1$c}.afterUnbindChildren`,
        `${prefix}.${$1$p}.afterUnbindChildren`,
        `${prefix}.${$1$p}.dispose`,
        `${prefix}.${$1$c}.dispose`,
      ];
    }

    switch (strategy) {
      case 'static':
        return [
          `${prefix}.${$1$p}.canLeave`,
          `${prefix}.${$1$c}.canLeave`,
          `${prefix}.${$2$p}.canEnter`,
          `${prefix}.${$2$c}.canEnter`,
          `${prefix}.${$1$p}.leave`,
          `${prefix}.${$1$c}.leave`,
          `${prefix}.${$2$p}.enter`,
          `${prefix}.${$2$c}.enter`,

          `${prefix}.${$2$p}.beforeBind`,
          `${prefix}.${$2$p}.afterBind`,
          `${prefix}.${$2$p}.afterAttach`,
          `${prefix}.${$2$c}.beforeBind`,
          `${prefix}.${$2$c}.afterBind`,
          `${prefix}.${$2$c}.afterAttach`,
          `${prefix}.${$2$c}.afterAttachChildren`,
          `${prefix}.${$2$p}.afterAttachChildren`,
          `${prefix}.${$1$p}.beforeDetach`,
          `${prefix}.${$1$p}.beforeUnbind`,
          `${prefix}.${$1$p}.afterUnbind`,
          `${prefix}.${$1$c}.beforeDetach`,
          `${prefix}.${$1$c}.beforeUnbind`,
          `${prefix}.${$1$c}.afterUnbind`,
          `${prefix}.${$1$c}.afterUnbindChildren`,
          `${prefix}.${$1$p}.afterUnbindChildren`,
          `${prefix}.${$1$p}.dispose`,
          `${prefix}.${$1$c}.dispose`,
        ];
      case 'dynamic':
        return [
          `${prefix}.${$1$p}.canLeave`,
          `${prefix}.${$1$c}.canLeave`,
          `${prefix}.${$2$p}.canEnter`,
          `${prefix}.${$1$p}.leave`,
          `${prefix}.${$1$c}.leave`,
          `${prefix}.${$2$p}.enter`,

          `${prefix}.${$2$p}.beforeBind`,
          `${prefix}.${$2$p}.afterBind`,
          `${prefix}.${$2$p}.afterAttach`,
          `${prefix}.${$2$p}.afterAttachChildren`,
          `${prefix}.${$1$p}.beforeDetach`,
          `${prefix}.${$1$p}.beforeUnbind`,
          `${prefix}.${$1$p}.afterUnbind`,
          `${prefix}.${$1$c}.beforeDetach`,
          `${prefix}.${$1$c}.beforeUnbind`,
          `${prefix}.${$1$c}.afterUnbind`,
          `${prefix}.${$1$c}.afterUnbindChildren`,
          `${prefix}.${$1$p}.afterUnbindChildren`,
          `${prefix}.${$1$p}.dispose`,
          `${prefix}.${$1$c}.dispose`,

          `${prefix}.${$2$c}.canEnter`,
          `${prefix}.${$2$c}.enter`,

          `${prefix}.${$2$c}.beforeBind`,
          `${prefix}.${$2$c}.afterBind`,
          `${prefix}.${$2$c}.afterAttach`,
          `${prefix}.${$2$c}.afterAttachChildren`,
        ];
    }
  },
};
