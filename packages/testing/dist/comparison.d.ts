import { Primitive } from '@aurelia/kernel';
import { FloatArray, TypedArray } from './util';
export declare const enum IterationType {
    noIterator = 0,
    isArray = 1,
    isSet = 2,
    isMap = 3
}
export declare type Memos = {
    val1: Map<any, any>;
    val2: Map<any, any>;
    position: number;
};
export declare function areSimilarRegExps(a: RegExp, b: RegExp): boolean;
export declare function areSimilarFloatArrays(a: FloatArray, b: FloatArray): boolean;
export declare function compare(a: ArrayLike<any>, b: ArrayLike<any>): number;
export declare function areSimilarTypedArrays(a: TypedArray | ArrayBufferView, b: TypedArray | ArrayBufferView): boolean;
export declare function areEqualArrayBuffers(buf1: ArrayBuffer, buf2: ArrayBuffer): boolean;
export declare function isEqualBoxedPrimitive(val1: unknown, val2: unknown): boolean;
export declare function innerDeepEqual(val1: unknown, val2: unknown, strict: boolean, memos?: Memos): boolean;
export declare function keyCheck(val1: {}, val2: {}, strict: boolean, memos: Memos | undefined, iterationType: IterationType, aKeys?: PropertyKey[]): boolean;
export declare function setHasEqualElement(set: Set<any>, val1: any, strict: boolean, memos?: Memos): boolean;
export declare function findLooseMatchingPrimitives(val: Primitive): Primitive;
export declare function setMightHaveLoosePrimitive(a: Set<any>, b: Set<any>, val: Primitive): Primitive;
export declare function mapMightHaveLoosePrimitive(a: Map<any, any>, b: Map<any, any>, val: Primitive, item: any, memos?: Memos): Primitive;
export declare function setEquiv(a: Set<any>, b: Set<any>, strict: boolean, memos?: Memos): boolean;
export declare function mapHasEqualEntry(set: Set<any>, map: Map<any, any>, key1: PropertyKey, item1: any, strict: boolean, memos?: Memos): boolean;
export declare function mapEquiv(a: Map<any, any>, b: Map<any, any>, strict: boolean, memos?: Memos): boolean;
export declare function objEquiv(a: Object, b: Object, strict: boolean, keys: PropertyKey[], memos: Memos | undefined, iterationType: IterationType): boolean;
export declare function isDeepEqual(val1: unknown, val2: unknown): boolean;
export declare function isDeepStrictEqual(val1: unknown, val2: unknown): boolean;
//# sourceMappingURL=comparison.d.ts.map