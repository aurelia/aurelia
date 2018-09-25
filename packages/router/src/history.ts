import { DI, IIndexable } from '@aurelia/kernel';

// https://html.spec.whatwg.org/multipage/history.html#the-history-interface
export interface IHistory {
  back(): void;
  forward(): void;
  go(delta?: number): void;
  pushState(data: IIndexable, title?: string, url?: string | null): void;
  replaceState(data: IIndexable, title?: string, url?: string | null): void;
}

export const IHistory = DI.createInterface<IHistory>().withDefault(x => x.singleton(HtmlHistory));

/*@internal*/
export class HtmlHistory implements IHistory {
  public back(): void {
    history.back();
  }
  public forward(): void {
    history.forward();
  }
  public go(delta?: number): void {
    history.go(delta);
  }
  public pushState(data: IIndexable, title?: string, url?: string | null): void {
    history.pushState(data, title, url);
  }
  public replaceState(data: IIndexable, title?: string, url?: string | null): void {
    history.replaceState(data, title, url);
  }
}
