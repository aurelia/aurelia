export type Writable<T> = {
  -readonly [key in keyof T]: T[key];
};
