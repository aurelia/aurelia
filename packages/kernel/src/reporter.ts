export const Reporter = {
  write(code: number, ...params: unknown[]): void { return; },
  error(code: number, ...params: unknown[]): Error { return new Error(`Code ${code}`); }
};
