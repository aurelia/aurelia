function initializeTC39Metadata() {
    Symbol.metadata ??= Symbol.for("Symbol.metadata");
}

const e = {
    get(e, t) {
        return t[Symbol.metadata]?.[e];
    },
    define(e, t, ...l) {
        let r = Object.getOwnPropertyDescriptor(t, Symbol.metadata)?.value;
        if (r == null) {
            Object.defineProperty(t, Symbol.metadata, {
                value: r = Object.create(null),
                enumerable: true,
                configurable: true,
                writable: true
            });
        }
        const n = l.length;
        switch (n) {
          case 0:
            throw new Error("At least one key must be provided");

          case 1:
            r[l[0]] = e;
            return;

          case 2:
            r[l[0]] = r[l[1]] = e;
            return;

          default:
            {
                for (let t = 0; t < n; ++t) {
                    r[l[t]] = e;
                }
                return;
            }
        }
    },
    has(e, t) {
        const l = t[Symbol.metadata];
        return l == null ? false : e in l;
    },
    delete(e, t) {
        const l = t[Symbol.metadata];
        if (l == null) return;
        Reflect.deleteProperty(l, e);
        return;
    }
};

export { e as Metadata, initializeTC39Metadata };
//# sourceMappingURL=index.mjs.map
