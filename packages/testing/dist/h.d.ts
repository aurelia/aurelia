export declare type H = string | number | boolean | null | undefined | Node;
export declare function h<T extends string, TChildren extends H[]>(name: T, attrs?: Record<string, string | null | undefined | string[] | boolean | number> | null, ...children: TChildren): T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement;
/**
 * jsx with aurelia binding command friendly version of h
 */
export declare const hJsx: (name: string, attrs: Record<string, string> | null, ...children: (string | Node | (string | Node)[])[]) => HTMLElement;
//# sourceMappingURL=h.d.ts.map