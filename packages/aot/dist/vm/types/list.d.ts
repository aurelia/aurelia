import { ExecutionContext } from '../realm.js';
import { I$Node } from '../ast/_shared.js';
export declare type $ListItem = {
    is(other: unknown): boolean;
};
export declare class $List<T extends $ListItem> extends Array<T> {
    get isAbrupt(): false;
    get isList(): true;
    constructor(...items: T[]);
    $copy<N extends $ListItem = T>(): $List<N>;
    $contains(item: T): boolean;
    GetValue(ctx: ExecutionContext): $List<T>;
    enrichWith(ctx: ExecutionContext, node: I$Node): this;
    is(other: unknown): boolean;
}
//# sourceMappingURL=list.d.ts.map