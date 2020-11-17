/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
export const emptyArray: any[] = Object.freeze<any>([]) as any;
export const customPropertyPrefix: string = '--';
export const emptyObject: any = Object.freeze({}) as any;
/* eslint-enable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void { }
