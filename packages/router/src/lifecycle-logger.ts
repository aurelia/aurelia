/**
 * @internal - Will be removed
 */
export function lifecycleLogger(name: string) {
  const lifecycles = [
    'canUnload', 'unload',
    'canLoad', 'load',
    'created',
    'binding', 'bound',
    'beforeAttach', 'attaching',
    'detaching',
    'unbinding',
  ];

  return function (target: any) {
    for (const lifecycle of lifecycles) {
      const existing = target.prototype[lifecycle];
      if (existing !== void 0) {
        target.prototype[lifecycle] = function (...args: unknown[]) {
          console.log(`${name} ${lifecycle}`, args);
          return existing.apply(target, args);
        };
      } else {
        target.prototype[lifecycle] = function (...args: unknown[]) {
          console.log(`${name} ${lifecycle}`, args);
          if (lifecycle.startsWith('can')) {
            return true;
          }
        };
      }
    }
  };
}

export class LifecycleClass {
  public canLoad() { console.log(`name canLoad`); return true; }
  public load(params: any) { console.log(`name load`); }
  public created() { console.log(`name created`); }
  public binding() { console.log(`name binding`); }
  public bound() { console.log(`name bound`); }
  public beforeAttach() { console.log(`name beforeAttach`); }
  public attaching() { console.log(`name attaching`); }
  public canUnload() { console.log(`name canUnload`); return true; }
  public unload() { console.log(`name unload`); }
  public detaching() { console.log(`name detaching`); }
  public unbinding() { console.log(`name unbinding`); }
}
