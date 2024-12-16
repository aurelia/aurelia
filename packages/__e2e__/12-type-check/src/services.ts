import { inject } from 'aurelia';

export class ServiceA {
  public doSimple() { return 'a'; }
}

@inject(ServiceA)
export class ServiceB {
  public constructor(private readonly a: ServiceA) { }
  public doComplex() { return `${this.a.doSimple()} - b`; }
}
