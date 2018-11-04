// These types are duck-typed representations of parts of the RequireJs Load API [1] used by this plugin.
// They are handcrafted as '@types/requirejs' is incomplete and it conflicts with '@types/node'. See [2] for details.
// [1] https://requirejs.org/docs/plugins.html#apiload
// [2] https://github.com/aurelia/aurelia/pull/256

/*@internal*/
export type Require = {
  (name: string[], callback: (text: string) => void):
  void; toUrl(name: string): string;
};

/*@internal*/
export type RequireConfig = {
  isBuild?: boolean;
};

/*@internal*/
export type RequireOnLoad = {
  // tslint:disable-next-line:no-reserved-keywords
  (content: string|{}): void;
  error?(error: Error): void;
};
