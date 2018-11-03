export const Reporter = {
  /* tslint:disable-next-line:no-empty */
  write(code: number, ...params: unknown[]): void { },
  error(code: number, ...params: unknown[]): Error { return new Error(`Code ${code}`); }
};
