import { IPlatform } from "@aurelia/runtime-html";
import { IContainer, Registration } from "@aurelia/kernel";
import { IScrollerInfo, IScrollerObsererLocator, IScrollerObserver, IScrollerSubscriber } from "./interfaces";

export class ScrollerObserverLocator implements IScrollerObsererLocator {
  public static get inject() {
    return [IPlatform];
  }

  public static register(container: IContainer) {
    return Registration.singleton(IScrollerObsererLocator, this).register(container);
  }

  /** @internal */ private readonly cache: WeakMap<HTMLElement, ScrollerObserver> = new WeakMap();
  /** @internal */ private readonly p: IPlatform;

  public constructor(p: IPlatform) {
    this.p = p;
  }

  public getObserver(scroller: HTMLElement): IScrollerObserver {
    const cache = this.cache;
    let observer = cache.get(scroller);
    if (!cache.has(scroller)) {
      cache.set(scroller, observer = new ScrollerObserver(this.p, scroller));
    }
    return observer!;
  }
}

export class ScrollerObserver implements IScrollerObserver {

  /** @internal */ private readonly subs: Set<IScrollerSubscriber> = new Set();
  /** @internal */ private geo: ElementGeometry | null = null;
  /** @internal */ private sizeObs?: ResizeObserver;

  public constructor(
    public readonly p: IPlatform,
    public readonly scroller: HTMLElement,
  ) { }

  private start(): void {
    this.scroller.addEventListener('scroll', this);
    const ResizeObserverCtor = getResizeObserverClass(this.p);
    if (typeof ResizeObserverCtor === 'function') {
      (this.sizeObs = new ResizeObserverCtor((entries) => {
        const oldGeo = this.geo;
        const newGeo = new ElementGeometry(entries[0].contentRect);
        if (!newGeo.equals(oldGeo)) {
          this.geo = newGeo;
          this.notify();
        }
      }))
        .observe(this.scroller);
    }
  }

  private stop(): void {
    this.scroller.removeEventListener('scroll', this);
    this.sizeObs?.disconnect();
    this.sizeObs = void 0;
  }

  private notify(): void {
    this.subs.forEach(notifySubscriber, this.getValue());
  }

  public setValue(): void {
    throw new Error('scroller info is readonly');
  }

  public getValue(): IScrollerInfo {
    const scroller = this.scroller;
    const rect = scroller.getBoundingClientRect();
    return new ScrollerInfo(scroller, scroller.scrollTop, rect.width, rect.height);
  }

  /** @internal */
  public handleEvent(_e: Event): void {
    this.notify();
  }

  public subscribe(sub: IScrollerSubscriber): void {
    if (this.subs.size === 0) {
      this.start();
    }
    this.subs.add(sub);
  }

  public unsubscribe(sub: IScrollerSubscriber): void {
    const subs = this.subs;
    if (subs.has(sub) && subs.size === 1) {
      this.stop();
    }
    subs.delete(sub);
  }

}

function notifySubscriber(this: IScrollerInfo, sub: IScrollerSubscriber) {
  sub.handleScrollerChange(this);
}

class ElementGeometry {
  public readonly t: number;
  public readonly l: number;
  public readonly w: number;
  public readonly h: number;

  public constructor(
    domRect: DOMRectReadOnly,
  ) {
    this.t = domRect.top;
    this.l = domRect.left;
    this.w = domRect.width;
    this.h = domRect.height;
  }

  public equals(geo: ElementGeometry | null): boolean {
    if (geo == null) {
      return false;
    }
    return this.t === geo.t
      && this.l === geo.l
      && this.w === geo.w
      && this.h === geo.h;
  }
}

class ScrollerInfo implements IScrollerInfo {
  public constructor(
    public readonly scroller: HTMLElement,
    public readonly scrollTop: number,
    public readonly width: number,
    public readonly height: number,
  ) { }
}

const getResizeObserverClass = (p: IPlatform): typeof ResizeObserver => p.window.ResizeObserver;
