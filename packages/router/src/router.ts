import { DI, IIndexable, inject } from '@aurelia/kernel';
import { IHistory } from './history';
import { ILocation } from './location';

export interface IRouter extends IHistory, ILocation {

}

export const IRouter = DI.createInterface<IRouter>().withDefault(x => x.singleton(Router));

@inject(IHistory, ILocation)
export class Router implements IRouter {
  constructor(
    private history: IHistory,
    private location: ILocation
  ) {}

  public back(): void {
    this.history.back();
  }
  public forward(): void {
    this.history.forward();
  }
  public go(delta?: number): void {
    this.history.go(delta);
  }
  public pushState(data: IIndexable, title?: string, url?: string | null): void {
    this.history.pushState(data, title, url);
  }
  public replaceState(data: IIndexable, title?: string, url?: string | null): void {
    this.history.replaceState(data, title, url);
  }
  public assign(url: string): void {
    this.location.assign(url);
  }
  public replace(url: string): void {
    this.location.replace(url);
  }
  public reload(): void {
    this.location.reload();
  }
}
