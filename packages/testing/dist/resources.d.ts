import { IContainer } from '@aurelia/kernel';
export declare class SortValueConverter {
    toView(arr: unknown[], prop?: string, dir?: 'asc' | 'desc'): unknown[];
}
export declare class JsonValueConverter {
    toView(input: unknown): string;
    fromView(input: string): unknown;
}
export declare const TestConfiguration: {
    register(container: IContainer): void;
};
//# sourceMappingURL=resources.d.ts.map