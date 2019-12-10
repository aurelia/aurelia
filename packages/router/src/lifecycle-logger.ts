export function lifecycleLogger(name: string) {
  const lifecycles = [
    'canLeave', 'leave',
    'canEnter', 'enter',
    'created',
    'binding', 'bound',
    'attaching', 'attached',
    'detaching', 'detached',
    'unbinding', 'unbound',
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
  public canEnter() { console.log(`name canEnter`); return true; }
  public enter(params: any) { console.log(`name enter`); }
  public created() { console.log(`name created`); }
  public binding() { console.log(`name binding`); }
  public bound() { console.log(`name bound`); }
  public attaching() { console.log(`name attaching`); }
  public attached() { console.log(`name attached`); }
  public canLeave() { console.log(`name canLeave`); return true; }
  public leave() { console.log(`name leave`); }
  public detaching() { console.log(`name detaching`); }
  public detached() { console.log(`name detached`); }
  public unbinding() { console.log(`name unbinding`); }
  public unbound() { console.log(`name unbound`); }
}
