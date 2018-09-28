import { DI } from '@aurelia/kernel';

// https://html.spec.whatwg.org/multipage/history.html#the-location-interface
export interface ILocation {
  assign(url: string): void;
  replace(url: string): void;
  reload(): void;
}

export const ILocation = DI.createInterface<ILocation>().withDefault(x => x.singleton(HtmlLocation));

/*@internal*/
export class HtmlLocation implements ILocation {
  public assign(url: string): void {
    location.assign(url);
  }
  public replace(url: string): void {
    location.replace(url);
  }
  public reload(): void {
    location.reload();
  }
}
