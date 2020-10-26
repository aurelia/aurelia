export class $List extends Array {
    get isAbrupt() { return false; }
    get isList() { return true; }
    constructor(...items) {
        super(...items);
    }
    $copy() {
        return new $List(...this);
    }
    $contains(item) {
        return this.some(x => x.is(item));
    }
    GetValue(ctx) {
        return this;
    }
    enrichWith(ctx, node) {
        return this;
    }
    is(other) {
        return this === other;
    }
}
//# sourceMappingURL=list.js.map