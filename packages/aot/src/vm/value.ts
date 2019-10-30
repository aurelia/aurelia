// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface empty { '<empty>': unknown }
export const empty = Symbol('empty') as unknown as empty;
