export const Reporter = {
  write(code: number, ...params: any[]): void { },
  error(code: number, ...params: any[]): Error { return new Error(`Code ${code}`); }
};
